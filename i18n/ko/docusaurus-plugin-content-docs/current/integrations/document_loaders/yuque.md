---
translated: true
---

# Yuque

>[Yuque](https://www.yuque.com/)는 팀 협업을 위한 전문적인 클라우드 기반 지식 베이스입니다.

이 노트북에서는 `Yuque`에서 문서를 로드하는 방법을 다룹니다.

개인 액세스 토큰은 [개인 설정](https://www.yuque.com/settings/tokens) 페이지에서 개인 아바타를 클릭하여 얻을 수 있습니다.

```python
from langchain_community.document_loaders import YuqueLoader
```

```python
loader = YuqueLoader(access_token="<your_personal_access_token>")
```

```python
docs = loader.load()
```
