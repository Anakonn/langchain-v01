---
sidebar_position: 2
title: Multi-language anonymization
translated: true
---

# Multi-language data anonymization with Microsoft Presidio

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/privacy/presidio_data_anonymization/multi_language.ipynb)

## Use case

다국어 지원을 위한 데이터 익명화는 언어 구조와 문화적 맥락의 차이로 인해 필수적입니다. 각 언어마다 개인 식별자의 형식이 다를 수 있습니다. 예를 들어, 이름, 위치, 날짜의 구조는 언어와 지역에 따라 크게 다를 수 있습니다. 또한, 비알파벳 문자, 악센트, 글쓰기 방향이 익명화 과정에 영향을 미칠 수 있습니다. 다국어 지원이 없으면 데이터가 식별 가능한 상태로 남거나 오해를 초래할 수 있어 데이터 프라이버시와 정확성을 저해할 수 있습니다. 따라서 글로벌 운영에 적합한 효과적이고 정밀한 익명화를 가능하게 합니다.

## 개요

Microsoft Presidio에서 PII 감지는 여러 구성 요소에 의존합니다. 일반적인 패턴 매칭(예: 정규식 사용) 외에도 분석기는 Named Entity Recognition(NER) 모델을 사용하여 다음과 같은 엔티티를 추출합니다:

- `PERSON`
- `LOCATION`
- `DATE_TIME`
- `NRP`
- `ORGANIZATION`

