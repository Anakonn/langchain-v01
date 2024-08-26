---
translated: true
---

# AwaDB

>[AwaDB](https://github.com/awa-ai/awadb)는 LLM 애플리케이션에서 사용되는 임베딩 벡터의 검색 및 저장을 위한 AI 네이티브 데이터베이스입니다.

## 설치 및 설정

```bash
pip install awadb
```

## 벡터 저장소

```python
<!--IMPORTS:[{"imported": "AwaDB", "source": "langchain_community.vectorstores", "docs": "https://api.python.langchain.com/en/latest/vectorstores/langchain_community.vectorstores.awadb.AwaDB.html", "title": "AwaDB"}]-->
from langchain_community.vectorstores import AwaDB
```

[사용 예시](/docs/integrations/vectorstores/awadb)를 참고하세요.

## 임베딩 모델

```python
<!--IMPORTS:[{"imported": "AwaEmbeddings", "source": "langchain_community.embeddings", "docs": "https://api.python.langchain.com/en/latest/embeddings/langchain_community.embeddings.awa.AwaEmbeddings.html", "title": "AwaDB"}]-->
from langchain_community.embeddings import AwaEmbeddings
```

[사용 예시](/docs/integrations/text_embedding/awadb)를 참고하세요.
