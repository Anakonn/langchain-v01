---
translated: true
---

# 오라클 자율 데이터베이스

오라클 자율 데이터베이스는 기계 학습을 사용하여 데이터베이스 튜닝, 보안, 백업, 업데이트 및 DBA가 전통적으로 수행하는 기타 일상적인 관리 작업을 자동화하는 클라우드 데이터베이스입니다.

이 노트북에서는 오라클 자율 데이터베이스에서 문서를 로드하는 방법을 다룹니다. 로더는 연결 문자열 또는 TNS 구성을 사용하여 연결을 지원합니다.

## 전제 조건

1. 데이터베이스가 'Thin' 모드에서 실행됩니다:
   https://python-oracledb.readthedocs.io/en/latest/user_guide/appendix_b.html
2. `pip install oracledb`:
   https://python-oracledb.readthedocs.io/en/latest/user_guide/installation.html

## 지침

```python
pip install oracledb
```

```python
from langchain_community.document_loaders import OracleAutonomousDatabaseLoader
from settings import s
```

상호 TLS 인증(mTLS)을 사용하는 경우 wallet_location과 wallet_password가 연결을 생성하는 데 필요합니다. 사용자는 연결 문자열 또는 TNS 구성 세부 정보를 제공하여 연결을 생성할 수 있습니다.

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

TLS 인증을 사용하는 경우 wallet_location과 wallet_password가 필요하지 않습니다.

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
