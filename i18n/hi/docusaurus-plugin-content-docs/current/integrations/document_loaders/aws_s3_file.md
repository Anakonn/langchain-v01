---
translated: true
---

# AWS S3 फ़ाइल

>[Amazon Simple Storage Service (Amazon S3)](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-folders.html) एक ऑब्जेक्ट स्टोरेज सेवा है।

>[AWS S3 बकेट](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingBucket.html)

यह `AWS S3 फ़ाइल` ऑब्जेक्ट से दस्तावेज़ ऑब्जेक्ट कैसे लोड करें, इसके बारे में बताता है।

```python
from langchain_community.document_loaders import S3FileLoader
```

```python
%pip install --upgrade --quiet  boto3
```

```python
loader = S3FileLoader("testing-hwc", "fake.docx")
```

```python
loader.load()
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': 's3://testing-hwc/fake.docx'}, lookup_index=0)]
```

## AWS Boto3 क्लाइंट कॉन्फ़िगर करना

आप S3DirectoryLoader बनाते समय नामित तर्कों को पास करके AWS [Boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html) क्लाइंट को कॉन्फ़िगर कर सकते हैं।
यह तब उपयोगी है जब AWS क्रेडेंशियल को पर्यावरण चर के रूप में सेट नहीं किया जा सकता।
कॉन्फ़िगर किए जा सकने वाले [पैरामीटरों की सूची](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/core/session.html#boto3.session.Session) देखें।

```python
loader = S3FileLoader(
    "testing-hwc", "fake.docx", aws_access_key_id="xxxx", aws_secret_access_key="yyyy"
)
```

```python
loader.load()
```
