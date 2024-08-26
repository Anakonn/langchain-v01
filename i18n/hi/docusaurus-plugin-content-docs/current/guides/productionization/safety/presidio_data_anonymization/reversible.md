---
sidebar_position: 1
title: पुनरावर्ती गुमनामकरण
translated: true
---

# Microsoft Presidio के साथ पुनरावर्ती डेटा गुमनामकरण

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/privacy/presidio_data_anonymization/reversible.ipynb)

## उपयोग का मामला

हमने पहले ही खंड में संवेदनशील डेटा के गुमनामकरण के महत्व के बारे में लिखा है। **पुनरावर्ती गुमनामकरण** जानकारी को भाषा मॉडल्स के साथ साझा करते समय डेटा संरक्षण और डेटा उपयोगिता के बीच संतुलन बनाते हुए एक समान रूप से आवश्यक तकनीक है। यह तकनीक संवेदनशील व्यक्तिगत पहचान योग्य जानकारी (PII) को मास्किंग करती है, फिर भी इसे उलटकर अधिकृत उपयोगकर्ताओं की आवश्यकता होने पर मूल डेटा को पुनर्स्थापित किया जा सकता है। इसका मुख्य लाभ इस तथ्य में निहित है कि जबकि यह व्यक्तिगत पहचान को दुरुपयोग से छिपाता है, यह कानूनी या अनुपालन उद्देश्यों के लिए आवश्यक होने पर छिपे डेटा को सही ढंग से अनमास्क करने की अनुमति भी देता है।

## अवलोकन

हमने `PresidioReversibleAnonymizer` को लागू किया है, जिसमें दो भाग होते हैं:

1. गुमनामकरण - यह `PresidioAnonymizer` के समान तरीके से काम करता है, साथ ही ऑब्जेक्ट खुद बनाए गए मूल्यों से मूल मूल्यों का एक मैपिंग स्टोर करता है, उदाहरण के लिए:

```output
    {
        "PERSON": {
            "<anonymized>": "<original>",
            "John Doe": "Slim Shady"
        },
        "PHONE_NUMBER": {
            "111-111-1111": "555-555-5555"
        }
        ...
    }
```

2. पुनः गुमनामकरण - उपरोक्त वर्णित मैपिंग का उपयोग करके, यह नकली डेटा को मूल डेटा से मिलाता है और फिर इसे प्रतिस्थापित करता है।

गुमनामकरण और पुनः गुमनामकरण के बीच उपयोगकर्ता विभिन्न ऑपरेशनों को कर सकते हैं, उदाहरण के लिए, आउटपुट को LLM को पास करना।

## त्वरित प्रारंभ

```python
# Install necessary packages
%pip install --upgrade --quiet  langchain langchain-experimental langchain-openai presidio-analyzer presidio-anonymizer spacy Faker
# ! python -m spacy download en_core_web_lg
```

`PresidioReversibleAnonymizer` गुमनामकरण के मामले में अपने पूर्ववर्ती (`PresidioAnonymizer`) से महत्वपूर्ण रूप से अलग नहीं है:

```python
from langchain_experimental.data_anonymizer import PresidioReversibleAnonymizer

anonymizer = PresidioReversibleAnonymizer(
    analyzed_fields=["PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS", "CREDIT_CARD"],
    # Faker seed is used here to make sure the same fake data is generated for the test purposes
    # In production, it is recommended to remove the faker_seed parameter (it will default to None)
    faker_seed=42,
)

anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com. "
    "By the way, my card number is: 4916 0387 9536 0861"
)
```

```output
'My name is Maria Lynch, call me at 7344131647 or email me at jamesmichael@example.com. By the way, my card number is: 4838637940262'
```

यह वह पूर्ण स्ट्रिंग है जिसे हम पुनः गुमनाम करना चाहते हैं:

