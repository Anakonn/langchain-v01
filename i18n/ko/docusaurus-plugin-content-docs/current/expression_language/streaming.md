---
translated: true
---

# 스트리밍

스트리밍은 LLM 기반 애플리케이션이 최종 사용자에게 반응성을 느끼도록 하는 데 중요합니다.

LLM, 파서, 프롬프트, 검색기 및 에이전트와 같은 중요한 LangChain 프리미티브는 LangChain [Runnable 인터페이스](/docs/expression_language/interface)를 구현합니다.

이 인터페이스는 콘텐츠를 스트리밍하는 두 가지 일반적인 접근 방식을 제공합니다:

1. sync `stream` 및 async `astream`: 체인의 **최종 출력**을 스트리밍하는 **기본 구현**.
2. async `astream_events` 및 async `astream_log`: 체인의 **중간 단계**와 **최종 출력**을 모두 스트리밍하는 방법을 제공합니다.

두 가지 접근 방식을 모두 살펴보고 사용하는 방법을 이해해 보겠습니다. 🥷

## 스트림 사용하기

모든 `Runnable` 객체는 `stream`이라는 동기 메서드와 `astream`이라는 비동기 변형을 구현합니다.

이 메서드는 최종 출력을 청크로 스트리밍하도록 설계되었으며, 사용 가능한 즉시 각 청크를 생성합니다.

프로그램의 모든 단계가 **입력 스트림**을 처리하는 방법을 알고 있어야만 스트리밍이 가능합니다. 즉, 입력 청크를 하나씩 처리하고 해당하는 출력 청크를 생성해야 합니다.

이 처리는 LLM이 생성한 토큰을 방출하는 것과 같은 간단한 작업부터 전체 JSON이 완성되기 전에 JSON 결과의 일부를 스트리밍하는 것과 같은 더 어려운 작업까지 다양할 수 있습니다.

스트리밍을 탐색하기 시작하기 가장 좋은 장소는 LLM 앱에서 가장 중요한 구성 요소인 LLM 자체입니다!

### LLM 및 채팅 모델

대형 언어 모델과 그 채팅 변형은 LLM 기반 애플리케이션에서 주요 병목 지점입니다. 🙊

대형 언어 모델은 쿼리에 대한 완전한 응답을 생성하는 데 **여러 초**가 걸릴 수 있습니다. 이는 애플리케이션이 최종 사용자에게 반응성을 느끼게 하는 **~200-300 ms** 임계값보다 훨씬 느립니다.

애플리케이션을 더 반응성 있게 만들기 위한 주요 전략은 중간 진행 상황을 보여주는 것입니다. 즉, 모델의 출력을 **토큰 단위로** 스트리밍하는 것입니다.

[Anthropic](/docs/integrations/platforms/anthropic)에서 제공하는 채팅 모델을 사용하여 스트리밍 예제를 보여드리겠습니다. 이 모델을 사용하려면 `langchain-anthropic` 패키지를 설치해야 합니다. 다음 명령어를 사용하여 설치할 수 있습니다:

```python
pip install -qU langchain-anthropic
```

```python
# anthropic을 사용하여 예제를 보여주지만,

# 좋아하는 채팅 모델을 사용할 수 있습니다!

from langchain_anthropic import ChatAnthropic

model = ChatAnthropic()

chunks = []
async for chunk in model.astream("hello. tell me something about yourself"):
    chunks.append(chunk)
    print(chunk.content, end="|", flush=True)
```

```output
 Hello|!| My| name| is| Claude|.| I|'m| an| AI| assistant| created| by| An|throp|ic| to| be| helpful|,| harmless|,| and| honest|.||
```

하나의 청크를 검사해 보겠습니다.

```python
chunks[0]
```

```output
AIMessageChunk(content=' Hello')
```

우리는 `AIMessageChunk`라고 하는 것을 받았습니다. 이 청크는 `AIMessage`의 일부를 나타냅니다.

메시지 청크는 설계상 추가 가능합니다. 즉, 지금까지의 응답 상태를 얻기 위해 단순히 더할 수 있습니다!

```python
chunks[0] + chunks[1] + chunks[2] + chunks[3] + chunks[4]
```

```output
AIMessageChunk(content=' Hello! My name is')
```

### 체인

사실상 모든 LLM 애플리케이션은 언어 모델 호출보다 더 많은 단계를 포함합니다.

`LangChain Expression Language` (`LCEL`)을 사용하여 프롬프트, 모델 및 파서를 결합하는 간단한 체인을 만들어 스트리밍이 작동하는지 확인해 보겠습니다.

