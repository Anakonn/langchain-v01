---
translated: true
---

# Neo4j

>[Neo4j](https://neo4j.com/docs/getting-started/) एक ग्राफ़ डेटाबेस प्रबंधन प्रणाली है जिसे `Neo4j, Inc` द्वारा विकसित किया गया है।

>`Neo4j` द्वारा संग्रहित डेटा तत्व नोड, उन्हें जोड़ने वाले किनारे और नोड और किनारों के गुण हैं। अपने विकासकर्ताओं द्वारा एसिड-अनुपालन वाले लेनदेन डेटाबेस के रूप में वर्णित, जिसमें नेटिव ग्राफ़ संग्रहण और प्रसंस्करण है, `Neo4j` एक गैर-ओपन-सोर्स "कम्युनिटी संस्करण" में उपलब्ध है जिसे GNU जनरल पब्लिक लाइसेंस के संशोधन के साथ लाइसेंस दिया गया है, ऑनलाइन बैकअप और उच्च उपलब्धता विस्तारों के साथ जो बंद स्रोत वाणिज्यिक लाइसेंस के तहत लाइसेंस दिए गए हैं। नियो भी इन विस्तारों के साथ `Neo4j` को बंद स्रोत वाणिज्यिक शर्तों के तहत लाइसेंस देता है।

>यह नोटबुक दिखाता है कि कैसे एलएलएम का उपयोग करके एक ग्राफ़ डेटाबेस के लिए एक प्राकृतिक भाषा इंटरफ़ेस प्रदान किया जा सकता है जिसे आप `Cypher` क्वेरी भाषा के साथ क्वेरी कर सकते हैं।

>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language)) एक घोषणात्मक ग्राफ़ क्वेरी भाषा है जो संपत्ति ग्राफ़ में प्रभावी और कुशल डेटा क्वेरी करने की अभिव्यक्ति की अनुमति देता है।

## सेटअप करना

