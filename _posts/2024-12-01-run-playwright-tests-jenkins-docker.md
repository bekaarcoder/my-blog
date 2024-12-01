---
layout: post
title: Running Playwright Tests in Jenkins Pipeline Using Docker
date: 2024-12-01 12:40:05 +0530
permalink: '/running-playwright-tests-in-jenkins-using-docker'
categories: docker jenkins playwright
---

Automation testing has become an integral part of modern software development, and tools like Playwright have made it seamless to perform end-to-end testing. However, executing these tests in a continuous integration pipeline can be challenging without proper setup. In this guide, we will go through the steps to run Playwright tests in a Jenkins pipeline using Docker, ensuring an efficient and scalable testing process. By the end of this post, you’ll have a clear understanding of setting up Jenkins with Docker, connecting agent nodes, and creating pipelines to build and run tests.

## Prerequisites

Before starting, ensure you have the following:

-   `Docker Desktop` installed on your local machine.
-   `Docker Hub` account created for managing Docker images.

## Jenkins Controller/Agent Architecture

Before starting, let us look at the architecture. Jenkins `Controller/Agent Architecture` allows distributed builds, where tasks are delegated to agents for execution. This architecture improves scalability and resource utilization.

<img src='/assets/images/jenkins_architecture.png' alt='Jenkins Architecture' style='width:100%' />

**Controller Node**

-   Controller is the central component of the Jenkins architecture.
-   It handles:
    1. **Job scheduling:** Assigns tasks to agent nodes.
    2. **User interface:** Provides a web-based UI (port 8080) for users to interact with Jenkins.
    3. **Job configuration:** Allows users to define build pipelines and workflows.
    4. **Result aggregation:** Collects and displays build/test results.
-   It is not recommended to execute builds directly in the controller.

**Agent Node**

-   The agents are distributed machines responsible for executing Jenkins jobs.
-   These nodes are connected to the master via the Jenkins Remoting protocol over port 50000.
-   They can execute builds or tests depending on the tasks assigned by the master.
-   Agents must have the necessary tools installed based on the jobs they run.

**Communication Flow**

1. User interact with the Controller.
2. Controller delegates the tasks to Agents.
3. Agents execute the tasks.
4. Results are sent back to the Controller

## Setting Up Jenkins Using Docker

### Docker Compose Setup for Jenkins

To set up Jenkins using Docker, create a docker-compose.yml file. Organize your directory as follows:

```
jenkins-docker/
├── docker-compose.yml
└── volumes/
    ├── master/
    └── node/
```

Here’s the docker-compose.yml file:

```yaml
services:
    jenkins:
        image: jenkins/jenkins:lts-jdk17
        user: root
        ports:
            - 8080:8080
            - 50000:50000
        volumes:
            - ./volumes/master:/var/jenkins_home
        environment:
            - JAVA_OPTS="-Dhudson.model.DirectoryBrowserSupport.CSP="
```

**Explanation**

1. `jenkins`: Define service which will be created by Docker Compose.

2. `jenkins/jenkins:lts-jdk17`: Docker image to create the container

3. `user`: We have specified user as `root` to run the container with root privileges. This is necessary for certain administrative tasks (like installing plugins, setting permissions, or managing files)

4. `ports` will map the ports on the host to the container. `8080:8080` maps the Jenkins web UI. `50000:50000` maps the port used for Jenkins agent communication

5. `volumes`: Mounts a host directory (./volumes/master) to the container's Jenkins home directory (/var/jenkins_home). This will persist Jenkins data even if the container is deleted.

6. `JAVA_OPTS`: Configure JVM options for Jenkins.

7. `-Dhudson.model.DirectoryBrowserSupport.CSP=`: Disables Jenkins Content Security Policy. Although not recommended in production, but useful for embedding resources like images or styles in Jenkins view.

### Running Docker Compose

To start Jenkins, run:

```bash
docker-compose up
```

Once Jenkins service has started, you can acces Jenkins at `http://localhost:8080` on your host machine.

### Setting Up Jenkins Web Interface

1. Navigate to http://localhost:8080 in your browser.
2. Use the administrator password from the terminal (output during docker-compose up).
3. Install suggested plugins.
4. Create the first admin user and complete the setup wizard.

<!-- ![](jenkins_password.png) -->
<img src='/assets/images/jenkins_credentials.png' alt='Jenkins Credentials' style='width:100%' />

Once complete, the Jenkins files will be available in the `volumes/master` directory.

### Connecting An Agent Node

Follow these steps to connect an agent:

1. On the Jenkins homepage, click on `Set up an agent`
2. Enter `NODE1` as the node name, select `Permanent Agent`, and configure the Remote root directory with the path to the node directory on your host.
3. Leave other fields to default and click on Save.

Now you will see a new node `NODE1` is created which will be displayed with the Built-in Node.

Click on the `NODE1` and you will see the instructions to run the agent.

Navigate to `node` directory in your local machine from the terminal and run the commands provided by Jenkins to connect the node.

