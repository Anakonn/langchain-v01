---
translated: true
---

# यांडेक्सजीपीटी

यह नोटबुक [यांडेक्सजीपीटी](https://cloud.yandex.com/en/services/yandexgpt) एम्बेडिंग मॉडल के साथ लैंगचेन का उपयोग करने के बारे में बताता है।

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

मॉडल को निर्दिष्ट करने के लिए आप `model_uri` पैरामीटर का उपयोग कर सकते हैं, अधिक जानकारी के लिए [दस्तावेज़](https://cloud.yandex.com/en/docs/yandexgpt/concepts/models#yandexgpt-embeddings) देखें।

डिफ़ॉल्ट रूप से, `text-search-query` का नवीनतम संस्करण पैरामीटर `folder_id` या `YC_FOLDER_ID` पर्यावरण चर में निर्दिष्ट फ़ोल्डर से उपयोग किया जाता है।

```python
from langchain_community.embeddings.yandex import YandexGPTEmbeddings
```

```python
embeddings = YandexGPTEmbeddings()
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_result = embeddings.embed_documents([text])
```

```python
query_result[:5]
```

```output
[-0.021392822265625,
 0.096435546875,
 -0.046966552734375,
 -0.0183258056640625,
 -0.00555419921875]
```

```python
doc_result[0][:5]
```

```output
[-0.021392822265625,
 0.096435546875,
 -0.046966552734375,
 -0.0183258056640625,
 -0.00555419921875]
```
