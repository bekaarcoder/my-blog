---
layout: post
title: 'Getting Started with Jekyll'
date: 2023-10-24 13:13:05 +0530
permalink: '/getting-started'
categories: [tutorial, jekyll]
---

If you're looking for a simple and powerful way to create a blog, Jekyll might be the perfect solution. Jekyll is a static site generator that's known for its flexibility, ease of use, and a vibrant community. In this post, we'll walk you through the process of creating your first blog post with Jekyll using Markdown.

## Prerequisites

Before we get started, make sure you have Jekyll installed on your computer. You can follow the official installation guide [here](https://jekyllrb.com/docs/installation/).
<br>

## Step 1: Create a New Jekyll Site

Assuming you have Jekyll installed, let's start by creating a new Jekyll site. Open your terminal and run the following command:

```shell
jekyll new my-blog
```

This command will generate a new Jekyll site in a folder named "my-blog." You can replace "my-blog" with your desired folder name.

## Step 2: Navigate to Your Blog Folder

Once the site is generated, navigate to the blog folder:

```shell
cd my-blog
```

## Step 3: Create a New Blog Post

Now, let's create your first blog post. Jekyll uses Markdown for writing content, which is an easy-to-learn and lightweight markup language. To create a new blog post, open your favorite text editor and create a file in the "\_posts" folder with the following naming convention:

`YEAR-MONTH-DAY-title.md`

For example:

`2023-10-23-my-first-blog-post.md`

You can add the necessary front matter at the top of the file, like this:

```markdown
---
layout: post
title: 'My First Blog Post'
date: 2023-10-23
---
```

Then, below the front matter, you can start writing your blog post content using Markdown syntax.

## Step 4: Write Your Content

Now, let your creativity flow and start writing your blog post using Markdown. Here's an example of some Markdown content:

```markdown
# Welcome to My Blog

This is my first blog post using Jekyll, and I'm excited to share my thoughts with you!

## Getting Started

To get started with Jekyll, you need to install it and create a new site, as we did earlier.

## Writing in Markdown

Markdown is a simple way to format your content. You can create headers, lists, links, and more. Here's a list of some common Markdown elements:

-   **Headers** are created using hashtags: `# Header 1`, `## Header 2`.
-   **Lists** are made with dashes: `- Item 1`, `- Item 2`.
-   **Links** are created using square brackets and parentheses: `[Link Text](http://example.com)`.

## Conclusion

Jekyll is a fantastic platform for bloggers who prefer simplicity and customization. With Markdown, you can easily create and format your content.

Happy blogging!
```

<br>

## Step 5: Preview Your Blog

To see how your blog post will look, run the following command in your terminal:

```shell
jekyll serve
```

This will start a local development server. Open your web browser and go to http://localhost:4000 to preview your blog.

Congratulations! You've just created your first blog post with Jekyll.

This is just the beginning of your journey in the world of Jekyll and blogging. You can further customize your site, install themes, and explore Jekyll's vast ecosystem to enhance your blog.