```python
# We know this data, as we set the faker_seed parameter
fake_name = "Maria Lynch"
fake_phone = "7344131647"
fake_email = "jamesmichael@example.com"
fake_credit_card = "4838637940262"

anonymized_text = f"""{fake_name} recently lost his wallet.
Inside is some cash and his credit card with the number {fake_credit_card}.
If you would find it, please call at {fake_phone} or write an email here: {fake_email}.
{fake_name} would be very grateful!"""

print(anonymized_text)
```

```output
Maria Lynch recently lost his wallet.
Inside is some cash and his credit card with the number 4838637940262.
If you would find it, please call at 7344131647 or write an email here: jamesmichael@example.com.
Maria Lynch would be very grateful!
```

और अब, `deanonymize` विधि का उपयोग करते हुए, हम प्रक्रिया को उलट सकते हैं:

```python
print(anonymizer.deanonymize(anonymized_text))
```

```output
Slim Shady recently lost his wallet.
Inside is some cash and his credit card with the number 4916 0387 9536 0861.
If you would find it, please call at 313-666-7440 or write an email here: real.slim.shady@gmail.com.
Slim Shady would be very grateful!
```

### LangChain Expression Language के साथ उपयोग करना

LCEL के साथ हम आसानी से अपने एप्लिकेशन के बाकी हिस्सों के साथ गुमनामकरण और पुनः गुमनामकरण को चेन कर सकते हैं। यह LLM के क्वेरी के साथ गुमनामकरण तंत्र का उपयोग करने का एक उदाहरण है (अभी के लिए बिना पुनः गुमनामकरण के):

```python
text = """Slim Shady recently lost his wallet.
Inside is some cash and his credit card with the number 4916 0387 9536 0861.
If you would find it, please call at 313-666-7440 or write an email here: real.slim.shady@gmail.com."""
```

```python
from langchain_core.prompts.prompt import PromptTemplate
from langchain_openai import ChatOpenAI

anonymizer = PresidioReversibleAnonymizer()

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

We regret to inform you that Monique Turner has recently misplaced his wallet, which contains a sum of cash and his credit card with the number 213152056829866.

If you happen to come across this wallet, kindly contact us at (770)908-7734x2835 or send an email to barbara25@example.net.

Thank you for your cooperation.

Sincerely,
[Your Name]
```

अब, आइए हमारी श्रृंखला में **पुनः गुमनामकरण चरण** जोड़ें:

```python
chain = chain | (lambda ai_message: anonymizer.deanonymize(ai_message.content))
response = chain.invoke(text)
print(response)
```

```output
Dear Sir/Madam,

We regret to inform you that Slim Shady has recently misplaced his wallet, which contains a sum of cash and his credit card with the number 4916 0387 9536 0861.

If you happen to come across this wallet, kindly contact us at 313-666-7440 or send an email to real.slim.shady@gmail.com.

Thank you for your cooperation.

Sincerely,
[Your Name]
```

गुमनाम डेटा को स्वयं मॉडल को दिया गया था, और इसलिए इसे बाहरी दुनिया में लीक होने से बचाया गया था। फिर, मॉडल की प्रतिक्रिया को प्रोसेस किया गया, और वास्तविक मूल्य को वास्तविक के साथ प्रतिस्थापित किया गया।

## अतिरिक्त ज्ञान

`PresidioReversibleAnonymizer` नकली मूल्यों को मूल मूल्यों के साथ `deanonymizer_mapping` पैरामीटर में संग्रहीत करता है, जहां कुंजी नकली PII होती है और मान मूल होता है:

```python
from langchain_experimental.data_anonymizer import PresidioReversibleAnonymizer

anonymizer = PresidioReversibleAnonymizer(
    analyzed_fields=["PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS", "CREDIT_CARD"],
    # Faker seed is used here to make sure the same fake data is generated for the test purposes
    # In production, it is recommended to remove the faker_seed parameter (it will default to None)
    faker_seed=42,
)

anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com. "
    "By the way, my card number is: 4916 0387 9536 0861"
)

anonymizer.deanonymizer_mapping
```

