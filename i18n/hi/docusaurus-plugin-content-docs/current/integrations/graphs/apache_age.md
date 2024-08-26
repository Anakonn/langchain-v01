---
translated: true
---

# Apache AGE

>[Apache AGE](https://age.apache.org/) एक PostgreSQL एक्सटेंशन है जो ग्राफ डेटाबेस कार्यक्षमता प्रदान करता है। AGE का मतलब है A Graph Extension, और यह Bitnine के PostgreSQL 10 के फोर्क AgensGraph से प्रेरित है, जो एक बहु-मॉडल डेटाबेस है। इस परियोजना का लक्ष्य एकल स्टोरेज बनाना है जो रिलेशनल और ग्राफ मॉडल डेटा दोनों को संभाल सके ताकि उपयोगकर्ता मानक ANSI SQL के साथ-साथ openCypher, ग्राफ क्वेरी भाषा का उपयोग कर सकें। `Apache AGE` द्वारा संग्रहीत डेटा तत्व नोड, उन्हें जोड़ने वाले एज और नोड और एज के गुण हैं।

>यह नोटबुक दिखाता है कि किस तरह से LLM का उपयोग करके एक ग्राफ डेटाबेस के लिए एक प्राकृतिक भाषा इंटरफ़ेस प्रदान किया जा सकता है जिसे `Cypher` क्वेरी भाषा के साथ क्वेरी किया जा सकता है।

>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language)) एक घोषणात्मक ग्राफ क्वेरी भाषा है जो प्रॉपर्टी ग्राफ में अभिव्यक्त और कुशल डेटा क्वेरी करने की अनुमति देता है।

## सेटअप करना

आपको एक चल रहा `Postgre` इंस्टांस होना चाहिए जिसमें AGE एक्सटेंशन स्थापित हो। परीक्षण के लिए एक विकल्प है कि आप आधिकारिक AGE डॉकर छवि का उपयोग करके एक डॉकर कंटेनर चलाएं।
आप निम्नलिखित स्क्रिप्ट को निष्पादित करके एक स्थानीय डॉकर कंटेनर चला सकते हैं:

```bash
docker run \
    --name age  \
    -p 5432:5432 \
    -e POSTGRES_USER=postgresUser \
    -e POSTGRES_PASSWORD=postgresPW \
    -e POSTGRES_DB=postgresDB \
    -d \
    apache/age
```

डॉकर में चलाने के बारे में अतिरिक्त निर्देश [यहां](https://hub.docker.com/r/apache/age) पाए जा सकते हैं।

```python
from langchain.chains import GraphCypherQAChain
from langchain_community.graphs.age_graph import AGEGraph
from langchain_openai import ChatOpenAI
```

```python
conf = {
    "database": "postgresDB",
    "user": "postgresUser",
    "password": "postgresPW",
    "host": "localhost",
    "port": 5432,
}

graph = AGEGraph(graph_name="age_test", conf=conf)
```

## डेटाबेस को सीड करना

यह मानते हुए कि आपका डेटाबेस खाली है, आप Cypher क्वेरी भाषा का उपयोग करके इसे भर सकते हैं। निम्नलिखित Cypher बयान अक्षम है, जिसका मतलब है कि आप इसे एक या एक से अधिक बार चलाने पर भी डेटाबेस जानकारी समान होगी।

```python
graph.query(
    """
MERGE (m:Movie {name:"Top Gun"})
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

## ग्राफ स्कीमा जानकारी ताज़ा करें

यदि डेटाबेस की स्कीमा में परिवर्तन होता है, तो आप Cypher बयान जनरेट करने के लिए आवश्यक स्कीमा जानकारी ताज़ा कर सकते हैं।

```python
graph.refresh_schema()
```

```python
print(graph.schema)
```

```output

        Node properties are the following:
        [{'properties': [{'property': 'name', 'type': 'STRING'}], 'labels': 'Actor'}, {'properties': [{'property': 'property_a', 'type': 'STRING'}], 'labels': 'LabelA'}, {'properties': [], 'labels': 'LabelB'}, {'properties': [], 'labels': 'LabelC'}, {'properties': [{'property': 'name', 'type': 'STRING'}], 'labels': 'Movie'}]
        Relationship properties are the following:
        [{'properties': [], 'type': 'ACTED_IN'}, {'properties': [{'property': 'rel_prop', 'type': 'STRING'}], 'type': 'REL_TYPE'}]
        The relationships are the following:
        ['(:`Actor`)-[:`ACTED_IN`]->(:`Movie`)', '(:`LabelA`)-[:`REL_TYPE`]->(:`LabelB`)', '(:`LabelA`)-[:`REL_TYPE`]->(:`LabelC`)']
```

## ग्राफ का क्वेरी करना

अब हम ग्राफ Cypher QA श्रृंखला का उपयोग करके ग्राफ के बारे में प्रश्न पूछ सकते हैं।

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True
)
```

```python
chain.invoke("Who played in Top Gun?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m

Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}, {'name': 'Anthony Edwards'}, {'name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Tom Cruise, Val Kilmer, Anthony Edwards, Meg Ryan played in Top Gun.'}
```

## परिणामों की संख्या सीमित करें

आप `top_k` पैरामीटर का उपयोग करके Cypher QA श्रृंखला से प्राप्त परिणामों की संख्या सीमित कर सकते हैं।
डिफ़ॉल्ट 10 है।

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, top_k=2
)
```

```python
chain.invoke("Who played in Top Gun?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie {name: 'Top Gun'})
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Tom Cruise, Val Kilmer played in Top Gun.'}
```

## मध्यवर्ती परिणाम लौटाएं

आप `return_intermediate_steps` पैरामीटर का उपयोग करके Cypher QA श्रृंखला से मध्यवर्ती चरण लौटा सकते हैं।

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_intermediate_steps=True
)
```

```python
result = chain("Who played in Top Gun?")
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
[32;1m[1;3m[{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}, {'name': 'Anthony Edwards'}, {'name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
Intermediate steps: [{'query': "MATCH (a:Actor)-[:ACTED_IN]->(m:Movie)\nWHERE m.name = 'Top Gun'\nRETURN a.name"}, {'context': [{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}, {'name': 'Anthony Edwards'}, {'name': 'Meg Ryan'}]}]
Final answer: Tom Cruise, Val Kilmer, Anthony Edwards, Meg Ryan played in Top Gun.
```

## प्रत्यक्ष परिणाम लौटाएं

आप `return_direct` पैरामीटर का उपयोग करके Cypher QA श्रृंखला से प्रत्यक्ष परिणाम लौटा सकते हैं।

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_direct=True
)
```

```python
chain.invoke("Who played in Top Gun?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie {name: 'Top Gun'})
RETURN a.name[0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': [{'name': 'Tom Cruise'},
  {'name': 'Val Kilmer'},
  {'name': 'Anthony Edwards'},
  {'name': 'Meg Ryan'}]}
