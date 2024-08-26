---
translated: true
---

# GraphQL

>[GraphQL](https://graphql.org/) एक एपीआई के लिए एक क्वेरी भाषा और उन क्वेरियों को आपके डेटा के खिलाफ निष्पादित करने के लिए एक रनटाइम है। `GraphQL` आपके एपीआई में डेटा का एक पूर्ण और समझने योग्य वर्णन प्रदान करता है, क्लाइंटों को वही कुछ मांगने और कुछ भी नहीं मांगने की शक्ति देता है, एपीआई को समय के साथ विकसित करना आसान बनाता है, और शक्तिशाली डेवलपर टूल्स को सक्षम करता है।

एक एजेंट को प्रदान किए गए उपकरणों की सूची में `BaseGraphQLTool` शामिल करके, आप अपने एजेंट को किसी भी उद्देश्य के लिए GraphQL एपीआई से डेटा क्वेरी करने की क्षमता प्रदान कर सकते हैं।

यह Jupyter Notebook एक एजेंट के साथ `GraphQLAPIWrapper` घटक का उपयोग करने का प्रदर्शन करता है।

इस उदाहरण में, हम निम्नलिखित एंडपॉइंट पर उपलब्ध सार्वजनिक `Star Wars GraphQL API` का उपयोग करेंगे: https://swapi-graphql.netlify.app/.netlify/functions/index।

पहले, आपको `httpx` और `gql` Python पैकेज इंस्टॉल करने की आवश्यकता है।

```python
pip install httpx gql > /dev/null
```

अब, चलो स्पेसिफाइड स्टार वॉर्स एपीआई एंडपॉइंट के साथ एक BaseGraphQLTool इंस्टेंस बनाते हैं और एक एजेंट को उपकरण के साथ इनिशियलाइज़ करते हैं।

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

अब, हम एजेंट का उपयोग करके स्टार वॉर्स GraphQL एपीआई के खिलाफ क्वेरी चला सकते हैं। चलो एजेंट से सभी स्टार वॉर्स फिल्मों और उनकी रिलीज तारीखों की सूची मांगते हैं।

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
