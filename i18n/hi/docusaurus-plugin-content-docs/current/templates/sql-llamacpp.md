---
translated: true
---

# sql-llamacpp

यह टेम्पलेट उपयोगकर्ता को प्राकृतिक भाषा का उपयोग करके SQL डेटाबेस के साथ इंटरैक्ट करने में सक्षम बनाता है।

यह [Mistral-7b](https://mistral.ai/news/announcing-mistral-7b/) का उपयोग करता है [llama.cpp](https://github.com/ggerganov/llama.cpp) के माध्यम से एक Mac लैपटॉप पर लोकली इनफेरेंस चलाने के लिए।

## पर्यावरण सेटअप

पर्यावरण सेटअप करने के लिए, निम्नलिखित चरणों का उपयोग करें:

```shell
wget https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-MacOSX-arm64.sh
bash Miniforge3-MacOSX-arm64.sh
conda create -n llama python=3.9.16
conda activate /Users/rlm/miniforge3/envs/llama
CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install -U llama-cpp-python --no-cache-dir
```

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप कर सकते हैं:

```shell
langchain app new my-app --package sql-llamacpp
```

यदि आप इसे एक मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस चला सकते हैं:

```shell
langchain app add sql-llamacpp
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from sql_llamacpp import chain as sql_llamacpp_chain

add_routes(app, sql_llamacpp_chain, path="/sql-llamacpp")
```

पैकेज [यहां](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF) से Mistral-7b मॉडल डाउनलोड करेगा। आप अन्य फाइलों का चयन कर सकते हैं और उनके डाउनलोड पथ को निर्दिष्ट कर सकते हैं (ब्राउज़ करें [यहां](https://huggingface.co/TheBloke))।

इस पैकेज में 2023 NBA रोस्टर्स का एक उदाहरण DB शामिल है। आप इस DB को बनाने के निर्देश [यहां](https://github.com/facebookresearch/llama-recipes/blob/main/demo_apps/StructuredLlama.ipynb) देख सकते हैं।

(वैकल्पिक) LangSmith को ट्रेसिंग, मॉनिटरिंग और डिबगिंग LangChain एप्लिकेशनों के लिए कॉन्फ़िगर करें। आप LangSmith के लिए [यहां](https://smith.langchain.com/) साइन अप कर सकते हैं। यदि आपके पास एक्सेस नहीं है, तो आप इस सेक्शन को स्किप कर सकते हैं

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस डायरेक्टरी के अंदर हैं, तो आप सीधे एक LangServe इंस्टेंस को स्पिन अप कर सकते हैं:

```shell
langchain serve
```

यह एक लोकल सर्वर के साथ FastAPI ऐप को चालू कर देगा [http://localhost:8000](http://localhost:8000)

आप सभी टेम्पलेट्स को [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर देख सकते हैं
आप प्लेग्राउंड को [http://127.0.0.1:8000/sql-llamacpp/playground](http://127.0.0.1:8000/sql-llamacpp/playground) पर एक्सेस कर सकते हैं

आप कोड से टेम्पलेट को एक्सेस कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/sql-llamacpp")
```
