# MovE Backend Application

This is the backend application for MovE (A Letterboxd clone). There are mutliple processes to be able to run this project locally.

### Clone the repository

First, clone the repository in your local computer to be able to modify the source code

```bash
git clone https://github.com/Harel-ITESO/mov-e-backend.git


```

### RECOMMENDED

This project uses the NodeJS version specified on `.nvmrc`. I **HIGHLY** recommend you use [nvm](https://github.com/nvm-sh/nvm) as a node version manager and run the following command before running anything node related commands

```bash
nvm use
```

### Install dependencies

Ensure you install all the required dependencies in your local repository

```bash
npm install
```

### Scripts

There are two scripts that will help you with your development

#### 1. Set up a local development enviroment and run the project

This script named as `setup_dev_enviroment.py`, will do the following:

1. Asks the user for some **Enviroment Variables** and set up the `.env` file.
2. Runs the `docker-compose.yaml` file which sets up:

    - PostgreSQL Database.
    - Localstack to run AWS services locally.
    - Backend application on **development** mode.

3. Runs `npx prisma generate && npx prisma db push` to link your ORM to the current PostgreSQL database.

> NOTE: The backend application is run with a volume to mantain hot reload. That means, you can start editing code and get instant reload on your container

To run it simply use

```bash
python3 scripts/setup_dev_enviroment.py # Ensure you have python installed
```

#### 2. Create a Nest Module

This script is more simple, its function is to create a module for the project, this aims to be a simpler abstraction of `nest -g generate resource '' --no-spec`. To run it, simply write in the console the following

```bash
python3 scripts/create_server_module.py MODULE

# or if you don't add the module name then

python3 scripts/create_server_module.py
> Please input module name:
```

If you have any question, do not doubt to contact me

### Run the project on your local machine (DEPRECATED)

> I don't recommend running the proyect like this, use the python script for it to manage with the other required services in the docker enviroment

To run the NestJS project, you must use the following commands based on your requirments.

```bash
# For local development
npm run start:dev

#or

# For production development (Ensure you run the build command first)
npm run start:prod
```
