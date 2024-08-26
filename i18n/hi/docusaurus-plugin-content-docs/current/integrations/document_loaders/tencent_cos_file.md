---
translated: true
---

# टेंसेंट सीओएस फ़ाइल

>[टेंसेंट क्लाउड ऑब्जेक्ट स्टोरेज (सीओएस)](https://www.tencentcloud.com/products/cos) एक वितरित
> स्टोरेज सेवा है जो आपको HTTP/HTTPS प्रोटोकॉल के माध्यम से कहीं से भी किसी भी मात्रा में डेटा संग्रहीत करने में सक्षम बनाती है।
> `सीओएस` में डेटा संरचना या प्रारूप पर कोई प्रतिबंध नहीं है। इसमें बकेट आकार सीमा और
> पार्टिशन प्रबंधन भी नहीं है, जिससे यह लगभग किसी भी उपयोग मामले के लिए उपयुक्त है, जैसे डेटा वितरण,
> डेटा प्रोसेसिंग और डेटा झीलें। `सीओएस` एक वेब-आधारित कंसोल, बहु-भाषा एसडीके और एपीआई,
> कमांड लाइन टूल और ग्राफिकल टूल प्रदान करता है। यह अमेज़न एस3 एपीआई के साथ अच्छी तरह काम करता है, जिससे आप त्वरित
> समुदाय उपकरणों और प्लगइन तक पहुंच सकते हैं।

यह `टेंसेंट सीओएस फ़ाइल` से दस्तावेज़ ऑब्जेक्ट लोड करने के बारे में कवर करता है।

```python
%pip install --upgrade --quiet  cos-python-sdk-v5
```

```python
from langchain_community.document_loaders import TencentCOSFileLoader
from qcloud_cos import CosConfig
```

```python
conf = CosConfig(
    Region="your cos region",
    SecretId="your cos secret_id",
    SecretKey="your cos secret_key",
)
loader = TencentCOSFileLoader(conf=conf, bucket="you_cos_bucket", key="fake.docx")
```

```python
loader.load()
```
