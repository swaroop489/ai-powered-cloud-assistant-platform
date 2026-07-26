from app.schemas.deployment_schema import EC2InstanceSchema

def generate_ec2_hcl(r: EC2InstanceSchema, project_name: str) -> str:
    if not r.ami_id:
        data_block = """
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}
"""
        ami_ref = "data.aws_ami.amazon_linux.id"
    else:
        data_block = ""
        ami_ref = f'"{r.ami_id}"'

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

    user_data_block = f"  user_data = <<-EOF\n{r.user_data}\nEOF" if r.user_data else ""

    resource_block = f"""
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
{user_data_block}

  tags = {{
    Name    = "{r.name}"
    Project = "{project_name}"
  }}
}}
"""
    return data_block + resource_block
