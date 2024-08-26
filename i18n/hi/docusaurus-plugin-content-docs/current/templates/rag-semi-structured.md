---
translated: true
---

# rag-अर्ध-संरचित

यह टेम्पलेट अर्ध-संरचित डेटा, जैसे पीडीएफ में पाठ और तालिकाओं पर RAG करता है।

[यह कुकबुक](https://github.com/langchain-ai/langchain/blob/master/cookbook/Semi_Structured_RAG.ipynb) को संदर्भ के रूप में देखें।

## वातावरण सेटअप

OpenAI मॉडल्स तक पहुंच के लिए `OPENAI_API_KEY` पर्यावरण चर सेट करें।

यह [Unstructured](https://unstructured-io.github.io/unstructured/) का उपयोग करता है पीडीएफ पार्सिंग के लिए, जिसके लिए कुछ सिस्टम-स्तर पैकेज इंस्टॉलेशन की आवश्यकता होती है।

मैक पर, आप निम्नलिखित के साथ आवश्यक पैकेज इंस्टॉल कर सकते हैं:

```shell
brew install tesseract poppler
```

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI इंस्टॉल होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में इंस्टॉल करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package rag-semi-structured
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add rag-semi-structured
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_semi_structured import chain as rag_semi_structured_chain

add_routes(app, rag_semi_structured_chain, path="/rag-semi-structured")
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

यदि आप इस निर्देशिका के अंदर हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/rag-semi-structured/playground](http://127.0.0.1:8000/rag-semi-structured/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-semi-structured")
```

टेम्पलेट से कनेक्ट करने के बारे में अधिक जानकारी के लिए, `rag_semi_structured` Jupyter नोटबुक देखें।
