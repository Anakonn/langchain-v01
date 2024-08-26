---
translated: true
---

# Mojeek 검색

다음 노트북은 Mojeek 검색을 사용하여 결과를 얻는 방법을 설명합니다. [Mojeek 웹사이트](https://www.mojeek.com/services/search/web-search-api/)에서 API 키를 얻으시기 바랍니다.

```python
from langchain_community.tools import MojeekSearch
```

```python
api_key = "KEY"  # obtained from Mojeek Website
```

```python
search = MojeekSearch.config(api_key=api_key, search_kwargs={"t": 10})
```

`search_kwargs`에서 [Mojeek 문서](https://www.mojeek.com/support/api/search/request_parameters.html)에서 찾을 수 있는 모든 검색 매개변수를 추가할 수 있습니다.

```python
search.run("mojeek")
```
