---
translated: true
---

# rag-timescale-conversation

यह टेम्पलेट [संवादात्मक](https://python.langchain.com/docs/expression_language/cookbook/retrieval#conversational-retrieval-chain) [पुनर्प्राप्ति](https://python.langchain.com/docs/use_cases/question_answering/) के लिए उपयोग किया जाता है, जो एलएलएम के सबसे लोकप्रिय उपयोग मामलों में से एक है।

यह संवाद इतिहास और पुनर्प्राप्त दस्तावेजों को एलएलएम में संश्लेषण के लिए पास करता है।

## वातावरण सेटअप

यह टेम्पलेट Timescale Vector को वेक्टर स्टोर के रूप में उपयोग करता है और `TIMESCALES_SERVICE_URL` की आवश्यकता होती है। यदि आपके पास अभी तक खाता नहीं है, तो [यहाँ](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) से 90 दिनों का परीक्षण खाता खोलें।

नमूना डेटासेट लोड करने के लिए, `LOAD_SAMPLE_DATA=1` सेट करें। अपना खुद का डेटासेट लोड करने के लिए नीचे दिए गए खंड देखें।

OpenAI मॉडल का उपयोग करने के लिए `OPENAI_API_KEY` पर्यावरण चर सेट करें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U "langchain-cli[serve]"
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package rag-timescale-conversation
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add rag-timescale-conversation
```

और निम्नलिखित कोड को अपने `server.py` फ़ाइल में जोड़ें:

```python
from rag_timescale_conversation import chain as rag_timescale_conversation_chain

add_routes(app, rag_timescale_conversation_chain, path="/rag-timescale_conversation")
```

(वैकल्पिक) अब LangSmith कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहाँ](https://smith.langchain.com/) से LangSmith के लिए साइन अप कर सकते हैं।
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

यह FastAPI ऐप को चालू करेगा और सर्वर [http://localhost:8000](http://localhost:8000) पर स्थानीय रूप से चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/rag-timescale-conversation/playground](http://127.0.0.1:8000/rag-timescale-conversation/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-timescale-conversation")
```

उदाहरण उपयोग के लिए `rag_conversation.ipynb` नोटबुक देखें।

## अपना डेटासेट लोड करना

अपना डेटासेट लोड करने के लिए आपको एक `load_dataset` फ़ंक्शन बनाना होगा। आप `load_ts_git_dataset` फ़ंक्शन में एक उदाहरण देख सकते हैं, जो `load_sample_dataset.py` फ़ाइल में परिभाषित है। आप इसे एक स्टैंडअलोन फ़ंक्शन के रूप में चला सकते हैं (उदाहरण के लिए एक बैश स्क्रिप्ट में) या इसे chain.py में जोड़ सकते हैं (लेकिन फिर आपको इसे केवल एक बार चलाना चाहिए)।
