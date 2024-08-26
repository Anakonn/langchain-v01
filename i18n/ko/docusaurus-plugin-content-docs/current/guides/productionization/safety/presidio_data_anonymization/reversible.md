---
sidebar_position: 1
title: 가역적 익명화
translated: true
---

# Microsoft Presidio를 사용한 가역적 데이터 익명화

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/privacy/presidio_data_anonymization/reversible.ipynb)

## 사용 사례

이전 섹션에서 민감한 데이터를 익명화하는 것의 중요성에 대해 이미 언급했습니다. **가역적 익명화**는 언어 모델과 정보를 공유할 때 데이터 보호와 데이터 사용 가능성을 균형 있게 유지하는데 중요한 기술입니다. 이 기술은 민감한 개인 식별 정보를 마스킹하지만, 권한이 있는 사용자가 필요할 때 원래 데이터를 복원할 수 있습니다. 주요 장점은 개별 신원을 숨겨 남용을 방지하면서도 법적 또는 준수 목적을 위해 필요할 경우 숨겨진 데이터를 정확히 복원할 수 있다는 점입니다.

## 개요

우리는 `PresidioReversibleAnonymizer`를 구현했으며, 이는 두 부분으로 구성됩니다:

1. 익명화 - `PresidioAnonymizer`와 동일한 방식으로 작동하며, 객체 자체가 생성된 값과 원래 값을 매핑하여 저장합니다. 예를 들어:

```
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

2. 익명 해제 - 위에서 설명한 매핑을 사용하여 가짜 데이터를 원래 데이터와 일치시키고 이를 대체합니다.

익명화와 익명 해제 사이에서 사용자는 다양한 작업을 수행할 수 있습니다. 예를 들어, 출력을 LLM에 전달하는 것입니다.

## 빠른 시작

```python
# 필요한 패키지 설치

%pip install --upgrade --quiet  langchain langchain-experimental langchain-openai presidio-analyzer presidio-anonymizer spacy Faker
# ! python -m spacy download en_core_web_lg

```

`PresidioReversibleAnonymizer`는 익명화 측면에서 이전 버전(`PresidioAnonymizer`)과 크게 다르지 않습니다:

```python
from langchain_experimental.data_anonymizer import PresidioReversibleAnonymizer

anonymizer = PresidioReversibleAnonymizer(
    analyzed_fields=["PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS", "CREDIT_CARD"],
    # 테스트 목적으로 동일한 가짜 데이터가 생성되도록 하기 위해 Faker 시드를 사용합니다.
    # 실제 환경에서는 faker_seed 매개변수를 제거하는 것이 좋습니다(기본값은 None입니다).
    faker_seed=42,
)

anonymizer.anonymize(
    "내 이름은 Slim Shady입니다. 313-666-7440으로 전화하거나 real.slim.shady@gmail.com으로 이메일을 보내세요. "
    "참고로, 내 카드 번호는 4916 0387 9536 0861입니다."
)
```

```output
'내 이름은 Maria Lynch입니다. 7344131647로 전화하거나 jamesmichael@example.com으로 이메일을 보내세요. 참고로, 내 카드 번호는 4838637940262입니다.'
```

익명 해제를 원하는 전체 문자열은 다음과 같습니다:

```python
# faker_seed 매개변수를 설정했기 때문에 이 데이터를 알고 있습니다.

fake_name = "Maria Lynch"
fake_phone = "7344131647"
fake_email = "jamesmichael@example.com"
fake_credit_card = "4838637940262"

anonymized_text = f"""{fake_name}가 최근 지갑을 잃어버렸습니다.
안에는 약간의 현금과 신용카드 번호 {fake_credit_card}가 들어 있습니다.
이 지갑을 발견하시면 {fake_phone}으로 전화하거나 이 이메일로 연락 주세요: {fake_email}.
{fake_name}는 매우 감사할 것입니다!"""

