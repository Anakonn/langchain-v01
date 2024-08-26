---
sidebar_position: 1
translated: true
---

# ग्राफ़ डेटाबेस पर सेमांटिक लेयर

आप ग्राफ़ डेटाबेस जैसे Neo4j से जानकारी प्राप्त करने के लिए डेटाबेस क्वेरी का उपयोग कर सकते हैं।
एक विकल्प LLM का उपयोग करके Cypher बयानों को जनरेट करना है।
हालांकि, यह विकल्प उत्कृष्ट लचीलापन प्रदान करता है, लेकिन समाधान कमजोर हो सकता है और सटीक Cypher बयान नहीं बना सकता है।
Cypher बयानों को जनरेट करने के बजाय, हम Cypher टेम्प्लेट को एक सेमांटिक लेयर में उपकरण के रूप में लागू कर सकते हैं जिससे एक LLM एजेंट बातचीत कर सकता है।

![graph_semantic.png](../../../../../../static/img/graph_semantic.png)

## सेटअप

पहले, आवश्यक पैकेज प्राप्त करें और पर्यावरण चर सेट करें:

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai neo4j
```

```output
Note: you may need to restart the kernel to use updated packages.
```

हम इस गाइड में OpenAI मॉडल का उपयोग करते हैं, लेकिन आप अपनी पसंद के मॉडल प्रदाता को बदल सकते हैं।

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

अगला, हमें Neo4j क्रेडेंशियल को परिभाषित करना होगा।
एक Neo4j डेटाबेस सेट अप करने के लिए [ये स्थापना चरण](https://neo4j.com/docs/operations-manual/current/installation/) का पालन करें।

```python
os.environ["NEO4J_URI"] = "bolt://localhost:7687"
os.environ["NEO4J_USERNAME"] = "neo4j"
os.environ["NEO4J_PASSWORD"] = "password"
```

नीचे दिया गया उदाहरण एक Neo4j डेटाबेस के साथ कनेक्शन बनाएगा और फिल्मों और उनके अभिनेताओं के बारे में उदाहरण डेटा से भर देगा।

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

## Cypher टेम्प्लेट के साथ कस्टम उपकरण

एक सेमांटिक लेयर में विभिन्न उपकरण होते हैं जो एक LLM को ज्ञान ग्राफ के साथ बातचीत करने के लिए प्रदर्शित किए जाते हैं।
वे विभिन्न जटिलता के हो सकते हैं। आप प्रत्येक उपकरण को एक सेमांटिक लेयर में एक फ़ंक्शन के रूप में सोच सकते हैं।

हम जो कार्यक्षमता लागू करेंगे वह फिल्मों या उनके कास्ट के बारे में जानकारी प्राप्त करना है।

```python
from typing import Optional, Type

from langchain.callbacks.manager import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)

# Import things that are needed generically
from langchain.pydantic_v1 import BaseModel, Field
from langchain.tools import BaseTool

description_query = """
MATCH (m:Movie|Person)
WHERE m.title CONTAINS $candidate OR m.name CONTAINS $candidate
MATCH (m)-[r:ACTED_IN|HAS_GENRE]-(t)
WITH m, type(r) as type, collect(coalesce(t.name, t.title)) as names
WITH m, type+": "+reduce(s="", n IN names | s + n + ", ") as types
WITH m, collect(types) as contexts
WITH m, "type:" + labels(m)[0] + "\ntitle: "+ coalesce(m.title, m.name)
       + "\nyear: "+coalesce(m.released,"") +"\n" +
       reduce(s="", c in contexts | s + substring(c, 0, size(c)-2) +"\n") as context
RETURN context LIMIT 1
"""


def get_information(entity: str) -> str:
    try:
        data = graph.query(description_query, params={"candidate": entity})
        return data[0]["context"]
    except IndexError:
        return "No information was found"
```

आप देख सकते हैं कि हमने जानकारी प्राप्त करने के लिए उपयोग किए जाने वाले Cypher बयान को परिभाषित किया है।
इसलिए, हम Cypher बयानों को जनरेट करने से बच सकते हैं और LLM एजेंट का उपयोग केवल इनपुट पैरामीटर भरने के लिए कर सकते हैं।
एक LLM एजेंट को उपकरण का उपयोग करने और इनपुट पैरामीटर के बारे में अतिरिक्त जानकारी प्रदान करने के लिए, हम फ़ंक्शन को एक उपकरण के रूप में लपेटते हैं।

```python
from typing import Optional, Type

from langchain.callbacks.manager import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)

# Import things that are needed generically
from langchain.pydantic_v1 import BaseModel, Field
from langchain.tools import BaseTool


class InformationInput(BaseModel):
    entity: str = Field(description="movie or a person mentioned in the question")


class InformationTool(BaseTool):
    name = "Information"
    description = (
        "useful for when you need to answer questions about various actors or movies"
    )
    args_schema: Type[BaseModel] = InformationInput

    def _run(
        self,
        entity: str,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        """Use the tool."""
        return get_information(entity)

    async def _arun(
        self,
        entity: str,
        run_manager: Optional[AsyncCallbackManagerForToolRun] = None,
    ) -> str:
        """Use the tool asynchronously."""
        return get_information(entity)
```

## OpenAI एजेंट

LangChain अभिव्यक्ति भाषा एक ग्राफ़ डेटाबेस पर सेमांटिक लेयर के माध्यम से एक एजेंट को परिभाषित करने के लिए बहुत सुविधाजनक बनाती है।

```python
from typing import List, Tuple

from langchain.agents import AgentExecutor
from langchain.agents.format_scratchpad import format_to_openai_function_messages
from langchain.agents.output_parsers import OpenAIFunctionsAgentOutputParser
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.utils.function_calling import convert_to_openai_function
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
tools = [InformationTool()]

llm_with_tools = llm.bind(functions=[convert_to_openai_function(t) for t in tools])

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant that finds information about movies "
            " and recommends them. If tools require follow up questions, "
            "make sure to ask the user for clarification. Make sure to include any "
            "available options that need to be clarified in the follow up questions "
            "Do only the things the user specifically requested. ",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)


def _format_chat_history(chat_history: List[Tuple[str, str]]):
    buffer = []
    for human, ai in chat_history:
        buffer.append(HumanMessage(content=human))
        buffer.append(AIMessage(content=ai))
    return buffer


agent = (
    {
        "input": lambda x: x["input"],
        "chat_history": lambda x: _format_chat_history(x["chat_history"])
        if x.get("chat_history")
        else [],
        "agent_scratchpad": lambda x: format_to_openai_function_messages(
            x["intermediate_steps"]
        ),
    }
    | prompt
    | llm_with_tools
    | OpenAIFunctionsAgentOutputParser()
)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

```python
agent_executor.invoke({"input": "Who played in Casino?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `Information` with `{'entity': 'Casino'}`


[0m[36;1m[1;3mtype:Movie
title: Casino
year: 1995-11-22
ACTED_IN: Joe Pesci, Robert De Niro, Sharon Stone, James Woods
[0m[32;1m[1;3mThe movie "Casino" starred Joe Pesci, Robert De Niro, Sharon Stone, and James Woods.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'Who played in Casino?',
 'output': 'The movie "Casino" starred Joe Pesci, Robert De Niro, Sharon Stone, and James Woods.'}
```
