---
keywords:
- RunnableParallel
- RunnableMap
- LCEL
sidebar_position: 1
title: '병렬 처리: 데이터 형식화'
translated: true
---

# 입력 및 출력 형식화

`RunnableParallel` 원시 기능은 기본적으로 값이 실행 가능한 항목(또는 함수와 같이 실행 가능한 항목으로 강제 변환될 수 있는 항목)인 사전입니다. `RunnableParallel`의 전체 입력으로 각 값을 병렬로 실행하며, 최종 반환 값은 각 키에 해당하는 값의 결과를 포함하는 사전입니다.

이는 작업을 병렬화하는 데 유용하지만, 하나의 실행 가능한 항목의 출력을 다음 실행 가능한 항목의 입력 형식에 맞추기 위해 조작할 때도 유용할 수 있습니다.

여기서 프롬프트의 입력은 "context"와 "question" 키를 가진 맵이어야 합니다. 사용자 입력은 단순히 질문이므로, 검색기를 사용하여 문맥을 얻고 "question" 키 아래에 사용자 입력을 그대로 전달해야 합니다.

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

vectorstore = FAISS.from_texts(
    ["harrison worked at kensho"], embedding=OpenAIEmbeddings()
)
retriever = vectorstore.as_retriever()
template = """다음 문맥을 기반으로 질문에 답하세요:
{context}

질문: {question}
"""
prompt = ChatPromptTemplate.from_template(template)
model = ChatOpenAI()

retrieval_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)

retrieval_chain.invoke("harrison은 어디에서 일했나요?")
```

```output
'Harrison은 Kensho에서 일했습니다.'
```

::: {.callout-tip}
다른 실행 가능한 항목과 RunnableParallel을 구성할 때 사전을 RunnableParallel 클래스에 래핑할 필요가 없다는 점에 유의하세요. 타입 변환은 자동으로 처리됩니다. 체인 맥락에서, 다음은 동일하게 동작합니다:
:::

```
{"context": retriever, "question": RunnablePassthrough()}
```

```
RunnableParallel({"context": retriever, "question": RunnablePassthrough()})
```

```
RunnableParallel(context=retriever, question=RunnablePassthrough())
```

## itemgetter 사용하기

`RunnableParallel`과 결합할 때 맵에서 데이터를 추출하는 데 Python의 `itemgetter`를 단축어로 사용할 수 있습니다. `itemgetter`에 대한 자세한 정보는 [Python 문서](https://docs.python.org/3/library/operator.html#operator.itemgetter)에서 확인할 수 있습니다.

아래 예제에서는 `itemgetter`를 사용하여 맵에서 특정 키를 추출합니다:

```python
from operator import itemgetter

from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

vectorstore = FAISS.from_texts(
    ["harrison worked at kensho"], embedding=OpenAIEmbeddings()
)
retriever = vectorstore.as_retriever()

template = """다음 문맥을 기반으로 질문에 답하세요:
{context}

질문: {question}

다음 언어로 답하세요: {language}
"""
prompt = ChatPromptTemplate.from_template(template)

chain = (
    {
        "context": itemgetter("question") | retriever,
        "question": itemgetter("question"),
        "language": itemgetter("language"),
    }
    | prompt
    | model
    | StrOutputParser()
)

chain.invoke({"question": "harrison은 어디에서 일했나요?", "language": "italian"})
```

```output
'Harrison ha lavorato a Kensho.'
```

## 단계 병렬화

RunnableParallel(aka. RunnableMap)을 사용하면 여러 실행 가능한 항목을 병렬로 실행하고 이러한 실행 가능한 항목의 출력을 맵으로 반환하기 쉽게 만듭니다.

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel
from langchain_openai import ChatOpenAI

model = ChatOpenAI()
joke_chain = ChatPromptTemplate.from_template("주제 {topic}에 대한 농담을 해주세요") | model
poem_chain = (
    ChatPromptTemplate.from_template("주제 {topic}에 대한 두 줄짜리 시를 작성해 주세요") | model
)

map_chain = RunnableParallel(joke=joke_chain, poem=poem_chain)

map_chain.invoke({"topic": "곰"})
```

```output
{'joke': AIMessage(content="곰은 왜 신발을 신지 않을까요?\n\n곰발바닥이 있기 때문이죠!"),
 'poem': AIMessage(content="자연의 품 안에서 곰이 자유롭게 돌아다닌다,\n힘과 우아함, 장엄한 선언")}
```

## 병렬 처리

RunnableParallel은 맵 내의 각 실행 가능한 항목이 병렬로 실행되므로 독립적인 프로세스를 병렬로 실행하는 데 유용합니다. 예를 들어, 이전의 `joke_chain`, `poem_chain`, `map_chain`이 모두 거의 동일한 실행 시간을 가지고 있으며, `map_chain`은 다른 두 개를 모두 실행합니다.

```python
%%timeit

joke_chain.invoke({"topic": "곰"})
```

```output
958 ms ± 402 ms per loop (mean ± std. dev. of 7 runs, 1 loop each)
```

```python
%%timeit

poem_chain.invoke({"topic": "곰"})
```

```output
1.22 s ± 508 ms per loop (mean ± std. dev. of 7 runs, 1 loop each)
```

```python
%%timeit

map_chain.invoke({"topic": "곰"})
```

```output
1.15 s ± 119 ms per loop (mean ± std. dev. of 7 runs, 1 loop each)
```