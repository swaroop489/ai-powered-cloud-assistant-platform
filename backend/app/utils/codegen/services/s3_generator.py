from app.schemas.deployment_schema import S3BucketSchema

def generate_s3_hcl(r: S3BucketSchema, project_name: str) -> str:
    return f"""
resource "aws_s3_bucket" "{r.name}" {{
  bucket = "{r.bucket_name}"

  tags = {{
    Name    = "{r.name}"
    Project = "{project_name}"
  }}
}}

resource "aws_s3_bucket_versioning" "{r.name}_versioning" {{
  bucket = aws_s3_bucket.{r.name}.id
  versioning_configuration {{
    status = "{'Enabled' if r.versioning else 'Suspended'}"
  }}
}}
"""
