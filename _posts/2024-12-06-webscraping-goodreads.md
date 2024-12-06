---
layout: post
title: How to Scrape Goodreads Using Python and BeautifulSoup
date: 2024-12-06 20:40:05 +0530
permalink: '/scrape-goodreads-using-python'
categories: python beautifulsoup webscraping
description: Learn how to scrape Goodreads Choice Awards data using Python and BeautifulSoup. This step-by-step guide covers setup, data extraction, and saving information in a CSV file for analysis or applications.
---

Web scraping is a powerful tool for gathering data from websites. Whether you’re collecting product reviews, tracking prices, or, in our case, scraping Goodreads books, web scraping provides endless opportunities for data-driven applications.

In this blog post, we’ll explore the fundamentals of web scraping, the power of the Python `BeautifulSoup` library, and break down a Python script designed to scrape Goodreads Choice Awards data. Finally, we’ll discuss how to store this data in a CSV file for further analysis or applications.

**What is Goodreads?**

Goodreads is the world’s largest platform for readers and book recommendations. It provides users with access to book reviews, author details, and popular rankings. Every year, Goodreads hosts the Goodreads Choice Awards, where readers vote for their favorite books across various genres like fiction, fantasy, romance, and more. This makes Goodreads an ideal target for web scraping to gather insights about trending books and authors.

### What is Web Scraping?

Web scraping involves extracting data from websites in an automated manner. It allows you to collect and structure information for tasks such as:

-   Analyzing trends and patterns.
-   Aggregating content like reviews or articles.
-   Feeding machine learning models or databases.

## Setting Up Your Environment

Before diving into the script, you need to install the necessary libraries.

1. **Install Python**

    Make sure you have Python installed on your system.

2. **Install Required Libraries**

    Install the required libraries using `pip`:

    ```bash
    pip install beautifulsoup4
    pip install requests
    ```

    `request`: Allows us to send HTTP requests to a URL and retrieve the web page’s content.

    `BeautifulSoup`: Simplifies HTML parsing and data extraction.

Once these installations are complete, you're ready to scraping!

### Introduction to BeautifulSoup

BeautifulSoup is a Python library for parsing HTML and XML documents. It enables developers to navigate page structures, extract content, and transform raw HTML into a structured format.

**Key Methods in BeautifulSoup**

Here are a few essential methods that we will be using in our script:

-   `BeautifulSoup(html, 'html.parser')`: Initializes the parser and allows you to work with the HTML content.
-   `soup.select(selector)`: Finds elements using CSS selectors, such as classes or tags.
-   `soup.find(class_='class_name')`: Locates the first occurrence of an element with a specified class.
-   `soup.find_parent(class_='class_name')`: Finds the parent tag of the current element.
-   `soup.get('attribute')`: Retrieves the value of an attribute from an element, like href or src.

For a complete list of methods, check out the [BeautifulSoup documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/).

### Setting Up the Script

Let’s begin by importing the necessary libraries and defining custom headers to mimic a browser. This helps avoid getting blocked by the website.

```python
from bs4 import BeautifulSoup as bs
import requests
import re
import csv

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64)...",
    "Accept-Language": "en-US, en;q=0.5",
}
```

### Scraping Categories and Books

We start by defining the URLs for Goodreads’ Choice Awards page and the main application. We will send a request to `start_url` and get the web page's content.

```python
app_url = "https://www.goodreads.com"
start_url = "https://www.goodreads.com/choiceawards/best-books-2024"

res = requests.get(start_url, headers=HEADERS)
soup = bs(res.text, 'html.parser')

categories = soup.select('.category')
```

Each category contains a genre and a link to its respective page. Using `soup.select`, we extract all categories listed under the `.category` class.

<img src='/assets/images/category_element.png' alt='Finding the parent category element' style='width:100%' />

Next, iterate through each category to get the genre name and its page URL.

```python
for index, category in enumerate(categories):
    genre = category.select('h4.category__copy')[0].text.strip()
    url = category.select('a')[0].get('href')
    category_url = f"{app_url}{url}"
```

Here, we extract the category name (genre) and the category page URL for further processing.

We will send another request to each `category_url` and locate all the books under that category.

```python
res = requests.get(category_url, headers=HEADERS)
soup = bs(res.text, 'html.parser')

category_books = soup.select('.resultShown a.pollAnswer__bookLink')
```

`category_books` will contain the list of all the books under the respective category.

### Extracting Book Data

Once we have the list of books, we will be iterating over each books and extract the data.

**Extract Votes**

```python
for book_index, book in enumerate(category_books):
    parent_tag = book.find_parent(class_='resultShown')
    votes = parent_tag.find(class_='result').text.strip()
    book_votes = clean_string(votes).split(" ")[0].replace(",", "")
```

If we see in the DOM, voting count is present in the parent element of the category element. So we need to use `find_parent` method to locate the element and extract the voting count.

<img src='/assets/images/vote_element.png' alt='Finding the parent vote element' style='width:100%' />

**Extract Book Title, Author and Image URL**

