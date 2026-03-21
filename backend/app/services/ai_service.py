import os
import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from app.schemas.deployment_schema import DeploymentRequest
from dotenv import load_dotenv
load_dotenv()

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        # -------------------------------
        # MODEL SELECTION
        # -------------------------------
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
             raise RuntimeError("No valid AI API key found (GOOGLE_API_KEY)")

        if api_key:
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-flash-latest",  # <--- CRITICAL FIX FOR YOUR ACCOUNT
                google_api_key=api_key,    # Explicitly pass the key
                temperature=0,
                convert_system_message_to_human=True,
                timeout=30,
                max_retries=1,
            )
            logger.info("AI Service initialized with Gemini 2.0 Flash")

        # -------------------------------
        # STRUCTURED OUTPUT ENFORCEMENT
        # -------------------------------
        # This tells LangChain: "Force the LLM to output ONLY this Pydantic schema"
        self.structured_llm = self.llm.with_structured_output(DeploymentRequest)

        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """
You are an Expert Cloud Architect.

You MUST output ONLY valid JSON that strictly matches the provided schema.

CRITICAL RULES (MANDATORY):
1. The "type" field MUST be one of:
   - "s3"
   - "ec2"
   - "rds"
   - "vpc"

2. NEVER invent new type names.
3. If the user asks for a server, use type = "ec2".
4. If a 'github_repo_url' property is provided, you MUST include a bash script in the 'user_data' field of all 'ec2' instances. The script must auto-install git and docker, clone the Repo URL into /home/ubuntu/app, and run docker-compose up -d.
5. Always prefer secure defaults.
6. Do NOT include any explanation text, markdown, or comments.
7. Output ONLY JSON.
""",
                ),
                ("human", "Prompt: {input}\nGitHub Repo URL: {github_repo_url}"),
            ]
        )

        self.chain = self.prompt | self.structured_llm
    
    def _normalize_resource_types(raw: dict) -> dict:
        for r in raw.get("resources", []):
            if r.get("type") in {"s3_bucket", "aws_s3_bucket"}:
                r["type"] = "s3"
            elif r.get("type") in {"aws_instance", "ec2_instance"}:
                r["type"] = "ec2"
            elif r.get("type") in {"aws_db", "database"}:
                r["type"] = "rds"
        return raw


    def parse_intent(self, user_prompt: str, github_repo_url: str = "") -> DeploymentRequest:
        """
        Converts natural language → validated DeploymentRequest
        """
        try:
            logger.info("Parsing infrastructure intent via AI")

            result: DeploymentRequest = self.chain.invoke(
                {"input": user_prompt.strip(), "github_repo_url": github_repo_url.strip()}
            )

            # -------------------------------
            # POST-VALIDATION SAFETY
            # -------------------------------
            if not result.project_name:
                result.project_name = "generated-infra-project"
                
            if github_repo_url and not result.github_repo_url:
                result.github_repo_url = github_repo_url

            logger.info("AI intent parsed successfully")
            return result

        except Exception as e:
            logger.exception("AI intent parsing failed")
            raise RuntimeError("Failed to parse infrastructure intent") from e