---
translated: true
---

# ट्रेलो

>[ट्रेलो](https://www.atlassian.com/software/trello) एक वेब-आधारित परियोजना प्रबंधन और सहयोग उपकरण है जो व्यक्तियों और टीमों को अपने कार्यों और परियोजनाओं को संगठित और ट्रैक करने की अनुमति देता है। यह एक "बोर्ड" नामक दृश्यात्मक इंटरफ़ेस प्रदान करता है जहां उपयोगकर्ता सूचियां और कार्ड बना सकते हैं जो उनके कार्यों और गतिविधियों का प्रतिनिधित्व करते हैं।

TrelloLoader आपको ट्रेलो बोर्ड से कार्ड लोड करने की अनुमति देता है और [py-trello](https://pypi.org/project/py-trello/) के ऊपर कार्यान्वित किया गया है।

यह वर्तमान में केवल `api_key/token` का समर्थन करता है।

1. क्रेडेंशियल जनरेशन: https://trello.com/power-ups/admin/

2. मैनुअल टोकन जनरेशन लिंक पर क्लिक करें ताकि टोकन प्राप्त किया जा सके।

API कुंजी और टोकन निर्दिष्ट करने के लिए आप या तो पर्यावरण चर ``TRELLO_API_KEY`` और ``TRELLO_TOKEN`` सेट कर सकते हैं या आप `from_credentials` सुविधा निर्माता विधि में सीधे ``api_key`` और ``token`` पास कर सकते हैं।

यह लोडर आपको बोर्ड का नाम प्रदान करने की अनुमति देता है ताकि संबंधित कार्ड दस्तावेज़ वस्तुओं में लोड किए जा सकें।

ध्यान दें कि आधिकारिक दस्तावेज़ीकरण में बोर्ड का "नाम" "शीर्षक" भी कहा जाता है:

https://support.atlassian.com/trello/docs/changing-a-boards-title-and-description/

आप दस्तावेज़ पृष्ठ_सामग्री गुण और मेटाडेटा से अलग-अलग क्षेत्रों को शामिल या हटाने के लिए कई लोड पैरामीटर भी निर्दिष्ट कर सकते हैं।

## सुविधाएं

- ट्रेलो बोर्ड से कार्ड लोड करें।
- उनकी स्थिति (खुला या बंद) के आधार पर कार्ड फ़िल्टर करें।
- लोड किए गए दस्तावेजों में कार्ड नाम, टिप्पणियां और चेकलिस्ट शामिल करें।
- दस्तावेज़ में शामिल करने के लिए अतिरिक्त मेटाडेटा क्षेत्रों को अनुकूलित करें।

डिफ़ॉल्ट रूप से सभी कार्ड क्षेत्र पूर्ण पाठ पृष्ठ_सामग्री और मेटाडेटा के अनुसार शामिल हैं।

```python
%pip install --upgrade --quiet  py-trello beautifulsoup4 lxml
```

```python
# If you have already set the API key and token using environment variables,
# you can skip this cell and comment out the `api_key` and `token` named arguments
# in the initialization steps below.
from getpass import getpass

API_KEY = getpass()
TOKEN = getpass()
```

```output
········
········
```

```python
from langchain_community.document_loaders import TrelloLoader

# Get the open cards from "Awesome Board"
loader = TrelloLoader.from_credentials(
    "Awesome Board",
    api_key=API_KEY,
    token=TOKEN,
    card_filter="open",
)
documents = loader.load()

print(documents[0].page_content)
print(documents[0].metadata)
```

```output
Review Tech partner pages
Comments:
{'title': 'Review Tech partner pages', 'id': '6475357890dc8d17f73f2dcc', 'url': 'https://trello.com/c/b0OTZwkZ/1-review-tech-partner-pages', 'labels': ['Demand Marketing'], 'list': 'Done', 'closed': False, 'due_date': ''}
```

```python
# Get all the cards from "Awesome Board" but only include the
# card list(column) as extra metadata.
loader = TrelloLoader.from_credentials(
    "Awesome Board",
    api_key=API_KEY,
    token=TOKEN,
    extra_metadata=("list"),
)
documents = loader.load()

print(documents[0].page_content)
print(documents[0].metadata)
```

```output
Review Tech partner pages
Comments:
{'title': 'Review Tech partner pages', 'id': '6475357890dc8d17f73f2dcc', 'url': 'https://trello.com/c/b0OTZwkZ/1-review-tech-partner-pages', 'list': 'Done'}
```

```python
# Get the cards from "Another Board" and exclude the card name,
# checklist and comments from the Document page_content text.
loader = TrelloLoader.from_credentials(
    "test",
    api_key=API_KEY,
    token=TOKEN,
    include_card_name=False,
    include_checklist=False,
    include_comments=False,
)
documents = loader.load()

print("Document: " + documents[0].page_content)
print(documents[0].metadata)
```
