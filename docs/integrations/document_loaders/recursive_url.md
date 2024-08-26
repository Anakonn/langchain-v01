---
canonical: https://python.langchain.com/v0.1/docs/integrations/document_loaders/recursive_url
translated: false
---

# Recursive URL

We may want to process load all URLs under a root directory.

For example, let's look at the [Python 3.9 Document](https://docs.python.org/3.9/).

This has many interesting child pages that we may want to read in bulk.

Of course, the `WebBaseLoader` can load a list of pages.

But, the challenge is traversing the tree of child pages and actually assembling that list!

We do this using the `RecursiveUrlLoader`.

This also gives us the flexibility to exclude some children, customize the extractor, and more.

# Parameters

- url: str, the target url to crawl.
- exclude_dirs: Optional[str], webpage directories to exclude.
- use_async: Optional[bool], wether to use async requests, using async requests is usually faster in large tasks. However, async will disable the lazy loading feature(the function still works, but it is not lazy). By default, it is set to False.
- extractor: Optional[Callable[[str], str]], a function to extract the text of the document from the webpage, by default it returns the page as it is. It is recommended to use tools like goose3 and beautifulsoup to extract the text. By default, it just returns the page as it is.
- max_depth: Optional[int] = None, the maximum depth to crawl. By default, it is set to 2. If you need to crawl the whole website, set it to a number that is large enough would simply do the job.
- timeout: Optional[int] = None, the timeout for each request, in the unit of seconds. By default, it is set to 10.
- prevent_outside: Optional[bool] = None, whether to prevent crawling outside the root url. By default, it is set to True.

```python
from langchain_community.document_loaders.recursive_url_loader import RecursiveUrlLoader
```

Let's try a simple example.

```python
from bs4 import BeautifulSoup as Soup

url = "https://docs.python.org/3.9/"
loader = RecursiveUrlLoader(
    url=url, max_depth=2, extractor=lambda x: Soup(x, "html.parser").text
)
docs = loader.load()
```

```python
docs[0].page_content[:50]
```

```output
'\n\n\n\n\nPython Frequently Asked Questions — Python 3.'
```

```python
docs[-1].metadata
```

```output
{'source': 'https://docs.python.org/3.9/library/index.html',
 'title': 'The Python Standard Library — Python 3.9.17 documentation',
 'language': None}
```

However, since it's hard to perform a perfect filter, you may still see some irrelevant results in the results. You can perform a filter on the returned documents by yourself, if it's needed. Most of the time, the returned results are good enough.

Testing on LangChain docs.

```python
url = "https://js.langchain.com/docs/modules/memory/integrations/"
loader = RecursiveUrlLoader(url=url)
docs = loader.load()
len(docs)
```

```output
8
```