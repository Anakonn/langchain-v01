---
translated: true
---

# लैंगचेन - रोबोकॉर्प एक्शन सर्वर

यह टेम्पलेट [रोबोकॉर्प एक्शन सर्वर](https://github.com/robocorp/robocorp) द्वारा सर्व की गई एक्शन को एक एजेंट के लिए उपकरण के रूप में उपयोग करने में सक्षम बनाता है।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package robocorp-action-server
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल यह चला सकते हैं:

```shell
langchain app add robocorp-action-server
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from robocorp_action_server import agent_executor as action_server_chain

add_routes(app, action_server_chain, path="/robocorp-action-server")
```

### एक्शन सर्वर चलाना

एक्शन सर्वर चलाने के लिए, आपके पास रोबोकॉर्प एक्शन सर्वर स्थापित होना चाहिए

```bash
pip install -U robocorp-action-server
```

फिर आप निम्नानुसार एक्शन सर्वर चला सकते हैं:

```bash
action-server new
cd ./your-project-name
action-server start
```

### LangSmith कॉन्फ़िगर करें (वैकल्पिक)

LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहाँ](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं।
यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

### LangServe इंस्टेंस शुरू करें

यदि आप इस निर्देशिका के अंदर हैं, तो आप सीधे एक LangServe इंस्टेंस शुरू कर सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा है।

हम सभी टेम्पलेट को [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर देख सकते हैं।
हम [http://127.0.0.1:8000/robocorp-action-server/playground](http://127.0.0.1:8000/robocorp-action-server/playground) पर खेल सकते हैं।

हम कोड से टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/robocorp-action-server")
```
