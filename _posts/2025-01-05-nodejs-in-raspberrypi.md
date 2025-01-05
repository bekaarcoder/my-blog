---
layout: post
title: Deploy a Node.js Application Using MySQL and Prisma on a Raspberry Pi
description: Learn how to deploy a Node.js application on a Raspberry Pi, configure environment variables, set up Nginx as a reverse proxy, and expose your app to the internet using Ngrok. This step-by-step guide is perfect for anyone looking to host and test their Node.js apps on a Raspberry Pi, both locally and remotely.
date: 2025-01-05 09:40:05 +0530
permalink: '/deploy-nodejs-app-on-raspberry-pi'
categories: nodejs mysql raspberrypi prisma ngrok
cover_image: '/assets/images/cover_image_2025_01_05.png'
image: '/assets/images/cover_image_2025_01_05.png'
---

Deploying applications has become increasingly accessible, with a range of free and paid hosting options like Render, AWS, and DigitalOcean. However, for developers who want to learn, experiment, and deploy applications without recurring hosting fees, a **Raspberry Pi** offers an excellent alternative. This compact yet powerful device allows you to create your own Linux-based server for hosting web applications.

In this blog, we’ll explore how to deploy a **TypeScript Node.js** application using **MySQL** (MariaDB on Raspberry Pi) and **Prisma ORM** on a Raspberry Pi. Additionally, we’ll configure **NGINX** for reverse proxying and use **Ngrok** to expose the application to the internet. Let’s dive in!

<hr>

## Tools Overview

**Raspberry Pi**

A low-cost, single-board computer that runs a Linux-based operating system. It’s ideal for creating your own server for IoT or web applications.

**Node.js & TypeScript**

Node.js is a runtime environment for executing JavaScript on the server, and TypeScript adds static typing to JavaScript, making the codebase more maintainable.

**MySQL (MariaDB on Raspberry Pi)**

A popular relational database system, MariaDB is a compatible replacement for MySQL and is lightweight enough for a Raspberry Pi.

**Prisma ORM**

An Object-Relational Mapping (ORM) tool that simplifies database interactions with a type-safe query language and schema migrations.

**NGINX**

A high-performance HTTP server and reverse proxy server. It helps route traffic to your Node.js application.

**Ngrok**

A tunneling tool that exposes your locally hosted applications to the internet securely without complex network configurations.

<hr>

### Prerequisites

1. **A working Raspberry Pi** - Ensure that SSH is enabled on the Raspberry Pi and you can access it remotely.
2. **Github Repository** - Your Node.js TypeScript application should be hosted in a GitHub repository for easy deployment.
3. **Ngrok Account** - Create a free account on Ngrok to obtain an auth token for exposing your Raspberry Pi app to the internet.

## Setting Up Raspberry Pi

1. **Install the OS**

    Setup your Raspberry Pi with an OS like Raspberry Pi OS. Use the `Raspberry Pi Imager` to find other OS compatible to your Raspberry Pi.

2. **Find the IP Address**

    Use a tool like `Angry IP Scanner` to discover your Raspberry Pi’s IP address. Ensure the Raspberry Pi is connected to the same network as your local machine.

3. **Check Raspberry Pi Status**

    ```bash
    ping <IP_ADDRESS_OF_RPI>
    ```

4. **SSH Into the Raspberry Pi**

    ```bash
    ssh <username>@<IP_ADDRESS_OF_RPI>
    ```

    Replace `<username>` with your Raspberry Pi’s username and `<IP_ADDRESS_OF_RPI>` with the IP address and then enter the password.

5. **Update the System**

    ```bash
    sudo apt update && sudo apt upgrade
    ```

6. **Install Git**

    Check if git is installed. If not, run the below command to install git

    ```bash
    sudo apt install git
    ```

<hr>

### Installing Node.js

To install node js, we will be using `nvm` (Node Version Manager). It allows you to quickly install and use different version of node via command line.

