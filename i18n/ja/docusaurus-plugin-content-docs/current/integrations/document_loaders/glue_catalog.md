---
translated: true
---

# Glue Catalog

[AWS Glue Data Catalog](https://docs.aws.amazon.com/en_en/glue/latest/dg/catalog-and-crawler.html)は、AWS内のデータを管理、アクセス、共有するための中央集中型のメタデータリポジトリです。様々なAWSサービスやアプリケーションが効率的にデータにアクセスできるよう、データアセットのメタデータを管理します。

AWS Glueでデータソース、変換、ターゲットを定義すると、これらの要素のメタデータがData Catalogに保存されます。これには、データの場所、スキーマ定義、ランタイムメトリクスなどの情報が含まれます。Amazon S3、Amazon RDS、Amazon Redshift、JDBC互換の外部データベースなど、様々なデータストアタイプをサポートしています。また、Amazon Athena、Amazon Redshift Spectrum、Amazon EMRと直接統合されているため、これらのサービスがデータに直接アクセスして照会できます。

Langchain GlueCatalogLoaderを使うと、指定したGlueデータベース内のすべてのテーブルのスキーマをPandas dtypeと同じ形式で取得できます。

## 設定

- [AWS アカウントの設定手順](https://docs.aws.amazon.com/athena/latest/ug/setting-up.html)に従ってください。
- boto3ライブラリをインストールします: `pip install boto3`

## 例

```python
from langchain_community.document_loaders.glue_catalog import GlueCatalogLoader
```

```python
database_name = "my_database"
profile_name = "my_profile"

loader = GlueCatalogLoader(
    database=database_name,
    profile_name=profile_name,
)

schemas = loader.load()
print(schemas)
```

## テーブルフィルタリングの例

テーブルフィルタリングを使うと、Glueデータベース内の特定のテーブルのスキーマ情報のみを取得できます。すべてのテーブルのスキーマを読み込む代わりに、`table_filter`引数を使ってアクセスするテーブルを指定できます。

```python
from langchain_community.document_loaders.glue_catalog import GlueCatalogLoader
```

```python
database_name = "my_database"
profile_name = "my_profile"
table_filter = ["table1", "table2", "table3"]

loader = GlueCatalogLoader(
    database=database_name, profile_name=profile_name, table_filter=table_filter
)

schemas = loader.load()
print(schemas)
```
