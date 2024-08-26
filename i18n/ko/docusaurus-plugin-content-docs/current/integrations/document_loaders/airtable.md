---
translated: true
---

# Airtable

## 설치

먼저 `pyairtable` 패키지를 설치합니다.

```python
%pip install --upgrade --quiet  pyairtable
```

## 문서 로드

Airtable 데이터를 LangChain 문서로 로드하기 위해 `AirtableLoader`를 사용합니다.

```python
from langchain_community.document_loaders import AirtableLoader
```

### API 키와 베이스 ID, 테이블 ID 가져오기

1. [여기](https://support.airtable.com/docs/creating-and-using-api-keys-and-access-tokens)에서 API 키를 가져옵니다.
2. [여기](https://airtable.com/developers/web/api/introduction)에서 베이스 ID를 가져옵니다.
3. [여기](https://www.highviewapps.com/kb/where-can-i-find-the-airtable-base-id-and-table-id/#:~:text=Both%20the%20Airtable%20Base%20ID,URL%20that%20begins%20with%20tbl)에서 설명된 대로 테이블 URL에서 테이블 ID를 가져옵니다.

### 예시 코드

API 키, 베이스 ID, 테이블 ID를 설정합니다.

```python
api_key = "xxx"
base_id = "xxx"
table_id = "xxx"
```

`AirtableLoader`를 초기화하고 데이터를 로드합니다.

```python
loader = AirtableLoader(api_key, table_id, base_id)
docs = loader.load()
```

각 테이블 행을 `dict` 형식으로 반환합니다.

```python
len(docs)
```

```output
3
```

첫 번째 문서의 내용을 확인합니다.

```python
eval(docs[0].page_content)
```

```output
{'id': 'recF3GbGZCuh9sXIQ',
 'createdTime': '2023-06-09T04:47:21.000Z',
 'fields': {'Priority': 'High',
  'Status': 'In progress',
  'Name': 'Document Splitters'}}
```

