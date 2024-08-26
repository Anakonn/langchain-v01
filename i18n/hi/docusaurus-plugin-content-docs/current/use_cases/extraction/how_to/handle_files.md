---
sidebar_position: 3
title: फ़ाइलों को संभालना
translated: true
---

कच्चे पाठ डेटा के अलावा, आप पावरपॉइंट प्रस्तुतियों या PDF जैसी अन्य फ़ाइल प्रकारों से जानकारी निकालना चाह सकते हैं।

आप LangChain [दस्तावेज़ लोडर](/docs/modules/data_connection/document_loaders/) का उपयोग कर सकते हैं ताकि फ़ाइलों को एक पाठ प्रारूप में पार्स किया जा सके जिसे LLM में फ़ीड किया जा सके।

LangChain में [दस्तावेज़ लोडर एकीकरण](/docs/integrations/document_loaders) की एक बड़ी संख्या है।

## MIME प्रकार आधारित पार्सिंग

मूल पार्सिंग उदाहरणों के लिए [दस्तावेज़ लोडर](/docs/modules/data_connection/document_loaders/) पर एक नज़र डालें।

यहाँ, हम MIME प्रकार आधारित पार्सिंग पर ध्यान केंद्रित करेंगे जो अक्सर उपयोगी होता है यदि आप उपयोगकर्ता द्वारा अपलोड की गई फ़ाइलों को स्वीकार करने वाले सर्वर कोड लिख रहे हैं।

इस मामले में, यह सबसे अच्छा है कि उपयोगकर्ता द्वारा प्रदान की गई फ़ाइल का एक्सटेंशन गलत है और बजाय इसके फ़ाइल के बाइनरी सामग्री से mimetype का अनुमान लगाया जाए।

कुछ सामग्री डाउनलोड करते हैं। यह एक HTML फ़ाइल होगी, लेकिन नीचे का कोड अन्य फ़ाइल प्रकारों के साथ भी काम करेगा।

```python
import requests

response = requests.get("https://en.wikipedia.org/wiki/Car")
data = response.content
data[:20]
```

```output
b'<!DOCTYPE html>\n<htm'
```

पार्सर कॉन्फ़िगर करें

```python
import magic
from langchain.document_loaders.parsers import BS4HTMLParser, PDFMinerParser
from langchain.document_loaders.parsers.generic import MimeTypeBasedParser
from langchain.document_loaders.parsers.txt import TextParser
from langchain_community.document_loaders import Blob

# Configure the parsers that you want to use per mime-type!
HANDLERS = {
    "application/pdf": PDFMinerParser(),
    "text/plain": TextParser(),
    "text/html": BS4HTMLParser(),
}

# Instantiate a mimetype based parser with the given parsers
MIMETYPE_BASED_PARSER = MimeTypeBasedParser(
    handlers=HANDLERS,
    fallback_parser=None,
)

mime = magic.Magic(mime=True)
mime_type = mime.from_buffer(data)

# A blob represents binary data by either reference (path on file system)
# or value (bytes in memory).
blob = Blob.from_data(
    data=data,
    mime_type=mime_type,
)

parser = HANDLERS[mime_type]
documents = parser.parse(blob=blob)
```

```python
print(documents[0].page_content[:30].strip())
```

```output
Car - Wikipedia
```
