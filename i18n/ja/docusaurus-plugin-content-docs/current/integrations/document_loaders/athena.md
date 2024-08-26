---
translated: true
---

# Athena

>[Amazon Athena](https://aws.amazon.com/athena/) は、オープンソースのフレームワークをベースにした、サーバーレスのインタラクティブな分析サービスです。オープンテーブルとファイル形式をサポートしています。`Athena` は、データが保存されている場所で、ペタバイトのデータを簡単かつ柔軟に分析できるようにしています。Amazon Simple Storage Service (S3) のデータレイクや30のデータソース(オンプレミスのデータソースや他のクラウドシステムを含む)から、SQL やPythonを使ってデータを分析したり、アプリケーションを構築したりできます。`Athena` は、プロビジョニングや設定の手間なしに、オープンソースの `Trino` と `Presto` エンジン、および `Apache Spark` フレームワークを活用しています。

このノートブックでは、`AWS Athena` からドキュメントをロードする方法について説明します。

## 設定

[AWS アカウントの設定手順](https://docs.aws.amazon.com/athena/latest/ug/setting-up.html)に従ってください。

Pythonライブラリをインストールします:

```python
! pip install boto3
```

## 例

```python
from langchain_community.document_loaders.athena import AthenaLoader
```

```python
database_name = "my_database"
s3_output_path = "s3://my_bucket/query_results/"
query = "SELECT * FROM my_table"
profile_name = "my_profile"

loader = AthenaLoader(
    query=query,
    database=database_name,
    s3_output_uri=s3_output_path,
    profile_name=profile_name,
)

documents = loader.load()
print(documents)
```

メタデータ列を含む例

```python
database_name = "my_database"
s3_output_path = "s3://my_bucket/query_results/"
query = "SELECT * FROM my_table"
profile_name = "my_profile"
metadata_columns = ["_row", "_created_at"]

loader = AthenaLoader(
    query=query,
    database=database_name,
    s3_output_uri=s3_output_path,
    profile_name=profile_name,
    metadata_columns=metadata_columns,
)

documents = loader.load()
print(documents)
```
