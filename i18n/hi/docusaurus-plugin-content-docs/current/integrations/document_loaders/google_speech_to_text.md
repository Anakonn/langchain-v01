---
translated: true
---

# Google Speech-to-Text ऑडियो प्रतिलिपि

`GoogleSpeechToTextLoader` का उपयोग [Google Cloud Speech-to-Text API](https://cloud.google.com/speech-to-text) के साथ ऑडियो फ़ाइलों को प्रतिलिपि करने और प्रतिलिपित पाठ को दस्तावेजों में लोड करने के लिए किया जा सकता है।

इसका उपयोग करने के लिए, आपके पास `google-cloud-speech` पायथन पैकेज स्थापित होना चाहिए, और [Speech-to-Text API सक्षम](https://cloud.google.com/speech-to-text/v2/docs/transcribe-client-libraries#before_you_begin) के साथ एक Google Cloud परियोजना होनी चाहिए।

- [Google Cloud की Speech API में बड़े मॉडलों की शक्ति लाना](https://cloud.google.com/blog/products/ai-machine-learning/bringing-power-large-models-google-clouds-speech-api)

## स्थापना और सेटअप

पहले, आपको `google-cloud-speech` पायथन पैकेज स्थापित करना होगा।

इसके बारे में अधिक जानकारी [Speech-to-Text क्लाइंट लाइब्रेरी](https://cloud.google.com/speech-to-text/v2/docs/libraries) पृष्ठ पर मिल सकती है।

परियोजना बनाने और API को सक्षम करने के लिए Google Cloud दस्तावेजों में [त्वरित शुरुआत गाइड](https://cloud.google.com/speech-to-text/v2/docs/sync-recognize) का पालन करें।

```python
%pip install --upgrade --quiet langchain-google-community[speech]
```

## उदाहरण

`GoogleSpeechToTextLoader` में `project_id` और `file_path` तर्क शामिल होने चाहिए। ऑडियो फ़ाइलों को Google Cloud स्टोरेज URI (`gs://...`) या स्थानीय फ़ाइल पथ के रूप में निर्दिष्ट किया जा सकता है।

लोडर द्वारा केवल सिंक्रोनस अनुरोध समर्थित हैं, जिसमें प्रति ऑडियो फ़ाइल [60 सेकंड या 10MB](https://cloud.google.com/speech-to-text/v2/docs/sync-recognize#:~:text=60%20seconds%20and/or%2010%20MB) की सीमा है।

```python
from langchain_google_community import GoogleSpeechToTextLoader

project_id = "<PROJECT_ID>"
file_path = "gs://cloud-samples-data/speech/audio.flac"
# or a local file path: file_path = "./audio.wav"

loader = GoogleSpeechToTextLoader(project_id=project_id, file_path=file_path)

docs = loader.load()
```

नोट: `loader.load()` को कॉल करने से प्रतिलिपि पूरी होने तक रोक दिया जाता है।

प्रतिलिपित पाठ `page_content` में उपलब्ध है:

```python
docs[0].page_content
```

```output
"How old is the Brooklyn Bridge?"
```

`metadata` में पूरा JSON प्रतिक्रिया और अधिक मेटा जानकारी शामिल है:

```python
docs[0].metadata
```

```json
{
  'language_code': 'en-US',
  'result_end_offset': datetime.timedelta(seconds=1)
}
```

## पहचान कॉन्फ़िगरेशन

आप विभिन्न भाषण पहचान मॉडल का उपयोग करने और विशिष्ट सुविधाएं सक्षम करने के लिए `config` तर्क का उपयोग कर सकते हैं।

[Speech-to-Text पहचानकर्ता दस्तावेजों](https://cloud.google.com/speech-to-text/v2/docs/recognizers) और [`RecognizeRequest`](https://cloud.google.com/python/docs/reference/speech/latest/google.cloud.speech_v2.types.RecognizeRequest) API संदर्भ में जानकारी देखें कि कस्टम कॉन्फ़िगरेशन कैसे सेट करें।

यदि आप `config` निर्दिष्ट नहीं करते हैं, तो निम्नलिखित विकल्प स्वचालित रूप से चुने जाएंगे:

- मॉडल: [Chirp Universal Speech Model](https://cloud.google.com/speech-to-text/v2/docs/chirp-model)
- भाषा: `en-US`
- ऑडियो एन्कोडिंग: स्वचालित रूप से पता लगाया गया
- स्वचालित विरामचिह्न: सक्षम

```python
from google.cloud.speech_v2 import (
    AutoDetectDecodingConfig,
    RecognitionConfig,
    RecognitionFeatures,
)
from langchain_google_community import GoogleSpeechToTextLoader

project_id = "<PROJECT_ID>"
location = "global"
recognizer_id = "<RECOGNIZER_ID>"
file_path = "./audio.wav"

config = RecognitionConfig(
    auto_decoding_config=AutoDetectDecodingConfig(),
    language_codes=["en-US"],
    model="long",
    features=RecognitionFeatures(
        enable_automatic_punctuation=False,
        profanity_filter=True,
        enable_spoken_punctuation=True,
        enable_spoken_emojis=True,
    ),
)

loader = GoogleSpeechToTextLoader(
    project_id=project_id,
    location=location,
    recognizer_id=recognizer_id,
    file_path=file_path,
    config=config,
)
```
