---
translated: true
---

# FireworksEmbeddings

यह नोटबुक FireworksEmbeddings का उपयोग करने की व्याख्या करता है, जो langchain_fireworks पैकेज में शामिल है, लैंगचेन में पाठ को एम्बेड करने के लिए। हम इस उदाहरण में डिफ़ॉल्ट nomic-ai v1.5 मॉडल का उपयोग करते हैं।

```python
%pip install -qU langchain-fireworks
```

## सेटअप

```python
from langchain_fireworks import FireworksEmbeddings
```

```python
import getpass
import os

if "FIREWORKS_API_KEY" not in os.environ:
    os.environ["FIREWORKS_API_KEY"] = getpass.getpass("Fireworks API Key:")
```

# एम्बेडिंग मॉडल का उपयोग करना

`FireworksEmbeddings` के साथ, आप सीधे डिफ़ॉल्ट मॉडल 'nomic-ai/nomic-embed-text-v1.5' का उपयोग कर सकते हैं, या यदि उपलब्ध हो तो किसी अन्य मॉडल को सेट कर सकते हैं।

```python
embedding = FireworksEmbeddings(model="nomic-ai/nomic-embed-text-v1.5")
```

```python
res_query = embedding.embed_query("The test information")
res_document = embedding.embed_documents(["test1", "another test"])
print(res_query[:5])
print(res_document[1][:5])
```

```output
[0.01367950439453125, 0.0103607177734375, -0.157958984375, -0.003070831298828125, 0.05926513671875]
[0.0369873046875, 0.00545501708984375, -0.179931640625, -0.018707275390625, 0.0552978515625]
```
