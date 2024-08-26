---
translated: true
---

# GraphQL

>[GraphQL](https://graphql.org/) es un lenguaje de consulta para APIs y un entorno de ejecución para ejecutar esas consultas en tus datos. `GraphQL` proporciona una descripción completa y comprensible de los datos en tu API, da a los clientes el poder de pedir exactamente lo que necesitan y nada más, facilita la evolución de las APIs a lo largo del tiempo y permite potentes herramientas de desarrollo.

Al incluir un `BaseGraphQLTool` en la lista de herramientas proporcionadas a un Agente, puedes otorgar a tu Agente la capacidad de consultar datos de las API de GraphQL para cualquier propósito que necesites.

Este cuaderno de Jupyter demuestra cómo usar el componente `GraphQLAPIWrapper` con un Agente.

En este ejemplo, utilizaremos la API pública de `Star Wars GraphQL` disponible en el siguiente punto final: https://swapi-graphql.netlify.app/.netlify/functions/index.

Primero, debes instalar los paquetes de Python `httpx` y `gql`.

```python
pip install httpx gql > /dev/null
```

Ahora, creemos una instancia de BaseGraphQLTool con el punto final de la API de Star Wars especificado e inicialicemos un Agente con la herramienta.

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

Ahora, podemos usar el Agente para ejecutar consultas en la API de GraphQL de Star Wars. Pidamos al Agente que enumere todas las películas de Star Wars y sus fechas de estreno.

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
