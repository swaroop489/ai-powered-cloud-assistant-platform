```
devops/
│
├── docker/
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── docker-compose.prod.yml
│
├── github/
│   └── workflows/
│       ├── ci.yml                   # Linting, testing
│       ├── cd.yml                   # Deploy via Terraform to AWS
│       └── build.yml                # Build Docker images and push to ECR
│
├── scripts/
│   ├── build_frontend.sh
│   ├── build_backend.sh
│   ├── deploy_infra.sh
│   ├── destroy_infra.sh
│   └── seed_db.py
│
└── nginx/
    ├── nginx.conf                   # Reverse proxy configuration (if used)
    └── Dockerfile

```