print(anonymized_text)
```

```output
Maria Lynch가 최근 지갑을 잃어버렸습니다.
안에는 약간의 현금과 신용카드 번호 4838637940262가 들어 있습니다.
이 지갑을 발견하시면 7344131647으로 전화하거나 이 이메일로 연락 주세요: jamesmichael@example.com.
Maria Lynch는 매우 감사할 것입니다!
```

이제 `deanonymize` 메서드를 사용하여 과정을 역으로 수행할 수 있습니다:

```python
print(anonymizer.deanonymize(anonymized_text))
```

```output
Slim Shady가 최근 지갑을 잃어버렸습니다.
안에는 약간의 현금과 신용카드 번호 4916 0387 9536 0861가 들어 있습니다.
이 지갑을 발견하시면 313-666-7440으로 전화하거나 이 이메일로 연락 주세요: real.slim.shady@gmail.com.
Slim Shady는 매우 감사할 것입니다!
```

### LangChain 표현 언어와 함께 사용하기

LCEL을 사용하면 익명화 및 익명 해제를 애플리케이션의 나머지 부분과 쉽게 연결할 수 있습니다. 이는 LLM에 대한 쿼리와 함께 익명화 메커니즘을 사용하는 예입니다(익명 해제는 포함하지 않음):

```python
text = """Slim Shady가 최근 지갑을 잃어버렸습니다.
안에는 약간의 현금과 신용카드 번호 4916 0387 9536 0861가 들어 있습니다.
이 지갑을 발견하시면 313-666-7440으로 전화하거나 real.slim.shady@gmail.com으로 이메일을 보내세요."""
```

```python
from langchain_core.prompts.prompt import PromptTemplate
from langchain_openai import ChatOpenAI

anonymizer = PresidioReversibleAnonymizer()

template = """이 텍스트를 공식적인 짧은 이메일로 다시 작성하세요:

{anonymized_text}"""
prompt = PromptTemplate.from_template(template)
llm = ChatOpenAI(temperature=0)

chain = {"anonymized_text": anonymizer.anonymize} | prompt | llm
response = chain.invoke(text)
print(response.content)
```

```output
친애하는 고객님,

Monique Turner가 최근 지갑을 잃어버렸다는 사실을 알려드립니다. 지갑 안에는 현금과 신용카드 번호 213152056829866가 들어 있습니다.

이 지갑을 발견하시면 (770)908-7734x2835으로 전화하거나 barbara25@example.net으로 이메일을 보내주세요.

협조해 주셔서 감사합니다.

진심으로,
[귀하의 이름]
```

이제 **익명 해제 단계**를 시퀀스에 추가해보겠습니다:

```python
chain = chain | (lambda ai_message: anonymizer.deanonymize(ai_message.content))
response = chain.invoke(text)
print(response)
```

```output
친애하는 고객님,

Slim Shady가 최근 지갑을 잃어버렸다는 사실을 알려드립니다. 지갑 안에는 현금과 신용카드 번호 4916 0387 9536 0861가 들어 있습니다.

이 지갑을 발견하시면 313-666-7440으로 전화하거나 real.slim.shady@gmail.com으로 이메일을 보내주세요.

협조해 주셔서 감사합니다.

진심으로,
[귀하의 이름]
```

익명화된 데이터가 모델 자체에 제공되어 외부로 유출되지 않도록 보호되었습니다. 그런 다음 모델의 응답이 처리되어 사실적인 값이 실제 값으로 대체되었습니다.

## 추가 정보

`PresidioReversibleAnonymizer`는 가짜 값과 원래 값을 매핑하는 `deanonymizer_mapping` 매개변수에 매핑을 저장합니다. 키는 가짜 PII이고 값은 원래 값입니다:

```python
from langchain_experimental.data_anonymizer import PresidioReversibleAnonymizer

anonymizer = PresidioReversibleAnonymizer(
    analyzed_fields=["PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS", "CREDIT_CARD"],
    # 테스트 목적으로 동일한 가짜 데이터가 생성되도록 하기 위해 Faker 시드를 사용합니다.
    # 실제 환경에서는 faker_seed 매개변수를 제거하는 것이 좋습니다(기본값은 None입니다).
    faker_seed=42,
)

