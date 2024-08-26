---
translated: true
---

# rag-conversation

यह टेम्पलेट [वार्तालाप](https://python.langchain.com/docs/expression_language/cookbook/retrieval#conversational-retrieval-chain) [पुनर्प्राप्ति](https://python.langchain.com/docs/use_cases/question_answering/) के लिए उपयोग किया जाता है, जो एलएलएम के सबसे लोकप्रिय उपयोग मामलों में से एक है।

यह वार्तालाप इतिहास और पुनर्प्राप्त दस्तावेजों को एक एलएलएम में संश्लेषण के लिए पास करता है।

## वातावरण सेटअप

यह टेम्पलेट Pinecone को एक वेक्टर स्टोर के रूप में उपयोग करता है और यह आवश्यक है कि `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT`, और `PINECONE_INDEX` सेट किए जाएं।

OpenAI मॉडल तक पहुंच के लिए `OPENAI_API_KEY` पर्यावरण चर सेट करें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package rag-conversation
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल यह चला सकते हैं:

```shell
langchain app add rag-conversation
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_conversation import chain as rag_conversation_chain

add_routes(app, rag_conversation_chain, path="/rag-conversation")
```

(वैकल्पिक) अब LangSmith कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहां](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं।
यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका के भीतर हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/rag-conversation/playground](http://127.0.0.1:8000/rag-conversation/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-conversation")
```
