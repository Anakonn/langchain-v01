---
translated: true
---

# Google Cloud Text-to-Speech

>[Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech) का उपयोग करके डेवलपर्स 100+ भाषाओं और वेरिएंट्स में मौजूद प्राकृतिक-ध्वनि वाले स्पीच का संश्लेषण कर सकते हैं। यह डीपमाइंड के क्रांतिकारी शोध WaveNet और Google के शक्तिशाली न्यूरल नेटवर्क का उपयोग करके संभव तक उच्चतम गुणवत्ता प्रदान करता है।

यह नोटबुक `Google Cloud Text-to-Speech API` के साथ कैसे बातचीत करें, इसे प्राप्त करने के लिए दिखाता है।

पहले, आपको एक Google Cloud परियोजना सेट अप करनी होगी। आप यहां दिए गए निर्देशों का पालन कर सकते हैं [यहां](https://cloud.google.com/text-to-speech/docs/before-you-begin)।

```python
%pip install --upgrade --quiet  google-cloud-text-to-speech
```

## उपयोग

```python
from langchain_community.tools import GoogleCloudTextToSpeechTool

text_to_speak = "Hello world!"

tts = GoogleCloudTextToSpeechTool()
tts.name
```

हम ऑडियो जनरेट कर सकते हैं, इसे अस्थायी फ़ाइल में सहेज सकते हैं और फिर इसे चला सकते हैं।

```python
speech_file = tts.run(text_to_speak)
```
