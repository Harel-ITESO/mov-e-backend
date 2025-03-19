import sys
import subprocess


def create_server_module(module_name: str):
    command = f"npx nest g resource modules/{module_name} --no-spec"
    subprocess.run(
        command,
        shell=True,
        # capture_output=True,
        # text=True,
    )


def main():
    module_name = ""
    try:
        module_name = sys.argv[1]
    except IndexError as e:
        module_name = input("Please input module name: ")
    create_server_module(module_name=module_name)
    print(f"Module '{module_name}' created")


if __name__ == "__main__":
    main()
