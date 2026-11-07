
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "infrapilot_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = "infrapilot-key-v2"
  vpc_security_group_ids = [aws_security_group.infrapilot_sg.id]

  tags = {
    Name        = "InfraPilot-Server"
    Project     = var.project_name
    Environment = "Development"
    ManagedBy   = "Terraform"
  }
}
