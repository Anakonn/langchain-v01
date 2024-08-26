---
translated: true
---

# पाइरेट-बोली-कॉन्फ़िगरेबल

यह टेम्पलेट उपयोगकर्ता इनपुट को पाइरेट बोली में बदल देता है। यह दिखाता है कि आप `configurable_alternatives` में कैसे अनुमति दे सकते हैं, जिससे आप खेल मैदान (या API के माध्यम से) में OpenAI, Anthropic या Cohere को अपने LLM प्रदाता के रूप में चुन सकते हैं।

## वातावरण सेटअप

सभी 3 कॉन्फ़िगरेबल वैकल्पिक मॉडल प्रदाताओं तक पहुंचने के लिए निम्नलिखित पर्यावरण चर सेट करें:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `COHERE_API_KEY`

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package pirate-speak-configurable
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add pirate-speak-configurable
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from pirate_speak_configurable import chain as pirate_speak_configurable_chain

add_routes(app, pirate_speak_configurable_chain, path="/pirate-speak-configurable")
```

(वैकल्पिक) अब LangSmith कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहां](https://smith.langchain.com/) से LangSmith के लिए साइन अप कर सकते हैं।
यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इसी निर्देशिका में हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/pirate-speak-configurable/playground](http://127.0.0.1:8000/pirate-speak-configurable/playground) पर खेल मैदान तक पहुंच सकते हैं।

हम कोड के साथ टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/pirate-speak-configurable")
```
