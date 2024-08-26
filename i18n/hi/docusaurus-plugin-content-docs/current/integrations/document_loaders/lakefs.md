---
translated: true
---

# लेकएफएस

>[लेकएफएस](https://docs.lakefs.io/) डेटा लेक पर स्केलेबल वर्जन नियंत्रण प्रदान करता है, और उन संस्करणों को बनाने और एक्सेस करने के लिए Git-जैसी semantics का उपयोग करता है।

यह नोटबुक `लेकएफएस` पथ (चाहे वह एक ऑब्जेक्ट हो या एक प्रीफिक्स) से दस्तावेज़ ऑब्जेक्ट को कैसे लोड करना है, इसे कवर करता है।

## लेकएफएस लोडर को इनिशियलाइज़ करना

`ENDPOINT`, `LAKEFS_ACCESS_KEY`, और `LAKEFS_SECRET_KEY` मूल्यों को अपने स्वयं के साथ बदलें।

```python
from langchain_community.document_loaders import LakeFSLoader
```

```python
ENDPOINT = ""
LAKEFS_ACCESS_KEY = ""
LAKEFS_SECRET_KEY = ""

lakefs_loader = LakeFSLoader(
    lakefs_access_key=LAKEFS_ACCESS_KEY,
    lakefs_secret_key=LAKEFS_SECRET_KEY,
    lakefs_endpoint=ENDPOINT,
)
```

## एक पथ निर्दिष्ट करना

आप किन फ़ाइलों को लोड करना है इसे नियंत्रित करने के लिए एक प्रीफिक्स या एक पूर्ण ऑब्जेक्ट पथ निर्दिष्ट कर सकते हैं।

संबंधित `REPO`, `REF`, और `PATH` में रिपॉजिटरी, संदर्भ (शाखा, कमिट आईडी, या टैग) और पथ निर्दिष्ट करें ताकि दस्तावेज़ों को लोड किया जा सके:

```python
REPO = ""
REF = ""
PATH = ""

lakefs_loader.set_repo(REPO)
lakefs_loader.set_ref(REF)
lakefs_loader.set_path(PATH)

docs = lakefs_loader.load()
docs
```
