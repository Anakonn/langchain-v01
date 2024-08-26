---
sidebar_position: 0
translated: true
---

# त्वरित प्रारंभ

इस गाइड में हम ग्राफ डेटाबेस पर एक प्रश्न और उत्तर श्रृंखला बनाने के मूलभूत तरीकों पर चर्चा करेंगे। ये प्रणाली हमें ग्राफ डेटाबेस में डेटा के बारे में एक प्रश्न पूछने और प्राकृतिक भाषा का उत्तर प्राप्त करने की अनुमति देंगी।

## ⚠️ सुरक्षा नोट ⚠️

ग्राफ डेटाबेस पर प्रश्न और उत्तर प्रणाली बनाना मॉडल-जनित ग्राफ क्वेरी को निष्पादित करने की आवश्यकता होती है। ऐसा करने में अंतर्निहित जोखिम हैं। सुनिश्चित करें कि आपका डेटाबेस कनेक्शन अनुमतियां हमेशा आपके श्रृंखला/एजेंट की आवश्यकताओं के लिए संकीर्ण हैं। इससे मॉडल-संचालित प्रणाली बनाने के जोखिमों को कम किया जा सकता है, हालांकि पूरी तरह से नहीं। सामान्य सुरक्षा सर्वोत्तम प्रथाओं के बारे में अधिक जानकारी के लिए, [यहां देखें](/docs/security)।

## वास्तुकला

उच्च स्तर पर, अधिकांश ग्राफ श्रृंखलाओं के चरण हैं:

1. **प्रश्न को ग्राफ डेटाबेस क्वेरी में परिवर्तित करना**: मॉडल उपयोगकर्ता इनपुट को ग्राफ डेटाबेस क्वेरी (उदा. Cypher) में परिवर्तित करता है।
2. **ग्राफ डेटाबेस क्वेरी को निष्पादित करना**: ग्राफ डेटाबेस क्वेरी को निष्पादित करें।
3. **प्रश्न का उत्तर देना**: मॉडल क्वेरी परिणामों का उपयोग करके उपयोगकर्ता इनपुट का उत्तर देता है।

![sql_usecase.png](../../../../../../static/img/graph_usecase.png)

## सेटअप

पहले, आवश्यक पैकेज प्राप्त करें और वातावरण चर सेट करें।
इस उदाहरण में, हम Neo4j ग्राफ डेटाबेस का उपयोग करेंगे।

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai neo4j
```

हम इस गाइड में OpenAI मॉडल का डिफ़ॉल्ट उपयोग करते हैं।

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

अब, हमें Neo4j क्रेडेंशियल को परिभाषित करने की आवश्यकता है।
एक Neo4j डेटाबेस सेट अप करने के लिए [इन स्थापना चरणों](https://neo4j.com/docs/operations-manual/current/installation/) का पालन करें।

```python
os.environ["NEO4J_URI"] = "bolt://localhost:7687"
os.environ["NEO4J_USERNAME"] = "neo4j"
os.environ["NEO4J_PASSWORD"] = "password"
```

नीचे का उदाहरण एक Neo4j डेटाबेस के साथ कनेक्शन बनाएगा और फिल्मों और उनके अभिनेताओं के बारे में उदाहरण डेटा से भरेगा।

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

## ग्राफ स्कीमा

एक LLM को Cypher बयान जनरेट करने में सक्षम होने के लिए, उसे ग्राफ स्कीमा के बारे में जानकारी की आवश्यकता होती है। जब आप एक ग्राफ ऑब्जेक्ट इंस्टैंशिएट करते हैं, तो यह ग्राफ स्कीमा के बारे में जानकारी प्राप्त करता है। यदि आप बाद में ग्राफ में कोई परिवर्तन करते हैं, तो आप `refresh_schema` विधि को चलाकर स्कीमा जानकारी को ताज़ा कर सकते हैं।

```python
graph.refresh_schema()
print(graph.schema)
```

```output
Node properties are the following:
Movie {imdbRating: FLOAT, id: STRING, released: DATE, title: STRING},Person {name: STRING},Genre {name: STRING},Chunk {id: STRING, question: STRING, query: STRING, text: STRING, embedding: LIST}
Relationship properties are the following:

