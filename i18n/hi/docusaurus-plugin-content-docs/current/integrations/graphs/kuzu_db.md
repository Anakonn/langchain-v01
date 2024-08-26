---
translated: true
---

# कुज़ु

>[कुज़ु](https://kuzudb.com) एक प्रक्रियाधीन संपत्ति ग्राफ डेटाबेस प्रबंधन प्रणाली है।
>
>यह नोटबुक दिखाता है कि कैसे एलएलएम का उपयोग करके [कुज़ु](https://kuzudb.com) डेटाबेस के साथ `Cypher` ग्राफ क्वेरी भाषा का प्राकृतिक भाषा इंटरफ़ेस प्रदान किया जा सकता है।
>
>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language)) एक घोषणात्मक ग्राफ क्वेरी भाषा है जो संपत्ति ग्राफ में प्रभावी और कुशल डेटा क्वेरी करने की अभिव्यक्ति की अनुमति देती है।

## सेटअप करना

पायथन पैकेज इंस्टॉल करें:

```bash
pip install kuzu
```

स्थानीय मशीन पर एक डेटाबेस बनाएं और इससे कनेक्ट करें:

```python
import kuzu

db = kuzu.Database("test_db")
conn = kuzu.Connection(db)
```

पहले, हम एक सरल मूवी डेटाबेस के लिए स्कीमा बनाते हैं:

```python
conn.execute("CREATE NODE TABLE Movie (name STRING, PRIMARY KEY(name))")
conn.execute(
    "CREATE NODE TABLE Person (name STRING, birthDate STRING, PRIMARY KEY(name))"
)
conn.execute("CREATE REL TABLE ActedIn (FROM Person TO Movie)")
```

```output
<kuzu.query_result.QueryResult at 0x1066ff410>
```

फिर हम कुछ डेटा डाल सकते हैं।

```python
conn.execute("CREATE (:Person {name: 'Al Pacino', birthDate: '1940-04-25'})")
conn.execute("CREATE (:Person {name: 'Robert De Niro', birthDate: '1943-08-17'})")
conn.execute("CREATE (:Movie {name: 'The Godfather'})")
conn.execute("CREATE (:Movie {name: 'The Godfather: Part II'})")
conn.execute(
    "CREATE (:Movie {name: 'The Godfather Coda: The Death of Michael Corleone'})"
)
conn.execute(
    "MATCH (p:Person), (m:Movie) WHERE p.name = 'Al Pacino' AND m.name = 'The Godfather' CREATE (p)-[:ActedIn]->(m)"
)
conn.execute(
    "MATCH (p:Person), (m:Movie) WHERE p.name = 'Al Pacino' AND m.name = 'The Godfather: Part II' CREATE (p)-[:ActedIn]->(m)"
)
conn.execute(
    "MATCH (p:Person), (m:Movie) WHERE p.name = 'Al Pacino' AND m.name = 'The Godfather Coda: The Death of Michael Corleone' CREATE (p)-[:ActedIn]->(m)"
)
conn.execute(
    "MATCH (p:Person), (m:Movie) WHERE p.name = 'Robert De Niro' AND m.name = 'The Godfather: Part II' CREATE (p)-[:ActedIn]->(m)"
)
```

```output
<kuzu.query_result.QueryResult at 0x107016210>
```

## `KuzuQAChain` बनाना

अब हम `KuzuGraph` और `KuzuQAChain` बना सकते हैं। `KuzuGraph` बनाने के लिए हमें बस डेटाबेस ऑब्जेक्ट को `KuzuGraph` कंस्ट्रक्टर में पास करना है।

```python
from langchain.chains import KuzuQAChain
from langchain_community.graphs import KuzuGraph
from langchain_openai import ChatOpenAI
```

```python
graph = KuzuGraph(db)
```

```python
chain = KuzuQAChain.from_llm(ChatOpenAI(temperature=0), graph=graph, verbose=True)
```

## ग्राफ स्कीमा जानकारी ताज़ा करें

यदि डेटाबेस की स्कीमा में परिवर्तन होता है, तो आप Cypher बयान जनरेट करने के लिए आवश्यक स्कीमा जानकारी को ताज़ा कर सकते हैं।

```python
# graph.refresh_schema()
```

```python
print(graph.get_schema)
```

```output
Node properties: [{'properties': [('name', 'STRING')], 'label': 'Movie'}, {'properties': [('name', 'STRING'), ('birthDate', 'STRING')], 'label': 'Person'}]
Relationships properties: [{'properties': [], 'label': 'ActedIn'}]
Relationships: ['(:Person)-[:ActedIn]->(:Movie)']
```

## ग्राफ का क्वेरी करना

अब हम `KuzuQAChain` का उपयोग करके ग्राफ से प्रश्न पूछ सकते हैं।

```python
chain.run("Who played in The Godfather: Part II?")
```

```output


[1m> Entering new  chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person)-[:ActedIn]->(m:Movie {name: 'The Godfather: Part II'}) RETURN p.name[0m
Full Context:
[32;1m[1;3m[{'p.name': 'Al Pacino'}, {'p.name': 'Robert De Niro'}][0m

[1m> Finished chain.[0m
```

```output
'Al Pacino and Robert De Niro both played in The Godfather: Part II.'
```

```python
chain.run("Robert De Niro played in which movies?")
```

```output


[1m> Entering new  chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person {name: 'Robert De Niro'})-[:ActedIn]->(m:Movie)
RETURN m.name[0m
Full Context:
[32;1m[1;3m[{'m.name': 'The Godfather: Part II'}][0m

[1m> Finished chain.[0m
```

```output
'Robert De Niro played in The Godfather: Part II.'
```

```python
chain.run("Robert De Niro is born in which year?")
```

```output


[1m> Entering new  chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person {name: 'Robert De Niro'})-[:ActedIn]->(m:Movie)
RETURN p.birthDate[0m
Full Context:
[32;1m[1;3m[{'p.birthDate': '1943-08-17'}][0m

[1m> Finished chain.[0m
```

```output
'Robert De Niro was born on August 17, 1943.'
```

```python
chain.run("Who is the oldest actor who played in The Godfather: Part II?")
```

```output


[1m> Entering new  chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person)-[:ActedIn]->(m:Movie{name:'The Godfather: Part II'})
WITH p, m, p.birthDate AS birthDate
ORDER BY birthDate ASC
LIMIT 1
RETURN p.name[0m
Full Context:
[32;1m[1;3m[{'p.name': 'Al Pacino'}][0m

[1m> Finished chain.[0m
```

```output
'The oldest actor who played in The Godfather: Part II is Al Pacino.'
```
