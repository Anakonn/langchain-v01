---
translated: true
---

# MistralAI

यह नोटबुक MistralAIEmbeddings का उपयोग करने की व्याख्या करता है, जो langchain_mistralai पैकेज में शामिल है, लैंगचेन में पाठ को एम्बेड करने के लिए।

```python
# pip install -U langchain-mistralai
```

## पुस्तकालय आयात करें

```python
from langchain_mistralai import MistralAIEmbeddings
```

```python
embedding = MistralAIEmbeddings(api_key="your-api-key")
```

# एम्बेडिंग मॉडल का उपयोग करना

`MistralAIEmbeddings` के साथ, आप सीधे डिफ़ॉल्ट मॉडल 'mistral-embed' का उपयोग कर सकते हैं, या यदि उपलब्ध हो तो किसी अलग मॉडल को सेट कर सकते हैं।

```python
embedding.model = "mistral-embed"  # or your preferred model if available
```

```python
res_query = embedding.embed_query("The test information")
res_document = embedding.embed_documents(["test1", "another test"])
```
