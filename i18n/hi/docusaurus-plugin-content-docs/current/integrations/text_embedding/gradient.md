---
translated: true
---

# ग्रेडिएंट

`ग्रेडिएंट` से आप `एम्बेडिंग्स` बना सकते हैं और साथ ही एलएलएम पर फाइन-ट्यून और कंप्लीशन प्राप्त कर सकते हैं एक सरल वेब एपीआई के साथ।

यह नोटबुक बताता है कि [ग्रेडिएंट](https://gradient.ai/) के एम्बेडिंग्स के साथ लैंगचेन का उपयोग कैसे करें।

## आयात

```python
from langchain_community.embeddings import GradientEmbeddings
```

## वातावरण एपीआई कुंजी सेट करें

सुनिश्चित करें कि आप अपनी एपीआई कुंजी ग्रेडिएंट एआई से प्राप्त करें। आपको विभिन्न मॉडल्स को परीक्षण और फाइन-ट्यून करने के लिए $10 का मुक्त क्रेडिट दिया जाता है।

```python
import os
from getpass import getpass

if not os.environ.get("GRADIENT_ACCESS_TOKEN", None):
    # Access token under https://auth.gradient.ai/select-workspace
    os.environ["GRADIENT_ACCESS_TOKEN"] = getpass("gradient.ai access token:")
if not os.environ.get("GRADIENT_WORKSPACE_ID", None):
    # `ID` listed in `$ gradient workspace list`
    # also displayed after login at at https://auth.gradient.ai/select-workspace
    os.environ["GRADIENT_WORKSPACE_ID"] = getpass("gradient.ai workspace id:")
```

वैकल्पिक: वर्तमान में तैनात मॉडल्स को प्राप्त करने के लिए अपने वातावरण चर `GRADIENT_ACCESS_TOKEN` और `GRADIENT_WORKSPACE_ID` को सत्यापित करें। `gradientai` पायथन पैकेज का उपयोग करके।

```python
%pip install --upgrade --quiet  gradientai
```

## ग्रेडिएंट इंस्टेंस बनाएं

```python
documents = [
    "Pizza is a dish.",
    "Paris is the capital of France",
    "numpy is a lib for linear algebra",
]
query = "Where is Paris?"
```

```python
embeddings = GradientEmbeddings(model="bge-large")

documents_embedded = embeddings.embed_documents(documents)
query_result = embeddings.embed_query(query)
```

```python
# (demo) compute similarity
import numpy as np

scores = np.array(documents_embedded) @ np.array(query_result).T
dict(zip(documents, scores))
```
