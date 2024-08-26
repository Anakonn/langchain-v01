---
sidebar_position: 3
title: QA with private data protection
translated: true
---

# QA with private data protection

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/privacy/presidio_data_anonymization/qa_privacy_protection.ipynb)

이 노트북에서는 개인 데이터를 기반으로 한 질문 응답 시스템을 구축하는 기본적인 방법을 살펴보겠습니다. 이 데이터를 LLM에 전달하기 전에 보호해야 하므로 외부 API(OpenAI, Anthropic 등)로 전송되지 않도록 해야 합니다. 그런 다음 모델 출력을 받은 후 데이터를 원래 형태로 복원하고자 합니다. 아래에서 이 QA 시스템의 예제 흐름을 관찰할 수 있습니다:

<img src="/img/qa_privacy_protection.png" width="900"/>

다음 노트북에서는 익명화기가 어떻게 작동하는지에 대한 세부 사항을 다루지 않습니다. 자세한 내용은 [이 문서의 해당 부분](/docs/guides/productionization/safety/presidio_data_anonymization/)을 방문하십시오.

## 빠른 시작

### 익명화기의 점진적 업그레이드 프로세스

```python
%pip install --upgrade --quiet langchain langchain-experimental langchain-openai presidio-analyzer presidio-anonymizer spacy Faker faiss-cpu tiktoken
```

```python
# 모델 다운로드

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

우리는 단 하나의 문서만 가지고 있으므로 QA 시스템을 생성하기 전에 먼저 그 내용을 살펴보겠습니다.

텍스트에는 다양한 PII 값이 포함되어 있으며, 일부 유형은 반복적으로 나타납니다(이름, 전화번호, 이메일) 그리고 특정 PII가 반복됩니다(John Doe).

```python
# PII 마커 색상을 지정하는 유틸리티 함수

# NOTE: 문서 페이지에서는 표시되지 않으며, 노트북에서만 사용됩니다.

import re

def print_colored_pii(string):
    colored_string = re.sub(
        r"(<[^>]*>)", lambda m: "\033[31m" + m.group(1) + "\033[0m", string
    )
    print(colored_string)
```

기본 설정으로 텍스트를 익명화해 보겠습니다. 지금은 데이터를 합성된 값으로 대체하지 않고 마커(예: `<PERSON>`)로 표시하기만 하므로 `add_default_faker_operators=False`로 설정합니다:

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

익명화된 값과 원래 값 간의 매핑도 확인해 보겠습니다:

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

일반적으로 익명화기는 매우 잘 작동하지만 두 가지 개선 사항을 관찰할 수 있습니다:

1. 날짜 및 시간 중복 - `DATE_TIME`으로 인식된 두 개의 서로 다른 엔티티가 있지만, 이들은 서로 다른 유형의 정보를 포함하고 있습니다. 첫 번째는 날짜(예: _October 19, 2021_), 두 번째는 시간(예: _9:30 AM_)입니다. 시간을 날짜와 별도로 처리하는 새로운 인식기를 추가하여 이를 개선할 수 있습니다.
2. 폴란드 ID - 폴란드 ID는 고유한 패턴을 가지고 있으며, 기본적으로 익명화기 인식기에 포함되지 않습니다. 값 *ABC123456*은 익명화되지 않았습니다.

해결 방법은 간단합니다: 익명화기에 새로운 인식기를 추가해야 합니다. 자세한 내용은 [presidio documentation](https://microsoft.github.io/presidio/analyzer/adding_recognizers/)에서 확인할 수 있습니다.

새로운 인식기를 추가해 보겠습니다:

```python
# Presidio `Pattern` 객체에서 정규식 패턴 정의:

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

# 하나 이상의 패턴으로 인식기 정의

