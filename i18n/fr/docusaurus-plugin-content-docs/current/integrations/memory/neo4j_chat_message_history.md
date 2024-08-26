---
translated: true
---

# Neo4j

[Neo4j](https://en.wikipedia.org/wiki/Neo4j) est un système de gestion de base de données de graphes open-source, réputé pour sa gestion efficace des données hautement connectées. Contrairement aux bases de données traditionnelles qui stockent les données dans des tables, Neo4j utilise une structure de graphe avec des nœuds, des arêtes et des propriétés pour représenter et stocker les données. Cette conception permet des requêtes à haute performance sur des relations de données complexes.

Ce notebook explique comment utiliser `Neo4j` pour stocker l'historique des messages de discussion.

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
