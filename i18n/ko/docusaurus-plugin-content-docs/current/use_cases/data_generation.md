---
sidebar_class_name: hidden
title: 합성 데이터 생성
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/data_generation.ipynb)

## 사용 사례

합성 데이터는 실제 세계 이벤트에서 수집된 데이터가 아닌 인공적으로 생성된 데이터입니다. 이는 프라이버시를 침해하지 않거나 실제 세계의 제한 사항을 겪지 않으면서 실제 데이터를 시뮬레이션하는 데 사용됩니다.

합성 데이터의 이점:

1. **프라이버시 및 보안**: 실제 개인 데이터 유출 위험이 없음.
2. **데이터 증강**: 머신러닝을 위한 데이터셋 확장.
3. **유연성**: 특정 또는 드문 시나리오 생성 가능.
4. **비용 효율적**: 실제 데이터 수집보다 저렴한 경우가 많음.
5. **규제 준수**: 엄격한 데이터 보호 법규를 준수하는 데 도움.
6. **모델 강건성**: 더 잘 일반화되는 AI 모델로 이어질 수 있음.
7. **빠른 프로토타이핑**: 실제 데이터 없이 빠른 테스트 가능.
8. **통제된 실험**: 특정 조건을 시뮬레이션 가능.
9. **데이터 접근성**: 실제 데이터가 없는 경우 대안 제공.

주의: 이점에도 불구하고 합성 데이터는 항상 실제 세계의 복잡성을 완벽하게 반영하지 않을 수 있으므로 주의해서 사용해야 합니다.

## 빠른 시작

이 노트북에서는 langchain 라이브러리를 사용하여 합성 의료 청구 기록을 생성하는 방법을 자세히 다룹니다. 이 도구는 프라이버시 문제나 데이터 가용성 문제로 인해 실제 환자 데이터를 사용하지 않으려는 경우 알고리즘을 개발하거나 테스트할 때 특히 유용합니다.

### 설정

먼저, langchain 라이브러리와 그 종속성을 설치해야 합니다. OpenAI 생성기 체인을 사용하기 때문에 그것도 설치할 것입니다. 실험적인 라이브러리이므로 `langchain_experimental`도 설치해야 합니다. 필요한 모듈을 가져오겠습니다.

```python
%pip install --upgrade --quiet langchain langchain_experimental langchain-openai
# 환경 변수 OPENAI_API_KEY 설정 또는 .env 파일에서 로드:

# import dotenv

# dotenv.load_dotenv()

from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate
from langchain_core.pydantic_v1 import BaseModel
from langchain_experimental.tabular_synthetic_data.openai import (
    OPENAI_TEMPLATE,
    create_openai_data_generator,
)
from langchain_experimental.tabular_synthetic_data.prompts import (
    SYNTHETIC_FEW_SHOT_PREFIX,
    SYNTHETIC_FEW_SHOT_SUFFIX,
)
from langchain_openai import ChatOpenAI
```

## 1. 데이터 모델 정의

모든 데이터셋에는 구조나 "스키마"가 있습니다. 아래의 MedicalBilling 클래스는 합성 데이터의 스키마 역할을 합니다. 이를 정의함으로써 우리가 기대하는 데이터의 형태와 성격을 합성 데이터 생성기에 알릴 수 있습니다.

```python
class MedicalBilling(BaseModel):
    patient_id: int
    patient_name: str
    diagnosis_code: str
    procedure_code: str
    total_charge: float
    insurance_claim_amount: float
```

예를 들어, 각 기록에는 정수형 `patient_id`, 문자열형 `patient_name` 등이 포함됩니다.

## 2. 샘플 데이터

합성 데이터 생성기를 안내하기 위해 몇 가지 실제와 유사한 예제를 제공하는 것이 유용합니다. 이러한 예제는 "시드" 역할을 하며, 생성기는 이를 사용하여 유사한 데이터를 더 많이 생성합니다.

다음은 몇 가지 가상의 의료 청구 기록입니다:

```python
examples = [
    {
        "example": """Patient ID: 123456, Patient Name: John Doe, Diagnosis Code:
        J20.9, Procedure Code: 99203, Total Charge: $500, Insurance Claim Amount: $350"""
    },
    {
        "example": """Patient ID: 789012, Patient Name: Johnson Smith, Diagnosis
        Code: M54.5, Procedure Code: 99213, Total Charge: $150, Insurance Claim Amount: $120"""
    },
    {
        "example": """Patient ID: 345678, Patient Name: Emily Stone, Diagnosis Code:
        E11.9, Procedure Code: 99214, Total Charge: $300, Insurance Claim Amount: $250"""
    },
]
```

## 3. 프롬프트 템플릿 작성

생성기는 우리의 데이터를 어떻게 생성해야 할지 자동으로 알지 못합니다. 이를 안내하기 위해 프롬프트 템플릿을 작성합니다. 이 템플릿은 원하는 형식으로 합성 데이터를 생성하도록 기본 언어 모델에 지시하는 역할을 합니다.

