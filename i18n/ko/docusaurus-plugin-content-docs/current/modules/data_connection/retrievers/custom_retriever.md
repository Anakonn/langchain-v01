---
title: 사용자 정의 리트리버
translated: true
---

# 사용자 정의 리트리버

## 개요

많은 LLM 애플리케이션에는 `Retriever`를 사용하여 외부 데이터 소스에서 정보를 검색하는 작업이 포함됩니다.

리트리버는 사용자 `query`에 대해 관련 `Documents`의 목록을 검색하는 역할을 합니다.

검색된 문서는 종종 LLM에 입력되는 프롬프트로 형식화되어, LLM이 지식 베이스의 정보를 사용하여 적절한 응답을 생성할 수 있습니다(예: 사용자 질문에 답변).

## 인터페이스

사용자 정의 리트리버를 만들려면 `BaseRetriever` 클래스를 확장하고 다음 메서드를 구현해야 합니다:

| 메서드                         | 설명                                      | 필수/선택 |
|--------------------------------|--------------------------------------------------|-------------------|
| `_get_relevant_documents`      | 쿼리에 관련된 문서를 가져옵니다.               | 필수          |
| `_aget_relevant_documents`     | 비동기 네이티브 지원을 제공하도록 구현합니다.       | 선택          |

`_get_relevant_documents` 내부의 로직은 데이터베이스 또는 요청을 사용한 웹 호출과 같은 임의의 호출을 포함할 수 있습니다.

:::tip
`BaseRetriever`를 상속하면 리트리버가 자동으로 LangChain [Runnable](/docs/expression_language/interface)이 되어 표준 `Runnable` 기능을 즉시 사용할 수 있습니다!
:::

:::info
`RunnableLambda` 또는 `RunnableGenerator`를 사용하여 리트리버를 구현할 수 있습니다.

`BaseRetriever`와 `RunnableLambda`(사용자 정의 [runnable 함수](/docs/expression_language/primitives/functions))를 구현하는 주된 차이점은 `BaseRetriever`가 잘 알려진 LangChain 엔티티이므로 일부 모니터링 도구가 리트리버에 대한 특별한 동작을 구현할 수 있다는 것입니다. 또 다른 차이점은 `BaseRetriever`가 일부 API에서 `RunnableLambda`와 약간 다르게 동작한다는 것입니다. 예를 들어, `astream_events` API의 `start` 이벤트가 `on_chain_start` 대신 `on_retriever_start`가 됩니다.
:::

## 예제

사용자 쿼리의 텍스트를 포함하는 모든 문서를 반환하는 장난감 리트리버를 구현해 보겠습니다.

```python
from typing import List

from langchain_core.callbacks import CallbackManagerForRetrieverRun
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever


class ToyRetriever(BaseRetriever):
    """A toy retriever that contains the top k documents that contain the user query.

    This retriever only implements the sync method _get_relevant_documents.

    If the retriever were to involve file access or network access, it could benefit
    from a native async implementation of `_aget_relevant_documents`.

    As usual, with Runnables, there's a default async implementation that's provided
    that delegates to the sync implementation running on another thread.
    """

    documents: List[Document]
    """List of documents to retrieve from."""
    k: int
    """Number of top results to return"""

    def _get_relevant_documents(
        self, query: str, *, run_manager: CallbackManagerForRetrieverRun
    ) -> List[Document]:
        """Sync implementations for retriever."""
        matching_documents = []
        for document in self.documents:
            if len(matching_documents) > self.k:
                return matching_documents

            if query.lower() in document.page_content.lower():
                matching_documents.append(document)
        return matching_documents

    # Optional: Provide a more efficient native implementation by overriding
    # _aget_relevant_documents
    # async def _aget_relevant_documents(
    #     self, query: str, *, run_manager: AsyncCallbackManagerForRetrieverRun
    # ) -> List[Document]:
    #     """Asynchronously get documents relevant to a query.

    #     Args:
    #         query: String to find relevant documents for
    #         run_manager: The callbacks handler to use

    #     Returns:
    #         List of relevant documents
    #     """
```

