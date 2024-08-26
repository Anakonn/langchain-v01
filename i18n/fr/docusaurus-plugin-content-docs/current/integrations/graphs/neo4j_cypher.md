---
translated: true
---

# Neo4j

>[Neo4j](https://neo4j.com/docs/getting-started/) est un système de gestion de base de données de graphes développé par `Neo4j, Inc`.

>Les éléments de données que `Neo4j` stocke sont des nœuds, des arêtes les reliant et des attributs des nœuds et des arêtes. Décrit par ses développeurs comme une base de données transactionnelle conforme à ACID avec un stockage et un traitement natifs de graphes, `Neo4j` est disponible dans une édition "communautaire" non open-source sous licence avec une modification de la licence publique générale GNU, avec des extensions de sauvegarde en ligne et de haute disponibilité sous licence commerciale fermée. Neo accorde également des licences `Neo4j` avec ces extensions selon des conditions commerciales fermées.

>Ce cahier montre comment utiliser les LLM pour fournir une interface en langage naturel à une base de données de graphes que vous pouvez interroger avec le langage de requête `Cypher`.

>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language)) est un langage de requête de graphe déclaratif qui permet une interrogation de données expressive et efficace dans un graphe de propriétés.

## Configuration

Vous devrez avoir une instance `Neo4j` en cours d'exécution. Une option consiste à créer une [instance de base de données Neo4j gratuite dans leur service cloud Aura](https://neo4j.com/cloud/platform/aura-graph-database/). Vous pouvez également exécuter la base de données localement à l'aide de l'[application Neo4j Desktop](https://neo4j.com/download/) ou en exécutant un conteneur docker.
Vous pouvez exécuter un conteneur docker local en exécutant le script suivant :

```bash
docker run \
    --name neo4j \
    -p 7474:7474 -p 7687:7687 \
    -d \
    -e NEO4J_AUTH=neo4j/password \
    -e NEO4J_PLUGINS=\[\"apoc\"\]  \
    neo4j:latest
```

Si vous utilisez le conteneur docker, vous devez attendre quelques secondes pour que la base de données démarre.

```python
from langchain.chains import GraphCypherQAChain
from langchain_community.graphs import Neo4jGraph
from langchain_openai import ChatOpenAI
```

```python
graph = Neo4jGraph(url="bolt://localhost:7687", username="neo4j", password="password")
```

## Amorçage de la base de données

En supposant que votre base de données est vide, vous pouvez la remplir à l'aide du langage de requête Cypher. L'instruction Cypher suivante est idempotente, ce qui signifie que les informations de la base de données seront les mêmes si vous l'exécutez une ou plusieurs fois.

```python
graph.query(
    """
MERGE (m:Movie {name:"Top Gun", runtime: 120})
WITH m
UNWIND ["Tom Cruise", "Val Kilmer", "Anthony Edwards", "Meg Ryan"] AS actor
MERGE (a:Actor {name:actor})
MERGE (a)-[:ACTED_IN]->(m)
"""
)
```

```output
[]
```

## Actualiser les informations sur le schéma du graphe

Si le schéma de la base de données change, vous pouvez actualiser les informations sur le schéma nécessaires pour générer des instructions Cypher.

```python
graph.refresh_schema()
```

```python
print(graph.schema)
```

```output
Node properties:
Movie {runtime: INTEGER, name: STRING}
Actor {name: STRING}
Relationship properties:

The relationships:
(:Actor)-[:ACTED_IN]->(:Movie)
```

## Informations de schéma améliorées

Choisir la version améliorée du schéma permet au système de scanner automatiquement les valeurs d'exemple dans les bases de données et de calculer quelques métriques de distribution. Par exemple, si une propriété de nœud a moins de 10 valeurs distinctes, nous renvoyons toutes les valeurs possibles dans le schéma. Sinon, nous ne renvoyons qu'une seule valeur d'exemple par propriété de nœud et de relation.

```python
enhanced_graph = Neo4jGraph(
    url="bolt://localhost:7687",
    username="neo4j",
    password="password",
    enhanced_schema=True,
)
print(enhanced_graph.schema)
```

```output
Node properties:
- **Movie**
  - `runtime: INTEGER` Min: 120, Max: 120
  - `name: STRING` Available options: ['Top Gun']
- **Actor**
  - `name: STRING` Available options: ['Tom Cruise', 'Val Kilmer', 'Anthony Edwards', 'Meg Ryan']
Relationship properties:

The relationships:
(:Actor)-[:ACTED_IN]->(:Movie)
```

## Interroger le graphe

