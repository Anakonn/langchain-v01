---
translated: true
---

# NebulaGraph

>[NebulaGraph](https://www.nebula-graph.io/) est une base de données de graphes open-source, distribuée, évolutive et ultra-rapide, conçue pour les graphes à très grande échelle avec des latences de l'ordre de la milliseconde. Elle utilise le langage de requête de graphe `nGQL`.

>[nGQL](https://docs.nebula-graph.io/3.0.0/3.ngql-guide/1.nGQL-overview/1.overview/) est un langage de requête de graphe déclaratif pour `NebulaGraph`. Il permet des motifs de graphe expressifs et efficaces. `nGQL` est conçu à la fois pour les développeurs et les professionnels des opérations. `nGQL` est un langage de requête similaire à SQL.

Ce notebook montre comment utiliser les LLM pour fournir une interface en langage naturel à la base de données `NebulaGraph`.

## Configuration

Vous pouvez démarrer le cluster `NebulaGraph` en tant que conteneur Docker en exécutant le script suivant :

```bash
curl -fsSL nebula-up.siwei.io/install.sh | bash
```

Autres options :
- Installer en tant qu'[extension Docker Desktop](https://www.docker.com/blog/distributed-cloud-native-graph-database-nebulagraph-docker-extension/). Voir [ici](https://docs.nebula-graph.io/3.5.0/2.quick-start/1.quick-start-workflow/)
- Service NebulaGraph Cloud. Voir [ici](https://www.nebula-graph.io/cloud)
- Déployer à partir de packages, du code source ou via Kubernetes. Voir [ici](https://docs.nebula-graph.io/)

Une fois le cluster en cours d'exécution, nous pouvons créer l'`ESPACE` et le `SCHÉMA` pour la base de données.

```python
%pip install --upgrade --quiet  ipython-ngql
%load_ext ngql

# connect ngql jupyter extension to nebulagraph
%ngql --address 127.0.0.1 --port 9669 --user root --password nebula
# create a new space
%ngql CREATE SPACE IF NOT EXISTS langchain(partition_num=1, replica_factor=1, vid_type=fixed_string(128));
```

```python
# Wait for a few seconds for the space to be created.
%ngql USE langchain;
```

Créer le schéma, pour le jeu de données complet, se référer [ici](https://www.siwei.io/en/nebulagraph-etl-dbt/).

```python
%%ngql
CREATE TAG IF NOT EXISTS movie(name string);
CREATE TAG IF NOT EXISTS person(name string, birthdate string);
CREATE EDGE IF NOT EXISTS acted_in();
CREATE TAG INDEX IF NOT EXISTS person_index ON person(name(128));
CREATE TAG INDEX IF NOT EXISTS movie_index ON movie(name(128));
```

Attendez que la création du schéma soit terminée, puis nous pouvons insérer quelques données.

```python
%%ngql
INSERT VERTEX person(name, birthdate) VALUES "Al Pacino":("Al Pacino", "1940-04-25");
INSERT VERTEX movie(name) VALUES "The Godfather II":("The Godfather II");
INSERT VERTEX movie(name) VALUES "The Godfather Coda: The Death of Michael Corleone":("The Godfather Coda: The Death of Michael Corleone");
INSERT EDGE acted_in() VALUES "Al Pacino"->"The Godfather II":();
INSERT EDGE acted_in() VALUES "Al Pacino"->"The Godfather Coda: The Death of Michael Corleone":();
```

```python
from langchain.chains import NebulaGraphQAChain
from langchain_community.graphs import NebulaGraph
from langchain_openai import ChatOpenAI
```

```python
graph = NebulaGraph(
    space="langchain",
    username="root",
    password="nebula",
    address="127.0.0.1",
    port=9669,
    session_pool_size=30,
)
```

## Rafraîchir les informations du schéma de graphe

Si le schéma de la base de données change, vous pouvez rafraîchir les informations de schéma nécessaires pour générer les instructions nGQL.

```python
# graph.refresh_schema()
```

```python
print(graph.get_schema)
```

```output
Node properties: [{'tag': 'movie', 'properties': [('name', 'string')]}, {'tag': 'person', 'properties': [('name', 'string'), ('birthdate', 'string')]}]
Edge properties: [{'edge': 'acted_in', 'properties': []}]
Relationships: ['(:person)-[:acted_in]->(:movie)']
```

## Interroger le graphe

Nous pouvons maintenant utiliser la chaîne de questions-réponses Cypher du graphe pour poser des questions au graphe.

```python
chain = NebulaGraphQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True
)
```

```python
chain.run("Who played in The Godfather II?")
```

```output


[1m> Entering new NebulaGraphQAChain chain...[0m
Generated nGQL:
[32;1m[1;3mMATCH (p:`person`)-[:acted_in]->(m:`movie`) WHERE m.`movie`.`name` == 'The Godfather II'
RETURN p.`person`.`name`[0m
Full Context:
[32;1m[1;3m{'p.person.name': ['Al Pacino']}[0m

[1m> Finished chain.[0m
```

```output
'Al Pacino played in The Godfather II.'
```
