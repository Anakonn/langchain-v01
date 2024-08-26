---
sidebar_position: 0
translated: true
---

# Démarrage rapide

Dans ce guide, nous passerons en revue les moyens de base pour créer une chaîne de questions-réponses sur une base de données de graphes. Ces systèmes nous permettront de poser une question sur les données d'une base de données de graphes et d'obtenir une réponse en langage naturel.

## ⚠️ Note de sécurité ⚠️

La construction de systèmes de questions-réponses sur des bases de données de graphes nécessite l'exécution de requêtes de graphes générées par un modèle. Il y a des risques inhérents à cette pratique. Assurez-vous que les autorisations de connexion à votre base de données sont toujours aussi restreintes que possible pour les besoins de votre chaîne/agent. Cela atténuera, sans toutefois l'éliminer, les risques de construire un système piloté par un modèle. Pour plus d'informations sur les meilleures pratiques de sécurité en général, [voir ici](/docs/security).

## Architecture

Dans les grandes lignes, les étapes de la plupart des chaînes de graphes sont les suivantes :

1. **Convertir la question en une requête de base de données de graphes** : Le modèle convertit l'entrée de l'utilisateur en une requête de base de données de graphes (par exemple, Cypher).
2. **Exécuter la requête de base de données de graphes** : Exécuter la requête de base de données de graphes.
3. **Répondre à la question** : Le modèle répond à l'entrée de l'utilisateur en utilisant les résultats de la requête.

![sql_usecase.png](../../../../../../static/img/graph_usecase.png)

## Configuration

Tout d'abord, obtenez les packages requis et définissez les variables d'environnement.
Dans cet exemple, nous utiliserons la base de données de graphes Neo4j.

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai neo4j
```

Nous utilisons par défaut les modèles OpenAI dans ce guide.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Uncomment the below to use LangSmith. Not required.
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
```

```output
 ········
```

Ensuite, nous devons définir les identifiants Neo4j.
Suivez [ces étapes d'installation](https://neo4j.com/docs/operations-manual/current/installation/) pour configurer une base de données Neo4j.

```python
os.environ["NEO4J_URI"] = "bolt://localhost:7687"
os.environ["NEO4J_USERNAME"] = "neo4j"
os.environ["NEO4J_PASSWORD"] = "password"
```

L'exemple ci-dessous créera une connexion avec une base de données Neo4j et y chargera des données d'exemple sur des films et leurs acteurs.

```python
from langchain_community.graphs import Neo4jGraph

graph = Neo4jGraph()

# Import movie information

movies_query = """
LOAD CSV WITH HEADERS FROM
'https://raw.githubusercontent.com/tomasonjo/blog-datasets/main/movies/movies_small.csv'
AS row
MERGE (m:Movie {id:row.movieId})
SET m.released = date(row.released),
    m.title = row.title,
    m.imdbRating = toFloat(row.imdbRating)
FOREACH (director in split(row.director, '|') |
    MERGE (p:Person {name:trim(director)})
    MERGE (p)-[:DIRECTED]->(m))
FOREACH (actor in split(row.actors, '|') |
    MERGE (p:Person {name:trim(actor)})
    MERGE (p)-[:ACTED_IN]->(m))
FOREACH (genre in split(row.genres, '|') |
    MERGE (g:Genre {name:trim(genre)})
    MERGE (m)-[:IN_GENRE]->(g))
"""

graph.query(movies_query)
```

```output
[]
```

## Schéma de graphe

Pour qu'un LLM puisse générer une instruction Cypher, il a besoin d'informations sur le schéma de graphe. Lorsque vous instanciez un objet de graphe, il récupère les informations sur le schéma de graphe. Si vous apportez ultérieurement des modifications au graphe, vous pouvez exécuter la méthode `refresh_schema` pour actualiser les informations sur le schéma.

```python
graph.refresh_schema()
print(graph.schema)
```

```output
Node properties are the following:
Movie {imdbRating: FLOAT, id: STRING, released: DATE, title: STRING},Person {name: STRING},Genre {name: STRING},Chunk {id: STRING, question: STRING, query: STRING, text: STRING, embedding: LIST}
Relationship properties are the following:

The relationships are the following:
(:Movie)-[:IN_GENRE]->(:Genre),(:Person)-[:DIRECTED]->(:Movie),(:Person)-[:ACTED_IN]->(:Movie)
```

Parfait ! Nous avons une base de données de graphes que nous pouvons interroger. Essayons maintenant de la connecter à un LLM.

## Chaîne

Utilisons une chaîne simple qui prend une question, la transforme en une requête Cypher, exécute la requête et utilise le résultat pour répondre à la question d'origine.

![graph_chain.webp](../../../../../../static/img/graph_chain.webp)

LangChain dispose d'une chaîne intégrée pour ce flux de travail, conçue pour fonctionner avec Neo4j : [GraphCypherQAChain](/docs/integrations/graphs/neo4j_cypher)

```python
from langchain.chains import GraphCypherQAChain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
chain = GraphCypherQAChain.from_llm(graph=graph, llm=llm, verbose=True)
response = chain.invoke({"query": "What was the cast of the Casino?"})
response
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (:Movie {title: "Casino"})<-[:ACTED_IN]-(actor:Person)
RETURN actor.name[0m
Full Context:
[32;1m[1;3m[{'actor.name': 'Joe Pesci'}, {'actor.name': 'Robert De Niro'}, {'actor.name': 'Sharon Stone'}, {'actor.name': 'James Woods'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'What was the cast of the Casino?',
 'result': 'The cast of Casino included Joe Pesci, Robert De Niro, Sharon Stone, and James Woods.'}
```

# Validation de la direction des relations

Les LLM peuvent avoir du mal avec les directions des relations dans les instructions Cypher générées. Comme le schéma de graphe est prédéfini, nous pouvons valider et, si nécessaire, corriger les directions des relations dans les instructions Cypher générées en utilisant le paramètre `validate_cypher`.

```python
chain = GraphCypherQAChain.from_llm(
    graph=graph, llm=llm, verbose=True, validate_cypher=True
)
response = chain.invoke({"query": "What was the cast of the Casino?"})
response
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (:Movie {title: "Casino"})<-[:ACTED_IN]-(actor:Person)
RETURN actor.name[0m
Full Context:
[32;1m[1;3m[{'actor.name': 'Joe Pesci'}, {'actor.name': 'Robert De Niro'}, {'actor.name': 'Sharon Stone'}, {'actor.name': 'James Woods'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'What was the cast of the Casino?',
 'result': 'The cast of Casino included Joe Pesci, Robert De Niro, Sharon Stone, and James Woods.'}
```

### Prochaines étapes

Pour une génération de requêtes plus complexe, nous pouvons vouloir créer des prompts few-shot ou ajouter des étapes de vérification des requêtes. Pour des techniques avancées comme celles-ci et plus encore, consultez :

* [Stratégies de prompt](/docs/use_cases/graph/prompting) : Techniques avancées d'ingénierie de prompt.
* [Mappage des valeurs](/docs/use_cases/graph/mapping) : Techniques de mappage des valeurs des questions à la base de données.
* [Couche sémantique](/docs/use_cases/graph/semantic) : Techniques de mise en œuvre de couches sémantiques.
* [Construction de graphes](/docs/use_cases/graph/constructing) : Techniques de construction de graphes de connaissances.
