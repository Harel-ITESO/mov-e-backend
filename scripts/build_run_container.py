# DON'T RUN THIS SCRIPT IF YOU ARE NOT WORKING DIRECTLY WITH CONTAINERS

import subprocess
import os


def platform_getter():
    print("REQUIRED -- Select the platform to host your build")
    print("1. Amazon Linux")
    print("2. Local")
    platform = input("Enter the number of the platform: ")
    if platform == "1":
        return "linux/amd64"
    elif platform == "2":
        return ""
    else:
        raise ValueError("Invalid platform selected")


def run_getter():
    print("Build complete. Would you like to run the container?")
    print("1. Yes")
    print("2. No")
    selection = input("Enter the number of your selection: ")
    if selection == "1":
        return True
    elif selection == "2":
        return False
    else:
        raise ValueError("Invalid selection")


def build_container(platform: str):
    command = ""
    if platform != "":
        command = f"docker buildx build --platform={platform} -t mov-e-api ."
    else:
        command = "docker build -t mov-e-api ."
    print("Building container, please wait, this may take a while...")
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(result.stderr)


def run_container():
    env_vars = ""
    with open(".env", "r") as env_file:
        file_contents = env_file.read()
        for line in file_contents.split("\n"):
            if line:
                key, value = line.split("=")
                env_vars += f"-e {key}={value} "

    print("Running container, please wait, this may take a while...")
    run_command = f"docker run --name api -p 8080:8080 {env_vars} -d mov-e-api"
    print(run_command)
    result = subprocess.run(run_command, shell=True, capture_output=True, text=True)
    if result.returncode != 0 or result.stderr:
        raise RuntimeError(result.stderr)


def main():

    try:
        platform = platform_getter()
        build_container(platform)
        print()

        # only run container if platform is local
        if platform == "":
            run_container_slection = run_getter()
            print()
            if run_container_slection:
                run_container()
                print()
                print("running container")

    except RuntimeError as e:
        print(f"Error: {e}")
    except ValueError as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()
