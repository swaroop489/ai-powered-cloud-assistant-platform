from app.schemas.deployment_schema import RDSInstanceSchema

def generate_rds_hcl(r: RDSInstanceSchema, project_name: str) -> str:
    pub = 'true' if r.publicly_accessible else 'false'
    return f"""
resource "random_password" "{r.name}_password" {{
  length  = 16
  special = false
}}

resource "aws_secretsmanager_secret" "{r.name}_secret" {{
  name = "{r.password_secret_name}"
}}

resource "aws_secretsmanager_secret_version" "{r.name}_secret_val" {{
  secret_id     = aws_secretsmanager_secret.{r.name}_secret.id
  secret_string = random_password.{r.name}_password.result
}}

resource "aws_db_instance" "{r.name}" {{
  allocated_storage   = {r.storage_gb}
  engine              = "{r.engine.value}"
  instance_class      = "db.t3.micro"
  username            = "{r.username}"
  password            = random_password.{r.name}_password.result
  skip_final_snapshot = true
  publicly_accessible = {pub}

  tags = {{
    Name    = "{r.name}"
    Project = "{project_name}"
  }}
}}
"""
