---
translated: true
---

# 에이전트 사용하기

이것은 필요한 경우 검색을 수행하고 대화를 유지하는 데 최적화된 에이전트입니다.

먼저, 사용할 검색기를 설정한 다음 검색 도구로 변환합니다. 다음으로, 이 유형의 에이전트를 위한 고수준 생성자를 사용합니다. 마지막으로, 구성 요소에서 대화형 검색 에이전트를 구성하는 방법을 살펴보겠습니다.

```python
%pip install --upgrade --quiet langchain langchain-community langchainhub langchain-openai faiss-cpu
```

## 검색기

먼저, 사용할 검색기가 필요합니다! 여기의 코드는 대부분 예제 코드입니다. 자신만의 검색기를 사용하고 검색 도구 생성 섹션으로 건너뛰어도 됩니다.

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
```

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)
embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(texts, embeddings)
```

```python
retriever = db.as_retriever()
```

## 검색기 도구

이제 검색기 도구를 만들어야 합니다. 주요하게 전달해야 하는 것은 검색기의 이름과 설명입니다. 이 두 가지는 언어 모델에 의해 사용되므로 정보가 풍부해야 합니다.

```python
from langchain.tools.retriever import create_retriever_tool

tool = create_retriever_tool(
    retriever,
    "search_state_of_union",
    "2022년 국정 연설에서 발췌문을 검색하고 반환합니다.",
)
tools = [tool]
```

## 에이전트 생성자

여기서는 고수준 `create_openai_tools_agent` API를 사용하여 에이전트를 구성합니다.

도구 목록 외에 전달해야 하는 것은 사용할 언어 모델뿐입니다.
이 에이전트는 OpenAI 도구 호출 기능을 사용하고 있으므로 ChatOpenAI 모델을 사용해야 합니다.

```python
from langchain import hub

prompt = hub.pull("hwchase17/openai-tools-agent")
prompt.messages
```

```output
[SystemMessagePromptTemplate(prompt=PromptTemplate(input_variables=[], template='You are a helpful assistant')),
 MessagesPlaceholder(variable_name='chat_history', optional=True),
 HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['input'], template='{input}')),
 MessagesPlaceholder(variable_name='agent_scratchpad')]
```

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0)
```

```python
from langchain.agents import AgentExecutor, create_openai_tools_agent

agent = create_openai_tools_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)
```

이제 시도해 볼 수 있습니다!

```python
result = agent_executor.invoke({"input": "hi, im bob"})
```

```python
result["output"]
```

```output
'Hello Bob! How can I assist you today?'
```

이제 검색을 수행합니다.

```python
result = agent_executor.invoke(
    {
        "input": "what did the president say about ketanji brown jackson in the most recent state of the union?"
    }
)
```

```python
result["output"]
```

```output
"In the most recent state of the union, the President mentioned Kentaji Brown Jackson. The President nominated Circuit Court of Appeals Judge Ketanji Brown Jackson to serve on the United States Supreme Court. The President described Judge Ketanji Brown Jackson as one of our nation's top legal minds who will continue Justice Breyer's legacy of excellence."
```

후속 질문은 이전에 검색된 정보를 물어보기 때문에 다시 검색할 필요가 없습니다.

```python
result = agent_executor.invoke(
    {"input": "how long ago did the president nominate ketanji brown jackson?"}
)
```

```output

[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mThe President nominated Judge Ketanji Brown Jackson four days ago.[0m

[1m> Finished chain.[0m
```

```python
result["output"]
```

```output
'The President nominated Judge Ketanji Brown Jackson four days ago.'
```

검색기와 다른 도구를 사용하는 에이전트에 대해 더 알아보려면 [에이전트](/docs/modules/agents) 섹션을 참조하세요.