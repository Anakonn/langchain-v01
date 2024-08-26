---
translated: true
---

# Neo4j

[Neo4j](https://en.wikipedia.org/wiki/Neo4j)는 고도로 연결된 데이터를 효율적으로 관리하기로 유명한 오픈 소스 그래프 데이터베이스 관리 시스템입니다. 데이터를 테이블에 저장하는 전통적인 데이터베이스와 달리 Neo4j는 노드, 엣지, 속성을 사용하는 그래프 구조를 사용하여 데이터를 표현하고 저장합니다. 이러한 설계를 통해 복잡한 데이터 관계에 대한 고성능 쿼리가 가능합니다.

이 노트북에서는 채팅 메시지 기록을 저장하는 데 `Neo4j`를 사용하는 방법을 살펴봅니다.

```python
from langchain_community.chat_message_histories import Neo4jChatMessageHistory

history = Neo4jChatMessageHistory(
    url="bolt://localhost:7687",
    username="neo4j",
    password="password",
    session_id="session_id_1",
)

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

```python
history.messages
```
