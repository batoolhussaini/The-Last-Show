terraform {
  required_providers {
    aws = {
      version = ">= 4.0.0"
      source  = "hashicorp/aws"
    }
  }
}


# REQUIREMENTS
  # one dynamodb table
  # two lambda functions w/ function url
  # roles and policies as needed
  # step functions (if you're going for the bonus marks)


# PROVIDER REGION
provider "aws" {
  region = "ca-central-1"
}


# LOCALS
locals {
  function_name_create  = "create-obituary-30140724"
  function_name_get     = "get-obituaries-30140724"
  handler_name          = "main.lambda_handler"
  artifact_name_create  = "create_artifact.zip"
  artifact_name_get     = "get_artifact.zip"
}


# DATABASE
# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/dynamodb_table
resource "aws_dynamodb_table" "last-show-30134905" {
  name         = "last-show-30134905"
  billing_mode = "PROVISIONED"

  # up to 8KB read per second (eventually consistent)
  read_capacity = 1

  # up to 1KB per second
  write_capacity = 1

  # name as Partition Key
  # id as Sort Key
  hash_key = "name"
  range_key = "id"

  # "S" is type string
  # "N" is type integer
  attribute {
    name = "name"
    type = "S"
  }

  attribute {
    name = "id"
    type = "S"
  }
}


# CREATE ROLE
# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role
resource "aws_iam_role" "lambda-save" {
  name               = "iam-for-lambda-${local.function_name_create}"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}


# GET ROLE
# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role
resource "aws_iam_role" "lambda-get" {
  name               = "iam-for-lambda-${local.function_name_get}"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}


# CREATE ZIP
data "archive_file" "lambda-save" {
  type        = "zip"
  source_dir = "../functions/create-obituary"
  output_path = "create_artifact.zip"
}


# GET ZIP
data "archive_file" "lambda-get" {
  type        = "zip"
  source_file = "../functions/get-obituaries/main.py"
  output_path = "get_artifact.zip"
}


# CREATE FUNCTION
# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function
resource "aws_lambda_function" "create-obituary-30140724" {
  role             = aws_iam_role.lambda-save.arn
  function_name    = local.function_name_create
  handler          = local.handler_name
  filename         = local.artifact_name_create
  source_code_hash = data.archive_file.lambda-save.output_base64sha256

  # see all available runtimes here: https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime
  runtime = "python3.9"
}


# GET FUNCTION
# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function
resource "aws_lambda_function" "get-obituaries-30140724" {
  role             = aws_iam_role.lambda-get.arn
  function_name    = local.function_name_get
  handler          = local.handler_name
  filename         = local.artifact_name_get
  source_code_hash = data.archive_file.lambda-get.output_base64sha256

  # see all available runtimes here: https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime
  runtime = "python3.9"
}


# CREATE CLOUDWATCH POLICY
# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy
resource "aws_iam_policy" "logs-save" {
  name        = "lambda-logging-${local.function_name_create}"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "dynamodb:PutItem", 
        "polly:SynthesizeSpeech"
      ],
      "Resource": ["arn:aws:logs:*:*:*", "${aws_dynamodb_table.last-show-30134905.arn}"],
      "Effect": "Allow"
    }
  ]
}
EOF
}


# GET CLOUDWATCH POLICY
# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy
resource "aws_iam_policy" "logs-get" {
  name        = "lambda-logging-${local.function_name_get}"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "dynamodb:GetItem",
        "dynamodb:Scan"
      ],
      "Resource": ["arn:aws:logs:*:*:*", "${aws_dynamodb_table.last-show-30134905.arn}"],
      "Effect": "Allow"
    }
  ]
}
EOF
}


# ATTACH CLOUDWATCH POLICIES
# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment
# for CREATE
resource "aws_iam_role_policy_attachment" "lambda_logs_save" {
  role       = aws_iam_role.lambda-save.name
  policy_arn = aws_iam_policy.logs-save.arn
}

# for GET
resource "aws_iam_role_policy_attachment" "lambda_logs_get" {
  role       = aws_iam_role.lambda-get.name
  policy_arn = aws_iam_policy.logs-get.arn
}


# CREATE URL
# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function_url
resource "aws_lambda_function_url" "url-save" {
  function_name      = aws_lambda_function.create-obituary-30140724.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["POST"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}


# GET URL
# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function_url
resource "aws_lambda_function_url" "url-get" {
  function_name      = aws_lambda_function.get-obituaries-30140724.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}


# SHOW FUNCTION URLS AFTER CREATION
# for CREATE
output "lambda_url-create" {
  value = aws_lambda_function_url.url-save.function_url
}

# for GET
output "lambda_url-get" {
  value = aws_lambda_function_url.url-get.function_url
}