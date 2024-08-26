---
translated: true
---

यह पैकेज एक SQL डेटाबेस पर शोध करता है

## उपयोग

यह पैकेज कई मॉडल पर निर्भर करता है, जिनके निम्नलिखित निर्भरताएं हैं:

- OpenAI: `OPENAI_API_KEY` पर्यावरण चर सेट करें
- Ollama: [Ollama इंस्टॉल और चलाएं](https://python.langchain.com/docs/integrations/chat/ollama)
- llama2 (Ollama पर): `ollama pull llama2` (अन्यथा Ollama से 404 त्रुटियां मिलेंगी)

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI इंस्टॉल होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में इंस्टॉल करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package sql-research-assistant
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add sql-research-assistant
```

और निम्नलिखित कोड को अपने `server.py` फ़ाइल में जोड़ें:

```python
from sql_research_assistant import chain as sql_research_assistant_chain

add_routes(app, sql_research_assistant_chain, path="/sql-research-assistant")
```

(वैकल्पिक) अब LangSmith कॉन्फ़िगर करते हैं।
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

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्प्लेट देख सकते हैं।
हम [http://127.0.0.1:8000/sql-research-assistant/playground](http://127.0.0.1:8000/sql-research-assistant/playground) पर प्लेग्राउंड तक पहुंच सकते हैं।

हम कोड से टेम्प्लेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/sql-research-assistant")
```
