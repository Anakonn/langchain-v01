---
sidebar_position: 3
title: QA avec protection des données privées
translated: true
---

# QA avec protection des données privées

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/privacy/presidio_data_anonymization/qa_privacy_protection.ipynb)

Dans ce notebook, nous allons examiner la construction d'un système de questions-réponses de base, basé sur des données privées. Avant de transmettre ces données à l'LLM, nous devons les protéger afin qu'elles ne soient pas envoyées à une API externe (par exemple OpenAI, Anthropic). Ensuite, après avoir reçu la sortie du modèle, nous voudrions que les données soient restaurées dans leur forme d'origine. Vous pouvez observer ci-dessous un exemple de flux de ce système de QR :

<img src="/img/qa_privacy_protection.png" width="900"/>

Dans le notebook suivant, nous n'entrerons pas dans les détails du fonctionnement de l'anonymiseur. Si vous êtes intéressé, veuillez consulter [cette partie de la documentation](/docs/guides/productionization/safety/presidio_data_anonymization/).

## Démarrage rapide

### Processus itératif de mise à niveau de l'anonymiseur

%pip install --upgrade --quiet  langchain langchain-experimental langchain-openai presidio-analyzer presidio-anonymizer spacy Faker faiss-cpu tiktoken

```python
# Download model
! python -m spacy download en_core_web_lg
```

```python
document_content = """Date: October 19, 2021
 Witness: John Doe
 Subject: Testimony Regarding the Loss of Wallet

 Testimony Content:

 Hello Officer,

 My name is John Doe and on October 19, 2021, my wallet was stolen in the vicinity of Kilmarnock during a bike trip. This wallet contains some very important things to me.

 Firstly, the wallet contains my credit card with number 4111 1111 1111 1111, which is registered under my name and linked to my bank account, PL61109010140000071219812874.

 Additionally, the wallet had a driver's license - DL No: 999000680 issued to my name. It also houses my Social Security Number, 602-76-4532.

 What's more, I had my polish identity card there, with the number ABC123456.

 I would like this data to be secured and protected in all possible ways. I believe It was stolen at 9:30 AM.

 In case any information arises regarding my wallet, please reach out to me on my phone number, 999-888-7777, or through my personal email, johndoe@example.com.

 Please consider this information to be highly confidential and respect my privacy.

 The bank has been informed about the stolen credit card and necessary actions have been taken from their end. They will be reachable at their official email, support@bankname.com.
 My representative there is Victoria Cherry (her business phone: 987-654-3210).

 Thank you for your assistance,

 John Doe"""
```

```python
from langchain_core.documents import Document

documents = [Document(page_content=document_content)]
```

Nous n'avons qu'un seul document, donc avant de passer à la création d'un système de QR, concentrons-nous d'abord sur son contenu.

Vous pouvez observer que le texte contient de nombreuses valeurs PII différentes, certains types apparaissent de manière répétée (noms, numéros de téléphone, e-mails) et certains PII spécifiques sont répétés (John Doe).

```python
# Util function for coloring the PII markers
# NOTE: It will not be visible on documentation page, only in the notebook
import re


def print_colored_pii(string):
    colored_string = re.sub(
        r"(<[^>]*>)", lambda m: "\033[31m" + m.group(1) + "\033[0m", string
    )
    print(colored_string)
```

Procédons et essayons d'anonymiser le texte avec les paramètres par défaut. Pour l'instant, nous ne remplaçons pas les données par des données synthétiques, nous les marquons simplement avec des marqueurs (par exemple `<PERSON>`), donc nous définissons `add_default_faker_operators=False` :

```python
from langchain_experimental.data_anonymizer import PresidioReversibleAnonymizer

anonymizer = PresidioReversibleAnonymizer(
    add_default_faker_operators=False,
)

print_colored_pii(anonymizer.anonymize(document_content))
```

