---
translated: true
---

# Breebs (オープンナレッジ)

>[Breebs](https://www.breebs.com/)はオープンコラボレーティブな知識プラットフォームです。
>誰でも`Breeb`を作成できます。`Breeb`とは、Google Driveのフォルダに保存されたPDFに基づいた知識カプセルです。
>`Breeb`は、LLM/チャットボットがその専門知識を向上させ、幻覚を減らし、情報源にアクセスするために使用できます。
>裏側では、`Breebs`は`Retrieval Augmented Generation (RAG)`モデルを実装しており、
>各反復で有用なコンテキストを seamlessly に提供します。

## Retriever

```python
from langchain.retrievers import BreebsRetriever
```

[使用例を参照してください (Retrieval & ConversationalRetrievalChain)](/docs/integrations/retrievers/breebs)
