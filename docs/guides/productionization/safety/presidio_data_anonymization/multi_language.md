---
canonical: https://python.langchain.com/v0.1/docs/guides/productionization/safety/presidio_data_anonymization/multi_language
sidebar_position: 2
title: Multi-language anonymization
translated: false
---

# Multi-language data anonymization with Microsoft Presidio

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/privacy/presidio_data_anonymization/multi_language.ipynb)

## Use case

Multi-language support in data pseudonymization is essential due to differences in language structures and cultural contexts. Different languages may have varying formats for personal identifiers. For example, the structure of names, locations and dates can differ greatly between languages and regions. Furthermore, non-alphanumeric characters, accents, and the direction of writing can impact pseudonymization processes. Without multi-language support, data could remain identifiable or be misinterpreted, compromising data privacy and accuracy. Hence, it enables effective and precise pseudonymization suited for global operations.

## Overview

PII detection in Microsoft Presidio relies on several components - in addition to the usual pattern matching (e.g. using regex), the analyser uses a model for Named Entity Recognition (NER) to extract entities such as:
- `PERSON`
- `LOCATION`
- `DATE_TIME`
- `NRP`
- `ORGANIZATION`

[[Source]](https://github.com/microsoft/presidio/blob/main/presidio-analyzer/presidio_analyzer/predefined_recognizers/spacy_recognizer.py)

To handle NER in specific languages, we utilize unique models from the `spaCy` library, recognized for its extensive selection covering multiple languages and sizes. However, it's not restrictive, allowing for integration of alternative frameworks such as [Stanza](https://microsoft.github.io/presidio/analyzer/nlp_engines/spacy_stanza/) or [transformers](https://microsoft.github.io/presidio/analyzer/nlp_engines/transformers/) when necessary.

## Quickstart

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

By default, `PresidioAnonymizer` and `PresidioReversibleAnonymizer` use a model trained on English texts, so they handle other languages moderately well.

For example, here the model did not detect the person:

```python
anonymizer.anonymize("Me llamo Sofía")  # "My name is Sofía" in Spanish
```

```output
'Me llamo Sofía'
```

They may also take words from another language as actual entities. Here, both the word *'Yo'* (*'I'* in Spanish) and *Sofía* have been classified as `PERSON`:

```python
anonymizer.anonymize("Yo soy Sofía")  # "I am Sofía" in Spanish
```

```output
'Kari Lopez soy Mary Walker'
```

If you want to anonymise texts from other languages, you need to download other models and add them to the anonymiser configuration:

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

We have therefore added a Spanish language model. Note also that we have downloaded an alternative model for English as well - in this case we have replaced the large model `en_core_web_lg` (560MB) with its smaller version `en_core_web_md` (40MB) - the size is therefore reduced by 14 times! If you care about the speed of anonymisation, it is worth considering it.

All models for the different languages can be found in the [spaCy documentation](https://spacy.io/usage/models).

Now pass the configuration as the `languages_config` parameter to Anonymiser. As you can see, both previous examples work flawlessly:

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

By default, the language indicated first in the configuration will be used when anonymising text (in this case English):

```python
print(anonymizer.anonymize("My name is John"))
```

```output
My name is Shawna Bennett
```

## Usage with other frameworks

### Language detection

One of the drawbacks of the presented approach is that we have to pass the **language** of the input text directly. However, there is a remedy for that - *language detection* libraries.

We recommend using one of the following frameworks:
- fasttext (recommended)
- langdetect

From our experience *fasttext* performs a bit better, but you should verify it on your use case.

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

You need to download the fasttext model first from https://dl.fbaipublicfiles.com/fasttext/supervised-models/lid.176.ftz

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

This way you only need to initialize the model with the engines corresponding to the relevant languages, but using the tool is fully automated.

## Advanced usage

### Custom labels in NER model

It may be that the spaCy model has different class names than those supported by the Microsoft Presidio by default. Take Polish, for example:

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

The name *Victoria* was classified as `persName`, which does not correspond to the default class names `PERSON`/`PER` implemented in Microsoft Presidio (look for `CHECK_LABEL_GROUPS` in [SpacyRecognizer implementation](https://github.com/microsoft/presidio/blob/main/presidio-analyzer/presidio_analyzer/predefined_recognizers/spacy_recognizer.py)).

You can find out more about custom labels in spaCy models (including your own, trained ones) in [this thread](https://github.com/microsoft/presidio/issues/851).

That's why our sentence will not be anonymized:

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

To address this, create your own `SpacyRecognizer` with your own class mapping and add it to the anonymizer:

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

Now everything works smoothly:

```python
print(
    anonymizer.anonymize("Nazywam się Wiktoria", language="pl")
)  # "My name is Wiktoria" in Polish
```

```output
Nazywam się Morgan Walters
```

Let's try on more complex example:

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

As you can see, thanks to class mapping, the anonymiser can cope with different types of entities.

### Custom language-specific operators

In the example above, the sentence has been anonymised correctly, but the fake data does not fit the Polish language at all. Custom operators can therefore be added, which will resolve the issue:

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

### Limitations

Remember - results are as good as your recognizers and as your NER models!

Look at the example below - we downloaded the small model for Spanish (12MB) and it no longer performs as well as the medium version (40MB):

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

In many cases, even the larger models from spaCy will not be sufficient - there are already other, more complex and better methods of detecting named entities, based on transformers. You can read more about this [here](https://microsoft.github.io/presidio/analyzer/nlp_engines/transformers/).