---
sidebar_position: 2
translated: true
---

# प्रेरण रणनीतियां

इस गाइड में हम ग्राफ डेटाबेस क्वेरी जनरेशन को बेहतर बनाने के लिए प्रेरण रणनीतियों पर चर्चा करेंगे। हम मुख्य रूप से अपने प्रश्न में प्रासंगिक डेटाबेस-विशिष्ट जानकारी प्राप्त करने के तरीकों पर ध्यान केंद्रित करेंगे।

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

अब, हमें Neo4j क्रेडेंशियल परिभाषित करने की आवश्यकता है।
[ये स्थापना चरण](https://neo4j.com/docs/operations-manual/current/installation/) का पालन करें ताकि एक Neo4j डेटाबेस सेट अप किया जा सके।

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

# ग्राफ स्कीमा फ़िल्टरिंग

कभी-कभी, आप Cypher बयानों को जनरेट करते समय ग्राफ स्कीमा के विशिष्ट उपसमूह पर ध्यान केंद्रित करना चाह सकते हैं।
मान लीजिए कि हम निम्नलिखित ग्राफ स्कीमा से काम कर रहे हैं:

```python
graph.refresh_schema()
print(graph.schema)
```

```output
Node properties are the following:
Movie {imdbRating: FLOAT, id: STRING, released: DATE, title: STRING},Person {name: STRING},Genre {name: STRING}
Relationship properties are the following:

The relationships are the following:
(:Movie)-[:IN_GENRE]->(:Genre),(:Person)-[:DIRECTED]->(:Movie),(:Person)-[:ACTED_IN]->(:Movie)
```

मान लीजिए कि हम _Genre_ नोड को स्कीमा प्रतिनिधित्व से बाहर करना चाहते हैं।
हम GraphCypherQAChain श्रृंखला के `exclude` पैरामीटर का उपयोग करके ऐसा कर सकते हैं।

```python
from langchain.chains import GraphCypherQAChain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
chain = GraphCypherQAChain.from_llm(
    graph=graph, llm=llm, exclude_types=["Genre"], verbose=True
)
```

```python
print(chain.graph_schema)
```

```output
Node properties are the following:
Movie {imdbRating: FLOAT, id: STRING, released: DATE, title: STRING},Person {name: STRING}
Relationship properties are the following:

The relationships are the following:
(:Person)-[:DIRECTED]->(:Movie),(:Person)-[:ACTED_IN]->(:Movie)
```

## कुछ-शॉट उदाहरण

हमारे डेटाबेस के खिलाफ प्राकृतिक भाषा प्रश्नों को मान्य Cypher क्वेरियों में रूपांतरित करने के उदाहरणों को प्रश्न में शामिल करना मॉडल प्रदर्शन को अक्सर बेहतर बना देता है, खासकर जटिल क्वेरियों के लिए।

मान लीजिए कि हमारे पास निम्नलिखित उदाहरण हैं:

```python
examples = [
    {
        "question": "How many artists are there?",
        "query": "MATCH (a:Person)-[:ACTED_IN]->(:Movie) RETURN count(DISTINCT a)",
    },
    {
        "question": "Which actors played in the movie Casino?",
        "query": "MATCH (m:Movie {{title: 'Casino'}})<-[:ACTED_IN]-(a) RETURN a.name",
    },
    {
        "question": "How many movies has Tom Hanks acted in?",
        "query": "MATCH (a:Person {{name: 'Tom Hanks'}})-[:ACTED_IN]->(m:Movie) RETURN count(m)",
    },
    {
        "question": "List all the genres of the movie Schindler's List",
        "query": "MATCH (m:Movie {{title: 'Schindler\\'s List'}})-[:IN_GENRE]->(g:Genre) RETURN g.name",
    },
    {
        "question": "Which actors have worked in movies from both the comedy and action genres?",
        "query": "MATCH (a:Person)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g1:Genre), (a)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g2:Genre) WHERE g1.name = 'Comedy' AND g2.name = 'Action' RETURN DISTINCT a.name",
    },
    {
        "question": "Which directors have made movies with at least three different actors named 'John'?",
        "query": "MATCH (d:Person)-[:DIRECTED]->(m:Movie)<-[:ACTED_IN]-(a:Person) WHERE a.name STARTS WITH 'John' WITH d, COUNT(DISTINCT a) AS JohnsCount WHERE JohnsCount >= 3 RETURN d.name",
    },
    {
        "question": "Identify movies where directors also played a role in the film.",
        "query": "MATCH (p:Person)-[:DIRECTED]->(m:Movie), (p)-[:ACTED_IN]->(m) RETURN m.title, p.name",
    },
    {
        "question": "Find the actor with the highest number of movies in the database.",
        "query": "MATCH (a:Actor)-[:ACTED_IN]->(m:Movie) RETURN a.name, COUNT(m) AS movieCount ORDER BY movieCount DESC LIMIT 1",
    },
]
```

हम उन्हें इस तरह से एक कुछ-शॉट प्रश्न बना सकते हैं:

```python
from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate

example_prompt = PromptTemplate.from_template(
    "User input: {question}\nCypher query: {query}"
)
prompt = FewShotPromptTemplate(
    examples=examples[:5],
    example_prompt=example_prompt,
    prefix="You are a Neo4j expert. Given an input question, create a syntactically correct Cypher query to run.\n\nHere is the schema information\n{schema}.\n\nBelow are a number of examples of questions and their corresponding Cypher queries.",
    suffix="User input: {question}\nCypher query: ",
    input_variables=["question", "schema"],
)
```

```python
print(prompt.format(question="How many artists are there?", schema="foo"))
```

```output
You are a Neo4j expert. Given an input question, create a syntactically correct Cypher query to run.

Here is the schema information
foo.

Below are a number of examples of questions and their corresponding Cypher queries.

User input: How many artists are there?
Cypher query: MATCH (a:Person)-[:ACTED_IN]->(:Movie) RETURN count(DISTINCT a)

User input: Which actors played in the movie Casino?
Cypher query: MATCH (m:Movie {title: 'Casino'})<-[:ACTED_IN]-(a) RETURN a.name

User input: How many movies has Tom Hanks acted in?
Cypher query: MATCH (a:Person {name: 'Tom Hanks'})-[:ACTED_IN]->(m:Movie) RETURN count(m)

User input: List all the genres of the movie Schindler's List
Cypher query: MATCH (m:Movie {title: 'Schindler\'s List'})-[:IN_GENRE]->(g:Genre) RETURN g.name

User input: Which actors have worked in movies from both the comedy and action genres?
Cypher query: MATCH (a:Person)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g1:Genre), (a)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g2:Genre) WHERE g1.name = 'Comedy' AND g2.name = 'Action' RETURN DISTINCT a.name

User input: How many artists are there?
Cypher query:
```

## गतिशील कुछ-शॉट उदाहरण

यदि हमारे पास पर्याप्त उदाहरण हैं, तो हम केवल सबसे प्रासंगिक उदाहरणों को ही प्रश्न में शामिल करना चाह सकते हैं, या तो इसलिए कि वे मॉडल के संदर्भ विंडो में नहीं फिटते हैं या इसलिए कि उदाहरणों की लंबी पूंछ मॉडल को भ्रमित करती है। और विशेष रूप से, किसी भी इनपुट के लिए, हम उस इनपुट के सबसे प्रासंगिक उदाहरणों को शामिल करना चाहते हैं।

हम एक ExampleSelector का उपयोग करके ऐसा कर सकते हैं। इस मामले में, हम [SemanticSimilarityExampleSelector](https://api.python.langchain.com/en/latest/example_selectors/langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector.html) का उपयोग करेंगे, जो हमारे चयन के वेक्टर डेटाबेस में उदाहरणों को संग्रहीत करेगा। रन टाइम पर, यह इनपुट और हमारे उदाहरणों के बीच समानता खोज करेगा, और सबसे अधिक अर्थपूर्ण उदाहरण लौटाएगा:

```python
from langchain_community.vectorstores import Neo4jVector
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain_openai import OpenAIEmbeddings

example_selector = SemanticSimilarityExampleSelector.from_examples(
    examples,
    OpenAIEmbeddings(),
    Neo4jVector,
    k=5,
    input_keys=["question"],
)
```

```python
example_selector.select_examples({"question": "how many artists are there?"})
```

```output
[{'query': 'MATCH (a:Person)-[:ACTED_IN]->(:Movie) RETURN count(DISTINCT a)',
  'question': 'How many artists are there?'},
 {'query': "MATCH (a:Person {{name: 'Tom Hanks'}})-[:ACTED_IN]->(m:Movie) RETURN count(m)",
  'question': 'How many movies has Tom Hanks acted in?'},
 {'query': "MATCH (a:Person)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g1:Genre), (a)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g2:Genre) WHERE g1.name = 'Comedy' AND g2.name = 'Action' RETURN DISTINCT a.name",
  'question': 'Which actors have worked in movies from both the comedy and action genres?'},
 {'query': "MATCH (d:Person)-[:DIRECTED]->(m:Movie)<-[:ACTED_IN]-(a:Person) WHERE a.name STARTS WITH 'John' WITH d, COUNT(DISTINCT a) AS JohnsCount WHERE JohnsCount >= 3 RETURN d.name",
  'question': "Which directors have made movies with at least three different actors named 'John'?"},
 {'query': 'MATCH (a:Actor)-[:ACTED_IN]->(m:Movie) RETURN a.name, COUNT(m) AS movieCount ORDER BY movieCount DESC LIMIT 1',
  'question': 'Find the actor with the highest number of movies in the database.'}]
```

इसका उपयोग करने के लिए, हम ExampleSelector को सीधे अपने FewShotPromptTemplate में पास कर सकते हैं:

```python
prompt = FewShotPromptTemplate(
    example_selector=example_selector,
    example_prompt=example_prompt,
    prefix="You are a Neo4j expert. Given an input question, create a syntactically correct Cypher query to run.\n\nHere is the schema information\n{schema}.\n\nBelow are a number of examples of questions and their corresponding Cypher queries.",
    suffix="User input: {question}\nCypher query: ",
    input_variables=["question", "schema"],
)
```

```python
print(prompt.format(question="how many artists are there?", schema="foo"))
```

```output
You are a Neo4j expert. Given an input question, create a syntactically correct Cypher query to run.

Here is the schema information
foo.

Below are a number of examples of questions and their corresponding Cypher queries.

User input: How many artists are there?
Cypher query: MATCH (a:Person)-[:ACTED_IN]->(:Movie) RETURN count(DISTINCT a)

User input: How many movies has Tom Hanks acted in?
Cypher query: MATCH (a:Person {name: 'Tom Hanks'})-[:ACTED_IN]->(m:Movie) RETURN count(m)

User input: Which actors have worked in movies from both the comedy and action genres?
Cypher query: MATCH (a:Person)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g1:Genre), (a)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g2:Genre) WHERE g1.name = 'Comedy' AND g2.name = 'Action' RETURN DISTINCT a.name

User input: Which directors have made movies with at least three different actors named 'John'?
Cypher query: MATCH (d:Person)-[:DIRECTED]->(m:Movie)<-[:ACTED_IN]-(a:Person) WHERE a.name STARTS WITH 'John' WITH d, COUNT(DISTINCT a) AS JohnsCount WHERE JohnsCount >= 3 RETURN d.name

User input: Find the actor with the highest number of movies in the database.
Cypher query: MATCH (a:Actor)-[:ACTED_IN]->(m:Movie) RETURN a.name, COUNT(m) AS movieCount ORDER BY movieCount DESC LIMIT 1

User input: how many artists are there?
Cypher query:
```

```python
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
chain = GraphCypherQAChain.from_llm(
    graph=graph, llm=llm, cypher_prompt=prompt, verbose=True
)
```

```python
chain.invoke("How many actors are in the graph?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Person)-[:ACTED_IN]->(:Movie) RETURN count(DISTINCT a)[0m
Full Context:
[32;1m[1;3m[{'count(DISTINCT a)': 967}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'How many actors are in the graph?',
 'result': 'There are 967 actors in the graph.'}
```
