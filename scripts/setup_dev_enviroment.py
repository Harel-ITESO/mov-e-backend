# Run this script when you first clone the repository to setup your enviroment
# IMPORTANT: Ensure you have Docker installed and the daemon is running
# IMPORTANT: Ensure you have AWS CLI installed and configured
# IMPORTANT: Ensure you have Node.js installed

import subprocess
import hashlib
import json
import pathlib
import time
import configparser
import platform


# Resolve the command given for unix based or windows os
def resolve_command(command: list[str]):
    if platform.system() == "Windows":
        return command

    string_cmd = " ".join(command)
    return string_cmd


def resolve_parameter(parameter: str):
    if platform.system() == "Windows":
        return parameter
    return f"'{parameter}'"


# Resolves and runs a given command, handles error throwing
def run_command(command: list[str]):
    result = subprocess.run(
        resolve_command(command), shell=True, text=True, capture_output=True
    )
    print(result.stderr)
    if result.returncode != 0:
        raise RuntimeError(result.stderr)


# Retrieve aws credentials from ~/.aws/credentials
def get_aws_credentials():
    config = configparser.RawConfigParser()
    config.read(pathlib.Path("~/.aws/credentials").expanduser())
    access_key_id = config.get("default", "aws_access_key_id")
    secret_access_key = config.get("default", "aws_secret_access_key")
    if not access_key_id or not access_key_id:
        raise RuntimeError(
            "No AWS credentials file found, please create one for local development"
        )
    return {"access_key_id": access_key_id, "secret_access_key": secret_access_key}


# Create all dynamo tables based on the json file provided as schema
def create_dynamo_tables():
    with open(pathlib.Path("./scripts/data/dynamo_tables.json").resolve(), "r") as file:
        data = json.load(file)
        for create_data in data:
            json_str = json.dumps(create_data)
            create_command = [
                "aws",
                "dynamodb",
                "create-table",
                "--cli-input-json",
                resolve_parameter(json_str),
                "--endpoint-url",
                "http://localhost:4566",
            ]
            run_command(create_command)


# Sets up a correct SES connection with aws
def setup_ses_connection():
    create_command = [
        "aws",
        "ses",
        "verify-email-identity",
        "--email-address",
        resolve_parameter("noreply@move.com"),
        "--endpoint-url",
        "http://localhost:4566",
    ]
    run_command(create_command)
    
# Creates an S3 Bucket for file storage
def setup_s3_storage():
    create_command = [
        "aws",
        "s3api",
        "create-bucket",
        "--bucket",
        "file-storage",
        "--endpoint-url",
        "http://localhost:4566",
    ]
    run_command(create_command)


# Syncs Prisma schema with postgresql database
def sync_prisma_schema():
    command = ["docker", "exec", "-it", "mov-e-api", "npx", "prisma", "db", "push"]
    run_command(command)


# Creates app resources on the given app services
# AWS SES
# DynamoDB Tables
# PostgreSQL Prisma Schema Sync
def create_app_resources():
    print("\nSetting up PostgreSQL Schema sync")
    sync_prisma_schema()

    print("\nCreating DynamoDB Tables...")
    create_dynamo_tables()

    print("\nSetting up SES configuration...")
    setup_ses_connection()

    print("\nCreating S3 Bucket as 'file-storage'...")
    setup_s3_storage()


# Compose the entire docker-compose file
def docker_compose():
    docker_compose_down = ["docker", "compose", "down"]  # Remove instances if any
    docker_compose_build = [
        "docker",
        "compose",
        "build",
        "--no-cache",
    ]  # Build instances with no cache to avoid discrepancies

    docker_compose_up = [
        "docker",
        "compose",
        "up",
        "-d",
    ]  # Run instances in detached mode

    docker_command = [
        *docker_compose_down,
        "&&",
        *docker_compose_build,
        "&&",
        *docker_compose_up,
    ]

    run_command(docker_command)


# Creates enviroment variables
def create_enviroment_variables():
    tmdb_api_key = input(
        "Enter your TMDB API Key (leave blank if you'll do it after): "
    )
    db_name = input("Enter Database Name: ")
    db_user = input("Enter Database Username: ")
    db_password = input("Enter Database Password: ")

    aws_credentials = get_aws_credentials()

    envs = {
        "DB_PWD": db_password,
        "DB_USER": db_user,
        "DB_DATABASE": db_name,
        "TMDB_API_KEY": tmdb_api_key or "required",
        "LOCAL_AWS_ENDPOINT": "http://localstack:4566",  # THIS IS DIFFERENT THAN localhost -- Because it's made for docker compose
        "COOKIE_SECRET": hashlib.sha256(b"unsafe-cookie-secret").hexdigest(),
        "JWT_SECRET": hashlib.sha256(b"unsafe-jwt-secret").hexdigest(),
        "EMAIL_SENDER": "noreply@move.com",
        "BUCKET_NAME": "file-storage",
        "AWS_ACCESS_KEY_ID": aws_credentials.get("access_key_id"),
        "AWS_SECRET_ACCESS_KEY": aws_credentials.get("secret_access_key"),
        "AWS_DEFAULT_REGION": "us-east-1",
        "NODE_ENV": "development"
    }

    file_result = ""
    for name, value in envs.items():
        file_result += f"{name}={value}\n"

    with open(".env", "w") as env_file:
        env_file.write(file_result)


# Script entry point
def main():
    input(
        "Make sure you have [default] mock profile in aws/credentials file. Enter to continue... (Run 'aws configure' with aws cli) "
    )

    try:

        # Run enviroment variables setup
        print("Enviroment variables setup...\n\n")
        create_enviroment_variables()
        print(
            ".env file updated... (Please check all 'required' values and set them with your own)\n"
        )

        # Run compose
        print("Running docker compose, this may take a while...\n")
        docker_compose()

        # Setup resources
        print("Setting up all dev resources...")
        create_app_resources()

        print(
            "\nFinished setting up, your application is running on docker\n"
            "IMPORTANT* A volume is mounted, you are able to do local modifications to the code without restarting the container, if you require to install an npm package, restart the api container"
        )

    except RuntimeError as e:
        print(e)


if __name__ == "__main__":
    main()