```output
{'PERSON': {'Maria Lynch': 'Slim Shady'},
 'PHONE_NUMBER': {'7344131647': '313-666-7440'},
 'EMAIL_ADDRESS': {'jamesmichael@example.com': 'real.slim.shady@gmail.com'},
 'CREDIT_CARD': {'4838637940262': '4916 0387 9536 0861'}}
```

अधिक पाठों को गुमनाम करने से नए मैपिंग प्रविष्टियों का परिणाम होगा:

```python
print(
    anonymizer.anonymize(
        "Do you have his VISA card number? Yep, it's 4001 9192 5753 7193. I'm John Doe by the way."
    )
)

anonymizer.deanonymizer_mapping
```

```output
Do you have his VISA card number? Yep, it's 3537672423884966. I'm William Bowman by the way.
```

```output
{'PERSON': {'Maria Lynch': 'Slim Shady', 'William Bowman': 'John Doe'},
 'PHONE_NUMBER': {'7344131647': '313-666-7440'},
 'EMAIL_ADDRESS': {'jamesmichael@example.com': 'real.slim.shady@gmail.com'},
 'CREDIT_CARD': {'4838637940262': '4916 0387 9536 0861',
  '3537672423884966': '4001 9192 5753 7193'}}
```

बिल्ट-इन मेमोरी के लिए धन्यवाद, पहले से पता लगाए गए और गुमनाम किए गए संस्थाओं को आने वाले प्रोसेस किए गए पाठों में उसी रूप में लिया जाएगा, ताकि मैपिंग में कोई डुप्लिकेट न हो:

```python
print(
    anonymizer.anonymize(
        "My VISA card number is 4001 9192 5753 7193 and my name is John Doe."
    )
)

anonymizer.deanonymizer_mapping
```

```output
My VISA card number is 3537672423884966 and my name is William Bowman.
```

```output
{'PERSON': {'Maria Lynch': 'Slim Shady', 'William Bowman': 'John Doe'},
 'PHONE_NUMBER': {'7344131647': '313-666-7440'},
 'EMAIL_ADDRESS': {'jamesmichael@example.com': 'real.slim.shady@gmail.com'},
 'CREDIT_CARD': {'4838637940262': '4916 0387 9536 0861',
  '3537672423884966': '4001 9192 5753 7193'}}
```

हम भविष्य में उपयोग के लिए मैपिंग को फाइल में सेव कर सकते हैं:

```python
# We can save the deanonymizer mapping as a JSON or YAML file

anonymizer.save_deanonymizer_mapping("deanonymizer_mapping.json")
# anonymizer.save_deanonymizer_mapping("deanonymizer_mapping.yaml")
```

और फिर, इसे एक अन्य `PresidioReversibleAnonymizer` उदाहरण में लोड कर सकते हैं:

```python
anonymizer = PresidioReversibleAnonymizer()

anonymizer.deanonymizer_mapping
```

```output
{}
```

```python
anonymizer.load_deanonymizer_mapping("deanonymizer_mapping.json")

anonymizer.deanonymizer_mapping
```

```output
{'PERSON': {'Maria Lynch': 'Slim Shady', 'William Bowman': 'John Doe'},
 'PHONE_NUMBER': {'7344131647': '313-666-7440'},
 'EMAIL_ADDRESS': {'jamesmichael@example.com': 'real.slim.shady@gmail.com'},
 'CREDIT_CARD': {'4838637940262': '4916 0387 9536 0861',
  '3537672423884966': '4001 9192 5753 7193'}}
```

### कस्टम पुनः गुमनामकरण रणनीति

डिफ़ॉल्ट पुनः गुमनामकरण रणनीति पाठ में उपस्ट्रिंग को मैपिंग प्रविष्टि के साथ ठीक से मिलाने की होती है। LLMs के अनिश्चितता के कारण, यह हो सकता है कि मॉडल निजी डेटा के प्रारूप को थोड़ा बदल देगा या एक टाइपो कर देगा, उदाहरण के लिए:
- *Keanu Reeves* -> *Kaenu Reeves*
- *John F. Kennedy* -> *John Kennedy*
- *Main St, New York* -> *New York*

