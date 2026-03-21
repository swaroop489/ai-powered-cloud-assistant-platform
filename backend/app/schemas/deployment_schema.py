from typing import List, Optional, Literal, Union
from pydantic import BaseModel, Field, model_validator
from enum import Enum



# ENUMS — STRICT CONSTRAINTS (ANTI-HALLUCINATION)


class CloudProvider(str, Enum):
    AWS = "aws"


class AWSRegion(str, Enum):
    US_EAST_1 = "us-east-1"
    # US_WEST_1 = "us-west-1"
    # US_WEST_2 = "us-west-2"
    # EU_CENTRAL_1 = "eu-central-1"
    # AP_SOUTH_1 = "ap-south-1"  # Mumbai


class EC2InstanceType(str, Enum):
    T2_MICRO = "t2.micro"
    # T3_MICRO = "t3.micro"
    # T3_SMALL = "t3.small"
    # T3_MEDIUM = "t3.medium"
    # M5_LARGE = "m5.large"


class DBEngine(str, Enum):
    POSTGRES = "postgres"
    MYSQL = "mysql"



# TAGS — CONSTRAINED (NO FREE-FORM GARBAGE)


class Tags(BaseModel):
    project: Optional[str] = Field(None, description="Project identifier")
    environment: Optional[str] = Field(None, description="Deployment environment")
    owner: Optional[str] = Field(None, description="Resource owner")



# BASE RESOURCE


class BaseResource(BaseModel):
    """Base class for all infrastructure resources."""
    name: str = Field(
        ...,
        description="Logical unique name of the resource (e.g., 'app-server')"
    )
    tags: Optional[Tags] = Field(
        None,
        description="Optional AWS tags"
    )



# RESOURCE-SPECIFIC SCHEMAS


class S3BucketSchema(BaseResource):
    type: Literal["s3"] = "s3"

    bucket_name: str = Field(
        ...,
        pattern=r"^[a-z0-9.-]+$",
        description="Globally unique bucket name (lowercase only)"
    )

    versioning: bool = Field(
        False,
        description="Enable object versioning"
    )

    public_access: bool = Field(
        False,
        description="Whether bucket is publicly accessible (default: false)"
    )


class EC2InstanceSchema(BaseResource):
    type: Literal["ec2"] = "ec2"

    instance_type: EC2InstanceType = Field(
        EC2InstanceType.T2_MICRO,
        description="EC2 instance size"
    )

    ami_id: Optional[str] = Field(
        None,
        description="Specific AMI ID (defaults to latest Amazon Linux 2)"
    )

    key_name: Optional[str] = Field(
        None,
        description="SSH key pair name"
    )

    open_ports: List[int] = Field(
        default_factory=list,
        description="Explicit list of ports to open in security group"
    )

    user_data: Optional[str] = Field(
        None,
        description="Cloud-init script (user_data) to configure the instance on boot"
    )


class RDSInstanceSchema(BaseResource):
    type: Literal["rds"] = "rds"

    engine: DBEngine = Field(
        ...,
        description="Database engine"
    )

    username: str = Field(
        ...,
        description="Master database username"
    )

    password_secret_name: str = Field(
        ...,
        description="Reference to secret (e.g., AWS Secrets Manager name)"
    )

    storage_gb: int = Field(
        20,
        ge=5,
        le=100,
        description="Allocated storage in GB (5–100)"
    )

    publicly_accessible: bool = Field(
        False,
        description="Whether DB is publicly accessible"
    )


class VPCSchema(BaseResource):
    type: Literal["vpc"] = "vpc"

    cidr_block: str = Field(
        "10.0.0.0/16",
        pattern=r"^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$",
        description="IPv4 CIDR block"
    )

    enable_nat_gateway: bool = Field(
        False,
        description="Enable NAT Gateway for private subnets (costly)"
    )



# POLYMORPHIC RESOURCE UNION


ResourceUnion = Union[
    S3BucketSchema,
    EC2InstanceSchema,
    RDSInstanceSchema,
    VPCSchema,
]



# MAIN DEPLOYMENT REQUEST (AI OUTPUT CONTRACT)


class DeploymentRequest(BaseModel):
    project_name: str = Field(
        ...,
        min_length=3,
        max_length=50,
        pattern=r"^[a-zA-Z0-9-_]+$",
        description="Project identifier"
    )

    cloud_provider: CloudProvider = Field(
        CloudProvider.AWS,
        description="Target cloud provider"
    )

    environment: Literal["dev", "staging", "prod"] = Field(
        "dev",
        description="Deployment environment"
    )

    region: AWSRegion = Field(
        AWSRegion.US_EAST_1,
        description="AWS region"
    )

    resources: List[ResourceUnion] = Field(
        ...,
        description="List of infrastructure resources"
    )

    estimated_cost: Optional[float] = Field(
        0.0,
        description="Estimated monthly total cost in USD"
    )

    github_repo_url: Optional[str] = Field(
        None,
        description="Optional Git repository URL to deploy on instances"
    )

    # -----------------------------------------------------
    # VALIDATION RULES (ENTERPRISE-GRADE SAFETY)
    # -----------------------------------------------------

    @model_validator(mode="after")
    def validate_single_vpc(self):
        vpcs = [r for r in self.resources if r.type == "vpc"]
        if len(vpcs) > 1:
            raise ValueError("Only one VPC is allowed per deployment")
        return self

    class Config:
        json_schema_extra = {
            "example": {
                "project_name": "ai-startup-demo",
                "cloud_provider": "aws",
                "environment": "dev",
                "region": "ap-south-1",
                "resources": [
                    {
                        "type": "vpc",
                        "name": "main-vpc",
                        "cidr_block": "10.0.0.0/16"
                    },
                    {
                        "type": "s3",
                        "name": "logs-bucket",
                        "bucket_name": "ai-startup-logs-2024",
                        "versioning": True
                    },
                    {
                        "type": "ec2",
                        "name": "app-server",
                        "instance_type": "t3.micro",
                        "open_ports": [22, 80]
                    }
                ]
            }
        }
