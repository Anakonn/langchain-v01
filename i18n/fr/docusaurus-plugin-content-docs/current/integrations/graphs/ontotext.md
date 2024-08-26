---
translated: true
---

# Ontotext GraphDB

>[Ontotext GraphDB](https://graphdb.ontotext.com/) est une base de données de graphes et un outil de découverte de connaissances conforme à [RDF](https://www.w3.org/RDF/) et [SPARQL](https://www.w3.org/TR/sparql11-query/).

>Ce notebook montre comment utiliser les LLM pour fournir une interrogation en langage naturel (NLQ vers SPARQL, également appelée `text2sparql`) pour `Ontotext GraphDB`.

## Fonctionnalités LLM de GraphDB

`GraphDB` prend en charge certaines fonctionnalités d'intégration LLM comme décrit [ici](https://github.com/w3c/sparql-dev/issues/193) :

[gpt-queries](https://graphdb.ontotext.com/documentation/10.5/gpt-queries.html)

* prédicats magiques pour demander à un LLM du texte, une liste ou un tableau en utilisant les données de votre graphe de connaissances (KG)
* explication de la requête
* explication, résumé, reformulation, traduction des résultats

[retrieval-graphdb-connector](https://graphdb.ontotext.com/documentation/10.5/retrieval-graphdb-connector.html)

* Indexation des entités KG dans une base de données vectorielle
* Prend en charge tout algorithme d'intégration de texte et base de données vectorielle
* Utilise le même langage de connecteur puissant (indexation) que GraphDB pour Elastic, Solr, Lucene
* Synchronisation automatique des modifications des données RDF avec l'index des entités KG
* Prend en charge les objets imbriqués (pas de support UI dans la version 10.5 de GraphDB)
* Sérialise les entités KG en texte comme ceci (par exemple pour un jeu de données Wines) :

```text
Franvino:
- is a RedWine.
- made from grape Merlo.
- made from grape Cabernet Franc.
- has sugar dry.
- has year 2012.
```

[talk-to-graph](https://graphdb.ontotext.com/documentation/10.5/talk-to-graph.html)

* Un chatbot simple utilisant un index d'entités KG défini

Pour ce tutoriel, nous n'utiliserons pas l'intégration LLM de GraphDB, mais la génération de `SPARQL` à partir de NLQ. Nous utiliserons l'ontologie et le jeu de données `Star Wars API` (`SWAPI`) que vous pouvez examiner [ici](https://github.com/Ontotext-AD/langchain-graphdb-qa-chain-demo/blob/main/starwars-data.trig).

## Configuration

Vous avez besoin d'une instance GraphDB en cours d'exécution. Ce tutoriel montre comment exécuter la base de données localement à l'aide de l'[image Docker GraphDB](https://hub.docker.com/r/ontotext/graphdb). Il fournit un ensemble de docker compose, qui peuple GraphDB avec le jeu de données Star Wars. Tous les fichiers nécessaires, y compris ce notebook, peuvent être téléchargés à partir du [dépôt GitHub langchain-graphdb-qa-chain-demo](https://github.com/Ontotext-AD/langchain-graphdb-qa-chain-demo).

* Installez [Docker](https://docs.docker.com/get-docker/). Ce tutoriel a été créé à l'aide de la version Docker `24.0.7` qui inclut [Docker Compose](https://docs.docker.com/compose/). Pour les versions antérieures de Docker, vous devrez peut-être installer Docker Compose séparément.
* Clonez le [dépôt GitHub langchain-graphdb-qa-chain-demo](https://github.com/Ontotext-AD/langchain-graphdb-qa-chain-demo) dans un dossier local sur votre machine.
* Démarrez GraphDB avec le script suivant exécuté à partir du même dossier :

```bash
docker build --tag graphdb .
docker compose up -d graphdb
```

  Vous devez attendre quelques secondes pour que la base de données démarre sur `http://localhost:7200/`. Le jeu de données Star Wars `starwars-data.trig` est automatiquement chargé dans le référentiel `langchain`. Le point de terminaison SPARQL local `http://localhost:7200/repositories/langchain` peut être utilisé pour exécuter des requêtes. Vous pouvez également ouvrir le GraphDB Workbench à partir de votre navigateur Web préféré `http://localhost:7200/sparql` où vous pouvez faire des requêtes de manière interactive.
* Configurez l'environnement de travail

Si vous utilisez `conda`, créez et activez un nouvel environnement conda (par exemple `conda create -n graph_ontotext_graphdb_qa python=3.9.18`).

Installez les bibliothèques suivantes :

```bash
pip install jupyter==1.0.0
pip install openai==1.6.1
pip install rdflib==7.0.0
pip install langchain-openai==0.0.2
pip install langchain>=0.1.5
```

Exécutez Jupyter avec

```bash
jupyter notebook
```

## Spécification de l'ontologie

Afin que le LLM puisse générer du SPARQL, il doit connaître le schéma du graphe de connaissances (l'ontologie). Il peut être fourni à l'aide de l'un des deux paramètres de la classe `OntotextGraphDBGraph` :

* `query_ontology` : une requête `CONSTRUCT` qui est exécutée sur le point de terminaison SPARQL et renvoie les déclarations du schéma du graphe de connaissances. Nous vous recommandons de stocker l'ontologie dans son propre graphe nommé, ce qui facilitera l'obtention des seules déclarations pertinentes (comme dans l'exemple ci-dessous). Les requêtes `DESCRIBE` ne sont pas prises en charge, car `DESCRIBE` renvoie la description bornée concise symétrique (SCBD), c'est-à-dire également les liens de classe entrants. Dans le cas de grands graphes avec un million d'instances, cela n'est pas efficace. Vérifiez https://github.com/eclipse-rdf4j/rdf4j/issues/4857
* `local_file` : un fichier d'ontologie RDF local. Les formats RDF pris en charge sont `Turtle`, `RDF/XML`, `JSON-LD`, `N-Triples`, `Notation-3`, `Trig`, `Trix`, `N-Quads`.

Dans les deux cas, le dump d'ontologie doit :

* Inclure suffisamment d'informations sur les classes, les propriétés, l'attachement des propriétés aux classes (à l'aide de rdfs:domain, schema:domainIncludes ou de restrictions OWL) et les taxonomies (individus importants).
* Ne pas inclure de définitions et d'exemples trop verbeux et non pertinents qui ne contribuent pas à la construction de SPARQL.

```python
from langchain_community.graphs import OntotextGraphDBGraph

# feeding the schema using a user construct query

graph = OntotextGraphDBGraph(
    query_endpoint="http://localhost:7200/repositories/langchain",
    query_ontology="CONSTRUCT {?s ?p ?o} FROM <https://swapi.co/ontology/> WHERE {?s ?p ?o}",
)
```

```python
# feeding the schema using a local RDF file

graph = OntotextGraphDBGraph(
    query_endpoint="http://localhost:7200/repositories/langchain",
    local_file="/path/to/langchain_graphdb_tutorial/starwars-ontology.nt",  # change the path here
)
```

De toute façon, l'ontologie (schéma) est transmise au LLM sous forme de `Turtle` car `Turtle` avec les préfixes appropriés est le plus compact et le plus facile pour le LLM à mémoriser.

L'ontologie de Star Wars est un peu inhabituelle dans la mesure où elle inclut de nombreux triplets spécifiques sur les classes, par exemple que l'espèce `:Aleena` vit sur `<planet/38>`, qu'elle est une sous-classe de `:Reptile`, qu'elle a certaines caractéristiques typiques (taille moyenne, durée de vie moyenne, couleur de la peau) et que des individus spécifiques (personnages) en sont des représentants :

```output
@prefix : <https://swapi.co/vocabulary/> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

:Aleena a owl:Class, :Species ;
    rdfs:label "Aleena" ;
    rdfs:isDefinedBy <https://swapi.co/ontology/> ;
    rdfs:subClassOf :Reptile, :Sentient ;
    :averageHeight 80.0 ;
    :averageLifespan "79" ;
    :character <https://swapi.co/resource/aleena/47> ;
    :film <https://swapi.co/resource/film/4> ;
    :language "Aleena" ;
    :planet <https://swapi.co/resource/planet/38> ;
    :skinColor "blue", "gray" .

    ...

```

Afin de garder ce tutoriel simple, nous utilisons un GraphDB non sécurisé. Si GraphDB est sécurisé, vous devez définir les variables d'environnement 'GRAPHDB_USERNAME' et 'GRAPHDB_PASSWORD' avant l'initialisation de `OntotextGraphDBGraph`.

```python
os.environ["GRAPHDB_USERNAME"] = "graphdb-user"
os.environ["GRAPHDB_PASSWORD"] = "graphdb-password"

graph = OntotextGraphDBGraph(
    query_endpoint=...,
    query_ontology=...
)
```

## Réponse aux questions sur le jeu de données Star Wars

Nous pouvons maintenant utiliser `OntotextGraphDBQAChain` pour poser quelques questions.

```python
import os

from langchain.chains import OntotextGraphDBQAChain
from langchain_openai import ChatOpenAI

# We'll be using an OpenAI model which requires an OpenAI API Key.
# However, other models are available as well:
# https://python.langchain.com/docs/integrations/chat/

# Set the environment variable `OPENAI_API_KEY` to your OpenAI API key
os.environ["OPENAI_API_KEY"] = "sk-***"

# Any available OpenAI model can be used here.
# We use 'gpt-4-1106-preview' because of the bigger context window.
# The 'gpt-4-1106-preview' model_name will deprecate in the future and will change to 'gpt-4-turbo' or similar,
# so be sure to consult with the OpenAI API https://platform.openai.com/docs/models for the correct naming.

chain = OntotextGraphDBQAChain.from_llm(
    ChatOpenAI(temperature=0, model_name="gpt-4-1106-preview"),
    graph=graph,
    verbose=True,
)
```

Posons une question simple.

```python
chain.invoke({chain.input_key: "What is the climate on Tatooine?"})[chain.output_key]
```

```output


[1m> Entering new OntotextGraphDBQAChain chain...[0m
Generated SPARQL:
[32;1m[1;3mPREFIX : <https://swapi.co/vocabulary/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?climate
WHERE {
  ?planet rdfs:label "Tatooine" ;
          :climate ?climate .
}[0m

[1m> Finished chain.[0m
```

```output
'The climate on Tatooine is arid.'
```

Et une un peu plus compliquée.

```python
chain.invoke({chain.input_key: "What is the climate on Luke Skywalker's home planet?"})[
    chain.output_key
]
```

```output


[1m> Entering new OntotextGraphDBQAChain chain...[0m
Generated SPARQL:
[32;1m[1;3mPREFIX : <https://swapi.co/vocabulary/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?climate
WHERE {
  ?character rdfs:label "Luke Skywalker" .
  ?character :homeworld ?planet .
  ?planet :climate ?climate .
}[0m

[1m> Finished chain.[0m
```

```output
"The climate on Luke Skywalker's home planet is arid."
```

Nous pouvons également poser des questions plus complexes comme

```python
chain.invoke(
    {
        chain.input_key: "What is the average box office revenue for all the Star Wars movies?"
    }
)[chain.output_key]
```

```output


[1m> Entering new OntotextGraphDBQAChain chain...[0m
Generated SPARQL:
[32;1m[1;3mPREFIX : <https://swapi.co/vocabulary/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT (AVG(?boxOffice) AS ?averageBoxOffice)
WHERE {
  ?film a :Film .
  ?film :boxOffice ?boxOfficeValue .
  BIND(xsd:decimal(?boxOfficeValue) AS ?boxOffice)
}
[0m

[1m> Finished chain.[0m
```

```output
'The average box office revenue for all the Star Wars movies is approximately 754.1 million dollars.'
```

## Modificateurs de chaîne

La chaîne de questions-réponses GraphDB d'Ontotext permet d'affiner les invites pour améliorer davantage votre chaîne de questions-réponses et d'améliorer l'expérience utilisateur globale de votre application.

### Invite de "Génération SPARQL"

L'invite est utilisée pour la génération de requêtes SPARQL en fonction de la question de l'utilisateur et du schéma du graphe de connaissances.

- `sparql_generation_prompt`

    Valeur par défaut :
  ````python
    GRAPHDB_SPARQL_GENERATION_TEMPLATE = """
    Écrivez une requête SPARQL SELECT pour interroger une base de données de graphes.
    L'ontologie du schéma délimitée par des triples backticks au format Turtle est :
    ```
    {schema}
    ```
    Utilisez uniquement les classes et les propriétés fournies dans le schéma pour construire la requête SPARQL.
    N'utilisez aucune classe ou propriété qui n'est pas explicitement fournie dans la requête SPARQL.
    Incluez tous les préfixes nécessaires.
    N'incluez aucune explication ou excuse dans vos réponses.
    Ne mettez pas la requête entre backticks.
    N'incluez aucun autre texte que la requête SPARQL générée.
    La question délimitée par des triples backticks est :
    ```
    {prompt}
    ```
    """
    GRAPHDB_SPARQL_GENERATION_PROMPT = PromptTemplate(
        input_variables=["schema", "prompt"],
        template=GRAPHDB_SPARQL_GENERATION_TEMPLATE,
    )
  ````

### Invite de "Correction SPARQL"

Parfois, le LLM peut générer une requête SPARQL avec des erreurs syntaxiques ou des préfixes manquants, etc. La chaîne essaiera de la corriger en invitant le LLM à la corriger un certain nombre de fois.

- `sparql_fix_prompt`

    Valeur par défaut :
  ````python
    GRAPHDB_SPARQL_FIX_TEMPLATE = """
    Cette requête SPARQL délimitée par des triples backticks
    ```
    {generated_sparql}
    ```
    n'est pas valide.
    L'erreur délimitée par des triples backticks est
    ```
    {error_message}
    ```
    Donnez-moi une version correcte de la requête SPARQL.
    Ne modifiez pas la logique de la requête.
    N'incluez aucune explication ou excuse dans vos réponses.
    Ne mettez pas la requête entre backticks.
    N'incluez aucun autre texte que la requête SPARQL générée.
    L'ontologie du schéma délimitée par des triples backticks au format Turtle est :
    ```
    {schema}
    ```
    """

    GRAPHDB_SPARQL_FIX_PROMPT = PromptTemplate(
        input_variables=["error_message", "generated_sparql", "schema"],
        template=GRAPHDB_SPARQL_FIX_TEMPLATE,
    )
  ````

- `max_fix_retries`

    Valeur par défaut : `5`

### "Répondre" à l'invite

L'invite est utilisée pour répondre à la question en fonction des résultats renvoyés par la base de données et de la question initiale de l'utilisateur. Par défaut, le LLM reçoit l'instruction de n'utiliser que les informations provenant du(des) résultat(s) renvoyé(s). Si l'ensemble des résultats est vide, le LLM doit informer qu'il ne peut pas répondre à la question.

- `qa_prompt`

  Valeur par défaut :
  ````python
    GRAPHDB_QA_TEMPLATE = """Tâche : Générer une réponse en langage naturel à partir des résultats d'une requête SPARQL.
    Vous êtes un assistant qui crée des réponses bien écrites et compréhensibles par l'humain.
    La partie information contient les informations fournies, que vous pouvez utiliser pour construire une réponse.
    Les informations fournies sont fiables, vous ne devez jamais les remettre en question ou essayer d'utiliser vos connaissances internes pour les corriger.
    Faites en sorte que votre réponse sonne comme si les informations provenaient d'un assistant IA, mais n'ajoutez aucune information.
    N'utilisez pas de connaissances internes pour répondre à la question, dites simplement que vous ne savez pas s'il n'y a pas d'informations disponibles.
    Informations :
    {context}

    Question : {prompt}
    Réponse utile :"""
    GRAPHDB_QA_PROMPT = PromptTemplate(
        input_variables=["context", "prompt"], template=GRAPHDB_QA_TEMPLATE
    )
  ````

Une fois que vous aurez fini de jouer avec QA avec GraphDB, vous pourrez arrêter l'environnement Docker en exécutant
``
docker compose down -v --remove-orphans
``
depuis le répertoire contenant le fichier Docker compose.