```python
OPENAI_TEMPLATE = PromptTemplate(input_variables=["example"], template="{example}")

prompt_template = FewShotPromptTemplate(
    prefix=SYNTHETIC_FEW_SHOT_PREFIX,
    examples=examples,
    suffix=SYNTHETIC_FEW_SHOT_SUFFIX,
    input_variables=["subject", "extra"],
    example_prompt=OPENAI_TEMPLATE,
)
```

`FewShotPromptTemplate`는 다음을 포함합니다:

- `prefix`와 `suffix`: 이는 안내 컨텍스트나 지침을 포함할 수 있습니다.
- `examples`: 앞서 정의한 샘플 데이터.
- `input_variables`: "subject", "extra"와 같은 변수는 나중에 동적으로 채울 수 있는 자리 표시자입니다. 예를 들어, "subject"는 모델을 추가로 안내하기 위해 "medical_billing"으로 채울 수 있습니다.
- `example_prompt`: 이 프롬프트 템플릿은 우리의 프롬프트에서 각 예제 행이 취해야 할 형식입니다.

## 4. 데이터 생성기 생성

스키마와 프롬프트가 준비되었으므로, 다음 단계는 데이터 생성기를 만드는 것입니다. 이 객체는 기본 언어 모델과 통신하여 합성 데이터를 얻는 방법을 알고 있습니다.

```python
synthetic_data_generator = create_openai_data_generator(
    output_schema=MedicalBilling,
    llm=ChatOpenAI(
        temperature=1
    ),  # 실제 언어 모델 인스턴스로 교체해야 합니다.
    prompt=prompt_template,
)
```

## 5. 합성 데이터 생성

마지막으로, 합성 데이터를 얻어보겠습니다!

```python
synthetic_results = synthetic_data_generator.generate(
    subject="medical_billing",
    extra="이름은 무작위로 선택되어야 합니다. 보통 선택하지 않는 이름으로 만드세요.",
    runs=10,
)
```

이 명령은 생성기에게 10개의 합성 의료 청구 기록을 생성하도록 요청합니다. 결과는 `synthetic_results`에 저장됩니다. 출력은 MedicalBilling pydantic 모델의 리스트가 될 것입니다.

### 기타 구현

```python
from langchain_experimental.synthetic_data import (
    DatasetGenerator,
    create_data_generation_chain,
)
from langchain_openai import ChatOpenAI
```

```python
# LLM

model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7)
chain = create_data_generation_chain(model)
```

```python
chain({"fields": ["blue", "yellow"], "preferences": {}})
```

```output
{'fields': ['blue', 'yellow'],
 'preferences': {},
 'text': 'The vibrant blue sky contrasted beautifully with the bright yellow sun, creating a stunning display of colors that instantly lifted the spirits of all who gazed upon it.'}
```

```python
chain(
    {
        "fields": {"colors": ["blue", "yellow"]},
        "preferences": {"style": "Make it in a style of a weather forecast."},
    }
)
```

```output
{'fields': {'colors': ['blue', 'yellow']},
 'preferences': {'style': 'Make it in a style of a weather forecast.'},
 'text': "Good morning! Today's weather forecast brings a beautiful combination of colors to the sky, with hues of blue and yellow gently blending together like a mesmerizing painting."}
```

```python
chain(
    {
        "fields": {"actor": "Tom Hanks", "movies": ["Forrest Gump", "Green Mile"]},
        "preferences": None,
    }
)
```

```output
{'fields': {'actor': 'Tom Hanks', 'movies': ['Forrest Gump', 'Green Mile']},
 'preferences': None,
 'text': 'Tom Hanks, the renowned actor known for his incredible versatility and charm, has graced the silver screen in unforgettable movies such as "Forrest Gump" and "Green Mile".'}
```

```python
chain(
    {
        "fields": [
            {"actor": "Tom Hanks", "movies": ["Forrest Gump", "Green Mile"]},
            {"actor": "Mads Mikkelsen", "movies": ["Hannibal", "Another round"]},
        ],
        "preferences": {"minimum_length": 200, "style": "gossip"},
    }
)
```

```output
{'fields': [{'actor': 'Tom Hanks', 'movies': ['Forrest Gump', 'Green Mile']},
  {'actor': 'Mads Mikkelsen', 'movies': ['Hannibal', 'Another round']}],
 'preferences': {'minimum_length': 200, 'style': 'gossip'},
 'text': 'Did you know that Tom Hanks, the beloved Hollywood actor known for his roles in "Forrest Gump" and "Green Mile", has shared the screen with the talented Mads Mikkelsen, who gained international acclaim for his performances in "Hannibal" and "Another round"? These two incredible actors have brought their exceptional skills and captivating charisma to the big screen, delivering unforgettable performances that have enthralled audiences around the world. Whether it\'s Hanks\' endearing portrayal of Forrest Gump or Mikkelsen\'s chilling depiction of Hannibal Lecter, these movies have solidified their places in cinematic history, leaving a lasting impact on viewers and cementing their status as true icons of the silver screen.'}
```

