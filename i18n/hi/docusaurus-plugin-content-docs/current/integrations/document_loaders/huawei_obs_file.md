---
translated: true
---

# Huawei OBS फ़ाइल

निम्नलिखित कोड दिखाता है कि Huawei OBS (ऑब्जेक्ट स्टोरेज सर्विस) से एक ऑब्जेक्ट को कैसे लोड किया जाए जैसे कि दस्तावेज।

```python
# Install the required package
# pip install esdk-obs-python
```

```python
from langchain_community.document_loaders.obs_file import OBSFileLoader
```

```python
endpoint = "your-endpoint"
```

```python
from obs import ObsClient

obs_client = ObsClient(
    access_key_id="your-access-key",
    secret_access_key="your-secret-key",
    server=endpoint,
)
loader = OBSFileLoader("your-bucket-name", "your-object-key", client=obs_client)
```

```python
loader.load()
```

## प्रत्येक लोडर अलग-अलग प्रमाणीकरण जानकारी के साथ

यदि आपको ऑब्जेक्ट लोडर के बीच OBS कनेक्शन को पुनः उपयोग करने की आवश्यकता नहीं है, तो आप सीधे `config` कॉन्फ़िगर कर सकते हैं। लोडर अपने स्वयं के OBS क्लाइंट को इनिशियलाइज करने के लिए कॉन्फ़िग जानकारी का उपयोग करेगा।

```python
# Configure your access credentials\n
config = {"ak": "your-access-key", "sk": "your-secret-key"}
loader = OBSFileLoader(
    "your-bucket-name", "your-object-key", endpoint=endpoint, config=config
)
```

```python
loader.load()
```

## ECS से प्रमाणीकरण जानकारी प्राप्त करें

यदि आपका langchain Huawei Cloud ECS पर तैनात है और [एजेंसी सेट अप है](https://support.huaweicloud.com/intl/en-us/usermanual-ecs/ecs_03_0166.html#section7), तो लोडर एक्सेस की और गुप्त कुंजी के बिना ECS से सुरक्षा टोकन सीधे प्राप्त कर सकता है।

```python
config = {"get_token_from_ecs": True}
loader = OBSFileLoader(
    "your-bucket-name", "your-object-key", endpoint=endpoint, config=config
)
```

```python
loader.load()
```

## एक सार्वजनिक रूप से पहुंचने योग्य ऑब्जेक्ट का एक्सेस

यदि आप एक्सेस करना चाहते हैं ऑब्जेक्ट अनाम उपयोगकर्ता एक्सेस की अनुमति देता है (अनाम उपयोगकर्ताओं के पास `GetObject` अनुमति है), तो आप `config` पैरामीटर कॉन्फ़िगर किए बिना सीधे ऑब्जेक्ट लोड कर सकते हैं।

```python
loader = OBSFileLoader("your-bucket-name", "your-object-key", endpoint=endpoint)
```

```python
loader.load()
```
