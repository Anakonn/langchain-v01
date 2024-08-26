---
translated: true
---

यह टेम्पलेट उपयोगकर्ता को `pgvector` का उपयोग करके PostgreSQL के साथ语义搜索/RAG को जोड़ने में सक्षम बनाता है।

यह [PGVector](https://github.com/pgvector/pgvector) एक्सटेंशन का उपयोग करता है, जैसा कि [RAG empowered SQL cookbook](https://github.com/langchain-ai/langchain/blob/master/cookbook/retrieval_in_sql.ipynb) में दिखाया गया है।

## Environment Setup

यदि आप `ChatOpenAI` को अपने LLM के रूप में उपयोग कर रहे हैं, तो सुनिश्चित करें कि आपके पर्यावरण में `OPENAI_API_KEY` सेट है। आप `chain.py` के भीतर LLM और एम्बेडिंग मॉडल दोनों को बदल सकते हैं।

और आप टेम्पलेट द्वारा उपयोग के लिए निम्नलिखित पर्यावरण चर कॉन्फ़िगर कर सकते हैं (डिफ़ॉल्ट मान कंसों में हैं)

- `POSTGRES_USER` (postgres)
- `POSTGRES_PASSWORD` (test)
- `POSTGRES_DB` (vectordb)
- `POSTGRES_HOST` (localhost)
- `POSTGRES_PORT` (5432)

यदि आपके पास कोई postgres इंस्टेंस नहीं है, तो आप इसे स्थानीय रूप से Docker में चला सकते हैं:

```bash
docker run \
  --name some-postgres \
  -e POSTGRES_PASSWORD=test \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=vectordb \
  -p 5432:5432 \
  postgres:16
```

और बाद में फिर से शुरू करने के लिए, उपर्युक्त `--name` का उपयोग करें:

```bash
docker start some-postgres
```

### PostgreSQL Database setup

`pgvector` एक्सटेंशन को सक्षम करने के अलावा, आपको अपने SQL क्वेरी में सेमेंटिक खोज चलाने से पहले कुछ सेटअप करने की आवश्यकता होगी।

PostgreSQL डेटाबेस पर RAG चलाने के लिए, आपको उन विशिष्ट कॉलमों के लिए एम्बेडिंग जनरेट करने की आवश्यकता होगी जिनके लिए आप इसका उपयोग करना चाहते हैं।

यह प्रक्रिया [RAG empowered SQL cookbook](https://github.com/langchain-ai/langchain/blob/master/cookbook/retrieval_in_sql.ipynb) में कवर की गई है, लेकिन समग्र दृष्टिकोण में निम्नलिखित शामिल हैं:
1. कॉलम में अद्वितीय मूल्यों के लिए क्वेरी करना
2. उन मूल्यों के लिए एम्बेडिंग जनरेट करना
3. अलग कॉलम या सहायक तालिका में एम्बेडिंग को संग्रहीत करना।

## Usage

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package sql-pgvector
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल यह चला सकते हैं:

```shell
langchain app add sql-pgvector
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from sql_pgvector import chain as sql_pgvector_chain

add_routes(app, sql_pgvector_chain, path="/sql-pgvector")
```

(वैकल्पिक) अब LangSmith को कॉन्फ़िगर करते हैं।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहां](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं।
यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका के भीतर हैं, तो आप सीधे एक LangServe इंस्टेंस शुरू कर सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को शुरू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/sql-pgvector/playground](http://127.0.0.1:8000/sql-pgvector/playground) पर खेल सकते हैं।

हम कोड से टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/sql-pgvector")
```
