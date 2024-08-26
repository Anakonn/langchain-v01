---
translated: true
---

# GraphQL

>[GraphQL](https://graphql.org/)は、APIのクエリ言語およびそれらのクエリを自分のデータに対して実行するためのランタイムです。`GraphQL`は、APIのデータに関する完全で理解しやすい説明を提供し、クライアントに必要なものだけを要求する力を与え、時間の経過とともにAPIを進化させることを容易にし、強力な開発者ツールを可能にします。

`BaseGraphQLTool`をAgentに提供されるツールのリストに含めることで、Agentにデータを照会する機能を付与できます。

このJupyter Notebookでは、`GraphQLAPIWrapper`コンポーネントをAgentと共に使用する方法を示します。

この例では、次のエンドポイントで利用可能な公開`Star Wars GraphQL API`を使用します: https://swapi-graphql.netlify.app/.netlify/functions/index.

まず、`httpx`と`gql`のPythonパッケージをインストールする必要があります。

```python
pip install httpx gql > /dev/null
```

次に、指定のStar Wars APIエンドポイントを使用してBaseGraphQLToolインスタンスを作成し、ツールを使ってAgentを初期化します。

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

これで、Agentを使ってStar Wars GraphQL APIに対してクエリを実行できます。Agentに、すべてのStar Warsの映画とその公開日を一覧表示するよう依頼しましょう。

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
