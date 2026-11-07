
variable "aws_region" {
  description = "AWS region for InfraPilot"
  type        = string
  default     = "ap-south-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "project_name" {
  description = "InfraPilot project name"
  type        = string
  default     = "InfraPilot"
}
