---
translated: true
---

# DingoDB

>[DingoDB](https://dingodb.readthedocs.io/en/latest/) एक वितरित बहु-मोड वेक्टर डेटाबेस है, जो डेटा झीलों और वेक्टर डेटाबेस की विशेषताओं को मिलाता है, और किसी भी प्रकार और आकार के डेटा (कुंजी-मूल्य, PDF, ऑडियो, वीडियो आदि) को संग्रहीत कर सकता है। इसमें तेज़ अंतर्दृष्टि और प्रतिक्रिया प्राप्त करने के लिए वास्तविक-समय कम-विलंबता प्रसंस्करण क्षमताएं हैं, और यह बहु-मोडल डेटा का तत्काल विश्लेषण और प्रक्रिया कर सकता है।

वॉकथ्रू में, हम `DingoDB` वेक्टर स्टोर के साथ `SelfQueryRetriever` का प्रदर्शन करेंगे।

## DingoDB इंडेक्स बनाना

पहले हम एक `DingoDB` वेक्टर स्टोर बनाना और इसे कुछ डेटा से सीड करना चाहेंगे। हमने फिल्मों के सारांश वाले कुछ छोटे डेमो सेट बनाए हैं।

DingoDB का उपयोग करने के लिए, आपके पास एक [चालू DingoDB इंस्टेंस](https://github.com/dingodb/dingo-deploy/blob/main/README.md) होना चाहिए।

**नोट:** सेल्फ-क्वेरी रिट्रीवर के लिए आपके पास `lark` पैकेज इंस्टॉल होना चाहिए।

```python
%pip install --upgrade --quiet  dingodb
# or install latest:
%pip install --upgrade --quiet  git+https://git@github.com/dingodb/pydingo.git
```

हम `OpenAIEmbeddings` का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
import os

OPENAI_API_KEY = ""

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

```python
from langchain.schema import Document
from langchain_community.vectorstores import Dingo
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
# create new index
from dingodb import DingoDB

index_name = "langchain_demo"

dingo_client = DingoDB(user="", password="", host=["172.30.14.221:13000"])
# First, check if our index already exists. If it doesn't, we create it
if (
    index_name not in dingo_client.get_index()
    and index_name.upper() not in dingo_client.get_index()
):
    # we create a new index, modify to your own
    dingo_client.create_index(
        index_name=index_name, dimension=1536, metric_type="cosine", auto_id=False
    )
```

```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"year": 1993, "rating": 7.7, "genre": '"action", "science fiction"'},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"year": 2010, "director": "Christopher Nolan", "rating": 8.2},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"year": 2006, "director": "Satoshi Kon", "rating": 8.6},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"year": 2019, "director": "Greta Gerwig", "rating": 8.3},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"year": 1995, "genre": "animated"},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={
            "year": 1979,
            "director": "Andrei Tarkovsky",
            "genre": '"science fiction", "thriller"',
            "rating": 9.9,
        },
    ),
]
vectorstore = Dingo.from_documents(
    docs, embeddings, index_name=index_name, client=dingo_client
)
```

```python
dingo_client.get_index()
dingo_client.delete_index("langchain_demo")
```

```output
True
```

```python
dingo_client.vector_count("langchain_demo")
```

```output
9
```

## हमारा सेल्फ-क्वेरी रिट्रीवर बनाना

अब हम अपने रिट्रीवर को इंस्टैंशिएट कर सकते हैं। इसके लिए हमें अपने दस्तावेजों के मेटाडेटा फ़ील्ड्स और दस्तावेज़ सामग्री का एक संक्षिप्त वर्णन प्रदान करना होगा।

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genre of the movie",
        type="string or list[string]",
    ),
    AttributeInfo(
        name="year",
        description="The year the movie was released",
        type="integer",
    ),
    AttributeInfo(
        name="director",
        description="The name of the movie director",
        type="string",
    ),
    AttributeInfo(
        name="rating", description="A 1-10 rating for the movie", type="float"
    ),
]
document_content_description = "Brief summary of a movie"
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## इसका परीक्षण करना