```output
Date: [31m<DATE_TIME>[0m
Witness: [31m<PERSON>[0m
Subject: Testimony Regarding the Loss of Wallet

Testimony Content:

Hello Officer,

My name is [31m<PERSON>[0m and on [31m<DATE_TIME>[0m, my wallet was stolen in the vicinity of [31m<LOCATION>[0m during a bike trip. This wallet contains some very important things to me.

Firstly, the wallet contains my credit card with number [31m<CREDIT_CARD>[0m, which is registered under my name and linked to my bank account, [31m<IBAN_CODE>[0m.

Additionally, the wallet had a driver's license - DL No: [31m<US_DRIVER_LICENSE>[0m issued to my name. It also houses my Social Security Number, [31m<US_SSN>[0m.

What's more, I had my polish identity card there, with the number ABC123456.

I would like this data to be secured and protected in all possible ways. I believe It was stolen at [31m<DATE_TIME_2>[0m.

In case any information arises regarding my wallet, please reach out to me on my phone number, [31m<PHONE_NUMBER>[0m, or through my personal email, [31m<EMAIL_ADDRESS>[0m.

Please consider this information to be highly confidential and respect my privacy.

The bank has been informed about the stolen credit card and necessary actions have been taken from their end. They will be reachable at their official email, [31m<EMAIL_ADDRESS_2>[0m.
My representative there is [31m<PERSON_2>[0m (her business phone: [31m<UK_NHS>[0m).

Thank you for your assistance,

[31m<PERSON>[0m
```

Examinons également la correspondance entre les valeurs d'origine et les valeurs anonymisées :

```python
import pprint

pprint.pprint(anonymizer.deanonymizer_mapping)
```

```output
{'CREDIT_CARD': {'<CREDIT_CARD>': '4111 1111 1111 1111'},
 'DATE_TIME': {'<DATE_TIME>': 'October 19, 2021', '<DATE_TIME_2>': '9:30 AM'},
 'EMAIL_ADDRESS': {'<EMAIL_ADDRESS>': 'johndoe@example.com',
                   '<EMAIL_ADDRESS_2>': 'support@bankname.com'},
 'IBAN_CODE': {'<IBAN_CODE>': 'PL61109010140000071219812874'},
 'LOCATION': {'<LOCATION>': 'Kilmarnock'},
 'PERSON': {'<PERSON>': 'John Doe', '<PERSON_2>': 'Victoria Cherry'},
 'PHONE_NUMBER': {'<PHONE_NUMBER>': '999-888-7777'},
 'UK_NHS': {'<UK_NHS>': '987-654-3210'},
 'US_DRIVER_LICENSE': {'<US_DRIVER_LICENSE>': '999000680'},
 'US_SSN': {'<US_SSN>': '602-76-4532'}}
```

En général, l'anonymiseur fonctionne assez bien, mais je peux observer deux choses à améliorer ici :

1. Redondance des dates et heures - nous avons deux entités différentes reconnues comme `DATE_TIME`, mais elles contiennent des types d'informations différents. La première est une date (*19 octobre 2021*), la seconde est une heure (*9h30*). Nous pouvons améliorer cela en ajoutant un nouveau reconnaisseur à l'anonymiseur, qui traitera l'heure séparément de la date.
2. Numéro d'identification polonais - le numéro d'identification polonais a un modèle unique, qui ne fait pas partie par défaut des reconnaisseurs de l'anonymiseur. La valeur *ABC123456* n'est pas anonymisée.

La solution est simple : nous devons ajouter de nouveaux reconnaisseurs à l'anonymiseur. Vous pouvez en lire plus dans [la documentation de presidio](https://microsoft.github.io/presidio/analyzer/adding_recognizers/).

Ajoutons de nouveaux reconnaisseurs :

```python
# Define the regex pattern in a Presidio `Pattern` object:
from presidio_analyzer import Pattern, PatternRecognizer

polish_id_pattern = Pattern(
    name="polish_id_pattern",
    regex="[A-Z]{3}\d{6}",
    score=1,
)
time_pattern = Pattern(
    name="time_pattern",
    regex="(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)",
    score=1,
)

# Define the recognizer with one or more patterns
polish_id_recognizer = PatternRecognizer(
    supported_entity="POLISH_ID", patterns=[polish_id_pattern]
)
time_recognizer = PatternRecognizer(supported_entity="TIME", patterns=[time_pattern])
```

