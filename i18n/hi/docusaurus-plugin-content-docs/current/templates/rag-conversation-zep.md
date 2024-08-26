---
translated: true
---

# rag-conversation-zep

यह टेम्पलेट Zep का उपयोग करके एक RAG संवाद ऐप बनाने का प्रदर्शन करता है।

इस टेम्पलेट में शामिल:
- दस्तावेज़ों के सेट के साथ एक [Zep Document Collection](https://docs.getzep.com/sdk/documents/) को भरना (अन्य वेक्टर डेटाबेस में एक संग्रहण अनुक्रमणिका के समान होता है)।
- दस्तावेज़ों को वेक्टर के रूप में एम्बेड करने के लिए Zep की [integrated embedding](https://docs.getzep.com/deployment/embeddings/) कार्यक्षमता का उपयोग करना।
- Zep के निर्मित, हार्डवेयर त्वरित [Maximal Marginal Relevance](https://docs.getzep.com/sdk/search_query/) (MMR) पुनः रैंकिंग का उपयोग करके दस्तावेज़ों को पुनः प्राप्त करने के लिए एक LangChain [ZepVectorStore Retriever](https://docs.getzep.com/sdk/documents/) को कॉन्फ़िगर करना।
- पंक्तियाँ, एक सरल चैट इतिहास डेटा संरचना, और अन्य घटक जो एक RAG संवाद ऐप बनाने के लिए आवश्यक होते हैं।
- RAG संवाद श्रृंखला।

## [Zep - LLM Apps के लिए तेज़, स्केलेबल निर्माण ब्लॉक्स](https://www.getzep.com/) के बारे में

Zep उत्पादन के लिए LLM ऐप्स का एक ओपन सोर्स प्लेटफ़ॉर्म है। LangChain या LlamaIndex में निर्मित प्रोटोटाइप, या एक कस्टम ऐप, से उत्पादन में मिनटों में जाएँ बिना कोड फिर से लिखे।

मुख्य विशेषताएं:

- तेज़! Zep के असिंक एक्सट्रैक्टर्स आपके चैट लूप के स्वतंत्र रूप से काम करते हैं, जिससे एक तेज़ उपयोगकर्ता अनुभव सुनिश्चित होता है।
- दीर्घकालिक स्मृति स्थायित्व, आपकी सारांशण रणनीति की परवाह किए बिना ऐतिहासिक संदेशों तक पहुंच के साथ।
- एक कॉन्फ़िगरेबल संदेश विंडो के आधार पर स्मृति संदेशों का स्वतः-सारांशण। सारांशों की एक श्रृंखला संग्रहीत होती है, जो भविष्य की सारांशण रणनीतियों के लिए लचीलापन प्रदान करती है।
- यादों और मेटाडेटा पर हाइब्रिड खोज, संदेशों को सृजन पर स्वतः एम्बेड किया जाता है।
- एंटिटी एक्सट्रैक्टर जो स्वतः संदेशों से नामित एंटिटी निकालता है और उन्हें संदेश मेटाडेटा में संग्रहीत करता है।
- स्मृतियों और सारांशों की स्वतः-टोकन गणना, जिससे प्रॉम्प्ट असेंबली पर अधिक सटीक नियंत्रण मिलता है।
- Python और JavaScript SDKs।

Zep प्रोजेक्ट: https://github.com/getzep/zep | दस्तावेज़: https://docs.getzep.com/

## पर्यावरण सेटअप

[Quick Start Guide](https://docs.getzep.com/deployment/quickstart/) का पालन करके एक Zep सेवा सेट करें।

## Zep Collection में दस्तावेज़ों का निग्रहण

परीक्षण दस्तावेज़ों को एक Zep Collection में निग्रहण करने के लिए `python ingest.py` चलाएँ। संग्रहण नाम और दस्तावेज़ स्रोत को संशोधित करने के लिए फ़ाइल की समीक्षा करें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U "langchain-cli[serve]"
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप कर सकते हैं:

```shell
langchain app new my-app --package rag-conversation-zep
```

यदि आप इसे एक मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस चला सकते हैं:

```shell
langchain app add rag-conversation-zep
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_conversation_zep import chain as rag_conversation_zep_chain

add_routes(app, rag_conversation_zep_chain, path="/rag-conversation-zep")
```

(वैकल्पिक) आइए अब LangSmith कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डिबग करने में मदद करेगा।
आप [यहां](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं।
यदि आपके पास पहुंच नहीं है, तो आप इस अनुभाग को छोड़ सकते हैं

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका के अंदर हैं, तो आप सीधे एक LangServe उदाहरण को स्पिन कर सकते हैं:

```shell
langchain serve
```

यह एक FastAPI ऐप को शुरू करेगा जिसमें एक सर्वर लोकली चल रहा है
[http://localhost:8000](http://localhost:8000)

हम सभी टेम्प्लेट्स को [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर देख सकते हैं
हम प्लेग्राउंड को [http://127.0.0.1:8000/rag-conversation-zep/playground](http://127.0.0.1:8000/rag-conversation-zep/playground) पर एक्सेस कर सकते हैं

हम कोड से टेम्प्लेट को एक्सेस कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-conversation-zep")
```
