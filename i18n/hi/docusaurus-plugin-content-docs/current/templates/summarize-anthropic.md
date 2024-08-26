---
translated: true
---

# सारांश-एंथ्रोपिक

यह टेम्पलेट एंथ्रोपिक के `claude-3-sonnet-20240229` का उपयोग करके लंबे दस्तावेजों का सारांश बनाता है।

यह 100k टोकन के बड़े संदर्भ विंडो का लाभ उठाता है, जिससे 100 पृष्ठों से अधिक के दस्तावेजों का सारांश बनाया जा सकता है।

आप `chain.py` में सारांकन प्रोम्प्ट देख सकते हैं।

## वातावरण सेटअप

एंथ्रोपिक मॉडल्स तक पहुंच प्राप्त करने के लिए `ANTHROPIC_API_KEY` पर्यावरण चर सेट करें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package summarize-anthropic
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add summarize-anthropic
```

और निम्नलिखित कोड को अपने `server.py` फ़ाइल में जोड़ें:

```python
from summarize_anthropic import chain as summarize_anthropic_chain

add_routes(app, summarize_anthropic_chain, path="/summarize-anthropic")
```

(वैकल्पिक) अब आइए LangSmith कॉन्फ़िगर करें।
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

यह FastAPI ऐप को चालू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/summarize-anthropic/playground](http://127.0.0.1:8000/summarize-anthropic/playground) पर खेल सकते हैं।

हम कोड से टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/summarize-anthropic")
```
