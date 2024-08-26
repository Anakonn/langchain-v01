---
translated: true
---

# श्रृंखला-नोट (विकिपीडिया)

https://arxiv.org/pdf/2311.09210.pdf में वर्णित श्रृंखला-नोट को लागू करता है। यू आदि द्वारा। विकिपीडिया को पुनर्प्राप्ति के लिए उपयोग करता है।

यहां उपयोग किए जा रहे प्रॉम्प्ट को देखें https://smith.langchain.com/hub/bagatur/chain-of-note-wiki।

## वातावरण सेटअप

एंथ्रोपिक क्लॉड-3-सोनेट-20240229 चैट मॉडल का उपयोग करता है। एंथ्रोपिक API कुंजी सेट करें:

```bash
export ANTHROPIC_API_KEY="..."
```

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U "langchain-cli[serve]"
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package chain-of-note-wiki
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप केवल निम्नलिखित चला सकते हैं:

```shell
langchain app add chain-of-note-wiki
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from chain_of_note_wiki import chain as chain_of_note_wiki_chain

add_routes(app, chain_of_note_wiki_chain, path="/chain-of-note-wiki")
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

यदि आप इस निर्देशिका के अंदर हैं, तो आप सीधे एक LangServe इंस्टेंस शुरू कर सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को शुरू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/chain-of-note-wiki/playground](http://127.0.0.1:8000/chain-of-note-wiki/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/chain-of-note-wiki")
```
