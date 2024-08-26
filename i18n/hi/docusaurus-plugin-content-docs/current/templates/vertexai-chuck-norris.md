---
translated: true
---

# vertexai-chuck-norris

यह टेम्पलेट Vertex AI PaLM2 का उपयोग करके Chuck Norris के बारे में जोक्स बनाता है।

## वातावरण सेटअप

सबसे पहले, यह सुनिश्चित करें कि आपके पास एक सक्रिय बिलिंग खाते के साथ Google Cloud परियोजना है, और [gcloud CLI स्थापित](https://cloud.google.com/sdk/docs/install) है।

[अनुप्रयोग डिफ़ॉल्ट क्रेडेंशियल](https://cloud.google.com/docs/authentication/provide-credentials-adc) कॉन्फ़िगर करें:

```shell
gcloud auth application-default login
```

उपयोग करने के लिए डिफ़ॉल्ट Google Cloud परियोजना सेट करने के लिए, यह कमांड चलाएं और [परियोजना आईडी](https://support.google.com/googleapi/answer/7014113?hl=en) सेट करें जिसका उपयोग करना चाहते हैं:

```shell
gcloud config set project [PROJECT-ID]
```

[Vertex AI API](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com) को परियोजना के लिए सक्षम करें:

```shell
gcloud services enable aiplatform.googleapis.com
```

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain परियोजना बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप यह कर सकते हैं:

```shell
langchain app new my-app --package pirate-speak
```

यदि आप इसे किसी मौजूदा परियोजना में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add vertexai-chuck-norris
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from vertexai_chuck_norris.chain import chain as vertexai_chuck_norris_chain

add_routes(app, vertexai_chuck_norris_chain, path="/vertexai-chuck-norris")
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

यदि आप इस निर्देशिका के भीतर हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर [http://localhost:8000](http://localhost:8000) पर स्थानीय रूप से चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/vertexai-chuck-norris/playground](http://127.0.0.1:8000/vertexai-chuck-norris/playground) पर खेल सकते हैं।

हम कोड से टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/vertexai-chuck-norris")
```
