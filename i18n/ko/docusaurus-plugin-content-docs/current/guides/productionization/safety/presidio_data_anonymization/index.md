---
translated: true
---

# Microsoft Presidio를 사용한 데이터 익명화

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/privacy/presidio_data_anonymization/index.ipynb)

> [Presidio](https://microsoft.github.io/presidio/) (라틴어 praesidium '보호, 주둔지'에서 유래)는 민감한 데이터가 적절하게 관리되고 통제되도록 도와줍니다. 이는 신용 카드 번호, 이름, 위치, 사회 보장 번호, 비트코인 지갑, 미국 전화 번호, 금융 데이터 등 텍스트 및 이미지 내 개인 정보 식별(PII)을 신속하게 식별하고 익명화하는 모듈을 제공합니다.

## 사용 사례

데이터 익명화는 GPT-4와 같은 언어 모델에 정보를 전달하기 전에 중요합니다. 이는 개인정보 보호와 기밀 유지에 도움이 됩니다. 데이터가 익명화되지 않으면 이름, 주소, 연락처 번호 또는 특정 개인과 연결된 기타 식별자가 학습되고 오용될 가능성이 있습니다. 따라서 이러한 개인 식별 정보를 숨기거나 제거함으로써 개인의 개인정보 보호 권리를 침해하거나 데이터 보호법 및 규정을 위반하지 않고 데이터를 자유롭게 사용할 수 있습니다.

## 개요

익명화는 두 단계로 구성됩니다:

1. **식별:** 개인 식별 정보(PII)를 포함하는 모든 데이터 필드를 식별합니다.
2. **대체:** 모든 PII를 개별 정보에 대한 어떠한 정보도 드러내지 않는 의사 값 또는 코드로 대체하지만 참조 용도로 사용할 수 있습니다. 일반 암호화를 사용하지 않는 이유는 언어 모델이 암호화된 데이터의 의미나 맥락을 이해할 수 없기 때문입니다.

익명화 목적을 위해 *Microsoft Presidio*와 _Faker_ 프레임워크를 함께 사용합니다. 이들의 다양한 기능을 제공합니다. 전체 구현은 `PresidioAnonymizer`에 있습니다.

## 빠른 시작

아래는 LangChain에서 익명화를 활용하는 방법에 대한 사용 사례입니다.

```python
%pip install --upgrade --quiet langchain langchain-openai langchain-experimental presidio-analyzer presidio-anonymizer spacy Faker
```

```python
# 모델 다운로드

!python -m spacy download en_core_web_lg
```

샘플 문장을 사용하여 PII 익명화가 어떻게 작동하는지 살펴보겠습니다:

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

### LangChain Expression Language와 함께 사용하기

LCEL을 사용하면 익명화를 애플리케이션의 나머지 부분과 쉽게 연결할 수 있습니다.

```python
# 환경 변수 OPENAI_API_KEY 설정 또는 .env 파일에서 로드:

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

## 사용자 지정

특정 유형의 데이터만 익명화하려면 `analyzed_fields`를 지정할 수 있습니다.

```python
anonymizer = PresidioAnonymizer(analyzed_fields=["PERSON"])

anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com"
)
```

```output
'My name is Shannon Steele, call me at 313-666-7440 or email me at real.slim.shady@gmail.com'
```

이처럼 이름이 올바르게 식별되어 다른 이름으로 대체되었습니다. `analyzed_fields` 속성은 어떤 값을 감지하고 대체할지를 결정합니다. 목록에 *PHONE_NUMBER*를 추가할 수 있습니다:

```python
anonymizer = PresidioAnonymizer(analyzed_fields=["PERSON", "PHONE_NUMBER"])
anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com"
)
```

```output
'My name is Wesley Flores, call me at (498)576-9526 or email me at real.slim.shady@gmail.com'
```

`analyzed_fields`가 지정되지 않은 경우 기본적으로 익명화기는 모든 지원 형식을 감지합니다. 전체 목록은 다음과 같습니다:

`['PERSON', 'EMAIL_ADDRESS', 'PHONE_NUMBER', 'IBAN_CODE', 'CREDIT_CARD', 'CRYPTO', 'IP_ADDRESS', 'LOCATION', 'DATE_TIME', 'NRP', 'MEDICAL_LICENSE', 'URL', 'US_BANK_NUMBER', 'US_DRIVER_LICENSE', 'US_ITIN', 'US_PASSPORT', 'US_SSN']`

**면책 조항:** 감지할 개인 데이터를 신중하게 정의하는 것이 좋습니다 - Presidio는 완벽하게 작동하지 않으며 때때로 실수를 하기 때문에 데이터에 대한 더 많은 제어가 필요합니다.

```python
anonymizer = PresidioAnonymizer()
anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com"
)
```

```output
'My name is Carla Fisher, call me at 001-683-324-0721x0644 or email me at krausejeremy@example.com'
```

위의 감지 필드 목록이 충분하지 않을 수 있습니다. 예를 들어, 이미 사용 가능한 _PHONE_NUMBER_ 필드는 폴란드 전화 번호를 지원하지 않으며 다른 필드와 혼동합니다:

```python
anonymizer = PresidioAnonymizer()
anonymizer.anonymize("My polish phone number is 666555444")
```

```output
'My polish phone number is QESQ21234635370499'
```

\
다음과 같이 고유한 인식기를 작성하고 현재 존재하는 인식기 풀에 추가할 수 있습니다. 인식기를 만드는 방법에 대한 자세한 내용은 [Presidio 문서](https://microsoft.github.io/presidio/samples/python/customizing_presidio_analyzer/)에 설명되어 있습니다.

```python
# Presidio `Pattern` 객체에서 정규식 패턴 정의:

