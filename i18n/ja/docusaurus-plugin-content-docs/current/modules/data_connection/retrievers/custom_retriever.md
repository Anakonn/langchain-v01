---
title: カスタムリトリーバー
translated: true
---

# カスタムリトリーバー

## 概要

多くのLLMアプリケーションでは、`Retriever`を使用して外部データソースから情報を取得します。

リトリーバーは、ユーザーの`クエリ`に関連する`Document`のリストを取得する責任があります。

取得したドキュメントは、LLMに入力されるプロンプトにフォーマットされ、LLMはそれらの情報を使用して適切な応答を生成できるようになります(例えば、ナレッジベースに基づいてユーザーの質問に答えるなど)。

## インターフェース

独自のリトリーバーを作成するには、`BaseRetriever`クラスを拡張し、次のメソッドを実装する必要があります:

| メソッド                        | 説明                                      | 必須/オプション |
|--------------------------------|--------------------------------------------------|-------------------|
| `_get_relevant_documents`      | クエリに関連するドキュメントを取得する。               | 必須          |
| `_aget_relevant_documents`     | 非同期ネイティブサポートを提供するために実装する。       | オプション          |

`_get_relevant_documents`内のロジックには、データベースへの任意の呼び出しやリクエストを使用したWebへのアクセスが含まれる可能性があります。

:::tip
`BaseRetriever`を継承することで、リトリーバーは自動的にLangChain [Runnable](/docs/expression_language/interface)になり、標準の`Runnable`機能を自動的に得られます!
:::

:::info
`RunnableLambda`または`RunnableGenerator`を使用してリトリーバーを実装できます。

`BaseRetriever`と`RunnableLambda`(カスタム[実行可能関数](/docs/expression_language/primitives/functions))を実装する主な違いは、`BaseRetriever`は既知のLangChainエンティティであるため、一部のモニタリングツールが特別な動作を実装する可能性があることです。もう1つの違いは、`BaseRetriever`は`RunnableLambda`とは少し異なる動作をする可能性があることです。例えば、`astream_events` APIの`start`イベントは`on_retriever_start`ではなく`on_chain_start`になります。
:::

## 例

ユーザークエリのテキストを含むすべてのドキュメントを返す、おもちゃのようなリトリーバーを実装しましょう。

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

## テストしてみよう 🧪

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

これは**実行可能**なので、標準の実行可能インターフェースの恩恵を受けられます! 🤩

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

## 貢献

興味深いリトリーバーの貢献を歓迎します!

LangChainに追加されるようにするには、次のチェックリストに従ってください:

ドキュメンテーション:

* リトリーバーには、初期化引数のドキュメントストリングが含まれている必要があります。これらは[APIリファレンス](https://api.python.langchain.com/en/stable/langchain_api_reference.html)に表示されます。
* モデルのクラスドキュメントストリングには、リトリーバーが使用する関連APIへのリンクが含まれている必要があります(例えば、リトリーバーがWikipediaから取得する場合は、WikipediaのAPIにリンクすると良いでしょう)。

テスト:

* [ ] `invoke`と`ainvoke`が正しく動作することを確認するためのユニットまたは統合テストを追加してください。

最適化:

リトリーバーが外部データソース(APIやファイルなど)に接続する場合、ほぼ確実に非同期ネイティブ最適化の恩恵を受けられます!

* [ ] `_aget_relevant_documents`(`ainvoke`で使用される)の非同期ネイティブ実装を提供してください。
