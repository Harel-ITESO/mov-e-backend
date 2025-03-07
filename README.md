# MovE Backend Application

This is the backend application for MovE (A Letterboxd clone). There are mutliple processes to be able to run this project locally.

### Clone the repository

First, clone the repository in your local computer to be able to modify the source code

```bash
git clone https://github.com/Harel-ITESO/mov-e-backend.git
```

### Install dependencies

Ensure you install all the required dependencies in your local repository

```bash
npm install
```

### Run the project

To run the NestJS project, you must use the following commands based on your requirments.

```bash
# For local development
npm run start:dev

#or

# For production development (Ensure you run the build command first)
npm run start:prod
```

### Scripts

There are two scripts to help you get started with the project

#### 1. Set up a local development enviroment

This script setups a local enviroment for you to get started with developing with the required enviroment variables and actions. This script runs the following

1. Setups a `docker` PostgreSQL database instance
2. Creates enviroment variables file `.env`
3. Runs `npx prisma generate && npx prisma db push` to link your ORM to the current PostgreSQL database.

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
