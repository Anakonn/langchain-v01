---
translated: true
---

# OpenAI

चलिए OpenAI Embedding क्लास को लोड करते हैं।

## सेटअप

पहले हम langchain-openai को इंस्टॉल करते हैं और आवश्यक env vars को सेट करते हैं।

```python
%pip install -qU langchain-openai
```

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()
```

```python
from langchain_openai import OpenAIEmbeddings
```

```python
embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
```

```python
text = "This is a test document."
```

## उपयोग

### प्रश्न एम्बेड करें

```python
query_result = embeddings.embed_query(text)
```

```output
Warning: model not found. Using cl100k_base encoding.
```

```python
query_result[:5]
```

```output
[-0.014380056377383358,
 -0.027191711627651764,
 -0.020042716111860304,
 0.057301379620345545,
 -0.022267658631828974]
```

## दस्तावेज़ एम्बेड करें

```python
doc_result = embeddings.embed_documents([text])
```

```output
Warning: model not found. Using cl100k_base encoding.
```

```python
doc_result[0][:5]
```

```output
[-0.014380056377383358,
 -0.027191711627651764,
 -0.020042716111860304,
 0.057301379620345545,
 -0.022267658631828974]
```

## आयाम निर्दिष्ट करें

`text-embedding-3` क्लास के मॉडल के साथ, आप वापस दिए जाने वाले एम्बेडिंग्स के आकार को निर्दिष्ट कर सकते हैं। उदाहरण के लिए, डिफ़ॉल्ट रूप से `text-embedding-3-large` ने 3072 आयाम के एम्बेडिंग्स वापस दिए:

```python
len(doc_result[0])
```

```output
3072
```

लेकिन `dimensions=1024` पास करके हम अपने एम्बेडिंग्स को 1024 तक कम कर सकते हैं:

```python
embeddings_1024 = OpenAIEmbeddings(model="text-embedding-3-large", dimensions=1024)
```

```python
len(embeddings_1024.embed_documents([text])[0])
```

```output
Warning: model not found. Using cl100k_base encoding.
```

```output
1024
```
