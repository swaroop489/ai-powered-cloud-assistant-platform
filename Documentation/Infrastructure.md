```
infra/
│
├── main.tf                     # Root Terraform file
├── variables.tf                # Variable definitions
├── outputs.tf                  # Outputs (URLs, IPs)
├── provider.tf                 # AWS provider setup
├── backend.tf                  # Terraform remote backend (S3, DynamoDB)
│
├── modules/
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── ecs/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── rds/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── s3/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── cloudfront/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
└── terraform.tfvars            # Default variable values (region, env, etc.)


```
