---
translated: true
---

# LLMRails

LLMRails एम्बेडिंग्स क्लास को लोड करें।

LLMRails एम्बेडिंग का उपयोग करने के लिए, आपको तर्क द्वारा API कुंजी पास करनी होगी या `LLM_RAILS_API_KEY` कुंजी के साथ वातावरण में इसे सेट करना होगा।
API कुंजी प्राप्त करने के लिए, आपको https://console.llmrails.com/signup पर साइन अप करना होगा और फिर https://console.llmrails.com/api-keys पर जाकर प्लेटफ़ॉर्म में एक कुंजी बनाने के बाद वहां से कुंजी कॉपी करना होगा।

```python
from langchain_community.embeddings import LLMRailsEmbeddings
```

```python
embeddings = LLMRailsEmbeddings(model="embedding-english-v1")  # or embedding-multi-v1
```

```python
text = "This is a test document."
```

एम्बेडिंग्स जनरेट करने के लिए, आप या तो एक अलग-अलग पाठ का प्रश्न पूछ सकते हैं, या आप पाठों की एक सूची का प्रश्न पूछ सकते हैं।

```python
query_result = embeddings.embed_query(text)
query_result[:5]
```

```output
[-0.09996652603149414,
 0.015568195842206478,
 0.17670190334320068,
 0.16521021723747253,
 0.21193109452724457]
```

```python
doc_result = embeddings.embed_documents([text])
doc_result[0][:5]
```

```output
[-0.04242777079343796,
 0.016536075621843338,
 0.10052520781755447,
 0.18272875249385834,
 0.2079043835401535]
```
