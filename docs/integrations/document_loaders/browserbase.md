---
canonical: https://python.langchain.com/v0.1/docs/integrations/document_loaders/browserbase
translated: false
---

# Browserbase

[Browserbase](https://browserbase.com) is a serverless platform for running headless browsers, it offers advanced debugging, session recordings, stealth mode, integrated proxies and captcha solving.

## Installation

- Get an API key from [browserbase.com](https://browserbase.com) and set it in environment variables (`BROWSERBASE_API_KEY`).
- Install the [Browserbase SDK](http://github.com/browserbase/python-sdk):

```python
% pip install browserbase
```

## Loading documents

You can load webpages into LangChain using `BrowserbaseLoader`. Optionally, you can set `text_content` parameter to convert the pages to text-only representation.

```python
from langchain_community.document_loaders import BrowserbaseLoader
```

```python
loader = BrowserbaseLoader(
    urls=[
        "https://example.com",
    ],
    # Text mode
    text_content=False,
)

docs = loader.load()
print(docs[0].page_content[:61])
```

## Loading images

You can also load screenshots of webpages (as bytes) for multi-modal models.

Full example using GPT-4V:

```python
from browserbase import Browserbase
from browserbase.helpers.gpt4 import GPT4VImage, GPT4VImageDetail
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model="gpt-4-vision-preview", max_tokens=256)
browser = Browserbase()

screenshot = browser.screenshot("https://browserbase.com")

result = chat.invoke(
    [
        HumanMessage(
            content=[
                {"type": "text", "text": "What color is the logo?"},
                GPT4VImage(screenshot, GPT4VImageDetail.auto),
            ]
        )
    ]
)

print(result.content)
```