---
translated: true
---

# LangSmith LLM Runs

이 노트북은 LangSmith의 LLM 실행 데이터에서 직접 데이터를 로드하고 해당 데이터를 사용하여 모델을 미세 조정하는 방법을 보여줍니다.
과정은 간단하며 다음 3단계로 구성됩니다.

1. 학습할 LLM 실행 선택.
2. LangSmithRunChatLoader를 사용하여 실행을 채팅 세션으로 로드.
3. 모델을 미세 조정.

그런 다음 미세 조정된 모델을 LangChain 앱에서 사용할 수 있습니다.

먼저 필요한 항목을 설치해보겠습니다.

## 필수 조건

langchain >= 0.0.311을 설치하고 LangSmith API 키로 환경을 설정해야 합니다.

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
import os
import uuid

uid = uuid.uuid4().hex[:6]
project_name = f"Run Fine-tuning Walkthrough {uid}"
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "YOUR API KEY"
os.environ["LANGCHAIN_PROJECT"] = project_name
```

## 1. 실행 선택

첫 번째 단계는 학습할 실행을 선택하는 것입니다. 일반적인 경우는 사용자가 긍정적인 피드백을 준 추적 내 LLM 실행을 선택하는 것입니다. 이에 대한 예는 [LangSmith Cookbook](https://github.com/langchain-ai/langsmith-cookbook/blob/main/exploratory-data-analysis/exporting-llm-runs-and-feedback/llm_run_etl.md) 및 [docs](https://docs.smith.langchain.com/tracing/use-cases/export-runs/local)에서 찾을 수 있습니다.

이 튜토리얼을 위해 여기서 사용할 실행을 생성하겠습니다. 간단한 함수 호출 체인을 미세 조정해보겠습니다.

```python
from enum import Enum
from langchain_core.pydantic_v1 import BaseModel, Field

class Operation(Enum):
    add = "+"
    subtract = "-"
    multiply = "*"
    divide = "/"

class Calculator(BaseModel):
    """계산기 함수"""
    num1: float
    num2: float
    operation: Operation = Field(..., description="+,-,*,/")

    def calculate(self):
        if self.operation == Operation.add:
            return self.num1 + self.num2
        elif self.operation == Operation.subtract:
            return self.num1 - self.num2
        elif self.operation == Operation.multiply:
            return self.num1 * self.num2
        elif self.operation == Operation.divide:
            if self.num2 != 0:
                return self.num1 / self.num2
            else:
                return "0으로 나눌 수 없습니다"
```

```python
from pprint import pprint
from langchain.utils.openai_functions import convert_pydantic_to_openai_function
from langchain_core.pydantic_v1 import BaseModel

openai_function_def = convert_pydantic_to_openai_function(Calculator)
pprint(openai_function_def)
```

```output
{'description': '계산기 함수',
 'name': 'Calculator',
 'parameters': {'description': '계산기 함수',
                'properties': {'num1': {'title': 'Num1', 'type': 'number'},
                               'num2': {'title': 'Num2', 'type': 'number'},
                               'operation': {'allOf': [{'description': '열거형',
                                                        'enum': ['+',
                                                                 '-',
                                                                 '*',
                                                                 '/'],
                                                        'title': 'Operation'}],
                                             'description': '+,-,*,/'}},
                'required': ['num1', 'num2', 'operation'],
                'title': 'Calculator',
                'type': 'object'}}
```

```python
from langchain.output_parsers.openai_functions import PydanticOutputFunctionsParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "당신은 회계 보조원입니다."),
        ("user", "{input}"),
    ]
)
chain = (
    prompt
    | ChatOpenAI().bind(functions=[openai_function_def])
    | PydanticOutputFunctionsParser(pydantic_schema=Calculator)
    | (lambda x: x.calculate())
)
```

```python
math_questions = [
    "45를 9로 나누면?",
    "81을 9로 나누면?",
    "72를 8로 나누면?",
    "56을 7로 나누면?",
    "36을 6로 나누면?",
    "64를 8로 나누면?",
    "12 곱하기 6은?",
    "8 곱하기 8은?",
    "10 곱하기 10은?",
    "11 곱하기 11은?",
    "13 곱하기 13은?",
    "45 더하기 30은?",
    "72 더하기 28은?",
    "56 더하기 44는?",
    "63 더하기 37는?",
    "70 빼기 35는?",
    "60 빼기 30은?",
    "50 빼기 25는?",
    "40 빼기 20은?",
    "30 빼기 15는?",
]
results = chain.batch([{"input": q} for q in math_questions], return_exceptions=True)
```

#### 오류가 없는 실행 로드

이제 미세 조정할 성공적인 실행을 선택할 수 있습니다.

```python
from langsmith.client import Client

client = Client()
```

```python
successful_traces = {
    run.trace_id
    for run in client.list_runs(
        project_name=project_name,
        execution_order=1,
        error=False,
    )
}

llm_runs = [
    run
    for run in client.list_runs(
        project_name=project_name,
        run_type="llm",
    )
    if run.trace_id in successful_traces
]
```

## 2. 데이터 준비

이제 LangSmithRunChatLoader의 인스턴스를 생성하고 lazy_load() 메서드를 사용하여 채팅 세션을 로드할 수 있습니다.

```python
from langchain_community.chat_loaders.langsmith import LangSmithRunChatLoader

loader = LangSmithRunChatLoader(runs=llm_runs)

chat_sessions = loader.lazy_load()
```

#### 로드된 채팅 세션을 미세 조정에 적합한 형식으로 변환합니다.

```python
from langchain_community.adapters.openai import convert_messages_for_finetuning

training_data = convert_messages_for_finetuning(chat_sessions)
```

## 3. 모델 미세 조정

이제 OpenAI 라이브러리를 사용하여 미세 조정 프로세스를 시작합니다.

```python
import json
import time
from io import BytesIO

import openai

my_file = BytesIO()
for dialog in training_data:
    my_file.write((json.dumps({"messages": dialog}) + "\n").encode("utf-8"))

my_file.seek(0)
training_file = openai.files.create(file=my_file, purpose="fine-tune")

job = openai.fine_tuning.jobs.create(
    training_file=training_file.id,
    model="gpt-3.5-turbo",
)

# 미세 조정이 완료될 때까지 대기합니다(시간이 걸릴 수 있습니다).

status = openai.fine_tuning.jobs.retrieve(job.id).status
start_time = time.time()
while status != "succeeded":
    print(f"Status=[{status}]... {time.time() - start_time:.2f}s", end="\r", flush=True)
    time.sleep(5)
    status = openai.fine_tuning.jobs.retrieve(job.id).status

# 이제 모델이 미세 조정되었습니다!

```

```output
Status=[running]... 349.84s. 17.72s
```

## 4. LangChain에서 사용

미세 조정 후, 결과 모델 ID를 LangChain 앱의 ChatOpenAI 모델 클래스에서 사용할 수 있습니다.

```python
# 미세 조정된 모델 ID 가져오기

job = openai.fine_tuning.jobs.retrieve(job.id)
model_id = job.fine_tuned_model

# LangChain에서 미세 조정된 모델 사용

from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model=model_id,
    temperature=1,
)
```

```python
(prompt | model).invoke({"input": "56을 7로 나누면?"})
```

```output
AIMessage(content='Let me calculate that for you.')
```

이제 LangSmith LLM 실행 데이터로 모델을 성공적으로 미세 조정했습니다!