---
translated: true
---

# नेब्यूला ग्राफ

>[नेब्यूला ग्राफ](https://www.nebula-graph.io/) एक ओपन-सोर्स, वितरित, स्केलेबल, तेज़ी से चलने वाला ग्राफ डेटाबेस है जो बहुत बड़े पैमाने पर ग्राफों के लिए मिलीसेकंड की लेटेंसी के साथ बनाया गया है। यह `nGQL` ग्राफ क्वेरी भाषा का उपयोग करता है।

>`nGQL`(https://docs.nebula-graph.io/3.0.0/3.ngql-guide/1.nGQL-overview/1.overview/) `नेब्यूला ग्राफ` के लिए एक घोषणात्मक ग्राफ क्वेरी भाषा है। यह अभिव्यक्त और कुशल ग्राफ पैटर्न की अनुमति देता है। `nGQL` डेवलपर्स और ऑपरेशंस पेशेवरों दोनों के लिए डिज़ाइन किया गया है। `nGQL` एक SQL-जैसी क्वेरी भाषा है।

यह नोटबुक दिखाता है कि कैसे एलएलएम का उपयोग करके `नेब्यूला ग्राफ` डेटाबेस के लिए एक प्राकृतिक भाषा इंटरफ़ेस प्रदान किया जा सकता है।

## सेटअप करना

आप निम्नलिखित स्क्रिप्ट चलाकर एक Docker कंटेनर के रूप में `नेब्यूला ग्राफ` क्लस्टर शुरू कर सकते हैं:

```bash
curl -fsSL nebula-up.siwei.io/install.sh | bash
```

अन्य विकल्प हैं:
- [Docker Desktop एक्सटेंशन](https://www.docker.com/blog/distributed-cloud-native-graph-database-nebulagraph-docker-extension/) के रूप में स्थापित करें। [यहां](https://docs.nebula-graph.io/3.5.0/2.quick-start/1.quick-start-workflow/) देखें
- नेब्यूला ग्राफ क्लाउड सेवा। [यहां](https://www.nebula-graph.io/cloud) देखें
- पैकेज, सोर्स कोड या Kubernetes के माध्यम से तैनात करें। [यहां](https://docs.nebula-graph.io/) देखें

एक बार क्लस्टर चल रहा हो, तो हम डेटाबेस के लिए `SPACE` और `SCHEMA` बना सकते हैं।

```python
%pip install --upgrade --quiet  ipython-ngql
%load_ext ngql

# connect ngql jupyter extension to nebulagraph
%ngql --address 127.0.0.1 --port 9669 --user root --password nebula
# create a new space
%ngql CREATE SPACE IF NOT EXISTS langchain(partition_num=1, replica_factor=1, vid_type=fixed_string(128));
```

```python
# Wait for a few seconds for the space to be created.
%ngql USE langchain;
```

पूर्ण डेटासेट के लिए स्कीमा बनाएं, [यहां](https://www.siwei.io/en/nebulagraph-etl-dbt/) देखें।

```python
%%ngql
CREATE TAG IF NOT EXISTS movie(name string);
CREATE TAG IF NOT EXISTS person(name string, birthdate string);
CREATE EDGE IF NOT EXISTS acted_in();
CREATE TAG INDEX IF NOT EXISTS person_index ON person(name(128));
CREATE TAG INDEX IF NOT EXISTS movie_index ON movie(name(128));
```

स्कीमा निर्माण पूरा होने का इंतज़ार करें, फिर हम कुछ डेटा डाल सकते हैं।

```python
%%ngql
INSERT VERTEX person(name, birthdate) VALUES "Al Pacino":("Al Pacino", "1940-04-25");
INSERT VERTEX movie(name) VALUES "The Godfather II":("The Godfather II");
INSERT VERTEX movie(name) VALUES "The Godfather Coda: The Death of Michael Corleone":("The Godfather Coda: The Death of Michael Corleone");
INSERT EDGE acted_in() VALUES "Al Pacino"->"The Godfather II":();
INSERT EDGE acted_in() VALUES "Al Pacino"->"The Godfather Coda: The Death of Michael Corleone":();
```

```python
from langchain.chains import NebulaGraphQAChain
from langchain_community.graphs import NebulaGraph
from langchain_openai import ChatOpenAI
```

```python
graph = NebulaGraph(
    space="langchain",
    username="root",
    password="nebula",
    address="127.0.0.1",
    port=9669,
    session_pool_size=30,
)
```

## ग्राफ स्कीमा जानकारी ताज़ा करें

यदि डेटाबेस की स्कीमा में परिवर्तन होता है, तो आप nGQL बयानों को जनरेट करने के लिए आवश्यक स्कीमा जानकारी ताज़ा कर सकते हैं।

```python
# graph.refresh_schema()
```

```python
print(graph.get_schema)
```

```output
Node properties: [{'tag': 'movie', 'properties': [('name', 'string')]}, {'tag': 'person', 'properties': [('name', 'string'), ('birthdate', 'string')]}]
Edge properties: [{'edge': 'acted_in', 'properties': []}]
Relationships: ['(:person)-[:acted_in]->(:movie)']
```

## ग्राफ का क्वेरी करना

अब हम ग्राफ सायफर क्यूए श्रृंखला का उपयोग करके ग्राफ से प्रश्न पूछ सकते हैं।

```python
chain = NebulaGraphQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True
)
```

```python
chain.run("Who played in The Godfather II?")
```

```output


[1m> Entering new NebulaGraphQAChain chain...[0m
Generated nGQL:
[32;1m[1;3mMATCH (p:`person`)-[:acted_in]->(m:`movie`) WHERE m.`movie`.`name` == 'The Godfather II'
RETURN p.`person`.`name`[0m
Full Context:
[32;1m[1;3m{'p.person.name': ['Al Pacino']}[0m

[1m> Finished chain.[0m
```

```output
'Al Pacino played in The Godfather II.'
```
