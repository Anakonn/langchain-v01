---
translated: true
---

# AirbyteLoader

> [Airbyte](https://github.com/airbytehq/airbyte)는 API, 데이터베이스 및 파일에서 웨어하우스 및 데이터 레이크로 ELT 파이프라인을 위한 데이터 통합 플랫폼입니다. 데이터 웨어하우스 및 데이터베이스에 대한 ELT 커넥터의 가장 큰 카탈로그를 보유하고 있습니다.

이 문서에서는 Airbyte 소스를 LangChain 문서로 로드하는 방법을 다룹니다.

## 설치

`AirbyteLoader`를 사용하려면 `langchain-airbyte` 통합 패키지를 설치해야 합니다.

```python
% pip install -qU langchain-airbyte
```

참고: 현재 `airbyte` 라이브러리는 Pydantic v2를 지원하지 않습니다. 이 패키지를 사용하려면 Pydantic v1로 다운그레이드하십시오.

참고: 이 패키지는 현재 Python 3.10+이 필요합니다.

## 문서 로드

기본적으로 `AirbyteLoader`는 스트림의 모든 구조화된 데이터를 로드하고 yaml 형식의 문서를 출력합니다.

```python
from langchain_airbyte import AirbyteLoader

loader = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 10},
)
docs = loader.load()
print(docs[0].page_content[:500])
```

```yaml
academic_degree: PhD
address:
  city: Lauderdale Lakes
  country_code: FI
  postal_code: '75466'
  province: New Jersey
  state: Hawaii
  street_name: Stoneyford
  street_number: '1112'
age: 44
blood_type: "O\u2212"
created_at: '2004-04-02T13:05:27+00:00'
email: bread2099+1@outlook.com
gender: Fluid
height: '1.62'
id: 1
language: Belarusian
name: Moses
nationality: Dutch
occupation: Track Worker
telephone: 1-467-194-2318
title: M.Sc.Tech.
updated_at: '2024-02-27T16:41:01+00:00'
weight: 6
```

또한 문서를 형식화하기 위해 사용자 정의 프롬프트 템플릿을 지정할 수도 있습니다.

```python
from langchain_core.prompts import PromptTemplate

loader_templated = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 10},
    template=PromptTemplate.from_template(
        "My name is {name} and I am {height} meters tall."
    ),
)
docs_templated = loader_templated.load()
print(docs_templated[0].page_content)
```

```output
My name is Verdie and I am 1.73 meters tall.
```

## 문서의 지연 로드

`AirbyteLoader`의 강력한 기능 중 하나는 상위 소스에서 대용량 문서를 로드할 수 있다는 것입니다. 대용량 데이터셋을 다룰 때 기본 `.load()` 동작은 느리고 메모리를 많이 사용할 수 있습니다. 이를 피하려면 `.lazy_load()` 메서드를 사용하여 문서를 더 메모리 효율적으로 로드할 수 있습니다.

```python
import time

loader = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 3},
    template=PromptTemplate.from_template(
        "My name is {name} and I am {height} meters tall."
    ),
)

start_time = time.time()
my_iterator = loader.lazy_load()
print(
    f"Just calling lazy load is quick! This took {time.time() - start_time:.4f} seconds"
)
```

```output
Just calling lazy load is quick! This took 0.0001 seconds
```

문서가 생성될 때 반복적으로 문서를 처리할 수 있습니다.

```python
for doc in my_iterator:
    print(doc.page_content)
```

```output
My name is Andera and I am 1.91 meters tall.
My name is Jody and I am 1.85 meters tall.
My name is Zonia and I am 1.53 meters tall.
```

또한 `.alazy_load()`를 사용하여 비동기 방식으로 문서를 지연 로드할 수 있습니다.

```python
loader = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 3},
    template=PromptTemplate.from_template(
        "My name is {name} and I am {height} meters tall."
    ),
)

my_async_iterator = loader.alazy_load()

async for doc in my_async_iterator:
    print(doc.page_content)
```

```output
My name is Carmelina and I am 1.74 meters tall.
My name is Ali and I am 1.90 meters tall.
My name is Rochell and I am 1.83 meters tall.
```

## 구성

`AirbyteLoader`는 다음 옵션으로 구성할 수 있습니다:

- `source` (str, 필수): 로드할 Airbyte 소스의 이름.
- `stream` (str, 필수): 로드할 스트림의 이름 (Airbyte 소스는 여러 스트림을 반환할 수 있음)
- `config` (dict, 필수): Airbyte 소스의 구성
- `template` (PromptTemplate, 선택 사항): 문서를 형식화하기 위한 사용자 정의 프롬프트 템플릿
- `include_metadata` (bool, 선택 사항, 기본값 True): 출력 문서에 모든 필드를 메타데이터로 포함할지 여부

구성의 대부분은 `config`에 있으며, 각 소스의 구체적인 구성 옵션은 [Airbyte 문서](https://docs.airbyte.com/integrations/)의 "Config field reference"에서 찾을 수 있습니다.

