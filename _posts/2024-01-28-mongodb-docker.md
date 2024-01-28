---
layout: post
title: 'Setting Up MongoDB Using Docker and Docker Compose'
date: 2024-01-28 14:40:05 +0530
categories: docker mongodb
---

When it comes to integrating MongoDB into your project, you have several options available. **MongoDB Atlas** provides a convenient cloud-based database service, while installing MongoDB directly on your local machine is another viable option.

In this guide, we'll explore setting up a MongoDB database within a Docker container, leveraging the official MongoDB images hosted on [Docker Hub](https://hub.docker.com/r/mongodb/mongodb-community-server).

## Prerequisites

Before getting started, ensure you have `Docker Desktop` installed on your system. You can find the installation instructions for your operating system on the official docker [website](https://www.docker.com/products/docker-desktop/).

## Starting a MongoDB Container

To initiate a MongoDB server within a Docker container, open your terminal and execute the following command:

```bash
docker run --name mongodb -d -p 27017:27017 mongodb/mongodb-community-server:7.0.0-ubi8
```

This command will start a MongoDB server running version 7.0 in detached mode, allowing it to run as a background process (`-d` flag).

By specifying `-p 27017:27017`, we ensure that port **27017** on the container is mapped to port **27017** on the host system. Using this, you will be able to connect to your MongoDB instance on `mongodb://localhost:27017` from another application running locally.

Additionally, the `-name mongodb` flag assigns the name `mongodb` to the container for easy reference.

## Stoping and Removing a Container

Docker provides the `stop` and `remove` commands to halt and delete a container.

```bash
docker stop mongodb && docker rm mongodb
```

## Persisting Data with Docker

Data generated during the container's lifecycle is typically lost when the container is removed. To preserve data on your local machine, you can utilize Docker volumes. You can mount a volume using `-v` flag.

```bash
docker run --name mongodb -d -p 27017:27017 -v mongodata:/data/db mongodb/ mongodb-community-server:7.0.0-ubi8
```

This command mounts a volume named `mongodata` to store MongoDB data. Now, even if you stop and restart the container, your data will persist.

## Initializing MongoDB with a Root User

For enhanced security, MongoDB can be initialized with a root user using environment variables `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD`:

```bash
docker run --name mongodb -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=user -e MONGO_INITDB_ROOT_PASSWORD=pass -v mongodata:/data/db mongodb/ mongodb-community-server:7.0.0-ubi8
```

The `-e` flag is used to pass the environment variables to the container.

## Running MongoDB Container Using Docker Compose

To streamline the process of starting and stopping the container, Docker Compose offers a convenient solution.

Create a `docker-compose.yml` file and define your MongoDB server container as below:

```yaml
version: '3.9'

services:
    mongo_db:
        container_name: mongodb_container
        image: mongodb/mongodb-community-server:7.0.0-ubi8
        ports:
            - 27017:27017
        environment:
            - MONGO_INITDB_ROOT_USERNAME=user
            - MONGO_INITDB_ROOT_PASSWORD=pass
        volumes:
            - mongodata:/data/db

volumes:
    mongodata: {}
```

Now, execute the following command from the directory containing the `docker-compose.yml` file.

```bash
docker compose up -d
```

To stop the container, simply execute:

```bash
docker compose down
```

With MongoDB now set up and running, you're ready to leverage it locally to develop your applications.
