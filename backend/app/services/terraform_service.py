import asyncio
import subprocess
import shutil
import logging
import os
import json
from typing import AsyncGenerator, List, Optional
from pathlib import Path

# Configure logger for this service
logger = logging.getLogger(__name__)

class TerraformService:
    """
    Service to handle Terraform CLI operations asynchronously.
    Each instance acts as an isolated execution environment.
    """

    def __init__(self, working_dir: str):
        """
        Initialize the Terraform service.
        Args:
            working_dir: The absolute path where .tf files will be stored.
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
            error_msg = "Terraform binary not found. Please install Terraform."
            logger.critical(error_msg)
            raise RuntimeError(error_msg)

    def _get_env_vars(self):
        """
        OPTIMIZATION: Configures a global plugin cache.
        This prevents re-downloading 300MB+ of AWS providers for every deployment.
        """
        env = os.environ.copy()
        
        # 1. Define a central cache directory (backend/tf_cache)
        # using .parent.parent to go up from 'services' to 'backend' root
        cache_dir = Path(__file__).parent.parent.parent / "tf_cache"
        
        # 2. Ensure it exists
        cache_dir.mkdir(parents=True, exist_ok=True)
        
        # 3. Tell Terraform to use it
        env["TF_PLUGIN_CACHE_DIR"] = str(cache_dir.resolve())
        
        return env

    async def _run_command(self, command_args: List[str]) -> AsyncGenerator[str, None]:
        """
        Executes a subprocess command asynchronously and streams output.
        """
        cmd_str = " ".join(command_args)
        yield f"Executing: {cmd_str}...\n"

        try:
            process = await asyncio.create_subprocess_exec(
                *command_args,
                cwd=str(self.working_dir),
                
                # CRITICAL: Inject the cache environment variables
                env=self._get_env_vars(),
                
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
                limit=1024 * 128
            )

            while True:
                line = await process.stdout.readline()
                if not line:
                    break
                
                decoded_line = line.decode('utf-8').rstrip()
                if decoded_line:
                    yield f"{decoded_line}\n"

            exit_code = await process.wait()

            if exit_code != 0:
                error_msg = f"Command failed with exit code {exit_code}"
                yield f"\n{error_msg}\n"
                logger.error(f"{error_msg} in {self.working_dir}")
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
        """Writes the generated HCL code to main.tf."""
        file_path = self.working_dir / "main.tf"
        with open(file_path, "w") as f:
            f.write(hcl_content)
        
        logger.info(f"Written main.tf to {file_path}")
        return str(file_path)

    async def init(self) -> AsyncGenerator[str, None]:
        """Runs 'terraform init'."""
        cmd = ["terraform", "init", "-no-color", "-input=false"]
        async for line in self._run_command(cmd):
            yield line

    async def validate(self) -> AsyncGenerator[str, None]:
        """Runs 'terraform validate'."""
        cmd = ["terraform", "validate", "-no-color"]
        async for line in self._run_command(cmd):
            yield line

    async def plan(self) -> AsyncGenerator[str, None]:
        """Runs 'terraform plan'."""
        cmd = ["terraform", "plan", "-no-color", "-input=false", "-out=tfplan"]
        async for line in self._run_command(cmd):
            yield line

    async def apply(self) -> AsyncGenerator[str, None]:
        """Runs 'terraform apply'."""
        cmd = ["terraform", "apply", "-no-color", "-input=false", "-auto-approve", "tfplan"]
        async for line in self._run_command(cmd):
            yield line
    
    async def destroy(self) -> AsyncGenerator[str, None]:
        """Runs 'terraform destroy'."""
        cmd = ["terraform", "destroy", "-no-color", "-input=false", "-auto-approve"]
        async for line in self._run_command(cmd):
            yield line

    async def get_outputs(self) -> dict:
        """
        Retrieves and normalizes Terraform output values.
        Returns: {'public_ip': '1.2.3.4'} instead of nested objects.
        """
        # If no state file exists, return empty
        if not (self.working_dir / "terraform.tfstate").exists():
            return {}

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
            raw_outputs = json.loads(stdout.decode())
            
            # Normalize: Extract just the 'value' from the Terraform output structure
            # Example Raw: {"ip": {"sensitive": false, "type": "string", "value": "1.2.3.4"}}
            # Example Clean: {"ip": "1.2.3.4"}
            normalized_outputs = {
                key: value.get("value")
                for key, value in raw_outputs.items()
            }
            return normalized_outputs
            
        except json.JSONDecodeError:
            logger.error("Failed to parse terraform output JSON")
            return {}