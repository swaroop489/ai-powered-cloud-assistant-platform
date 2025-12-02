```
backend/
│
├── app/
│   ├── main.py                       # Entry point (FastAPI instance)
│   ├── config.py                     # Environment variables, config setup
│   ├── database.py                   # SQLAlchemy connection setup
│   │
│   ├── models/
│   │   ├── deployment.py
│   │   ├── telemetry.py
│   │   ├── user.py                   # For future login/auth
│   │   └── base.py                   # Declarative base for SQLAlchemy
│   │
│   ├── schemas/
│   │   ├── deployment_schema.py
│   │   ├── telemetry_schema.py
│   │   └── user_schema.py
│   │
│   ├── routers/
│   │   ├── ai.py
│   │   ├── deploy.py
│   │   ├── metrics.py
│   │   └── auth.py                   # (Optional) JWT-based auth routes
│   │
│   ├── services/
│   │   ├── openai_service.py         # AI and LangChain logic
│   │   ├── terraform_service.py      # Terraform execution
│   │   ├── metrics_service.py        # Query DB for telemetry
│   │   ├── logging_service.py        # Store logs and progress
│   │   └── email_service.py          # Optional alerts
│   │
│   ├── utils/
│   │   ├── helpers.py
│   │   ├── security.py
│   │   ├── constants.py
│   │   └── logger.py
│   │
│   ├── tests/
│   │   ├── test_ai.py
│   │   ├── test_deploy.py
│   │   ├── test_metrics.py
│   │   └── test_db.py
│   │
│   ├── events/
│   │   ├── startup.py
│   │   └── shutdown.py
│   │
│   └── __init__.py
│
├── requirements.txt
├── .env
├── Dockerfile
└── start.sh
```
