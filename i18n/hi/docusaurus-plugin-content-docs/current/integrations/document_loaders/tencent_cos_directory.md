---
translated: true
---

# टेंसेंट COS डायरेक्टरी

>[टेंसेंट क्लाउड ऑब्जेक्ट स्टोरेज (COS)](https://www.tencentcloud.com/products/cos) एक वितरित स्टोरेज सेवा है जो आपको HTTP/HTTPS प्रोटोकॉल के माध्यम से कहीं से भी किसी भी मात्रा में डेटा स्टोर करने में सक्षम बनाती है।
> `COS` में डेटा संरचना या प्रारूप पर कोई प्रतिबंध नहीं है। इसमें बकेट आकार सीमा और पार्टिशन प्रबंधन भी नहीं है, जिससे यह लगभग किसी भी उपयोग मामले के लिए उपयुक्त है, जैसे डेटा वितरण, डेटा प्रोसेसिंग और डेटा झीलें। `COS` वेब-आधारित कंसोल, बहु-भाषा SDK और API, कमांड लाइन टूल और ग्राफिकल टूल प्रदान करता है। यह अमेज़न S3 API के साथ अच्छी तरह काम करता है, जिससे आप जल्दी से समुदाय के उपकरणों और प्लगइन तक पहुंच सकते हैं।

यह `टेंसेंट COS डायरेक्टरी` से दस्तावेज़ ऑब्जेक्ट कैसे लोड करें, इसके बारे में बताता है।

```python
%pip install --upgrade --quiet  cos-python-sdk-v5
```

```python
from langchain_community.document_loaders import TencentCOSDirectoryLoader
from qcloud_cos import CosConfig
```

```python
conf = CosConfig(
    Region="your cos region",
    SecretId="your cos secret_id",
    SecretKey="your cos secret_key",
)
loader = TencentCOSDirectoryLoader(conf=conf, bucket="you_cos_bucket")
```

```python
loader.load()
```

## एक उपसर्ग निर्दिष्ट करना

आप अधिक सटीक नियंत्रण के लिए किन फ़ाइलों को लोड करना है, इसके लिए एक उपसर्ग भी निर्दिष्ट कर सकते हैं।

```python
loader = TencentCOSDirectoryLoader(conf=conf, bucket="you_cos_bucket", prefix="fake")
```

```python
loader.load()
```
