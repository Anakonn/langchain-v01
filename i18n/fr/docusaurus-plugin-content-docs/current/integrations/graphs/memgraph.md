---
translated: true
---

# Memgraph

>[Memgraph](https://github.com/memgraph/memgraph) est la base de données de graphes open-source, compatible avec `Neo4j`.
>La base de données utilise le langage de requête de graphe `Cypher`,
>
>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language)) est un langage de requête de graphe déclaratif qui permet une interrogation de données expressive et efficace dans un graphe de propriétés.

Ce notebook montre comment utiliser les LLM pour fournir une interface en langage naturel à une base de données [Memgraph](https://github.com/memgraph/memgraph).

## Configuration

Pour terminer ce tutoriel, vous aurez besoin de [Docker](https://www.docker.com/get-started/) et de [Python 3.x](https://www.python.org/) installés.

Assurez-vous d'avoir une instance Memgraph en cours d'exécution. Pour exécuter rapidement la plateforme Memgraph (base de données Memgraph + bibliothèque MAGE + Memgraph Lab) pour la première fois, procédez comme suit :

Sur Linux/MacOS :

```bash
curl https://install.memgraph.com | sh
```

Sur Windows :

```bash
iwr https://windows.memgraph.com | iex
```

Les deux commandes exécutent un script qui télécharge un fichier Docker Compose sur votre système, construit et démarre les services Docker `memgraph-mage` et `memgraph-lab` dans deux conteneurs séparés.

Lisez plus d'informations sur le processus d'installation sur [la documentation Memgraph](https://memgraph.com/docs/getting-started/install-memgraph).

Vous pouvez maintenant commencer à jouer avec `Memgraph` !

Commencez par installer et importer tous les packages nécessaires. Nous utiliserons le gestionnaire de packages appelé [pip](https://pip.pypa.io/en/stable/installation/), avec le drapeau `--user`, pour assurer les autorisations appropriées. Si vous avez installé Python 3.4 ou une version ultérieure, pip est inclus par défaut. Vous pouvez installer tous les packages requis à l'aide de la commande suivante :

```python
pip install langchain langchain-openai neo4j gqlalchemy --user
```

Vous pouvez soit exécuter les blocs de code fournis dans ce notebook, soit utiliser un fichier Python séparé pour expérimenter avec Memgraph et LangChain.

```python
import os

from gqlalchemy import Memgraph
from langchain.chains import GraphCypherQAChain
from langchain_community.graphs import MemgraphGraph
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
```

Nous utilisons la bibliothèque Python [GQLAlchemy](https://github.com/memgraph/gqlalchemy) pour établir une connexion entre notre base de données Memgraph et notre script Python. Vous pouvez également établir la connexion à une instance Memgraph en cours d'exécution avec le pilote Neo4j, car il est compatible avec Memgraph. Pour exécuter des requêtes avec GQLAlchemy, nous pouvons configurer une instance Memgraph comme suit :

```python
memgraph = Memgraph(host="127.0.0.1", port=7687)
```

## Peupler la base de données

Vous pouvez facilement peupler votre nouvelle base de données vide à l'aide du langage de requête Cypher. Ne vous inquiétez pas si vous ne comprenez pas chaque ligne pour le moment, vous pouvez apprendre Cypher à partir de la documentation [ici](https://memgraph.com/docs/cypher-manual/). L'exécution du script suivant exécutera une requête d'amorçage sur la base de données, nous donnant des données sur un jeu vidéo, y compris des détails comme l'éditeur, les plateformes disponibles et les genres. Ces données serviront de base à notre travail.

```python
# Creating and executing the seeding query
query = """
    MERGE (g:Game {name: "Baldur's Gate 3"})
    WITH g, ["PlayStation 5", "Mac OS", "Windows", "Xbox Series X/S"] AS platforms,
            ["Adventure", "Role-Playing Game", "Strategy"] AS genres
    FOREACH (platform IN platforms |
        MERGE (p:Platform {name: platform})
        MERGE (g)-[:AVAILABLE_ON]->(p)
    )
    FOREACH (genre IN genres |
        MERGE (gn:Genre {name: genre})
        MERGE (g)-[:HAS_GENRE]->(gn)
    )
    MERGE (p:Publisher {name: "Larian Studios"})
    MERGE (g)-[:PUBLISHED_BY]->(p);
"""

memgraph.execute(query)
```

## Rafraîchir le schéma du graphe

Vous êtes prêt à instancier le graphe Memgraph-LangChain à l'aide du script suivant. Cette interface nous permettra d'interroger notre base de données à l'aide de LangChain, en créant automatiquement le schéma de graphe requis pour générer des requêtes Cypher via LLM.

```python
graph = MemgraphGraph(url="bolt://localhost:7687", username="", password="")
```

Si nécessaire, vous pouvez rafraîchir manuellement le schéma du graphe comme suit.

```python
graph.refresh_schema()
```

Pour vous familiariser avec les données et vérifier le schéma du graphe mis à jour, vous pouvez l'imprimer à l'aide de l'instruction suivante.

```python
print(graph.schema)
```

```output
Node properties are the following:
Node name: 'Game', Node properties: [{'property': 'name', 'type': 'str'}]
Node name: 'Platform', Node properties: [{'property': 'name', 'type': 'str'}]
Node name: 'Genre', Node properties: [{'property': 'name', 'type': 'str'}]
Node name: 'Publisher', Node properties: [{'property': 'name', 'type': 'str'}]

Relationship properties are the following:

The relationships are the following:
['(:Game)-[:AVAILABLE_ON]->(:Platform)']
['(:Game)-[:HAS_GENRE]->(:Genre)']
['(:Game)-[:PUBLISHED_BY]->(:Publisher)']
```

## Interroger la base de données

Pour interagir avec l'API OpenAI, vous devez configurer votre clé API en tant que variable d'environnement à l'aide du package Python [os](https://docs.python.org/3/library/os.html). Cela garantit une autorisation appropriée pour vos requêtes. Vous pouvez trouver plus d'informations sur l'obtention de votre clé API [ici](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key).

```python
os.environ["OPENAI_API_KEY"] = "your-key-here"
```

Vous devriez créer la chaîne de graphe à l'aide du script suivant, qui sera utilisée dans le processus de questions-réponses basé sur vos données de graphe. Bien qu'il soit par défaut sur GPT-3.5-turbo, vous pourriez également envisager d'expérimenter avec d'autres modèles comme [GPT-4](https://help.openai.com/en/articles/7102672-how-can-i-access-gpt-4) pour des requêtes Cypher et des résultats nettement améliorés. Nous utiliserons le chat OpenAI, en utilisant la clé que vous avez configurée précédemment. Nous définirons la température à zéro, assurant des réponses prévisibles et cohérentes. De plus, nous utiliserons notre graphe Memgraph-LangChain et définirons le paramètre verbose, qui est par défaut sur False, sur True pour recevoir des messages plus détaillés concernant la génération de requêtes.

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, model_name="gpt-3.5-turbo"
)
```

Vous pouvez maintenant commencer à poser des questions !

```python
response = chain.run("Which platforms is Baldur's Gate 3 available on?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (g:Game {name: 'Baldur\'s Gate 3'})-[:AVAILABLE_ON]->(p:Platform)
RETURN p.name
Full Context:
[{'p.name': 'PlayStation 5'}, {'p.name': 'Mac OS'}, {'p.name': 'Windows'}, {'p.name': 'Xbox Series X/S'}]

> Finished chain.
Baldur's Gate 3 is available on PlayStation 5, Mac OS, Windows, and Xbox Series X/S.
```

```python
response = chain.run("Is Baldur's Gate 3 available on Windows?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (:Game {name: 'Baldur\'s Gate 3'})-[:AVAILABLE_ON]->(:Platform {name: 'Windows'})
RETURN true
Full Context:
[{'true': True}]

> Finished chain.
Yes, Baldur's Gate 3 is available on Windows.
```

## Modificateurs de chaîne

Pour modifier le comportement de votre chaîne et obtenir plus de contexte ou d'informations supplémentaires, vous pouvez modifier les paramètres de la chaîne.

#### Retourner les résultats de requête directs

Le modificateur `return_direct` spécifie s'il faut retourner les résultats directs de la requête Cypher exécutée ou la réponse en langage naturel traitée.

```python
# Return the result of querying the graph directly
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_direct=True
)
```

```python
response = chain.run("Which studio published Baldur's Gate 3?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (:Game {name: 'Baldur\'s Gate 3'})-[:PUBLISHED_BY]->(p:Publisher)
RETURN p.name

> Finished chain.
[{'p.name': 'Larian Studios'}]
```

#### Retourner les étapes intermédiaires de la requête

Le modificateur de chaîne `return_intermediate_steps` améliore la réponse renvoyée en incluant les étapes intermédiaires de la requête en plus du résultat de la requête initiale.

```python
# Return all the intermediate steps of query execution
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_intermediate_steps=True
)
```

```python
response = chain("Is Baldur's Gate 3 an Adventure game?")
print(f"Intermediate steps: {response['intermediate_steps']}")
print(f"Final response: {response['result']}")
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (g:Game {name: 'Baldur\'s Gate 3'})-[:HAS_GENRE]->(genre:Genre {name: 'Adventure'})
RETURN g, genre
Full Context:
[{'g': {'name': "Baldur's Gate 3"}, 'genre': {'name': 'Adventure'}}]

> Finished chain.
Intermediate steps: [{'query': "MATCH (g:Game {name: 'Baldur\\'s Gate 3'})-[:HAS_GENRE]->(genre:Genre {name: 'Adventure'})\nRETURN g, genre"}, {'context': [{'g': {'name': "Baldur's Gate 3"}, 'genre': {'name': 'Adventure'}}]}]
Final response: Yes, Baldur's Gate 3 is an Adventure game.
```

#### Limiter le nombre de résultats de requête

Le modificateur `top_k` peut être utilisé lorsque vous voulez restreindre le nombre maximum de résultats de requête.

```python
# Limit the maximum number of results returned by query
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, top_k=2
)
```

```python
response = chain.run("What genres are associated with Baldur's Gate 3?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (:Game {name: 'Baldur\'s Gate 3'})-[:HAS_GENRE]->(g:Genre)
RETURN g.name
Full Context:
[{'g.name': 'Adventure'}, {'g.name': 'Role-Playing Game'}]

> Finished chain.
Baldur's Gate 3 is associated with the genres Adventure and Role-Playing Game.
```

# Requête avancée

À mesure que la complexité de votre solution grandit, vous pourriez rencontrer différents cas d'utilisation nécessitant un traitement attentif. Assurer la mise à l'échelle de votre application est essentiel pour maintenir un flux d'utilisateurs fluide sans accroc.

Réinstantions notre chaîne une fois de plus et essayons de poser quelques questions que les utilisateurs pourraient potentiellement poser.

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, model_name="gpt-3.5-turbo"
)
```

```python
response = chain.run("Is Baldur's Gate 3 available on PS5?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (g:Game {name: 'Baldur\'s Gate 3'})-[:AVAILABLE_ON]->(p:Platform {name: 'PS5'})
RETURN g.name, p.name
Full Context:
[]

> Finished chain.
I'm sorry, but I don't have the information to answer your question.
```

La requête Cypher générée semble correcte, mais nous n'avons reçu aucune information en retour. Cela illustre un défi courant lorsque l'on travaille avec des LLM - le désalignement entre la façon dont les utilisateurs formulent les requêtes et la manière dont les données sont stockées. Dans ce cas, la différence entre la perception des utilisateurs et le stockage réel des données peut entraîner des incompatibilités. L'affinage des invites, le processus de peaufinage des invites du modèle pour mieux saisir ces distinctions, est une solution efficace qui s'attaque à ce problème. Grâce à l'affinage des invites, le modèle acquiert une plus grande compétence dans la génération de requêtes précises et pertinentes, ce qui permet de récupérer avec succès les données souhaitées.

### Affinage des invites

Pour y remédier, nous pouvons ajuster l'invite Cypher initiale de la chaîne QA. Cela implique d'ajouter des instructions au LLM sur la façon dont les utilisateurs peuvent se référer à des plateformes spécifiques, comme PS5 dans notre cas. Nous y parvenons en utilisant le [PromptTemplate](/docs/modules/model_io/prompts/) de LangChain, en créant une invite initiale modifiée. Cette invite modifiée est ensuite fournie comme argument à notre instance Memgraph-LangChain affinée.

```python
CYPHER_GENERATION_TEMPLATE = """
Task:Generate Cypher statement to query a graph database.
Instructions:
Use only the provided relationship types and properties in the schema.
Do not use any other relationship types or properties that are not provided.
Schema:
{schema}
Note: Do not include any explanations or apologies in your responses.
Do not respond to any questions that might ask anything else than for you to construct a Cypher statement.
Do not include any text except the generated Cypher statement.
If the user asks about PS5, Play Station 5 or PS 5, that is the platform called PlayStation 5.

The question is:
{question}
"""

CYPHER_GENERATION_PROMPT = PromptTemplate(
    input_variables=["schema", "question"], template=CYPHER_GENERATION_TEMPLATE
)
```

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0),
    cypher_prompt=CYPHER_GENERATION_PROMPT,
    graph=graph,
    verbose=True,
    model_name="gpt-3.5-turbo",
)
```

```python
response = chain.run("Is Baldur's Gate 3 available on PS5?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (g:Game {name: 'Baldur\'s Gate 3'})-[:AVAILABLE_ON]->(p:Platform {name: 'PlayStation 5'})
RETURN g.name, p.name
Full Context:
[{'g.name': "Baldur's Gate 3", 'p.name': 'PlayStation 5'}]

> Finished chain.
Yes, Baldur's Gate 3 is available on PlayStation 5.
```

Maintenant, avec l'invite Cypher initiale révisée qui inclut des instructions sur la dénomination des plateformes, nous obtenons des résultats précis et pertinents qui s'alignent davantage sur les requêtes des utilisateurs.

Cette approche permet d'améliorer davantage votre chaîne QA. Vous pouvez facilement intégrer des données d'affinage d'invite supplémentaires dans votre chaîne, améliorant ainsi l'expérience utilisateur globale de votre application.
