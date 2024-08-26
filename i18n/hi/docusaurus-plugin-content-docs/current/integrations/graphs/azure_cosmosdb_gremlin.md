---
translated: true
---

# Azure Cosmos DB for Apache Gremlin

>[Azure Cosmos DB for Apache Gremlin](https://learn.microsoft.com/en-us/azure/cosmos-db/gremlin/introduction) एक ग्राफ़ डेटाबेस सेवा है जिसका उपयोग अरबों वर्टेक्स और एज के साथ विशाल ग्राफ़ को संग्रहित करने के लिए किया जा सकता है। आप मिलीसेकंड लेटेंसी के साथ ग्राफ़ को क्वेरी कर सकते हैं और ग्राफ़ संरचना को आसानी से विकसित कर सकते हैं।
>
>[Gremlin](https://en.wikipedia.org/wiki/Gremlin_(query_language)) एक ग्राफ़ ट्रावर्सल भाषा और वर्चुअल मशीन है जिसे `Apache TinkerPop` द्वारा `Apache Software Foundation` के तहत विकसित किया गया है।

यह नोटबुक दिखाता है कि कैसे एलएलएम का उपयोग करके ग्राफ़ डेटाबेस के लिए एक प्राकृतिक भाषा इंटरफ़ेस प्रदान किया जा सकता है जिसे `Gremlin` क्वेरी भाषा के साथ क्वेरी किया जा सकता है।

## सेटअप करना

एक लाइब्रेरी इंस्टॉल करें:

```python
!pip3 install gremlinpython
```

आपको एक Azure CosmosDB ग्राफ़ डेटाबेस इंस्टांस की आवश्यकता होगी। एक विकल्प [Azure में एक मुफ्त CosmosDB ग्राफ़ डेटाबेस इंस्टांस बनाना](https://learn.microsoft.com/en-us/azure/cosmos-db/free-tier) है।

जब आप अपना Cosmos DB खाता और ग्राफ़ बनाते हैं, तो `/type` का उपयोग पार्टिशन कुंजी के रूप में करें।

```python
cosmosdb_name = "mycosmosdb"
cosmosdb_db_id = "graphtesting"
cosmosdb_db_graph_id = "mygraph"
cosmosdb_access_Key = "longstring=="
```

```python
import nest_asyncio
from langchain.chains.graph_qa.gremlin import GremlinQAChain
from langchain.schema import Document
from langchain_community.graphs import GremlinGraph
from langchain_community.graphs.graph_document import GraphDocument, Node, Relationship
from langchain_openai import AzureChatOpenAI
```

```python
graph = GremlinGraph(
    url=f"=wss://{cosmosdb_name}.gremlin.cosmos.azure.com:443/",
    username=f"/dbs/{cosmosdb_db_id}/colls/{cosmosdb_db_graph_id}",
    password=cosmosdb_access_Key,
)
```

## डेटाबेस को सीड करना

यह मानते हुए कि आपका डेटाबेस खाली है, आप GraphDocuments का उपयोग करके इसे भर सकते हैं।

Gremlin के लिए, हर नोड के लिए 'लेबल' नामक गुण जोड़ें।
यदि कोई लेबल सेट नहीं है, तो Node.type को लेबल के रूप में उपयोग किया जाता है।
Cosmos के लिए प्राकृतिक आईडी का उपयोग करना तर्कसंगत है, क्योंकि वे ग्राफ़ एक्सप्लोरर में दिखाई देते हैं।

```python
source_doc = Document(
    page_content="Matrix is a movie where Keanu Reeves, Laurence Fishburne and Carrie-Anne Moss acted."
)
movie = Node(id="The Matrix", properties={"label": "movie", "title": "The Matrix"})
actor1 = Node(id="Keanu Reeves", properties={"label": "actor", "name": "Keanu Reeves"})
actor2 = Node(
    id="Laurence Fishburne", properties={"label": "actor", "name": "Laurence Fishburne"}
)
actor3 = Node(
    id="Carrie-Anne Moss", properties={"label": "actor", "name": "Carrie-Anne Moss"}
)
rel1 = Relationship(
    id=5, type="ActedIn", source=actor1, target=movie, properties={"label": "ActedIn"}
)
rel2 = Relationship(
    id=6, type="ActedIn", source=actor2, target=movie, properties={"label": "ActedIn"}
)
rel3 = Relationship(
    id=7, type="ActedIn", source=actor3, target=movie, properties={"label": "ActedIn"}
)
rel4 = Relationship(
    id=8,
    type="Starring",
    source=movie,
    target=actor1,
    properties={"label": "Strarring"},
)
rel5 = Relationship(
    id=9,
    type="Starring",
    source=movie,
    target=actor2,
    properties={"label": "Strarring"},
)
rel6 = Relationship(
    id=10,
    type="Straring",
    source=movie,
    target=actor3,
    properties={"label": "Strarring"},
)
graph_doc = GraphDocument(
    nodes=[movie, actor1, actor2, actor3],
    relationships=[rel1, rel2, rel3, rel4, rel5, rel6],
    source=source_doc,
)
```

```python
# The underlying python-gremlin has a problem when running in notebook
# The following line is a workaround to fix the problem
nest_asyncio.apply()

# Add the document to the CosmosDB graph.
graph.add_graph_documents([graph_doc])
```

## ग्राफ़ स्कीमा जानकारी ताज़ा करें

यदि डेटाबेस की स्कीमा में परिवर्तन होता है (अपडेट के बाद), तो आप स्कीमा जानकारी को ताज़ा कर सकते हैं।

```python
graph.refresh_schema()
```

```python
print(graph.schema)
```

## ग्राफ़ को क्वेरी करना

अब हम gremlin QA श्रृंखला का उपयोग करके ग्राफ़ से प्रश्न पूछ सकते हैं।

```python
chain = GremlinQAChain.from_llm(
    AzureChatOpenAI(
        temperature=0,
        azure_deployment="gpt-4-turbo",
    ),
    graph=graph,
    verbose=True,
)
```

```python
chain.invoke("Who played in The Matrix?")
```

```python
chain.run("How many people played in The Matrix?")
```