모델의 출력을 구문 분석하기 위해 `StrOutputParser`를 사용할 것입니다. 이는 `AIMessageChunk`에서 `content` 필드를 추출하여 모델이 반환한 `토큰`을 제공하는 간단한 파서입니다.

:::tip
LCEL은 LangChain 프리미티브를 서로 연결하여 "프로그램"을 선언적으로 지정하는 방법입니다. LCEL을 사용하여 생성된 체인은 자동 구현 `stream` 및 `astream`의 이점을 누려 최종 출력을 스트리밍할 수 있습니다. 실제로 LCEL을 사용하여 생성된 체인은 전체 표준 Runnable 인터페이스를 구현합니다.
:::

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("tell me a joke about {topic}")
parser = StrOutputParser()
chain = prompt | model | parser

async for chunk in chain.astream({"topic": "parrot"}):
    print(chunk, end="|", flush=True)
```

```output
 Here|'s| a| silly| joke| about| a| par|rot|:|

What| kind| of| teacher| gives| good| advice|?| An| ap|-|parent| (|app|arent|)| one|!||
```

위에서 `parser`가 실제로 모델의 스트리밍 출력을 차단하지 않고 각 청크를 개별적으로 처리한다는 것을 알 수 있습니다. 많은 [LCEL 프리미티브](/docs/expression_language/primitives)도 이러한 변환 스타일의 패스스루 스트리밍을 지원하여 앱을 구성할 때 매우 편리할 수 있습니다.

프롬프트 템플릿](/docs/modules/model_io/prompts) 및 [채팅 모델](/docs/modules/model_io/chat)과 같은 특정 runnables는 개별 청크를 처리할 수 없으며 대신 이전 단계를 모두 집계합니다. 이는 스트리밍 프로세스를 방해할 것입니다. 사용자 정의 함수는 [스트리밍을 위해 제너레이터를 반환하도록 설계될 수 있습니다](/docs/expression_language/primitives/functions#streaming).

:::note
위의 기능이 구축 중인 것과 관련이 없는 경우, LangChain Expression Language를 사용하지 않고 각 구성 요소에 대해 개별적으로 `invoke`, `batch` 또는 `stream`을 호출하고 결과를 변수에 할당한 후 필요에 따라 다운스트림에서 사용할 수 있습니다.

그게 당신의 필요에 맞는다면, 괜찮습니다. 👌!
:::

### 입력 스트림 사용

출력이 생성되는 동안 JSON을 스트리밍하고 싶다면 어떻게 해야 할까요?

부분 JSON을 구문 분석하기 위해 `json.loads`에 의존한다면 부분 JSON은 유효한 JSON이 아니기 때문에 구문 분석이 실패할 것입니다.

어떻게 해야 할지 전혀 모르고 JSON을 스트리밍할 수 없다고 주장할 것입니다.

사실 방법이 있습니다. 파서는 **입력 스트림**에서 작동하여 부분 JSON을 유효한 상태로 "자동 완성"하려고 시도해야 합니다.

이것이 무엇을 의미하는지 이해하기 위해 이러한 파서가 작동하는 것을 봅시다.

```python
from langchain_core.output_parsers import JsonOutputParser

chain = (
    model | JsonOutputParser()
)  # 이전 버전의 Langchain에서 JsonOutputParser가 일부 모델의 결과를 스트리밍하지 않는 버그로 인해 이 줄이 필요합니다.
async for text in chain.astream(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'
):
    print(text, flush=True)
```

```output
{}
{'countries': []}
{'countries': [{}]}
{'countries': [{'name': ''}]}
{'countries': [{'name': 'France'}]}
{'countries': [{'name': 'France', 'population': 67}]}
{'countries': [{'name': 'France', 'population': 6739}]}
{'countries': [{'name': 'France', 'population': 673915}]}
{'countries': [{'name': 'France', 'population': 67391582}]}
{'countries': [{'name': 'France', 'population': 67391582}, {}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': ''}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Sp'}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain'}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 4675}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 467547}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': ''}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': 'Japan'}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': 'Japan', 'population': 12}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': 'Japan', 'population': 12647}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': 'Japan', 'population': 1264764}]}
{'countries': [{'name': 'France', 'population': 67391582}, {'name': 'Spain', 'population': 46754778}, {'name': 'Japan', 'population': 126476461}]}
```

## 스트리밍 깨기

이전 예제를 사용하여 최종 JSON에서 국가 이름을 추출하는 함수를 끝에 추가하여 스트리밍을 **깨보겠습니다**.

:::경고
체인에서 **최종 입력**이 아닌 **입력 스트림**으로 작업하는 단계는 `stream` 또는 `astream`을 통해 스트리밍 기능을 깨뜨릴 수 있습니다.
:::

:::팁
나중에 `astream_events` API에 대해 논의할 것입니다. 이 API는 체인에 **최종 입력**으로만 작업하는 단계가 포함되어 있더라도 중간 단계에서 결과를 스트리밍합니다.
:::

```python
from langchain_core.output_parsers import JsonOutputParser

