---
translated: true
---

# csv-एजेंट

यह टेम्पलेट एक [csv एजेंट](https://python.langchain.com/docs/integrations/toolkits/csv) का उपयोग करता है जिसमें उपकरण (Python REPL) और मेमोरी (vectorstore) हैं जो पाठ्य डेटा के साथ इंटरैक्शन (प्रश्न-उत्तर) के लिए हैं।

## वातावरण सेटअप

OpenAI मॉडल्स तक पहुंच के लिए `OPENAI_API_KEY` पर्यावरण चर को सेट करें।

वातावरण को सेट करने के लिए, `ingest.py` स्क्रिप्ट को चलाया जाना चाहिए ताकि vectorstore में इंजेस्ट किया जा सके।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package csv-agent
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल यह चला सकते हैं:

```shell
langchain app add csv-agent
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from csv_agent.agent import agent_executor as csv_agent_chain

add_routes(app, csv_agent_chain, path="/csv-agent")
```

(वैकल्पिक) अब LangSmith को कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहां](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं।
यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका के अंदर हैं, तो आप सीधे एक LangServe इंस्टेंस शुरू कर सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को शुरू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/csv-agent/playground](http://127.0.0.1:8000/csv-agent/playground) पर प्लेग्राउंड तक पहुंच सकते हैं।

हम कोड के साथ टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/csv-agent")
```
