---
layout: post
title: Getting Started With Playwright
categories: tutorial playwright
permalink: '/setting-up-playwright'
---

# Setting Up Playwright

We will get started by setting up playwright using `npm` .

## Installing Playwright

```shell
npx init playwright@latest
```

This will install the latest version of playwright and other related packages. You can choose between TypeScript or JavaScript. Select all the configuration as default.

![Installing Playwright]({{site.baseurl}}/assets/images/installing_playwright.png 'Installing playwright in terminal.')

## Creating a simple playwright test

By default, when we install playwright, a `example.spec.ts` file is created under `tests` folder. Its contains some example tests.

We can also add a separate test like below:

```ts
import { test, expect } from '@playwright/test';

test('has page title', async ({ page }) => {
    // Navigate to webpage
    await page.goto('https://www.example.com');

    // Get the page title
    const pageTitle = page.locator('h1');

    // Assert page title
    await expect(pageTitle).toContainText('Example Domain');
});
```

## Running test in playwright

```shell
npx playwright test
```

This will run all the tests in all the browsers. By default, tests run in headless mode.

## Showing HTML Report

```shell
npx playwright show-report
```

This will automatically open the HTML report in our browser.

## Running test in headed mode

```shell
npx playwright test --headed
```

## Running tests on different browsers

```shell
npx playwright test --project firefox
```

This will run the test in `firefox`.  
Available named projects are: `chromium`, `firefox`, `webkit`.

We can also use the `--project` flag multiple times to run on multiple browsers.
