---
layout: post
title: 'Deploying Jekyll Website On Github Pages'
date: 2023-10-25 23:40:05 +0530
categories: tutorial
---

GitHub Pages is a free hosting service provided by GitHub, allowing us to host our static websites directly from our GitHub repositories. In this guide, we will go through the process of deploying a Jekyll website to GitHub Pages, enabling us to share our project with the world.

## Prerequisites

Before we get started, make sure to have the following in place:

**GitHub Account:** We'll need a GitHub account to host our website.

**Jekyll Website:** Ensure to have a Jekyll website ready for deployment. If you haven't created one yet, follow the official Jekyll documentation or this [guide](https://bekaarcoder.github.io/my-blog/getting-started) to get started.

**Git Installed:** We'll need Git installed on our computer to manage our Git repositories. Download it from https://git-scm.com/ and follow the installation instructions.

## Step 1: Create a GitHub Repository

1. Log in to your GitHub account.

2. Click on the '+' icon in the top right corner and select "New Repository."

3. Name the repository in the format: `<username>.github.io`, where `<username>` is our GitHub username. This naming convention is essential for GitHub Pages to work.

4. Choose the repository visibility and click "Create repository."

## Step 2: Clone GitHub Repository

1. Open terminal or command prompt.

2. Clone GitHub repository to the local machine using the following command:

    ```bash
    git clone https://github.com/<username>/<username>.github.io
    ```

    Replace `username` with actual GitHub username.

## Step 3: Deploy Your Jekyll Website

1. Navigate to the root directory of Jekyll project using the terminal or command prompt.

2. Build your Jekyll website by running the following command:

    ```bash
    jekyll build
    ```

    This will generate the static files for your website in the \_site directory.

3. Copy the generated files from the \_site directory to your local GitHub Pages repository:

    ```bash
    cp -r _site/* /path/to/your/username.github.io/repository
    ```

    Replace /path/to/your/username.github.io/repository with the actual path to your cloned GitHub Pages repository.

4. Commit and push your changes to GitHub:
    ```bash
    cd /path/to/your/username.github.io/repository
    git add .
    git commit -m "Initial website deployment"
    git push
    ```

## Step 4: Verify Your Deployment

1. Visit https://yourusername.github.io in your web browser (replace yourusername with your actual GitHub username).

2. If everything was done correctly, you should see your Jekyll website live on GitHub Pages.

## Step 5: Keep Your Site Updated

Now that your Jekyll website is live on GitHub Pages, you can continue developing your site locally. Whenever you make changes, remember to rebuild your site and push the updates to your GitHub Pages repository to keep your website up to date.

## Conclusion

Deploying a Jekyll website to GitHub Pages is a straightforward process that allows you to share your static site with the world. With your site hosted on GitHub Pages, you can take advantage of free hosting and version control, making it easy to maintain and update your website. Get creative and start building your web presence today!
