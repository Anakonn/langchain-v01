---
translated: true
---

# PremAI

>[PremAI](https://app.premai.io)は、ユーザーエクスペリエンスと全体的な成長に集中できるように、最小限の労力で強力な本番稼働GenAIアプリケーションを構築できるようにする統一されたプラットフォームです。このセクションでは、`PremAIEmbeddings`を使用して、さまざまな埋め込みモデルにアクセスする方法について説明します。

## インストールとセットアップ

まずは、langchainとpremai-sdkをインストールします。次のコマンドを入力してインストールできます:

```bash
pip install premai langchain
```

さらに進める前に、Premにアカウントを作成し、プロジェクトを開始していることを確認してください。まだの場合は、無料で始める方法は次のとおりです:

1. [PremAI](https://app.premai.io/accounts/login/)にサインインし、[ここ](https://app.premai.io/api_keys/)でAPIキーを作成します。

2. [app.premai.io](https://app.premai.io)に移動すると、プロジェクトのダッシュボードに移動します。

3. プロジェクトを作成すると、プロジェクトIDが生成されます(IDとして記述されます)。このIDを使用して、デプロイされたアプリケーションと対話できます。

Premでの最初のデプロイアプリケーションの作成おめでとうございます🎉 now we can use langchain to interact with our application.

```python
# Let's start by doing some imports and define our embedding object

from langchain_community.embeddings import PremAIEmbeddings
```

必要なモジュールをインポートしたら、クライアントを設定しましょう。今のところ、`project_id`が8であると仮定しましょう。ただし、必ずご自身のproject-idを使用してください。そうしないと、エラーが発生します。

```python
import getpass
import os

if os.environ.get("PREMAI_API_KEY") is None:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")
```

```python
model = "text-embedding-3-large"
embedder = PremAIEmbeddings(project_id=8, model=model)
```

埋め込みモデルを定義しました。多くの埋め込みモデルをサポートしています。サポートしている埋め込みモデルの一覧は次のとおりです。

| プロバイダ  | スラグ                                     | コンテキストトークン |
|-------------|------------------------------------------|----------------|
| cohere      | embed-english-v3.0                       | N/A            |
| openai      | text-embedding-3-small                   | 8191           |
| openai      | text-embedding-3-large                   | 8191           |
| openai      | text-embedding-ada-002                   | 8191           |
| replicate   | replicate/all-mpnet-base-v2              | N/A            |
| together    | togethercomputer/Llama-2-7B-32K-Instruct | N/A            |
| mistralai   | mistral-embed                            | 4096           |

モデルを変更するには、`slug`をコピーして、埋め込みモデルにアクセスするだけです。では、単一のクエリに続いて複数のクエリ(ドキュメントとも呼ばれます)を使用して、埋め込みモデルの使用を開始しましょう。

```python
query = "Hello, this is a test query"
query_result = embedder.embed_query(query)

# Let's print the first five elements of the query embedding vector

print(query_result[:5])
```

```output
[-0.02129288576543331, 0.0008162345038726926, -0.004556538071483374, 0.02918623760342598, -0.02547479420900345]
```

最後に、ドキュメントを埋め込みましょう。

```python
documents = ["This is document1", "This is document2", "This is document3"]

doc_result = embedder.embed_documents(documents)

# Similar to previous result, let's print the first five element
# of the first document vector

print(doc_result[0][:5])
```

```output
[-0.0030691148713231087, -0.045334383845329285, -0.0161729846149683, 0.04348714277148247, -0.0036920777056366205]
```