**Tip:** _Set the number of executors for the Built-in Node to 0 to ensure jobs only run on connected agents._

1. Navigate to `Built-in Node` > `Configure`
2. Set `Number of executers` to 0 and click on Save.

## Running Playwright Test With Jenkins

You can use the [Playwright Cucumber Framework](https://github.com/bekaarcoder/playwright-bdd-ts) or your own Playwright project. For this guide, we will use Docker to build the test environment and Jenkins to execute the tests.

{:.blockquote}

> This framework is built using Playwright and Cucumber. Instead of using the default Playwright command to execute tests, a custom `index.ts` file has been created to run the tests using the Cucumber runner.
>
> To execute the tests, run the command `npm run cucumber <tag_name>`
>
> Predefined tags, such as `smoke`, `regression`, etc., are specified in the `index.ts` file. Replace `<tag_name>` with one of these predefined values to run the corresponding test suite.

We need to install below plugins inside Jenkins:

-   Docker
-   Docker Pipeline

To install the plugins,

1. Navigate to `Manage Jenkins` > `Plugins` > `Available Plugins`
2. Search for the above plugins and install
3. Once installed, restart jenkins

To run jenkins again, run `docker-compose up` again.

### Creating a Dockerfile for Playwright

Create a `Dockerfile` in your project:

```Dockerfile
FROM mcr.microsoft.com/playwright:v1.48.2-noble

WORKDIR /app
COPY . /app

RUN npm install

ENTRYPOINT ["sh", "-c", "npm run cucumber ${TEST_TARGET}"]
```

**Explanation**

**Base Image**
`FROM mcr.microsoft.com/playwright:v1.48.2-noble` uses Playwright docker image to build our docker image.

**Set Working Directory**
`WORKDIR /app` sets the working directory inside the container to `/app`. All subsequent commands and operations (e.g., COPY, RUN) will be executed relative to this directory.

**Copy Files**
`COPY . /app` Copies the contents of the current directory (on the host) into the container’s /app directory.

**Install Dependencies**
`RUN npm install` Installs Node.js dependencies from the package.json file.

**Entry Point**
`ENTRYPOINT` Defines the command to execute when the container starts.

### Setting Up Docker Hub Credentials In Jenkins

1. Navigate to `Manage Jenkins` > `Credentials`
2. Click on `(global)` under Domains column.
3. Select Kind as `Username with password`
4. Enter username and password of Docker Hub.
5. Enter ID (e.g., dockerhub-creds. This same id will be used to fetch username and password in the Jenkinsfile).
6. Click Create.

### Jenkins Pipeline for Building Docker Image

Create a `Jenkinsfile` in your project:

```
pipeline {
    agent any

    stages {
        stage('Build Image') {
            steps {
                sh "docker build -t=<username>/playwright:latest ."
            }
        }

        stage('Push Image') {
            environment {
                DOCKER_HUB = credentials('dockerhub-creds')
            }
            steps {
                sh 'echo ${DOCKER_HUB_PSW} | docker login -u ${DOCKER_HUB_USR} --password-stdin'
                sh "docker push <username>/playwright:latest"
                sh "docker tag <username>/playwright:latest <username>/playwright:${env.BUILD_NUMBER}"
                sh "docker push <username>/playwright:${env.BUILD_NUMBER}"
            }
        }
    }

    post {
        always {
            sh "docker logout"
            sh "docker system prune -f"
        }
    }
}
```

**Explanation**

**Agents**

`agent any`

-   Specifies that the pipeline can run on any available Jenkins agent.

**Stages**

The pipeline has two primary stages:

`stage('Build Image')`

-   Builds a docker image from the Dockerfile in the current directory (.).
-   Tags the image as `<username>/playwright:latest`.

{:.blockquote}

> **Note: ** `<username>` refers to your Docker Hub username. Replace `<username>` with your actual Docker Hub username wherever it is mentioned.

`stage('Push Image')`

-   Uses Jenkins credentials (dockerhub-creds) for authenticating with Docker Hub.
    -   ${DOCKER_HUB_USR}: The Docker Hub username.
    -   ${DOCKER_HUB_PSW}: The Docker Hub password.
-   `docker push <username>/playwright:latest` pushes the latest version of the Docker image to Docker Hub
-   `docker tag <username>/playwright:latest <username>/playwright:${env.BUILD_NUMBER}` tags the image with the jenkins build number (e.g., 1, 2, etc.)
-   `docker push <username>/playwright:${env.BUILD_NUMBER}` pushed the versioned image to Docker Hub

**Post**

`post`

-   `docker logout` logs out from Docker Hub
-   `docker system prune -f` cleans up unused docker data

### Building a Docker Image in Jenkins pipeline

**Create a New Pipeline**

1. Navigate to the Jenkins homepage and click on New Item.
2. Enter an Item Name (e.g., Playwright-Docker-Build) and select `Pipeline` and click OK.
3. Under Pipeline Definition, select `Pipeline script from SCM`.
4. Select SCM to `git`.
5. Provide the Repository URL. (_For private repositories, set up credentials for GitHub in Jenkins and select the credentials here._)
6. Specify `Branch Specifier` for your repository. (e.g., `*/main`)
7. Under Additional Behaviours, choose `Clean before checkout`.
8. Set Script Path as `Jenkinsfile` (ensure the Jenkinsfile is located in the root directory of your repository).
9. Click on Save

**Build the Image**

-   Click on `Build Now`.
-   Once the build is successful, verify your Docker Hub repository. A Docker image with the name <username>/playwright:latest should be pushed to your Docker Hub.

### Setting Up Jenkins Pipeline for Running Tests

For running our tests, we will be creating a separate jenkins pipeline. Create another directory for running tests (e.g., playwright-runner) and include Jenkinsfile and Docker Compose file.

In the root directory, create a `docker-compose.yml` file:

```yaml
services:
    playwright-test:
        image: <username>/playwright
        environment:
            - TEST_TARGET
            - BROWSER_CHOICE
        volumes:
            - ./reports:/app/reports
```

**Explanation**

**Services**

-   `playwright-test`: defines the service

**Image**

-   `image`: We will be using the prebuild image `<username>/playwright` which contains the Playwright test environment.

**Environment Variables**

-   `environment`: Passes enviroment variables to the container.
-   `TEST_TARGET`: This will be used to pass the specific tags to run the test.
-   `BROWSER_CHOICE`: This will be used to pass the specific browser.

**Volumes**
`volumes`: Mounts `./reports` directory on host to `/app/reports` directory on container.

In the same directory, create a `Jenkinsfile` file:

```
pipeline {
    agent any

    parameters {
        choice choices: ['login', 'smoke', 'regression', 'faker'], name: 'TEST_TARGET'
        choice choices: ['chromium', 'firefox'], name: 'BROWSER_CHOICE'
    }

    stages {

        stage('Run Test') {
            steps {
                sh "docker-compose up --pull=always"
                script {
                    def rerunExists = sh(script: '[ -f reports/rerun.txt ] && [ -s reports/rerun.txt ]', returnStatus: true) == 0
                    if(rerunExists) {
                        error("Some tests failed.")
                    }
                }
            }
        }
    }

    post {
        always {
            sh "docker-compose down"
            archiveArtifacts artifacts: 'reports/*.html, reports/*.json', followSymlinks: false
        }
    }
}
```

**Explanation**

**Agent**

-   `agent any`: Run pipeline on any available agent.

**Parameters**

-   `parameters`: Allows users to provide input when triggering the pipeline.

**Stages**

-   `stage('Run Test')`: Defines the stage for the pipeline.
-   `docker-compose up --pull=always`: Launches the Dockerized testing environment defined in the docker-compose.yml file pulling the latest image.
-   `script`: Uses a shell script to check if the reports/rerun.txt file exists and is non-empty. If its not, the pipeline fails with an error.

**Post**

-   `always`: Defines actions that are always executed regardless of the pipeline's success or failure.
-   `docker-compose down`: Shuts down the Docker containers and cleans up any associated resources.
-   `archiveArtifacts artifacts`: Collects test reports (e.g., HTML and JSON files) from the reports directory and stores them in Jenkins as build artifacts.

Now setup a github repository and push the code.

### Running Tests in Jenkins

**Create New Pipeline**

1. Go to the Jenkins homepage and click on New Item.
2. Enter an Item Name (e.g., Playwright-Docker-Runner) and select `Pipeline` and click OK.
3. Under Pipeline Definition, select `Pipeline script from SCM`.
4. Select SCM as `git`.
5. Provide the Repository URL for `playwright-runner`. (_For private repositories, set up credentials for GitHub in Jenkins and select the credentials here._)
6. Specify the `Branch Specifier` for your repository (e.g., `*/main`).
7. Under Additional Behaviours, choose `Clean before checkout`.
8. Set Script Path to `Jenkinsfile`. (_ensure the Jenkinsfile is located in the root directory of your repository_)
9. Click Save to create the pipeline.

**Run Pipeline**

Click Build Now.

**Note:** _The first build will run with the default parameters specified in the Jenkinsfile, as you will not be provided with parameter choices initially._

**Run with Parameters**

-   After the initial pipeline execution, navigate back to your created pipeline (Playwright-Docker-Runner).
-   Click Build with Parameters.
-   Select the desired parameters and run the pipeline. This will execute all tests based on the provided parameters.

**View Build Artifacts**

Once the pipeline is executed, you can check the build artifacts attached to the pipeline job.

<hr>

## Conclusion

This guide has covered the complete setup to run Playwright tests in a Jenkins pipeline using Docker. From configuring Jenkins with Docker to creating pipelines for building and running tests, each step ensures a streamlined and scalable testing process. Using this setup, you can integrate your Playwright tests seamlessly into your CI/CD pipeline and maintain a robust testing environment.
