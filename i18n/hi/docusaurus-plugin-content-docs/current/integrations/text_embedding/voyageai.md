---
translated: true
---

# वॉयेज एआई

>[वॉयेज एआई](https://www.voyageai.com/) उन्नत एम्बेडिंग/वेक्टराइजेशन मॉडल प्रदान करता है।

चलो वॉयेज एआई एम्बेडिंग क्लास लोड करते हैं। (`pip install langchain-voyageai` के साथ LangChain साझेदार पैकेज स्थापित करें)

```python
from langchain_voyageai import VoyageAIEmbeddings
```

वॉयेज एआई उपयोग और अनुमतियों को मॉनिटर करने के लिए API कुंजियों का उपयोग करता है। अपनी कुंजी प्राप्त करने के लिए, हमारी [होमपेज](https://www.voyageai.com) पर एक खाता बनाएं। फिर, अपने API कुंजी के साथ एक VoyageEmbeddings मॉडल बनाएं। आप निम्नलिखित में से किसी भी मॉडल का उपयोग कर सकते हैं: ([स्रोत](https://docs.voyageai.com/docs/embeddings)):

- `voyage-large-2` (डिफ़ॉल्ट)
- `voyage-code-2`
- `voyage-2`
- `voyage-law-2`
- `voyage-lite-02-instruct`

```python
embeddings = VoyageAIEmbeddings(
    voyage_api_key="[ Your Voyage API key ]", model="voyage-law-2"
)
```

दस्तावेजों को तैयार करें और उनके एम्बेडिंग प्राप्त करने के लिए `embed_documents` का उपयोग करें।

```python
documents = [
    "Caching embeddings enables the storage or temporary caching of embeddings, eliminating the necessity to recompute them each time.",
    "An LLMChain is a chain that composes basic LLM functionality. It consists of a PromptTemplate and a language model (either an LLM or chat model). It formats the prompt template using the input key values provided (and also memory key values, if available), passes the formatted string to LLM and returns the LLM output.",
    "A Runnable represents a generic unit of work that can be invoked, batched, streamed, and/or transformed.",
]
```

```python
documents_embds = embeddings.embed_documents(documents)
```

```python
documents_embds[0][:5]
```

```output
[0.0562174916267395,
 0.018221192061901093,
 0.0025736060924828053,
 -0.009720131754875183,
 0.04108370840549469]
```

इसी तरह, क्वेरी को एम्बेड करने के लिए `embed_query` का उपयोग करें।

```python
query = "What's an LLMChain?"
```

```python
query_embd = embeddings.embed_query(query)
```

```python
query_embd[:5]
```

```output
[-0.0052348352037370205,
 -0.040072452276945114,
 0.0033957737032324076,
 0.01763271726667881,
 -0.019235141575336456]
```

## एक न्यूनतम पुनर्प्राप्ति प्रणाली

एम्बेडिंग की मुख्य विशेषता यह है कि दो एम्बेडिंग के बीच कोसाइन समानता मूल पैसेजों की语义संबंधित को पकड़ती है। यह हमें एम्बेडिंग का उपयोग करके语义पुनर्प्राप्ति/खोज करने में सक्षम बनाता है।

 हम कोसाइन समानता के आधार पर दस्तावेजों के एम्बेडिंग में सबसे करीबी एम्बेडिंग ढूंढ सकते हैं, और LangChain के `KNNRetriever` क्लास का उपयोग करके संबंधित दस्तावेज प्राप्त कर सकते हैं।

```python
from langchain.retrievers import KNNRetriever

retriever = KNNRetriever.from_texts(documents, embeddings)

# retrieve the most relevant documents
result = retriever.invoke(query)
top1_retrieved_doc = result[0].page_content  # return the top1 retrieved result

print(top1_retrieved_doc)
```

```output
An LLMChain is a chain that composes basic LLM functionality. It consists of a PromptTemplate and a language model (either an LLM or chat model). It formats the prompt template using the input key values provided (and also memory key values, if available), passes the formatted string to LLM and returns the LLM output.
```
