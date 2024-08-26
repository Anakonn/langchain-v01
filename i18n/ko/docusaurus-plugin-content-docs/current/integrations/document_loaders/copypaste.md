---
translated: true
---

# 복사 붙여넣기

이 노트북은 복사하고 싶은 내용을 문서 객체로 로드하는 방법을 다룹니다. 이 경우 DocumentLoader를 사용할 필요가 없으며 대신 Document를 직접 구성할 수 있습니다.

```python
from langchain_community.docstore.document import Document
```

```python
text = "..... put the text you copy pasted here......"
```

```python
doc = Document(page_content=text)
```

## 메타데이터

이 텍스트 조각의 출처에 대한 메타데이터를 추가하고 싶다면 metadata 키를 사용할 수 있습니다.

```python
metadata = {"source": "internet", "date": "Friday"}
```

```python
doc = Document(page_content=text, metadata=metadata)
```

