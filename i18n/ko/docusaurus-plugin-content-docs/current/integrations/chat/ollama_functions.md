---
sidebar_label: Ollama Functions
translated: true
---

# OllamaFunctions

이 노트북은 Ollama를 실험적으로 래핑하여 OpenAI Functions와 동일한 API를 제공하는 방법을 보여줍니다.

더 강력하고 유능한 모델일수록 복잡한 스키마 및/또는 여러 함수를 사용할 때 더 나은 성능을 발휘합니다. 아래 예제는 llama3 및 phi3 모델을 사용합니다. 지원되는 모델 및 모델 변형의 전체 목록은 [Ollama 모델 라이브러리](https://ollama.ai/library)를 참조하십시오.

## 설정

로컬 Ollama 인스턴스를 설정하고 실행하려면 [이 지침](https://github.com/jmorganca/ollama)을 따르십시오.

## 사용법

OllamaFunctions를 초기화하는 방법은 표준 ChatOllama 인스턴스를 초기화하는 방법과 유사합니다:

```python
from langchain_experimental.llms.ollama_functions import OllamaFunctions

model = OllamaFunctions(model="llama3", format="json")
```

그런 다음 JSON Schema 매개변수와 `function_call` 매개변수로 정의된 함수를 바인딩하여 모델이 주어진 함수를 호출하도록 강제할 수 있습니다:

```python
model = model.bind_tools(
    tools=[
        {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, " "e.g. San Francisco, CA",
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                    },
                },
                "required": ["location"],
            },
        }
    ],
    function_call={"name": "get_current_weather"},
)
```

이 모델을 사용하여 함수를 호출하면 제공된 스키마와 일치하는 JSON 출력이 생성됩니다:

```python
from langchain_core.messages import HumanMessage

model.invoke("what is the weather in Boston?")
```

```output
AIMessage(content='', additional_kwargs={'function_call': {'name': 'get_current_weather', 'arguments': '{"location": "Boston, MA"}'}}, id='run-1791f9fe-95ad-4ca4-bdf7-9f73eab31e6f-0')
```

## 구조화된 출력

`with_structured_output()` 함수를 사용하여 함수 호출을 통해 구조화된 형식으로 주어진 입력에서 속성을 추출할 수 있습니다:

```python
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field

# 구조화된 응답을 위한 스키마

class Person(BaseModel):
    name: str = Field(description="The person's name", required=True)
    height: float = Field(description="The person's height", required=True)
    hair_color: str = Field(description="The person's hair color")

# 프롬프트 템플릿

prompt = PromptTemplate.from_template(
    """Alex is 5 feet tall.
Claudia is 1 feet taller than Alex and jumps higher than him.
Claudia is a brunette and Alex is blonde.

Human: {question}
AI: """
)

# 체인

llm = OllamaFunctions(model="phi3", format="json", temperature=0)
structured_llm = llm.with_structured_output(Person)
chain = prompt | structured_llm
```

### Alex에 대한 데이터 추출

```python
alex = chain.invoke("Describe Alex")
alex
```

```output
Person(name='Alex', height=5.0, hair_color='blonde')
```

### Claudia에 대한 데이터 추출

```python
claudia = chain.invoke("Describe Claudia")
claudia
```

```output
Person(name='Claudia', height=6.0, hair_color='brunette')
```