---
translated: true
---

# माइक्रोसॉफ्ट प्रेसिडियो के साथ डेटा अनॉनिमाइजेशन

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/privacy/presidio_data_anonymization/index.ipynb)

>[प्रेसिडियो](https://microsoft.github.io/presidio/) (लैटिन शब्द 'प्रोटेक्शन, गैरिसन' से उत्पन्न) संवेदनशील डेटा को उचित रूप से प्रबंधित और शासित करने में मदद करता है। यह पाठ और छवियों में क्रेडिट कार्ड नंबर, नाम, स्थान, सोशल सिक्योरिटी नंबर, बिटकॉइन वॉलेट, यूएस फोन नंबर, वित्तीय डेटा और अधिक जैसे निजी इकाइयों के लिए तेज पहचान और अनॉनिमाइजेशन मॉड्यूल प्रदान करता है।

## उपयोग मामला

डेटा अनॉनिमाइजेशन GPT-4 जैसे भाषा मॉडल को जानकारी भेजने से पहले महत्वपूर्ण है क्योंकि यह गोपनीयता की रक्षा करने और गोपनीयता बनाए रखने में मदद करता है। यदि डेटा को अनॉनिमाइज़ नहीं किया जाता है, तो नाम, पता, संपर्क नंबर या व्यक्तिगत पहचानकर्ताओं से जुड़े अन्य पहचानकर्ता जैसी संवेदनशील जानकारी सीख और दुरुपयोग की जा सकती है। इसलिए, व्यक्तिगत रूप से पहचानने योग्य जानकारी (PII) को धुंधला या हटाकर, डेटा को व्यक्तियों के गोपनीयता अधिकारों को कमप्रोमाइज किए बिना या डेटा संरक्षण कानूनों और विनियमों का उल्लंघन किए बिना स्वतंत्र रूप से उपयोग किया जा सकता है।

## अवलोकन

अनॉनिमाइजेशन दो चरणों से मिलकर बनता है:

1. **पहचान:** व्यक्तिगत रूप से पहचानने योग्य जानकारी (PII) वाले सभी डेटा फ़ील्डों की पहचान करें।
2. **प्रतिस्थापन**: सभी PII को ऐसे पसेडो मूल्यों या कोड से प्रतिस्थापित करें जो व्यक्ति के बारे में कोई व्यक्तिगत जानकारी नहीं खोलते हैं लेकिन संदर्भ के लिए उपयोग किए जा सकते हैं। हम नियमित एन्क्रिप्शन का उपयोग नहीं कर रहे हैं, क्योंकि भाषा मॉडल एन्क्रिप्टेड डेटा का अर्थ या संदर्भ समझ नहीं पाएगा।

हम व्यापक कार्यक्षमता प्रदान करने के कारण अनॉनिमाइजेशन उद्देश्यों के लिए *माइक्रोसॉफ्ट प्रेसिडियो* और *फेकर* फ्रेमवर्क का उपयोग करते हैं। पूरा कार्यान्वयन `PresidioAnonymizer` में उपलब्ध है।

## त्वरित शुरुआत

नीचे आप LangChain में अनॉनिमाइजेशन का उपयोग करने का उपयोग मामला देखेंगे।

```python
%pip install --upgrade --quiet  langchain langchain-openai langchain-experimental presidio-analyzer presidio-anonymizer spacy Faker
```

```python
# Download model
!python -m spacy download en_core_web_lg
```

\
आइए एक नमूना वाक्य का उपयोग करके PII अनॉनिमाइजेशन कैसे काम करता है, देखें:

```python
from langchain_experimental.data_anonymizer import PresidioAnonymizer

anonymizer = PresidioAnonymizer()

anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com"
)
```

```output
'My name is James Martinez, call me at (576)928-1972x679 or email me at lisa44@example.com'
```

### LangChain Expression Language का उपयोग करना

LCEL के साथ हम आसानी से अनॉनिमाइजेशन को अपने अनुप्रयोग के बाकी हिस्सों के साथ जोड़ सकते हैं।

```python
# Set env var OPENAI_API_KEY or load from a .env file:
# import dotenv

# dotenv.load_dotenv()
```

```python
text = """Slim Shady recently lost his wallet.
Inside is some cash and his credit card with the number 4916 0387 9536 0861.
If you would find it, please call at 313-666-7440 or write an email here: real.slim.shady@gmail.com."""
```

```python
from langchain_core.prompts.prompt import PromptTemplate
from langchain_openai import ChatOpenAI

anonymizer = PresidioAnonymizer()

template = """Rewrite this text into an official, short email:

{anonymized_text}"""
prompt = PromptTemplate.from_template(template)
llm = ChatOpenAI(temperature=0)

chain = {"anonymized_text": anonymizer.anonymize} | prompt | llm
response = chain.invoke(text)
print(response.content)
```

```output
Dear Sir/Madam,

We regret to inform you that Mr. Dennis Cooper has recently misplaced his wallet. The wallet contains a sum of cash and his credit card, bearing the number 3588895295514977.

Should you happen to come across the aforementioned wallet, kindly contact us immediately at (428)451-3494x4110 or send an email to perryluke@example.com.

Your prompt assistance in this matter would be greatly appreciated.

Yours faithfully,

[Your Name]
```

## अनुकूलन

हम `analyzed_fields` निर्दिष्ट कर सकते हैं ताकि केवल विशिष्ट प्रकार के डेटा को अनॉनिमाइज़ किया जा सके।

```python
anonymizer = PresidioAnonymizer(analyzed_fields=["PERSON"])

anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com"
)
```

```output
'My name is Shannon Steele, call me at 313-666-7440 or email me at real.slim.shady@gmail.com'
```

जैसा कि देखा जा सकता है, नाम सही ढंग से पहचाना गया और दूसरे से प्रतिस्थापित किया गया। `analyzed_fields` विशेषता वह है जो पता लगाने और प्रतिस्थापित करने के लिए क्या मूल्य हैं। हम सूची में *PHONE_NUMBER* जोड़ सकते हैं:

```python
anonymizer = PresidioAnonymizer(analyzed_fields=["PERSON", "PHONE_NUMBER"])
anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com"
)
```

```output
'My name is Wesley Flores, call me at (498)576-9526 or email me at real.slim.shady@gmail.com'
```

\
यदि `analyzed_fields` निर्दिष्ट नहीं किए जाते हैं, तो डिफ़ॉल्ट रूप से अनॉनिमाइज़र सभी समर्थित प्रारूपों का पता लगाएगा। नीचे उनकी पूरी सूची है:

`['PERSON', 'EMAIL_ADDRESS', 'PHONE_NUMBER', 'IBAN_CODE', 'CREDIT_CARD', 'CRYPTO', 'IP_ADDRESS', 'LOCATION', 'DATE_TIME', 'NRP', 'MEDICAL_LICENSE', 'URL', 'US_BANK_NUMBER', 'US_DRIVER_LICENSE', 'US_ITIN', 'US_PASSPORT', 'US_SSN']`

**अस्वीकरण:** हम संवेदनशील डेटा की पहचान करने के लिए सावधानीपूर्वक परिभाषित करने का सुझाव देते हैं - प्रेसिडियो पूरी तरह से सही नहीं काम करता और कभी-कभी गलतियां करता है, इसलिए डेटा पर अधिक नियंत्रण होना बेहतर है।

```python
anonymizer = PresidioAnonymizer()
anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com"
)
```

```output
'My name is Carla Fisher, call me at 001-683-324-0721x0644 or email me at krausejeremy@example.com'
```

\
संभव है कि पहचाने गए फ़ील्डों की ऊपर दी गई सूची पर्याप्त नहीं हो। उदाहरण के लिए, पहले से मौजूद *PHONE_NUMBER* फ़ील्ड पोलिश फ़ोन नंबरों का समर्थन नहीं करता और इसे किसी अन्य फ़ील्ड से मिलाता है:

```python
anonymizer = PresidioAnonymizer()
anonymizer.anonymize("My polish phone number is 666555444")
```

```output
'My polish phone number is QESQ21234635370499'
```

\
आप फिर से अपने स्वयं के पहचानकर्ता लिख सकते हैं और उन्हें मौजूदा पूल में जोड़ सकते हैं। पहचानकर्ता कैसे बनाया जाता है, इसका वर्णन [प्रेसिडियो दस्तावेज़ीकरण](https://microsoft.github.io/presidio/samples/python/customizing_presidio_analyzer/) में किया गया है।

```python
# Define the regex pattern in a Presidio `Pattern` object:
from presidio_analyzer import Pattern, PatternRecognizer

polish_phone_numbers_pattern = Pattern(
    name="polish_phone_numbers_pattern",
    regex="(?<!\w)(\(?(\+|00)?48\)?)?[ -]?\d{3}[ -]?\d{3}[ -]?\d{3}(?!\w)",
    score=1,
)

# Define the recognizer with one or more patterns
polish_phone_numbers_recognizer = PatternRecognizer(
    supported_entity="POLISH_PHONE_NUMBER", patterns=[polish_phone_numbers_pattern]
)
```

\
अब, हम `add_recognizer` विधि को कॉल करके पहचानकर्ता जोड़ सकते हैं:

```python
anonymizer.add_recognizer(polish_phone_numbers_recognizer)
```

\
और वॉयला! पैटर्न-आधारित पहचानकर्ता जोड़ने के साथ, अनॉनिमाइज़र अब पोलिश फ़ोन नंबरों को संभाल लेता है।

```python
print(anonymizer.anonymize("My polish phone number is 666555444"))
print(anonymizer.anonymize("My polish phone number is 666 555 444"))
print(anonymizer.anonymize("My polish phone number is +48 666 555 444"))
```

```output
My polish phone number is <POLISH_PHONE_NUMBER>
My polish phone number is <POLISH_PHONE_NUMBER>
My polish phone number is <POLISH_PHONE_NUMBER>
```

\
समस्या यह है - हालांकि हम अब पोलिश फ़ोन नंबरों को पहचान लेते हैं, हमारे पास कोई तरीका (ऑपरेटर) नहीं है जो किसी दिए गए फ़ील्ड को कैसे प्रतिस्थापित करे - इसके कारण, आउटपुट में हम केवल स्ट्रिंग `<POLISH_PHONE_NUMBER>` प्रदान करते हैं। हमें इसे सही तरह से प्रतिस्थापित करने के लिए एक विधि बनानी होगी:

```python
from faker import Faker

fake = Faker(locale="pl_PL")


def fake_polish_phone_number(_=None):
    return fake.phone_number()


fake_polish_phone_number()
```

```output
'665 631 080'
```

\
हमने पसेडो डेटा बनाने के लिए फेकर का उपयोग किया। अब हम एक ऑपरेटर बना सकते हैं और उसे अनॉनिमाइज़र में जोड़ सकते हैं। ऑपरेटरों और उनके निर्माण के बारे में पूर्ण जानकारी के लिए, [सरल](https://microsoft.github.io/presidio/tutorial/10_simple_anonymization/) और [कस्टम](https://microsoft.github.io/presidio/tutorial/11_custom_anonymization/) अनॉनिमाइजेशन के लिए प्रेसिडियो दस्तावेज़ीकरण देखें।

```python
from presidio_anonymizer.entities import OperatorConfig

new_operators = {
    "POLISH_PHONE_NUMBER": OperatorConfig(
        "custom", {"lambda": fake_polish_phone_number}
    )
}
```

```python
anonymizer.add_operators(new_operators)
```

```python
anonymizer.anonymize("My polish phone number is 666555444")
```

```output
'My polish phone number is 538 521 657'
```

## महत्वपूर्ण विचार

### अनॉनिमाइज़र का पता लगाने की दर

**अनॉनिमाइजेशन का स्तर और पता लगाने की सटीकता उन पहचानकर्ताओं की गुणवत्ता पर ही निर्भर करती है जो लागू किए गए हैं।**

विभिन्न स्रोतों और विभिन्न भाषाओं के पाठों में विभिन्न विशेषताएं होती हैं, इसलिए पता लगाने की सटीकता और दोहराव से बेहतर परिणाम प्राप्त करने के लिए पहचानकर्ताओं और ऑपरेटरों को जोड़ने की आवश्यकता होती है।

माइक्रोसॉफ्ट प्रेसिडियो अनॉनिमाइजेशन को रिफाइन करने के लिए बहुत स्वतंत्रता देता है। लाइब्रेरी के लेखक ने [सुझाव और पता लगाने की दरों में सुधार के लिए चरण-दर-चरण मार्गदर्शिका](https://github.com/microsoft/presidio/discussions/767#discussion-3567223) प्रदान की है।

### प्रतिमान अनाम्यता

`PresidioAnonymizer` में कोई अंतर्निहित मेमोरी नहीं है। इसलिए, उसके बाद के पाठों में इस प्रतिमान के दो अवतरण को दो अलग-अलग नकली मूल्यों से प्रतिस्थापित किया जाएगा:

```python
print(anonymizer.anonymize("My name is John Doe. Hi John Doe!"))
print(anonymizer.anonymize("My name is John Doe. Hi John Doe!"))
```

```output
My name is Robert Morales. Hi Robert Morales!
My name is Kelly Mccoy. Hi Kelly Mccoy!
```

पिछली अनाम्यता परिणामों को संरक्षित करने के लिए, `PresidioReversibleAnonymizer` का उपयोग करें, जिसमें अंतर्निहित मेमोरी है:

```python
from langchain_experimental.data_anonymizer import PresidioReversibleAnonymizer

anonymizer_with_memory = PresidioReversibleAnonymizer()

print(anonymizer_with_memory.anonymize("My name is John Doe. Hi John Doe!"))
print(anonymizer_with_memory.anonymize("My name is John Doe. Hi John Doe!"))
```

```output
My name is Ashley Cervantes. Hi Ashley Cervantes!
My name is Ashley Cervantes. Hi Ashley Cervantes!
```

आप अगले खंड में `PresidioReversibleAnonymizer` के बारे में अधिक जान सकते हैं।
