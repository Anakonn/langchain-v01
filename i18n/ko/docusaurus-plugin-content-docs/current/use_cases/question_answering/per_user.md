---
sidebar_position: 4
translated: true
---

# 사용자별 검색

검색 앱을 구축할 때 여러 사용자를 고려해야 하는 경우가 많습니다. 이는 한 사용자가 아닌 여러 다른 사용자를 위한 데이터를 저장할 수 있으며, 사용자가 서로의 데이터를 볼 수 없도록 해야 함을 의미합니다. 따라서 특정 정보만 검색하도록 검색 체인을 구성할 수 있어야 합니다. 일반적으로 두 단계로 이루어집니다.

**1단계: 사용 중인 검색기가 여러 사용자를 지원하는지 확인하세요**

현재 LangChain에는 이를 위한 통일된 플래그나 필터가 없습니다. 각 벡터스토어나 검색기가 고유한 방법을 가질 수 있으며, 다르게 불릴 수도 있습니다(네임스페이스, 멀티 테넌시 등). 벡터스토어의 경우 일반적으로 `similarity_search` 중에 전달되는 키워드 인수로 노출됩니다. 문서나 소스 코드를 읽고 사용 중인 검색기가 여러 사용자를 지원하는지 확인하고, 지원하는 경우 사용하는 방법을 알아보세요.

참고: 검색기가 여러 사용자를 지원하지 않거나 문서화하지 않는 경우 문서를 추가하거나 지원하는 것은 LangChain에 기여하는 훌륭한 방법입니다.

**2단계: 해당 매개변수를 체인의 구성 가능한 필드로 추가하세요**

이렇게 하면 체인을 호출하고 런타임에 관련 플래그를 쉽게 구성할 수 있습니다. 구성에 대한 자세한 내용은 [이 문서](/docs/expression_language/primitives/configure)를 참조하세요.

**3단계: 구성 가능한 필드로 체인을 호출하세요**

이제 런타임에 구성 가능한 필드로 이 체인을 호출할 수 있습니다.

## 코드 예제

코드에서 어떻게 생겼는지 구체적인 예를 살펴보겠습니다. 이 예제에서는 Pinecone을 사용하겠습니다.

Pinecone을 구성하려면 다음 환경 변수를 설정하세요:

- `PINECONE_API_KEY`: Pinecone API 키

```python
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
```

```python
embeddings = OpenAIEmbeddings()
vectorstore = PineconeVectorStore(index_name="test-example", embedding=embeddings)

vectorstore.add_texts(["i worked at kensho"], namespace="harrison")
vectorstore.add_texts(["i worked at facebook"], namespace="ankush")
```

```output
['ce15571e-4e2f-44c9-98df-7e83f6f63095']
```

Pinecone의 `namespace` 키워드 인수는 문서를 분리하는 데 사용할 수 있습니다.

```python
# 이 요청은 Ankush의 문서만 가져옵니다.

vectorstore.as_retriever(search_kwargs={"namespace": "ankush"}).invoke(
    "where did i work?"
)
```

```output
[Document(page_content='i worked at facebook')]
```

```python
# 이 요청은 Harrison의 문서만 가져옵니다.

vectorstore.as_retriever(search_kwargs={"namespace": "harrison"}).invoke(
    "where did i work?"
)
```

```output
[Document(page_content='i worked at kensho')]
```

이제 질문-응답을 수행할 체인을 생성할 수 있습니다.

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import (
    ConfigurableField,
    RunnableBinding,
    RunnableLambda,
    RunnablePassthrough,
)
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
```

기본적인 질문-응답 체인 설정입니다.

```python
template = """Answer the question based only on the following context:
{context}
Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

model = ChatOpenAI()

retriever = vectorstore.as_retriever()
```

여기서 검색기를 구성 가능한 필드로 표시합니다. 모든 벡터스토어 검색기에는 `search_kwargs`라는 필드가 있습니다. 이는 단순히 벡터스토어 특정 필드가 있는 딕셔너리입니다.

```python
configurable_retriever = retriever.configurable_fields(
    search_kwargs=ConfigurableField(
        id="search_kwargs",
        name="Search Kwargs",
        description="The search kwargs to use",
    )
)
```

이제 구성 가능한 검색기를 사용하여 체인을 생성할 수 있습니다.

```python
chain = (
    {"context": configurable_retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
```

이제 구성 가능한 옵션으로 체인을 호출할 수 있습니다. `search_kwargs`는 구성 가능한 필드의 ID입니다. 값은 Pinecone에 사용할 검색 kwargs입니다.

```python
chain.invoke(
    "where did the user work?",
    config={"configurable": {"search_kwargs": {"namespace": "harrison"}}},
)
```

```output
'The user worked at Kensho.'
```

```python
chain.invoke(
    "where did the user work?",
    config={"configurable": {"search_kwargs": {"namespace": "ankush"}}},
)
```

```output
'The user worked at Facebook.'
```

여러 사용자에 대한 벡터스토어 구현에 대한 자세한 내용은 [Milvus](/docs/integrations/vectorstores/milvus)와 같은 특정 페이지를 참조하세요.