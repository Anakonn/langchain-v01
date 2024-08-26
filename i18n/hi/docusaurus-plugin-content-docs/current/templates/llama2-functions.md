---
translated: true
---

# llama2-functions

यह टेम्पलेट [LLaMA2 मॉडल जो निर्दिष्ट JSON आउटपुट स्कीमा का समर्थन करता है](https://github.com/ggerganov/llama.cpp/blob/master/grammars/README.md) का उपयोग करके अव्यवस्थित डेटा से संरचित डेटा का निष्कर्षण करता है।

निष्कर्षण स्कीमा `chain.py` में सेट की जा सकती है।

## Environment Setup

यह [Replicate द्वारा होस्ट किए गए LLaMA2-13b मॉडल](https://replicate.com/andreasjansson/llama-2-13b-chat-gguf/versions) का उपयोग करेगा।

सुनिश्चित करें कि आपके पर्यावरण में `REPLICATE_API_TOKEN` सेट है।

## Usage

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package llama2-functions
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल यह चला सकते हैं:

```shell
langchain app add llama2-functions
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from llama2_functions import chain as llama2_functions_chain

add_routes(app, llama2_functions_chain, path="/llama2-functions")
```

(वैकल्पिक) अब आइए LangSmith कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहाँ](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं।
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

यह FastAPI ऐप को चालू करेगा और सर्वर [http://localhost:8000](http://localhost:8000) पर स्थानीय रूप से चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/llama2-functions/playground](http://127.0.0.1:8000/llama2-functions/playground) पर प्लेग्राउंड तक पहुंच सकते हैं।

हम कोड के साथ टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/llama2-functions")
```
