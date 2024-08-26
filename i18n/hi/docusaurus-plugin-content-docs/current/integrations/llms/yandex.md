---
translated: true
---

# यांडेक्सजीपीटी

यह नोटबुक [यांडेक्सजीपीटी](https://cloud.yandex.com/en/services/yandexgpt) के साथ लैंगचेन का उपयोग करने के बारे में बताता है।

उपयोग करने के लिए, आपके पास `yandexcloud` पायथन पैकेज स्थापित होना चाहिए।

```python
%pip install --upgrade --quiet  yandexcloud
```

पहले, आपको `ai.languageModels.user` भूमिका के साथ एक [सेवा खाता](https://cloud.yandex.com/en/docs/iam/operations/sa/create) बनाना चाहिए।

अगला, आपके पास दो प्रमाणीकरण विकल्प हैं:
- [आईएएम टोकन](https://cloud.yandex.com/en/docs/iam/operations/iam-token/create-for-sa)।
    आप इसे निर्माता पैरामीटर `iam_token` या पर्यावरण चर `YC_IAM_TOKEN` में निर्दिष्ट कर सकते हैं।

- [एपीआई कुंजी](https://cloud.yandex.com/en/docs/iam/operations/api-key/create)
    आप इसे निर्माता पैरामीटर `api_key` या पर्यावरण चर `YC_API_KEY` में निर्दिष्ट कर सकते हैं।

मॉडल को निर्दिष्ट करने के लिए आप `model_uri` पैरामीटर का उपयोग कर सकते हैं, अधिक जानकारी के लिए [प्रलेखन](https://cloud.yandex.com/en/docs/yandexgpt/concepts/models#yandexgpt-generation) देखें।

डिफ़ॉल्ट रूप से, `yandexgpt-lite` का नवीनतम संस्करण पैरामीटर `folder_id` या `YC_FOLDER_ID` पर्यावरण चर में निर्दिष्ट फ़ोल्डर से उपयोग किया जाता है।

```python
from langchain.chains import LLMChain
from langchain_community.llms import YandexGPT
from langchain_core.prompts import PromptTemplate
```

```python
template = "What is the capital of {country}?"
prompt = PromptTemplate.from_template(template)
```

```python
llm = YandexGPT()
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
country = "Russia"

llm_chain.invoke(country)
```

```output
'The capital of Russia is Moscow.'
```