Et maintenant, nous ajoutons ces reconnaisseurs à notre anonymiseur :

```python
anonymizer.add_recognizer(polish_id_recognizer)
anonymizer.add_recognizer(time_recognizer)
```

Notez que notre instance d'anonymisation se souvient des valeurs précédemment détectées et anonymisées, y compris celles qui n'ont pas été correctement détectées (par exemple, *"9h30"* pris comme `DATE_TIME`). Il est donc préférable de supprimer cette valeur ou de réinitialiser l'ensemble de la correspondance maintenant que nos reconnaisseurs ont été mis à jour :

```python
anonymizer.reset_deanonymizer_mapping()
```

Anonymisons le texte et voyons les résultats :

```python
print_colored_pii(anonymizer.anonymize(document_content))
```

```output
Date: [31m<DATE_TIME>[0m
Witness: [31m<PERSON>[0m
Subject: Testimony Regarding the Loss of Wallet

Testimony Content:

Hello Officer,

My name is [31m<PERSON>[0m and on [31m<DATE_TIME>[0m, my wallet was stolen in the vicinity of [31m<LOCATION>[0m during a bike trip. This wallet contains some very important things to me.

Firstly, the wallet contains my credit card with number [31m<CREDIT_CARD>[0m, which is registered under my name and linked to my bank account, [31m<IBAN_CODE>[0m.

Additionally, the wallet had a driver's license - DL No: [31m<US_DRIVER_LICENSE>[0m issued to my name. It also houses my Social Security Number, [31m<US_SSN>[0m.

What's more, I had my polish identity card there, with the number [31m<POLISH_ID>[0m.

I would like this data to be secured and protected in all possible ways. I believe It was stolen at [31m<TIME>[0m.

In case any information arises regarding my wallet, please reach out to me on my phone number, [31m<PHONE_NUMBER>[0m, or through my personal email, [31m<EMAIL_ADDRESS>[0m.

Please consider this information to be highly confidential and respect my privacy.

The bank has been informed about the stolen credit card and necessary actions have been taken from their end. They will be reachable at their official email, [31m<EMAIL_ADDRESS_2>[0m.
My representative there is [31m<PERSON_2>[0m (her business phone: [31m<UK_NHS>[0m).

Thank you for your assistance,

[31m<PERSON>[0m
```

```python
pprint.pprint(anonymizer.deanonymizer_mapping)
```

```output
{'CREDIT_CARD': {'<CREDIT_CARD>': '4111 1111 1111 1111'},
 'DATE_TIME': {'<DATE_TIME>': 'October 19, 2021'},
 'EMAIL_ADDRESS': {'<EMAIL_ADDRESS>': 'johndoe@example.com',
                   '<EMAIL_ADDRESS_2>': 'support@bankname.com'},
 'IBAN_CODE': {'<IBAN_CODE>': 'PL61109010140000071219812874'},
 'LOCATION': {'<LOCATION>': 'Kilmarnock'},
 'PERSON': {'<PERSON>': 'John Doe', '<PERSON_2>': 'Victoria Cherry'},
 'PHONE_NUMBER': {'<PHONE_NUMBER>': '999-888-7777'},
 'POLISH_ID': {'<POLISH_ID>': 'ABC123456'},
 'TIME': {'<TIME>': '9:30 AM'},
 'UK_NHS': {'<UK_NHS>': '987-654-3210'},
 'US_DRIVER_LICENSE': {'<US_DRIVER_LICENSE>': '999000680'},
 'US_SSN': {'<US_SSN>': '602-76-4532'}}
```

Comme vous pouvez le voir, nos nouveaux reconnaisseurs fonctionnent comme prévu. L'anonymiseur a remplacé les entités d'heure et de numéro d'identification polonais par les marqueurs `<TIME>` et `<POLISH_ID>`, et la correspondance de désanonymisation a été mise à jour en conséquence.

Maintenant que toutes les valeurs PII sont correctement détectées, nous pouvons passer à l'étape suivante, qui consiste à remplacer les valeurs d'origine par des valeurs synthétiques. Pour ce faire, nous devons définir `add_default_faker_operators=True` (ou simplement supprimer ce paramètre, car il est défini par défaut sur `True`) :

