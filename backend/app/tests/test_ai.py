from app.services.ai_service import AIService

def main():
    ai = AIService()
    result = ai.parse_intent(
        "Create an S3 bucket for application logs in Mumbai region"
    )
    print(result.model_dump())

if __name__ == "__main__":
    main()
