---
layout: post
title: 'Running Playwright Tests in Gitlab CI'
date: 2023-11-07 22:40:05 +0530
permalink: '/running-playwright-test-gitlabci'
categories: playwright gitlab
---

In this guide, we will setup and run Playwright automation tests in Gitlab CI. We will also publish the HTML report in the Gitlab CI pipeline.

## Prerequisites

To setup Gitlab CI for playwright test automation, we need the following:

-   Gitlab account
-   Gitlab repository for the project
-   Playwright test automation suite setup for the project.

To get started, you can follow this [guide](/setting-up-playwright) to create a basic playwright project.

## Setup Gitlab CI Pipeline

To setup the Gitlab CI pipeline, create a `.gitlab-ci.yml` file in the root of the project.

Paste the following code into this file.

```yaml
stages:
    - test

e2e tests:
    stage: test
    image: mcr.microsoft.com/playwright:v1.39.0-jammy
    script:
        - npm ci
        - npm run test:e2e
    artifacts:
        when: always
        paths:
            - playwright-report/
            - test-results/
```

We have defined a single stage called `test` and a single job called `e2e tests`.  
We are using the latest version of Playwright docker image `mcr.microsoft.com/playwright:v1.39.0-jammy`.  
In the `script` section, we are running two commands:

-   `npm ci` - This will install all the dependencies of the project.
-   `npm run test:e2e` - This will run all the tests.

{:.blockquote}

> As I have created a separate script in the package.json file for running the tests, so I am using `npm run test:e2e`.  
> You can also replace the second command with `npx playwright test` if you want to use the default playwright configuration file `playwright.config.ts`.

To publish the HTML report in the Gitlab CI, we have added the `artifacts` section in the `.gitlab-ci.yml` file.  
If you check inside the `playwright.config.ts`, you will find the following settings:

```javascript
reporter: 'html',
```

This means an HTML report is getting generated for the tests. The reports and test results are generated in the folder `playwright-report` and `test-results`. So we have provided the `paths` in the `artifacts`. This will save the test reports in Gitlab CI after the tests are executed in the pipeline.

## Running Tests On Gitlab CI

Once you have added the `.gitlab-ci.yml` file, commit and push the changes to your repository. When you push the changes, Gitlab CI will automatically run the job in the pipeline.

<img src='/assets/images/playwright-gitlab-ci.png' alt='Gitlab CI Pipeline' style='width:100%' />
<!-- ![Gitlab CI Pipeline](/assets/images/playwright-gitlab-ci.png) -->

To see the HTML report, you can download or browse the artifacts and open the `index.html` file inside the folder `playwright-report`. You will see the similar report as per the below screenshot.

<img src='/assets/images/gitlab-ci-artifact.png' alt='Playwright automation tests HTML report' style='width:100%' />
<!-- ![Gitlab CI Artifact](/assets/images/gitlab-ci-artifact.png 'Playwright Automation Tests HTML Report') -->
