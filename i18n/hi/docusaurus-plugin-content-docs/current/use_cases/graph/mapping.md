---
sidebar_position: 1
translated: true
---

# डेटाबेस में मूल्यों को मैप करना

इस गाइड में हम उपयोगकर्ता इनपुट से डेटाबेस में संग्रहीत गुणों के मूल्यों को मैप करके ग्राफ डेटाबेस क्वेरी जनरेशन को बेहतर बनाने के लिए रणनीतियों पर चर्चा करेंगे।
बिल्ट-इन ग्राफ श्रृंखलाओं का उपयोग करते समय, LLM ग्राफ स्कीमा से अवगत है, लेकिन डेटाबेस में संग्रहीत गुणों के मूल्यों के बारे में कोई जानकारी नहीं है।
इसलिए, हम ग्राफ डेटाबेस QA सिस्टम में एक नया कदम पेश कर सकते हैं ताकि मूल्यों को सटीक ढंग से मैप किया जा सके।

## सेटअप

पहले, आवश्यक पैकेज प्राप्त करें और पर्यावरण चर सेट करें:

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai neo4j
```

हम इस गाइड में OpenAI मॉडल का डिफ़ॉल्ट उपयोग करते हैं, लेकिन आप अपनी पसंद के मॉडल प्रदाता को बदल सकते हैं।

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

अब, हमें Neo4j क्रेडेंशियल को परिभाषित करना होगा।
एक Neo4j डेटाबेस सेट अप करने के लिए [इन स्थापना चरणों](https://neo4j.com/docs/operations-manual/current/installation/) का पालन करें।

```python
os.environ["NEO4J_URI"] = "bolt://localhost:7687"
os.environ["NEO4J_USERNAME"] = "neo4j"
os.environ["NEO4J_PASSWORD"] = "password"
```

नीचे दिया गया उदाहरण एक Neo4j डेटाबेस के साथ कनेक्शन बनाएगा और फिल्मों और उनके अभिनेताओं के बारे में उदाहरण डेटा से इसे भर देगा।

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

## उपयोगकर्ता इनपुट में इकाइयों का पता लगाना

हमें उन इकाइयों/मूल्यों के प्रकारों को निकालना होगा जिन्हें हम ग्राफ डेटाबेस में मैप करना चाहते हैं। इस उदाहरण में, हम एक मूवी ग्राफ के साथ काम कर रहे हैं, इसलिए हम मूवी और लोगों को डेटाबेस में मैप कर सकते हैं।

```python
from typing import List, Optional

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)


class Entities(BaseModel):
    """Identifying information about entities."""

    names: List[str] = Field(
        ...,
        description="All the person or movies appearing in the text",
    )


prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are extracting person and movies from the text.",
        ),
        (
            "human",
            "Use the given format to extract information from the following "
            "input: {question}",
        ),
    ]
)


entity_chain = prompt | llm.with_structured_output(Entities)
```

हम इकाई निकालने श्रृंखला का परीक्षण कर सकते हैं।

```python
entities = entity_chain.invoke({"question": "Who played in Casino movie?"})
entities
```

```output
Entities(names=['Casino'])
```

हम डेटाबेस में इकाइयों को मैच करने के लिए एक सरल `CONTAINS` क्लॉज का उपयोग करेंगे। व्यवहार में, आप छोटी-मोटी गलतियों की अनुमति देने के लिए एक फ़्यूज़ी खोज या एक पूर्णपाठ सूचकांक का उपयोग करना चाहते हैं।

```python
match_query = """MATCH (p:Person|Movie)
WHERE p.name CONTAINS $value OR p.title CONTAINS $value
RETURN coalesce(p.name, p.title) AS result, labels(p)[0] AS type
LIMIT 1
"""


def map_to_database(entities: Entities) -> Optional[str]:
    result = ""
    for entity in entities.names:
        response = graph.query(match_query, {"value": entity})
        try:
            result += f"{entity} maps to {response[0]['result']} {response[0]['type']} in database\n"
        except IndexError:
            pass
    return result


map_to_database(entities)
```

```output
'Casino maps to Casino Movie in database\n'
```

## कस्टम Cypher जनरेशन श्रृंखला

हमें एक कस्टम Cypher प्रॉम्प्ट को परिभाषित करने की आवश्यकता है जो इकाई मैपिंग जानकारी के साथ-साथ स्कीमा और उपयोगकर्ता प्रश्न को लेकर एक Cypher बयान का निर्माण करता है।
हम इसे प्राप्त करने के लिए LangChain अभिव्यक्ति भाषा का उपयोग करेंगे।

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# Generate Cypher statement based on natural language input
cypher_template = """Based on the Neo4j graph schema below, write a Cypher query that would answer the user's question:
{schema}
Entities in the question map to the following database values:
{entities_list}
Question: {question}
Cypher query:"""  # noqa: E501

cypher_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Given an input question, convert it to a Cypher query. No pre-amble.",
        ),
        ("human", cypher_template),
    ]
)

cypher_response = (
    RunnablePassthrough.assign(names=entity_chain)
    | RunnablePassthrough.assign(
        entities_list=lambda x: map_to_database(x["names"]),
        schema=lambda _: graph.get_schema,
    )
    | cypher_prompt
    | llm.bind(stop=["\nCypherResult:"])
    | StrOutputParser()
)
```

```python
cypher = cypher_response.invoke({"question": "Who played in Casino movie?"})
cypher
```

```output
'MATCH (:Movie {title: "Casino"})<-[:ACTED_IN]-(actor)\nRETURN actor.name'
```

## डेटाबेस परिणामों के आधार पर उत्तर जनरेट करना

अब जब हमारे पास Cypher बयान जनरेट करने वाली श्रृंखला है, तो हमें Cypher बयान को डेटाबेस के खिलाफ निष्पादित करना और अंतिम उत्तर जनरेट करने के लिए इसे एक LLM को भेजना होगा।
फिर से, हम LCEL का उपयोग करेंगे।

```python
from langchain.chains.graph_qa.cypher_utils import CypherQueryCorrector, Schema

# Cypher validation tool for relationship directions
corrector_schema = [
    Schema(el["start"], el["type"], el["end"])
    for el in graph.structured_schema.get("relationships")
]
cypher_validation = CypherQueryCorrector(corrector_schema)

# Generate natural language response based on database results
response_template = """Based on the the question, Cypher query, and Cypher response, write a natural language response:
Question: {question}
Cypher query: {query}
Cypher Response: {response}"""  # noqa: E501

response_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Given an input question and Cypher response, convert it to a natural"
            " language answer. No pre-amble.",
        ),
        ("human", response_template),
    ]
)

chain = (
    RunnablePassthrough.assign(query=cypher_response)
    | RunnablePassthrough.assign(
        response=lambda x: graph.query(cypher_validation(x["query"])),
    )
    | response_prompt
    | llm
    | StrOutputParser()
)
```

```python
chain.invoke({"question": "Who played in Casino movie?"})
```

```output
'Robert De Niro, James Woods, Joe Pesci, and Sharon Stone played in the movie "Casino".'
```
