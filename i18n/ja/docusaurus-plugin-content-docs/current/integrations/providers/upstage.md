---
translated: true
---

# Upstage

[Upstage](https://upstage.ai)は、LLMコンポーネントの人間以上のパフォーマンスを提供する、人工知能(AI)の先導的企業です。

## Solar LLM

**Solar Mini Chat**は、英語と韓国語に特化した高速で強力な高度な大規模言語モデルです。マルチターンの会話や、RAG(Retrieval-Augmented Generation)のようなロングコンテキストを必要とするタスクなど、幅広い自然言語処理タスクでの性能が向上するよう特別に微調整されています。この微調整により、より長い会話を効果的に処理する能力が備わり、対話型アプリケーションに特に適しています。

Solarの他にも、Upstageは**Groundedness Check**と**Layout Analysis**などの、実世界のRAG(retrieval-augmented generation)機能も提供しています。

## インストールとセットアップ

`langchain-upstage`パッケージをインストールします:

```bash
pip install -qU langchain-core langchain-upstage
```

[API Keys](https://console.upstage.ai)を取得し、環境変数`UPSTAGE_API_KEY`を設定します。

## Upstage LangChainインテグレーション

| API | 説明 | インポート | 使用例 |
| --- | --- | --- | --- |
| Chat | Solar Mini Chatを使ってアシスタントを構築 | `from langchain_upstage import ChatUpstage` | [Go](../../chat/upstage) |
| Text Embedding | 文字列をベクトルにエンベディング | `from langchain_upstage import UpstageEmbeddings` | [Go](../../text_embedding/upstage) |
| Groundedness Check | アシスタントの応答の信頼性を検証 | `from langchain_upstage import UpstageGroundednessCheck` | [Go](../../tools/upstage_groundedness_check) |
| Layout Analysis | テーブルや図を含む文書をシリアライズ | `from langchain_upstage import UpstageLayoutAnalysisLoader` | [Go](../../document_loaders/upstage) |

詳細については[ドキュメンテーション](https://developers.upstage.ai/)を参照してください。

## クイックサンプル

### 環境設定

```python
import os

os.environ["UPSTAGE_API_KEY"] = "YOUR_API_KEY"
```

### チャット

```python
from langchain_upstage import ChatUpstage

chat = ChatUpstage()
response = chat.invoke("Hello, how are you?")
print(response)
```

### テキストエンベディング

```python
from langchain_upstage import UpstageEmbeddings

embeddings = UpstageEmbeddings()
doc_result = embeddings.embed_documents(
    ["Sam is a teacher.", "This is another document"]
)
print(doc_result)

query_result = embeddings.embed_query("What does Sam do?")
print(query_result)
```

### Groundedness Check

```python
from langchain_upstage import UpstageGroundednessCheck

groundedness_check = UpstageGroundednessCheck()

request_input = {
    "context": "Mauna Kea is an inactive volcano on the island of Hawaii. Its peak is 4,207.3 m above sea level, making it the highest point in Hawaii and second-highest peak of an island on Earth.",
    "answer": "Mauna Kea is 5,207.3 meters tall.",
}
response = groundedness_check.invoke(request_input)
print(response)
```

### レイアウト分析

```python
from langchain_upstage import UpstageLayoutAnalysisLoader

file_path = "/PATH/TO/YOUR/FILE.pdf"
layzer = UpstageLayoutAnalysisLoader(file_path, split="page")

# For improved memory efficiency, consider using the lazy_load method to load documents page by page.
docs = layzer.load()  # or layzer.lazy_load()

for doc in docs[:3]:
    print(doc)
```
