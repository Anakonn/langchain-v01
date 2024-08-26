---
translated: true
---

# ChatGPT प्लगइन

>[OpenAI प्लगइन](https://platform.openai.com/docs/plugins/introduction) `ChatGPT` को तृतीय-पक्ष अनुप्रयोगों से जोड़ते हैं। ये प्लगइन `ChatGPT` को डेवलपर्स द्वारा परिभाषित एपीआई के साथ बातचीत करने में सक्षम बनाते हैं, `ChatGPT` की क्षमताओं को बढ़ाते हैं और इसे कई प्रकार के कार्य करने की अनुमति देते हैं।

>प्लगइन `ChatGPT` को निम्न कार्य करने में सक्षम बनाते हैं:
>- वास्तविक समय की जानकारी प्राप्त करना; जैसे खेल के स्कोर, शेयर मूल्य, नवीनतम समाचार आदि।
>- ज्ञान-आधार जानकारी प्राप्त करना; जैसे कंपनी दस्तावेज, व्यक्तिगत नोट आदि।
>- उपयोगकर्ता की ओर से कार्रवाई करना; जैसे उड़ान बुक करना, भोजन ऑर्डर करना आदि।

यह नोटबुक LangChain में ChatGPT Retriever प्लगइन का उपयोग करने का तरीका दिखाता है।

```python
# STEP 1: Load

# Load documents using LangChain's DocumentLoaders
# This is from https://langchain.readthedocs.io/en/latest/modules/document_loaders/examples/csv.html

from langchain_community.document_loaders import CSVLoader

loader = CSVLoader(
    file_path="../../document_loaders/examples/example_data/mlb_teams_2012.csv"
)
data = loader.load()


# STEP 2: Convert

# Convert Document to format expected by https://github.com/openai/chatgpt-retrieval-plugin
import json
from typing import List

from langchain_community.docstore.document import Document


def write_json(path: str, documents: List[Document]) -> None:
    results = [{"text": doc.page_content} for doc in documents]
    with open(path, "w") as f:
        json.dump(results, f, indent=2)


write_json("foo.json", data)

# STEP 3: Use

# Ingest this as you would any other json file in https://github.com/openai/chatgpt-retrieval-plugin/tree/main/scripts/process_json
```

## ChatGPT Retriever प्लगइन का उपयोग करना

ठीक है, हमने ChatGPT Retriever प्लगइन बना लिया है, लेकिन हम इसका वास्तव में कैसे उपयोग करें?

नीचे दिया गया कोड इसे कैसे करना है, इसका वर्णन करता है।

हम `ChatGPTPluginRetriever` का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key: ········
```

```python
from langchain_community.retrievers import (
    ChatGPTPluginRetriever,
)
```

```python
retriever = ChatGPTPluginRetriever(url="http://0.0.0.0:8000", bearer_token="foo")
```

```python
retriever.invoke("alice's phone number")
```

```output
[Document(page_content="This is Alice's phone number: 123-456-7890", lookup_str='', metadata={'id': '456_0', 'metadata': {'source': 'email', 'source_id': '567', 'url': None, 'created_at': '1609592400.0', 'author': 'Alice', 'document_id': '456'}, 'embedding': None, 'score': 0.925571561}, lookup_index=0),
 Document(page_content='This is a document about something', lookup_str='', metadata={'id': '123_0', 'metadata': {'source': 'file', 'source_id': 'https://example.com/doc1', 'url': 'https://example.com/doc1', 'created_at': '1609502400.0', 'author': 'Alice', 'document_id': '123'}, 'embedding': None, 'score': 0.6987589}, lookup_index=0),
 Document(page_content='Team: Angels "Payroll (millions)": 154.49 "Wins": 89', lookup_str='', metadata={'id': '59c2c0c1-ae3f-4272-a1da-f44a723ea631_0', 'metadata': {'source': None, 'source_id': None, 'url': None, 'created_at': None, 'author': None, 'document_id': '59c2c0c1-ae3f-4272-a1da-f44a723ea631'}, 'embedding': None, 'score': 0.697888613}, lookup_index=0)]
```