और अब हम वास्तव में अपने रिट्रीवर का उपयोग कर सकते हैं!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
query='dinosaurs' filter=None limit=None
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'id': 1183188982475, 'text': 'A bunch of scientists bring back dinosaurs and mayhem breaks loose', 'score': 0.13397777, 'year': {'value': 1993}, 'rating': {'value': 7.7}, 'genre': '"action", "science fiction"'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'id': 1183189196391, 'text': 'Toys come alive and have a blast doing so', 'score': 0.18994397, 'year': {'value': 1995}, 'genre': 'animated'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'id': 1183189220159, 'text': 'Three men walk into the Zone, three men walk out of the Zone', 'score': 0.23288351, 'year': {'value': 1979}, 'director': 'Andrei Tarkovsky', 'rating': {'value': 9.9}, 'genre': '"science fiction", "thriller"'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'id': 1183189148854, 'text': 'A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', 'score': 0.24421334, 'year': {'value': 2006}, 'director': 'Satoshi Kon', 'rating': {'value': 8.6}})]
```

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```output
query=' ' filter=Comparison(comparator=<Comparator.GT: 'gt'>, attribute='rating', value=8.5) limit=None
comparator=<Comparator.GT: 'gt'> attribute='rating' value=8.5
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'id': 1183189220159, 'text': 'Three men walk into the Zone, three men walk out of the Zone', 'score': 0.25033575, 'year': {'value': 1979}, 'director': 'Andrei Tarkovsky', 'genre': '"science fiction", "thriller"', 'rating': {'value': 9.9}}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'id': 1183189148854, 'text': 'A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', 'score': 0.26431882, 'year': {'value': 2006}, 'director': 'Satoshi Kon', 'rating': {'value': 8.6}})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```output
query='women' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='director', value='Greta Gerwig') limit=None
comparator=<Comparator.EQ: 'eq'> attribute='director' value='Greta Gerwig'
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'id': 1183189172623, 'text': 'A bunch of normal-sized women are supremely wholesome and some men pine after them', 'score': 0.19482517, 'year': {'value': 2019}, 'director': 'Greta Gerwig', 'rating': {'value': 8.3}})]
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```output
query='science fiction' filter=Comparison(comparator=<Comparator.GT: 'gt'>, attribute='rating', value=8.5) limit=None
comparator=<Comparator.GT: 'gt'> attribute='rating' value=8.5
```

```output
[Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'id': 1183189148854, 'text': 'A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', 'score': 0.19805312, 'year': {'value': 2006}, 'director': 'Satoshi Kon', 'rating': {'value': 8.6}}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'id': 1183189220159, 'text': 'Three men walk into the Zone, three men walk out of the Zone', 'score': 0.225586, 'year': {'value': 1979}, 'director': 'Andrei Tarkovsky', 'rating': {'value': 9.9}, 'genre': '"science fiction", "thriller"'})]
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```

```output
query='toys' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GT: 'gt'>, attribute='year', value=1990), Comparison(comparator=<Comparator.LT: 'lt'>, attribute='year', value=2005)]), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='animated')]) limit=None
operator=<Operator.AND: 'and'> arguments=[Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GT: 'gt'>, attribute='year', value=1990), Comparison(comparator=<Comparator.LT: 'lt'>, attribute='year', value=2005)]), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='animated')]
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'id': 1183189196391, 'text': 'Toys come alive and have a blast doing so', 'score': 0.133829, 'year': {'value': 1995}, 'genre': 'animated'})]
```

## फ़िल्टर k

हम सेल्फ क्वेरी रिट्रीवर का उपयोग `k` को निर्दिष्ट करने के लिए भी कर सकते हैं: लाने वाले दस्तावेजों की संख्या।

हम इसे कंस्ट्रक्टर में `enable_limit=True` पास करके कर सकते हैं।

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectorstore,
    document_content_description,
    metadata_field_info,
    enable_limit=True,
    verbose=True,
)
```

```python
# This example only specifies a relevant query
retriever.invoke("What are two movies about dinosaurs")
```

```output
query='dinosaurs' filter=None limit=2
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'id': 1183188982475, 'text': 'A bunch of scientists bring back dinosaurs and mayhem breaks loose', 'score': 0.13394928, 'year': {'value': 1993}, 'rating': {'value': 7.7}, 'genre': '"action", "science fiction"'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'id': 1183189196391, 'text': 'Toys come alive and have a blast doing so', 'score': 0.1899159, 'year': {'value': 1995}, 'genre': 'animated'})]
```