```

## Cypher जनरेशन प्रॉम्प्ट में उदाहरण जोड़ें

आप विशिष्ट प्रश्नों के लिए जनरेट किए जाने वाले Cypher बयान को परिभाषित कर सकते हैं।

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
chain.invoke("How many people played in Top Gun?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m

Generated Cypher:
[32;1m[1;3mMATCH (:Movie {name:"Top Gun"})<-[:ACTED_IN]-(:Actor)
RETURN count(*) AS numberOfActors[0m
Full Context:
[32;1m[1;3m[{'numberofactors': 4}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'How many people played in Top Gun?',
 'result': "I don't know the answer."}
```

## Cypher और उत्तर जनरेशन के लिए अलग LLM का उपयोग करें

आप `cypher_llm` और `qa_llm` पैरामीटर का उपयोग करके अलग-अलग llm को परिभाषित कर सकते हैं।

```python
chain = GraphCypherQAChain.from_llm(
    graph=graph,
    cypher_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    qa_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo-16k"),
    verbose=True,
)
```

```python
chain.invoke("Who played in Top Gun?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m

Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}, {'name': 'Anthony Edwards'}, {'name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Tom Cruise, Val Kilmer, Anthony Edwards, and Meg Ryan played in Top Gun.'}
```

## निर्दिष्ट नोड और संबंध प्रकारों को अनदेखा करें

आप Cypher बयान जनरेट करते समय ग्राफ स्कीमा के कुछ हिस्सों को अनदेखा करने के लिए `include_types` या `exclude_types` का उपयोग कर सकते हैं।

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
Actor {name: STRING},LabelA {property_a: STRING},LabelB {},LabelC {}
Relationship properties are the following:
ACTED_IN {},REL_TYPE {rel_prop: STRING}
The relationships are the following:
(:LabelA)-[:REL_TYPE]->(:LabelB),(:LabelA)-[:REL_TYPE]->(:LabelC)
```

## जनरेट किए गए Cypher बयानों की पुष्टि करें

आप `validate_cypher` पैरामीटर का उपयोग करके जनरेट किए गए Cypher बयानों की पुष्टि और सुधार कर सकते हैं।

```python
chain = GraphCypherQAChain.from_llm(
    llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    graph=graph,
    verbose=True,
    validate_cypher=True,
)
```

```python
chain.invoke("Who played in Top Gun?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'name': 'Tom Cruise'}, {'name': 'Val Kilmer'}, {'name': 'Anthony Edwards'}, {'name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Tom Cruise, Val Kilmer, Anthony Edwards, Meg Ryan played in Top Gun.'}
```
