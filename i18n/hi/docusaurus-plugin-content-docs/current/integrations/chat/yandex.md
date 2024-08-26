---
sidebar_label: YandexGPT
translated: true
---

# ChatYandexGPT

यह नोटबुक [YandexGPT](https://cloud.yandex.com/en/services/yandexgpt) चैट मॉडल के साथ Langchain का उपयोग करने के बारे में बताता है।

उपयोग करने के लिए, आपके पास `yandexcloud` पायथन पैकेज स्थापित होना चाहिए।

```python
%pip install --upgrade --quiet  yandexcloud
```

पहले, आपको `ai.languageModels.user` भूमिका के साथ एक [सेवा खाता](https://cloud.yandex.com/en/docs/iam/operations/sa/create) बनाना चाहिए।

अगला, आपके पास दो प्रमाणीकरण विकल्प हैं:
- [IAM टोकन](https://cloud.yandex.com/en/docs/iam/operations/iam-token/create-for-sa)।
    आप इसे निर्माता पैरामीटर `iam_token` में या `YC_IAM_TOKEN` पर्यावरण चर में निर्दिष्ट कर सकते हैं।

- [API कुंजी](https://cloud.yandex.com/en/docs/iam/operations/api-key/create)
    आप इसे निर्माता पैरामीटर `api_key` में या `YC_API_KEY` पर्यावरण चर में निर्दिष्ट कर सकते हैं।

मॉडल को निर्दिष्ट करने के लिए आप `model_uri` पैरामीटर का उपयोग कर सकते हैं, अधिक जानकारी के लिए [प्रलेखन](https://cloud.yandex.com/en/docs/yandexgpt/concepts/models#yandexgpt-generation) देखें।

डिफ़ॉल्ट रूप से, `yandexgpt-lite` का नवीनतम संस्करण पैरामीटर `folder_id` या `YC_FOLDER_ID` पर्यावरण चर में निर्दिष्ट फ़ोल्डर से उपयोग किया जाता है।

```python
from langchain_community.chat_models import ChatYandexGPT
from langchain_core.messages import HumanMessage, SystemMessage
```

```python
chat_model = ChatYandexGPT()
```

```python
answer = chat_model.invoke(
    [
        SystemMessage(
            content="You are a helpful assistant that translates English to French."
        ),
        HumanMessage(content="I love programming."),
    ]
)
answer
```

```output
AIMessage(content='Je adore le programmement.')
```
