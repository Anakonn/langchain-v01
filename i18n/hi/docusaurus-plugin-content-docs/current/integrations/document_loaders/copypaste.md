---
translated: true
---

# कॉपी पेस्ट

यह नोटबुक कवर करता है कि आप किस तरह से एक दस्तावेज़ वस्तु को लोड कर सकते हैं जिसे आप बस कॉपी और पेस्ट करना चाहते हैं। इस मामले में, आपको एक DocumentLoader का उपयोग करने की भी आवश्यकता नहीं है, बल्कि आप सीधे Document को बना सकते हैं।

```python
from langchain_community.docstore.document import Document
```

```python
text = "..... put the text you copy pasted here......"
```

```python
doc = Document(page_content=text)
```

## मेटाडेटा

यदि आप इस पाठ के स्रोत के बारे में मेटाडेटा जोड़ना चाहते हैं, तो आप मेटाडेटा कुंजी के साथ आसानी से कर सकते हैं।

```python
metadata = {"source": "internet", "date": "Friday"}
```

```python
doc = Document(page_content=text, metadata=metadata)
```
