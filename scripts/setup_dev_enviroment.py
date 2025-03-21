# Run this script when you first clone the repository to setup your enviroment
# IMPORTANT: Ensure you have Docker installed and the daemon is running
# IMPORTANT: Ensure you have AWS CLI installed and configured
# IMPORTANT: Ensure you have Node.js installed

import subprocess
import hashlib
import json
import pathlib


def create_postgres_instance(db_name: str, db_user: str, db_password: str):
    command = f"docker run --name mov-e-database -e POSTGRES_PASSWORD={db_password} -e POSTGRES_USER={db_user} -e POSTGRES_DB={db_name} -p 5432:5432 -d postgres"
    print("Setting up Database, please wait, this may take a while...")
    docker_result = subprocess.run(
        command, capture_output=True, text=True, shell=True
    )
    print(docker_result.stderr)
    # Changed: check exit code, not stderr, to determine errors.
    if docker_result.returncode != 0:
        raise RuntimeError(docker_result.stderr)


def create_dynamo_db_instance():
    create_docker_instance = (
        "docker run --name mov-e-dynamodb -p 8000:8000 -d amazon/dynamodb-local "
        "-jar DynamoDBLocal.jar -inMemory -sharedDb"
    )
    print("Setting up DynamoDB, please wait, this may take a while...")

    docker_result = subprocess.run(
        create_docker_instance, capture_output=True, text=True, shell=True
    )
    print(docker_result.stderr)
    if docker_result.returncode != 0:
        raise RuntimeError(docker_result.stderr)

    # Crear las tablas
    with open(pathlib.Path('./scripts/data/dynamo_tables.json').resolve(), "r") as file:
        data = json.load(file)
        for create_data in data:
            json_str = json.dumps(create_data)
            create_command = (
                f"aws dynamodb create-table --cli-input-json '{json_str}' "
                f"--endpoint-url http://localhost:8000"
            )
            create_result = subprocess.run(
                create_command, capture_output=True, text=True, shell=True
            )
            print(create_result.stderr)
            if create_result.returncode != 0:
                raise RuntimeError(create_result.stderr)



def create_enviroment_variables(database_url: str):
    tmdb_api_key = input("Enter your TMDB API Key (leave blank if you'll do it after): ")
    envs = {
        "DATABASE_URL": database_url,
        "NODE_ENV": "development",
        "TMDB_API_KEY": tmdb_api_key or "required",
        "DEV_DYNAMO_ENDPOINT": "http://localhost:8000",
        "COOKIE_SECRET": hashlib.sha256(b"secret").hexdigest(),
        "EMAIL_SENDER": "john.doe@gmail.com"
    }

    file_result = ""
    for name, value in envs.items():
        file_result += f"{name}={value}\n"

    with open(".env", "w") as env_file:
        env_file.write(file_result)


def link_orm_to_database():
    command = "npx prisma generate && npx prisma db push"
    npx_result = subprocess.run(
        command,
        shell=True,
        capture_output=True,
        text=True,
    )
    if npx_result.stderr:
        raise RuntimeError(npx_result.stderr)


def main():
    # SETUP DATABASE
    print("DATABASE SETUP:")
    db_name = input("Enter Database Name: ")
    db_user = input("Enter Database Username: ")
    db_password = input("Enter Database Password: ")

    # CREATE ENVIROMENT VARIABLES
    db_env_variable = f"postgres://{db_user}:{db_password}@localhost:5432/{db_name}"

    try:
        # Run database creation
        create_postgres_instance(
            db_name=db_name, db_user=db_user, db_password=db_password
        )
        print("Database is running on http://localhost:5432")


        # create dynamodb instance with tables
        create_dynamo_db_instance()
        print("DynamoDB is running on http://localhost:8000")

        # Run enviroment variables setup
        create_enviroment_variables(database_url=db_env_variable)
        print(".env file updated... (Please check all 'required' values and set them with your own)")

        # Link orm to database
        link_orm_to_database()
        print("ORM linked to database...")

    except RuntimeError as e:
        print(e)


if __name__ == "__main__":
    main()