```python
anonymizer = PresidioReversibleAnonymizer(
    add_default_faker_operators=True,
    # Faker seed is used here to make sure the same fake data is generated for the test purposes
    # In production, it is recommended to remove the faker_seed parameter (it will default to None)
    faker_seed=42,
)

anonymizer.add_recognizer(polish_id_recognizer)
anonymizer.add_recognizer(time_recognizer)

print_colored_pii(anonymizer.anonymize(document_content))
```

```output
Date: 1986-04-18
Witness: Brian Cox DVM
Subject: Testimony Regarding the Loss of Wallet

Testimony Content:

Hello Officer,

My name is Brian Cox DVM and on 1986-04-18, my wallet was stolen in the vicinity of New Rita during a bike trip. This wallet contains some very important things to me.

Firstly, the wallet contains my credit card with number 6584801845146275, which is registered under my name and linked to my bank account, GB78GSWK37672423884969.

Additionally, the wallet had a driver's license - DL No: 781802744 issued to my name. It also houses my Social Security Number, 687-35-1170.

What's more, I had my polish identity card there, with the number [31m<POLISH_ID>[0m.

I would like this data to be secured and protected in all possible ways. I believe It was stolen at [31m<TIME>[0m.

In case any information arises regarding my wallet, please reach out to me on my phone number, 7344131647, or through my personal email, jamesmichael@example.com.

Please consider this information to be highly confidential and respect my privacy.

The bank has been informed about the stolen credit card and necessary actions have been taken from their end. They will be reachable at their official email, blakeerik@example.com.
My representative there is Cristian Santos (her business phone: 2812140441).

Thank you for your assistance,

Brian Cox DVM
```

Comme vous pouvez le voir, presque toutes les valeurs ont été remplacées par des valeurs synthétiques. La seule exception est le numéro d'identification polonais et l'heure, qui ne sont pas pris en charge par les opérateurs Faker par défaut. Nous pouvons ajouter de nouveaux opérateurs à l'anonymiseur, qui généreront des données aléatoires. Vous pouvez en lire plus sur les opérateurs personnalisés [ici](https://microsoft.github.io/presidio/tutorial/11_custom_anonymization/).

```python
from faker import Faker

fake = Faker()


def fake_polish_id(_=None):
    return fake.bothify(text="???######").upper()


fake_polish_id()
```

```output
'VTC592627'
```

```python
def fake_time(_=None):
    return fake.time(pattern="%I:%M %p")


fake_time()
```

```output
'03:14 PM'
```

Ajoutons ces nouveaux opérateurs à l'anonymiseur :

```python
from presidio_anonymizer.entities import OperatorConfig

new_operators = {
    "POLISH_ID": OperatorConfig("custom", {"lambda": fake_polish_id}),
    "TIME": OperatorConfig("custom", {"lambda": fake_time}),
}

anonymizer.add_operators(new_operators)
```

Et anonymisons tout à nouveau :

```python
anonymizer.reset_deanonymizer_mapping()
print_colored_pii(anonymizer.anonymize(document_content))
```

```output
Date: 1974-12-26
Witness: Jimmy Murillo
Subject: Testimony Regarding the Loss of Wallet

Testimony Content:

Hello Officer,

My name is Jimmy Murillo and on 1974-12-26, my wallet was stolen in the vicinity of South Dianeshire during a bike trip. This wallet contains some very important things to me.

Firstly, the wallet contains my credit card with number 213108121913614, which is registered under my name and linked to my bank account, GB17DBUR01326773602606.

Additionally, the wallet had a driver's license - DL No: 532311310 issued to my name. It also houses my Social Security Number, 690-84-1613.

What's more, I had my polish identity card there, with the number UFB745084.

I would like this data to be secured and protected in all possible ways. I believe It was stolen at 11:54 AM.

In case any information arises regarding my wallet, please reach out to me on my phone number, 876.931.1656, or through my personal email, briannasmith@example.net.

Please consider this information to be highly confidential and respect my privacy.

The bank has been informed about the stolen credit card and necessary actions have been taken from their end. They will be reachable at their official email, samuel87@example.org.
My representative there is Joshua Blair (her business phone: 3361388464).

Thank you for your assistance,

Jimmy Murillo
```

