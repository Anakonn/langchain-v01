---
canonical: https://python.langchain.com/v0.1/docs/integrations/document_loaders/url
translated: false
---

# URL

This example covers how to load `HTML` documents from a list of `URLs` into the `Document` format that we can use downstream.

## Unstructured URL Loader

You have to install the `unstructured` library:

```python
!pip install -U unstructured
```

```python
from langchain_community.document_loaders import UnstructuredURLLoader
```

```python
urls = [
    "https://www.understandingwar.org/backgrounder/russian-offensive-campaign-assessment-february-8-2023",
    "https://www.understandingwar.org/backgrounder/russian-offensive-campaign-assessment-february-9-2023",
]
```

Pass in ssl_verify=False with headers=headers to get past ssl_verification error.

```python
loader = UnstructuredURLLoader(urls=urls)
```

```python
data = loader.load()
```

## Selenium URL Loader

This covers how to load HTML documents from a list of URLs using the `SeleniumURLLoader`.

Using `Selenium` allows us to load pages that require JavaScript to render.

To use the `SeleniumURLLoader`, you have to install `selenium` and `unstructured`.

```python
!pip install -U selenium unstructured
```

```python
from langchain_community.document_loaders import SeleniumURLLoader
```

```python
urls = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://goo.gl/maps/NDSHwePEyaHMFGwh8",
]
```

```python
loader = SeleniumURLLoader(urls=urls)
```

```python
data = loader.load()
```

## Playwright URL Loader

This covers how to load HTML documents from a list of URLs using the `PlaywrightURLLoader`.

[Playwright](https://playwright.dev/) enables reliable end-to-end testing for modern web apps.

As in the Selenium case, `Playwright` allows us to load and render the JavaScript pages.

To use the `PlaywrightURLLoader`, you have to install `playwright` and `unstructured`. Additionally, you have to install the `Playwright Chromium` browser:

```python
!pip install -U playwright unstructured
```

```python
!playwright install
```

```python
from langchain_community.document_loaders import PlaywrightURLLoader
```

```python
urls = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://goo.gl/maps/NDSHwePEyaHMFGwh8",
]
```

```python
loader = PlaywrightURLLoader(urls=urls, remove_selectors=["header", "footer"])
```

```python
data = loader.load()
```