## 테스트 🧪

```python
documents = [
    Document(
        page_content="Dogs are great companions, known for their loyalty and friendliness.",
        metadata={"type": "dog", "trait": "loyalty"},
    ),
    Document(
        page_content="Cats are independent pets that often enjoy their own space.",
        metadata={"type": "cat", "trait": "independence"},
    ),
    Document(
        page_content="Goldfish are popular pets for beginners, requiring relatively simple care.",
        metadata={"type": "fish", "trait": "low maintenance"},
    ),
    Document(
        page_content="Parrots are intelligent birds capable of mimicking human speech.",
        metadata={"type": "bird", "trait": "intelligence"},
    ),
    Document(
        page_content="Rabbits are social animals that need plenty of space to hop around.",
        metadata={"type": "rabbit", "trait": "social"},
    ),
]
retriever = ToyRetriever(documents=documents, k=3)
```

```python
retriever.invoke("that")
```

```output
[Document(page_content='Cats are independent pets that often enjoy their own space.', metadata={'type': 'cat', 'trait': 'independence'}),
 Document(page_content='Rabbits are social animals that need plenty of space to hop around.', metadata={'type': 'rabbit', 'trait': 'social'})]
```

이것은 **runnable**이므로 표준 Runnable 인터페이스의 이점을 누릴 수 있습니다! 🤩

```python
await retriever.ainvoke("that")
```

```output
[Document(page_content='Cats are independent pets that often enjoy their own space.', metadata={'type': 'cat', 'trait': 'independence'}),
 Document(page_content='Rabbits are social animals that need plenty of space to hop around.', metadata={'type': 'rabbit', 'trait': 'social'})]
```

```python
retriever.batch(["dog", "cat"])
```

```output
[[Document(page_content='Dogs are great companions, known for their loyalty and friendliness.', metadata={'type': 'dog', 'trait': 'loyalty'})],
 [Document(page_content='Cats are independent pets that often enjoy their own space.', metadata={'type': 'cat', 'trait': 'independence'})]]
```

```python
async for event in retriever.astream_events("bar", version="v1"):
    print(event)
```

```output
{'event': 'on_retriever_start', 'run_id': 'f96f268d-8383-4921-b175-ca583924d9ff', 'name': 'ToyRetriever', 'tags': [], 'metadata': {}, 'data': {'input': 'bar'}}
{'event': 'on_retriever_stream', 'run_id': 'f96f268d-8383-4921-b175-ca583924d9ff', 'tags': [], 'metadata': {}, 'name': 'ToyRetriever', 'data': {'chunk': []}}
{'event': 'on_retriever_end', 'name': 'ToyRetriever', 'run_id': 'f96f268d-8383-4921-b175-ca583924d9ff', 'tags': [], 'metadata': {}, 'data': {'output': []}}
```

## 기여

재미있는 리트리버에 대한 기여를 환영합니다!

기여를 LangChain에 추가하는 데 도움이 되도록 다음 체크리스트를 따르세요:

문서화:

* 리트리버에는 모든 초기화 인수에 대한 문서 문자열이 포함되어 있으며, 이는 [API 참조](https://api.python.langchain.com/en/stable/langchain_api_reference.html)에 표시됩니다.
* 모델의 문서 문자열에는 리트리버에 사용되는 관련 API에 대한 링크가 포함되어 있습니다(예: 리트리버가 Wikipedia에서 검색하는 경우 Wikipedia API에 대한 링크).

테스트:

* [ ] `invoke`와 `ainvoke`가 작동하는지 확인하는 단위 또는 통합 테스트를 추가합니다.

최적화:

리트리버가 외부 데이터 소스(예: API 또는 파일)에 연결하는 경우 거의 확실히 비동기 네이티브 최적화의 이점을 받을 수 있습니다!

* [ ] `_aget_relevant_documents`(`ainvoke`에 사용됨)의 네이티브 비동기 구현을 제공합니다.
