---
layout: post
title: 'Backup and Restore MongoDB Database in Docker Container'
date: 2024-02-18 12:40:05 +0530
permalink: '/mongodb-dump-restore-docker'
categories: docker mongodb
---

Developing projects locally often involves setting up a local database using Docker containers. However, transitioning to a different machine can pose challenges, especially when migrating data. In this guide, we'll explore how to efficiently backup and restore MongoDB databases within Docker containers using command-line utilities provided by MongoDB.

## Prerequisites

Before proceeding, ensure Docker is installed on your local machine and MongoDB is set up within a Docker container. If you need assistance with setting up MongoDB with Docker, you can refer to this comprehensive [guide](/mongodb-docker).

## Creating Backup

`mongodump` is used to create a binary dump of the contents of a MongoDB instance.

**For Unauthenticated Database**

If your MongoDB container doesn't require authentication, you can create a backup using the following command:. Make sure your MongoDB container is running.

```sh
# No Authentication
docker exec <mongo_container> sh -c 'mongodump --archive' > db.dump
```

Here `<mongo_container>` should be replaced with the actual name or ID of your MongoDB container. This will create a file named `db.dump` in your current directory.

`sh -c 'mongodump --archive'` This part of the command is executed inside the container. `--archive` option is used to export the data in a compact binary format.

**For Authenticated Database**

For containers with authentication enabled, use the command below:

```sh
# Authenticated
docker exec <mongo_container> sh -c 'mongodump --authenticationDatabase admin -u <user> -p <password> --db <database> --archive' > db.dump
```

Replace `<user>`, `<password>`, and `<database>` with your credentials and database name respectively. This command ensures authentication while creating the backup.

## Restoring Data

`mongorestore` is used to restore data from a binary dump created by `mongodump`.

To restore the data, first create a MongoDB container in your other local machine and start the container. (You can follow the same [guide](/mongodb-docker) here)

**For Unauthenticated Database**

To restore data to an unauthenticated database, execute the following command from the directory which contains `db.dump` file:

```sh
# No Authentication
docker exec -i <mongo_container> sh -c 'mongorestore --archive' < db.dump
```

Here, `<mongo_container>` should be replaced with the name or ID of your MongoDB container. The `-i` flag ensures input from the `db.dump` file is processed.

**For Authenticated Database**

Use the below command for authenticated database:

```sh
# Authenticated
docker exec <mongo_container> sh -c 'mongorestore --authenticationDatabase admin -u <user> -p <password> --db <database> --archive' < db.dump
```

Replace `<user>`, `<password>`, and `<database>` with your credentials and database name respectively. This command restores data while ensuring proper authentication.

## Summary

This guide demonstrates how to streamline the backup and restoration process for MongoDB databases within Docker containers. By utilizing the `mongodump` and `mongorestore` utilities, developers can efficiently migrate database instances across different local machines while preserving data integrity.
