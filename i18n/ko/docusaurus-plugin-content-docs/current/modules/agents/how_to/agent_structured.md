---
translated: true
---

# 구조화된 출력 반환하기

이 노트북에서는 에이전트가 구조화된 출력을 반환하는 방법을 다룹니다.
기본적으로 대부분의 에이전트는 단일 문자열을 반환합니다.
종종 더 구조화된 출력을 가지는 것이 유용할 수 있습니다.

좋은 예시는 일부 소스에 대한 질문-답변 작업을 수행하는 에이전트입니다.
우리는 에이전트가 답변뿐만 아니라 사용된 소스 목록도 반환하기를 원합니다.
그런 다음 우리는 출력이 대략 아래의 스키마를 따르기를 원합니다:

```python
class Response(BaseModel):
    """Final response to the question being asked"""
    answer: str = Field(description = "The final answer to respond to the user")
    sources: List[int] = Field(description="List of page chunks that contain answer to the question. Only include a page chunk if it contains relevant information")
```

이 노트북에서는 리트리버 도구가 있고 올바른 형식으로 응답하는 에이전트에 대해 살펴볼 것입니다.

## 리트리버 생성하기

이 섹션에서는 "국정 연설" 주소를 포함하는 모의 데이터에 대한 리트리버를 생성하는 설정 작업을 수행할 것입니다. 중요한 것은 각 문서의 메타데이터에 "page_chunk" 태그를 추가하는 것입니다. 이것은 단순히 소스 필드를 시뮬레이션하기 위한 가짜 데이터입니다. 실제로는 문서의 URL 또는 경로일 가능성이 더 높습니다.

```python
%pip install -qU langchain langchain-community langchain-openai langchain-chroma
```

```python
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
# Load in document to retrieve over
loader = TextLoader("../../state_of_the_union.txt")
documents = loader.load()

# Split document into chunks
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

# Here is where we add in the fake source information
for i, doc in enumerate(texts):
    doc.metadata["page_chunk"] = i

# Create our retriever
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(texts, embeddings, collection_name="state-of-union")
retriever = vectorstore.as_retriever()
```

## 도구 생성하기

이제 에이전트에게 제공할 도구를 생성할 것입니다. 이 경우에는 단 하나의 도구, 즉 우리의 리트리버를 래핑하는 도구입니다.

```python
from langchain.tools.retriever import create_retriever_tool

retriever_tool = create_retriever_tool(
    retriever,
    "state-of-union-retriever",
    "Query a retriever to get information about state of the union address",
)
```

## 응답 스키마 생성하기

여기서는 응답 스키마를 정의할 것입니다. 이 경우 최종 답변에 두 개의 필드가 있기를 원합니다: 하나는 `answer`용, 다른 하나는 `sources` 목록용입니다.

```python
from typing import List

from langchain_core.pydantic_v1 import BaseModel, Field


class Response(BaseModel):
    """Final response to the question being asked"""

    answer: str = Field(description="The final answer to respond to the user")
    sources: List[int] = Field(
        description="List of page chunks that contain answer to the question. Only include a page chunk if it contains relevant information"
    )
```

## 사용자 정의 구문 분석 로직 생성하기

이제 사용자 정의 구문 분석 로직을 생성할 것입니다.
이것이 작동하는 방식은 `Response` 스키마를 OpenAI LLM에 `functions` 매개변수로 전달하는 것입니다.
이것은 에이전트가 사용할 도구를 전달하는 것과 유사합니다.

`Response` 함수가 OpenAI에 의해 호출되면 사용자에게 반환하려고 합니다.
OpenAI에 의해 호출되는 다른 모든 함수는 도구 호출로 처리합니다.

따라서 우리의 구문 분석 로직에는 다음과 같은 블록이 있습니다:

- 함수가 호출되지 않으면 사용자에게 응답해야 한다고 가정하고 `AgentFinish`를 반환합니다.
- `Response` 함수가 호출되면 해당 함수의 입력(우리의 구조화된 출력)으로 사용자에게 응답하고 `AgentFinish`를 반환합니다.
- 다른 함수가 호출되면 도구 호출로 처리하고 `AgentActionMessageLog`를 반환합니다.

