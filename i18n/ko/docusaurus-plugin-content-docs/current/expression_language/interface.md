---
sidebar_position: 1
title: Runnable 인터페이스
translated: true
---

사용자 정의 체인을 쉽게 만들 수 있도록 ["Runnable"](https://api.python.langchain.com/en/stable/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable) 프로토콜을 구현했습니다. 많은 LangChain 구성 요소가 `Runnable` 프로토콜을 구현하며, 여기에는 챗 모델, LLM, 출력 파서, 검색기, 프롬프트 템플릿 등이 포함됩니다. 또한, runnables 작업을 위한 여러 유용한 프리미티브가 있으며, 이에 대해서는 [이 섹션](/docs/expression_language/primitives)에서 읽을 수 있습니다.

이 표준 인터페이스는 사용자 정의 체인을 정의하고 표준 방식으로 호출하는 것을 쉽게 만들어 줍니다.
표준 인터페이스에는 다음이 포함됩니다:

- [`stream`](#stream): 응답의 청크를 스트리밍 반환
- [`invoke`](#invoke): 입력에 대해 체인을 호출
- [`batch`](#batch): 입력 목록에 대해 체인을 호출

이들에는 [asyncio](https://docs.python.org/3/library/asyncio.html) `await` 문법과 함께 사용해야 하는 해당 비동기 메서드도 있습니다:

- [`astream`](#async-stream): 응답의 청크를 비동기 스트리밍 반환
- [`ainvoke`](#async-invoke): 입력에 대해 체인을 비동기 호출
- [`abatch`](#async-batch): 입력 목록에 대해 체인을 비동기 호출
- [`astream_log`](#async-stream-intermediate-steps): 최종 응답 외에도 중간 단계가 발생할 때 스트리밍 반환
- [`astream_events`](#async-stream-events): **베타** 체인에서 발생하는 이벤트를 스트리밍 반환 (`langchain-core` 0.1.14에 도입됨)

**입력 유형** 및 **출력 유형**은 구성 요소에 따라 다릅니다:

| 구성 요소 | 입력 유형                                    | 출력 유형        |
| --------- | -------------------------------------------- | ---------------- |
| 프롬프트  | 딕셔너리                                     | PromptValue      |
| 챗 모델   | 단일 문자열, 챗 메시지 목록 또는 PromptValue | ChatMessage      |
| LLM       | 단일 문자열, 챗 메시지 목록 또는 PromptValue | 문자열           |
| 출력 파서 | LLM 또는 ChatModel의 출력                    | 파서에 따라 다름 |
| 검색기    | 단일 문자열                                  | 문서 목록        |
| 도구      | 단일 문자열 또는 도구에 따라 다름            | 도구에 따라 다름 |

모든 runnables는 입력 및 출력 **스키마**를 노출하여 입력 및 출력을 검사할 수 있습니다:

- [`input_schema`](#input-schema): Runnable의 구조에서 자동 생성된 입력 Pydantic 모델
- [`output_schema`](#output-schema): Runnable의 구조에서 자동 생성된 출력 Pydantic 모델

이 메서드들을 살펴보겠습니다. 이를 위해 매우 간단한 PromptTemplate + ChatModel 체인을 만들어 보겠습니다.

```python
%pip install --upgrade --quiet langchain-core langchain-community langchain-openai
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

model = ChatOpenAI()
prompt = ChatPromptTemplate.from_template("tell me a joke about {topic}")
chain = prompt | model
```

## 입력 스키마

Runnable이 수락하는 입력에 대한 설명입니다.
이는 모든 Runnable의 구조에서 동적으로 생성된 Pydantic 모델입니다.
`.schema()`를 호출하여 JSONSchema 표현을 얻을 수 있습니다.

```python
# 체인의 입력 스키마는 첫 번째 부분인 프롬프트의 입력 스키마입니다.

chain.input_schema.schema()
```

```output
{'title': 'PromptInput',
 'type': 'object',
 'properties': {'topic': {'title': 'Topic', 'type': 'string'}}}
```

```python
prompt.input_schema.schema()
```

```output
{'title': 'PromptInput',
 'type': 'object',
 'properties': {'topic': {'title': 'Topic', 'type': 'string'}}}
```

```python
model.input_schema.schema()
```

```output
{'title': 'ChatOpenAIInput',
 'anyOf': [{'type': 'string'},
  {'$ref': '#/definitions/StringPromptValue'},
  {'$ref': '#/definitions/ChatPromptValueConcrete'},
  {'type': 'array',
   'items': {'anyOf': [{'$ref': '#/definitions/AIMessage'},
     {'$ref': '#/definitions/HumanMessage'},
     {'$ref': '#/definitions/ChatMessage'},
     {'$ref': '#/definitions/SystemMessage'},
     {'$ref': '#/definitions/FunctionMessage'},
     {'$ref': '#/definitions/ToolMessage'}]}}],
 'definitions': {'StringPromptValue': {'title': 'StringPromptValue',
   'description': 'String prompt value.',
   'type': 'object',
   'properties': {'text': {'title': 'Text', 'type': 'string'},
    'type': {'title': 'Type',
     'default': 'StringPromptValue',
     'enum': ['StringPromptValue'],
     'type': 'string'}},
   'required': ['text']},
  'AIMessage': {'title': 'AIMessage',
   'description': 'A Message from an AI.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'ai',
     'enum': ['ai'],
     'type': 'string'},
    'example': {'title': 'Example', 'default': False, 'type': 'boolean'}},
   'required': ['content']},
  'HumanMessage': {'title': 'HumanMessage',
   'description': 'A Message from a human.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'human',
     'enum': ['human'],
     'type': 'string'},
    'example': {'title': 'Example', 'default': False, 'type': 'boolean'}},
   'required': ['content']},
  'ChatMessage': {'title': 'ChatMessage',
   'description': 'A Message that can be assigned an arbitrary speaker (i.e. role).',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'chat',
     'enum': ['chat'],
     'type': 'string'},
    'role': {'title': 'Role', 'type': 'string'}},
   'required': ['content', 'role']},
  'SystemMessage': {'title': 'SystemMessage',
   'description': 'A Message for priming AI behavior, usually passed in as the first of a sequence\nof input messages.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'system',
     'enum': ['system'],
     'type': 'string'}},
   'required': ['content']},
  'FunctionMessage': {'title': 'FunctionMessage',
   'description': 'A Message for passing the result of executing a function back to a model.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'function',
     'enum': ['function'],
     'type': 'string'},
    'name': {'title': 'Name', 'type': 'string'}},
   'required': ['content', 'name']},
  'ToolMessage': {'title': 'ToolMessage',
   'description': 'A Message for passing the result of executing a tool back to a model.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'tool',
     'enum': ['tool'],
     'type': 'string'},
    'tool_call_id': {'title': 'Tool Call Id', 'type': 'string'}},
   'required': ['content', 'tool_call_id']},
  'ChatPromptValueConcrete': {'title': 'ChatPromptValueConcrete',
   'description': 'Chat prompt value which explicitly lists out the message types it accepts.\nFor use in external schemas.',
   'type': 'object',
   'properties': {'messages': {'title': 'Messages',
     'type': 'array',
     'items': {'anyOf': [{'$ref': '#/definitions/AIMessage'},
       {'$ref': '#/definitions/HumanMessage'},
       {'$ref': '#/definitions/ChatMessage'},
       {'$ref': '#/definitions/SystemMessage'},
       {'$ref': '#/definitions/FunctionMessage'},
       {'$ref': '#/definitions/ToolMessage'}]}},
    'type': {'title': 'Type',
     'default': 'ChatPromptValueConcrete',
     'enum': ['ChatPromptValueConcrete'],
     'type': 'string'}},
   'required': ['messages']}}}
```

## 출력 스키마

Runnable이 생성하는 출력에 대한 설명입니다.
이는 모든 Runnable의 구조에서 동적으로 생성된 Pydantic 모델입니다.
`.schema()`를 호출하여 JSONSchema 표현을 얻을 수 있습니다.

```python
# 체인의 출력 스키마는 마지막 부분인 ChatModel의 출력 스키마입니다. ChatModel은 ChatMessage를 출력합니다.

chain.output_schema.schema()
```

```output
{'title': 'ChatOpenAIOutput',
 'anyOf': [{'$ref': '#/definitions/AIMessage'},
  {'$ref': '#/definitions/HumanMessage'},
  {'$ref': '#/definitions/ChatMessage'},
  {'$ref': '#/definitions/SystemMessage'},
  {'$ref': '#/definitions/FunctionMessage'},
  {'$ref': '#/definitions/ToolMessage'}],
 'definitions': {'AIMessage': {'title': 'AIMessage',
   'description': 'A Message from an AI.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'ai',
     'enum': ['ai'],
     'type': 'string'},
    'example': {'title': 'Example', 'default': False, 'type': 'boolean'}},
   'required': ['content']},
  'HumanMessage': {'title': 'HumanMessage',
   'description': 'A Message from a human.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'human',
     'enum': ['human'],
     'type': 'string'},
    'example': {'title': 'Example', 'default': False, 'type': 'boolean'}},
   'required': ['content']},
  'ChatMessage': {'title': 'ChatMessage',
   'description': 'A Message that can be assigned an arbitrary speaker (i.e. role).',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'chat',
     'enum': ['chat'],
     'type': 'string'},
    'role': {'title': 'Role', 'type': 'string'}},
   'required': ['content', 'role']},
  'SystemMessage': {'title': 'SystemMessage',
   'description': 'A Message for priming AI behavior, usually passed in as the first of a sequence\nof input messages.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'system',
     'enum': ['system'],
     'type': 'string'}},
   'required': ['content']},
  'FunctionMessage': {'title': 'FunctionMessage',
   'description': 'A Message for passing the result of executing a function back to a model.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'function',
     'enum': ['function'],
     'type': 'string'},
    'name': {'title': 'Name', 'type': 'string'}},
   'required': ['content', 'name']},
  'ToolMessage': {'title': 'ToolMessage',
   'description': 'A Message for passing the result of executing a tool back to a model.',
   'type': 'object',
   'properties': {'content': {'title': 'Content',
     'anyOf': [{'type': 'string'},
      {'type': 'array',
       'items': {'anyOf': [{'type': 'string'}, {'type': 'object'}]}}]},
    'additional_kwargs': {'title': 'Additional Kwargs', 'type': 'object'},
    'type': {'title': 'Type',
     'default': 'tool',
     'enum': ['tool'],
     'type': 'string'},
    'tool_call_id': {'title': 'Tool Call Id', 'type': 'string'}},
   'required': ['content', 'tool_call_id']}}}
```

## Stream

```python
for s in chain.stream({"topic": "bears"}):
    print(s.content, end="", flush=True)
```

```output
Sure, here's a bear-themed joke for you:

Why don't bears wear shoes?

Because they already have bear feet!
```

## Invoke

```python
chain.invoke({"topic": "bears"})
```

```output
AIMessage(content="Why don't bears wear shoes? \n\nBecause they have bear feet!")
```

## Batch

```python
chain.batch([{"topic": "bears"}, {"topic": "cats"}])
```

```output
[AIMessage(content="Sure, here's a bear joke for you:\n\nWhy don't bears wear shoes?\n\nBecause they already have bear feet!"),
 AIMessage(content="Why don't cats play poker in the wild?\n\nToo many cheetahs!")]
```

동시 요청 수를 `max_concurrency` 매개변수를 사용하여 설정할 수 있습니다.

```python
chain.batch([{"topic": "bears"}, {"topic": "cats"}], config={"max_concurrency": 5})
```

```output
[AIMessage(content="Why don't bears wear shoes?\n\nBecause they have bear feet!"),
 AIMessage(content="Why don't cats play poker in the wild? Too many cheetahs!")]
```

## Async Stream

```python
async for s in chain.astream({"topic": "bears"}):
    print(s.content, end="", flush=True)
```

```output
Why don't bears wear shoes?

Because they have bear feet!
```

## Async Invoke

```python
await chain.ainvoke({"topic": "bears"})
```

```output
AIMessage(content="Why don't bears ever wear shoes?\n\nBecause they already have bear feet!")
```

## Async Batch

```python
await chain.abatch([{"topic": "bears"}])
```

```output
[AIMessage(content="Why don't bears wear shoes?\n\nBecause they have bear feet!")]
```

## Async Stream Events (베타)

이벤트 스트리밍은 **베타** API이며, 피드백에 따라 약간 변경될 수 있습니다.

참고: langchain-core 0.2.0에 도입됨

현재로서는 astream_events API를 사용할 때 모든 것이 제대로 작동하도록 하려면 다음을 수행해야 합니다:

- 코드 전체에서 `async` 사용(비동기 도구 등 포함)
- 사용자 정의 함수/런너블을 정의할 때 콜백 전파
- LCEL 없이 runnables를 사용할 때 LLM에 `.ainvoke` 대신 `.astream()`을 호출하여 LLM이 토큰을 스트리밍하도록 강제

### 이벤트 참조

다음은 다양한 Runnable 객체에서 발생할 수 있는 이벤트를 보여주는 참조 표입니다. 일부 Runnable에 대한 정의는 표 뒤에 포함되어 있습니다.

⚠️ Runnable의 입력이 전체적으로 소비될 때까지 스트리밍 입력을 사용할 수 없습니다. 즉, 입력은 `start` 이벤트가 아닌 해당하는 `end` 후크에서 사용할 수 있습니다.

| 이벤트               | 이름             | 청크                            | 입력                                          | 출력                                            |
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
| on_retriever_start   | [retriever 이름] |                                 | {"query": "hello"}                            |                                                 |
| on_retriever_chunk   | [retriever 이름] | {documents: [...]}              |                                               |                                                 |
| on_retriever_end     | [retriever 이름] |                                 | {"query": "hello"}                            | {documents: [...]}                              |
| on_prompt_start      | [template 이름]  |                                 | {"question": "hello"}                         |                                                 |
| on_prompt_end        | [template 이름]  |                                 | {"question": "hello"}                         | ChatPromptValue(messages: [SystemMessage, ...]) |

다음은 위 표에 표시된 이벤트와 관련된 선언입니다:

`format_docs`:

```python
def format_docs(docs: List[Document]) -> str:
    '''문서를 포맷합니다.'''
    return ", ".join([doc.page_content for doc in docs])

format_docs = RunnableLambda(format_docs)
```

`some_tool`:

```python
@tool
def some_tool(x: int, y: str) -> dict:
    '''Some_tool.'''
    return {"x": x, "y": y}
```

`prompt`:

```python
template = ChatPromptTemplate.from_messages(
    [("system", "You are Cat Agent 007"), ("human", "{question}")]
).with_config({"run_name": "my_template", "tags": ["my_template"]})
```

새 체인을 정의하여 `astream_events` 인터페이스(나중에는 `astream_log` 인터페이스)를 더 흥미롭게 보여줍니다.

```python
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import OpenAIEmbeddings

template = """Answer the question based only on the following context:
{context}

Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

vectorstore = FAISS.from_texts(
    ["harrison worked at kensho"], embedding=OpenAIEmbeddings()
)
retriever = vectorstore.as_retriever()

retrieval_chain = (
    {
        "context": retriever.with_config(run_name="Docs"),
        "question": RunnablePassthrough(),
    }
    | prompt
    | model.with_config(run_name="my_llm")
    | StrOutputParser()
)
```

이제 `astream_events`를 사용하여 검색기와 LLM에서 이벤트를 가져와 보겠습니다.

```python
async for event in retrieval_chain.astream_events(
    "where did harrison work?", version="v1", include_names=["Docs", "my_llm"]
):
    kind = event["event"]
    if kind == "on_chat_model_stream":
        print(event["data"]["chunk"].content, end="|")
    elif kind in {"on_chat_model_start"}:
        print()
        print("Streaming LLM:")
    elif kind in {"on_chat_model_end"}:
        print()
        print("Done streaming LLM.")
    elif kind == "on_retriever_end":
        print("--")
        print("Retrieved the following documents:")
        print(event["data"]["output"]["documents"])
    elif kind == "on_tool_end":
        print(f"Ended tool: {event['name']}")
    else:
        pass
```

```output
/home/eugene/src/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: This API is in beta and may change in the future.
  warn_beta(

--
Retrieved the following documents:
[Document(page_content='harrison worked at kensho')]

Streaming LLM:
|H|arrison| worked| at| Kens|ho|.||
Done streaming LLM.
```

## 비동기 스트림 중간 단계

모든 runnables에는 체인/시퀀스의 중간 단계의 전부 또는 일부를 스트리밍하는 데 사용되는 `.astream_log()` 메서드도 있습니다.

이 메서드는 사용자에게 진행 상황을 보여주거나, 중간 결과를 사용하거나, 체인을 디버그하는 데 유용합니다.

모든 단계를 스트리밍할 수 있으며(기본값), 이름, 태그 또는 메타데이터로 단계를 포함/제외할 수 있습니다.

이 메서드는 [JSONPatch](https://jsonpatch.com) 작업을 생성하며, 수신된 순서대로 적용하면 RunState가 빌드됩니다.

```python
class LogEntry(TypedDict):
    id: str
    """서브 런의 ID."""
    name: str
    """실행 중인 객체의 이름."""
    type: str
    """실행 중인 객체의 유형, 예: prompt, chain, llm 등."""
    tags: List[str]
    """런의 태그 목록."""
    metadata: Dict[str, Any]
    """런의 메타데이터 키-값 쌍."""
    start_time: str
    """런이 시작된 시점의 ISO-8601 타임스탬프."""

    streamed_output_str: List[str]
    """이 런에서 스트리밍된 LLM 토큰 목록, 해당되는 경우."""
    final_output: Optional[Any]
    """이 런의 최종 출력.
    런이 성공적으로 완료된 후에만 사용할 수 있습니다."""
    end_time: Optional[str]
    """런이 종료된 시점의 ISO-8601 타임스탬프.
    런이 종료된 후에만 사용할 수 있습니다."""


class RunState(TypedDict):
    id: str
    """런의 ID."""
    streamed_output: List[Any]
    """Runnable.stream()에서 스트리밍된 출력 청크 목록"""
    final_output: Optional[Any]
    """런의 최종 출력, 일반적으로 스트리밍된 출력의 집계(`+`) 결과.
    런이 성공적으로 완료된 후에만 사용할 수 있습니다."""

    logs: Dict[str, LogEntry]
    """런 이름에서 서브 런으로의 매핑. 필터가 제공된 경우, 이 목록은 필터와 일치하는 런만 포함합니다."""
```

### JSONPatch 청크 스트리밍

이는 HTTP 서버에서 `JSONPatch`를 스트리밍하고, 클라이언트에서 작업을 적용하여 실행 상태를 재구성하는 데 유용합니다. [LangServe](https://github.com/langchain-ai/langserve)를 참조하여 모든 Runnable에서 웹 서버를 쉽게 구축할 수 있는 도구를 확인할 수 있습니다.

```python
async for chunk in retrieval_chain.astream_log(
    "where did harrison work?", include_names=["Docs"]
):
    print("-" * 40)
    print(chunk)
```

```output
----------------------------------------
RunLogPatch({'op': 'replace',
  'path': '',
  'value': {'final_output': None,
            'id': '82e9b4b1-3dd6-4732-8db9-90e79c4da48c',
            'logs': {},
            'name': 'RunnableSequence',
            'streamed_output': [],
            'type': 'chain'}})
----------------------------------------
RunLogPatch({'op': 'add',
  'path': '/logs/Docs',
  'value': {'end_time': None,
            'final_output': None,
            'id': '9206e94a-57bd-48ee-8c5e-fdd1c52a6da2',
            'metadata': {},
            'name': 'Docs',
            'start_time': '2024-01-19T22:33:55.902+00:00',
            'streamed_output': [],
            'streamed_output_str': [],
            'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
            'type': 'retriever'}})
----------------------------------------
RunLogPatch({'op': 'add',
  'path': '/logs/Docs/final_output',
  'value': {'documents': [Document(page_content='harrison worked at kensho')]}},
 {'op': 'add',
  'path': '/logs/Docs/end_time',
  'value': '2024-01-19T22:33:56.064+00:00'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ''},
 {'op': 'replace', 'path': '/final_output', 'value': ''})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'H'},
 {'op': 'replace', 'path': '/final_output', 'value': 'H'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'arrison'},
 {'op': 'replace', 'path': '/final_output', 'value': 'Harrison'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' worked'},
 {'op': 'replace', 'path': '/final_output', 'value': 'Harrison worked'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' at'},
 {'op': 'replace', 'path': '/final_output', 'value': 'Harrison worked at'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ' Kens'},
 {'op': 'replace', 'path': '/final_output', 'value': 'Harrison worked at Kens'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': 'ho'},
 {'op': 'replace',
  'path': '/final_output',
  'value': 'Harrison worked at Kensho'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': '.'},
 {'op': 'replace',
  'path': '/final_output',
  'value': 'Harrison worked at Kensho.'})
----------------------------------------
RunLogPatch({'op': 'add', 'path': '/streamed_output/-', 'value': ''})
```

### 증분 RunState 스트리밍

`diff=False`를 전달하여 증분 `RunState` 값을 얻을 수 있습니다.
이 경우 더 많은 반복 부분을 포함한 자세한 출력을 얻을 수 있습니다.

```python
async for chunk in retrieval_chain.astream_log(
    "where did harrison work?", include_names=["Docs"], diff=False
):
    print("-" * 70)
    print(chunk)
```

```output
----------------------------------------------------------------------
RunLog({'final_output': None,
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {},
 'name': 'RunnableSequence',
 'streamed_output': [],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': None,
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': None,
                   'final_output': None,
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': [],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': None,
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': [],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': '',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': [''],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'H',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['', 'H'],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'Harrison',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['', 'H', 'arrison'],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'Harrison worked',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['', 'H', 'arrison', ' worked'],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'Harrison worked at',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['', 'H', 'arrison', ' worked', ' at'],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'Harrison worked at Kens',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['', 'H', 'arrison', ' worked', ' at', ' Kens'],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'Harrison worked at Kensho',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['', 'H', 'arrison', ' worked', ' at', ' Kens', 'ho'],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'Harrison worked at Kensho.',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['', 'H', 'arrison', ' worked', ' at', ' Kens', 'ho', '.'],
 'type': 'chain'})
----------------------------------------------------------------------
RunLog({'final_output': 'Harrison worked at Kensho.',
 'id': '431d1c55-7c50-48ac-b3a2-2f5ba5f35172',
 'logs': {'Docs': {'end_time': '2024-01-19T22:33:57.120+00:00',
                   'final_output': {'documents': [Document(page_content='harrison worked at kensho')]},
                   'id': '8de10b49-d6af-4cb7-a4e7-fbadf6efa01e',
                   'metadata': {},
                   'name': 'Docs',
                   'start_time': '2024-01-19T22:33:56.939+00:00',
                   'streamed_output': [],
                   'streamed_output_str': [],
                   'tags': ['map:key:context', 'FAISS', 'OpenAIEmbeddings'],
                   'type': 'retriever'}},
 'name': 'RunnableSequence',
 'streamed_output': ['',
                     'H',
                     'arrison',
                     ' worked',
                     ' at',
                     ' Kens',
                     'ho',
                     '.',
                     ''],
 'type': 'chain'})
```

## 병렬 처리

LangChain Expression Language가 병렬 요청을 어떻게 지원하는지 살펴보겠습니다.
예를 들어, `RunnableParallel`을 사용할 때(종종 딕셔너리로 작성됨) 각 요소를 병렬로 실행합니다.

```python
from langchain_core.runnables import RunnableParallel

chain1 = ChatPromptTemplate.from_template("tell me a joke about {topic}") | model
chain2 = (
    ChatPromptTemplate.from_template("write a short (2 line) poem about {topic}")
    | model
)
combined = RunnableParallel(joke=chain1, poem=chain2)
```

```python
%%time
chain1.invoke({"topic": "bears"})
```

```output
CPU times: user 18 ms, sys: 1.27 ms, total: 19.3 ms
Wall time: 692 ms
```

```output
AIMessage(content="Why don't bears wear shoes?\n\nBecause they already have bear feet!")
```

```python
%%time
chain2.invoke({"topic": "bears"})
```

```output
CPU times: user 10.5 ms, sys: 166 µs, total: 10.7 ms
Wall time: 579 ms
```

```output
AIMessage(content="In forest's embrace,\nMajestic bears pace.")
```

```python
%%time
combined.invoke({"topic": "bears"})
```

```output
CPU times: user 32 ms, sys: 2.59 ms, total: 34.6 ms
Wall time: 816 ms
```

```output
{'joke': AIMessage(content="Sure, here's a bear-related joke for you:\n\nWhy did the bear bring a ladder to the bar?\n\nBecause he heard the drinks were on the house!"),
 'poem': AIMessage(content="In wilderness they roam,\nMajestic strength, nature's throne.")}
```

### 배치에서의 병렬 처리

병렬 처리는 다른 runnables와 결합할 수 있습니다.
병렬 처리를 배치와 함께 사용하는 예를 살펴보겠습니다.

```python
%%time
chain1.batch([{"topic": "bears"}, {"topic": "cats"}])
```

```output
CPU times: user 17.3 ms, sys: 4.84 ms, total: 22.2 ms
Wall time: 628 ms
```

```output
[AIMessage(content="Why don't bears wear shoes?\n\nBecause they have bear feet!"),
 AIMessage(content="Why don't cats play poker in the wild?\n\nToo many cheetahs!")]
```

```python
%%time
chain2.batch([{"topic": "bears"}, {"topic": "cats"}])
```

```output
CPU times: user 15.8 ms, sys: 3.83 ms, total: 19.7 ms
Wall time: 718 ms
```

```output
[AIMessage(content='In the wild, bears roam,\nMajestic guardians of ancient home.'),
 AIMessage(content='Whiskers grace, eyes gleam,\nCats dance through the moonbeam.')]
```

```python
%%time
combined.batch([{"topic": "bears"}, {"topic": "cats"}])
```

```output
CPU times: user 44.8 ms, sys: 3.17 ms, total: 48 ms
Wall time: 721 ms
```

```output
[{'joke': AIMessage(content="Sure, here's a bear joke for you:\n\nWhy don't bears wear shoes?\n\nBecause they have bear feet!"),
  'poem': AIMessage(content="Majestic bears roam,\nNature's strength, beauty shown.")},
 {'joke': AIMessage(content="Why don't cats play poker in the wild?\n\nToo many cheetahs!"),
  'poem': AIMessage(content="Whiskers dance, eyes aglow,\nCats embrace the night's gentle flow.")}]
```