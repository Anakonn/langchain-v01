---
translated: true
---

# Apache AGE

>[Apache AGE](https://age.apache.org/) est une extension PostgreSQL qui fournit des fonctionnalités de base de données de graphes. AGE est un acronyme pour "A Graph Extension" et s'inspire de la fourche d'AgensGraph de Bitnine, qui est une base de données multi-modèle. L'objectif du projet est de créer un stockage unique pouvant gérer à la fois les données relationnelles et les données de modèle de graphe afin que les utilisateurs puissent utiliser le SQL ANSI standard ainsi que openCypher, le langage de requête de graphe. Les éléments de données qu'`Apache AGE` stocke sont des nœuds, des arêtes les reliant et des attributs de nœuds et d'arêtes.

>Ce notebook montre comment utiliser les LLM pour fournir une interface en langage naturel à une base de données de graphes que vous pouvez interroger avec le langage de requête `Cypher`.

>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language)) est un langage de requête de graphe déclaratif qui permet une interrogation de données expressive et efficace dans un graphe de propriétés.

## Configuration

Vous devrez avoir une instance `Postgre` en cours d'exécution avec l'extension AGE installée. Une option de test est d'exécuter un conteneur docker à l'aide de l'image docker officielle AGE.
Vous pouvez exécuter un conteneur docker local en exécutant le script suivant :

```bash
docker run \
    --name age  \
    -p 5432:5432 \
    -e POSTGRES_USER=postgresUser \
    -e POSTGRES_PASSWORD=postgresPW \
    -e POSTGRES_DB=postgresDB \
    -d \
    apache/age
```

Des instructions supplémentaires sur l'exécution dans docker se trouvent [ici](https://hub.docker.com/r/apache/age).

```python
from langchain.chains import GraphCypherQAChain
from langchain_community.graphs.age_graph import AGEGraph
from langchain_openai import ChatOpenAI
```

```python
conf = {
    "database": "postgresDB",
    "user": "postgresUser",
    "password": "postgresPW",
    "host": "localhost",
    "port": 5432,
}

graph = AGEGraph(graph_name="age_test", conf=conf)
```

## Remplissage de la base de données

En supposant que votre base de données est vide, vous pouvez la remplir à l'aide du langage de requête Cypher. L'instruction Cypher suivante est idempotente, ce qui signifie que les informations de la base de données seront les mêmes si vous l'exécutez une ou plusieurs fois.

```python
graph.query(
    """
MERGE (m:Movie {name:"Top Gun"})
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

## Rafraîchir les informations du schéma de graphe

Si le schéma de la base de données change, vous pouvez rafraîchir les informations de schéma nécessaires pour générer des instructions Cypher.

```python
graph.refresh_schema()
```

```python
print(graph.schema)
```

```output

        Node properties are the following:
        [{'properties': [{'property': 'name', 'type': 'STRING'}], 'labels': 'Actor'}, {'properties': [{'property': 'property_a', 'type': 'STRING'}], 'labels': 'LabelA'}, {'properties': [], 'labels': 'LabelB'}, {'properties': [], 'labels': 'LabelC'}, {'properties': [{'property': 'name', 'type': 'STRING'}], 'labels': 'Movie'}]
        Relationship properties are the following:
        [{'properties': [], 'type': 'ACTED_IN'}, {'properties': [{'property': 'rel_prop', 'type': 'STRING'}], 'type': 'REL_TYPE'}]
        The relationships are the following:
        ['(:`Actor`)-[:`ACTED_IN`]->(:`Movie`)', '(:`LabelA`)-[:`REL_TYPE`]->(:`LabelB`)', '(:`LabelA`)-[:`REL_TYPE`]->(:`LabelC`)']
```

## Interroger le graphe

Nous pouvons maintenant utiliser la chaîne de questions-réponses Cypher pour poser des questions sur le graphe.

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True
)
```

```python
chain.invoke("Who played in Top Gun?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m

Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}, {'name': 'Anthony Edwards'}, {'name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Tom Cruise, Val Kilmer, Anthony Edwards, Meg Ryan played in Top Gun.'}
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
chain.invoke("Who played in Top Gun?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie {name: 'Top Gun'})
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Tom Cruise, Val Kilmer played in Top Gun.'}
```

## Renvoyer les résultats intermédiaires

Vous pouvez renvoyer les étapes intermédiaires de la chaîne de questions-réponses Cypher à l'aide du paramètre `return_intermediate_steps`.

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_intermediate_steps=True
)
```

```python
result = chain("Who played in Top Gun?")
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
[32;1m[1;3m[{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}, {'name': 'Anthony Edwards'}, {'name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
Intermediate steps: [{'query': "MATCH (a:Actor)-[:ACTED_IN]->(m:Movie)\nWHERE m.name = 'Top Gun'\nRETURN a.name"}, {'context': [{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}, {'name': 'Anthony Edwards'}, {'name': 'Meg Ryan'}]}]
Final answer: Tom Cruise, Val Kilmer, Anthony Edwards, Meg Ryan played in Top Gun.
```

## Renvoyer les résultats directs

Vous pouvez renvoyer les résultats directs de la chaîne de questions-réponses Cypher à l'aide du paramètre `return_direct`.

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_direct=True
)
```

```python
chain.invoke("Who played in Top Gun?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie {name: 'Top Gun'})
RETURN a.name[0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': [{'name': 'Tom Cruise'},
  {'name': 'Val Kilmer'},
  {'name': 'Anthony Edwards'},
  {'name': 'Meg Ryan'}]}
```

## Ajouter des exemples dans l'invite de génération Cypher

Vous pouvez définir l'instruction Cypher que vous voulez que le LLM génère pour des questions particulières.

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
chain.invoke("How many people played in Top Gun?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m

Generated Cypher:
[32;1m[1;3mMATCH (:Movie {name:"Top Gun"})<-[:ACTED_IN]-(:Actor)
RETURN count(*) AS numberOfActors[0m
Full Context:
[32;1m[1;3m[{'numberofactors': 4}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'How many people played in Top Gun?',
 'result': "I don't know the answer."}
```

## Utiliser des LLM séparés pour la génération de Cypher et de réponses

Vous pouvez utiliser les paramètres `cypher_llm` et `qa_llm` pour définir différents LLM.

```python
chain = GraphCypherQAChain.from_llm(
    graph=graph,
    cypher_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    qa_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo-16k"),
    verbose=True,
)
```

```python
chain.invoke("Who played in Top Gun?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m

Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}, {'name': 'Anthony Edwards'}, {'name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Tom Cruise, Val Kilmer, Anthony Edwards, and Meg Ryan played in Top Gun.'}
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
Actor {name: STRING},LabelA {property_a: STRING},LabelB {},LabelC {}
Relationship properties are the following:
ACTED_IN {},REL_TYPE {rel_prop: STRING}
The relationships are the following:
(:LabelA)-[:REL_TYPE]->(:LabelB),(:LabelA)-[:REL_TYPE]->(:LabelC)
```

## Valider les instructions Cypher générées

Vous pouvez utiliser le paramètre `validate_cypher` pour valider et corriger les directions des relations dans les instructions Cypher générées.

```python
chain = GraphCypherQAChain.from_llm(
    llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    graph=graph,
    verbose=True,
    validate_cypher=True,
)
```

```python
chain.invoke("Who played in Top Gun?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}, {'name': 'Anthony Edwards'}, {'name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Tom Cruise, Val Kilmer, Anthony Edwards, Meg Ryan played in Top Gun.'}
```