आपको एक चल रहे `Neo4j` इंस्टेंस होना चाहिए। एक विकल्प [Neo4j के Aura क्लाउड सेवा में एक मुफ्त Neo4j डेटाबेस इंस्टेंस बनाना](https://neo4j.com/cloud/platform/aura-graph-database/) है। आप [Neo4j डेस्कटॉप एप्लिकेशन](https://neo4j.com/download/) का उपयोग करके या एक डॉकर कंटेनर चलाकर भी डेटाबेस को स्थानीय रूप से चला सकते हैं।
आप निम्नलिखित स्क्रिप्ट को निष्पादित करके एक स्थानीय डॉकर कंटेनर चला सकते हैं:

```bash
docker run \
    --name neo4j \
    -p 7474:7474 -p 7687:7687 \
    -d \
    -e NEO4J_AUTH=neo4j/password \
    -e NEO4J_PLUGINS=\[\"apoc\"\]  \
    neo4j:latest
```

यदि आप डॉकर कंटेनर का उपयोग कर रहे हैं, तो डेटाबेस शुरू होने के लिए कुछ सेकंड प्रतीक्षा करनी होगी।

```python
from langchain.chains import GraphCypherQAChain
from langchain_community.graphs import Neo4jGraph
from langchain_openai import ChatOpenAI
```

```python
graph = Neo4jGraph(url="bolt://localhost:7687", username="neo4j", password="password")
```

## डेटाबेस को सीड करना

यह मानते हुए कि आपका डेटाबेस खाली है, आप Cypher क्वेरी भाषा का उपयोग करके इसे भर सकते हैं। निम्नलिखित Cypher बयान अक्षम है, जिसका अर्थ है कि आप इसे एक या एक से अधिक बार चलाने पर भी डेटाबेस जानकारी समान होगी।

```python
graph.query(
    """
MERGE (m:Movie {name:"Top Gun", runtime: 120})
WITH m
UNWIND ["Tom Cruise", "Val Kilmer", "Anthony Edwards", "Meg Ryan"] AS actor
MERGE (a:Actor {name:actor})
MERGE (a)-[:ACTED_IN]->(m)
"""
)
```

```output
[]
```

## ग्राफ़ स्कीमा जानकारी ताज़ा करें

यदि डेटाबेस की स्कीमा में परिवर्तन होता है, तो आप Cypher बयान जनरेट करने के लिए आवश्यक स्कीमा जानकारी ताज़ा कर सकते हैं।

```python
graph.refresh_schema()
```

```python
print(graph.schema)
```

```output
Node properties:
Movie {runtime: INTEGER, name: STRING}
Actor {name: STRING}
Relationship properties:

The relationships:
(:Actor)-[:ACTED_IN]->(:Movie)
```

## बेहतर स्कीमा जानकारी

बेहतर स्कीमा संस्करण चुनने से प्रणाली को डेटाबेस के भीतर उदाहरण मूल्यों की स्वचालित स्कैनिंग और कुछ वितरण मीट्रिक्स की गणना करने में सक्षम बनाता है। उदाहरण के लिए, यदि एक नोड गुण में 10 से कम अलग मूल्य हैं, तो हम स्कीमा में सभी संभव मूल्य वापस करते हैं। अन्यथा, प्रत्येक नोड और संबंध गुण के लिए केवल एक उदाहरण मूल्य वापस करते हैं।

```python
enhanced_graph = Neo4jGraph(
    url="bolt://localhost:7687",
    username="neo4j",
    password="password",
    enhanced_schema=True,
)
print(enhanced_graph.schema)
```

```output
Node properties:
- **Movie**
  - `runtime: INTEGER` Min: 120, Max: 120
  - `name: STRING` Available options: ['Top Gun']
- **Actor**
  - `name: STRING` Available options: ['Tom Cruise', 'Val Kilmer', 'Anthony Edwards', 'Meg Ryan']
Relationship properties:

The relationships:
(:Actor)-[:ACTED_IN]->(:Movie)
```

## ग्राफ़ का क्वेरी करना

अब हम ग्राफ़ साइफर क्यूए श्रृंखला का उपयोग करके ग्राफ़ से प्रश्न पूछ सकते हैं।

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True
)
```

```python
chain.invoke({"query": "Who played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Tom Cruise'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Anthony Edwards, Meg Ryan, Val Kilmer, Tom Cruise played in Top Gun.'}
```

## परिणामों की संख्या सीमित करें

आप `top_k` पैरामीटर का उपयोग करके साइफर क्यूए श्रृंखला से परिणामों की संख्या सीमित कर सकते हैं।
डिफ़ॉल्ट 10 है।

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, top_k=2
)
```

```python
chain.invoke({"query": "Who played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Anthony Edwards, Meg Ryan played in Top Gun.'}
```

## मध्यवर्ती परिणाम लौटाएं

आप `return_intermediate_steps` पैरामीटर का उपयोग करके साइफर क्यूए श्रृंखला से मध्यवर्ती चरण लौटा सकते हैं।

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_intermediate_steps=True
)
```

```python
result = chain.invoke({"query": "Who played in Top Gun?"})
print(f"Intermediate steps: {result['intermediate_steps']}")
print(f"Final answer: {result['result']}")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Tom Cruise'}][0m

[1m> Finished chain.[0m
Intermediate steps: [{'query': "MATCH (a:Actor)-[:ACTED_IN]->(m:Movie)\nWHERE m.name = 'Top Gun'\nRETURN a.name"}, {'context': [{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Tom Cruise'}]}]
Final answer: Anthony Edwards, Meg Ryan, Val Kilmer, Tom Cruise played in Top Gun.
```

## प्रत्यक्ष परिणाम लौटाएं

आप `return_direct` पैरामीटर का उपयोग करके साइफर क्यूए श्रृंखला से प्रत्यक्ष परिणाम लौटा सकते हैं।

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_direct=True
)
```

```python
chain.invoke({"query": "Who played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': [{'a.name': 'Anthony Edwards'},
  {'a.name': 'Meg Ryan'},
  {'a.name': 'Val Kilmer'},
  {'a.name': 'Tom Cruise'}]}
```

## साइफर जनरेशन प्रॉम्प्ट में उदाहरण जोड़ें

आप विशिष्ट प्रश्नों के लिए जनरेट किए जाने वाले साइफर बयान को परिभाषित कर सकते हैं।

```python
from langchain_core.prompts.prompt import PromptTemplate

CYPHER_GENERATION_TEMPLATE = """Task:Generate Cypher statement to query a graph database.
Instructions:
Use only the provided relationship types and properties in the schema.
Do not use any other relationship types or properties that are not provided.
Schema:
{schema}
Note: Do not include any explanations or apologies in your responses.
Do not respond to any questions that might ask anything else than for you to construct a Cypher statement.
Do not include any text except the generated Cypher statement.
Examples: Here are a few examples of generated Cypher statements for particular questions:
# How many people played in Top Gun?
MATCH (m:Movie {{title:"Top Gun"}})<-[:ACTED_IN]-()
RETURN count(*) AS numberOfActors

The question is:
{question}"""

CYPHER_GENERATION_PROMPT = PromptTemplate(
    input_variables=["schema", "question"], template=CYPHER_GENERATION_TEMPLATE
)

chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0),
    graph=graph,
    verbose=True,
    cypher_prompt=CYPHER_GENERATION_PROMPT,
)
```

```python
chain.invoke({"query": "How many people played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (:Movie {name:"Top Gun"})<-[:ACTED_IN]-()
RETURN count(*) AS numberOfActors[0m
Full Context:
[32;1m[1;3m[{'numberOfActors': 4}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'How many people played in Top Gun?',
 'result': 'There were 4 actors who played in Top Gun.'}
```

## साइफर और उत्तर जनरेशन के लिए अलग एलएलएम का उपयोग करें

आप `cypher_llm` और `qa_llm` पैरामीटर का उपयोग करके अलग-अलग एलएलएम को परिभाषित कर सकते हैं।

```python
chain = GraphCypherQAChain.from_llm(
    graph=graph,
    cypher_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    qa_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo-16k"),
    verbose=True,
)
```

```python
chain.invoke({"query": "Who played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Tom Cruise'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Anthony Edwards, Meg Ryan, Val Kilmer, and Tom Cruise played in Top Gun.'}
```

## निर्दिष्ट नोड और संबंध प्रकारों को अनदेखा करें

आप साइफर बयान जनरेट करते समय ग्राफ़ स्कीमा के कुछ हिस्सों को अनदेखा करने के लिए `include_types` या `exclude_types` का उपयोग कर सकते हैं।

```python
chain = GraphCypherQAChain.from_llm(
    graph=graph,
    cypher_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    qa_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo-16k"),
    verbose=True,
    exclude_types=["Movie"],
)
```

```python
# Inspect graph schema
print(chain.graph_schema)
```

```output
Node properties are the following:
Actor {name: STRING}
Relationship properties are the following:

The relationships are the following:
```

## जनरेट किए गए साइफर बयानों की पुष्टि करें

आप `validate_cypher` पैरामीटर का उपयोग करके जनरेट किए गए साइफर बयानों की पुष्टि और सुधार कर सकते हैं।

```python
chain = GraphCypherQAChain.from_llm(
    llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    graph=graph,
    verbose=True,
    validate_cypher=True,
)
```

```python
chain.invoke({"query": "Who played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Tom Cruise'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Anthony Edwards, Meg Ryan, Val Kilmer, Tom Cruise played in Top Gun.'}
```