```python
pprint.pprint(anonymizer.deanonymizer_mapping)
```

```output
{'CREDIT_CARD': {'213108121913614': '4111 1111 1111 1111'},
 'DATE_TIME': {'1974-12-26': 'October 19, 2021'},
 'EMAIL_ADDRESS': {'briannasmith@example.net': 'johndoe@example.com',
                   'samuel87@example.org': 'support@bankname.com'},
 'IBAN_CODE': {'GB17DBUR01326773602606': 'PL61109010140000071219812874'},
 'LOCATION': {'South Dianeshire': 'Kilmarnock'},
 'PERSON': {'Jimmy Murillo': 'John Doe', 'Joshua Blair': 'Victoria Cherry'},
 'PHONE_NUMBER': {'876.931.1656': '999-888-7777'},
 'POLISH_ID': {'UFB745084': 'ABC123456'},
 'TIME': {'11:54 AM': '9:30 AM'},
 'UK_NHS': {'3361388464': '987-654-3210'},
 'US_DRIVER_LICENSE': {'532311310': '999000680'},
 'US_SSN': {'690-84-1613': '602-76-4532'}}
```

Voilà ! Maintenant, toutes les valeurs sont remplacées par des valeurs synthétiques. Notez que la correspondance de désanonymisation a été mise à jour en conséquence.

### Système de questions-réponses avec anonymisation des données PII

Maintenant, regroupons tout cela et créons un système complet de questions-réponses, basé sur `PresidioReversibleAnonymizer` et le langage d'expression LangChain (LCEL).

```python
# 1. Initialize anonymizer
anonymizer = PresidioReversibleAnonymizer(
    # Faker seed is used here to make sure the same fake data is generated for the test purposes
    # In production, it is recommended to remove the faker_seed parameter (it will default to None)
    faker_seed=42,
)

anonymizer.add_recognizer(polish_id_recognizer)
anonymizer.add_recognizer(time_recognizer)

anonymizer.add_operators(new_operators)
```

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 2. Load the data: In our case data's already loaded
# 3. Anonymize the data before indexing
for doc in documents:
    doc.page_content = anonymizer.anonymize(doc.page_content)

# 4. Split the documents into chunks
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
chunks = text_splitter.split_documents(documents)

# 5. Index the chunks (using OpenAI embeddings, because the data is already anonymized)
embeddings = OpenAIEmbeddings()
docsearch = FAISS.from_documents(chunks, embeddings)
retriever = docsearch.as_retriever()
```

```python
from operator import itemgetter

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import (
    RunnableLambda,
    RunnableParallel,
    RunnablePassthrough,
)
from langchain_openai import ChatOpenAI

# 6. Create anonymizer chain
template = """Answer the question based only on the following context:
{context}

Question: {anonymized_question}
"""
prompt = ChatPromptTemplate.from_template(template)

model = ChatOpenAI(temperature=0.3)


_inputs = RunnableParallel(
    question=RunnablePassthrough(),
    # It is important to remember about question anonymization
    anonymized_question=RunnableLambda(anonymizer.anonymize),
)

anonymizer_chain = (
    _inputs
    | {
        "context": itemgetter("anonymized_question") | retriever,
        "anonymized_question": itemgetter("anonymized_question"),
    }
    | prompt
    | model
    | StrOutputParser()
)
```

```python
anonymizer_chain.invoke(
    "Where did the theft of the wallet occur, at what time, and who was it stolen from?"
)
```

```output
'The theft of the wallet occurred in the vicinity of New Rita during a bike trip. It was stolen from Brian Cox DVM. The time of the theft was 02:22 AM.'
```

```python
# 7. Add deanonymization step to the chain
chain_with_deanonymization = anonymizer_chain | RunnableLambda(anonymizer.deanonymize)

