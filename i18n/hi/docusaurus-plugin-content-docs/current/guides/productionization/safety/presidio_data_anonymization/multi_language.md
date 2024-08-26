---
sidebar_position: 2
title: बहु-भाषा गोपनीयता
translated: true
---

# माइक्रोसॉफ्ट प्रेसिडियो के साथ बहु-भाषा डेटा गोपनीयता

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/privacy/presidio_data_anonymization/multi_language.ipynb)

## उपयोग मामला

डेटा पसेडोनाइमाइज़ेशन में बहु-भाषा समर्थन आवश्यक है क्योंकि भाषा संरचनाओं और सांस्कृतिक संदर्भों में अंतर होता है। विभिन्न भाषाओं में व्यक्तिगत पहचानकर्ताओं के लिए विभिन्न प्रारूप हो सकते हैं। उदाहरण के लिए, नामों, स्थानों और तारीखों की संरचना भाषाओं और क्षेत्रों के बीच काफी अलग हो सकती है। इसके अलावा, गैर-अल्फान्यूमेरिक वर्ण, स्वर चिह्न और लिखने की दिशा पसेडोनाइमाइज़ेशन प्रक्रियाओं को प्रभावित कर सकती हैं। बहु-भाषा समर्थन के बिना, डेटा पहचानयोग्य रह सकता है या गलत तरीके से व्याख्या की जा सकती है, जिससे डेटा गोपनीयता और सटीकता को खतरा हो सकता है। इसलिए, यह वैश्विक संचालन के लिए प्रभावी और सटीक पसेडोनाइमाइज़ेशन को सक्षम करता है।

## अवलोकन

माइक्रोसॉफ्ट प्रेसिडियो में PII का पता लगाना कई घटकों पर निर्भर करता है - सामान्य पैटर्न मैचिंग (जैसे रेगेक्स का उपयोग) के अलावा, विश्लेषक नामित इकाई पहचान (NER) मॉडल का उपयोग करता है ताकि निम्नलिखित इकाइयों को निकाला जा सके:
- `PERSON`
- `LOCATION`
- `DATE_TIME`
- `NRP`
- `ORGANIZATION`

