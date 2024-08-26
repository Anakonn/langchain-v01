---
translated: true
---

यह टेम्पलेट [GPT Researcher](https://github.com/assafelovic/gpt-researcher) का एक संस्करण लागू करता है जिसका उपयोग आप एक अनुसंधान एजेंट के लिए आरंभिक बिंदु के रूप में कर सकते हैं।

## वातावरण सेटअप

डिफ़ॉल्ट टेम्पलेट ChatOpenAI और DuckDuckGo पर निर्भर करता है, इसलिए आपको निम्नलिखित पर्यावरण चर की आवश्यकता होगी:

- `OPENAI_API_KEY`

और Tavily LLM-अनुकूलित खोज इंजन का उपयोग करने के लिए, आपको निम्नलिखित की आवश्यकता होगी:

- `TAVILY_API_KEY`

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package research-assistant
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल निम्नलिखित चला सकते हैं:

```shell
langchain app add research-assistant
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from research_assistant import chain as research_assistant_chain

add_routes(app, research_assistant_chain, path="/research-assistant")
```

(वैकल्पिक) अब LangSmith कॉन्फ़िगर करते हैं।
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
हम [http://127.0.0.1:8000/research-assistant/playground](http://127.0.0.1:8000/research-assistant/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/research-assistant")
```