```python
book_url = book.get('href')
book_url_formatted = f"{app_url}{book_url}"
book_img = book.find('img')
book_img_url = book_img.get('src')
book_img_alt = book_img.get('alt')
book_title = clean_string(book_img_alt)
print(book_title)
book_name = book_title.split('by')[0].strip()
book_author = book_title.split('by')[1].strip()
```

Each book's URL, cover image URL, title and author are extracted.

The `clean_string` function ensures the title is neatly formatted. You can define it at the top of the script

```python
def clean_string(string):
    cleaned = re.sub(r'\s+', ' ', string).strip()
    return cleaned
```

**Extract More Book Details**

To get more details about the book like rating, reviews, etc., we will be sending another request to `book_url_formatted`.

```python
res = requests.get(book_url_formatted, headers=HEADERS)
soup = bs(res.text, 'html.parser')

book_rating = soup.find(class_="RatingStatistics__rating").text.strip()
print(book_rating)

book_ratings_reviews = soup.find(class_="RatingStatistics__meta").get('aria-label').strip()
book_ratings, book_reviews = get_ratings_reviews(book_ratings_reviews)
print(f"Ratings: {book_ratings}, Reviews: {book_reviews}")

book_description_elements = soup.select('.BookPageMetadataSection__description .Formatted')
if book_description_elements:
    book_description = book_description_elements[0].text
else:
    book_description = 'No description found'
```

Here `get_ratings_reviews` returns the ratings and reviews text well formatted.

<img src='/assets/images/review_rating_element.png' alt='Rating and Reviews element' style='width:100%' />

You can define this function at the top of the script.

```python
def get_ratings_reviews(text):
    # Find the substring for ratings
    ratings = text[:text.find(" ratings")].replace(",", "")

    # Find the substring for reviews
    reviews = text[text.find("and ") + 4:text.find(" reviews")].replace(",", "")

    return int(ratings), int(reviews)
```

By navigating to each book’s details page, additional information like ratings, reviews, and detailed descriptions is extracted. Here, we are also checking if book description element exists otherwise putting a default description so that the script does not fails.

```python
author_avatar_url_element = soup.select('.PageSection .AuthorPreview a.Avatar img.Avatar__image')
if author_avatar_url_element:
    author_avatar_url = author_avatar_url_element[0].get('src')
else:
    author_avatar_url = 'No Avatar found'

author_description_element = soup.select('.PageSection > .TruncatedContent .Formatted')
if author_description_element:
    author_description = author_description_element[0].text
else:
    author_description = 'No description found'

print(author_description)

bookPages = soup.select_one(".FeaturedDetails p[data-testid='pagesFormat']")
if bookPages:
    pages_format = bookPages.text[:bookPages.text.find(" pages")]
else:
    pages_format = "No pages found"
print(pages_format)

publication_info = soup.select_one(".FeaturedDetails p[data-testid='publicationInfo']")
if publication_info:
    publication = publication_info.text[16:]
else:
    publication = "No publication found"
print(publication)
```

Here, we have also gathered author details, publication information and other metadata.

**Create a Book Dictionary**

Let's store all the data we have extracted for a book in a dictionary.

```python
book_dict = {
    "category": genre,
    "votes": book_votes,
    "title": book_name,
    "description": book_description,
    "author_name": book_author,
    "author_about": author_description,
    "avatar_url": author_avatar_url,
    "pages": pages_format,
    "rating": book_rating,
    "ratings": book_ratings,
    "reviews": book_reviews,
    "publication_info": publication,
    "img_url": book_img_url,
    "book_url": f"{app_url}{book_url}"
}
```

We will use this dictionary to add the data in a csv file.

### Storing Data in a CSV File

We will use the `csv` module which is a part of Python's standard library. So you don't need to install it separately.

First we need to check if this is the first entry. This check is required to add the header in the csv file in the first row.

```python
csv_filename = "books.csv"

if index == 0 and book_index == 0:
    with open(csv_filename, "w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=book_dict.keys())
        writer.writeheader()
```

We are using `mode="w"` which will create a new csv file with the header entry.

Now for all subsequent entries, we will append the data to the CSV file:

```python
with open(csv_filename, mode="a", newline="", encoding="utf-8") as csv_file:
    writer = csv.DictWriter(csv_file, fieldnames=book_dict.keys())
    writer.writerow(book_dict)
```

`mode="a"` will append the data to CSV file.

Now, sit back, relax, and enjoy a cup of coffee ☕️ while the script runs.

Once it’s done, the final data will look like this:

<img src='/assets/images/final_csv_data.png' alt='Final CSV File Data' style='width:100%' />

You can find the complete source code in this [github repository](https://github.com/bekaarcoder/goodreads-scraper).

<hr>

### Summary

We have learned how to scrape Goodreads data using Python and BeautifulSoup. Starting from basic setup to storing data in a CSV file, we explored every aspect of the scraping process. The scraped data can be used for:

-   Data visualization (e.g., most popular genres or authors).
-   Machine learning models to predict book popularity.
-   Building personal book recommendation systems.

Web scraping opens up possibilities for creative data analysis and applications. With libraries like BeautifulSoup, even complex scraping tasks become manageable. Just remember to follow ethical practices and respect the website’s terms of service while scraping!
