from app.schemas.deployment_schema import VPCSchema

def generate_vpc_hcl(r: VPCSchema, project_name: str) -> str:
    vpc_hcl = f"""
resource "aws_vpc" "{r.name}" {{
  cidr_block           = "{r.cidr_block}"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {{
    Name    = "{r.name}"
    Project = "{project_name}"
  }}
}}

resource "aws_subnet" "{r.name}_public" {{
  vpc_id                  = aws_vpc.{r.name}.id
  cidr_block              = cidrsubnet("{r.cidr_block}", 4, 1)
  map_public_ip_on_launch = true
  tags = {{
    Name = "{r.name}-public"
  }}
}}

resource "aws_internet_gateway" "{r.name}_igw" {{
  vpc_id = aws_vpc.{r.name}.id
}}

resource "aws_route_table" "{r.name}_rt" {{
  vpc_id = aws_vpc.{r.name}.id
  route {{
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.{r.name}_igw.id
  }}
}}

resource "aws_route_table_association" "{r.name}_rta" {{
  subnet_id      = aws_subnet.{r.name}_public.id
  route_table_id = aws_route_table.{r.name}_rt.id
}}
"""
    if r.enable_nat_gateway:
        vpc_hcl += f"""
resource "aws_eip" "{r.name}_nat_eip" {{
  domain = "vpc"
}}

resource "aws_nat_gateway" "{r.name}_nat" {{
  allocation_id = aws_eip.{r.name}_nat_eip.id
  subnet_id     = aws_subnet.{r.name}_public.id
  depends_on    = [aws_internet_gateway.{r.name}_igw]
}}
"""
    return vpc_hcl
