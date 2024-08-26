---
translated: true
---

# एटलस

>[एटलस](https://docs.nomic.ai/index.html) नोमिक द्वारा बनाया गया एक प्लेटफॉर्म है जो छोटे और इंटरनेट स्केल के अनरचित डेटासेट के साथ इंटरैक्ट करने के लिए बनाया गया है। यह किसी भी व्यक्ति को अपने ब्राउज़र में विशाल डेटासेट को दृश्यमान, खोजने और साझा करने में सक्षम बनाता है।

यह नोटबुक आपको `AtlasDB` वेक्टर स्टोर से संबंधित कार्यक्षमता का उपयोग करने में दिखाता है।

```python
%pip install --upgrade --quiet  spacy
```

```python
!python3 -m spacy download en_core_web_sm
```

```python
%pip install --upgrade --quiet  nomic
```

### पैकेज लोड करें

```python
import time

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import AtlasDB
from langchain_text_splitters import SpacyTextSplitter
```

```python
ATLAS_TEST_API_KEY = "7xDPkYXSYDc1_ErdTPIcoAR9RNd8YDlkS3nVNXcVoIMZ6"
```

### डेटा तैयार करें

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = SpacyTextSplitter(separator="|")
texts = []
for doc in text_splitter.split_documents(documents):
    texts.extend(doc.page_content.split("|"))

texts = [e.strip() for e in texts]
```

### नोमिक के एटलस का उपयोग करके डेटा को मैप करें

```python
db = AtlasDB.from_texts(
    texts=texts,
    name="test_index_" + str(time.time()),  # unique name for your vector store
    description="test_index",  # a description for your vector store
    api_key=ATLAS_TEST_API_KEY,
    index_kwargs={"build_topic_model": True},
)
```

```python
db.project.wait_for_project_lock()
```

```python
db.project
```

यहां इस कोड का परिणाम दिखाने वाला एक मानचित्र है। यह मानचित्र राष्ट्रपति के राज्य के संदेश को प्रदर्शित करता है।
https://atlas.nomic.ai/map/3e4de075-89ff-486a-845c-36c23f30bb67/d8ce2284-8edb-4050-8b9b-9bb543d7f647