# 최종 입력에서 작업하는 함수

def _extract_country_names(inputs):
    """최종 입력에서 작업하여 스트리밍을 깨뜨리는 함수입니다."""
    if not isinstance(inputs, dict):
        return ""

    if "countries" not in inputs:
        return ""

    countries = inputs["countries"]

    if not isinstance(countries, list):
        return ""

    country_names = [
        country.get("name") for country in countries if isinstance(country, dict)
    ]
    return country_names

chain = model | JsonOutputParser() | _extract_country_names

async for text in chain.astream(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'
):
    print(text, end="|", flush=True)
```

```output
['France', 'Spain', 'Japan']|
```

#### 제너레이터 함수

입력 스트림으로 작업할 수 있는 제너레이터 함수를 사용하여 스트리밍을 수정해 보겠습니다.

:::팁
제너레이터 함수(`yield`를 사용하는 함수)는 **입력 스트림**에서 작동하는 코드를 작성할 수 있도록 합니다.
:::

```python
from langchain_core.output_parsers import JsonOutputParser

async def _extract_country_names_streaming(input_stream):
    """입력 스트림에서 작동하는 함수입니다."""
    country_names_so_far = set()

    async for input in input_stream:
        if not isinstance(input, dict):
            continue

        if "countries" not in input:
            continue

        countries = input["countries"]

        if not isinstance(countries, list):
            continue

        for country in countries:
            name = country.get("name")
            if not name:
                continue
            if name not in country_names_so_far:
                yield name
                country_names_so_far.add(name)

chain = model | JsonOutputParser() | _extract_country_names_streaming

async for text in chain.astream(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'
):
    print(text, end="|", flush=True)
```

```output
France|Sp|Spain|Japan|
```

:::노트
위의 코드는 JSON 자동 완성에 의존하기 때문에 국가 이름의 일부(예: `Sp` 및 `Spain`)가 나타날 수 있습니다. 이는 추출 결과에 적합하지 않을 수 있습니다!

우리는 스트리밍 개념에 초점을 맞추고 있으며, 체인의 결과는 아닙니다.
:::

### 비스트리밍 구성 요소

검색기와 같은 일부 내장 구성 요소는 `스트리밍`을 제공하지 않습니다. 이를 시도하면 어떻게 될까요? 🤨

```python
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import OpenAIEmbeddings

