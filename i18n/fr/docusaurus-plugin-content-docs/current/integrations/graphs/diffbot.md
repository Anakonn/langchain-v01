---
translated: true
---

# Diffbot

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/graph/diffbot_graphtransformer.ipynb)

>[Diffbot](https://docs.diffbot.com/docs/getting-started-with-diffbot) est une suite de produits qui facilitent l'intégration et la recherche de données sur le web.
>
>[The Diffbot Knowledge Graph](https://docs.diffbot.com/docs/getting-started-with-diffbot-knowledge-graph) est une base de données de graphes auto-mise à jour du web public.

## Cas d'utilisation

Les données textuelles contiennent souvent des relations et des informations riches utilisées pour diverses analyses, moteurs de recommandation ou applications de gestion des connaissances.

L'`API NLP de Diffbot` permet d'extraire des entités, des relations et une signification sémantique à partir de données textuelles non structurées.

En couplant l'`API NLP de Diffbot` avec `Neo4j`, une base de données de graphes, vous pouvez créer des structures de graphes dynamiques et puissantes basées sur les informations extraites du texte. Ces structures de graphes sont entièrement interrogeables et peuvent être intégrées dans diverses applications.

Cette combinaison permet des cas d'utilisation tels que :

* Construire des graphes de connaissances à partir de documents textuels, de sites web ou de flux de médias sociaux.
* Générer des recommandations basées sur les relations sémantiques dans les données.
* Créer des fonctionnalités de recherche avancées qui comprennent les relations entre les entités.
* Construire des tableaux de bord analytiques permettant aux utilisateurs d'explorer les relations cachées dans les données.

## Aperçu

LangChain fournit des outils pour interagir avec les bases de données de graphes :

1. `Construire des graphes de connaissances à partir de texte` en utilisant des transformateurs de graphes et des intégrations de stockage
2. `Interroger une base de données de graphes` en utilisant des chaînes pour la création et l'exécution de requêtes
3. `Interagir avec une base de données de graphes` en utilisant des agents pour une interrogation robuste et flexible

## Configuration

Tout d'abord, obtenez les packages requis et définissez les variables d'environnement :

```python
%pip install --upgrade --quiet  langchain langchain-experimental langchain-openai neo4j wikipedia
```

### Service NLP de Diffbot

Le service `NLP de Diffbot` est un outil d'extraction d'entités, de relations et de contexte sémantique à partir de données textuelles non structurées.
Ces informations extraites peuvent être utilisées pour construire un graphe de connaissances.
Pour utiliser ce service, vous devrez obtenir une clé API auprès de [Diffbot](https://www.diffbot.com/products/natural-language/).

```python
from langchain_experimental.graph_transformers.diffbot import DiffbotGraphTransformer

diffbot_api_key = "DIFFBOT_API_KEY"
diffbot_nlp = DiffbotGraphTransformer(diffbot_api_key=diffbot_api_key)
```

Ce code récupère des articles Wikipédia sur "Warren Buffett" et utilise ensuite `DiffbotGraphTransformer` pour extraire les entités et les relations.
Le `DiffbotGraphTransformer` produit un `GraphDocument` structuré, qui peut être utilisé pour peupler une base de données de graphes.
Notez que le découpage de texte est évité en raison de la [limite de caractères par requête API](https://docs.diffbot.com/reference/introduction-to-natural-language-api) de Diffbot.

```python
from langchain_community.document_loaders import WikipediaLoader

query = "Warren Buffett"
raw_documents = WikipediaLoader(query=query).load()
graph_documents = diffbot_nlp.convert_to_graph_documents(raw_documents)
```

## Chargement des données dans un graphe de connaissances

Vous aurez besoin d'avoir une instance Neo4j en cours d'exécution. Une option est de créer une [instance de base de données Neo4j gratuite dans leur service cloud Aura](https://neo4j.com/cloud/platform/aura-graph-database/). Vous pouvez également exécuter la base de données localement à l'aide de l'[application Neo4j Desktop](https://neo4j.com/download/) ou en exécutant un conteneur docker. Vous pouvez exécuter un conteneur docker local en exécutant le script suivant :

```bash
docker run \
    --name neo4j \
    -p 7474:7474 -p 7687:7687 \
    -d \
    -e NEO4J_AUTH=neo4j/pleaseletmein \
    -e NEO4J_PLUGINS=\[\"apoc\"\]  \
    neo4j:latest
```

Si vous utilisez le conteneur docker, vous devez attendre quelques secondes pour que la base de données démarre.

```python
from langchain_community.graphs import Neo4jGraph

url = "bolt://localhost:7687"
username = "neo4j"
password = "pleaseletmein"

graph = Neo4jGraph(url=url, username=username, password=password)
```

Les `GraphDocuments` peuvent être chargés dans un graphe de connaissances à l'aide de la méthode `add_graph_documents`.

```python
graph.add_graph_documents(graph_documents)
```

## Actualiser les informations sur le schéma du graphe

Si le schéma de la base de données change, vous pouvez actualiser les informations sur le schéma nécessaires pour générer les instructions Cypher.

```python
graph.refresh_schema()
```

## Interroger le graphe

Nous pouvons maintenant utiliser la chaîne de questions-réponses Cypher sur le graphe. Il est recommandé d'utiliser **gpt-4** pour construire des requêtes Cypher afin d'obtenir la meilleure expérience.

```python
from langchain.chains import GraphCypherQAChain
from langchain_openai import ChatOpenAI

chain = GraphCypherQAChain.from_llm(
    cypher_llm=ChatOpenAI(temperature=0, model_name="gpt-4"),
    qa_llm=ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo"),
    graph=graph,
    verbose=True,
)
```

```python
chain.run("Which university did Warren Buffett attend?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person {name: "Warren Buffett"})-[:EDUCATED_AT]->(o:Organization)
RETURN o.name[0m
Full Context:
[32;1m[1;3m[{'o.name': 'New York Institute of Finance'}, {'o.name': 'Alice Deal Junior High School'}, {'o.name': 'Woodrow Wilson High School'}, {'o.name': 'University of Nebraska'}][0m

[1m> Finished chain.[0m
```

```output
'Warren Buffett attended the University of Nebraska.'
```

```python
chain.run("Who is or was working at Berkshire Hathaway?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person)-[r:EMPLOYEE_OR_MEMBER_OF]->(o:Organization) WHERE o.name = 'Berkshire Hathaway' RETURN p.name[0m
Full Context:
[32;1m[1;3m[{'p.name': 'Charlie Munger'}, {'p.name': 'Oliver Chace'}, {'p.name': 'Howard Buffett'}, {'p.name': 'Howard'}, {'p.name': 'Susan Buffett'}, {'p.name': 'Warren Buffett'}][0m

[1m> Finished chain.[0m
```

```output
'Charlie Munger, Oliver Chace, Howard Buffett, Susan Buffett, and Warren Buffett are or were working at Berkshire Hathaway.'
```