from presidio_analyzer import Pattern, PatternRecognizer

polish_phone_numbers_pattern = Pattern(
    name="polish_phone_numbers_pattern",
    regex="(?<!\w)(\(?(\+|00)?48\)?)?[ -]?\d{3}[ -]?\d{3}[ -]?\d{3}(?!\w)",
    score=1,
)

# 하나 이상의 패턴으로 인식기 정의

polish_phone_numbers_recognizer = PatternRecognizer(
    supported_entity="POLISH_PHONE_NUMBER", patterns=[polish_phone_numbers_pattern]
)
```

\
이제 익명화기에서 `add_recognizer` 메서드를 호출하여 인식기를 추가할 수 있습니다:

```python
anonymizer.add_recognizer(polish_phone_numbers_recognizer)
```

\
그리고 짜잔! 추가된 패턴 기반 인식기로 익명화기가 폴란드 전화 번호를 처리합니다.

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

문제는 - 비록 이제 폴란드 전화 번호를 인식하더라도, 해당 필드를 어떻게 대체할지를 알려줄 방법(연산자)이 없다는 것입니다 - 때문에 출력에서는 단순히 문자열 `<POLISH_PHONE_NUMBER>`로 제공됩니다. 올바르게 대체하는 방법을 만들어야 합니다:

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
Faker를 사용하여 의사 데이터를 생성했습니다. 이제 연산자를 생성하고 익명화기에 추가할 수 있습니다. 연산자와 그 생성에 대한 완전한 정보는 [간단한](https://microsoft.github.io/presidio/tutorial/10_simple_anonymization/) 및 [사용자 정의](https://microsoft.github.io/presidio/tutorial/11_custom_anonymization/) 익명화에 대한 Presidio 문서를 참조하세요.

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

## 중요한 고려사항

### 익명화기 감지율

**익명화 수준과 감지 정확도는 구현된 인식기의 품질만큼이나 좋습니다.**

다양한 소스와 다양한 언어의 텍스트는 각각 다른 특성을 가지고 있으므로, 감지 정확도를 테스트하고 인식기와 연산자를 반복적으로 추가하여 더 나은 결과를 얻어야 합니다.

Microsoft Presidio는 익명화를 정밀하게 조정할 수 있는 많은 자유를 제공합니다. 라이브러리 작성자는 [감지율 개선을 위한 권장 사항 및 단계별 가이드](https://github.com/microsoft/presidio/discussions/767#discussion-3567223)를 제공했습니다.

### 인스턴스 익명화

`PresidioAnonymizer`에는 내장 메모리가 없습니다. 따라서 후속 텍스트에서 엔티티의 두 발생은 두 개의 다른 가짜 값으로 대체됩니다:

```python
print(anonymizer.anonymize("My name is John Doe. Hi John Doe!"))
print(anonymizer.anonymize("My name is John Doe. Hi John Doe!"))
```

```output
My name is Robert Morales. Hi Robert Morales!
My name is Kelly Mccoy. Hi Kelly Mccoy!
```

이전 익명화 결과를 보존하려면 내장 메모리가 있는 `PresidioReversibleAnonymizer`를 사용하세요:

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

`PresidioReversibleAnonymizer`에 대한 자세한 내용은 다음 섹션에서 확인할 수 있습니다.