---
translated: true
---

# AWS S3 डायरेक्टरी

>[Amazon Simple Storage Service (Amazon S3)](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-folders.html) एक ऑब्जेक्ट स्टोरेज सर्विस है

>[AWS S3 डायरेक्टरी](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-folders.html)

यह कवर करता है कि कैसे `AWS S3 डायरेक्टरी` ऑब्जेक्ट से दस्तावेज़ ऑब्जेक्ट लोड किए जाएं।

```python
%pip install --upgrade --quiet  boto3
```

```python
from langchain_community.document_loaders import S3DirectoryLoader
```

```python
loader = S3DirectoryLoader("testing-hwc")
```

```python
loader.load()
```

## एक प्रीफिक्स निर्दिष्ट करना

आप लोड किए जाने वाले फ़ाइलों पर अधिक सटीक नियंत्रण के लिए एक प्रीफिक्स भी निर्दिष्ट कर सकते हैं।

```python
loader = S3DirectoryLoader("testing-hwc", prefix="fake")
```

```python
loader.load()
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': 's3://testing-hwc/fake.docx'}, lookup_index=0)]
```

## AWS Boto3 क्लाइंट कॉन्फ़िगर करना

आप S3DirectoryLoader बनाते समय नामित तर्कों को पास करके AWS [Boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html) क्लाइंट को कॉन्फ़िगर कर सकते हैं।
यह उपयोगी है, उदाहरण के लिए जब AWS क्रेडेंशियल को पर्यावरण चर के रूप में सेट नहीं किया जा सकता है।
कॉन्फ़िगर किए जा सकने वाले [पैरामीटरों की सूची](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/core/session.html#boto3.session.Session) देखें।

```python
loader = S3DirectoryLoader(
    "testing-hwc", aws_access_key_id="xxxx", aws_secret_access_key="yyyy"
)
```

```python
loader.load()
```