इसलिए उचित प्रॉम्प्ट इंजीनियरिंग (मॉडल को अपरिवर्तित प्रारूप में PII लौटाने के लिए) पर विचार करना या अपनी प्रतिस्थापन रणनीति को लागू करने का प्रयास करना उचित है। उदाहरण के लिए, आप फजी मैचिंग का उपयोग कर सकते हैं - यह टाइपो और पाठ में मामूली परिवर्तनों के साथ समस्याओं को हल करेगा। कुछ स्वैपिंग रणनीति के कार्यान्वयन `deanonymizer_matching_strategies.py` फ़ाइल में पाए जा सकते हैं।

```python
from langchain_experimental.data_anonymizer.deanonymizer_matching_strategies import (
    case_insensitive_matching_strategy,
)

# Original name: Maria Lynch
print(anonymizer.deanonymize("maria lynch"))
print(
    anonymizer.deanonymize(
        "maria lynch", deanonymizer_matching_strategy=case_insensitive_matching_strategy
    )
)
```

```output
maria lynch
Slim Shady
```

```python
from langchain_experimental.data_anonymizer.deanonymizer_matching_strategies import (
    fuzzy_matching_strategy,
)

# Original name: Maria Lynch
# Original phone number: 7344131647 (without dashes)
print(anonymizer.deanonymize("Call Maria K. Lynch at 734-413-1647"))
print(
    anonymizer.deanonymize(
        "Call Maria K. Lynch at 734-413-1647",
        deanonymizer_matching_strategy=fuzzy_matching_strategy,
    )
)
```

```output
Call Maria K. Lynch at 734-413-1647
Call Slim Shady at 313-666-7440
```

ऐसा लगता है कि संयुक्त विधि सबसे अच्छा काम करती है:
- पहले सही मैच रणनीति लागू करें
- फिर बाकी को फजी रणनीति का उपयोग करके मिलाएं

```python
from langchain_experimental.data_anonymizer.deanonymizer_matching_strategies import (
    combined_exact_fuzzy_matching_strategy,
)

# Changed some values for fuzzy match showcase:
# - "Maria Lynch" -> "Maria K. Lynch"
# - "7344131647" -> "734-413-1647"
# - "213186379402654" -> "2131 8637 9402 654"
print(
    anonymizer.deanonymize(
        (
            "Are you Maria F. Lynch? I found your card with number 4838 6379 40262.\n"
            "Is this your phone number: 734-413-1647?\n"
            "Is this your email address: wdavis@example.net"
        ),
        deanonymizer_matching_strategy=combined_exact_fuzzy_matching_strategy,
    )
)
```

```output
Are you Slim Shady? I found your card with number 4916 0387 9536 0861.
Is this your phone number: 313-666-7440?
Is this your email address: wdavis@example.net
```

बेशक, कोई भी परिपूर्ण विधि नहीं है और यह प्रयोग करने और अपनी उपयोग के मामले के लिए सबसे उपयुक्त एक को खोजने लायक है।

## भविष्य के कार्य

- **नकली मूल्यों के लिए वास्तविक मूल्यों का बेहतर मिलान और प्रतिस्थापन** - वर्तमान में रणनीति पूर्ण स्ट्रिंग्स को मिलाने और फिर उन्हें प्रतिस्थापित करने पर आधारित है। भाषा मॉडलों के अनिश्चितता के कारण, यह हो सकता है कि उत्तर में मूल्य थोड़ा बदल जाए (उदा. *John Doe* -> *John* या *Main St, New York* -> *New York*) और फिर ऐसा प्रतिस्थापन संभव नहीं है। इसलिए, अपनी आवश्यकताओं के अनुसार मिलान को समायोजित करना उचित है।