template = """Answer the question based only on the following context:
{context}

Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

vectorstore = FAISS.from_texts(
    ["harrison worked at kensho", "harrison likes spicy food"],
    embedding=OpenAIEmbeddings(),
)
retriever = vectorstore.as_retriever()

chunks = [chunk for chunk in retriever.stream("where did harrison work?")]
chunks
```

```output
[[Document(page_content='harrison worked at kensho'),
  Document(page_content='harrison likes spicy food')]]
```

스트림은 해당 구성 요소의 최종 결과만 생성했습니다.

이것은 괜찮습니다 🥹! 모든 구성 요소가 스트리밍을 구현할 필요는 없습니다. 어떤 경우에는 스트리밍이 불필요하거나, 어렵거나, 단순히 의미가 없을 수 있습니다.

:::팁
비스트리밍 구성 요소를 사용하여 구성된 LCEL 체인은 많은 경우 여전히 스트리밍할 수 있으며, 체인의 마지막 비스트리밍 단계 이후 부분 출력의 스트리밍이 시작됩니다.
:::

```python
retrieval_chain = (
    {
        "context": retriever.with_config(run_name="Docs"),
        "question": RunnablePassthrough(),
    }
    | prompt
    | model
    | StrOutputParser()
)
```

```python
for chunk in retrieval_chain.stream(
    "Where did harrison work? " "Write 3 made up sentences about this place."
):
    print(chunk, end="|", flush=True)
```

```output
 Based| on| the| given| context|,| the| only| information| provided| about| where| Harrison| worked| is| that| he| worked| at| Ken|sh|o|.| Since| there| are| no| other| details| provided| about| Ken|sh|o|,| I| do| not| have| enough| information| to| write| 3| additional| made| up| sentences| about| this| place|.| I| can| only| state| that| Harrison| worked| at| Ken|sh|o|.||
```

이제 `stream` 및 `astream`이 어떻게 작동하는지 보았으니, 스트리밍 이벤트의 세계로 넘어가 보겠습니다. 🏞️

## 스트림 이벤트 사용

이벤트 스트리밍은 **베타** API입니다. 이 API는 피드백에 따라 약간 변경될 수 있습니다.

:::note
langchain-core **0.1.14**에서 도입되었습니다.
:::

```python
import langchain_core

langchain_core.__version__
```

```output
'0.1.18'
```

`astream_events` API가 제대로 작동하려면:

- 가능한 한 코드 전체에서 `async`를 사용하십시오 (예: async 도구 등)
- 사용자 정의 함수/실행 가능한 항목을 정의할 때 콜백을 전파하십시오
- LCEL 없이 실행 가능한 항목을 사용할 때는 `.ainvoke` 대신 LLM에서 `.astream()`을 호출하여 LLM이 토큰을 스트리밍하도록 하십시오.
- 기대한 대로 작동하지 않으면 알려주세요! :)

### 이벤트 참조

아래는 다양한 실행 가능한 객체가 방출할 수 있는 몇 가지 이벤트를 보여주는 참조 표입니다.

:::note
스트리밍이 올바르게 구현되면 실행 가능한 항목에 대한 입력은 입력 스트림이 완전히 소비된 후에야 알려집니다. 이는 `start` 이벤트보다는 `end` 이벤트에 `inputs`가 자주 포함됨을 의미합니다.
:::

| event                | name             | chunk                           | input                                         | output                                          |
| -------------------- | ---------------- | ------------------------------- | --------------------------------------------- | ----------------------------------------------- |
| on_chat_model_start  | [모델 이름]      |                                 | {"messages": [[SystemMessage, HumanMessage]]} |                                                 |
| on_chat_model_stream | [모델 이름]      | AIMessageChunk(content="hello") |                                               |                                                 |
| on_chat_model_end    | [모델 이름]      |                                 | {"messages": [[SystemMessage, HumanMessage]]} | {"generations": [...], "llm_output": None, ...} |
| on_llm_start         | [모델 이름]      |                                 | {'input': 'hello'}                            |                                                 |
| on_llm_stream        | [모델 이름]      | 'Hello'                         |                                               |                                                 |
| on_llm_end           | [모델 이름]      |                                 | 'Hello human!'                                |
| on_chain_start       | format_docs      |                                 |                                               |                                                 |
| on_chain_stream      | format_docs      | "hello world!, goodbye world!"  |                                               |                                                 |
| on_chain_end         | format_docs      |                                 | [Document(...)]                               | "hello world!, goodbye world!"                  |
| on_tool_start        | some_tool        |                                 | {"x": 1, "y": "2"}                            |                                                 |
| on_tool_stream       | some_tool        | {"x": 1, "y": "2"}              |                                               |                                                 |
| on_tool_end          | some_tool        |                                 |                                               | {"x": 1, "y": "2"}                              |
| on_retriever_start   | [retriever name] |                                 | {"query": "hello"}                            |                                                 |
| on_retriever_chunk   | [retriever name] | {documents: [...]}              |                                               |                                                 |
| on_retriever_end     | [retriever name] |                                 | {"query": "hello"}                            | {documents: [...]}                              |
| on_prompt_start      | [template_name]  |                                 | {"question": "hello"}                         |                                                 |
| on_prompt_end        | [template_name]  |                                 | {"question": "hello"}                         | ChatPromptValue(messages: [SystemMessage, ...]) |

### 챗 모델

챗 모델이 생성하는 이벤트를 살펴보겠습니다.

```python
events = []
async for event in model.astream_events("hello", version="v1"):
    events.append(event)
```

```output
/home/eugene/src/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: This API is in beta and may change in the future.
  warn_beta(
```

:::note

API에 있는 version="v1" 매개변수가 뭐죠?! 😾

이것은 **베타 API**이며, 거의 확실하게 몇 가지 변경 사항이 있을 것입니다.

이 버전 매개변수는 코드에 대한 이러한 파괴적인 변경을 최소화할 수 있도록 해줍니다.

간단히 말해, 지금 귀찮게 해서 나중에 귀찮게 하지 않으려는 것입니다.
:::

몇 가지 시작 이벤트와 몇 가지 종료 이벤트를 살펴보겠습니다.

```python
events[:3]
```

```output
[{'event': 'on_chat_model_start',
  'run_id': '555843ed-3d24-4774-af25-fbf030d5e8c4',
  'name': 'ChatAnthropic',
  'tags': [],
  'metadata': {},
  'data': {'input': 'hello'}},
 {'event': 'on_chat_model_stream',
  'run_id': '555843ed-3d24-4774-af25-fbf030d5e8c4',
  'tags': [],
  'metadata': {},
  'name': 'ChatAnthropic',
  'data': {'chunk': AIMessageChunk(content=' Hello')}},
 {'event': 'on_chat_model_stream',
  'run_id': '555843ed-3d24-4774-af25-fbf030d5e8c4',
  'tags': [],
  'metadata': {},
  'name': 'ChatAnthropic',
  'data': {'chunk': AIMessageChunk(content='!')}}]
```

```python
events[-2:]
```

```output
[{'event': 'on_chat_model_stream',
  'run_id': '555843ed-3d24-4774-af25-fbf030d5e8c4',
  'tags': [],
  'metadata': {},
  'name': 'ChatAnthropic',
  'data': {'chunk': AIMessageChunk(content='')}},
 {'event': 'on_chat_model_end',
  'name': 'ChatAnthropic',
  'run_id': '555843ed-3d24-4774-af25-fbf030d5e8c4',
  'tags': [],
  'metadata': {},
  'data': {'output': AIMessageChunk(content=' Hello!')}}]
```

### 체인

스트리밍 JSON을 구문 분석한 예제 체인을 다시 방문하여 스트리밍 이벤트 API를 탐구해 보겠습니다.

```python
chain = (
    model | JsonOutputParser()
)  # 이전 버전의 Langchain에서 JsonOutputParser가 일부 모델의 결과를 스트리밍하지 않는 버그가 있었습니다.

events = [
    event
    async for event in chain.astream_events(
        'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
        version="v1",
    )
]
```

처음 몇 가지 이벤트를 살펴보면, **2**개의 시작 이벤트가 아닌 **3**개의 시작 이벤트가 있음을 알 수 있습니다.

세 개의 시작 이벤트는 다음에 해당합니다:

1. 체인 (모델 + 파서)
2. 모델
3. 파서

```python
events[:3]
```

```output
[{'event': 'on_chain_start',
  'run_id': 'b1074bff-2a17-458b-9e7b-625211710df4',
  'name': 'RunnableSequence',
  'tags': [],
  'metadata': {},
  'data': {'input': 'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'}},
 {'event': 'on_chat_model_start',
  'name': 'ChatAnthropic',
  'run_id': '6072be59-1f43-4f1c-9470-3b92e8406a99',
  'tags': ['seq:step:1'],
  'metadata': {},
  'data': {'input': {'messages': [[HumanMessage(content='output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`')]]}}},
 {'event': 'on_parser_start',
  'name': 'JsonOutputParser',
  'run_id': 'bf978194-0eda-4494-ad15-3a5bfe69cd59',
  'tags': ['seq:step:2'],
  'metadata': {},
  'data': {}}]
```

마지막 3개의 이벤트를 보면 무엇을 볼 수 있을까요? 중간의 이벤트는 어떤가요?

이 API를 사용하여 모델과 파서에서 스트림 이벤트를 출력해 보겠습니다. 우리는 시작 이벤트, 종료 이벤트 및 체인의 이벤트를 무시할 것입니다.

```python
num_events = 0

async for event in chain.astream_events(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
    version="v1",
):
    kind = event["event"]
    if kind == "on_chat_model_stream":
        print(
            f"Chat model chunk: {repr(event['data']['chunk'].content)}",
            flush=True,
        )
    if kind == "on_parser_stream":
        print(f"Parser chunk: {event['data']['chunk']}", flush=True)
    num_events += 1
    if num_events > 30:
        # 출력 자르기
        print("...")
        break
```

```output
Chat model chunk: ' Here'
Chat model chunk: ' is'
Chat model chunk: ' the'
Chat model chunk: ' JSON'
Chat model chunk: ' with'
Chat model chunk: ' the'
Chat model chunk: ' requested'
Chat model chunk: ' countries'
Chat model chunk: ' and'
Chat model chunk: ' their'
Chat model chunk: ' populations'
Chat model chunk: ':'
Chat model chunk: '\n\n```'
Chat model chunk: 'json'
Parser chunk: {}
Chat model chunk: '\n{'
Chat model chunk: '\n '
Chat model chunk: ' "'
Chat model chunk: 'countries'
Chat model chunk: '":'
Parser chunk: {'countries': []}
Chat model chunk: ' ['
Chat model chunk: '\n   '
Parser chunk: {'countries': [{}]}
Chat model chunk: ' {'
...
```

모델과 파서 모두 스트리밍을 지원하기 때문에 두 구성 요소에서 실시간으로 스트리밍 이벤트를 볼 수 있습니다! 멋지지 않나요? 🦜

### 이벤트 필터링

이 API는 많은 이벤트를 생성하므로 이벤트를 필터링할 수 있는 기능이 유용합니다.

구성 요소 `name`, 구성 요소 `tags` 또는 구성 요소 `type`별로 필터링할 수 있습니다.

#### 이름별 필터링

```python
chain = model.with_config({"run_name": "model"}) | JsonOutputParser().with_config(
    {"run_name": "my_parser"}
)

max_events = 0
async for event in chain.astream_events(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
    version="v1",
    include_names=["my_parser"],
):
    print(event)
    max_events += 1
    if max_events > 10:
        # 출력 자르기
        print("...")
        break
```

```output
{'event': 'on_parser_start', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': []}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': ''}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France'}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 67}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 6739}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 673915}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 67391582}]}}}
{'event': 'on_parser_stream', 'name': 'my_parser', 'run_id': 'f2ac1d1c-e14a-45fc-8990-e5c24e707299', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': {'countries': [{'name': 'France', 'population': 67391582}, {}]}}}
...
```

#### 유형별 필터링

```python
chain = model.with_config({"run_name": "model"}) | JsonOutputParser().with_config(
    {"run_name": "my_parser"}
)

max_events = 0
async for event in chain.astream_events(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
    version="v1",
    include_types=["chat_model"],
):
    print(event)
    max_events += 1
    if max_events > 10:
        # 출력 자르기
        print("...")
        break
```

```output
{'event': 'on_chat_model_start', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'input': {'messages': [[HumanMessage(content='output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`')]]}}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' Here')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' is')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' the')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' JSON')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' with')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' the')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' requested')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' countries')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' and')}}
{'event': 'on_chat_model_stream', 'name': 'model', 'run_id': '98a6e192-8159-460c-ba73-6dfc921e3777', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' their')}}
...
```

#### 태그별 필터링

:::caution
태그는 주어진 실행 가능한 항목의 자식 구성 요소에 상속됩니다.

태그를 사용하여 필터링할 때, 이것이 원하는 동작인지 확인하십시오.
:::

```python
chain = (model | JsonOutputParser()).with_config({"tags": ["my_chain"]})

max_events = 0
async for event in chain.astream_events(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
    version="v1",
    include_tags=["my_chain"],
):
    print(event)
    max_events += 1
    if max_events > 10:
        # 출력 자르기
        print("...")
        break
```

```output
{'event': 'on_chain_start', 'run_id': '190875f3-3fb7-49ad-9b6e-f49da22f3e49', 'name': 'RunnableSequence', 'tags': ['my_chain'], 'metadata': {}, 'data': {'input': 'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`'}}
{'event': 'on_chat_model_start', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'input': {'messages': [[HumanMessage(content='output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`')]]}}}
{'event': 'on_parser_start', 'name': 'JsonOutputParser', 'run_id': '3b5e4ca1-40fe-4a02-9a19-ba2a43a6115c', 'tags': ['seq:step:2', 'my_chain'], 'metadata': {}, 'data': {}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' Here')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' is')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' the')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' JSON')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' with')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' the')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' requested')}}
{'event': 'on_chat_model_stream', 'name': 'ChatAnthropic', 'run_id': 'ff58f732-b494-4ff9-852a-783d42f4455d', 'tags': ['seq:step:1', 'my_chain'], 'metadata': {}, 'data': {'chunk': AIMessageChunk(content=' countries')}}
...
```

### 비스트리밍 구성 요소

일부 구성 요소가 **입력 스트림**에서 작동하지 않기 때문에 스트리밍이 잘 되지 않는다는 점을 기억하십시오.

이러한 구성 요소는 `astream`을 사용할 때 최종 출력의 스트리밍을 중단할 수 있지만, `astream_events`는 여전히 중간 단계에서 스트리밍을 지원하는 이벤트를 생성합니다.

```python
# 스트리밍을 지원하지 않는 함수.

# 입력 스트림이 아닌 최종 입력에서 작동합니다.

def _extract_country_names(inputs):
    """입력 스트림에서 작동하지 않고 스트리밍을 중단시키는 함수입니다."""
    if not isinstance(inputs, dict):
        return ""

    if "countries" not in inputs:
        return ""

    countries = inputs["countries"]

    if not isinstance(countries, list):
        return ""

    country_names = [
        country.get("name") for country in countries if isinstance(country, dict)
    ]
    return country_names


chain = (
    model | JsonOutputParser() | _extract_country_names
)  # 이 파서는 현재 OpenAI에서만 작동합니다.
```

예상대로, `_extract_country_names`가 스트림에서 작동하지 않기 때문에 `astream` API는 제대로 작동하지 않습니다.

```python
async for chunk in chain.astream(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
):
    print(chunk, flush=True)
```

```output
['France', 'Spain', 'Japan']
```

이제, `astream_events`를 사용하여 모델과 파서에서 여전히 스트리밍 출력을 보고 있는지 확인해 보겠습니다.

```python
num_events = 0

async for event in chain.astream_events(
    'output a list of the countries france, spain and japan and their populations in JSON format. Use a dict with an outer key of "countries" which contains a list of countries. Each country should have the key `name` and `population`',
    version="v1",
):
    kind = event["event"]
    if kind == "on_chat_model_stream":
        print(
            f"Chat model chunk: {repr(event['data']['chunk'].content)}",
            flush=True,
        )
    if kind == "on_parser_stream":
        print(f"Parser chunk: {event['data']['chunk']}", flush=True)
    num_events += 1
    if num_events > 30:
        # 출력 자르기
        print("...")
        break
```

```output
Chat model chunk: ' Here'
Chat model chunk: ' is'
Chat model chunk: ' the'
Chat model chunk: ' JSON'
Chat model chunk: ' with'
Chat model chunk: ' the'
Chat model chunk: ' requested'
Chat model chunk: ' countries'
Chat model chunk: ' and'
Chat model chunk: ' their'
Chat model chunk: ' populations'
Chat model chunk: ':'
Chat model chunk: '\n\n```'
Chat model chunk: 'json'
Parser chunk: {}
Chat model chunk: '\n{'
Chat model chunk: '\n '
Chat model chunk: ' "'
Chat model chunk: 'countries'
Chat model chunk: '":'
Parser chunk: {'countries': []}
Chat model chunk: ' ['
Chat model chunk: '\n   '
Parser chunk: {'countries': [{}]}
Chat model chunk: ' {'
Chat model chunk: '\n     '
Chat model chunk: ' "'
...
```

### 콜백 전파

:::caution
도구 안에서 실행 가능한 항목을 호출하는 경우, 실행 가능한 항목에 콜백을 전파해야 합니다. 그렇지 않으면 스트림 이벤트가 생성되지 않습니다.
:::

:::note
RunnableLambdas나 @chain 데코레이터를 사용할 때, 콜백은 자동으로 전파됩니다.
:::

```python
from langchain_core.runnables import RunnableLambda
from langchain_core.tools import tool

def reverse_word(word: str):
    return word[::-1]

reverse_word = RunnableLambda(reverse_word)

@tool
def bad_tool(word: str):
    """콜백을 전파하지 않는 커스텀 도구입니다."""
    return reverse_word.invoke(word)

async for event in bad_tool.astream_events("hello", version="v1"):
    print(event)
```

```output
{'event': 'on_tool_start', 'run_id': 'ae7690f8-ebc9-4886-9bbe-cb336ff274f2', 'name': 'bad_tool', 'tags': [], 'metadata': {}, 'data': {'input': 'hello'}}
{'event': 'on_tool_stream', 'run_id': 'ae7690f8-ebc9-4886-9bbe-cb336ff274f2', 'tags': [], 'metadata': {}, 'name': 'bad_tool', 'data': {'chunk': 'olleh'}}
{'event': 'on_tool_end', 'name': 'bad_tool', 'run_id': 'ae7690f8-ebc9-4886-9bbe-cb336ff274f2', 'tags': [], 'metadata': {}, 'data': {'output': 'olleh'}}
```

다음은 콜백을 올바르게 전파하는 재구현입니다. 이제 `reverse_word` 실행 가능한 항목에서 나오는 이벤트도 볼 수 있습니다.

```python
@tool
def correct_tool(word: str, callbacks):
    """콜백을 올바르게 전파하는 도구입니다."""
    return reverse_word.invoke(word, {"callbacks": callbacks})

async for event in correct_tool.astream_events("hello", version="v1"):
    print(event)
```

```output
{'event': 'on_tool_start', 'run_id': '384f1710-612e-4022-a6d4-8a7bb0cc757e', 'name': 'correct_tool', 'tags': [], 'metadata': {}, 'data': {'input': 'hello'}}
{'event': 'on_chain_start', 'name': 'reverse_word', 'run_id': 'c4882303-8867-4dff-b031-7d9499b39dda', 'tags': [], 'metadata': {}, 'data': {'input': 'hello'}}
{'event': 'on_chain_end', 'name': 'reverse_word', 'run_id': 'c4882303-8867-4dff-b031-7d9499b39dda', 'tags': [], 'metadata': {}, 'data': {'input': 'hello', 'output': 'olleh'}}
{'event': 'on_tool_stream', 'run_id': '384f1710-612e-4022-a6d4-8a7bb0cc757e', 'tags': [], 'metadata': {}, 'name': 'correct_tool', 'data': {'chunk': 'olleh'}}
{'event': 'on_tool_end', 'name': 'correct_tool', 'run_id': '384f1710-612e-4022-a6d4-8a7bb0cc757e', 'tags': [], 'metadata': {}, 'data': {'output': 'olleh'}}
```

Runnable Lambdas나 @chains 내에서 실행 가능한 항목을 호출하는 경우, 콜백은 자동으로 전달됩니다.

```python
from langchain_core.runnables import RunnableLambda

async def reverse_and_double(word: str):
    return await reverse_word.ainvoke(word) * 2

reverse_and_double = RunnableLambda(reverse_and_double)

await reverse_and_double.ainvoke("1234")

async for event in reverse_and_double.astream_events("1234", version="v1"):
    print(event)
```

```output
{'event': 'on_chain_start', 'run_id': '4fe56c7b-6982-4999-a42d-79ba56151176', 'name': 'reverse_and_double', 'tags': [], 'metadata': {}, 'data': {'input': '1234'}}
{'event': 'on_chain_start', 'name': 'reverse_word', 'run_id': '335fe781-8944-4464-8d2e-81f61d1f85f5', 'tags': [], 'metadata': {}, 'data': {'input': '1234'}}
{'event': 'on_chain_end', 'name': 'reverse_word', 'run_id': '335fe781-8944-4464-8d2e-81f61d1f85f5', 'tags': [], 'metadata': {}, 'data': {'input': '1234', 'output': '4321'}}
{'event': 'on_chain_stream', 'run_id': '4fe56c7b-6982-4999-a42d-79ba56151176', 'tags': [], 'metadata': {}, 'name': 'reverse_and_double', 'data': {'chunk': '43214321'}}
{'event': 'on_chain_end', 'name': 'reverse_and_double', 'run_id': '4fe56c7b-6982-4999-a42d-79ba56151176', 'tags': [], 'metadata': {}, 'data': {'output': '43214321'}}
```

@chain 데코레이터와 함께 사용할 때:

```python
from langchain_core.runnables import chain

@chain
async def reverse_and_double(word: str):
    return await reverse_word.ainvoke(word) * 2

await reverse_and_double.ainvoke("1234")

async for event in reverse_and_double.astream_events("1234", version="v1"):
    print(event)
```

```output
{'event': 'on_chain_start', 'run_id': '7485eedb-1854-429c-a2f8-03d01452daef', 'name': 'reverse_and_double', 'tags': [], 'metadata': {}, 'data': {'input': '1234'}}
{'event': 'on_chain_start', 'name': 'reverse_word', 'run_id': 'e7cddab2-9b95-4e80-abaf-4b2429117835', 'tags': [], 'metadata': {}, 'data': {'input': '1234'}}
{'event': 'on_chain_end', 'name': 'reverse_word', 'run_id': 'e7cddab2-9b95-4e80-abaf-4b2429117835', 'tags': [], 'metadata': {}, 'data': {'input': '1234', 'output': '4321'}}
{'event': 'on_chain_stream', 'run_id': '7485eedb-1854-429c-a2f8-03d01452daef', 'tags': [], 'metadata': {}, 'name': 'reverse_and_double', 'data': {'chunk': '43214321'}}
{'event': 'on_chain_end', 'name': 'reverse_and_double', 'run_id': '7485eedb-1854-429c-a2f8-03d01452daef', 'tags': [], 'metadata': {}, 'data': {'output': '43214321'}}
```