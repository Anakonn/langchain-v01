---
translated: true
---

# Huawei OBS डायरेक्टरी

निम्नलिखित कोड Huawei OBS (ऑब्जेक्ट स्टोरेज सर्विस) से दस्तावेजों को लोड करने का प्रदर्शन करता है।

```python
# Install the required package
# pip install esdk-obs-python
```

```python
from langchain_community.document_loaders import OBSDirectoryLoader
```

```python
endpoint = "your-endpoint"
```

```python
# Configure your access credentials\n
config = {"ak": "your-access-key", "sk": "your-secret-key"}
loader = OBSDirectoryLoader("your-bucket-name", endpoint=endpoint, config=config)
```

```python
loader.load()
```

## लोड करने के लिए एक प्रीफिक्स निर्दिष्ट करें

यदि आप बकेट से एक विशिष्ट प्रीफिक्स के साथ ऑब्जेक्ट लोड करना चाहते हैं, तो आप निम्नलिखित कोड का उपयोग कर सकते हैं:

```python
loader = OBSDirectoryLoader(
    "your-bucket-name", endpoint=endpoint, config=config, prefix="test_prefix"
)
```

```python
loader.load()
```

## ECS से प्रमाणीकरण जानकारी प्राप्त करें

यदि आपका langchain Huawei Cloud ECS पर तैनात है और [एजेंसी सेट अप है](https://support.huaweicloud.com/intl/en-us/usermanual-ecs/ecs_03_0166.html#section7), तो लोडर एक्सेस कुंजी और गुप्त कुंजी की आवश्यकता के बिना ECS से सुरक्षा टोकन प्रत्यक्ष प्राप्त कर सकता है।

```python
config = {"get_token_from_ecs": True}
loader = OBSDirectoryLoader("your-bucket-name", endpoint=endpoint, config=config)
```

```python
loader.load()
```

## एक सार्वजनिक बकेट का उपयोग करें

यदि आपके बकेट की बकेट नीति अनाम पहुंच की अनुमति देती है (अनाम उपयोगकर्ताओं के पास `listBucket` और `GetObject` अनुमतियां हैं), तो आप `config` पैरामीटर कॉन्फ़िगर किए बिना सीधे ऑब्जेक्ट लोड कर सकते हैं।

```python
loader = OBSDirectoryLoader("your-bucket-name", endpoint=endpoint)
```

```python
loader.load()
```
