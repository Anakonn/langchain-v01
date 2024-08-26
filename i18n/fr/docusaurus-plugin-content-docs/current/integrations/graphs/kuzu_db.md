---
translated: true
---

# Kuzu

>[Kùzu](https://kuzudb.com) est un système de gestion de base de données de graphe de propriété en cours de développement.
>
>Ce cahier montre comment utiliser les LLM pour fournir une interface en langage naturel à la base de données [Kùzu](https://kuzudb.com) avec le langage de requête de graphe `Cypher`.
>
>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language)) est un langage de requête de graphe déclaratif qui permet une interrogation de données expressive et efficace dans un graphe de propriété.

## Configuration

Installer le package python :

```bash
pip install kuzu
```

Créer une base de données sur la machine locale et s'y connecter :

```python
import kuzu

db = kuzu.Database("test_db")
conn = kuzu.Connection(db)
```

Tout d'abord, nous créons le schéma pour une simple base de données de films :

```python
conn.execute("CREATE NODE TABLE Movie (name STRING, PRIMARY KEY(name))")
conn.execute(
    "CREATE NODE TABLE Person (name STRING, birthDate STRING, PRIMARY KEY(name))"
)
conn.execute("CREATE REL TABLE ActedIn (FROM Person TO Movie)")
```

```output
<kuzu.query_result.QueryResult at 0x1066ff410>
```

Ensuite, nous pouvons insérer quelques données.

```python
conn.execute("CREATE (:Person {name: 'Al Pacino', birthDate: '1940-04-25'})")
conn.execute("CREATE (:Person {name: 'Robert De Niro', birthDate: '1943-08-17'})")
conn.execute("CREATE (:Movie {name: 'The Godfather'})")
conn.execute("CREATE (:Movie {name: 'The Godfather: Part II'})")
conn.execute(
    "CREATE (:Movie {name: 'The Godfather Coda: The Death of Michael Corleone'})"
)
conn.execute(
    "MATCH (p:Person), (m:Movie) WHERE p.name = 'Al Pacino' AND m.name = 'The Godfather' CREATE (p)-[:ActedIn]->(m)"
)
conn.execute(
    "MATCH (p:Person), (m:Movie) WHERE p.name = 'Al Pacino' AND m.name = 'The Godfather: Part II' CREATE (p)-[:ActedIn]->(m)"
)
conn.execute(
    "MATCH (p:Person), (m:Movie) WHERE p.name = 'Al Pacino' AND m.name = 'The Godfather Coda: The Death of Michael Corleone' CREATE (p)-[:ActedIn]->(m)"
)
conn.execute(
    "MATCH (p:Person), (m:Movie) WHERE p.name = 'Robert De Niro' AND m.name = 'The Godfather: Part II' CREATE (p)-[:ActedIn]->(m)"
)
```

```output
<kuzu.query_result.QueryResult at 0x107016210>
```

## Création de `KuzuQAChain`

Nous pouvons maintenant créer le `KuzuGraph` et le `KuzuQAChain`. Pour créer le `KuzuGraph`, nous devons simplement passer l'objet de base de données au constructeur `KuzuGraph`.

```python
from langchain.chains import KuzuQAChain
from langchain_community.graphs import KuzuGraph
from langchain_openai import ChatOpenAI
```

```python
graph = KuzuGraph(db)
```

```python
chain = KuzuQAChain.from_llm(ChatOpenAI(temperature=0), graph=graph, verbose=True)
```

## Rafraîchir les informations du schéma du graphe

Si le schéma de la base de données change, vous pouvez rafraîchir les informations de schéma nécessaires pour générer les instructions Cypher.

```python
# graph.refresh_schema()
```

```python
print(graph.get_schema)
```

```output
Node properties: [{'properties': [('name', 'STRING')], 'label': 'Movie'}, {'properties': [('name', 'STRING'), ('birthDate', 'STRING')], 'label': 'Person'}]
Relationships properties: [{'properties': [], 'label': 'ActedIn'}]
Relationships: ['(:Person)-[:ActedIn]->(:Movie)']
```

## Interroger le graphe

Nous pouvons maintenant utiliser le `KuzuQAChain` pour poser des questions sur le graphe

```python
chain.run("Who played in The Godfather: Part II?")
```

```output


[1m> Entering new  chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person)-[:ActedIn]->(m:Movie {name: 'The Godfather: Part II'}) RETURN p.name[0m
Full Context:
[32;1m[1;3m[{'p.name': 'Al Pacino'}, {'p.name': 'Robert De Niro'}][0m

[1m> Finished chain.[0m
```

```output
'Al Pacino and Robert De Niro both played in The Godfather: Part II.'
```

```python
chain.run("Robert De Niro played in which movies?")
```

```output


[1m> Entering new  chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person {name: 'Robert De Niro'})-[:ActedIn]->(m:Movie)
RETURN m.name[0m
Full Context:
[32;1m[1;3m[{'m.name': 'The Godfather: Part II'}][0m

[1m> Finished chain.[0m
```

```output
'Robert De Niro played in The Godfather: Part II.'
```

```python
chain.run("Robert De Niro is born in which year?")
```

```output


[1m> Entering new  chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person {name: 'Robert De Niro'})-[:ActedIn]->(m:Movie)
RETURN p.birthDate[0m
Full Context:
[32;1m[1;3m[{'p.birthDate': '1943-08-17'}][0m

[1m> Finished chain.[0m
```

```output
'Robert De Niro was born on August 17, 1943.'
```

```python
chain.run("Who is the oldest actor who played in The Godfather: Part II?")
```

```output


[1m> Entering new  chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person)-[:ActedIn]->(m:Movie{name:'The Godfather: Part II'})
WITH p, m, p.birthDate AS birthDate
ORDER BY birthDate ASC
LIMIT 1
RETURN p.name[0m
Full Context:
[32;1m[1;3m[{'p.name': 'Al Pacino'}][0m

[1m> Finished chain.[0m
```

```output
'The oldest actor who played in The Godfather: Part II is Al Pacino.'
```
