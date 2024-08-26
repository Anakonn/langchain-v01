---
translated: true
---

# Athena

>[Amazon Athena](https://aws.amazon.com/athena/)는 오픈 소스 프레임워크를 기반으로 하는 서버리스 대화형 분석 서비스입니다. `Athena`는 데이터가 저장된 위치에서 간단하고 유연한 방식으로 페타바이트 규모의 데이터를 분석할 수 있습니다. Amazon Simple Storage Service (S3) 데이터 레이크와 온-프레미스 데이터 소스 또는 다른 클라우드 시스템을 포함한 30개의 데이터 소스에서 SQL 또는 Python을 사용하여 데이터를 분석하거나 애플리케이션을 구축할 수 있습니다. `Athena`는 프로비저닝 또는 구성 작업 없이 오픈 소스 `Trino`, `Presto` 엔진 및 `Apache Spark` 프레임워크를 기반으로 구축되었습니다.
이 노트북에서는 `AWS Athena`에서 문서를 로드하는 방법을 설명합니다.

## 설정하기

[AWS 계정 설정 지침](https://docs.aws.amazon.com/athena/latest/ug/setting-up.html)을 따르세요.
Python 라이브러리를 설치하세요:

```python
! pip install boto3
```

## 예시

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

메타데이터 열이 있는 예시

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

