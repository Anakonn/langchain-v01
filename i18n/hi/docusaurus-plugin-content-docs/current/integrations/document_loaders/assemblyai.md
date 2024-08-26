---
translated: true
---

# AssemblyAI ऑडियो प्रतिलिपि

`AssemblyAIAudioTranscriptLoader` का उपयोग [AssemblyAI API](https://www.assemblyai.com) के साथ ऑडियो फ़ाइलों का प्रतिलिपि बनाने और प्रतिलिपित पाठ को दस्तावेजों में लोड करने के लिए किया जा सकता है।

इसका उपयोग करने के लिए, आपके पास `assemblyai` पायथन पैकेज इंस्टॉल होना चाहिए, और `ASSEMBLYAI_API_KEY` पर्यावरण चर में आपका API कुंजी सेट होनी चाहिए। वैकल्पिक रूप से, API कुंजी को तर्क के रूप में भी पारित किया जा सकता है।

AssemblyAI के बारे में अधिक जानकारी:

- [वेबसाइट](https://www.assemblyai.com/)
- [मुफ्त API कुंजी प्राप्त करें](https://www.assemblyai.com/dashboard/signup)
- [AssemblyAI API दस्तावेज़](https://www.assemblyai.com/docs)

## स्थापना

पहले, आपको `assemblyai` पायथन पैकेज इंस्टॉल करना होगा।

इसके बारे में अधिक जानकारी [assemblyai-python-sdk GitHub रेपो](https://github.com/AssemblyAI/assemblyai-python-sdk) में मिल सकती है।

```python
%pip install --upgrade --quiet  assemblyai
```

## उदाहरण

`AssemblyAIAudioTranscriptLoader` को कम से कम `file_path` तर्क की आवश्यकता होती है। ऑडियो फ़ाइलों को URL या स्थानीय फ़ाइल पथ के रूप में निर्दिष्ट किया जा सकता है।

```python
from langchain_community.document_loaders import AssemblyAIAudioTranscriptLoader

audio_file = "https://storage.googleapis.com/aai-docs-samples/nbc.mp3"
# or a local file path: audio_file = "./nbc.mp3"

loader = AssemblyAIAudioTranscriptLoader(file_path=audio_file)

docs = loader.load()
```

नोट: `loader.load()` को कॉल करने से प्रतिलिपि पूरा होने तक रोक दिया जाता है।

प्रतिलिपित पाठ `page_content` में उपलब्ध है:

```python
docs[0].page_content
```

```output
"Load time, a new president and new congressional makeup. Same old ..."
```

`metadata` में पूरा JSON प्रतिक्रिया और अधिक मेटा जानकारी शामिल है:

```python
docs[0].metadata
```

```output
{'language_code': <LanguageCode.en_us: 'en_us'>,
 'audio_url': 'https://storage.googleapis.com/aai-docs-samples/nbc.mp3',
 'punctuate': True,
 'format_text': True,
  ...
}
```

## प्रतिलिपि प्रारूप

आप `transcript_format` तर्क को विभिन्न प्रारूपों के लिए निर्दिष्ट कर सकते हैं।

प्रारूप पर निर्भर करते हुए, एक या अधिक दस्तावेज वापस किए जाते हैं। ये `TranscriptFormat` विकल्प हैं:

- `TEXT`: प्रतिलिपि पाठ के साथ एक दस्तावेज़
- `SENTENCES`: एक से अधिक दस्तावेज़, प्रतिलिपि को प्रत्येक वाक्य द्वारा विभाजित करता है
- `PARAGRAPHS`: एक से अधिक दस्तावेज़, प्रतिलिपि को प्रत्येक अनुच्छेद द्वारा विभाजित करता है
- `SUBTITLES_SRT`: SRT सबटाइटल प्रारूप में प्रतिलिपि के साथ एक दस्तावेज़
- `SUBTITLES_VTT`: VTT सबटाइटल प्रारूप में प्रतिलिपि के साथ एक दस्तावेज़

```python
from langchain_community.document_loaders.assemblyai import TranscriptFormat

loader = AssemblyAIAudioTranscriptLoader(
    file_path="./your_file.mp3",
    transcript_format=TranscriptFormat.SENTENCES,
)

docs = loader.load()
```

## प्रतिलिपि कॉन्फ़िगरेशन

आप `config` तर्क को भी निर्दिष्ट कर सकते हैं ताकि आप विभिन्न ऑडियो इंटेलिजेंस मॉडल का उपयोग कर सकें।

सभी उपलब्ध मॉडलों का अवलोकन प्राप्त करने के लिए [AssemblyAI API दस्तावेज़](https://www.assemblyai.com/docs) देखें!

```python
import assemblyai as aai

config = aai.TranscriptionConfig(
    speaker_labels=True, auto_chapters=True, entity_detection=True
)

loader = AssemblyAIAudioTranscriptLoader(file_path="./your_file.mp3", config=config)
```

## API कुंजी को तर्क के रूप में पारित करें

`ASSEMBLYAI_API_KEY` पर्यावरण चर के रूप में API कुंजी सेट करने के अलावा, इसे तर्क के रूप में भी पारित किया जा सकता है।

```python
loader = AssemblyAIAudioTranscriptLoader(
    file_path="./your_file.mp3", api_key="YOUR_KEY"
)
```
