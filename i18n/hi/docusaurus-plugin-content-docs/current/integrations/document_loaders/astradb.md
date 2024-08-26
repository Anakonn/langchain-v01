---
translated: true
---

# AstraDB

DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) एक सर्वरलेस वेक्टर-क्षमता वाला डेटाबेस है जो कैसेंड्रा पर निर्मित है और एक आसान-इस्तेमाल JSON API के माध्यम से सुविधाजनक रूप से उपलब्ध कराया जाता है।

## अवलोकन

AstraDB डॉक्यूमेंट लोडर AstraDB डेटाबेस से Langchain दस्तावेजों की एक सूची लौटाता है।

लोडर निम्नलिखित पैरामीटर लेता है:

* `api_endpoint`: AstraDB API एंडपॉइंट। यह इस तरह दिखता है `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com`
* `token`: AstraDB टोकन। यह इस तरह दिखता है `AstraCS:6gBhNmsk135....`
* `collection_name`: AstraDB संग्रह का नाम
* `namespace`: (वैकल्पिक) AstraDB नेमस्पेस
* `filter_criteria`: (वैकल्पिक) खोज क्वेरी में उपयोग किया गया फ़िल्टर
* `projection`: (वैकल्पिक) खोज क्वेरी में उपयोग की गई प्रोजेक्शन
* `find_options`: (वैकल्पिक) खोज क्वेरी में उपयोग किए गए विकल्प
* `nb_prefetched`: (वैकल्पिक) लोडर द्वारा पूर्व-प्राप्त किए गए दस्तावेजों की संख्या
* `extraction_function`: (वैकल्पिक) AstraDB दस्तावेज को LangChain `page_content` स्ट्रिंग में रूपांतरित करने के लिए एक फ़ंक्शन। डिफ़ॉल्ट `json.dumps` है

LangChain दस्तावेजों के मेटाडेटा आउटपुट में निम्नलिखित मेटाडेटा सेट किया जाता है:

```python
{
    metadata : {
        "namespace": "...",
        "api_endpoint": "...",
        "collection": "..."
    }
}
```

## दस्तावेज लोडर के साथ दस्तावेज लोड करें

```python
from langchain_community.document_loaders import AstraDBLoader
```

```python
from getpass import getpass

ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```

```python
loader = AstraDBLoader(
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
    collection_name="movie_reviews",
    projection={"title": 1, "reviewtext": 1},
    find_options={"limit": 10},
)
```

```python
docs = loader.load()
```

```python
docs[0]
```

```output
Document(page_content='{"_id": "659bdffa16cbc4586b11a423", "title": "Dangerous Men", "reviewtext": "\\"Dangerous Men,\\" the picture\'s production notes inform, took 26 years to reach the big screen. After having seen it, I wonder: What was the rush?"}', metadata={'namespace': 'default_keyspace', 'api_endpoint': 'https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com', 'collection': 'movie_reviews'})
```
