---
translated: true
---

# फ़ौना

>[फ़ौना](https://fauna.com/) एक दस्तावेज़ डेटाबेस है।

`फ़ौना` दस्तावेज़ों को क्वेरी करें

```python
%pip install --upgrade --quiet  fauna
```

## डेटा क्वेरी उदाहरण

```python
from langchain_community.document_loaders.fauna import FaunaLoader

secret = "<enter-valid-fauna-secret>"
query = "Item.all()"  # Fauna query. Assumes that the collection is called "Item"
field = "text"  # The field that contains the page content. Assumes that the field is called "text"

loader = FaunaLoader(query, field, secret)
docs = loader.lazy_load()

for value in docs:
    print(value)
```

### पृथक्करण के साथ क्वेरी करें

यदि अधिक डेटा हैं, तो आप एक `after` मान प्राप्त करेंगे। आप क्वेरी में `after` स्ट्रिंग को पास करके कर्सर के बाद मान प्राप्त कर सकते हैं।

अधिक जानकारी के लिए [इस लिंक](https://fqlx-beta--fauna-docs.netlify.app/fqlx/beta/reference/schema_entities/set/static-paginate) का अनुसरण करें।

```python
query = """
Item.paginate("hs+DzoPOg ... aY1hOohozrV7A")
Item.all()
"""
loader = FaunaLoader(query, field, secret)
```