The relationships are the following:
(:Movie)-[:IN_GENRE]->(:Genre),(:Person)-[:DIRECTED]->(:Movie),(:Person)-[:ACTED_IN]->(:Movie)
```

बढ़िया! हमारे पास एक ऐसा ग्राफ डेटाबेस है जिसे हम क्वेरी कर सकते हैं। अब इसे एक LLM से जोड़ने का प्रयास करते हैं।

## श्रृंखला

चलिए एक सरल श्रृंखला का उपयोग करते हैं जो एक प्रश्न लेता है, इसे Cypher क्वेरी में बदलता है, क्वेरी को निष्पादित करता है, और मूल प्रश्न का उत्तर देने के लिए परिणाम का उपयोग करता है।

![graph_chain.webp](../../../../../../static/img/graph_chain.webp)

LangChain में इस कार्यप्रवाह के लिए एक बिल्ट-इन श्रृंखला है जो Neo4j के साथ काम करने के लिए डिज़ाइन की गई है: [GraphCypherQAChain](/docs/integrations/graphs/neo4j_cypher)

```python
from langchain.chains import GraphCypherQAChain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
chain = GraphCypherQAChain.from_llm(graph=graph, llm=llm, verbose=True)
response = chain.invoke({"query": "What was the cast of the Casino?"})
response
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (:Movie {title: "Casino"})<-[:ACTED_IN]-(actor:Person)
RETURN actor.name[0m
Full Context:
[32;1m[1;3m[{'actor.name': 'Joe Pesci'}, {'actor.name': 'Robert De Niro'}, {'actor.name': 'Sharon Stone'}, {'actor.name': 'James Woods'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'What was the cast of the Casino?',
 'result': 'The cast of Casino included Joe Pesci, Robert De Niro, Sharon Stone, and James Woods.'}
```

# संबंध दिशा की पुष्टि

LLM जनरेट किए गए Cypher बयान में संबंध दिशाओं के साथ संघर्ष कर सकते हैं। चूंकि ग्राफ स्कीमा पूर्व-परिभाषित है, इसलिए हम `validate_cypher` पैरामीटर का उपयोग करके जनरेट किए गए Cypher बयानों में संबंध दिशाओं की पुष्टि और वैकल्पिक रूप से सुधार कर सकते हैं।

```python
chain = GraphCypherQAChain.from_llm(
    graph=graph, llm=llm, verbose=True, validate_cypher=True
)
response = chain.invoke({"query": "What was the cast of the Casino?"})
response
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (:Movie {title: "Casino"})<-[:ACTED_IN]-(actor:Person)
RETURN actor.name[0m
Full Context:
[32;1m[1;3m[{'actor.name': 'Joe Pesci'}, {'actor.name': 'Robert De Niro'}, {'actor.name': 'Sharon Stone'}, {'actor.name': 'James Woods'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'What was the cast of the Casino?',
 'result': 'The cast of Casino included Joe Pesci, Robert De Niro, Sharon Stone, and James Woods.'}
```

### अगले कदम

अधिक जटिल क्वेरी-जनरेशन के लिए, हम कुछ शॉट प्रोम्प्ट या क्वेरी-जांच चरण जोड़ना चाह सकते हैं। इस तरह के उन्नत तकनीकों और अधिक के लिए देखें:

* [प्रोम्प्टिंग रणनीतियां](/docs/use_cases/graph/prompting): उन्नत प्रोम्प्ट इंजीनियरिंग तकनीकें।
* [मूल्यों को मैप करना](/docs/use_cases/graph/mapping): प्रश्नों से डेटाबेस में मूल्यों को मैप करने के लिए तकनीकें।
* [सेमांटिक परत](/docs/use_cases/graph/semantic): सेमांटिक परतों को लागू करने की तकनीकें।
* [ग्राफ का निर्माण](/docs/use_cases/graph/constructing): ज्ञान ग्राफ का निर्माण करने की तकनीकें।
