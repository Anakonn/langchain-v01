---
translated: true
---

# गहरा झील

>[गहरा झील](https://www.activeloop.ai) एआई अनुप्रयोग बनाने के लिए एक बहुमुखी डेटाबेस है
>[गहरा झील](https://github.com/activeloopai/deeplake) एक एआई डेटाबेस है।
>वेक्टर, छवियां, पाठ, वीडियो आदि को संग्रहीत करें। एलएलएम/लैंगचेन के साथ उपयोग करें। किसी भी एआई डेटा को संग्रहीत करें, क्वेरी करें, संस्करण करें और दृश्यमान बनाएं। पायरोटॉर्च/टेंसरफ्लो में रियल टाइम में डेटा स्ट्रीम करें।

नोटबुक में, हम `SelfQueryRetriever` का उपयोग करके `Deep Lake` वेक्टर स्टोर के साथ एक डेमो करेंगे।

## एक गहरा झील वेक्टर स्टोर बनाना

पहले हम एक गहरा झील वेक्टर स्टोर बनाना और इसे कुछ डेटा से भरना चाहेंगे। हमने फिल्मों के सारांश वाले कुछ छोटे डेमो सेट बनाए हैं।

**नोट:** सेल्फ-क्वेरी रिट्रीवर के लिए आपके पास `lark` इंस्टॉल होना चाहिए (`pip install lark`)। हमें `deeplake` पैकेज भी चाहिए।

```python
%pip install --upgrade --quiet  lark
```

```python
# in case if some queries fail consider installing libdeeplake manually
%pip install --upgrade --quiet  libdeeplake
```

हम `OpenAIEmbeddings` का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
os.environ["ACTIVELOOP_TOKEN"] = getpass.getpass("Activeloop token:")
```

```python
from langchain_community.vectorstores import DeepLake
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"year": 1993, "rating": 7.7, "genre": "science fiction"},
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
            "genre": "science fiction",
            "rating": 9.9,
        },
    ),
]
username_or_org = "<USERNAME_OR_ORG>"
vectorstore = DeepLake.from_documents(
    docs,
    embeddings,
    dataset_path=f"hub://{username_or_org}/self_queery",
    overwrite=True,
)
```

```output
Your Deep Lake dataset has been successfully created!

/

Dataset(path='hub://adilkhan/self_queery', tensors=['embedding', 'id', 'metadata', 'text'])

  tensor      htype      shape     dtype  compression
  -------    -------    -------   -------  -------
 embedding  embedding  (6, 1536)  float32   None
    id        text      (6, 1)      str     None
 metadata     json      (6, 1)      str     None
   text       text      (6, 1)      str     None


```

## हमारा सेल्फ-क्वेरी रिट्रीवर बनाना

अब हम अपने रिट्रीवर को इंस्टैंशिएट कर सकते हैं। ऐसा करने के लिए, हमें पहले से ही अपने दस्तावेजों के मेटाडेटा फ़ील्ड्स और दस्तावेज़ सामग्री का एक संक्षिप्त वर्णन प्रदान करना होगा।

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
/home/ubuntu/langchain_activeloop/langchain/libs/langchain/langchain/chains/llm.py:279: UserWarning: The predict_and_parse method is deprecated, instead pass an output parser directly to LLMChain.
  warnings.warn(

query='dinosaur' filter=None limit=None
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'rating': 7.7, 'genre': 'science fiction'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'rating': 9.9, 'director': 'Andrei Tarkovsky', 'genre': 'science fiction'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'director': 'Satoshi Kon', 'rating': 8.6})]
```

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")

# in case if this example errored out, consider installing libdeeplake manually: `pip install libdeeplake`, and then restart notebook.
```

```output
query=' ' filter=Comparison(comparator=<Comparator.GT: 'gt'>, attribute='rating', value=8.5) limit=None
```

```output
[Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'director': 'Satoshi Kon', 'rating': 8.6}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'rating': 9.9, 'director': 'Andrei Tarkovsky', 'genre': 'science fiction'})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```output
query='women' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='director', value='Greta Gerwig') limit=None
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'director': 'Greta Gerwig', 'rating': 8.3})]
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```output
query=' ' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GTE: 'gte'>, attribute='rating', value=8.5), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='science fiction')]) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'rating': 9.9, 'director': 'Andrei Tarkovsky', 'genre': 'science fiction'})]
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```

```output
query='toys' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GT: 'gt'>, attribute='year', value=1990), Comparison(comparator=<Comparator.LT: 'lt'>, attribute='year', value=2005), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='animated')]) limit=None
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
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
retriever.invoke("what are two movies about dinosaurs")
```

```output
query='dinosaur' filter=None limit=2
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'rating': 7.7, 'genre': 'science fiction'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```