위에서 보듯이 생성된 예제들은 다양하며 우리가 원하는 정보를 가지고 있습니다. 또한 스타일도 주어진 선호도를 잘 반영하고 있습니다.

## 추출 벤치마킹 목적을 위한 예제 데이터셋 생성

```python
inp = [
    {
        "Actor": "Tom Hanks",
        "Film": [
            "Forrest Gump",
            "Saving Private Ryan",
            "The Green Mile",
            "Toy Story",
            "Catch Me If You Can",
        ],
    },
    {
        "Actor": "Tom Hardy",
        "Film": [
            "Inception",
            "The Dark Knight Rises",
            "Mad Max: Fury Road",
            "The Revenant",
            "Dunkirk",
        ],
    },
]

generator = DatasetGenerator(model, {"style": "informal", "minimal length": 500})
dataset = generator(inp)
```

```python
dataset
```

```output
[{'fields': {'Actor': 'Tom Hanks',
   'Film': ['Forrest Gump',
    'Saving Private Ryan',
    'The Green Mile',
    'Toy Story',
    'Catch Me If You Can']},
  'preferences': {'style': 'informal', 'minimal length': 500},
  'text': 'Tom Hanks, the versatile and charismatic actor, has graced the silver screen in numerous iconic films including the heartwarming and inspirational "Forrest Gump," the intense and gripping war drama "Saving Private Ryan," the emotionally charged and thought-provoking "The Green Mile," the beloved animated classic "Toy Story," and the thrilling and captivating true story adaptation "Catch Me If You Can." With his impressive range and genuine talent, Hanks continues to captivate audiences worldwide, leaving an indelible mark on the world of cinema.'},
 {'fields': {'Actor': 'Tom Hardy',
   'Film': ['Inception',
    'The Dark Knight Rises',
    'Mad Max: Fury Road',
    'The Revenant',
    'Dunkirk']},
  'preferences': {'style': 'informal', 'minimal length': 500},
  'text': 'Tom Hardy, the versatile actor known for his intense performances, has graced the silver screen in numerous iconic films, including "Inception," "The Dark Knight Rises," "Mad Max: Fury Road," "The Revenant," and "Dunkirk." Whether he\'s delving into the depths of the subconscious mind, donning the mask of the infamous Bane, or navigating the treacherous wasteland as the enigmatic Max Rockatansky, Hardy\'s commitment to his craft is always evident. From his breathtaking portrayal of the ruthless Eames in "Inception" to his captivating transformation into the ferocious Max in "Mad Max: Fury Road," Hardy\'s dynamic range and magnetic presence captivate audiences and leave an indelible mark on the world of cinema. In his most physically demanding role to date, he endured the harsh conditions of the freezing wilderness as he portrayed the rugged frontiersman John Fitzgerald in "The Revenant," earning him critical acclaim and an Academy Award nomination. In Christopher Nolan\'s war epic "Dunkirk," Hardy\'s stoic and heroic portrayal of Royal Air Force pilot Farrier showcases his ability to convey deep emotion through nuanced performances. With his chameleon-like ability to inhabit a wide range of characters and his unwavering commitment to his craft, Tom Hardy has undoubtedly solidified his place as one of the most talented and sought-after actors of his generation.'}]
```

## 생성된 예제에서 추출

좋습니다, 이제 이 생성된 데이터에서 출력을 추출할 수 있는지 그리고 우리 사례와 비교하여 어떻게 되는지 봅시다!

```python
from typing import List

from langchain.chains import create_extraction_chain_pydantic
from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
from pydantic import BaseModel, Field
```

```python
class Actor(BaseModel):
    Actor: str = Field(description="배우의 이름")
    Film: List[str] = Field(description="그들이 출연한 영화 목록")
```

### 파서

```python
llm = OpenAI()
parser = PydanticOutputParser(pydantic_object=Actor)

prompt = PromptTemplate(
    template="주어진 텍스트에서 필드를 추출하세요.\n{format_instructions}\n{text}\n",
    input_variables=["text"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

_input = prompt.format_prompt(text=dataset[0]["text"])
output = llm.invoke(_input.to_string())

parsed = parser.parse(output)
parsed
```

```output
Actor(Actor='Tom Hanks', Film=['Forrest Gump', 'Saving Private Ryan', 'The Green Mile', 'Toy Story', 'Catch Me If You Can'])
```

```python
(parsed.Actor == inp[0]["Actor"]) & (parsed.Film == inp[0]["Film"])
```

```output
True
```

### 추출기

```python
extractor = create_extraction_chain_pydantic(pydantic_schema=Actor, llm=model)
extracted = extractor.run(dataset[1]["text"])
extracted
```

```output
[Actor(Actor='Tom Hardy', Film=['Inception', 'The Dark Knight Rises', 'Mad Max: Fury Road', 'The Revenant', 'Dunkirk'])]
```

```python
(extracted[0].Actor == inp[1]["Actor"]) & (extracted[0].Film == inp[1]["Film"])
```

```output
True
```