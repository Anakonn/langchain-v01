---
keywords:
- RunnablePassthrough
- LCEL
sidebar_position: 5
title: 'Passthrough: 입력 전달'
translated: true
---

# 데이터 전달

`RunnablePassthrough`는 입력을 변경 없이 전달할 수 있게 해줍니다. 이는 일반적으로 `RunnableParallel`과 함께 사용되어 데이터를 맵의 새 키로 전달합니다.

아래 예제를 보세요:

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

runnable = RunnableParallel(
    passed=RunnablePassthrough(),
    modified=lambda x: x["num"] + 1,
)

runnable.invoke({"num": 1})
```

```output
{'passed': {'num': 1}, 'modified': 2}
```

위에서 볼 수 있듯이, `passed` 키는 `RunnablePassthrough()`로 호출되어 `{'num': 1}`을 그대로 전달했습니다.

또한 맵의 두 번째 키로 `modified`를 설정했습니다. 이는 람다를 사용하여 `num`에 1을 더한 단일 값을 설정하여 `modified` 키의 값이 `2`가 되었습니다.

## 검색 예제

아래 예제에서는 `RunnablePassthrough`와 `RunnableParallel`을 함께 사용하는 사례를 보여줍니다.

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

여기서 프롬프트의 입력은 "context"와 "question" 키를 가진 맵이어야 합니다. 사용자 입력은 단순히 질문입니다. 그래서 검색기를 사용하여 문맥을 얻고 "question" 키 아래에 사용자 입력을 그대로 전달해야 합니다. 이 경우 `RunnablePassthrough`를 사용하여 사용자의 질문을 프롬프트와 모델로 전달할 수 있습니다.