1. **Install NVM**

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    ```

2. **Verify Installation**

    ```bash
    nvm --version
    ```

3. **Install the Latest LTS Version of Node.js**

    ```bash
    nvm install --lts
    ```

4. **Verify Node.js and npm Installation**

    ```bash
    node --version
    # v22.12.0

    npm --version
    # 10.9.0
    ```

<hr>

## Setting Up MySQL (MariaDB)

For Raspberry Pi OS, we will be installing MariaDB.

1. **Install the MariaDB SQL Server**

    ```bash
    sudo apt install mariadb-server
    ```

2. **Secure MariaDB Installation**

    ```bash
    sudo mysql_secure_installation
    ```

    Follow the prompts to secure your database.

    - **Enter the current root password:** - Press Enter when asked to enter the current password for the root user (since it hasn’t been set yet).
    - **Set the root password:** - Type n when prompted to set the root password (we’ll set it later).
    - **Remove anonymous users:** - Type Y to remove anonymous users and improve security. (For testing purposes, you can type n to keep anonymous users.)
    - **Disallow root login remotely:** - Type n to allow root login remotely (optional but less secure).
    - **Remove the test database:** - Type y to remove the test database and access to it. (Type n if you want to keep it.)

3. **Login to MariaDB Client**

    ```bash
    sudo mysql
    ```

4. **Setup a Root password for MariaDB**

    First, we need to tell the database server to reload the grant tables.

    ```bash
    MariaDB [(none)]> FLUSH PRIVILEGES;
    ```

    Change the root password with below query.

    ```bash
    MariaDB [(none)]> ALTER USER 'root'@'localhost' IDENTIFIED BY '<new_password>';
    ```

    Replace `<new_password>` with your own password.

    Use the `exit` command to exit from MariaDB CLI.

    ```bash
    MariaDB [(none)]> exit;
    Bye
    ```

5. **Login to MariaDB Client With Root User**

    ```bash
    sudo mysql -u root -p
    ```

    Enter the password for the root user.

### Setting up Database and User

Let's create a new database and a user. We will be granting all privileges to the new user for the new database we have created.

1. **Create a Database**

    ```
    MariaDB [(none)]> CREATE DATABASE <database_name>
    ```

2. **Create a New User With Password**

    ```
    MariaDB [(none)]> CREATE USER '<new_username>'@'localhost' IDENTIFIED BY '<new_password>';
    ```

3. **Grant Privilege To New User Created**

    ```
    MariaDB [(none)]> GRANT ALL PRIVILEGES ON <database_name>.* TO '<new_username>'@'localhost';
    ```

4. **Flush The Privileges Table**

    ```
    MariaDB [(none)]> FLUSH PRIVILEGES;
    ```

5. Exit from mysql client using `exit` command.

6. **Login With New User**

    ```bash
    sudo mysql -u <new_username> -p
    ```

    Enter the password you used while creating the user.

7. **Verify User Can List The Database**

    ```
    MariaDB [(none)]> SHOW DATABASES;
    ```

That’s it! We will use this database and user in our application.

<hr>

## Setup your Node.js Application

1. **Clone Your Github Repository**

    ```bash
    git clone <your_github_repo_url>
    ```

2. **Navigate To Your Project Repository**

    ```bash
    cd <your_project_name>
    ```

3. **Install Project Dependencies**

    ```bash
    npm install
    ```

4. **Compile TypeScript Code**
    ```bash
    npm run build
    ```

{:.blockquote}

> Make sure you have configured the `outDir` property in your `tsconfig.json` file. This specifies the directory where the compiled JavaScript code will be generated. By default, it’s commonly set to `dist`, but you can customize it based on your project structure.

### Setting up environment variables (Optional)

If your project uses environment variables, you need to set them on your Raspberry Pi. You can create a `.env` file in the root directory of your project to store all the environment variables.

1. **Create `.env` File**

    ```bash
    touch .env
    ```

2. **Update `.env` File**

    ```bash
    sudo nano .env
    ```

3. **Enter your Environment Variables**

    ```
    PORT=5000
    DATABASE_URL="mysql://<username>:<password>@localhost:3306/<database_name>"
    ```

    Save the file by pressing `Ctrl+O`, then press `Enter`, and exit the editor using `Ctrl+X`.

### Migrate Prisma Schema

If you are using Prisma, all the schema files will be located inside the prisma/schema directory. We will now deploy these schemas to the database.

Run the below command

```bash
npx prisma migrate deploy
```

This command will use the `DATABASE_URL` provided in the `.env` file to deploy the schemas to the database. You can verify the deployment by logging into the MySQL client and using the command `SHOW TABLES;` to list all the tables.

<hr>

## Setting Up PM2

`PM2` is a production process manager for Node.js applications which helps in managing and keeping the application online. Install PM2 to manage your Node.js application.

```bash
npm install pm2 -g
```

<hr>

## Configuring NGINX

1. **Install NGINX**

    ```bash
    sudo apt install nginx
    ```

2. **Create a Site Configuration**

    ```bash
    sudo nano /etc/nginx/sites-available/<your_project_name>
    ```

3. **Add the Below Code**

    ```
    server {
        listen 80;
        server_name <your_raspberrypi_IP>;

        location / {
            proxy_pass http://localhost:YOUR_NODE_JS_PORT;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

    Here’s a breakdown of each part:

    **`listen 80;`** This directive tells NGINX to listen on port 80, which is the default port for HTTP traffic.

    **`server_name <your_raspberrypi_IP>;`** This specifies the domain name or IP address of your Raspberry Pi. Replace <your_raspberrypi_IP> with the actual IP address of your Raspberry Pi. NGINX will respond to requests sent to this address.

    **`location / { ... }`** This block defines how NGINX should handle requests to the root URL (/). Essentially, this tells NGINX that whenever a request is made to the root, it should be forwarded to the backend (your Node.js application) running on the specified port.

    **`proxy_pass http://localhost:YOUR_NODE_JS_PORT;`** This is the key line that forwards incoming requests to your Node.js application. Replace YOUR_NODE_JS_PORT with the actual port where your Node.js app is running (for example, 5000). The requests will be sent to the Node.js application running on the same machine (localhost).

    **`proxy_http_version 1.1;`** This sets the HTTP version to 1.1 for the proxy connection, which ensures better handling of certain features like WebSockets.

    **`proxy_set_header Upgrade $http_upgrade;`** This header allows WebSocket connections to be upgraded, which is important for real-time applications.

    **`proxy_set_header Connection 'upgrade';`** This header is used alongside the Upgrade header to manage WebSocket connections, ensuring that the connection is properly upgraded from HTTP to WebSocket.

    **`proxy_set_header Host $host;`** This passes the original Host header from the client request to the backend server. This is useful for applications that rely on the original Host header (e.g., for routing or virtual hosting).

    **`proxy_cache_bypass $http_upgrade;`** This ensures that WebSocket connections bypass any caching mechanisms, allowing real-time communication to work without interference from caching.

    Save the file by pressing `Ctrl+O`, then press `Enter`, and exit the editor using `Ctrl+X`.

4. **Enable the Site Configuration**

    ```bash
    sudo ln -s /etc/nginx/sites-available/<your_project_name> /etc/nginx/sites-enabled/
    ```

5. **Test NGINX Configuration**

    ```bash
    sudo nginx -t
    ```

    If the test is successfull, you will see something like below:

    ```
    nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
    nginx: configuration file /etc/nginx/nginx.conf test is successful
    ```

6. **Restart NGINX Server To Apply the Changes**

    ```bash
    sudo systemctl restart nginx
    ```

7. **Check NGINX Server Status**
    ```bash
    sudo systemctl status nginx
    ```

<hr>

## Running the Application

1. **Navigate to your project**

2. **Start Your Application Using PM2**

    If you have setup a script in `package.json`, use the below command:

    ```bash
    pm2 start "npm run start"
    ```

    Or, you can directly run you application using `index.js` file in your `dist` directory:

    ```bash
    pm2 start dist/index.js
    ```

    You can also check the logs using below command:

    ```bash
    pm2 logs
    ```

Now, check your app by entering the IP address of your Raspberry Pi in the browser on your local machine. It should work. Make sure both your local machine and Raspberry Pi are connected to the same network; otherwise, it will not work.

<hr>

## Exposing Your App To The World Using Ngrok

Now that you have deployed your app to the Raspberry Pi, you can only access the app from the same network in which the Raspberry Pi is running. To expose it to the internet, we need to use port forwarding.

You can set up port forwarding using your router settings, but in this case, I will be using ngrok. `Ngrok` is useful for development, allowing us to run our apps for testing purposes for free.

Make sure to create an account by visiting [https://dashboard.ngrok.com/login](https://dashboard.ngrok.com/login). You will need the auth token to configure ngrok on the Raspberry Pi.

1. **Install Ngrok**

    ```bash
    curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
    | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null \
    && echo "deb https://ngrok-agent.s3.amazonaws.com buster main" \
    | sudo tee /etc/apt/sources.list.d/ngrok.list \
    && sudo apt update \
    && sudo apt install ngrok
    ```

2. **Add your auth token to ngrok configuration file**

    ```bash
    ngrok config add-authtoken <your_auth_token>
    ```

3. **Disable default nginx config file**

    ```bash
    sudo rm /etc/nginx/sites-enabled/default
    ```

4. **Test NGINX configuration**

    ```bash
    sudo nginx -t
    ```

5. **Restart NGINX server to apply the changes**

    ```bash
    sudo systemctl restart nginx
    ```

6. **Deploy your app online**

    ```bash
    ngrok http 80
    ```

    This should provide a URL like `https://xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx.ngrok-free.app/` that forwards traffic to your Node.js app. You can navigate to this URL from any other network and access your application.

<hr>

### Summary

In this guide, we successfully deployed a TypeScript Node.js application with MySQL and Prisma on a Raspberry Pi. We configured NGINX as a reverse proxy and used Ngrok to make the application accessible over the internet. With this setup, you have your own cost-effective, self-hosted development server.

This approach is perfect for learning and experimenting with full-stack application deployment, all while gaining valuable experience in server management.

Let me know if you deploy your application using this guide—I’d love to hear about your experience! 🚀
