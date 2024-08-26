---
translated: true
---

# खरीद सहायक

यह टेम्पलेट एक खरीद सहायक बनाता है जो उपयोगकर्ताओं को उनके द्वारा खोजे जा रहे उत्पादों को खोजने में मदद करता है।

यह टेम्पलेट `Ionic` का उपयोग करके उत्पादों की खोज करेगा।

## वातावरण सेटअप

यह टेम्पलेट `OpenAI` का डिफ़ॉल्ट रूप से उपयोग करेगा।
सुनिश्चित करें कि आपके वातावरण में `OPENAI_API_KEY` सेट है।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package shopping-assistant
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add shopping-assistant
```

और निम्नलिखित कोड को अपने `server.py` फ़ाइल में जोड़ें:

```python
from shopping_assistant.agent import agent_executor as shopping_assistant_chain

add_routes(app, shopping_assistant_chain, path="/shopping-assistant")
```

(वैकल्पिक) अब आइए LangSmith को कॉन्फ़िगर करें।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहाँ](https://smith.langchain.com/) से LangSmith के लिए साइन अप कर सकते हैं।
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
हम [http://127.0.0.1:8000/shopping-assistant/playground](http://127.0.0.1:8000/shopping-assistant/playground) पर खेल सकते हैं।

हम कोड से टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/shopping-assistant")
```
