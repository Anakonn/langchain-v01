---
translated: true
---

# 데이터헤럴드

이 노트북은 데이터헤럴드 구성 요소의 사용 방법을 설명합니다.

먼저 데이터헤럴드 계정을 설정하고 API 키를 받아야 합니다:

1. 데이터헤럴드 웹사이트에서 [여기](https://www.dataherald.com/)에서 가입하세요
2. 관리자 콘솔에 로그인하면 API 키를 생성할 수 있습니다
3. pip install dataherald

그런 다음 환경 변수를 설정해야 합니다:
1. API 키를 DATAHERALD_API_KEY 환경 변수에 저장하세요

```python
pip install dataherald
```

```python
import os

os.environ["DATAHERALD_API_KEY"] = ""
```

```python
from langchain_community.utilities.dataherald import DataheraldAPIWrapper
```

```python
dataherald = DataheraldAPIWrapper(db_connection_id="65fb766367dd22c99ce1a12d")
```

```python
dataherald.run("How many employees are in the company?")
```

```output
'select COUNT(*) from employees'
```
