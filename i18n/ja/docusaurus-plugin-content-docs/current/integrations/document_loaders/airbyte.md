---
translated: true
---

# AirbyteLoader

>[Airbyte](https://github.com/airbytehq/airbyte) は、API、データベース、ファイルからデータウェアハウスやレイクへのELTパイプラインのためのデータ統合プラットフォームです。データウェアハウスやデータベースへのELTコネクタのカタログが最も大きいです。

これは、AirbyteからLangChainドキュメントにどのようにデータをロードするかを説明しています。

## インストール

`AirbyteLoader`を使用するには、`langchain-airbyte`統合パッケージをインストールする必要があります。

```python
% pip install -qU langchain-airbyte
```

注意: 現在、`airbyte`ライブラリはPydantic v2をサポートしていません。
このパッケージを使用するには、Pydantic v1にダウングレードしてください。

注意: このパッケージは現在、Python 3.10+を要求します。

## ドキュメントのロード

デフォルトでは、`AirbyteLoader`は構造化データをストリームからロードし、YAML形式のドキュメントを出力します。

```python
from langchain_airbyte import AirbyteLoader

loader = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 10},
)
docs = loader.load()
print(docs[0].page_content[:500])
```

```yaml
academic_degree: PhD
address:
  city: Lauderdale Lakes
  country_code: FI
  postal_code: '75466'
  province: New Jersey
  state: Hawaii
  street_name: Stoneyford
  street_number: '1112'
age: 44
blood_type: "O\u2212"
created_at: '2004-04-02T13:05:27+00:00'
email: bread2099+1@outlook.com
gender: Fluid
height: '1.62'
id: 1
language: Belarusian
name: Moses
nationality: Dutch
occupation: Track Worker
telephone: 1-467-194-2318
title: M.Sc.Tech.
updated_at: '2024-02-27T16:41:01+00:00'
weight: 6
```

ドキュメントの書式設定用のカスタムプロンプトテンプレートを指定することもできます:

```python
from langchain_core.prompts import PromptTemplate

loader_templated = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 10},
    template=PromptTemplate.from_template(
        "My name is {name} and I am {height} meters tall."
    ),
)
docs_templated = loader_templated.load()
print(docs_templated[0].page_content)
```

```output
My name is Verdie and I am 1.73 meters tall.
```

## 遅延ロードドキュメント

`AirbyteLoader`の強力な機能の1つは、上流のソースから大きなドキュメントをロードできることです。大規模なデータセットを扱う場合、デフォルトの`.load()`動作は遅く、メモリ集約的になる可能性があります。これを避けるには、メモリ効率の良い方法で文書をロードするために`.lazy_load()`メソッドを使用できます。

```python
import time

loader = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 3},
    template=PromptTemplate.from_template(
        "My name is {name} and I am {height} meters tall."
    ),
)

start_time = time.time()
my_iterator = loader.lazy_load()
print(
    f"Just calling lazy load is quick! This took {time.time() - start_time:.4f} seconds"
)
```

```output
Just calling lazy load is quick! This took 0.0001 seconds
```

そして、生成されるドキュメントを反復処理できます:

```python
for doc in my_iterator:
    print(doc.page_content)
```

```output
My name is Andera and I am 1.91 meters tall.
My name is Jody and I am 1.85 meters tall.
My name is Zonia and I am 1.53 meters tall.
```

非同期的にドキュメントを遅延ロードすることもできます。`.alazy_load()`を使用します:

```python
loader = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 3},
    template=PromptTemplate.from_template(
        "My name is {name} and I am {height} meters tall."
    ),
)

my_async_iterator = loader.alazy_load()

async for doc in my_async_iterator:
    print(doc.page_content)
```

```output
My name is Carmelina and I am 1.74 meters tall.
My name is Ali and I am 1.90 meters tall.
My name is Rochell and I am 1.83 meters tall.
```

## 設定

`AirbyteLoader`は次のオプションで設定できます:

- `source` (str, 必須): ロードするAirbyteソースの名前。
- `stream` (str, 必須): ロードするストリームの名前(Airbyteソースは複数のストリームを返す可能性がある)
- `config` (dict, 必須): Airbyteソースの設定
- `template` (PromptTemplate, オプション): ドキュメントの書式設定用のカスタムプロンプトテンプレート
- `include_metadata` (bool, オプション, デフォルトTrue): 出力ドキュメントにすべてのフィールドをメタデータとして含めるかどうか

ほとんどの設定は`config`にあり、各ソースの[Airbyteドキュメンテーション](https://docs.airbyte.com/integrations/)の"設定フィールドリファレンス"で特定の設定オプションを見つけることができます。
