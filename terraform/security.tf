resource "aws_security_group" "infrapilot_sg" {
  name        = "infrapilot-security-group"
  description = "Secure access for InfraPilot EC2"
  vpc_id      = data.aws_vpc.default.id

  # SSH access
  ingress {
    description = "SSH access from my IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["49.43.90.139/32"]
  }

  # HTTP access
  ingress {
    description = "Public HTTP access for InfraPilot"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name      = "InfraPilot-Security-Group"
    Project   = var.project_name
    ManagedBy = "Terraform"
  }
}

data "aws_vpc" "default" {
  default = true
}