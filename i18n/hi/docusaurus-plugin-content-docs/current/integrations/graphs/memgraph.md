---
translated: true
---

# मेमग्राफ

>[मेमग्राफ](https://github.com/memgraph/memgraph) एक ओपन-सोर्स ग्राफ डेटाबेस है, जो `Neo4j` के साथ संगत है।
>यह डेटाबेस `Cypher` ग्राफ क्वेरी भाषा का उपयोग करता है,
>
>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language)) एक घोषणात्मक ग्राफ क्वेरी भाषा है जो संपत्ति ग्राफ में प्रभावी और कुशल डेटा क्वेरी करने की अभिव्यक्ति की अनुमति देती है।

यह नोटबुक दिखाता है कि कैसे एलएलएम का उपयोग करके [मेमग्राफ](https://github.com/memgraph/memgraph) डेटाबेस के लिए एक प्राकृतिक भाषा इंटरफ़ेस प्रदान किया जा सकता है।

## सेटअप करना

इस ट्यूटोरियल को पूरा करने के लिए आपको [Docker](https://www.docker.com/get-started/) और [Python 3.x](https://www.python.org/) स्थापित होना चाहिए।

सुनिश्चित करें कि आपके पास एक चल रहा मेमग्राफ इंस्टेंस है। मेमग्राफ प्लेटफ़ॉर्म (मेमग्राफ डेटाबेस + MAGE लाइब्रेरी + मेमग्राफ लैब) को पहली बार त्वरित रूप से चलाने के लिए, निम्नलिखित कार्रवाई करें:

Linux/MacOS पर:

```bash
curl https://install.memgraph.com | sh
```

Windows पर:

```bash
iwr https://windows.memgraph.com | iex
```

दोनों कमांड एक स्क्रिप्ट चलाती हैं जो आपके सिस्टम में एक Docker Compose फ़ाइल डाउनलोड करती है, `memgraph-mage` और `memgraph-lab` Docker सेवाओं को बनाती और शुरू करती है।

स्थापना प्रक्रिया के बारे में अधिक जानकारी के लिए [मेमग्राफ दस्तावेज़ीकरण](https://memgraph.com/docs/getting-started/install-memgraph) पढ़ें।

अब आप `मेमग्राफ` के साथ खेलना शुरू कर सकते हैं!

शुरू करने से पहले, सभी आवश्यक पैकेजों को स्थापित और आयात करें। हम [pip](https://pip.pypa.io/en/stable/installation/) नामक पैकेज प्रबंधक का उपयोग करेंगे, साथ ही `--user` फ्लैग का उपयोग करेंगे ताकि उचित अनुमतियां सुनिश्चित हों। यदि आपने Python 3.4 या बाद का संस्करण स्थापित किया है, तो pip डिफ़ॉल्ट रूप से शामिल है। आप निम्नलिखित कमांड का उपयोग करके आवश्यक सभी पैकेज स्थापित कर सकते हैं:

```python
pip install langchain langchain-openai neo4j gqlalchemy --user
```

आप इस नोटबुक में प्रदान किए गए कोड ब्लॉक को चला सकते हैं या मेमग्राफ और LangChain के साथ प्रयोग करने के लिए एक अलग Python फ़ाइल का उपयोग कर सकते हैं।

```python
import os

from gqlalchemy import Memgraph
from langchain.chains import GraphCypherQAChain
from langchain_community.graphs import MemgraphGraph
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
```

हम Python लाइब्रेरी [GQLAlchemy](https://github.com/memgraph/gqlalchemy) का उपयोग कर रहे हैं ताकि हमारे मेमग्राफ डेटाबेस और Python स्क्रिप्ट के बीच कनेक्शन स्थापित किया जा सके। आप Neo4j ड्राइवर का उपयोग करके भी चल रहे मेमग्राफ इंस्टेंस से कनेक्शन स्थापित कर सकते हैं, क्योंकि यह मेमग्राफ के साथ संगत है। GQLAlchemy के साथ क्वेरी निष्पादित करने के लिए, हम निम्नलिखित तरीके से एक मेमग्राफ इंस्टेंस सेट कर सकते हैं:

```python
memgraph = Memgraph(host="127.0.0.1", port=7687)
```

## डेटाबेस भरना

आप अपने नए, खाली डेटाबेस को Cypher क्वेरी भाषा का उपयोग करके आसानी से भर सकते हैं। चिंता न करें यदि आप अभी तक हर पंक्ति को नहीं समझते, आप दस्तावेज़ीकरण [यहाँ](https://memgraph.com/docs/cypher-manual/) से Cypher सीख सकते हैं। निम्नलिखित स्क्रिप्ट को चलाने से एक सीडिंग क्वेरी डेटाबेस पर निष्पादित होगी, जिससे हमें एक वीडियो गेम के बारे में डेटा मिलेगा, जिसमें प्रकाशक, उपलब्ध प्लेटफ़ॉर्म और शैलियों के विवरण शामिल हैं। यह डेटा हमारे काम का आधार होगा।

```python
# Creating and executing the seeding query
query = """
    MERGE (g:Game {name: "Baldur's Gate 3"})
    WITH g, ["PlayStation 5", "Mac OS", "Windows", "Xbox Series X/S"] AS platforms,
            ["Adventure", "Role-Playing Game", "Strategy"] AS genres
    FOREACH (platform IN platforms |
        MERGE (p:Platform {name: platform})
        MERGE (g)-[:AVAILABLE_ON]->(p)
    )
    FOREACH (genre IN genres |
        MERGE (gn:Genre {name: genre})
        MERGE (g)-[:HAS_GENRE]->(gn)
    )
    MERGE (p:Publisher {name: "Larian Studios"})
    MERGE (g)-[:PUBLISHED_BY]->(p);
"""

memgraph.execute(query)
```

## ग्राफ स्कीमा ताज़ा करें

आप मेमग्राफ-LangChain ग्राफ को निम्नलिखित स्क्रिप्ट का उपयोग करके इंस्टैंशिएट करने के लिए तैयार हैं। यह इंटरफ़ेस LangChain का उपयोग करके हमें अपने डेटाबेस में क्वेरी करने की अनुमति देगा, जो LLM के माध्यम से Cypher क्वेरी बनाने के लिए आवश्यक ग्राफ स्कीमा स्वचालित रूप से बनाएगा।

```python
graph = MemgraphGraph(url="bolt://localhost:7687", username="", password="")
```

यदि आवश्यक हो, तो आप निम्नलिखित स्क्रिप्ट का उपयोग करके ग्राफ स्कीमा को मैनुअल रूप से ताज़ा कर सकते हैं।

```python
graph.refresh_schema()
```

डेटा से परिचित होने और अद्यतन ग्राफ स्कीमा की पुष्टि करने के लिए, आप निम्नलिखित बयान का उपयोग करके इसे प्रिंट कर सकते हैं।

```python
print(graph.schema)
```

```output
Node properties are the following:
Node name: 'Game', Node properties: [{'property': 'name', 'type': 'str'}]
Node name: 'Platform', Node properties: [{'property': 'name', 'type': 'str'}]
Node name: 'Genre', Node properties: [{'property': 'name', 'type': 'str'}]
Node name: 'Publisher', Node properties: [{'property': 'name', 'type': 'str'}]

Relationship properties are the following:

The relationships are the following:
['(:Game)-[:AVAILABLE_ON]->(:Platform)']
['(:Game)-[:HAS_GENRE]->(:Genre)']
['(:Game)-[:PUBLISHED_BY]->(:Publisher)']
```

## डेटाबेस क्वेरी करना

OpenAI API के साथ इंटरैक्ट करने के लिए, आपको Python [os](https://docs.python.org/3/library/os.html) पैकेज का उपयोग करके अपने API कुंजी को एक पर्यावरण चर के रूप में कॉन्फ़िगर करना होगा। यह आपके अनुरोधों के लिए उचित प्राधिकरण सुनिश्चित करता है। आप अपनी API कुंजी प्राप्त करने के बारे में अधिक जानकारी [यहाँ](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key) पा सकते हैं।

```python
os.environ["OPENAI_API_KEY"] = "your-key-here"
```

आपको निम्नलिखित स्क्रिप्ट का उपयोग करके ग्राफ श्रृंखला बनानी चाहिए, जिसका उपयोग प्रश्न-उत्तर प्रक्रिया में किया जाएगा जो आपके ग्राफ डेटा पर आधारित है। यह GPT-3.5-turbo को डिफ़ॉल्ट मानता है, लेकिन आप [GPT-4](https://help.openai.com/en/articles/7102672-how-can-i-access-gpt-4) जैसे अन्य मॉडलों का भी प्रयोग कर सकते हैं जो कि उल्लेखनीय रूप से बेहतर Cypher क्वेरी और परिणाम प्रदान करते हैं। हम OpenAI चैट का उपयोग करेंगे, जिसमें आपने पहले कॉन्फ़िगर किया था। हम तापमान को शून्य पर सेट करेंगे, जिससे पूर्वानुमेय और सुसंगत उत्तर सुनिश्चित होंगे। इसके अलावा, हम अपने Memgraph-LangChain ग्राफ का उपयोग करेंगे और verbose पैरामीटर को, जो डिफ़ॉल्ट रूप से False है, True पर सेट करेंगे ताकि क्वेरी जनरेशन के बारे में अधिक विस्तृत संदेश प्राप्त हों।

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, model_name="gpt-3.5-turbo"
)
```

अब आप प्रश्न पूछना शुरू कर सकते हैं!

```python
response = chain.run("Which platforms is Baldur's Gate 3 available on?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (g:Game {name: 'Baldur\'s Gate 3'})-[:AVAILABLE_ON]->(p:Platform)
RETURN p.name
Full Context:
[{'p.name': 'PlayStation 5'}, {'p.name': 'Mac OS'}, {'p.name': 'Windows'}, {'p.name': 'Xbox Series X/S'}]

> Finished chain.
Baldur's Gate 3 is available on PlayStation 5, Mac OS, Windows, and Xbox Series X/S.
```

```python
response = chain.run("Is Baldur's Gate 3 available on Windows?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (:Game {name: 'Baldur\'s Gate 3'})-[:AVAILABLE_ON]->(:Platform {name: 'Windows'})
RETURN true
Full Context:
[{'true': True}]

> Finished chain.
Yes, Baldur's Gate 3 is available on Windows.
```

## श्रृंखला संशोधक

अपनी श्रृंखला के व्यवहार को संशोधित करने और अधिक संदर्भ या अतिरिक्त जानकारी प्राप्त करने के लिए, आप श्रृंखला के पैरामीटरों को संशोधित कर सकते हैं।

#### प्रत्यक्ष क्वेरी परिणाम लौटाएं

`return_direct` संशोधक निर्दिष्ट करता है कि क्या निष्पादित Cypher क्वेरी के प्रत्यक्ष परिणाम या प्रसंस्कृत प्राकृतिक भाषा प्रतिक्रिया लौटाई जानी चाहिए।

```python
# Return the result of querying the graph directly
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_direct=True
)
```

```python
response = chain.run("Which studio published Baldur's Gate 3?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (:Game {name: 'Baldur\'s Gate 3'})-[:PUBLISHED_BY]->(p:Publisher)
RETURN p.name

> Finished chain.
[{'p.name': 'Larian Studios'}]
```

#### क्वेरी मध्यवर्ती चरण लौटाएं

`return_intermediate_steps` श्रृंखला संशोधक प्रतिक्रिया में प्रारंभिक क्वेरी परिणाम के अलावा क्वेरी के मध्यवर्ती चरणों को भी शामिल करके उत्तर को बेहतर बनाता है।

```python
# Return all the intermediate steps of query execution
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_intermediate_steps=True
)
```

```python
response = chain("Is Baldur's Gate 3 an Adventure game?")
print(f"Intermediate steps: {response['intermediate_steps']}")
print(f"Final response: {response['result']}")
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (g:Game {name: 'Baldur\'s Gate 3'})-[:HAS_GENRE]->(genre:Genre {name: 'Adventure'})
RETURN g, genre
Full Context:
[{'g': {'name': "Baldur's Gate 3"}, 'genre': {'name': 'Adventure'}}]

> Finished chain.
Intermediate steps: [{'query': "MATCH (g:Game {name: 'Baldur\\'s Gate 3'})-[:HAS_GENRE]->(genre:Genre {name: 'Adventure'})\nRETURN g, genre"}, {'context': [{'g': {'name': "Baldur's Gate 3"}, 'genre': {'name': 'Adventure'}}]}]
Final response: Yes, Baldur's Gate 3 is an Adventure game.
```

#### क्वेरी परिणामों की संख्या सीमित करें

जब आप क्वेरी परिणामों की अधिकतम संख्या को प्रतिबंधित करना चाहते हैं, तो `top_k` संशोधक का उपयोग किया जा सकता है।

```python
# Limit the maximum number of results returned by query
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, top_k=2
)
```

```python
response = chain.run("What genres are associated with Baldur's Gate 3?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (:Game {name: 'Baldur\'s Gate 3'})-[:HAS_GENRE]->(g:Genre)
RETURN g.name
Full Context:
[{'g.name': 'Adventure'}, {'g.name': 'Role-Playing Game'}]

> Finished chain.
Baldur's Gate 3 is associated with the genres Adventure and Role-Playing Game.
```

# उन्नत क्वेरी

जैसे-जैसे आपके समाधान की जटिलता बढ़ती है, आप विभिन्न उपयोग मामलों का सामना कर सकते हैं जिनका सावधानीपूर्वक निपटान करना आवश्यक है। अपने अनुप्रयोग की स्केलेबिलिटी को बनाए रखना, किसी भी अड़चन के बिना सुचारु उपयोगकर्ता प्रवाह बनाए रखने के लिए अत्यावश्यक है।

आइए एक बार फिर अपनी श्रृंखला को प्रारंभ करें और कुछ ऐसे प्रश्नों का प्रयास करें जो उपयोगकर्ता संभवतः पूछ सकते हैं।

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, model_name="gpt-3.5-turbo"
)
```

```python
response = chain.run("Is Baldur's Gate 3 available on PS5?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (g:Game {name: 'Baldur\'s Gate 3'})-[:AVAILABLE_ON]->(p:Platform {name: 'PS5'})
RETURN g.name, p.name
Full Context:
[]

> Finished chain.
I'm sorry, but I don't have the information to answer your question.
```

उत्पन्न साइफर क्वेरी ठीक लग रही है, लेकिन हमें कोई जानकारी प्राप्त नहीं हुई। यह एलएलएम के साथ काम करते समय एक सामान्य चुनौती को दर्शाता है - उपयोगकर्ताओं द्वारा प्रश्नों को कैसे प्रस्तुत किया जाता है और डेटा कैसे संग्रहीत किया जाता है, इसके बीच असंरेखण। इस मामले में, उपयोगकर्ता की धारणा और वास्तविक डेटा संग्रह के बीच अंतर मेल नहीं खा सकता है। प्रोम्प्ट रिफाइनमेंट, मॉडल के प्रोम्प्ट को इन अंतरों को बेहतर समझने के लिए अधिक कुशल बनाने की प्रक्रिया, एक कुशल समाधान है जो इस मुद्दे को संबोधित करता है। प्रोम्प्ट रिफाइनमेंट के माध्यम से, मॉडल सटीक और प्रासंगिक क्वेरी उत्पन्न करने में अधिक कुशल हो जाता है, जिससे वांछित डेटा को सफलतापूर्वक पुनर्प्राप्त करने में मदद मिलती है।

### प्रोम्प्ट रिफाइनमेंट

इस मुद्दे को संबोधित करने के लिए, हम क्यूए श्रृंखला के प्रारंभिक साइफर प्रोम्प्ट को समायोजित कर सकते हैं। इसमें एलएलएम को उपयोगकर्ता कैसे विशिष्ट प्लेटफार्मों का संदर्भ दे सकते हैं, जैसे कि हमारे मामले में PS5, पर मार्गदर्शन शामिल करना शामिल है। हम LangChain [PromptTemplate](/docs/modules/model_io/prompts/) का उपयोग करके इसे प्राप्त करते हैं, एक संशोधित प्रारंभिक प्रोम्प्ट बनाते हैं। यह संशोधित प्रोम्प्ट फिर हमारे संशोधित Memgraph-LangChain इंस्टेंस के तर्क के रूप में प्रदान किया जाता है।

```python
CYPHER_GENERATION_TEMPLATE = """
Task:Generate Cypher statement to query a graph database.
Instructions:
Use only the provided relationship types and properties in the schema.
Do not use any other relationship types or properties that are not provided.
Schema:
{schema}
Note: Do not include any explanations or apologies in your responses.
Do not respond to any questions that might ask anything else than for you to construct a Cypher statement.
Do not include any text except the generated Cypher statement.
If the user asks about PS5, Play Station 5 or PS 5, that is the platform called PlayStation 5.

The question is:
{question}
"""

CYPHER_GENERATION_PROMPT = PromptTemplate(
    input_variables=["schema", "question"], template=CYPHER_GENERATION_TEMPLATE
)
```

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0),
    cypher_prompt=CYPHER_GENERATION_PROMPT,
    graph=graph,
    verbose=True,
    model_name="gpt-3.5-turbo",
)
```

```python
response = chain.run("Is Baldur's Gate 3 available on PS5?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (g:Game {name: 'Baldur\'s Gate 3'})-[:AVAILABLE_ON]->(p:Platform {name: 'PlayStation 5'})
RETURN g.name, p.name
Full Context:
[{'g.name': "Baldur's Gate 3", 'p.name': 'PlayStation 5'}]

> Finished chain.
Yes, Baldur's Gate 3 is available on PlayStation 5.
```

अब, प्लेटफार्म नामकरण पर मार्गदर्शन सहित संशोधित प्रारंभिक साइफर प्रोम्प्ट के साथ, हम सटीक और प्रासंगिक परिणाम प्राप्त कर रहे हैं जो उपयोगकर्ता क्वेरी के साथ अधिक करीब से मेल खाते हैं।

यह दृष्टिकोण आपकी क्यूए श्रृंखला को और अधिक बेहतर बनाने की अनुमति देता है। आप अपनी श्रृंखला में अतिरिक्त प्रोम्प्ट रिफाइनमेंट डेटा को आसानी से एकीकृत कर सकते हैं, जिससे आपके ऐप के समग्र उपयोगकर्ता अनुभव में सुधार होता है।