print(
    chain_with_deanonymization.invoke(
        "Where did the theft of the wallet occur, at what time, and who was it stolen from?"
    )
)
```

```output
The theft of the wallet occurred in the vicinity of Kilmarnock during a bike trip. It was stolen from John Doe. The time of the theft was 9:30 AM.
```

```python
print(
    chain_with_deanonymization.invoke("What was the content of the wallet in detail?")
)
```

```output
The content of the wallet included a credit card with the number 4111 1111 1111 1111, registered under the name of John Doe and linked to the bank account PL61109010140000071219812874. It also contained a driver's license with the number 999000680 issued to John Doe, as well as his Social Security Number 602-76-4532. Additionally, the wallet had a Polish identity card with the number ABC123456.
```

```python
print(chain_with_deanonymization.invoke("Whose phone number is it: 999-888-7777?"))
```

```output
The phone number 999-888-7777 belongs to John Doe.
```

### Approche alternative : embeddings locaux + anonymisation du contexte après l'indexation

Si pour une raison quelconque vous souhaitez indexer les données sous leur forme d'origine, ou simplement utiliser des embeddings personnalisés, voici un exemple de la façon de procéder :

```python
anonymizer = PresidioReversibleAnonymizer(
    # Faker seed is used here to make sure the same fake data is generated for the test purposes
    # In production, it is recommended to remove the faker_seed parameter (it will default to None)
    faker_seed=42,
)

anonymizer.add_recognizer(polish_id_recognizer)
anonymizer.add_recognizer(time_recognizer)

anonymizer.add_operators(new_operators)
```

```python
from langchain_community.embeddings import HuggingFaceBgeEmbeddings

model_name = "BAAI/bge-base-en-v1.5"
# model_kwargs = {'device': 'cuda'}
encode_kwargs = {"normalize_embeddings": True}  # set True to compute cosine similarity
local_embeddings = HuggingFaceBgeEmbeddings(
    model_name=model_name,
    # model_kwargs=model_kwargs,
    encode_kwargs=encode_kwargs,
    query_instruction="Represent this sentence for searching relevant passages:",
)
```

```python
documents = [Document(page_content=document_content)]

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
chunks = text_splitter.split_documents(documents)

docsearch = FAISS.from_documents(chunks, local_embeddings)
retriever = docsearch.as_retriever()
```

```python
template = """Answer the question based only on the following context:
{context}

Question: {anonymized_question}
"""
prompt = ChatPromptTemplate.from_template(template)

model = ChatOpenAI(temperature=0.2)
```

```python
from langchain_core.prompts import format_document
from langchain_core.prompts.prompt import PromptTemplate

DEFAULT_DOCUMENT_PROMPT = PromptTemplate.from_template(template="{page_content}")


def _combine_documents(
    docs, document_prompt=DEFAULT_DOCUMENT_PROMPT, document_separator="\n\n"
):
    doc_strings = [format_document(doc, document_prompt) for doc in docs]
    return document_separator.join(doc_strings)


chain_with_deanonymization = (
    RunnableParallel({"question": RunnablePassthrough()})
    | {
        "context": itemgetter("question")
        | retriever
        | _combine_documents
        | anonymizer.anonymize,
        "anonymized_question": lambda x: anonymizer.anonymize(x["question"]),
    }
    | prompt
    | model
    | StrOutputParser()
    | RunnableLambda(anonymizer.deanonymize)
)
```

```python
print(
    chain_with_deanonymization.invoke(
        "Where did the theft of the wallet occur, at what time, and who was it stolen from?"
    )
)
```

```output
The theft of the wallet occurred in the vicinity of Kilmarnock during a bike trip. It was stolen from John Doe. The time of the theft was 9:30 AM.
```

```python
print(
    chain_with_deanonymization.invoke("What was the content of the wallet in detail?")
)
```

```output
The content of the wallet included:
1. Credit card number: 4111 1111 1111 1111
2. Bank account number: PL61109010140000071219812874
3. Driver's license number: 999000680
4. Social Security Number: 602-76-4532
5. Polish identity card number: ABC123456
```

```python
print(chain_with_deanonymization.invoke("Whose phone number is it: 999-888-7777?"))
```

```output
The phone number 999-888-7777 belongs to John Doe.
```
