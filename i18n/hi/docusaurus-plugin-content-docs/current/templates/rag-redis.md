---
translated: true
---

# rag-redis

यह टेम्पलेट Redis (vector database) और OpenAI (LLM) का उपयोग करके Nike के वित्तीय 10k फाइलिंग दस्तावेजों पर RAG (Retrieval Augmented Generation) करता है।

यह `all-MiniLM-L6-v2` सेंटेंस ट्रांसफॉर्मर का उपयोग करता है pdf के टुकड़ों और उपयोगकर्ता के प्रश्नों को एम्बेड करने के लिए।

## Environment Setup

[OpenAI](https://platform.openai.com) मॉडल्स तक पहुंच के लिए `OPENAI_API_KEY` environment variable सेट करें:

```bash
export OPENAI_API_KEY= <YOUR OPENAI API KEY>
```

निम्नलिखित [Redis](https://redis.com/try-free) environment variables सेट करें:

```bash
export REDIS_HOST = <YOUR REDIS HOST>
export REDIS_PORT = <YOUR REDIS PORT>
export REDIS_USER = <YOUR REDIS USER NAME>
export REDIS_PASSWORD = <YOUR REDIS PASSWORD>
```

## Supported Settings

हम इस एप्लिकेशन को कॉन्फ़िगर करने के लिए कई environment variables का उपयोग करते हैं

| Environment Variable | Description                       | Default Value |
|----------------------|-----------------------------------|---------------|
| `DEBUG`            | Langchain डीबगिंग लॉग को सक्षम या अक्षम करें       | True         |
| `REDIS_HOST`           | Redis सर्वर के लिए होस्टनेम     | "localhost"   |
| `REDIS_PORT`           | Redis सर्वर के लिए पोर्ट         | 6379          |
| `REDIS_USER`           | Redis सर्वर के लिए उपयोगकर्ता         | "" |
| `REDIS_PASSWORD`       | Redis सर्वर के लिए पासवर्ड     | "" |
| `REDIS_URL`            | Redis से कनेक्ट करने के लिए पूर्ण URL  | `None`, यदि प्रदान नहीं किया गया तो उपयोगकर्ता, पासवर्ड, होस्ट और पोर्ट से निर्मित |
| `INDEX_NAME`           | वेक्टर इंडेक्स का नाम          | "rag-redis"   |

## Usage

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI और Pydantic को एक Python वर्चुअल एनवायरनमेंट में स्थापित होना चाहिए:

```shell
pip install -U langchain-cli pydantic==1.10.13
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package rag-redis
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल यह चला सकते हैं:

```shell
langchain app add rag-redis
```

और अपने `app/server.py` फ़ाइल में निम्नलिखित कोड स्निपेट जोड़ें:

```python
from rag_redis.chain import chain as rag_redis_chain

add_routes(app, rag_redis_chain, path="/rag-redis")
```

(वैकल्पिक) अब LangSmith को कॉन्फ़िगर करें।
LangSmith हमें LangChain एप्लिकेशन को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहां](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं।
यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका में हैं, तो आप सीधे एक LangServe इंस्टेंस शुरू कर सकते हैं:

```shell
langchain serve
```

यह FastAPI एप्लिकेशन को शुरू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/rag-redis/playground](http://127.0.0.1:8000/rag-redis/playground) पर खेल सकते हैं।

हम कोड से टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-redis")
```
