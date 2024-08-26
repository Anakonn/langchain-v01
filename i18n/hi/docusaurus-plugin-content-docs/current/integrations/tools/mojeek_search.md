---
translated: true
---

# मोजीक खोज

निम्नलिखित नोटबुक मोजीक खोज का उपयोग करके परिणाम प्राप्त करने की व्याख्या करेगा। कृपया [मोजीक वेबसाइट](https://www.mojeek.com/services/search/web-search-api/) पर जाकर एक API कुंजी प्राप्त करें।

```python
from langchain_community.tools import MojeekSearch
```

```python
api_key = "KEY"  # obtained from Mojeek Website
```

```python
search = MojeekSearch.config(api_key=api_key, search_kwargs={"t": 10})
```

`search_kwargs` में आप [मोजीक दस्तावेज़ीकरण](https://www.mojeek.com/support/api/search/request_parameters.html) पर पाए जा सकने वाले किसी भी खोज मापदंड को जोड़ सकते हैं।

```python
search.run("mojeek")
```
