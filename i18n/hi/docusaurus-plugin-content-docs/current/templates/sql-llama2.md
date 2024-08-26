---
translated: true
---

यह टेम्पलेट एक उपयोगकर्ता को प्राकृतिक भाषा का उपयोग करके एक SQL डेटाबेस के साथ बातचीत करने में सक्षम बनाता है।

यह [Replicate](https://python.langchain.com/docs/integrations/llms/replicate) द्वारा होस्ट किए गए LLamA2-13b का उपयोग करता है, लेकिन [Fireworks](https://python.langchain.com/docs/integrations/chat/fireworks) सहित LLaMA2 समर्थित किसी भी API के लिए अनुकूलित किया जा सकता है।

टेम्पलेट में 2023 NBA रोस्टर का एक उदाहरण डेटाबेस शामिल है।

इस डेटाबेस को कैसे बनाया जाए, इस बारे में अधिक जानकारी के लिए, [यहां](https://github.com/facebookresearch/llama-recipes/blob/main/demo_apps/StructuredLlama.ipynb) देखें।

## वातावरण सेटअप

सुनिश्चित करें कि आपके वातावरण में `REPLICATE_API_TOKEN` सेट है।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package sql-llama2
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल यह चला सकते हैं:

```shell
langchain app add sql-llama2
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from sql_llama2 import chain as sql_llama2_chain

add_routes(app, sql_llama2_chain, path="/sql-llama2")
```

(वैकल्पिक) अब आइए LangSmith को कॉन्फ़िगर करें।
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
हम [http://127.0.0.1:8000/sql-llama2/playground](http://127.0.0.1:8000/sql-llama2/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/sql-llama2")
```
