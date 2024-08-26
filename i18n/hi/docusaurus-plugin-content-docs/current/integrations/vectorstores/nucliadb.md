---
translated: true
---

# NucliaDB

आप एक स्थानीय NucliaDB इंस्टेंस का उपयोग कर सकते हैं या [Nuclia Cloud](https://nuclia.cloud) का उपयोग कर सकते हैं।

स्थानीय इंस्टेंस का उपयोग करते समय, आपको एक Nuclia Understanding API कुंजी की आवश्यकता होती है, ताकि आपके पाठ्य सही ढंग से वेक्टरीकृत और अनुक्रमित हो सकें। आप [https://nuclia.cloud](https://nuclia.cloud) पर एक मुक्त खाता बनाकर और फिर [एक NUA कुंजी बनाकर](https://docs.nuclia.dev/docs/docs/using/understanding/intro) एक कुंजी प्राप्त कर सकते हैं।

```python
%pip install --upgrade --quiet  langchain nuclia
```

## nuclia.cloud के साथ उपयोग

```python
from langchain_community.vectorstores.nucliadb import NucliaDB

API_KEY = "YOUR_API_KEY"

ndb = NucliaDB(knowledge_box="YOUR_KB_ID", local=False, api_key=API_KEY)
```

## एक स्थानीय इंस्टेंस के साथ उपयोग

नोट: डिफ़ॉल्ट रूप से `backend` को `http://localhost:8080` पर सेट किया जाता है।

```python
from langchain_community.vectorstores.nucliadb import NucliaDB

ndb = NucliaDB(knowledge_box="YOUR_KB_ID", local=True, backend="http://my-local-server")
```

## अपने नॉलेज बॉक्स में पाठ जोड़ें और हटाएं

```python
ids = ndb.add_texts(["This is a new test", "This is a second test"])
```

```python
ndb.delete(ids=ids)
```

## अपने नॉलेज बॉक्स में खोजें

```python
results = ndb.similarity_search("Who was inspired by Ada Lovelace?")
print(results[0].page_content)
```
