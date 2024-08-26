---
translated: true
---

# rag-gpt-crawler

GPT-crawler वेबसाइटों को क्रॉल करेगा ताकि कस्टम GPT या अन्य ऐप्स (RAG) के लिए फ़ाइलें बनाई जा सकें।

यह टेम्पलेट [gpt-crawler](https://github.com/BuilderIO/gpt-crawler) का उपयोग करके एक RAG ऐप बनाता है।

## वातावरण सेटअप

OpenAI मॉडल्स तक पहुंच प्राप्त करने के लिए `OPENAI_API_KEY` पर्यावरण चर सेट करें।

## क्रॉलिंग

GPT-crawler को GPT-crawler रेपो में कॉन्फ़िगरेशन फ़ाइल का उपयोग करके एक सेट URL से सामग्री निकालने के लिए चलाएं।

यहां LangChain उपयोग मामले दस्तावेज़ों के लिए एक उदाहरण कॉन्फ़िगरेशन है:

```javascript
export const config: Config = {
  url: "https://python.langchain.com/docs/use_cases/",
  match: "https://python.langchain.com/docs/use_cases/**",
  selector: ".docMainContainer_gTbr",
  maxPagesToCrawl: 10,
  outputFileName: "output.json",
};
```

फिर, [gpt-crawler](https://github.com/BuilderIO/gpt-crawler) README में वर्णित के अनुसार इसे चलाएं:

```shell
npm start
```

और `output.json` फ़ाइल को इस README वाले फ़ोल्डर में कॉपी करें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package rag-gpt-crawler
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add rag-gpt-crawler
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_chroma import chain as rag_gpt_crawler

add_routes(app, rag_gpt_crawler, path="/rag-gpt-crawler")
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
हम [http://127.0.0.1:8000/rag-gpt-crawler/playground](http://127.0.0.1:8000/rag-gpt-crawler/playground) पर खेल सकते हैं।

हम कोड से टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-gpt-crawler")
```
