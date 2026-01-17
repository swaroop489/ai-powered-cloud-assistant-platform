output "public_ip" {
  description = "Public IP address of the Platform Server"
  value       = aws_instance.platform_server.public_ip
}

output "ssh_command" {
  description = "Command to SSH into the server"
  value       = "ssh -i <path-to-private-key> ubuntu@${aws_instance.platform_server.public_ip}"
}
