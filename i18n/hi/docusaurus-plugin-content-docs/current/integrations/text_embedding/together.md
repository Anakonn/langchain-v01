---
sidebar_label: एक साथ AI
translated: true
---

# TogetherEmbeddings

यह नोटबुक एक साथ AI API में होस्ट किए गए ओपन सोर्स एम्बेडिंग मॉडल्स का उपयोग शुरू करने के बारे में कवर करता है।

## इंस्टॉलेशन

```python
# install package
%pip install --upgrade --quiet  langchain-together
```

## पर्यावरण सेटअप

निम्नलिखित पर्यावरण चर सेट करना सुनिश्चित करें:

- `TOGETHER_API_KEY`

## उपयोग

पहले, [इस सूची](https://docs.together.ai/docs/embedding-models) से एक समर्थित मॉडल का चयन करें। निम्नलिखित उदाहरण में, हम `togethercomputer/m2-bert-80M-8k-retrieval` का उपयोग करेंगे।

```python
from langchain_together.embeddings import TogetherEmbeddings

embeddings = TogetherEmbeddings(model="togethercomputer/m2-bert-80M-8k-retrieval")
```

```python
embeddings.embed_query("My query to look up")
```

```python
embeddings.embed_documents(
    ["This is a content of the document", "This is another document"]
)
```

```python
# async embed query
await embeddings.aembed_query("My query to look up")
```

```python
# async embed documents
await embeddings.aembed_documents(
    ["This is a content of the document", "This is another document"]
)
```
