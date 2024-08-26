---
translated: true
---

# stepback-qa-प्रोम्प्टिंग

यह टेम्प्लेट "स्टेप-बैक" प्रोम्प्टिंग तकनीक को दोहराता है जो जटिल प्रश्नों पर प्रदर्शन में सुधार करता है, पहले एक "स्टेप बैक" प्रश्न पूछकर।

यह तकनीक नियमित प्रश्न-उत्तर अनुप्रयोगों के साथ संयुक्त की जा सकती है, मूल और स्टेप-बैक प्रश्न दोनों पर पुनर्प्राप्ति करके।

इस बारे में अधिक जानकारी के लिए पेपर [यहाँ](https://arxiv.org/abs/2310.06117) और Cobus Greyling के एक उत्कृष्ट ब्लॉग पोस्ट [यहाँ](https://cobusgreyling.medium.com/a-new-prompt-engineering-technique-has-been-introduced-called-step-back-prompting-b00e8954cacb) पढ़ें

हम इस टेम्प्लेट में चैट मॉडल के साथ बेहतर काम करने के लिए प्रोम्प्ट को थोड़ा संशोधित करेंगे।

## वातावरण सेटअप

OpenAI मॉडल तक पहुंच के लिए `OPENAI_API_KEY` पर्यावरण चर सेट करें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package stepback-qa-prompting
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add stepback-qa-prompting
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from stepback_qa_prompting.chain import chain as stepback_qa_prompting_chain

add_routes(app, stepback_qa_prompting_chain, path="/stepback-qa-prompting")
```

(वैकल्पिक) अब LangSmith कॉन्फ़िगर करें।
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

यह FastAPI ऐप को स्टार्ट करेगा और स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर सर्वर चलाएगा।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्प्लेट देख सकते हैं।
हम [http://127.0.0.1:8000/stepback-qa-prompting/playground](http://127.0.0.1:8000/stepback-qa-prompting/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्प्लेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/stepback-qa-prompting")
```
