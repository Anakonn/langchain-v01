---
translated: true
---

# विचार का स्केलेटन

[इस](https://sites.google.com/view/sot-llm) पेपर से "विचार का स्केलेटन" को लागू करता है।

यह तकनीक लंबी पीढ़ियों को तेजी से जनरेट करने में मदद करती है, पहले स्केलेटन जनरेट करके, फिर आउटलाइन के प्रत्येक बिंदु को जनरेट करके।

## वातावरण सेटअप

OpenAI मॉडल्स तक पहुंचने के लिए `OPENAI_API_KEY` पर्यावरण चर सेट करें।

अपना `OPENAI_API_KEY` प्राप्त करने के लिए, अपने OpenAI खाते पर [API कुंजियां](https://platform.openai.com/account/api-keys) पर जाएं और एक नया गोपनीय कुंजी बनाएं।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package skeleton-of-thought
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add skeleton-of-thought
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from skeleton_of_thought import chain as skeleton_of_thought_chain

add_routes(app, skeleton_of_thought_chain, path="/skeleton-of-thought")
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

यदि आप इस निर्देशिका के भीतर हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा है।

हम सभी टेम्पलेट को [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर देख सकते हैं।
हम [http://127.0.0.1:8000/skeleton-of-thought/playground](http://127.0.0.1:8000/skeleton-of-thought/playground) पर प्लेग्राउंड तक पहुंच सकते हैं।

हम कोड से टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/skeleton-of-thought")
```
