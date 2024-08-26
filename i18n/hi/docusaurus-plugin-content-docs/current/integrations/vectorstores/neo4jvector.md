---
translated: true
---

# Neo4j वेक्टर इंडेक्स

>[Neo4j](https://neo4j.com/) एक ओपन-सोर्स ग्राफ़ डेटाबेस है जिसमें वेक्टर समानता खोज के लिए एकीकृत समर्थन है

यह समर्थन करता है:

- लगभग निकटतम पड़ोसी खोज
- यूक्लिडियन समानता और कोसाइन समानता
- वेक्टर और कीवर्ड खोज का संयुक्त उपयोग

यह नोटबुक `Neo4jVector` वेक्टर इंडेक्स का उपयोग करने का प्रदर्शन करता है।

[स्थापना निर्देश](https://neo4j.com/docs/operations-manual/current/installation/) देखें।

```python
# Pip install necessary package
%pip install --upgrade --quiet  neo4j
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  tiktoken
```

हम `OpenAIEmbeddings` का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key: ········
```

```python
from langchain_community.docstore.document import Document
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Neo4jVector
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
loader = TextLoader("../../modules/state_of_the_union.txt")

documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
# Neo4jVector requires the Neo4j database credentials

url = "bolt://localhost:7687"
username = "neo4j"
password = "password"

# You can also use environment variables instead of directly passing named parameters
# os.environ["NEO4J_URI"] = "bolt://localhost:7687"
# os.environ["NEO4J_USERNAME"] = "neo4j"
# os.environ["NEO4J_PASSWORD"] = "pleaseletmein"
```

## कोसाइन दूरी (डिफ़ॉल्ट) के साथ समानता खोज

```python
# The Neo4jVector Module will connect to Neo4j and create a vector index if needed.

db = Neo4jVector.from_documents(
    docs, OpenAIEmbeddings(), url=url, username=username, password=password
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs_with_score = db.similarity_search_with_score(query, k=2)
```

```python
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Score:  0.9076391458511353
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.8912242650985718
A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
--------------------------------------------------------------------------------
```

## वेक्टरस्टोर के साथ काम करना

ऊपर, हमने स्क्रैच से एक वेक्टरस्टोर बनाया। हालांकि, अक्सर हम मौजूदा वेक्टरस्टोर के साथ काम करना चाहते हैं।
ऐसा करने के लिए, हम इसे सीधे प्रारंभ कर सकते हैं।

```python
index_name = "vector"  # default index name

store = Neo4jVector.from_existing_index(
    OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    index_name=index_name,
)
```

हम `from_existing_graph` विधि का उपयोग करके मौजूदा ग्राफ़ से भी एक वेक्टरस्टोर प्रारंभ कर सकते हैं। यह विधि डेटाबेस से प्रासंगिक पाठ जानकारी खींचती है और पाठ एम्बेडिंग को वापस डेटाबेस में गणना और संग्रहीत करती है।

```python
# First we create sample data in graph
store.query(
    "CREATE (p:Person {name: 'Tomaz', location:'Slovenia', hobby:'Bicycle', age: 33})"
)
```

```output
[]
```

```python
# Now we initialize from existing graph
existing_graph = Neo4jVector.from_existing_graph(
    embedding=OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    index_name="person_index",
    node_label="Person",
    text_node_properties=["name", "location"],
    embedding_node_property="embedding",
)
result = existing_graph.similarity_search("Slovenia", k=1)
```

```python
result[0]
```

```output
Document(page_content='\nname: Tomaz\nlocation: Slovenia', metadata={'age': 33, 'hobby': 'Bicycle'})
```

Neo4j रिश्ता वेक्टर इंडेक्स का भी समर्थन करता है, जहां एक एम्बेडिंग को एक रिश्ता गुण के रूप में संग्रहीत किया जाता है और सूचीबद्ध किया जाता है। LangChain के माध्यम से एक रिश्ता वेक्टर इंडेक्स को भरा नहीं जा सकता है, लेकिन आप मौजूदा रिश्ता वेक्टर इंडेक्स से जुड़ सकते हैं।

```python
# First we create sample data and index in graph
store.query(
    "MERGE (p:Person {name: 'Tomaz'}) "
    "MERGE (p1:Person {name:'Leann'}) "
    "MERGE (p1)-[:FRIEND {text:'example text', embedding:$embedding}]->(p2)",
    params={"embedding": OpenAIEmbeddings().embed_query("example text")},
)
# Create a vector index
relationship_index = "relationship_vector"
store.query(
    """
CREATE VECTOR INDEX $relationship_index
IF NOT EXISTS
FOR ()-[r:FRIEND]-() ON (r.embedding)
OPTIONS {indexConfig: {
 `vector.dimensions`: 1536,
 `vector.similarity_function`: 'cosine'
}}
""",
    params={"relationship_index": relationship_index},
)
```

```output
[]
```

```python
relationship_vector = Neo4jVector.from_existing_relationship_index(
    OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    index_name=relationship_index,
    text_node_property="text",
)
relationship_vector.similarity_search("Example")
```

```output
[Document(page_content='example text')]
```

### मेटाडेटा फ़िल्टरिंग

Neo4j वेक्टर स्टोर समानांतर रनटाइम और सटीक निकटतम पड़ोसी खोज का उपयोग करके मेटाडेटा फ़िल्टरिंग का भी समर्थन करता है।
_Neo4j 5.18 या उससे अधिक संस्करण की आवश्यकता है।_

समानता फ़िल्टरिंग निम्नलिखित वाक्यविन्यास का उपयोग करती है।

```python
existing_graph.similarity_search(
    "Slovenia",
    filter={"hobby": "Bicycle", "name": "Tomaz"},
)
```

```output
[Document(page_content='\nname: Tomaz\nlocation: Slovenia', metadata={'age': 33, 'hobby': 'Bicycle'})]
```

मेटाडेटा फ़िल्टरिंग निम्नलिखित ऑपरेटरों का भी समर्थन करती है:

* `$eq: समान`
* `$ne: असमान`
* `$lt: कम से कम`
* `$lte: कम से कम या बराबर`
* `$gt: अधिक से अधिक`
* `$gte: अधिक से अधिक या बराबर`
* `$in: मूल्यों की सूची में`
* `$nin: मूल्यों की सूची में नहीं`
* `$between: दो मूल्यों के बीच`
* `$like: पाठ में मूल्य शामिल है`
* `$ilike: लोअरकेस पाठ में मूल्य शामिल है`

```python
existing_graph.similarity_search(
    "Slovenia",
    filter={"hobby": {"$eq": "Bicycle"}, "age": {"$gt": 15}},
)
```

```output
[Document(page_content='\nname: Tomaz\nlocation: Slovenia', metadata={'age': 33, 'hobby': 'Bicycle'})]
```

आप फ़िल्टरों के बीच `OR` ऑपरेटर का भी उपयोग कर सकते हैं।

```python
existing_graph.similarity_search(
    "Slovenia",
    filter={"$or": [{"hobby": {"$eq": "Bicycle"}}, {"age": {"$gt": 15}}]},
)
```

```output
[Document(page_content='\nname: Tomaz\nlocation: Slovenia', metadata={'age': 33, 'hobby': 'Bicycle'})]
```

### दस्तावेज़ जोड़ें

हम मौजूदा वेक्टरस्टोर में दस्तावेज़ जोड़ सकते हैं।

```python
store.add_documents([Document(page_content="foo")])
```

```output
['acbd18db4cc2f85cedef654fccc4a4d8']
```

```python
docs_with_score = store.similarity_search_with_score("foo")
```

```python
docs_with_score[0]
```

```output
(Document(page_content='foo'), 0.9999997615814209)
```

## पुनर्प्राप्ति क्वेरी के साथ प्रतिक्रिया अनुकूलित करें

आप कस्टम Cypher स्निपेट का उपयोग करके प्रतिक्रियाओं को भी अनुकूलित कर सकते हैं जो ग्राफ़ से अन्य जानकारी प्राप्त कर सकता है।
नीचे, अंतिम Cypher बयान इस तरह से बनाया जाता है:

```python
read_query = (
  "CALL db.index.vector.queryNodes($index, $k, $embedding) "
  "YIELD node, score "
) + retrieval_query
```

पुनर्प्राप्ति क्वेरी को निम्नलिखित तीन स्तंभ लौटाने चाहिए:

* `text`: Union[str, Dict] = एक दस्तावेज़ के `page_content` को भरने के लिए उपयोग किया जाने वाला मूल्य
* `score`: Float = समानता स्कोर
* `metadata`: Dict = एक दस्तावेज़ की अतिरिक्त मेटाडेटा

[ब्लॉग पोस्ट](https://medium.com/neo4j/implementing-rag-how-to-write-a-graph-retrieval-query-in-langchain-74abf13044f2) में अधिक जानकारी प्राप्त करें।

```python
retrieval_query = """
RETURN "Name:" + node.name AS text, score, {foo:"bar"} AS metadata
"""
retrieval_example = Neo4jVector.from_existing_index(
    OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    index_name="person_index",
    retrieval_query=retrieval_query,
)
retrieval_example.similarity_search("Foo", k=1)
```

```output
[Document(page_content='Name:Tomaz', metadata={'foo': 'bar'})]
```

यहाँ `embedding` को छोड़कर सभी नोड गुणों को एक डिक्शनरी के रूप में `text` स्तंभ में पारित करने का एक उदाहरण है,

```python
retrieval_query = """
RETURN node {.name, .age, .hobby} AS text, score, {foo:"bar"} AS metadata
"""
retrieval_example = Neo4jVector.from_existing_index(
    OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    index_name="person_index",
    retrieval_query=retrieval_query,
)
retrieval_example.similarity_search("Foo", k=1)
```

```output
[Document(page_content='name: Tomaz\nage: 33\nhobby: Bicycle\n', metadata={'foo': 'bar'})]
```

आप पुनर्प्राप्ति क्वेरी में Cypher पैरामीटर भी पारित कर सकते हैं।
पैरामीटर अतिरिक्त फ़िल्टरिंग, प्रवास आदि के लिए उपयोग किए जा सकते हैं।

```python
retrieval_query = """
RETURN node {.*, embedding:Null, extra: $extra} AS text, score, {foo:"bar"} AS metadata
"""
retrieval_example = Neo4jVector.from_existing_index(
    OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    index_name="person_index",
    retrieval_query=retrieval_query,
)
retrieval_example.similarity_search("Foo", k=1, params={"extra": "ParamInfo"})
```

```output
[Document(page_content='location: Slovenia\nextra: ParamInfo\nname: Tomaz\nage: 33\nhobby: Bicycle\nembedding: None\n', metadata={'foo': 'bar'})]
```

## हाइब्रिड खोज (वेक्टर + कीवर्ड)

Neo4j वेक्टर और कीवर्ड इंडेक्स दोनों को एकीकृत करता है, जो आपको हाइब्रिड खोज दृष्टिकोण का उपयोग करने की अनुमति देता है।

```python
# The Neo4jVector Module will connect to Neo4j and create a vector and keyword indices if needed.
hybrid_db = Neo4jVector.from_documents(
    docs,
    OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    search_type="hybrid",
)
```

मौजूदा इंडेक्स से हाइब्रिड खोज लोड करने के लिए, आपको वेक्टर और कीवर्ड दोनों इंडेक्स प्रदान करने होंगे।

```python
index_name = "vector"  # default index name
keyword_index_name = "keyword"  # default keyword index name

store = Neo4jVector.from_existing_index(
    OpenAIEmbeddings(),
    url=url,
    username=username,
    password=password,
    index_name=index_name,
    keyword_index_name=keyword_index_name,
    search_type="hybrid",
)
```

## पुनर्प्राप्तकर्ता विकल्प

यह खंड `Neo4jVector` को एक पुनर्प्राप्तकर्ता के रूप में कैसे उपयोग करें, दिखाता है।

```python
retriever = store.as_retriever()
retriever.invoke(query)[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt'})
```

## स्रोतों के साथ प्रश्न उत्तर

यह खंड स्रोतों के साथ प्रश्न-उत्तर करने के बारे में बताता है। यह `RetrievalQAWithSourcesChain` का उपयोग करके करता है, जो किसी इंडेक्स से दस्तावेज़ों की खोज करता है।

```python
from langchain.chains import RetrievalQAWithSourcesChain
from langchain_openai import ChatOpenAI
```

```python
chain = RetrievalQAWithSourcesChain.from_chain_type(
    ChatOpenAI(temperature=0), chain_type="stuff", retriever=retriever
)
```

```python
chain.invoke(
    {"question": "What did the president say about Justice Breyer"},
    return_only_outputs=True,
)
```

```output
{'answer': 'The president honored Justice Stephen Breyer for his service to the country and mentioned his retirement from the United States Supreme Court.\n',
 'sources': '../../modules/state_of_the_union.txt'}
```
