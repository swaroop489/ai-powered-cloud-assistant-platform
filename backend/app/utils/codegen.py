from typing import List

from app.schemas.deployment_schema import (
    DeploymentRequest,
    S3BucketSchema,
    EC2InstanceSchema,
    RDSInstanceSchema,
    VPCSchema,
)


def generate_hcl(request: DeploymentRequest) -> str:
    """
    Converts a DeploymentRequest object into a valid Terraform HCL string.
    """
    terraform_blocks: List[str] = []
    provider_blocks: List[str] = []
    data_blocks: List[str] = []
    resource_blocks: List[str] = []

    # -------------------------------------------------
    # Terraform + Provider Block
    # -------------------------------------------------
    terraform_blocks.append(
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
    )

    provider_blocks.append(
        f"""
provider "aws" {{
  region = "{request.region.value}"
}}
"""
    )

    # -------------------------------------------------
    # Resource Blocks
    # -------------------------------------------------
    for resource in request.resources:

        # ------------------------
        # S3 BUCKET
        # ------------------------
        if resource.type == "s3":
            r: S3BucketSchema = resource

            resource_blocks.append(
                f"""
resource "aws_s3_bucket" "{r.name}" {{
  bucket = "{r.bucket_name}"

  tags = {{
    Name    = "{r.name}"
    Project = "{request.project_name}"
  }}
}}

resource "aws_s3_bucket_versioning" "{r.name}_versioning" {{
  bucket = aws_s3_bucket.{r.name}.id
  versioning_configuration {{
    status = "{'Enabled' if r.versioning else 'Suspended'}"
  }}
}}
"""
            )

        # ------------------------
        # EC2 INSTANCE
        # ------------------------
        elif resource.type == "ec2":
            r: EC2InstanceSchema = resource

            # AMI handling
            if not r.ami_id:
                data_blocks.append(
                    """
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}
"""
                )
                ami_ref = "data.aws_ami.amazon_linux.id"
            else:
                ami_ref = f"\"{r.ami_id}\""

            # Security group ingress rules
            ingress_rules = "\n".join(
                [
                    f"""
  ingress {{
    from_port   = {port}
    to_port     = {port}
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }}
"""
                    for port in r.open_ports
                ]
            )

            resource_blocks.append(
                f"""
resource "aws_security_group" "{r.name}_sg" {{
  name        = "{r.name}-sg"
  description = "Security group for {r.name}"

{ingress_rules}

  egress {{
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }}
}}

resource "aws_instance" "{r.name}" {{
  ami           = {ami_ref}
  instance_type = "{r.instance_type.value}"

  vpc_security_group_ids = [aws_security_group.{r.name}_sg.id]

  tags = {{
    Name    = "{r.name}"
    Project = "{request.project_name}"
  }}
}}
"""
            )

        # ------------------------
        # RDS (placeholder – extensible)
        # ------------------------
        elif resource.type == "rds":
            r: RDSInstanceSchema = resource
            resource_blocks.append(
                f"""
# RDS support coming soon
# Requested engine: {r.engine.value}
"""
            )

        # ------------------------
        # VPC (placeholder)
        # ------------------------
        elif resource.type == "vpc":
            r: VPCSchema = resource
            resource_blocks.append(
                f"""
# VPC support coming soon
# CIDR: {r.cidr_block}
"""
            )

    # -------------------------------------------------
    # Final HCL Output
    # -------------------------------------------------
    return "\n".join(
        terraform_blocks + provider_blocks + data_blocks + resource_blocks
    )
