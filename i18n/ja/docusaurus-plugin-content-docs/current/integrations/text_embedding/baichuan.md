---
translated: true
---

# Baichuan Text Embeddings

本日(2024年1月25日)、BaichuanTextEmbeddingsは、C-MTEB(Chinese Multi-Task Embedding Benchmark)のリーダーボードで1位を獲得しています。

リーダーボード(全体 -> 中国語セクション): https://huggingface.co/spaces/mteb/leaderboard

公式ウェブサイト: https://platform.baichuan-ai.com/docs/text-Embedding

このエンベディングモデルを使用するには、APIキーが必要です。https://platform.baichuan-ai.com/docs/text-Embeddingでの登録により、APIキーを取得できます。

BaichuanTextEmbeddingsは512トークンウィンドウをサポートし、1024次元のベクトルを生成します。

BaichuanTextEmbeddingsは中国語テキストエンベディングのみをサポートしていることにご注意ください。多言語サポートは近日中に提供される予定です。

```python
from langchain_community.embeddings import BaichuanTextEmbeddings

embeddings = BaichuanTextEmbeddings(baichuan_api_key="sk-*")
```

また、次のように方法でAPIキーを設定することもできます:

```python
import os

os.environ["BAICHUAN_API_KEY"] = "YOUR_API_KEY"
```

```python
text_1 = "今天天气不错"
text_2 = "今天阳光很好"

query_result = embeddings.embed_query(text_1)
query_result
```

```python
doc_result = embeddings.embed_documents([text_1, text_2])
doc_result
```
