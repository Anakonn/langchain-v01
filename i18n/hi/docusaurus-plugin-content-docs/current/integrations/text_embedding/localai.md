---
translated: true
---

# LocalAI

LocalAI एम्बेडिंग क्लास को लोड करें। LocalAI एम्बेडिंग क्लास का उपयोग करने के लिए, आपको कहीं पर LocalAI सेवा होस्ट करनी होगी और एम्बेडिंग मॉडल कॉन्फ़िगर करने होंगे। https://localai.io/basics/getting_started/index.html और https://localai.io/features/embeddings/index.html पर दस्तावेज़ देखें।

```python
from langchain_community.embeddings import LocalAIEmbeddings
```

```python
embeddings = LocalAIEmbeddings(
    openai_api_base="http://localhost:8080", model="embedding-model-name"
)
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_result = embeddings.embed_documents([text])
```

पहली पीढ़ी के मॉडल (जैसे text-search-ada-doc-001/text-search-ada-query-001) के साथ LocalAI एम्बेडिंग क्लास को लोड करें। नोट: ये अनुशंसित मॉडल नहीं हैं - [यहाँ](https://platform.openai.com/docs/guides/embeddings/what-are-embeddings) देखें।

```python
from langchain_community.embeddings import LocalAIEmbeddings
```

```python
embeddings = LocalAIEmbeddings(
    openai_api_base="http://localhost:8080", model="embedding-model-name"
)
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_result = embeddings.embed_documents([text])
```

```python
import os

# if you are behind an explicit proxy, you can use the OPENAI_PROXY environment variable to pass through
os.environ["OPENAI_PROXY"] = "http://proxy.yourcompany.com:8080"
```
