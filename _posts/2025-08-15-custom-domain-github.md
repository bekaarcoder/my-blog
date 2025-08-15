---
layout: post
title: How to Host Multiple Sites Under One Domain Using GitHub Pages and Subdomains
description: Step-by-step guide to hosting your main site and multiple subdomains using GitHub Pages, with a custom domain.
date: 2025-08-15 09:40:05 +0530
permalink: '/github-pages-subdomains-setup'
categories: githubpages subdomains hosting
cover_image: '/assets/images/cover_image_2025-08-15.png'
image: '/assets/images/cover_image_2025-08-15.png'
---

If you own a custom domain, you can serve multiple sites from it — one on the main domain and others on subdomains — using GitHub Pages for free.

In this guide, I’ll show you how did I set up my portfolio on [shashank.im](https://shashank.im) and my blog on [blog.shashank.im](https://blog.shashank.im), both hosted on different GitHub repositories.

{:.blockquote}

> Wherever I’ve used `shashank.im` or `blog.shashank.im` in this guide, replace them with your own custom domain and subdomains.

<hr>

## Why Use Subdomains?

Subdomains let you keep different projects separated but still under your main brand. For example:

```
shashank.im             → Portfolio
blog.shashank.im        → Blog
projects.shashank.im    → Side Projects
resume.shashank.im      → Interactive Resume
```

Each subdomain can have its own GitHub Pages site, making it easy to maintain and update independently.

<hr>

## Step 1 — Set Up DNS Records

Log into your domain registrar (the place where you bought your domain) and edit the DNS settings.

#### For the root domain (shashank.im)

Add four `A` records pointing to GitHub Pages IP addresses:

```
A   @   185.199.108.153
A   @   185.199.109.153
A   @   185.199.110.153
A   @   185.199.111.153
```

#### For the blog subdomain (blog.shashank.im)

Add a CNAME record:

```
CNAME   blog   <your-github-username>.github.io
```

Replace `<your-github-username>` with your GitHub username.

(Optional) If you want www.shashank.im to work:

```
CNAME   www   <your-github-username>.github.io
```

<hr>

## Step 2 — Configure GitHub Pages for Each Site

#### Portfolio Repository

1. On your Github repository, Go to Settings → Pages.
2. Set the source branch (usually main).
3. Enter `shashank.im` as the custom domain.
4. Create a file named CNAME in the repo root containing:
    ```
    shashank.im
    ```
5. Enable `Enforce HTTPS`.

#### Blog Repository

1. Go to Settings → Pages.
2. Set the source branch.
3. Enter `blog.shashank.im` as the custom domain.
4. Create a file named CNAME in the repo root containing:
    ```
    blog.shashank.im
    ```
5. Enable `Enforce HTTPS`.

<hr>

## Step 3 — Verify the Setup

After DNS changes propagate (usually within an hour but can take up to 24 hours):

1. Visit `shashank.im` → Portfolio loads.

2. Visit `blog.shashank.im` → Blog loads.

<hr>

## Managing Multiple Subdomains

If you plan to add more:

-   Create one repo per subdomain.
-   Add a matching CNAME record in DNS.
-   Set the same custom domain in repo settings.
-   Add a CNAME file to the repo.

There’s no strict technical limit to subdomains — you can add as many as your DNS provider allows.

<hr>

## Summary

By following this guide, you’ve successfully linked your portfolio and blog under a single domain name, both secured with HTTPS and managed easily through GitHub Pages.
Now you can grow your personal brand under one domain, hosting multiple sites for free with GitHub Pages.