`AgentAction`이 아닌 `AgentActionMessageLog`를 사용하는 이유는 향후 에이전트 프롬프트에 다시 전달할 수 있는 메시지 로그를 첨부할 수 있기 때문입니다.

```python
import json

from langchain_core.agents import AgentActionMessageLog, AgentFinish
```

```python
def parse(output):
    # If no function was invoked, return to user
    if "function_call" not in output.additional_kwargs:
        return AgentFinish(return_values={"output": output.content}, log=output.content)

    # Parse out the function call
    function_call = output.additional_kwargs["function_call"]
    name = function_call["name"]
    inputs = json.loads(function_call["arguments"])

    # If the Response function was invoked, return to the user with the function inputs
    if name == "Response":
        return AgentFinish(return_values=inputs, log=str(function_call))
    # Otherwise, return an agent action
    else:
        return AgentActionMessageLog(
            tool=name, tool_input=inputs, log="", message_log=[output]
        )
```

## 에이전트 생성하기

이제 이 모든 것을 종합할 수 있습니다! 이 에이전트의 구성 요소는 다음과 같습니다:

- 프롬프트: 사용자의 질문과 `agent_scratchpad`(중간 단계)를 위한 자리 표시자가 있는 간단한 프롬프트
- 도구: LLM에 도구와 `Response` 형식을 함수로 연결할 수 있습니다.
- 스크래치패드 형식: 중간 단계의 `agent_scratchpad`를 형식화하기 위해 표준 `format_to_openai_function_messages`를 사용할 것입니다. 이것은 중간 단계를 AIMessages와 FunctionMessages로 형식화합니다.
- 출력 파서: 위에서 정의한 사용자 정의 파서를 사용하여 LLM의 응답을 구문 분석할 것입니다.
- AgentExecutor: 에이전트-도구-에이전트-도구... 루프를 실행하기 위해 표준 AgentExecutor를 사용할 것입니다.

```python
from langchain.agents import AgentExecutor
from langchain.agents.format_scratchpad import format_to_openai_function_messages
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
```

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant"),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)
```

```python
llm = ChatOpenAI(temperature=0)
```

```python
llm_with_tools = llm.bind_functions([retriever_tool, Response])
```

```python
agent = (
    {
        "input": lambda x: x["input"],
        # Format agent scratchpad from intermediate steps
        "agent_scratchpad": lambda x: format_to_openai_function_messages(
            x["intermediate_steps"]
        ),
    }
    | prompt
    | llm_with_tools
    | parse
)
```

```python
agent_executor = AgentExecutor(tools=[retriever_tool], agent=agent, verbose=True)
```

## 에이전트 실행하기

이제 에이전트를 실행할 수 있습니다! `answer`와 `sources` 키가 있는 사전이 응답으로 나타나는 것을 확인하세요.

```python
agent_executor.invoke(
    {"input": "what did the president say about ketanji brown jackson"},
    return_only_outputs=True,
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m[0m[36;1m[1;3mTonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

And for our LGBTQ+ Americans, let’s finally get the bipartisan Equality Act to my desk. The onslaught of state laws targeting transgender Americans and their families is wrong.

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential.

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice.

And soon, we’ll strengthen the Violence Against Women Act that I first wrote three decades ago. It is important for us to show the nation that we can come together and do big things.

So tonight I’m offering a Unity Agenda for the Nation. Four big things we can do together.

First, beat the opioid epidemic.

Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.

Last year COVID-19 kept us apart. This year we are finally together again.

Tonight, we meet as Democrats Republicans and Independents. But most importantly as Americans.

With a duty to one another to the American people to the Constitution.

And with an unwavering resolve that freedom will always triumph over tyranny.

Six days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated.

He thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined.

He met the Ukrainian people.

From President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world.

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.[0m[32;1m[1;3m{'arguments': '{\n"answer": "President Biden nominated Ketanji Brown Jackson for the United States Supreme Court and described her as one of our nation\'s top legal minds who will continue Justice Breyer\'s legacy of excellence.",\n"sources": [6]\n}', 'name': 'Response'}[0m

[1m> Finished chain.[0m
```

```output
{'answer': "President Biden nominated Ketanji Brown Jackson for the United States Supreme Court and described her as one of our nation's top legal minds who will continue Justice Breyer's legacy of excellence.",
 'sources': [6]}
```
