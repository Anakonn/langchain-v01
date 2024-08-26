---
translated: true
---

# Oracle Autonomous Database

Oracle 自律データベースは、機械学習を使ってデータベースのチューニング、セキュリティ、バックアップ、更新、およびその他のルーティンの管理タスクを自動化するクラウドデータベースです。

このノートブックでは、Oracle 自律データベースからドキュメントをロードする方法を説明します。ローダーは、接続文字列または TNS 構成を使っての接続をサポートしています。

## 前提条件

1. データベースが 'Thin' モードで実行されていること:
   https://python-oracledb.readthedocs.io/en/latest/user_guide/appendix_b.html
2. `pip install oracledb`:
   https://python-oracledb.readthedocs.io/en/latest/user_guide/installation.html

## 手順

```python
pip install oracledb
```

```python
from langchain_community.document_loaders import OracleAutonomousDatabaseLoader
from settings import s
```

相互 TLS 認証 (mTLS) を使う場合は、wallet_location と wallet_password が接続を作成するために必要です。ユーザーは、接続文字列または TNS 構成の詳細を提供することで接続を作成できます。

```python
SQL_QUERY = "select prod_id, time_id from sh.costs fetch first 5 rows only"

doc_loader_1 = OracleAutonomousDatabaseLoader(
    query=SQL_QUERY,
    user=s.USERNAME,
    password=s.PASSWORD,
    schema=s.SCHEMA,
    config_dir=s.CONFIG_DIR,
    wallet_location=s.WALLET_LOCATION,
    wallet_password=s.PASSWORD,
    tns_name=s.TNS_NAME,
)
doc_1 = doc_loader_1.load()

doc_loader_2 = OracleAutonomousDatabaseLoader(
    query=SQL_QUERY,
    user=s.USERNAME,
    password=s.PASSWORD,
    schema=s.SCHEMA,
    connection_string=s.CONNECTION_STRING,
    wallet_location=s.WALLET_LOCATION,
    wallet_password=s.PASSWORD,
)
doc_2 = doc_loader_2.load()
```

TLS 認証を使う場合は、wallet_location と wallet_password は必要ありません。

```python
doc_loader_3 = OracleAutonomousDatabaseLoader(
    query=SQL_QUERY,
    user=s.USERNAME,
    password=s.PASSWORD,
    schema=s.SCHEMA,
    config_dir=s.CONFIG_DIR,
    tns_name=s.TNS_NAME,
)
doc_3 = doc_loader_3.load()

doc_loader_4 = OracleAutonomousDatabaseLoader(
    query=SQL_QUERY,
    user=s.USERNAME,
    password=s.PASSWORD,
    schema=s.SCHEMA,
    connection_string=s.CONNECTION_STRING,
)
doc_4 = doc_loader_4.load()
```