[[Source]](https://github.com/microsoft/presidio/blob/main/presidio-analyzer/presidio_analyzer/predefined_recognizers/spacy_recognizer.py)

विशिष्ट भाषाओं में NER को संभालने के लिए, हम `spaCy` लाइब्रेरी से अनूठे मॉडलों का उपयोग करते हैं, जिसे कई भाषाओं और आकारों को कवर करने के लिए जाना जाता है। हालांकि, यह प्रतिबंधात्मक नहीं है, जो [Stanza](https://microsoft.github.io/presidio/analyzer/nlp_engines/spacy_stanza/) या [transformers](https://microsoft.github.io/presidio/analyzer/nlp_engines/transformers/) जैसे वैकल्पिक ढांचों को एकीकृत करने की अनुमति देता है जब आवश्यक हो।

## त्वरित शुरुआत

%pip install --upgrade --quiet  langchain langchain-openai langchain-experimental presidio-analyzer presidio-anonymizer spacy Faker

```python
# Download model
!python -m spacy download en_core_web_lg
```

```python
from langchain_experimental.data_anonymizer import PresidioReversibleAnonymizer

anonymizer = PresidioReversibleAnonymizer(
    analyzed_fields=["PERSON"],
)
```

डिफ़ॉल्ट रूप से, `PresidioAnonymizer` और `PresidioReversibleAnonymizer` अंग्रेजी पाठों पर प्रशिक्षित मॉडल का उपयोग करते हैं, इसलिए वे अन्य भाषाओं को मध्यम रूप से संभालते हैं।

उदाहरण के लिए, यहां मॉडल ने व्यक्ति का पता नहीं लगाया:

```python
anonymizer.anonymize("Me llamo Sofía")  # "My name is Sofía" in Spanish
```

```output
'Me llamo Sofía'
```

वे किसी अन्य भाषा के शब्दों को वास्तविक इकाइयों के रूप में भी ले सकते हैं। यहां, *'Yo'* (*स्पेनिश में 'मैं'*) और *Sofía* दोनों को `PERSON` के रूप में वर्गीकृत किया गया है:

```python
anonymizer.anonymize("Yo soy Sofía")  # "I am Sofía" in Spanish
```

```output
'Kari Lopez soy Mary Walker'
```

यदि आप अन्य भाषाओं के पाठों को अनाम करना चाहते हैं, तो आपको अन्य मॉडल डाउनलोड करने और उन्हें अनाम करने की कॉन्फ़िगरेशन में जोड़ने की आवश्यकता है:

```python
# Download the models for the languages you want to use
# ! python -m spacy download en_core_web_md
# ! python -m spacy download es_core_news_md
```

```python
nlp_config = {
    "nlp_engine_name": "spacy",
    "models": [
        {"lang_code": "en", "model_name": "en_core_web_md"},
        {"lang_code": "es", "model_name": "es_core_news_md"},
    ],
}
```

इसलिए हमने एक स्पेनिश भाषा मॉडल जोड़ा है। यह भी ध्यान दें कि हमने अंग्रेजी के लिए एक वैकल्पिक मॉडल भी डाउनलोड किया है - इस मामले में हमने बड़े मॉडल `en_core_web_lg` (560MB) को उसके छोटे संस्करण `en_core_web_md` (40MB) से बदल दिया है - आकार इसलिए 14 गुना कम हो गया है! यदि आप अनाम करने की गति के बारे में चिंतित हैं, तो इसे विचार करना वाजिब है।

विभिन्न भाषाओं के लिए सभी मॉडल [spaCy दस्तावेज़ीकरण](https://spacy.io/usage/models) में पाए जा सकते हैं।

अब कॉन्फ़िगरेशन को `languages_config` पैरामीटर के रूप में Anonymiser को पास करें। जैसा कि आप देख सकते हैं, दोनों पिछले उदाहरण बखूबी काम करते हैं:

```python
anonymizer = PresidioReversibleAnonymizer(
    analyzed_fields=["PERSON"],
    languages_config=nlp_config,
)

print(
    anonymizer.anonymize("Me llamo Sofía", language="es")
)  # "My name is Sofía" in Spanish
print(anonymizer.anonymize("Yo soy Sofía", language="es"))  # "I am Sofía" in Spanish
```

```output
Me llamo Christopher Smith
Yo soy Joseph Jenkins
```

डिफ़ॉल्ट रूप से, कॉन्फ़िगरेशन में पहली भाषा का उपयोग पाठ को अनाम करने के लिए किया जाएगा (इस मामले में अंग्रेजी):

```python
print(anonymizer.anonymize("My name is John"))
```

```output
My name is Shawna Bennett
```

## अन्य ढांचों के साथ उपयोग

### भाषा का पता लगाना

प्रस्तुत アプローチ का एक नुकसान यह है कि हमें इनपुट पाठ की **भाषा** सीधे पास करनी होती है। हालांकि, इसका एक उपाय है - *भाषा का पता लगाने* वाली लाइब्रेरियां।

हम निम्नलिखित ढांचों में से किसी एक का उपयोग करने की सिफारिश करते हैं:
- fasttext (अनुशंसित)
- langdetect

हमारे अनुभव से *fasttext* थोड़ा बेहतर प्रदर्शन करता है, लेकिन आपको अपने उपयोग मामले पर इसकी पुष्टि करनी चाहिए।

```python
# Install necessary packages
%pip install --upgrade --quiet  fasttext langdetect
```

### langdetect

```python
import langdetect
from langchain.schema import runnable


def detect_language(text: str) -> dict:
    language = langdetect.detect(text)
    print(language)
    return {"text": text, "language": language}


chain = runnable.RunnableLambda(detect_language) | (
    lambda x: anonymizer.anonymize(x["text"], language=x["language"])
)
```

```python
chain.invoke("Me llamo Sofía")
```

```output
es
```

```output
'Me llamo Michael Perez III'
```

```python
chain.invoke("My name is John Doe")
```

```output
en
```

```output
'My name is Ronald Bennett'
```

### fasttext

आपको पहले https://dl.fbaipublicfiles.com/fasttext/supervised-models/lid.176.ftz से fasttext मॉडल डाउनलोड करना होगा।

```python
import fasttext

model = fasttext.load_model("lid.176.ftz")


def detect_language(text: str) -> dict:
    language = model.predict(text)[0][0].replace("__label__", "")
    print(language)
    return {"text": text, "language": language}


chain = runnable.RunnableLambda(detect_language) | (
    lambda x: anonymizer.anonymize(x["text"], language=x["language"])
)
```

```output
Warning : `load_model` does not return WordVectorModel or SupervisedModel any more, but a `FastText` object which is very similar.
```

```python
chain.invoke("Yo soy Sofía")
```

```output
es
```

```output
'Yo soy Angela Werner'
```

```python
chain.invoke("My name is John Doe")
```

```output
en
```

```output
'My name is Carlos Newton'
```

इस तरह आप केवल संबंधित भाषाओं के इंजनों को प्रारंभ करने की आवश्यकता है, लेकिन उपकरण का उपयोग पूरी तरह से स्वचालित है।

## उन्नत उपयोग

### कस्टम लेबल्स में NER मॉडल

यह हो सकता है कि spaCy मॉडल में अलग-अलग क्लास नाम हों जो Microsoft Presidio द्वारा डिफ़ॉल्ट रूप से समर्थित नहीं हैं। उदाहरण के लिए, पोलिश में:

```python
# ! python -m spacy download pl_core_news_md

import spacy

nlp = spacy.load("pl_core_news_md")
doc = nlp("Nazywam się Wiktoria")  # "My name is Wiktoria" in Polish

for ent in doc.ents:
    print(
        f"Text: {ent.text}, Start: {ent.start_char}, End: {ent.end_char}, Label: {ent.label_}"
    )
```

```output
Text: Wiktoria, Start: 12, End: 20, Label: persName
```

*Victoria* का नाम `persName` के रूप में वर्गीकृत किया गया था, जो Microsoft Presidio में लागू डिफ़ॉल्ट क्लास नामों `PERSON`/`PER` से मेल नहीं खाता है ([ SpacyRecognizer implementation](https://github.com/microsoft/presidio/blob/main/presidio-analyzer/presidio_analyzer/predefined_recognizers/spacy_recognizer.py) में `CHECK_LABEL_GROUPS` देखें)।

spaCy मॉडल्स (अपने स्वयं के प्रशिक्षित मॉडल्स सहित) में कस्टम लेबल्स के बारे में अधिक जानकारी [इस थ्रेड](https://github.com/microsoft/presidio/issues/851) में मिल सकती है।

इसलिए हमारा वाक्य अनाम नहीं किया जाएगा:

```python
nlp_config = {
    "nlp_engine_name": "spacy",
    "models": [
        {"lang_code": "en", "model_name": "en_core_web_md"},
        {"lang_code": "es", "model_name": "es_core_news_md"},
        {"lang_code": "pl", "model_name": "pl_core_news_md"},
    ],
}

anonymizer = PresidioReversibleAnonymizer(
    analyzed_fields=["PERSON", "LOCATION", "DATE_TIME"],
    languages_config=nlp_config,
)

print(
    anonymizer.anonymize("Nazywam się Wiktoria", language="pl")
)  # "My name is Wiktoria" in Polish
```

```output
Nazywam się Wiktoria
```

इस समस्या को हल करने के लिए, अपने स्वयं के `SpacyRecognizer` बनाएं और अपने क्लास मैपिंग के साथ इसे एनोनाइमाइज़र में जोड़ें:

```python
from presidio_analyzer.predefined_recognizers import SpacyRecognizer

polish_check_label_groups = [
    ({"LOCATION"}, {"placeName", "geogName"}),
    ({"PERSON"}, {"persName"}),
    ({"DATE_TIME"}, {"date", "time"}),
]

spacy_recognizer = SpacyRecognizer(
    supported_language="pl",
    check_label_groups=polish_check_label_groups,
)

anonymizer.add_recognizer(spacy_recognizer)
```

अब सब कुछ सुचारू रूप से काम करता है:

```python
print(
    anonymizer.anonymize("Nazywam się Wiktoria", language="pl")
)  # "My name is Wiktoria" in Polish
```

```output
Nazywam się Morgan Walters
```

अब एक अधिक जटिल उदाहरण पर आएं:

```python
print(
    anonymizer.anonymize(
        "Nazywam się Wiktoria. Płock to moje miasto rodzinne. Urodziłam się dnia 6 kwietnia 2001 roku",
        language="pl",
    )
)  # "My name is Wiktoria. Płock is my home town. I was born on 6 April 2001" in Polish
```

```output
Nazywam się Ernest Liu. New Taylorburgh to moje miasto rodzinne. Urodziłam się 1987-01-19
```

जैसा कि आप देख सकते हैं, क्लास मैपिंग के कारण, एनोनाइमाइज़र विभिन्न प्रकार की इकाइयों से निपट सकता है।

### कस्टम भाषा-विशिष्ट ऑपरेटर

उपरोक्त उदाहरण में, वाक्य को सही ढंग से अनाम कर दिया गया है, लेकिन नकली डेटा पोलिश भाषा के लिए बिल्कुल भी उपयुक्त नहीं है। इसलिए कस्टम ऑपरेटर जोड़े जा सकते हैं, जो इस समस्या को हल कर देंगे:

```python
from faker import Faker
from presidio_anonymizer.entities import OperatorConfig

fake = Faker(locale="pl_PL")  # Setting faker to provide Polish data

new_operators = {
    "PERSON": OperatorConfig("custom", {"lambda": lambda _: fake.first_name_female()}),
    "LOCATION": OperatorConfig("custom", {"lambda": lambda _: fake.city()}),
}

anonymizer.add_operators(new_operators)
```

```python
print(
    anonymizer.anonymize(
        "Nazywam się Wiktoria. Płock to moje miasto rodzinne. Urodziłam się dnia 6 kwietnia 2001 roku",
        language="pl",
    )
)  # "My name is Wiktoria. Płock is my home town. I was born on 6 April 2001" in Polish
```

```output
Nazywam się Marianna. Szczecin to moje miasto rodzinne. Urodziłam się 1976-11-16
```

### सीमाएं

याद रखें - परिणाम आपके पहचानकर्ताओं और आपके NER मॉडल्स के समान अच्छे होते हैं!

नीचे दिए गए उदाहरण को देखें - हमने स्पेनिश के लिए छोटे मॉडल (12MB) को डाउनलोड किया और यह मध्यम संस्करण (40MB) की तुलना में अब अच्छा नहीं करता है:

```python
# ! python -m spacy download es_core_news_sm

for model in ["es_core_news_sm", "es_core_news_md"]:
    nlp_config = {
        "nlp_engine_name": "spacy",
        "models": [
            {"lang_code": "es", "model_name": model},
        ],
    }

    anonymizer = PresidioReversibleAnonymizer(
        analyzed_fields=["PERSON"],
        languages_config=nlp_config,
    )

    print(
        f"Model: {model}. Result: {anonymizer.anonymize('Me llamo Sofía', language='es')}"
    )
```

```output
Model: es_core_news_sm. Result: Me llamo Sofía
Model: es_core_news_md. Result: Me llamo Lawrence Davis
```

कई मामलों में, spaCy के बड़े मॉडल भी पर्याप्त नहीं होंगे - नामित इकाइयों का पता लगाने के लिए पहले से ही अन्य अधिक जटिल और बेहतर तरीके हैं, जो ट्रांसफॉर्मर्स पर आधारित हैं। इस बारे में अधिक जानकारी [यहां](https://microsoft.github.io/presidio/analyzer/nlp_engines/transformers/) पढ़ सकते हैं।
