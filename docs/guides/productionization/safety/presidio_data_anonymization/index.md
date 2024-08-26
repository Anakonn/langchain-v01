---
canonical: https://python.langchain.com/v0.1/docs/guides/productionization/safety/presidio_data_anonymization
translated: false
---

# Data anonymization with Microsoft Presidio

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/privacy/presidio_data_anonymization/index.ipynb)

>[Presidio](https://microsoft.github.io/presidio/) (Origin from Latin praesidium ‘protection, garrison’) helps to ensure sensitive data is properly managed and governed. It provides fast identification and anonymization modules for private entities in text and images such as credit card numbers, names, locations, social security numbers, bitcoin wallets, US phone numbers, financial data and more.

## Use case

Data anonymization is crucial before passing information to a language model like GPT-4 because it helps protect privacy and maintain confidentiality. If data is not anonymized, sensitive information such as names, addresses, contact numbers, or other identifiers linked to specific individuals could potentially be learned and misused. Hence, by obscuring or removing this personally identifiable information (PII), data can be used freely without compromising individuals' privacy rights or breaching data protection laws and regulations.

## Overview

Anonynization consists of two steps:

1. **Identification:** Identify all data fields that contain personally identifiable information (PII).
2. **Replacement**: Replace all PIIs with pseudo values or codes that do not reveal any personal information about the individual but can be used for reference. We're not using regular encryption, because the language model won't be able to understand the meaning or context of the encrypted data.

We use *Microsoft Presidio* together with *Faker* framework for anonymization purposes because of the wide range of functionalities they provide. The full implementation is available in `PresidioAnonymizer`.

## Quickstart

Below you will find the use case on how to leverage anonymization in LangChain.

```python
%pip install --upgrade --quiet  langchain langchain-openai langchain-experimental presidio-analyzer presidio-anonymizer spacy Faker
```

```python
# Download model
!python -m spacy download en_core_web_lg
```

\
Let's see how PII anonymization works using a sample sentence:

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

### Using with LangChain Expression Language

With LCEL we can easily chain together anonymization with the rest of our application.

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

## Customization

We can specify ``analyzed_fields`` to only anonymize particular types of data.

```python
anonymizer = PresidioAnonymizer(analyzed_fields=["PERSON"])

anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com"
)
```

```output
'My name is Shannon Steele, call me at 313-666-7440 or email me at real.slim.shady@gmail.com'
```

As can be observed, the name was correctly identified and replaced with another. The `analyzed_fields` attribute is responsible for what values are to be detected and substituted. We can add *PHONE_NUMBER* to the list:

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
If no analyzed_fields are specified, by default the anonymizer will detect all supported formats. Below is the full list of them:

`['PERSON', 'EMAIL_ADDRESS', 'PHONE_NUMBER', 'IBAN_CODE', 'CREDIT_CARD', 'CRYPTO', 'IP_ADDRESS', 'LOCATION', 'DATE_TIME', 'NRP', 'MEDICAL_LICENSE', 'URL', 'US_BANK_NUMBER', 'US_DRIVER_LICENSE', 'US_ITIN', 'US_PASSPORT', 'US_SSN']`

**Disclaimer:** We suggest carefully defining the private data to be detected - Presidio doesn't work perfectly and it sometimes makes mistakes, so it's better to have more control over the data.

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
It may be that the above list of detected fields is not sufficient. For example, the already available *PHONE_NUMBER* field does not support polish phone numbers and confuses it with another field:

```python
anonymizer = PresidioAnonymizer()
anonymizer.anonymize("My polish phone number is 666555444")
```

```output
'My polish phone number is QESQ21234635370499'
```

\
You can then write your own recognizers and add them to the pool of those present. How exactly to create recognizers is described in the [Presidio documentation](https://microsoft.github.io/presidio/samples/python/customizing_presidio_analyzer/).

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
Now, we can add recognizer by calling `add_recognizer` method on the anonymizer:

```python
anonymizer.add_recognizer(polish_phone_numbers_recognizer)
```

\
And voilà! With the added pattern-based recognizer, the anonymizer now handles polish phone numbers.

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
The problem is - even though we recognize polish phone numbers now, we don't have a method (operator) that would tell how to substitute a given field - because of this, in the outpit we only provide string `<POLISH_PHONE_NUMBER>` We need to create a method to replace it correctly:

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
We used Faker to create pseudo data. Now we can create an operator and add it to the anonymizer. For complete information about operators and their creation, see the Presidio documentation for [simple](https://microsoft.github.io/presidio/tutorial/10_simple_anonymization/) and [custom](https://microsoft.github.io/presidio/tutorial/11_custom_anonymization/) anonymization.

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

## Important considerations

### Anonymizer detection rates

**The level of anonymization and the precision of detection are just as good as the quality of the recognizers implemented.**

Texts from different sources and in different languages have varying characteristics, so it is necessary to test the detection precision and iteratively add recognizers and operators to achieve better and better results.

Microsoft Presidio gives a lot of freedom to refine anonymization. The library's author has provided his [recommendations and a step-by-step guide for improving detection rates](https://github.com/microsoft/presidio/discussions/767#discussion-3567223).

### Instance anonymization

`PresidioAnonymizer` has no built-in memory. Therefore, two occurrences of the entity in the subsequent texts will be replaced with two different fake values:

```python
print(anonymizer.anonymize("My name is John Doe. Hi John Doe!"))
print(anonymizer.anonymize("My name is John Doe. Hi John Doe!"))
```

```output
My name is Robert Morales. Hi Robert Morales!
My name is Kelly Mccoy. Hi Kelly Mccoy!
```

To preserve previous anonymization results, use `PresidioReversibleAnonymizer`, which has built-in memory:

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

You can learn more about `PresidioReversibleAnonymizer` in the next section.