anonymizer.anonymize(
    "내 이름은 Slim Shady입니다. 313-666-7440으로 전화하거나 real.slim.shady@gmail.com으로 이메일을 보내세요. "
    "참고로, 내 카드 번호는 4916 0387 9536 0861입니다."
)

anonymizer.deanonymizer_mapping
```

```output
{'PERSON': {'Maria Lynch': 'Slim Shady'},
 'PHONE_NUMBER': {'7344131647': '313-666-7440'},
 'EMAIL_ADDRESS': {'jamesmichael@example.com': 'real.slim.shady@gmail.com'},
 'CREDIT_CARD': {'4838637940262': '4916 0387 9536 0861'}}
```

더 많은 텍스트를 익명화하면 새로운 매핑 항목이 생성됩니다:

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

내장된 메모리 덕분에 이미 감지되고 익명화된 엔터티는 이후 처리된 텍스트에서도 동일한 형식을 취하므로 매핑에 중복이 존재하지 않습니다:

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

매핑 자체를 파일로 저장하여 나중에 사용할 수 있습니다:

```python
# deanonymizer 매핑을 JSON 또는 YAML 파일로 저장할 수 있습니다

anonymizer.save_deanonymizer_mapping("deanonymizer_mapping.json")
# anonymizer.save_deanonymizer_mapping("deanonymizer_mapping.yaml")

```

그런 다음, 다른 `PresidioReversibleAnonymizer` 인스턴스에 로드합니다:

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

### 사용자 정의 익명 해제 전략

기본 익명 해제 전략은 텍스트에서 서브스트링을 매핑 항목과 정확히 일치시키는 것입니다. LLM의 비결정성으로 인해 모델이 개인 데이터의 형식을 약간 변경하거나 오타를 낼 수 있습니다. 예를 들어:

- _Keanu Reeves_ -> _Kaenu Reeves_
- _John F. Kennedy_ -> _John Kennedy_
- _Main St, New York_ -> _New York_

따라서 적절한 프롬프트 엔지니어링(모델이 PII를 변경되지 않은 형식으로 반환하도록 유도) 또는 대체 전략을 구현하는 것이 좋습니다. 예를 들어, 퍼지 매칭을 사용할 수 있습니다. 이는 텍스트의 오타 및 사소한 변경 문제를 해결합니다. 대체 전략의 몇 가지 구현은 `deanonymizer_matching_strategies.py` 파일에서 찾을 수 있습니다.

```python
from langchain_experimental.data_anonymizer.deanonymizer_matching_strategies import (
    case_insensitive_matching_strategy,
)

# 원래 이름: Maria Lynch

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

# 원래 이름: Maria Lynch

# 원래 전화번호: 7344131647 (대시 없음)

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

결합된 방법이 가장 잘 작동하는 것 같습니다:

- 먼저 정확한 일치 전략을 적용합니다.
- 그런 다음 퍼지 전략을 사용하여 나머지를 일치시킵니다.

```python
from langchain_experimental.data_anonymizer.deanonymizer_matching_strategies import (
    combined_exact_fuzzy_matching_strategy,
)

# 퍼지 매칭을 보여주기 위해 몇 가지 값을 변경했습니다:

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

물론 완벽한 방법은 없으며 사용 사례에 가장 적합한 방법을 찾기 위해 실험해 보는 것이 좋습니다.

## 향후 작업

- **가짜 값을 실제 값으로 더 나은 매칭 및 대체** - 현재 전략은 전체 문자열을 매칭한 다음 이를 대체하는 것에 기반합니다. 언어 모델의 비결정성으로 인해 답변의 값이 약간 변경될 수 있으며(예: _John Doe_ -> _John_ 또는 _Main St, New York_ -> _New York_) 이러한 대체는 더 이상 가능하지 않을 수 있습니다. 따라서 필요에 맞게 매칭을 조정하는 것이 좋습니다.