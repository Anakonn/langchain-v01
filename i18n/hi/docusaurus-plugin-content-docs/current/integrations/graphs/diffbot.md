---
translated: true
---

# डिफ़्बॉट

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/graph/diffbot_graphtransformer.ipynb)

>[डिफ़्बॉट](https://docs.diffbot.com/docs/getting-started-with-diffbot) एक उत्पादों का समूह है जो वेब पर डेटा को एकीकृत और अनुसंधान करना आसान बनाता है।
>
>[डिफ़्बॉट नॉलेज ग्राफ](https://docs.diffbot.com/docs/getting-started-with-diffbot-knowledge-graph) सार्वजनिक वेब का स्वयं-अपडेट होने वाला ग्राफ डेटाबेस है।

## उपयोग मामला

पाठ डेटा में अक्सर समृद्ध संबंध और अंतर्दृष्टि होती हैं जिनका उपयोग विभिन्न विश्लेषण, सिफारिश इंजन या ज्ञान प्रबंधन अनुप्रयोगों के लिए किया जाता है।

`डिफ़्बॉट का एनएलपी एपीआई` अव्यवस्थित पाठ डेटा से इकाइयों, संबंधों और सेमेंटिक अर्थ का निष्कर्षण करने की अनुमति देता है।

`डिफ़्बॉट का एनएलपी एपीआई` को `नियो4जे`, एक ग्राफ डेटाबेस के साथ जोड़कर, आप पाठ से निकाले गए जानकारी पर आधारित शक्तिशाली, गतिशील ग्राफ संरचनाएं बना सकते हैं। ये ग्राफ संरचनाएं पूरी तरह से क्वेरी योग्य हैं और विभिन्न अनुप्रयोगों में एकीकृत की जा सकती हैं।

इस संयोजन से निम्नलिखित उपयोग मामले संभव हैं:

* पाठ दस्तावेजों, वेबसाइटों या सोशल मीडिया फ़ीड से ज्ञान ग्राफ बनाना।
* डेटा में सेमेंटिक संबंधों पर आधारित सिफारिशें बनाना।
* इकाइयों के बीच संबंधों को समझने वाले उन्नत खोज सुविधाएं बनाना।
* उपयोगकर्ताओं को डेटा में छिपे संबंधों का अन्वेषण करने की अनुमति देने वाले विश्लेषण डैशबोर्ड बनाना।

## अवलोकन

LangChain ग्राफ डेटाबेस के साथ इंटरैक्ट करने के लिए उपकरण प्रदान करता है:

1. ग्राफ ट्रांसफॉर्मर और स्टोर एकीकरण का उपयोग करके `पाठ से ज्ञान ग्राफ बनाना`
2. `ग्राफ डेटाबेस का क्वेरी करना` क्वेरी निर्माण और निष्पादन श्रृंखलाओं का उपयोग करके
3. `ग्राफ डेटाबेस के साथ इंटरैक्ट करना` एजेंटों का उपयोग करके मजबूत और लचीली क्वेरी के लिए

## सेटअप करना

पहले, आवश्यक पैकेज प्राप्त करें और वातावरण चर सेट करें:

```python
%pip install --upgrade --quiet  langchain langchain-experimental langchain-openai neo4j wikipedia
```

### डिफ़्बॉट एनएलपी सेवा

`डिफ़्बॉट का एनएलपी` सेवा अव्यवस्थित पाठ डेटा से इकाइयों, संबंधों और सेमेंटिक संदर्भ का निष्कर्षण करने का एक उपकरण है।
इस निकाली गई जानकारी का उपयोग ज्ञान ग्राफ बनाने के लिए किया जा सकता है।
इनकी सेवा का उपयोग करने के लिए, आपको [डिफ़्बॉट](https://www.diffbot.com/products/natural-language/) से एक एपीआई कुंजी प्राप्त करनी होगी।

```python
from langchain_experimental.graph_transformers.diffbot import DiffbotGraphTransformer

diffbot_api_key = "DIFFBOT_API_KEY"
diffbot_nlp = DiffbotGraphTransformer(diffbot_api_key=diffbot_api_key)
```

यह कोड "वॉरेन बफे" के बारे में विकिपीडिया लेख प्राप्त करता है और फिर `DiffbotGraphTransformer` का उपयोग करके इकाइयों और संबंधों को निकालता है।
`DiffbotGraphTransformer` एक संरचित डेटा `GraphDocument` आउटपुट करता है, जिसका उपयोग ग्राफ डेटाबेस को भरने के लिए किया जा सकता है।
ध्यान दें कि डिफ़्बॉट के [प्रति एपीआई अनुरोध अक्षर सीमा](https://docs.diffbot.com/reference/introduction-to-natural-language-api) के कारण पाठ टुकड़ों से बचा जाता है।

```python
from langchain_community.document_loaders import WikipediaLoader

query = "Warren Buffett"
raw_documents = WikipediaLoader(query=query).load()
graph_documents = diffbot_nlp.convert_to_graph_documents(raw_documents)
```

## ज्ञान ग्राफ में डेटा लोड करना

आपको एक चल रहा नियो4जे इंस्टेंस होना चाहिए। एक विकल्प [नियो4जे ऑरा क्लाउड सेवा में एक मुफ्त नियो4जे डेटाबेस इंस्टेंस बनाना](https://neo4j.com/cloud/platform/aura-graph-database/) है। आप [नियो4जे डेस्कटॉप एप्लिकेशन](https://neo4j.com/download/) का उपयोग करके या एक डॉकर कंटेनर चलाकर भी डेटाबेस को स्थानीय रूप से चला सकते हैं। आप निम्नलिखित स्क्रिप्ट को निष्पादित करके एक स्थानीय डॉकर कंटेनर चला सकते हैं:

```bash
docker run \
    --name neo4j \
    -p 7474:7474 -p 7687:7687 \
    -d \
    -e NEO4J_AUTH=neo4j/pleaseletmein \
    -e NEO4J_PLUGINS=\[\"apoc\"\]  \
    neo4j:latest
```

यदि आप डॉकर कंटेनर का उपयोग कर रहे हैं, तो डेटाबेस शुरू होने के लिए कुछ सेकंड प्रतीक्षा करनी होगी।

```python
from langchain_community.graphs import Neo4jGraph

url = "bolt://localhost:7687"
username = "neo4j"
password = "pleaseletmein"

graph = Neo4jGraph(url=url, username=username, password=password)
```

`GraphDocuments` को `add_graph_documents` विधि का उपयोग करके ज्ञान ग्राफ में लोड किया जा सकता है।

```python
graph.add_graph_documents(graph_documents)
```

## ग्राफ स्कीमा जानकारी ताज़ा करें

यदि डेटाबेस का स्कीमा बदलता है, तो आप साइफर वक्तव्य बनाने के लिए आवश्यक स्कीमा जानकारी ताज़ा कर सकते हैं।

```python
graph.refresh_schema()
```

## ग्राफ का क्वेरी करना

अब हम ग्राफ साइफर क्यूए श्रृंखला का उपयोग करके ग्राफ से प्रश्न पूछ सकते हैं। सर्वश्रेष्ठ अनुभव प्राप्त करने के लिए **gpt-4** का उपयोग करना सलाह दी जाती है।

```python
from langchain.chains import GraphCypherQAChain
from langchain_openai import ChatOpenAI

chain = GraphCypherQAChain.from_llm(
    cypher_llm=ChatOpenAI(temperature=0, model_name="gpt-4"),
    qa_llm=ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo"),
    graph=graph,
    verbose=True,
)
```

```python
chain.run("Which university did Warren Buffett attend?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person {name: "Warren Buffett"})-[:EDUCATED_AT]->(o:Organization)
RETURN o.name[0m
Full Context:
[32;1m[1;3m[{'o.name': 'New York Institute of Finance'}, {'o.name': 'Alice Deal Junior High School'}, {'o.name': 'Woodrow Wilson High School'}, {'o.name': 'University of Nebraska'}][0m

[1m> Finished chain.[0m
```

```output
'Warren Buffett attended the University of Nebraska.'
```

```python
chain.run("Who is or was working at Berkshire Hathaway?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person)-[r:EMPLOYEE_OR_MEMBER_OF]->(o:Organization) WHERE o.name = 'Berkshire Hathaway' RETURN p.name[0m
Full Context:
[32;1m[1;3m[{'p.name': 'Charlie Munger'}, {'p.name': 'Oliver Chace'}, {'p.name': 'Howard Buffett'}, {'p.name': 'Howard'}, {'p.name': 'Susan Buffett'}, {'p.name': 'Warren Buffett'}][0m

[1m> Finished chain.[0m
```

```output
'Charlie Munger, Oliver Chace, Howard Buffett, Susan Buffett, and Warren Buffett are or were working at Berkshire Hathaway.'
```