[[출처]](https://github.com/microsoft/presidio/blob/main/presidio-analyzer/presidio_analyzer/predefined_recognizers/spacy_recognizer.py)

특정 언어의 NER 처리를 위해, 우리는 다수의 언어와 크기를 포괄하는 광범위한 선택으로 인정받는 `spaCy` 라이브러리의 고유한 모델을 활용합니다. 그러나 이는 제한적이지 않으며, 필요에 따라 [Stanza](https://microsoft.github.io/presidio/analyzer/nlp_engines/spacy_stanza/) 또는 [transformers](https://microsoft.github.io/presidio/analyzer/nlp_engines/transformers/)와 같은 대체 프레임워크의 통합도 허용합니다.

## 빠른 시작

```python
%pip install --upgrade --quiet langchain langchain-openai langchain-experimental presidio-analyzer presidio-anonymizer spacy Faker
```

```python
# 모델 다운로드

!python -m spacy download en_core_web_lg
```

```python
from langchain_experimental.data_anonymizer import PresidioReversibleAnonymizer

anonymizer = PresidioReversibleAnonymizer(
    analyzed_fields=["PERSON"],
)
```

기본적으로 `PresidioAnonymizer` 및 `PresidioReversibleAnonymizer`는 영어 텍스트로 훈련된 모델을 사용하므로 다른 언어를 적당히 처리합니다.

예를 들어, 여기에서는 사람이 감지되지 않았습니다:

```python
anonymizer.anonymize("Me llamo Sofía")  # 스페인어로 "내 이름은 Sofía입니다"
```

```output
'Me llamo Sofía'
```

다른 언어의 단어를 실제 엔티티로 간주할 수도 있습니다. 여기에서는 스페인어 단어 _'Yo'_ (스페인어로 _'I'_)와 *Sofía*가 `PERSON`으로 분류되었습니다:

```python
anonymizer.anonymize("Yo soy Sofía")  # 스페인어로 "나는 Sofía입니다"
```

```output
'Kari Lopez soy Mary Walker'
```

다른 언어의 텍스트를 익명화하려면 다른 모델을 다운로드하고 익명화기 구성에 추가해야 합니다:

```python
# 사용할 언어 모델 다운로드

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

우리는 따라서 스페인어 모델을 추가했습니다. 또한 영어 모델도 대체 모델로 다운로드했습니다 - 이 경우 대형 모델 `en_core_web_lg` (560MB)를 더 작은 버전 `en_core_web_md` (40MB)로 교체했습니다 - 따라서 크기가 14배 줄었습니다! 익명화 속도가 중요하다면 이를 고려할 가치가 있습니다.

다른 언어의 모든 모델은 [spaCy 문서](https://spacy.io/usage/models)에서 찾을 수 있습니다.

이제 구성 정보를 Anonymizer의 `languages_config` 매개변수로 전달합니다. 이전의 두 예제 모두 완벽하게 작동합니다:

```python
anonymizer = PresidioReversibleAnonymizer(
    analyzed_fields=["PERSON"],
    languages_config=nlp_config,
)

print(
    anonymizer.anonymize("Me llamo Sofía", language="es")
)  # 스페인어로 "내 이름은 Sofía입니다"
print(anonymizer.anonymize("Yo soy Sofía", language="es"))  # 스페인어로 "나는 Sofía입니다"
```

```output
Me llamo Christopher Smith
Yo soy Joseph Jenkins
```

기본적으로 구성에서 첫 번째로 지정된 언어가 텍스트를 익명화할 때 사용됩니다 (이 경우 영어):

```python
print(anonymizer.anonymize("My name is John"))
```

```output
My name is Shawna Bennett
```

## 다른 프레임워크와의 사용

### 언어 감지

제시된 접근 방식의 단점 중 하나는 입력 텍스트의 **언어**를 직접 전달해야 한다는 것입니다. 그러나 이를 해결할 수 있는 방법이 있습니다 - _언어 감지_ 라이브러리.

다음 프레임워크 중 하나를 사용하는 것을 권장합니다:

- fasttext (권장)
- langdetect

우리의 경험에 따르면 *fasttext*가 약간 더 나은 성능을 보이지만, 사용 사례에 따라 검증해보아야 합니다.

```python
# 필요한 패키지 설치

%pip install --upgrade --quiet fasttext langdetect
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

먼저 fasttext 모델을 https://dl.fbaipublicfiles.com/fasttext/supervised-models/lid.176.ftz 에서 다운로드해야 합니다.

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

이 방법을 통해 관련 언어에 해당하는 엔진으로 모델을 초기화하기만 하면 도구 사용이 완전히 자동화됩니다.

## 고급 사용법

### NER 모델의 사용자 지정 레이블

spaCy 모델이 Microsoft Presidio에서 기본적으로 지원하는 클래스 이름과 다른 클래스 이름을 가질 수 있습니다. 예를 들어, 폴란드어를 살펴보겠습니다:

```python
# ! python -m spacy download pl_core_news_md

import spacy

nlp = spacy.load("pl_core_news_md")
doc = nlp("Nazywam się Wiktoria")  # 폴란드어로 "내 이름은 Wiktoria입니다"

for ent in doc.ents:
    print(
        f"Text: {ent.text}, Start: {ent.start_char}, End: {ent.end_char}, Label: {ent.label_}"
    )
```

```output
Text: Wiktoria, Start: 12, End: 20, Label: persName
```

이름 *Wiktoria*는 `persName`으로 분류되었으며, 이는 Microsoft Presidio에 기본적으로 구현된 클래스 이름 `PERSON`/`PER`에 해당하지 않습니다 ( `CHECK_LABEL_GROUPS`를 확인하십시오 [SpacyRecognizer 구현](https://github.com/microsoft/presidio/blob/main/presidio-analyzer/presidio_analyzer/predefined_recognizers/spacy_recognizer.py) 참조).

spaCy 모델(자신의 훈련된 모델 포함)의 사용자 지정 레이블에 대한 자세한 내용은 [이 스레드](https://github.com/microsoft/presidio/issues/851)에서 확인할 수 있습니다.

따라서 우리의 문장은 익명화되지 않을 것입니다:

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
)  # 폴란드어로 "내 이름은 Wiktoria입니다"
```

```output
Nazywam się Wiktoria
```

이를 해결하려면 사용자 지정 클래스 매핑이 있는 자체 `SpacyRecognizer`를 생성하고 이를 익명화기에 추가하십시오:

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

이제 모든 것이 원활하게 작동합니다:

```python
print(
    anonymizer.anonymize("Nazywam się Wiktoria", language="pl")
)  # 폴란드어로 "내 이름은 Wiktoria입니다"
```

```output
Nazywam się Morgan Walters
```

더 복잡한 예제에서도 시도해보겠습니다:

```python
print(
    anonymizer.anonymize(
        "Nazywam się Wiktoria. Płock to moje miasto rodzinne. Urodziłam się dnia 6 kwietnia 2001 roku",
        language="pl",
    )
)  # 폴란드어로 "내 이름은 Wiktoria입니다. Płock은 내 고향입니다. 나는 2001년 4월 6일에 태어났습니다"
```

```output
Nazywam się Ernest Liu. New Taylorburgh to moje miasto rodzinne. Urodziłam się 1987-01-19
```

보시다시피 클래스 매핑 덕분에 익명화기는 다양한 유형의 엔티티를 처리할 수 있습니다.

### 언어별 사용자 지정 연산자

위 예제에서 문장이 올바르게 익명화되었지만 가짜 데이터가 폴란드어에 맞지 않습니다. 따라서 문제를 해결할 수 있는 사용자 지정 연산자를 추가할 수 있습니다:

```python
from faker import Faker
from presidio_anonymizer.entities import OperatorConfig

fake = Faker(locale="pl_PL")  # 폴란드어 데이터를 제공하도록 faker 설정

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
)  # 폴란드어로 "내 이름은 Wiktoria입니다. Płock은 내 고향입니다. 나는 2001년 4월 6일에 태어났습니다"
```

```output
Nazywam się Marianna. Szczecin to moje miasto rodzinne. Urodziłam się 1976-11-16
```

### 한계

기억하십시오 - 결과는 인식기와 NER 모델의 품질만큼 좋습니다!

아래 예를 보십시오 - 우리는 스페인어에 대해 작은 모델을 다운로드했으며(12MB), 이제 중간 버전(40MB)만큼 잘 수행되지 않습니다:

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

많은 경우, spaCy의 더 큰 모델조차도 충분하지 않을 것입니다 - 이미 transformers 기반으로 하는 더 복잡하고 나은 방법의 명명된 엔티티 감지가 있습니다. 이에 대해 자세히 읽을 수 있습니다 [여기](https://microsoft.github.io/presidio/analyzer/nlp_engines/transformers/).