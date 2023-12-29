---
layout: post
title: 'Adding Search Functionality To Jekyll Website'
date: 2023-12-29 14:40:05 +0530
categories: jekyll
---

Jekyll, a popular static site generator, simplifies the process of creating and maintaining websites. However, one common feature that is often missing from basic Jekyll setups is a search functionality. In this blog post, we'll explore how to seamlessly integrate a search feature into your Jekyll website to enhance user experience and make content discovery more efficient.

Several plugins and services can add search functionality to your Jekyll site. Here are a few options:

1. **Simple-Jekyll-Search:** A lightweight, client-side search plugin that requires no server-side processing. It's easy to set up and works well for small to medium-sized sites.

2. **Lunr.js:** A client-side search engine that indexes content and performs searches on the client side. It's suitable for smaller sites without complex search requirements.

3. **Algolia:** A robust, hosted search engine service that provides advanced features like typo-tolerance and faceted search. Integration with Algolia involves more steps but offers a superior search experience.

{:.blockquote}

> Here we will be using **Simple-Jekyll-Search** as its lightweight and easy to implement.

## Step 1 - Add search plugin to your site

Download the `simple-jekyll-search.min.js` script from the [repository](https://github.com/christian-fei/Simple-Jekyll-Search/tree/master/dest) and place it in your site's assets directory.

Include the script in your html layout.

```html
<script src="assets/simple-jekyll-search.min.js"></script>
```

You can also add the below script tag directly in your html file.

```html
<script src="https://unpkg.com/simple-jekyll-search@latest/dest/simple-jekyll-search.min.js"></script>
```

## Step 2 - Configure the search

Create `search.json` file in the root of your jekyll website and place the following code.

```json
// search.json
{% raw %}
[
  {% for post in site.posts %}
    {
      "title": "{{ post.title | escape }}",
      "url": "{{ post.url | absolute_url }}",
      "content": "{{ post.content | strip_html | strip_newlines | escape }}"
    }{% unless forloop.last %},{% endunless %}
  {% endfor %}
]
{% endraw %}
```

This will convert all the jekyll data from all the post into a key value pair which can be easily read by the search script.

## Step 3 - Initialize the search

Create a search layout file `search.html` and add the following script before the closing `</body>` tag.

```html
<!-- search.html -->
<script src="assets/simple-jekyll-search.min.js"></script>

<script>
    SimpleJekyllSearch({
        searchInput: document.getElementById('search-input'),
        resultsContainer: document.getElementById('search-results'),
        json: '{{ "/assets/search.json" | relative_url }}',
        searchResultTemplate: '<li><a href="{url}">{title}</a></li>',
        noResultsText: 'Nothing found, try searching again.',
    });
</script>
```

{:.blockquote}

> I've also included the search script in `search.html` layout. You can put the script in your default layout or homepage as per your requirement.

## Step 4 - Create a search form

In the `search.html` layout, add the search input and result container to display the search results.

```html
<input type="text" id="search-input" placeholder="Search blog posts.." />
<ul id="results-container"></ul>
```

Your search functionality is ready. Now test it by typing something in the search input and check whether it displays any result.

## Customizations

You can also customize the search input and search result by adding custom styles and other elements to match your site design.

For example, if you are using bootstrap, you can add some css styles in the configuration script:

```html
searchResultTemplate: '
<li class="list-group-item">
    <a class="link-body-emphasis" href="{url}">{title}</a>
</li>
',
```

## Conclusion

Byy following these steps, you've successfully added search functionality to your Jekyll website providing users with the ability to search for your content easily which will enhance their overall experience on your site.
