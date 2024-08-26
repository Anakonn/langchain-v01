---
translated: true
---

# Browserbase

[Browserbase](https://browserbase.com) एक सर्वरलेस प्लेटफॉर्म है जो हेडलेस ब्राउज़रों को चलाने के लिए है, यह उन्नत डिबगिंग, सत्र रिकॉर्डिंग, स्टील्थ मोड, एकीकृत प्रॉक्सी और कैप्चा हल करने की सुविधा प्रदान करता है।

## इंस्टॉलेशन

- [browserbase.com](https://browserbase.com) से एक API कुंजी प्राप्त करें और इसे पर्यावरण चर (`BROWSERBASE_API_KEY`) में सेट करें।
- [Browserbase SDK](http://github.com/browserbase/python-sdk) स्थापित करें:

```python
% pip install browserbase
```

## दस्तावेज़ लोड करना

आप `BrowserbaseLoader` का उपयोग करके वेबपृष्ठों को LangChain में लोड कर सकते हैं। वैकल्पिक रूप से, आप `text_content` पैरामीटर को सेट कर सकते हैं ताकि पृष्ठों को केवल पाठ प्रतिनिधित्व में परिवर्तित किया जा सके।

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

## छवियां लोड करना

आप मल्टी-मोडल मॉडलों के लिए वेबपृष्ठों के स्क्रीनशॉट (बाइट्स के रूप में) भी लोड कर सकते हैं।

GPT-4V का उपयोग करते हुए पूर्ण उदाहरण:

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
