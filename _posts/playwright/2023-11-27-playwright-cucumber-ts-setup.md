---
layout: post
title: 'Setting Up Playwright with Cucumber and TypeScript'
date: 2023-11-27 12:40:05 +0530
categories: playwright cucumber typescript
---

## Introduction

Playwright, coupled with Cucumber and TypeScript, offers a robust framework for end-to-end testing of web applications. This blog post guides you through the setup process, ensuring a seamless integration of these technologies.

## Prerequisites

Before diving into the installation, make sure you have the following prerequisites installed in place:

1. NodeJS and npm
2. VS Code

## Installation

1. **Create a Playwright project**

    Install playwright by running the below command:  
    `npm init playwright@latest`  
    Select the settings as below:  
    <img src='/assets/images/playwright_setup.png' alt='Gitlab CI Pipeline' style='width:100%' />

    You can also create a playwright project using the VS Code Extension. Search for the `Playwright Test for VSCode` plugin in VS Code and install it.

2. **Setup Cucumber**

    - Install Cucumber plugin for VS Code.
    - Install below dependencies:
      `npm i @cucumber/cucumber -D`  
       `npm i ts-node -D`

    We will be installing `ts-node` as we will be using TypeScript in our project. This will allow us to run TypeScript files directly without compiling then to JavaScript first.

3. **Project Cleanup**

    After installing playwright, remove the below files and folders:

    ```lua
    tests/example.spec.ts
    tests-examples/demo-todo-app.spec.ts
    playwright.config.ts
    ```

## Project Structure

Once we have setup playwright and installed related dependencies, we will setup the basic project structure.  
Create the directory as following:

```
project-root
|-- src
|   `-- test
|       `-- features
|       `-- steps
```

We will put all out feature files inside the `features` directory and all the step definitions inside the `steps` directory.

## Feature File

Lets create a simple feature file for login scenario. Create a file `login.feature` inside the `features` directory.

```gherkin
#login.feature
Feature: User Authentication Tests

  Background:
    Given User navigates to the application
    When User click on the login link

  Scenario: Login should be successful
    When User enters the username as "janedoee"
    And User enters the password as "Password@123"
    And User clicks on the login button
    Then User is logged in successfully
```

## Cucumber Configuration

We can define all the configuration for cucumber in a file. Create a file `cucumber.json` in the root of your project.

```json
//cucumber.json
{
    "default": {
        "formatOptions": {
            "snippetInterface": "async-await"
        },
        "paths": ["src/test/features/"],
        "require": ["src/test/steps/*.ts"],
        "dryRun": true
    }
}
```

Here we have created a `default` profile and mentioned the `path` where the feature files are present.  
We have set `dryRun` as true which will prepare a test run but don't run the test.  
In the `formatOptions`, we have set `snippetInterface` as `async-await`. This will generate the functions in the code snippet as async-await.  
`require` is set to path where the step definitions files are present.

## Setup npm scripts

Add the below scripts in the `package.json` file to execute the cucumber tests.

```json
//package.json
...
"scripts": {
    "test": "cucumber-js test"
}
...
```

## Dry Run Tests

Lets run the test with the following command: `npm run test`  
As we have not created out step definition file, this will generate failures in the terminal with code snippets for all the undefined steps in the feature file.

```bash
> playwright-ts-setup@1.0.0 test
> cucumber-js test

UUUUUU

Failures:

1) Scenario: Login should be successful # src/test/features/login.feature:7
   ? Given User navigates to the application
       Undefined. Implement with the following snippet:

         Given('User navigates to the application', async function () {
           // Write code here that turns the phrase above into concrete actions
           return 'pending';
         });
...
```

## Create Step Definitions

Create `loginSteps.ts` inside the `steps` directory. Copy all the code snippets generated for the undefined steps in the terminal to `loginSteps.ts` file.

```javascript
//loginSteps.ts

import { Given, When, Then } from '@cucumber/cucumber';

Given('User navigates to the application', async function () {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
});

When('User click on the login link', async function () {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
});

When('User enters the username as {string}', async function (string) {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
});

When('User enters the password as {string}', async function (string) {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
});

When('User clicks on the login button', async function () {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
});

Then('User is logged in successfully', async function () {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
});
```

## Running Tests

Lets run the test again with `npm run test`.

We will encounter the below error:
`SyntaxError: Cannot use import statement outside a module`

To resolve this we need to add another property in the `cucumber.js` configuration file

```json
//cucumber.json
{
    "default": {
        ...
        "requireModule": ["ts-node/register"],
        ...
    }
}
```

Now rerun the test `npm run test`.
You will see the test has run successfully and all the steps have skipped.

```bash
> playwright-ts-setup@1.0.0 test
> cucumber-js test

------

1 scenario (1 skipped)
6 steps (6 skipped)
0m00.007s (executing steps: 0m00.000s)
```

## Configure Steps Mapping

If you see that even though you have implemented the step definitions for all the steps in the feature file but they are not mapped to the step definition, you can update the cucumber settings in the VSCode.
Navigate to settings in VSCode and open the `settings.json` file. Update the below settings:

```json
//settings.json of VSCode
...
"cucumber.features": [
    "src/test/features/*.feature",
    ...
],
"cucumber.glue": [
    "src/test/steps/*.ts",
    ...
]
...
```

<hr>

By following these steps, you've successfully set up Playwright with Cucumber and TypeScript for effective end-to-end testing of your web applications.