Nous pouvons maintenant utiliser la chaîne de questions-réponses Cypher pour poser des questions sur le graphe

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True
)
```

```python
chain.invoke({"query": "Who played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Tom Cruise'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Anthony Edwards, Meg Ryan, Val Kilmer, Tom Cruise played in Top Gun.'}
```

## Limiter le nombre de résultats

Vous pouvez limiter le nombre de résultats de la chaîne de questions-réponses Cypher à l'aide du paramètre `top_k`.
La valeur par défaut est 10.

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, top_k=2
)
```

```python
chain.invoke({"query": "Who played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Anthony Edwards, Meg Ryan played in Top Gun.'}
```

## Renvoyer les résultats intermédiaires

Vous pouvez renvoyer les étapes intermédiaires de la chaîne de questions-réponses Cypher à l'aide du paramètre `return_intermediate_steps`

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_intermediate_steps=True
)
```

```python
result = chain.invoke({"query": "Who played in Top Gun?"})
print(f"Intermediate steps: {result['intermediate_steps']}")
print(f"Final answer: {result['result']}")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Tom Cruise'}][0m

[1m> Finished chain.[0m
Intermediate steps: [{'query': "MATCH (a:Actor)-[:ACTED_IN]->(m:Movie)\nWHERE m.name = 'Top Gun'\nRETURN a.name"}, {'context': [{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Tom Cruise'}]}]
Final answer: Anthony Edwards, Meg Ryan, Val Kilmer, Tom Cruise played in Top Gun.
```

## Renvoyer les résultats directs

Vous pouvez renvoyer les résultats directs de la chaîne de questions-réponses Cypher à l'aide du paramètre `return_direct`

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_direct=True
)
```

```python
chain.invoke({"query": "Who played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': [{'a.name': 'Anthony Edwards'},
  {'a.name': 'Meg Ryan'},
  {'a.name': 'Val Kilmer'},
  {'a.name': 'Tom Cruise'}]}
```

## Ajouter des exemples dans l'invite de génération Cypher

Vous pouvez définir l'instruction Cypher que vous voulez que le LLM génère pour des questions particulières

```python
from langchain_core.prompts.prompt import PromptTemplate

CYPHER_GENERATION_TEMPLATE = """Task:Generate Cypher statement to query a graph database.
Instructions:
Use only the provided relationship types and properties in the schema.
Do not use any other relationship types or properties that are not provided.
Schema:
{schema}
Note: Do not include any explanations or apologies in your responses.
Do not respond to any questions that might ask anything else than for you to construct a Cypher statement.
Do not include any text except the generated Cypher statement.
Examples: Here are a few examples of generated Cypher statements for particular questions:
# How many people played in Top Gun?
MATCH (m:Movie {{title:"Top Gun"}})<-[:ACTED_IN]-()
RETURN count(*) AS numberOfActors

The question is:
{question}"""

CYPHER_GENERATION_PROMPT = PromptTemplate(
    input_variables=["schema", "question"], template=CYPHER_GENERATION_TEMPLATE
)

chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0),
    graph=graph,
    verbose=True,
    cypher_prompt=CYPHER_GENERATION_PROMPT,
)
```

```python
chain.invoke({"query": "How many people played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (:Movie {name:"Top Gun"})<-[:ACTED_IN]-()
RETURN count(*) AS numberOfActors[0m
Full Context:
[32;1m[1;3m[{'numberOfActors': 4}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'How many people played in Top Gun?',
 'result': 'There were 4 actors who played in Top Gun.'}
```

## Utiliser des LLM séparés pour la génération de Cypher et de réponses

Vous pouvez utiliser les paramètres `cypher_llm` et `qa_llm` pour définir différents LLM

```python
chain = GraphCypherQAChain.from_llm(
    graph=graph,
    cypher_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    qa_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo-16k"),
    verbose=True,
)
```

```python
chain.invoke({"query": "Who played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Tom Cruise'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Anthony Edwards, Meg Ryan, Val Kilmer, and Tom Cruise played in Top Gun.'}
```

## Ignorer les types de nœuds et de relations spécifiés

Vous pouvez utiliser `include_types` ou `exclude_types` pour ignorer certaines parties du schéma de graphe lors de la génération d'instructions Cypher.

```python
chain = GraphCypherQAChain.from_llm(
    graph=graph,
    cypher_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    qa_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo-16k"),
    verbose=True,
    exclude_types=["Movie"],
)
```

```python
# Inspect graph schema
print(chain.graph_schema)
```

```output
Node properties are the following:
Actor {name: STRING}
Relationship properties are the following:

The relationships are the following:
```

## Valider les instructions Cypher générées

Vous pouvez utiliser le paramètre `validate_cypher` pour valider et corriger les directions des relations dans les instructions Cypher générées

```python
chain = GraphCypherQAChain.from_llm(
    llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    graph=graph,
    verbose=True,
    validate_cypher=True,
)
```

```python
chain.invoke({"query": "Who played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Tom Cruise'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Anthony Edwards, Meg Ryan, Val Kilmer, Tom Cruise played in Top Gun.'}
```
