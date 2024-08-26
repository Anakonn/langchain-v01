---
translated: true
---

# मोजेकएमएल

>[मोजेकएमएल](https://docs.mosaicml.com/en/latest/inference.html) एक प्रबंधित अनुमान सेवा प्रदान करता है। आप या तो विभिन्न ओपन-सोर्स मॉडल का उपयोग कर सकते हैं, या अपना स्वयं का तैनात कर सकते हैं।

यह उदाहरण `MosaicML` अनुमान के साथ पाठ एम्बेडिंग का उपयोग करने के बारे में बताता है।

```python
# sign up for an account: https://forms.mosaicml.com/demo?utm_source=langchain

from getpass import getpass

MOSAICML_API_TOKEN = getpass()
```

```python
import os

os.environ["MOSAICML_API_TOKEN"] = MOSAICML_API_TOKEN
```

```python
from langchain_community.embeddings import MosaicMLInstructorEmbeddings
```

```python
embeddings = MosaicMLInstructorEmbeddings(
    query_instruction="Represent the query for retrieval: "
)
```

```python
query_text = "This is a test query."
query_result = embeddings.embed_query(query_text)
```

```python
document_text = "This is a test document."
document_result = embeddings.embed_documents([document_text])
```

```python
import numpy as np

query_numpy = np.array(query_result)
document_numpy = np.array(document_result[0])
similarity = np.dot(query_numpy, document_numpy) / (
    np.linalg.norm(query_numpy) * np.linalg.norm(document_numpy)
)
print(f"Cosine similarity between document and query: {similarity}")
```
