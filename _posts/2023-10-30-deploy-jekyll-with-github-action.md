---
layout: post
title: 'Deploying Jekyll Website On Github Pages With Github Actions'
date: 2023-10-30 13:19:05 +0530
categories: tutorial jekyll
---

You've built an amazing Jekyll website, and now you want to share it with the world using GitHub Pages. However, GitHub Pages operates in `safe` mode, which means it doesn't support custom plugins out of the box. But don't worry, we've got you covered! In this guide, we'll walk you through using GitHub Actions and the **`Jekyll Deploy Action`** to deploy your Jekyll site with custom plugins to GitHub Pages.

## Jekyll Deploy Action

The Jekyll Deploy Action simplifies the process of building and deploying your Jekyll site to GitHub Pages. It's a handy tool that ensures your custom plugins work seamlessly.

You can find the repository for the `Jekyll Deploy Action` [here](https://github.com/jeffreytse/jekyll-deploy-action).

## Prerequisites

Before setting up the GitHub Action workflow, let's make sure you have the prerequisites in place:

**Separate Branch:** Create a new branch, which we'll call gh-pages, separate from your main repository. We'll use this branch to deploy your site to GitHub Pages.

## Usage

Now, let's set up the GitHub Action workflow to automate your deployment. Follow these steps:

1. **Create a Workflow File:** Inside your repository's main branch, create a directory named ``.github/workflows`.

2. **Add Configuration:** In this directory, create a file named jekyll.yml. Paste the following code into this file:

    ```yaml
    name: Build and Deploy to Github Pages

    on:
    push:
        branches:
        - main  # Here source code branch is `main`, it could be other branch

    jobs:
    build_and_deploy:
        runs-on: ubuntu-latest
        steps:
        - uses: actions/checkout@v3

        # Use GitHub Actions' cache to cache dependencies on servers
        - uses: actions/cache@v3
            with:
            path: vendor/bundle
            key: ${{ runner.os }}-gems-${{ hashFiles('**/Gemfile.lock') }}
            restore-keys: |
                ${{ runner.os }}-gems-

        # Use GitHub Deploy Action to build and deploy to Github
        # For latest version: `jeffreytse/jekyll-deploy-action@master`
        - uses: jeffreytse/jekyll-deploy-action@v0.5.0
            with:
            provider: 'github'         # Default is github
            token: ${{ secrets.GITHUB_TOKEN }} # It's your Personal Access Token(PAT)
            ssh_private_key: ''        # It's your SSH private key (SSH approach)
            repository: ''             # Default is current repository
            branch: 'gh-pages'         # Default is gh-pages for github provider
            jekyll_src: './'           # Default is root directory
            jekyll_cfg: '_config.yml'  # Default is _config.yml
            jekyll_baseurl: ''         # Default is according to _config.yml
            bundler_ver: '>=0'         # Default is latest bundler version
            cname: ''                  # Default is to not use a cname
            actor: ''                  # Default is the GITHUB_ACTOR
            pre_build_commands: ''     # Installing additional dependencies (Arch Linux)
    ```

The code above is sourced from the [jekyll-deploy-action](https://github.com/jeffreytse/jekyll-deploy-action) repository for reference.

Now, whenever you push changes to the main branch, the GitHub Action workflow will automatically build your site and make it available on the `gh-pages` branch. You can then follow the same steps you did previously to deploy your website to GitHub Pages.

That's it! Your website is now deployed with custom plugins, and you're ready to celebrate your success. 🎉

Happy coding!
