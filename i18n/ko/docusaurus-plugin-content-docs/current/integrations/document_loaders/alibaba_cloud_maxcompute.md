---
translated: true
---

# Alibaba Cloud MaxCompute

> [Alibaba Cloud MaxCompute](https://www.alibabacloud.com/product/maxcompute) (previously known as ODPS) is a general purpose, fully managed, multi-tenancy data processing platform for large-scale data warehousing. MaxCompute supports various data importing solutions and distributed computing models, enabling users to effectively query massive datasets, reduce production costs, and ensure data security.

The `MaxComputeLoader` lets you execute a MaxCompute SQL query and loads the results as one document per row.

## 설치

먼저 `pyodps` 패키지를 설치합니다.

```python
%pip install --upgrade --quiet  pyodps
```

## 기본 사용법

`MaxComputeLoader`를 인스턴스화하려면 실행할 SQL 쿼리, MaxCompute 엔드포인트와 프로젝트 이름, 그리고 접근 ID와 비밀 접근 키가 필요합니다. 접근 ID와 비밀 접근 키는 `access_id`와 `secret_access_key` 매개변수를 통해 직접 전달할 수 있으며, 또는 환경 변수 `MAX_COMPUTE_ACCESS_ID`와 `MAX_COMPUTE_SECRET_ACCESS_KEY`로 설정할 수 있습니다.

```python
from langchain_community.document_loaders import MaxComputeLoader
```

예시 쿼리를 정의합니다.

```python
base_query = """
SELECT *
FROM (
    SELECT 1 AS id, 'content1' AS content, 'meta_info1' AS meta_info
    UNION ALL
    SELECT 2 AS id, 'content2' AS content, 'meta_info2' AS meta_info
    UNION ALL
    SELECT 3 AS id, 'content3' AS content, 'meta_info3' AS meta_info
) mydata;
"""
```

엔드포인트와 프로젝트 이름, 접근 ID와 비밀 접근 키를 설정합니다.

```python
endpoint = "<ENDPOINT>"
project = "<PROJECT>"
ACCESS_ID = "<ACCESS ID>"
SECRET_ACCESS_KEY = "<SECRET ACCESS KEY>"
```

`MaxComputeLoader`를 초기화하고 데이터를 로드합니다.

```python
loader = MaxComputeLoader.from_params(
    base_query,
    endpoint,
    project,
    access_id=ACCESS_ID,
    secret_access_key=SECRET_ACCESS_KEY,
)
data = loader.load()
```

로드된 데이터를 출력합니다.

```python
print(data)
```

```output
[Document(page_content='id: 1\ncontent: content1\nmeta_info: meta_info1', metadata={}), Document(page_content='id: 2\ncontent: content2\nmeta_info: meta_info2', metadata={}), Document(page_content='id: 3\ncontent: content3\nmeta_info: meta_info3', metadata={})]
```

각 문서의 내용을 출력합니다.

```python
print(data[0].page_content)
```

```output
id: 1
content: content1
meta_info: meta_info1
```

각 문서의 메타데이터를 출력합니다.

```python
print(data[0].metadata)
```

```output
{}
```

## 내용 및 메타데이터 열 지정

`page_content_columns`와 `metadata_columns` 매개변수를 사용하여 문서의 내용과 메타데이터로 로드할 열의 부분 집합을 구성할 수 있습니다.

```python
loader = MaxComputeLoader.from_params(
    base_query,
    endpoint,
    project,
    page_content_columns=["content"],  # Specify Document page content
    metadata_columns=["id", "meta_info"],  # Specify Document metadata
    access_id=ACCESS_ID,
    secret_access_key=SECRET_ACCESS_KEY,
)
data = loader.load()
```

변경된 설정으로 로드된 데이터의 내용을 출력합니다.

```python
print(data[0].page_content)
```

```output
content: content1
```

변경된 설정으로 로드된 데이터의 메타데이터를 출력합니다.

```python
print(data[0].metadata)
```

```output
{'id': 1, 'meta_info': 'meta_info1'}
```

