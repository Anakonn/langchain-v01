---
translated: true
---

यह टेम्पलेट में परिचित विचार है कि रिट्रीवल का उपयोग करके एजेंट क्वेरी का उत्तर देने के लिए उपयोग करने के लिए उपकरणों का सेट चुनना है। यह तब उपयोगी है जब आपके पास चयन करने के लिए बहुत सारे उपकरण हों। आप प्रॉम्प्ट में सभी उपकरणों का विवरण नहीं रख सकते (संदर्भ लंबाई समस्याओं के कारण), इसलिए बजाय इसके आप रन टाइम पर विचार करने के लिए N उपकरण गतिशील रूप से चुनते हैं।

इस टेम्पलेट में हम एक कुछ कृत्रिम उदाहरण बनाएंगे। हमारे पास एक वैध उपकरण (खोज) होगा और फिर 99 नकली उपकरण जो केवल बकवास हैं। हम फिर प्रॉम्प्ट टेम्पलेट में एक कदम जोड़ेंगे जो उपयोगकर्ता इनपुट को लेता है और क्वेरी से संबंधित उपकरण पुनर्प्राप्त करता है।

यह टेम्पलेट [इस एजेंट कैसे-](https://python.langchain.com/docs/modules/agents/how_to/custom_agent_with_tool_retrieval) पर आधारित है।

## वातावरण सेटअप

निम्नलिखित पर्यावरण चर सेट किए जाने चाहिए:

`OPENAI_API_KEY` पर्यावरण चर को OpenAI मॉडल तक पहुंच प्राप्त करने के लिए सेट करें।

`TAVILY_API_KEY` पर्यावरण चर को Tavily तक पहुंच प्राप्त करने के लिए सेट करें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package openai-functions-tool-retrieval-agent
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल यह चला सकते हैं:

```shell
langchain app add openai-functions-tool-retrieval-agent
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from openai_functions_tool_retrieval_agent import agent_executor as openai_functions_tool_retrieval_agent_chain

add_routes(app, openai_functions_tool_retrieval_agent_chain, path="/openai-functions-tool-retrieval-agent")
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

यह FastAPI ऐप को चालू करेगा और सर्वर [http://localhost:8000](http://localhost:8000) पर स्थानीय रूप से चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/openai-functions-tool-retrieval-agent/playground](http://127.0.0.1:8000/openai-functions-tool-retrieval-agent/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/openai-functions-tool-retrieval-agent")
```
