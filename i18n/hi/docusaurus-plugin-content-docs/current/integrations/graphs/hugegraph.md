---
translated: true
---

# HugeGraph

>[HugeGraph](https://hugegraph.apache.org/) एक सुविधाजनक, कुशल और अनुकूल ग्राफ डेटाबेस है जो `Apache TinkerPop3` फ्रेमवर्क और `Gremlin` क्वेरी भाषा के साथ संगत है।
>
>[Gremlin](https://en.wikipedia.org/wiki/Gremlin_(query_language)) एक ग्राफ ट्रावर्सल भाषा और वर्चुअल मशीन है जिसे `Apache TinkerPop` ने `Apache Software Foundation` के लिए विकसित किया है।

यह नोटबुक दिखाता है कि [HugeGraph](https://hugegraph.apache.org/cn/) डेटाबेस के लिए प्राकृतिक भाषा इंटरफ़ेस प्रदान करने के लिए एलएलएम का उपयोग कैसे किया जाता है।

## सेटअप करना

आपको एक चल रहे HugeGraph इंस्टेंस होना चाहिए।
आप निम्नलिखित स्क्रिप्ट को चलाकर एक स्थानीय डॉकर कंटेनर चला सकते हैं:

```bash
docker run \
    --name=graph \
    -itd \
    -p 8080:8080 \
    hugegraph/hugegraph
```

अगर हम एप्लिकेशन में HugeGraph से कनेक्ट करना चाहते हैं, तो हमें python sdk स्थापित करना होगा:

```bash
pip3 install hugegraph-python
```

अगर आप डॉकर कंटेनर का उपयोग कर रहे हैं, तो आपको डेटाबेस शुरू होने के लिए कुछ सेकंड प्रतीक्षा करनी होगी, और फिर हमें डेटाबेस के लिए स्कीमा बनाना और ग्राफ डेटा लिखना होगा।

```python
from hugegraph.connection import PyHugeGraph

client = PyHugeGraph("localhost", "8080", user="admin", pwd="admin", graph="hugegraph")
```

पहले, हम एक सरल मूवी डेटाबेस के लिए स्कीमा बनाते हैं:

```python
"""schema"""
schema = client.schema()
schema.propertyKey("name").asText().ifNotExist().create()
schema.propertyKey("birthDate").asText().ifNotExist().create()
schema.vertexLabel("Person").properties(
    "name", "birthDate"
).usePrimaryKeyId().primaryKeys("name").ifNotExist().create()
schema.vertexLabel("Movie").properties("name").usePrimaryKeyId().primaryKeys(
    "name"
).ifNotExist().create()
schema.edgeLabel("ActedIn").sourceLabel("Person").targetLabel(
    "Movie"
).ifNotExist().create()
```

```output
'create EdgeLabel success, Detail: "b\'{"id":1,"name":"ActedIn","source_label":"Person","target_label":"Movie","frequency":"SINGLE","sort_keys":[],"nullable_keys":[],"index_labels":[],"properties":[],"status":"CREATED","ttl":0,"enable_label_index":true,"user_data":{"~create_time":"2023-07-04 10:48:47.908"}}\'"'
```

फिर हम कुछ डेटा डाल सकते हैं।

```python
"""graph"""
g = client.graph()
g.addVertex("Person", {"name": "Al Pacino", "birthDate": "1940-04-25"})
g.addVertex("Person", {"name": "Robert De Niro", "birthDate": "1943-08-17"})
g.addVertex("Movie", {"name": "The Godfather"})
g.addVertex("Movie", {"name": "The Godfather Part II"})
g.addVertex("Movie", {"name": "The Godfather Coda The Death of Michael Corleone"})

g.addEdge("ActedIn", "1:Al Pacino", "2:The Godfather", {})
g.addEdge("ActedIn", "1:Al Pacino", "2:The Godfather Part II", {})
g.addEdge(
    "ActedIn", "1:Al Pacino", "2:The Godfather Coda The Death of Michael Corleone", {}
)
g.addEdge("ActedIn", "1:Robert De Niro", "2:The Godfather Part II", {})
```

```output
1:Robert De Niro--ActedIn-->2:The Godfather Part II
```

## `HugeGraphQAChain` बनाना

अब हम `HugeGraph` और `HugeGraphQAChain` बना सकते हैं। `HugeGraph` बनाने के लिए हमें बस डेटाबेस ऑब्जेक्ट को `HugeGraph` कंस्ट्रक्टर में पास करना है।

```python
from langchain.chains import HugeGraphQAChain
from langchain_community.graphs import HugeGraph
from langchain_openai import ChatOpenAI
```

```python
graph = HugeGraph(
    username="admin",
    password="admin",
    address="localhost",
    port=8080,
    graph="hugegraph",
)
```

## ग्राफ स्कीमा जानकारी ताज़ा करें

अगर डेटाबेस की स्कीमा बदल जाती है, तो आप Gremlin बयानों को जनरेट करने के लिए आवश्यक स्कीमा जानकारी ताज़ा कर सकते हैं।

```python
# graph.refresh_schema()
```

```python
print(graph.get_schema)
```

```output
Node properties: [name: Person, primary_keys: ['name'], properties: ['name', 'birthDate'], name: Movie, primary_keys: ['name'], properties: ['name']]
Edge properties: [name: ActedIn, properties: []]
Relationships: ['Person--ActedIn-->Movie']
```

## ग्राफ का क्वेरी करना

अब हम ग्राफ Gremlin QA श्रृंखला का उपयोग करके ग्राफ से प्रश्न पूछ सकते हैं।

```python
chain = HugeGraphQAChain.from_llm(ChatOpenAI(temperature=0), graph=graph, verbose=True)
```

```python
chain.run("Who played in The Godfather?")
```

```output


[1m> Entering new  chain...[0m
Generated gremlin:
[32;1m[1;3mg.V().has('Movie', 'name', 'The Godfather').in('ActedIn').valueMap(true)[0m
Full Context:
[32;1m[1;3m[{'id': '1:Al Pacino', 'label': 'Person', 'name': ['Al Pacino'], 'birthDate': ['1940-04-25']}][0m

[1m> Finished chain.[0m
```

```output
'Al Pacino played in The Godfather.'
```
