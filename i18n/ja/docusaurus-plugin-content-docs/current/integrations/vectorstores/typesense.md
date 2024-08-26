---
translated: true
---

# Typesense

> [Typesense](https://typesense.org) はオープンソースのインメモリ検索エンジンであり、[セルフホスト](https://typesense.org/docs/guide/install-typesense#option-2-local-machine-self-hosting)するか、[Typesense Cloud](https://cloud.typesense.org/)で実行できます。
>
> Typesenseは、インデックス全体をRAMに保存（ディスクにバックアップ付き）することでパフォーマンスに焦点を当て、利用可能なオプションを簡素化し、適切なデフォルト設定を行うことで、すぐに使える開発者体験を提供することにも注力しています。
>
> また、属性ベースのフィルタリングをベクトルクエリと組み合わせて、最も関連性の高いドキュメントを取得することもできます。

このノートブックでは、VectorStoreとしてTypesenseを使用する方法を示します。

まず、依存関係をインストールしましょう：

```python
%pip install --upgrade --quiet  typesense openapi-schema-pydantic langchain-openai tiktoken
```

`OpenAIEmbeddings` を使用したいので、OpenAI APIキーを取得する必要があります。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Typesense
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

テストデータセットをインポートしましょう：

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
docsearch = Typesense.from_documents(
    docs,
    embeddings,
    typesense_client_params={
        "host": "localhost",  # Use xxx.a1.typesense.net for Typesense Cloud
        "port": "8108",  # Use 443 for Typesense Cloud
        "protocol": "http",  # Use https for Typesense Cloud
        "typesense_api_key": "xyz",
        "typesense_collection_name": "lang-chain",
    },
)
```

## 類似検索

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = docsearch.similarity_search(query)
```

```python
print(found_docs[0].page_content)
```

## レトリーバーとしてのTypesense

Typesenseは、他のすべてのベクトルストアと同様に、コサイン類似度を使用するLangChainレトリーバーです。

```python
retriever = docsearch.as_retriever()
retriever
```

```python
query = "What did the president say about Ketanji Brown Jackson"
retriever.invoke(query)[0]
```