polish_id_recognizer = PatternRecognizer(
    supported_entity="POLISH_ID", patterns=[polish_id_pattern]
)
time_recognizer = PatternRecognizer(supported_entity="TIME", patterns=[time_pattern])
```

그리고 이제 인식기를 익명화기에 추가합니다:

```python
anonymizer.add_recognizer(polish_id_recognizer)
anonymizer.add_recognizer(time_recognizer)
```

익명화 인스턴스가 이전에 감지되고 익명화된 값을 기억한다는 점에 유의하십시오. 여기에는 올바르게 감지되지 않은 값(예: `DATE_TIME`으로 처리된 _"9:30 AM"_)도 포함됩니다. 인식기가 업데이트되었으므로 이 값을 제거하거나 전체 매핑을 재설정하는 것이 좋습니다:

```python
anonymizer.reset_deanonymizer_mapping()
```

텍스트를 익명화하고 결과를 확인해 보겠습니다:

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

보시다시피, 새로운 인식기는 예상대로 작동합니다. 익명화기는 시간 및 폴란드 ID 엔티티를 `<TIME>` 및 `<POLISH_ID>` 마커로 대체했으며, 복호화 매핑도 적절히 업데이트되었습니다.

이제 모든 PII 값이 올바르게 감지되었으므로 다음 단계로 넘어가 원래 값을 합성된 값으로 대체할 수 있습니다. 이를 위해 `add_default_faker_operators=True`로 설정하면 됩니다(또는 이 매개변수를 제거할 수도 있습니다. 기본값은 `True`로 설정되어 있기 때문입니다).

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

What's more, I had my polish identity card there, with the number <POLISH_ID>.

I would like this data to be secured and protected in all possible ways. I believe It was stolen at <TIME>.

In case any information arises regarding my wallet, please reach out to me on my phone number, 7344131647, or through my personal email, jamesmichael@example.com.

Please consider this information to be highly confidential and respect my privacy.

The bank has been informed about the stolen credit card and necessary actions have been taken from their end. They will be reachable at their official email, blakeerik@example.com.
My representative there is Cristian Santos (her business phone: 2812140441).

Thank you for your assistance,

Brian Cox DVM
```

보시다시피 거의 모든 값이 합성된 값으로 대체되었습니다. 유일한 예외는 기본 faker 연산자에서 지원되지 않는 폴란드 ID 번호와 시간입니다. 우리는 익명화기에 새로운 연산자를 추가하여 무작위 데이터를 생성할 수 있습니다. 사용자 지정 연산자에 대해 자세히 알아보려면 [여기](https://microsoft.github.io/presidio/tutorial/11_custom_anonymization/)를 참조하십시오.

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

새로 만든 연산자를 익명화기에 추가해 보겠습니다:

```python
from presidio_anonymizer.entities import OperatorConfig

new_operators = {
    "POLISH_ID": OperatorConfig("custom", {"lambda": fake_polish_id}),
    "TIME": OperatorConfig("custom", {"lambda": fake_time}),
}

anonymizer.add_operators(new_operators)
```

모든 것을 다시 익명화해 보겠습니다:

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

Voilà! 이제 모든 값이 합성된 값으로 대체되었습니다. 복호화 매핑도 적절히 업데이트되었습니다.

### PII 익명화가 포함된 질문-응답 시스템

이제 `PresidioReversibleAnonymizer`와 LangChain Expression Language (LCEL)를 기반으로 전체 질문-응답 시스템을 만들어 보겠습니다.

```python
# 1. 익명화기 초기화

anonymizer = PresidioReversibleAnonymizer(
    # Faker seed는 테스트 목적으로 동일한 가짜 데이터가 생성되도록 설정합니다.
    # 실제 운영에서는 faker_seed 매개변수를 제거하는 것이 좋습니다(기본값은 None입니다).
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

# 2. 데이터 로드: 우리의 경우 데이터가 이미 로드됨

# 3. 인덱싱 전에 데이터를 익명화

for doc in documents:
    doc.page_content = anonymizer.anonymize(doc.page_content)

# 4. 문서를 청크로 분할

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
chunks = text_splitter.split_documents(documents)

# 5. 청크 인덱싱 (데이터가 이미 익명화되었으므로 OpenAI 임베딩 사용)

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

# 6. 익명화 체인 생성

template = """Answer the question based only on the following context:
{context}

Question: {anonymized_question}
"""
prompt = ChatPromptTemplate.from_template(template)

model = ChatOpenAI(temperature=0.3)

_inputs = RunnableParallel(
    question=RunnablePassthrough(),
    # 질문 익명화가 중요함
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
# 7. 체인에 복호화 단계 추가

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

### 대체 접근 방식: 인덱싱 후 로컬 임베딩 + 컨텍스트 익명화

어떤 이유로 원본 형태로 데이터를 인덱싱하거나 사용자 정의 임베딩을 사용하고 싶다면, 아래 예제를 참고하십시오:

```python
anonymizer = PresidioReversibleAnonymizer(
    # Faker seed는 테스트 목적으로 동일한 가짜 데이터가 생성되도록 설정합니다.
    # 실제 운영에서는 faker_seed 매개변수를 제거하는 것이 좋습니다(기본값은 None입니다).
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

encode_kwargs = {"normalize_embeddings": True}  # 코사인 유사도 계산을 위해 True로 설정
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