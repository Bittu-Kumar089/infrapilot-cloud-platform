
output "instance_id" {
  description = "InfraPilot EC2 instance ID"
  value       = aws_instance.infrapilot_server.id
}

output "public_ip" {
  description = "InfraPilot EC2 public IP"
  value       = aws_instance.infrapilot_server.public_ip
}

output "instance_type" {
  description = "EC2 instance type"
  value       = aws_instance.infrapilot_server.instance_type
}
