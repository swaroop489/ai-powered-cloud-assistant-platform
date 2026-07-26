from typing import List
from app.schemas.deployment_schema import DeploymentRequest
from app.utils.codegen.services.ec2_generator import generate_ec2_hcl
from app.utils.codegen.services.s3_generator import generate_s3_hcl
from app.utils.codegen.services.rds_generator import generate_rds_hcl
from app.utils.codegen.services.vpc_generator import generate_vpc_hcl

def generate_hcl(request: DeploymentRequest) -> str:
    terraform_blocks = [
        """
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
"""
    ]

    provider_blocks = [
        f"""
provider "aws" {{
  region = "{request.region.value}"
}}
"""
    ]

    resource_blocks = []

    for resource in request.resources:
        if resource.type == "s3":
            resource_blocks.append(generate_s3_hcl(resource, request.project_name))
        elif resource.type == "ec2":
            resource_blocks.append(generate_ec2_hcl(resource, request.project_name))
        elif resource.type == "rds":
            resource_blocks.append(generate_rds_hcl(resource, request.project_name))
        elif resource.type == "vpc":
            resource_blocks.append(generate_vpc_hcl(resource, request.project_name))
        
        # Future implementations can easily be added here
        # elif resource.type == "ecs":
        #    resource_blocks.append(generate_ecs_hcl(resource, request.project_name))

    return "\n".join(terraform_blocks + provider_blocks + resource_blocks)
