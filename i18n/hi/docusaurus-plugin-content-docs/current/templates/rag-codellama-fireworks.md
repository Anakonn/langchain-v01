---
translated: true
---

# rag-codellama-fireworks

यह टेम्पलेट किसी कोडबेस पर RAG (रिस्क, प्रतिक्रिया और गुणवत्ता) करता है।

यह Fireworks के [LLM inference API](https://blog.fireworks.ai/accelerating-code-completion-with-fireworks-fast-llm-inference-f4e8b5ec534a) द्वारा होस्ट किए गए codellama-34b का उपयोग करता है।

## Environment Setup

Fireworks मॉडल्स तक पहुंच के लिए `FIREWORKS_API_KEY` environment variable सेट करें।

आप इसे [यहां](https://app.fireworks.ai/login?callbackURL=https://app.fireworks.ai) से प्राप्त कर सकते हैं।

## Usage

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI इंस्टॉल होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में इंस्टॉल करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package rag-codellama-fireworks
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add rag-codellama-fireworks
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_codellama_fireworks import chain as rag_codellama_fireworks_chain

add_routes(app, rag_codellama_fireworks_chain, path="/rag-codellama-fireworks")
```

(वैकल्पिक) अब LangSmith कॉन्फ़िगर करते हैं।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहां](https://smith.langchain.com/) से LangSmith के लिए साइन अप कर सकते हैं।
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

यह FastAPI ऐप को चालू करेगा और सर्वर [http://localhost:8000](http://localhost:8000) पर स्थानीय रूप से चल रहा होगा।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/rag-codellama-fireworks/playground](http://127.0.0.1:8000/rag-codellama-fireworks/playground) पर प्लेग्राउंड तक पहुंच सकते हैं।

हम कोड के साथ टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-codellama-fireworks")
```
