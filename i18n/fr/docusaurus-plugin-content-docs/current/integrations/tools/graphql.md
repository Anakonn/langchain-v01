---
translated: true
---

# GraphQL

>[GraphQL](https://graphql.org/) est un langage de requête pour les API et un runtime pour exécuter ces requêtes sur vos données. `GraphQL` fournit une description complète et compréhensible des données de votre API, donne aux clients le pouvoir de demander exactement ce dont ils ont besoin et rien de plus, facilite l'évolution des API au fil du temps et permet des outils de développement puissants.

En incluant un `BaseGraphQLTool` dans la liste des outils fournis à un Agent, vous pouvez accorder à votre Agent la capacité de requêter des données à partir d'API GraphQL pour tous les besoins dont vous avez besoin.

Ce Jupyter Notebook montre comment utiliser le composant `GraphQLAPIWrapper` avec un Agent.

Dans cet exemple, nous utiliserons l'API GraphQL publique `Star Wars` disponible à l'adresse suivante : https://swapi-graphql.netlify.app/.netlify/functions/index.

Tout d'abord, vous devez installer les packages Python `httpx` et `gql`.

```python
pip install httpx gql > /dev/null
```

Maintenant, créons une instance de BaseGraphQLTool avec le point de terminaison de l'API Star Wars spécifié et initialisons un Agent avec l'outil.

```python
from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)

tools = load_tools(
    ["graphql"],
    graphql_endpoint="https://swapi-graphql.netlify.app/.netlify/functions/index",
)

agent = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
```

Maintenant, nous pouvons utiliser l'Agent pour exécuter des requêtes sur l'API GraphQL de Star Wars. Demandons à l'Agent de lister tous les films de Star Wars et leurs dates de sortie.

```python
graphql_fields = """allFilms {
    films {
      title
      director
      releaseDate
      speciesConnection {
        species {
          name
          classification
          homeworld {
            name
          }
        }
      }
    }
  }

"""

suffix = "Search for the titles of all the stawars films stored in the graphql database that has this schema "


agent.run(suffix + graphql_fields)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to query the graphql database to get the titles of all the star wars films
Action: query_graphql
Action Input: query { allFilms { films { title } } }[0m
Observation: [36;1m[1;3m"{\n  \"allFilms\": {\n    \"films\": [\n      {\n        \"title\": \"A New Hope\"\n      },\n      {\n        \"title\": \"The Empire Strikes Back\"\n      },\n      {\n        \"title\": \"Return of the Jedi\"\n      },\n      {\n        \"title\": \"The Phantom Menace\"\n      },\n      {\n        \"title\": \"Attack of the Clones\"\n      },\n      {\n        \"title\": \"Revenge of the Sith\"\n      }\n    ]\n  }\n}"[0m
Thought:[32;1m[1;3m I now know the titles of all the star wars films
Final Answer: The titles of all the star wars films are: A New Hope, The Empire Strikes Back, Return of the Jedi, The Phantom Menace, Attack of the Clones, and Revenge of the Sith.[0m

[1m> Finished chain.[0m
```

```output
'The titles of all the star wars films are: A New Hope, The Empire Strikes Back, Return of the Jedi, The Phantom Menace, Attack of the Clones, and Revenge of the Sith.'
```
