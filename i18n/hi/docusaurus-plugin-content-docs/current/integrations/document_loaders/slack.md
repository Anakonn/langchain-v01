---
translated: true
---

यह दस्तावेज़ का एक हिस्सा है।

# Slack

>[Slack](https://slack.com/) एक तत्काल संदेश प्रोग्राम है।

यह नोटबुक `Slack` निर्यात से उत्पन्न एक Zipfile से दस्तावेज़ लोड करने के बारे में कवर करता है।

## 🧑 अपना स्वयं का डेटासेट इंजेस्ट करने के लिए निर्देश

अपना Slack डेटा निर्यात करें। आप ऐसा करने के लिए अपने वर्कस्पेस प्रबंधन पृष्ठ पर जाकर और आयात/निर्यात विकल्प पर क्लिक करके कर सकते हैं ({your_slack_domain}.slack.com/services/export)। फिर, सही तारीख सीमा का चयन करें और `Start export` पर क्लिक करें। Slack आपको एक ईमेल और एक DM भेजेगा जब निर्यात तैयार हो जाएगा।

डाउनलोड एक `.zip` फ़ाइल उत्पन्न करेगा जो आपके डाउनलोड फ़ोल्डर में होगी (या आपके OS कॉन्फ़िगरेशन के अनुसार आपके डाउनलोड कहां मिलते हैं)।

`.zip` फ़ाइल का पथ कॉपी करें, और इसे नीचे `LOCAL_ZIPFILE` के रूप में असाइन करें।

```python
from langchain_community.document_loaders import SlackDirectoryLoader
```

```python
# Optionally set your Slack URL. This will give you proper URLs in the docs sources.
SLACK_WORKSPACE_URL = "https://xxx.slack.com"
LOCAL_ZIPFILE = ""  # Paste the local paty to your Slack zip file here.

loader = SlackDirectoryLoader(LOCAL_ZIPFILE, SLACK_WORKSPACE_URL)
```

```python
docs = loader.load()
docs
```
