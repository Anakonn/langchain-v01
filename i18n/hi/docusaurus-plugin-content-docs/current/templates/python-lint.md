---
translated: true
---

# python-lint

यह एजेंट उचित स्वरूपण और लिंटिंग पर ध्यान केंद्रित करते हुए उच्च गुणवत्ता वाले Python कोड उत्पन्न करने में विशेषज्ञ है। यह `black`, `ruff` और `mypy` का उपयोग करता है ताकि कोड मानक गुणवत्ता जांचों को पूरा करे।

यह कोडिंग प्रक्रिया को सरल बनाता है क्योंकि यह इन जांचों को एकीकृत और प्रतिक्रिया देता है, जिससे विश्वसनीय और एकरूप कोड आउटपुट प्राप्त होता है।

यह वास्तव में लिखे गए कोड को निष्पादित नहीं कर सकता क्योंकि कोड निष्पादन अतिरिक्त निर्भरताओं और संभावित सुरक्षा भेद्यताओं को पेश कर सकता है।
यह एजेंट कोड जनन कार्यों के लिए एक सुरक्षित और कुशल समाधान बनाता है।

आप इसका उपयोग सीधे Python कोड उत्पन्न करने के लिए कर सकते हैं, या इसे योजना और निष्पादन एजेंटों के साथ नेटवर्क कर सकते हैं।

## वातावरण सेटअप

- `black`, `ruff` और `mypy` इंस्टॉल करें: `pip install -U black ruff mypy`
- `OPENAI_API_KEY` पर्यावरण चर सेट करें।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package python-lint
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add python-lint
```

और निम्नलिखित कोड को अपने `server.py` फ़ाइल में जोड़ें:

```python
from python_lint import agent_executor as python_lint_agent

add_routes(app, python_lint_agent, path="/python-lint")
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

यदि आप इस निर्देशिका के भीतर हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/python-lint/playground](http://127.0.0.1:8000/python-lint/playground) पर खेल सकते हैं।

हम कोड से टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/python-lint")
```
