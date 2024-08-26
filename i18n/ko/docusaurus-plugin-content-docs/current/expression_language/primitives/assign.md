---
keywords:
- RunnablePassthrough
- assign
- LCEL
sidebar_position: 6
title: '할당: 상태에 값 추가'
translated: true
---

# 체인 상태에 값 추가

`RunnablePassthrough.assign(...)` 정적 메서드는 입력 값을 받아서 할당 함수에 전달된 추가 인수를 추가합니다.

이는 나중 단계의 입력으로 사용할 사전을 점진적으로 생성할 때 유용하며, 이는 일반적인 LCEL 패턴입니다.

다음은 예제입니다:

```python
%pip install --upgrade --quiet langchain langchain-openai
```

```output
[33mWARNING: You are using pip version 22.0.4; however, version 24.0 is available.
You should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

```python
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

runnable = RunnableParallel(
    extra=RunnablePassthrough.assign(mult=lambda x: x["num"] * 3),
    modified=lambda x: x["num"] + 1,
)

runnable.invoke({"num": 1})
```

```output
{'extra': {'num': 1, 'mult': 3}, 'modified': 2}
```

여기서 무슨 일이 일어나는지 자세히 설명하겠습니다.

- 체인의 입력은 `{"num": 1}`입니다. 이것은 `RunnableParallel`에 전달되어 입력과 함께 병렬로 전달된 실행 가능한 항목들을 호출합니다.
- `extra` 키 아래의 값이 호출됩니다. `RunnablePassthrough.assign()`은 입력 사전의 원래 키 (`{"num": 1}`)를 유지하고 `mult`라는 새 키를 할당합니다. 값은 `lambda x: x["num"] * 3)`이며 이는 `3`입니다. 따라서 결과는 `{"num": 1, "mult": 3}`입니다.
- `{"num": 1, "mult": 3}`이 `RunnableParallel` 호출로 반환되어 `extra` 키의 값으로 설정됩니다.
- 동시에 `modified` 키가 호출됩니다. 결과는 `2`이며, 람다는 입력에서 `"num"`이라는 키를 추출하여 하나를 더합니다.

따라서 결과는 `{'extra': {'num': 1, 'mult': 3}, 'modified': 2}`입니다.

## 스트리밍

이 방법의 좋은 점 중 하나는 값이 사용 가능해지자마자 통과하도록 허용한다는 것입니다. 이를 보여주기 위해 `RunnablePassthrough.assign()`을 사용하여 검색 체인에서 소스 문서를 즉시 반환해보겠습니다:

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
template = """다음 컨텍스트에 기반하여 질문에 답하세요:
{context}

질문: {question}
"""
prompt = ChatPromptTemplate.from_template(template)
model = ChatOpenAI()

generation_chain = prompt | model | StrOutputParser()

retrieval_chain = {
    "context": retriever,
    "question": RunnablePassthrough(),
} | RunnablePassthrough.assign(output=generation_chain)

stream = retrieval_chain.stream("harrison은 어디에서 일했나요?")

for chunk in stream:
    print(chunk)
```

```output
{'question': 'harrison은 어디에서 일했나요?'}
{'context': [Document(page_content='harrison worked at kensho')]}
{'output': ''}
{'output': 'H'}
{'output': 'arrison'}
{'output': ' worked'}
{'output': ' at'}
{'output': ' Kens'}
{'output': 'ho'}
{'output': '.'}
{'output': ''}
```

첫 번째 청크에는 원래의 `"question"`이 포함되어 있음을 알 수 있습니다. 이는 즉시 사용할 수 있기 때문입니다. 두 번째 청크는 검색기가 두 번째로 완료되기 때문에 `"context"`를 포함합니다. 마지막으로 `generation_chain`의 출력이 사용 가능해지자마자 청크로 스트리밍됩니다.