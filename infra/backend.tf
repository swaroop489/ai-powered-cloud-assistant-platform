terraform {
  backend "local" {
    # Stores the state file in the same directory.
    # In a team environment, you would use S3 + DynamoDB here.
    path = "terraform.tfstate"
  }
}
