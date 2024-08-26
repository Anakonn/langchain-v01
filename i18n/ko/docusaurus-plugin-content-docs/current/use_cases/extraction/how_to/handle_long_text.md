---
sidebar_position: 2
title: 긴 텍스트 처리
translated: true
---

PDF와 같은 파일을 처리할 때는 언어 모델의 컨텍스트 윈도우를 초과하는 텍스트를 자주 접하게 됩니다. 이 텍스트를 처리하려면 다음 전략을 고려하십시오:

1. **LLM 변경** 더 큰 컨텍스트 윈도우를 지원하는 다른 LLM을 선택하십시오.
2. **무차별 대입법** 문서를 청크로 나누고 각 청크에서 내용을 추출하십시오.
3. **RAG** 문서를 청크로 나누고 청크를 인덱싱한 후 "관련성 있는" 청크의 하위 집합에서만 내용을 추출하십시오.

이 전략들은 각각 다른 트레이드 오프를 가지며, 최선의 전략은 설계 중인 애플리케이션에 따라 다를 수 있습니다!

## 설정

예제 데이터가 필요합니다! [위키백과의 자동차에 대한 기사](https://en.wikipedia.org/wiki/Car)를 다운로드하고 이를 LangChain `Document`로 로드해 보겠습니다.

```python
import re

import requests
from langchain_community.document_loaders import BSHTMLLoader

# 콘텐츠 다운로드

response = requests.get("https://en.wikipedia.org/wiki/Car")
# 파일에 쓰기

with open("car.html", "w", encoding="utf-8") as f:
    f.write(response.text)
# HTML 파서로 로드

loader = BSHTMLLoader("car.html")
document = loader.load()[0]
# 코드 정리

# 연속된 새 줄을 단일 새 줄로 바꾸기

document.page_content = re.sub("\n\n+", "\n", document.page_content)
```

```python
print(len(document.page_content))
```

```output
78967
```

## 스키마 정의

여기에서는 텍스트에서 주요 발전 사항을 추출하기 위한 스키마를 정의해 보겠습니다.

```python
from typing import List, Optional

from langchain.chains import create_structured_output_runnable
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI


class KeyDevelopment(BaseModel):
    """자동차 역사에서의 주요 발전에 대한 정보"""

    # ^ 엔티티 KeyDevelopment에 대한 Doc-string.
    # 이 Doc-string은 스키마 KeyDevelopment의 설명으로 LLM에 전달되어
    # 추출 결과를 개선하는 데 도움이 될 수 있습니다.
    # 모든 필드가 필수임을 유의하십시오!
    year: int = Field(
        ..., description="중요한 역사적 발전이 있었던 연도"
    )
    description: str = Field(
        ..., description="이 연도에 무슨 일이 일어났습니까? 발전 사항은 무엇입니까?"
    )
    evidence: str = Field(
        ...,
        description="연도와 설명 정보를 추출한 문장을 그대로 반복",
    )


class ExtractionData(BaseModel):
    """자동차 역사에서 주요 발전 사항에 대한 추출된 정보"""

    key_developments: List[KeyDevelopment]


# 지침과 추가 컨텍스트를 제공하기 위해 맞춤 프롬프트를 정의합니다.

# 1) 추출 품질을 향상시키기 위해 프롬프트 템플릿에 예제를 추가할 수 있습니다.

# 2) 텍스트가 추출된 문서에 대한 메타데이터와 같은 추가 매개변수를 도입할 수 있습니다.

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "당신은 텍스트에서 주요 역사적 발전을 식별하는 전문가입니다. "
            "중요한 역사적 발전만 추출하십시오. 텍스트에서 중요한 정보를 찾을 수 없는 경우 아무것도 추출하지 마십시오.",
        ),
        # MessagesPlaceholder('examples'), # 성능을 개선하기 위해 예제를 사용하는 방법을 계속 읽어보세요.
        ("human", "{text}"),
    ]
)

# 도구 호출 모드를 사용할 것입니다. 이는 도구 호출이 가능한 모델이 필요합니다.

llm = ChatOpenAI(
    # 가능한 최고의 품질을 파악하기 위해
    # 좋은 모델로 벤치마크를 고려하세요.
    model="gpt-4-0125-preview",
    # 추출을 위해 온도를 0으로 설정하는 것을 기억하세요!
    temperature=0,
)

extractor = prompt | llm.with_structured_output(
    schema=ExtractionData,
    method="function_calling",
    include_raw=False,
)
```

```output
/home/eugene/.pyenv/versions/3.11.2/envs/langchain_3_11/lib/python3.11/site-packages/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: The function `with_structured_output` is in beta. It is actively being worked on, so the API may change.
  warn_beta(
```

## 무차별 대입법 접근

문서를 청크로 나누어 각 청크가 LLM의 컨텍스트 윈도우에 맞도록 합니다.

```python
from langchain_text_splitters import TokenTextSplitter

text_splitter = TokenTextSplitter(
    # 각 청크의 크기를 제어합니다.
    chunk_size=2000,
    # 청크 간의 겹침을 제어합니다.
    chunk_overlap=20,
)

texts = text_splitter.split_text(document.page_content)
```

`.batch` 기능을 사용하여 각 청크에서 **병렬**로 추출 작업을 수행합니다!

:::tip
종종 .batch()를 사용하여 추출 작업을 병렬화할 수 있습니다! `batch`는 스레드풀을 사용하여 작업을 병렬화합니다.

모델이 API를 통해 노출된 경우, 이는 추출 흐름을 가속화할 수 있습니다!
:::

```python
# 코드가 빠르게 다시 실행될 수 있도록

# 첫 3개 청크로 제한합니다.

first_few = texts[:3]

extractions = extractor.batch(
    [{"text": text} for text in first_few],
    {"max_concurrency": 5},  # 최대 동시성을 설정하여 동시성 제한!
)
```

### 결과 병합

각 청크에서 데이터를 추출한 후 추출된 데이터를 병합해야 합니다.

```python
key_developments = []

for extraction in extractions:
    key_developments.extend(extraction.key_developments)

key_developments[:20]
```

```output
[KeyDevelopment(year=1966, description="The Toyota Corolla began production, recognized as the world's best-selling automobile.", evidence="The Toyota Corolla has been in production since 1966 and is recognized as the world's best-selling automobile."),
 KeyDevelopment(year=1769, description='Nicolas-Joseph Cugnot built the first steam-powered road vehicle.', evidence='French inventor Nicolas-Joseph Cugnot built the first steam-powered road vehicle in 1769.'),
 KeyDevelopment(year=1808, description='François Isaac de Rivaz designed and constructed the first internal combustion-powered automobile.', evidence='French-born Swiss inventor François Isaac de Rivaz designed and constructed the first internal combustion-powered automobile in 1808.'),
 KeyDevelopment(year=1886, description='Carl Benz patented his Benz Patent-Motorwagen, inventing the modern car.', evidence='The modern car—a practical, marketable automobile for everyday use—was invented in 1886, when German inventor Carl Benz patented his Benz Patent-Motorwagen.'),
 KeyDevelopment(year=1908, description='The 1908 Model T, an affordable car for the masses, was manufactured by the Ford Motor Company.', evidence='One of the first cars affordable by the masses was the 1908 Model T, an American car manufactured by the Ford Motor Company.'),
 KeyDevelopment(year=1881, description='Gustave Trouvé demonstrated a three-wheeled car powered by electricity.', evidence='In November 1881, French inventor Gustave Trouvé demonstrated a three-wheeled car powered by electricity at the International Exposition of Electricity.'),
 KeyDevelopment(year=1888, description="Bertha Benz undertook the first road trip by car to prove the road-worthiness of her husband's invention.", evidence="In August 1888, Bertha Benz, the wife of Carl Benz, undertook the first road trip by car, to prove the road-worthiness of her husband's invention."),
 KeyDevelopment(year=1896, description='Benz designed and patented the first internal-combustion flat engine, called boxermotor.', evidence='In 1896, Benz designed and patented the first internal-combustion flat engine, called boxermotor.'),
 KeyDevelopment(year=1897, description='Nesselsdorfer Wagenbau produced the Präsident automobil, one of the first factory-made cars in the world.', evidence='The first motor car in central Europe and one of the first factory-made cars in the world, was produced by Czech company Nesselsdorfer Wagenbau (later renamed to Tatra) in 1897, the Präsident automobil.'),
 KeyDevelopment(year=1890, description='Daimler Motoren Gesellschaft (DMG) was founded by Daimler and Maybach in Cannstatt.', evidence='Daimler and Maybach founded Daimler Motoren Gesellschaft (DMG) in Cannstatt in 1890.'),
 KeyDevelopment(year=1902, description='A new model DMG car was produced and named Mercedes after the Maybach engine.', evidence='Two years later, in 1902, a new model DMG car was produced and the model was named Mercedes after the Maybach engine, which generated 35 hp.'),
 KeyDevelopment(year=1891, description='Auguste Doriot and Louis Rigoulot completed the longest trip by a petrol-driven vehicle using a Daimler powered Peugeot Type 3.', evidence='In 1891, Auguste Doriot and his Peugeot colleague Louis Rigoulot completed the longest trip by a petrol-driven vehicle when their self-designed and built Daimler powered Peugeot Type 3 completed 2,100 kilometres (1,300 mi) from Valentigney to Paris and Brest and back again.'),
 KeyDevelopment(year=1895, description='George Selden was granted a US patent for a two-stroke car engine.', evidence='After a delay of 16 years and a series of attachments to his application, on 5 November 1895, Selden was granted a US patent (U.S. patent 549,160) for a two-stroke car engine.'),
 KeyDevelopment(year=1893, description='The first running, petrol-driven American car was built and road-tested by the Duryea brothers.', evidence='In 1893, the first running, petrol-driven American car was built and road-tested by the Duryea brothers of Springfield, Massachusetts.'),
 KeyDevelopment(year=1897, description='Rudolf Diesel built the first diesel engine.', evidence='In 1897, he built the first diesel engine.'),
 KeyDevelopment(year=1901, description='Ransom Olds started large-scale, production-line manufacturing of affordable cars at his Oldsmobile factory.', evidence='Large-scale, production-line manufacturing of affordable cars was started by Ransom Olds in 1901 at his Oldsmobile factory in Lansing, Michigan.'),
 KeyDevelopment(year=1913, description="Henry Ford began the world's first moving assembly line for cars at the Highland Park Ford Plant.", evidence="This concept was greatly expanded by Henry Ford, beginning in 1913 with the world's first moving assembly line for cars at the Highland Park Ford Plant."),
 KeyDevelopment(year=1914, description="Ford's assembly line worker could buy a Model T with four months' pay.", evidence="In 1914, an assembly line worker could buy a Model T with four months' pay."),
 KeyDevelopment(year=1926, description='Fast-drying Duco lacquer was developed, allowing for a variety of car colors.', evidence='Only Japan black would dry fast enough, forcing the company to drop the variety of colours available before 1913, until fast-drying Duco lacquer was developed in 1926.')]
```

## RAG 기반 접근

다른 간단한 아이디어는 텍스트를 청크로 나누는 것입니다. 그러나 모든 청크에서 정보를 추출하는 대신 가장 관련성이 높은 청크에만 집중하는 것입니다.

:::caution
어떤 청크가 관련성이 있는지 식별하는 것은 어려울 수 있습니다.

예를 들어, 여기 사용된 `car` 기사에서는 대부분의 기사가 주요 발전 정보로 구성되어 있습니다. 따라서 **RAG**를 사용하면 많은 관련 정보를 버리게 될 가능성이 큽니다.

사용 사례를 실험하고 이 접근 방식이 효과가 있는지 확인하는 것을 권장합니다.
:::

여기 `FAISS` 벡터스토어를 사용하는 간단한 예제가 있습니다.

```python
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_core.runnables import RunnableLambda
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

texts = text_splitter.split_text(document.page_content)
vectorstore = FAISS.from_texts(texts, embedding=OpenAIEmbeddings())

retriever = vectorstore.as_retriever(
    search_kwargs={"k": 1}
)  # 첫 번째 문서에서만 추출
```

이 경우 RAG 추출기는 상위 문서만을 봅니다.

```python
rag_extractor = {
    "text": retriever | (lambda docs: docs[0].page_content)  # 상위 문서의 내용을 가져옴
} | extractor
```

```python
results = rag_extractor.invoke("자동차와 관련된 주요 발전 사항")
```

```python
for key_development in results.key_developments:
    print(key_development)
```

```output
year=1924 description="Germany's first mass-manufactured car, the Opel 4PS Laubfrosch, was produced, making Opel the top car builder in Germany with 37.5% of the market." evidence="Germany's first mass-manufactured car, the Opel 4PS Laubfrosch (Tree Frog), came off the line at Rüsselsheim in 1924, soon making Opel the top car builder in Germany, with 37.5 per cent of the market."
year=1925 description='Morris had 41% of total British car production, dominating the market.' evidence='in 1925, Morris had 41 per cent of total British car production.'
year=1925 description='Citroën, Renault, and Peugeot produced 550,000 cars in France, dominating the market.' evidence="Citroën did the same in France, coming to cars in 1919; between them and other cheap cars in reply such as Renault's 10CV and Peugeot's 5CV, they produced 550,000 cars in 1925."
year=2017 description='Production of petrol-fuelled cars peaked.' evidence='Production of petrol-fuelled cars peaked in 2017.'
```

## 일반적인 문제

각 방법은 비용, 속도, 정확성과 관련하여 고유한 장단점을 가지고 있습니다.

다음 문제에 주의하세요:

- 청크로 나누는 것은 정보가 여러 청크에 걸쳐 분산된 경우 LLM이 정보를 추출하지 못하게 할 수 있습니다.
- 큰 청크 겹침은 동일한 정보가 두 번 추출되게 할 수 있으므로 중복 제거를 준비해야 합니다!
- LLM은 데이터를 만들어낼 수 있습니다. 큰 텍스트에서 단일 사실을 찾고 무차별 대입법을 사용하는 경우, 더 많은 허구의 데이터를 얻을 수 있습니다.