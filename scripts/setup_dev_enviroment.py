# Run this script when you first clone the repository to setup your enviroment
# IMPORTANT: Ensure you have Docker installed and the daemon is running

import subprocess
import shlex


def create_database_instance(db_name: str, db_user: str, db_password: str):
    command = f"docker run --name mov-e-database -e POSTGRES_PASSWORD={db_password} -e POSTGRES_USER={db_user} -e POSTGRES_DB={db_name} -p 5432:5432 -d postgres"
    print("Setting up Database, please wait, this may take a while...")
    docker_result = subprocess.run(shlex.split(command), capture_output=True, text=True)
    # Changed: check exit code, not stderr, to determine errors.
    if docker_result.returncode != 0:
        raise RuntimeError(docker_result.stderr)


def create_enviroment_variables(database_url: str):
    envs = {"DATABASE_URL": database_url, "NODE_ENV": "development"}

    file_result = ""
    for name, value in envs.items():
        file_result += f"{name}={value}\n"

    with open(".env", "w") as env_file:
        env_file.write(file_result)


def link_orm_to_database():
    npx_result = subprocess.run(
        ["npx", "prisma", "generate", "&&", "npx", "prisma", "db", "push"],
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
        create_database_instance(
            db_name=db_name, db_user=db_user, db_password=db_password
        )
        print("Database is running on http://localhost:5432")

        # Run enviroment variables setup
        create_enviroment_variables(database_url=db_env_variable)
        print(".env file updated...")

        # Link orm to database
        link_orm_to_database()
        print("ORM linked to database...")

    except RuntimeError as e:
        print(e)


if __name__ == "__main__":
    main()
