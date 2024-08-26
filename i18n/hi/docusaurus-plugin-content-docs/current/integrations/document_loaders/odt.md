---
translated: true
---

# ओपन डॉक्यूमेंट फॉर्मेट (ODT)

>ऑफ़िस एप्लिकेशंस के लिए [ओपन डॉक्यूमेंट फॉर्मेट (ODF)](https://en.wikipedia.org/wiki/OpenDocument), जिसे `OpenDocument` के नाम से भी जाना जाता है, एक खुला फ़ाइल फ़ॉर्मेट है जो वर्ड प्रोसेसिंग दस्तावेज़ों, स्प्रेडशीट, प्रस्तुतियों और ग्राफ़िक्स के लिए है और ZIP-संपीड़ित XML फ़ाइलों का उपयोग करता है। इसका विकास ऑफ़िस एप्लिकेशंस के लिए एक खुला, XML-आधारित फ़ाइल फ़ॉर्मेट विनिर्देश प्रदान करने के उद्देश्य से किया गया था।

>यह मानक `OASIS` संगठन में एक तकनीकी समिति द्वारा विकसित और बनाए रखा जाता है। यह सन माइक्रोसिस्टम्स के OpenOffice.org XML के लिए विनिर्देश पर आधारित था, जो `OpenOffice.org` और `LibreOffice` के लिए डिफ़ॉल्ट प्रारूप था। इसका मूल विकास `StarOffice` के लिए "ऑफ़िस दस्तावेज़ों के लिए एक खुला मानक प्रदान करने" के उद्देश्य से किया गया था।

`UnstructuredODTLoader` का उपयोग `Open Office ODT` फ़ाइलों को लोड करने के लिए किया जाता है।

```python
from langchain_community.document_loaders import UnstructuredODTLoader
```

```python
loader = UnstructuredODTLoader("example_data/fake.odt", mode="elements")
docs = loader.load()
docs[0]
```

```output
Document(page_content='Lorem ipsum dolor sit amet.', metadata={'source': 'example_data/fake.odt', 'filename': 'example_data/fake.odt', 'category': 'Title'})
```
