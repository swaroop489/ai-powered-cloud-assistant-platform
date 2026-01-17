variable "aws_region" {
  description = "AWS Region to deploy to"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for tagging"
  type        = string
  default     = "cloud-assistant-platform"
}

variable "instance_type" {
  description = "EC2 Instance Type"
  type        = string
  default     = "t3.medium" # t3.medium (2vCPU, 4GB RAM) is recommended for Backend + DB + Build
}

variable "ssh_public_key" {
  description = "The Public SSH key content (e.g., 'ssh-rsa AAA...'). You can use 'cat ~/.ssh/id_rsa.pub' to get this."
  type        = string
  sensitive   = true
}

variable "allowed_ssh_cidr" {
  description = "CIDR block allowed to SSH (0.0.0.0/0 for open access, or your IP)"
  type        = string
  default     = "0.0.0.0/0"
}
