---
translated: true
---

# ब्राउज़रलेस

ब्राउज़रलेस एक सेवा है जो आपको क्लाउड में हेडलेस क्रोम इंस्टेंस चलाने की अनुमति देती है। यह स्केल पर ब्राउज़र-आधारित ऑटोमेशन चलाने का एक शानदार तरीका है, बिना अपने अपने बुनियादी ढांचे का प्रबंधन करने की चिंता किए।

`BrowserlessLoader` इंस्टेंस को इनिशियलाइज़ करके, ब्राउज़रलेस का उपयोग दस्तावेज़ लोडर के रूप में करने के लिए, इस नोटबुक में दिखाया गया है। ध्यान दें कि डिफ़ॉल्ट रूप से, `BrowserlessLoader` पेज के `body` तत्व का `innerText` वापस करता है। इसे अक्षम करने और कच्चा HTML प्राप्त करने के लिए, `text_content` को `False` पर सेट करें।

```python
from langchain_community.document_loaders import BrowserlessLoader
```

```python
BROWSERLESS_API_TOKEN = "YOUR_BROWSERLESS_API_TOKEN"
```

```python
loader = BrowserlessLoader(
    api_token=BROWSERLESS_API_TOKEN,
    urls=[
        "https://en.wikipedia.org/wiki/Document_classification",
    ],
    text_content=True,
)

documents = loader.load()

print(documents[0].page_content[:1000])
```

```output
Jump to content
Main menu
Search
Create account
Log in
Personal tools
Toggle the table of contents
Document classification
17 languages
Article
Talk
Read
Edit
View history
Tools
From Wikipedia, the free encyclopedia

Document classification or document categorization is a problem in library science, information science and computer science. The task is to assign a document to one or more classes or categories. This may be done "manually" (or "intellectually") or algorithmically. The intellectual classification of documents has mostly been the province of library science, while the algorithmic classification of documents is mainly in information science and computer science. The problems are overlapping, however, and there is therefore interdisciplinary research on document classification.

The documents to be classified may be texts, images, music, etc. Each kind of document possesses its special classification problems. When not otherwise specified, text classification is implied.

Do
```
