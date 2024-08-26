---
sidebar_label: Astra DB
translated: true
---

# Astra DB

DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) एक सर्वरलेस वेक्टर-क्षमता वाला डेटाबेस है जो कैसेंड्रा पर निर्मित है और एक आसान-इस्तेमाल JSON API के माध्यम से सुविधाजनक रूप से उपलब्ध है।

`AstraDBStore` और `AstraDBByteStore` को इंस्टॉल करने के लिए `astrapy` पैकेज की आवश्यकता है:

```python
%pip install --upgrade --quiet  astrapy
```

स्टोर निम्नलिखित पैरामीटर लेता है:

* `api_endpoint`: Astra DB API एंडपॉइंट। यह `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com` जैसा दिखता है
* `token`: Astra DB टोकन। यह `AstraCS:6gBhNmsk135....` जैसा दिखता है
* `collection_name`: Astra DB कलेक्शन नाम
* `namespace`: (वैकल्पिक) Astra DB नेमस्पेस

## AstraDBStore

`AstraDBStore` `BaseStore` का एक कार्यान्वयन है जो सब कुछ आपके DataStax Astra DB इंस्टैंस में संग्रहित करता है।
स्टोर कुंजियों को स्ट्रिंग होना चाहिए और उन्हें Astra DB दस्तावेज़ के `_id` फ़ील्ड में मैप किया जाएगा।
स्टोर मूल्य कोई भी ऑब्जेक्ट हो सकता है जिसे `json.dumps` द्वारा सीरियलाइज़ किया जा सकता है।
डेटाबेस में, प्रविष्टियों का रूप होगा:

```json
{
  "_id": "<key>",
  "value": <value>
}
```

```python
from langchain_community.storage import AstraDBStore
```

```python
from getpass import getpass

ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```

```python
store = AstraDBStore(
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
    collection_name="my_store",
)
```

```python
store.mset([("k1", "v1"), ("k2", [0.1, 0.2, 0.3])])
print(store.mget(["k1", "k2"]))
```

```output
['v1', [0.1, 0.2, 0.3]]
```

### CacheBackedEmbeddings के साथ उपयोग

आप `AstraDBStore` का उपयोग [`CacheBackedEmbeddings`](/docs/modules/data_connection/text_embedding/caching_embeddings) के साथ कर सकते हैं ताकि एम्बेडिंग्स की गणना के परिणाम को कैश किया जा सके।
ध्यान दें कि `AstraDBStore` एम्बेडिंग्स को बाइट्स में परिवर्तित किए बिना एक फ्लोट की सूची के रूप में संग्रहित करता है, इसलिए हम वहां `fromByteStore` का उपयोग नहीं करते।

```python
from langchain.embeddings import CacheBackedEmbeddings, OpenAIEmbeddings

embeddings = CacheBackedEmbeddings(
    underlying_embeddings=OpenAIEmbeddings(), document_embedding_store=store
)
```

## AstraDBByteStore

`AstraDBByteStore` `ByteStore` का एक कार्यान्वयन है जो सब कुछ आपके DataStax Astra DB इंस्टैंस में संग्रहित करता है।
स्टोर कुंजियों को स्ट्रिंग होना चाहिए और उन्हें Astra DB दस्तावेज़ के `_id` फ़ील्ड में मैप किया जाएगा।
स्टोर `bytes` मूल्यों को Astra DB में संग्रहण के लिए base64 स्ट्रिंग में परिवर्तित किया जाता है।
डेटाबेस में, प्रविष्टियों का रूप होगा:

```json
{
  "_id": "<key>",
  "value": "bytes encoded in base 64"
}
```

```python
from langchain_community.storage import AstraDBByteStore
```

```python
from getpass import getpass

ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```

```python
store = AstraDBByteStore(
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
    collection_name="my_store",
)
```

```python
store.mset([("k1", b"v1"), ("k2", b"v2")])
print(store.mget(["k1", "k2"]))
```

```output
[b'v1', b'v2']
```
