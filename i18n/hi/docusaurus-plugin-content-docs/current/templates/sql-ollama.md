---
translated: true
---

यह टेम्पलेट एक उपयोगकर्ता को प्राकृतिक भाषा का उपयोग करके एक SQL डेटाबेस के साथ बातचीत करने में सक्षम बनाता है।

यह [Zephyr-7b](https://huggingface.co/HuggingFaceH4/zephyr-7b-alpha) का उपयोग करके [Ollama](https://ollama.ai/library/zephyr) के माध्यम से एक मैक लैपटॉप पर स्थानीय रूप से अनुमान लगाता है।

## वातावरण सेटअप

इस टेम्पलेट का उपयोग करने से पहले, आपको Ollama और SQL डेटाबेस को सेट अप करना होगा।

1. [यहाँ](https://python.langchain.com/docs/integrations/chat/ollama) दिए गए निर्देशों का पालन करें ताकि Ollama डाउनलोड किया जा सके।

2. अपने पसंदीदा LLM डाउनलोड करें:

    * यह पैकेज `zephyr` का उपयोग करता है: `ollama pull zephyr`
    * आप [यहाँ](https://ollama.ai/library) से कई LLM का चयन कर सकते हैं

3. यह पैकेज 2023 NBA रोस्टर का एक उदाहरण डेटाबेस शामिल करता है। इस डेटाबेस को बनाने के लिए निर्देश [यहाँ](https://github.com/facebookresearch/llama-recipes/blob/main/demo_apps/StructuredLlama.ipynb) देखें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package sql-ollama
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add sql-ollama
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from sql_ollama import chain as sql_ollama_chain

add_routes(app, sql_ollama_chain, path="/sql-ollama")
```

(वैकल्पिक) अब आइए LangSmith कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहाँ](https://smith.langchain.com/) से LangSmith के लिए साइन अप कर सकते हैं।
यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका में हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा होगा

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं
हम [http://127.0.0.1:8000/sql-ollama/playground](http://127.0.0.1:8000/sql-ollama/playground) पर खेल सकते हैं

हम कोड से टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/sql-ollama")
```
