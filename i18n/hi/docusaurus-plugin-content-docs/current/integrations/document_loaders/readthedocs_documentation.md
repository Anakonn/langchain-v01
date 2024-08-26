---
translated: true
---

# ReadTheDocs प्रलेखन

>[Read the Docs](https://readthedocs.org/) एक ओपन-सोर्स मुक्त सॉफ्टवेयर प्रलेखन होस्टिंग प्लेटफ़ॉर्म है। यह `Sphinx` प्रलेखन जनरेटर के साथ लिखी गई प्रलेखन को जनरेट करता है।

यह नोटबुक कवर करता है कि `Read-The-Docs` बिल्ड के हिस्से के रूप में जनरेट किए गए HTML से कंटेंट कैसे लोड किया जाए।

इसका एक उदाहरण देखने के लिए, [यहां](https://github.com/langchain-ai/chat-langchain) देखें।

यह मान लेता है कि HTML पहले से ही एक फोल्डर में स्क्रैप किया जा चुका है। यह निम्नलिखित कमांड को अनकमेंट और चलाकर किया जा सकता है।

```python
%pip install --upgrade --quiet  beautifulsoup4
```

```python
#!wget -r -A.html -P rtdocs https://python.langchain.com/en/latest/
```

```python
from langchain_community.document_loaders import ReadTheDocsLoader
```

```python
loader = ReadTheDocsLoader("rtdocs", features="html.parser")
```

```python
docs = loader.load()
```
