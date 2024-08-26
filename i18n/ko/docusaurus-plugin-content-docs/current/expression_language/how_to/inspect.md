---
translated: true
---

# 실행 가능한 항목 검사하기

LCEL로 실행 가능한 항목을 생성한 후에는 이를 검사하여 무슨 일이 일어나고 있는지 더 잘 이해하고 싶을 수 있습니다. 이 노트북에서는 이를 수행하는 몇 가지 방법을 다룹니다.

먼저, 예제 LCEL을 만들어 보겠습니다. 정보를 검색하는 LCEL을 하나 만들어 보겠습니다.

```python
%pip install --upgrade --quiet langchain langchain-openai faiss-cpu tiktoken
```

```python
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
```

```python
vectorstore = FAISS.from_texts(
    ["해리슨은 켄쇼에서 일했습니다"], embedding=OpenAIEmbeddings()
)
retriever = vectorstore.as_retriever()

template = """다음 컨텍스트를 기반으로 질문에 답하세요:
{context}

질문: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

model = ChatOpenAI()
```

```python
chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
```

## 그래프 가져오기

실행 가능한 항목의 그래프를 가져올 수 있습니다.

```python
chain.get_graph()
```

## 그래프 출력

읽기 쉽게 하기 위해 그래프를 출력할 수 있습니다.

```python
chain.get_graph().print_ascii()
```

```output
           +---------------------------------+
           | Parallel<context,question>Input |
           +---------------------------------+
                    **               **
                 ***                   ***
               **                         **
+----------------------+              +-------------+
| VectorStoreRetriever |              | Passthrough |
+----------------------+              +-------------+
                    **               **
                      ***         ***
                         **     **
           +----------------------------------+
           | Parallel<context,question>Output |
           +----------------------------------+
                             *
                             *
                             *
                  +--------------------+
                  | ChatPromptTemplate |
                  +--------------------+
                             *
                             *
                             *
                      +------------+
                      | ChatOpenAI |
                      +------------+
                             *
                             *
                             *
                   +-----------------+
                   | StrOutputParser |
                   +-----------------+
                             *
                             *
                             *
                +-----------------------+
                | StrOutputParserOutput |
                +-----------------------+
```

## 프롬프트 가져오기

모든 체인의 중요한 부분은 사용되는 프롬프트입니다. 체인에 있는 프롬프트를 가져올 수 있습니다:

```python
chain.get_prompts()
```

```output
[ChatPromptTemplate(input_variables=['context', 'question'], messages=[HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['context', 'question'], template='다음 컨텍스트를 기반으로 질문에 답하세요:\n{context}\n\n질문: {question}\n'))])]
```