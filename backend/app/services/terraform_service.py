import asyncio
import subprocess
import shutil
import logging
from typing import AsyncGenerator, List, Optional
from pathlib import Path
import json

# Configure logger for this service
logger = logging.getLogger(__name__)

class TerraformService:
    """
    Service to handle Terraform CLI operations asynchronously.
    Each instance acts as an isolated execution environment for a specific deployment.
    """

    def __init__(self, working_dir: str):
        """
        Initialize the Terraform service.
        
        Args:
            working_dir: The absolute path where .tf files will be stored and executed.
                         (e.g., /tmp/deployments/project-123)
        """
        self.working_dir = Path(working_dir)
        self._ensure_dir()
        self._verify_terraform_installed()

    def _ensure_dir(self):
        """Creates the working directory if it doesn't exist."""
        if not self.working_dir.exists():
            self.working_dir.mkdir(parents=True, exist_ok=True)
            logger.info(f"Created working directory: {self.working_dir}")

    def _verify_terraform_installed(self):
        """Checks if Terraform binary is available in the system PATH."""
        if not shutil.which("terraform"):
            error_msg = "Terraform binary not found. Please install Terraform on the server."
            logger.critical(error_msg)
            raise RuntimeError(error_msg)

    async def _run_command(self, command_args: List[str]) -> AsyncGenerator[str, None]:
        """
        Internal method to execute a subprocess command asynchronously and stream output.
        
        Args:
            command_args: List of command parts (e.g., ["terraform", "init"])
            
        Yields:
            str: Line-by-line output from stdout/stderr.
        """
        cmd_str = " ".join(command_args)
        yield f"Executing: {cmd_str}...\n"

        try:
            # create_subprocess_exec allows us to run non-blocking shell commands
            process = await asyncio.create_subprocess_exec(
                *command_args,
                cwd=str(self.working_dir),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT, # Merge errors into standard output stream
                limit=1024 * 128 # Increase buffer size for large logs
            )

            # Read stream line by line as it is generated
            while True:
                line = await process.stdout.readline()
                if not line:
                    break
                
                # Decode bytes to string and yield
                decoded_line = line.decode('utf-8').rstrip()
                if decoded_line:
                    yield f"{decoded_line}\n"

            # Wait for the process to actually exit
            exit_code = await process.wait()

            if exit_code != 0:
                error_msg = f"Command failed with exit code {exit_code}"
                yield f"\n{error_msg}\n"
                logger.error(f"{error_msg} in {self.working_dir}")
                # We do NOT raise an exception here so the stream finishes gracefully.
                # The caller (router) should check the logs or status.
                raise subprocess.CalledProcessError(exit_code, cmd_str)
            else:
                yield f"Command completed successfully.\n"

        except Exception as e:
            yield f"\n[SYSTEM ERROR] {str(e)}\n"
            logger.exception("Unexpected error during Terraform execution")
            raise

    # =========================================================================
    # PUBLIC METHODS
    # =========================================================================

    def write_main_tf(self, hcl_content: str) -> str:
        """
        Writes the generated HCL code to main.tf in the working directory.
        
        Returns:
            str: Path to the created file.
        """
        file_path = self.working_dir / "main.tf"
        with open(file_path, "w") as f:
            f.write(hcl_content)
        
        logger.info(f"Written main.tf to {file_path}")
        return str(file_path)

    async def init(self) -> AsyncGenerator[str, None]:
        """
        Runs 'terraform init' to download providers and setup backend.
        """
        cmd = ["terraform", "init", "-no-color", "-input=false"]
        async for line in self._run_command(cmd):
            yield line

    async def validate(self) -> AsyncGenerator[str, None]:
        """
        Runs 'terraform validate' to check for syntax errors.
        """
        cmd = ["terraform", "validate", "-no-color"]
        async for line in self._run_command(cmd):
            yield line

    async def plan(self) -> AsyncGenerator[str, None]:
        """
        Runs 'terraform plan' to generate an execution plan file.
        Saves the plan to 'tfplan' file.
        """
        cmd = ["terraform", "plan", "-no-color", "-input=false", "-out=tfplan"]
        async for line in self._run_command(cmd):
            yield line

    async def apply(self) -> AsyncGenerator[str, None]:
        """
        Runs 'terraform apply' using the saved plan.
        WARNING: This auto-approves the changes.
        """
        # We rely on the 'tfplan' file created by the plan() step for safety
        cmd = ["terraform", "apply", "-no-color", "-input=false", "-auto-approve", "tfplan"]
        async for line in self._run_command(cmd):
            yield line
    
    async def get_outputs(self) -> dict:
        """
        Retrieves Terraform output values as a dictionary.
        """
        process = await asyncio.create_subprocess_exec(
            "terraform", "output", "-json",
            cwd=str(self.working_dir),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        stdout, stderr = await process.communicate()

        if process.returncode != 0:
            logger.warning(f"terraform output failed: {stderr.decode()}")
            return {}

        try:
            return json.loads(stdout.decode())
        except json.JSONDecodeError:
            logger.error("Failed to parse terraform output JSON")
            return {}

        normalized_outputs = {
            key: value.get("value")
            for key, value in raw_outputs.items()
        }

        return normalized_outputs

    # async def destroy(self) -> AsyncGenerator[str, None]:
    #     """
    #     Runs 'terraform destroy' to tear down all resources.
    #     """
    #     cmd = ["terraform", "destroy", "-no-color", "-input=false", "-auto-approve"]
    #     async for line in self._run_command(cmd):
    #         yield line