---
translated: true
---

# डैशवेक्टर

> [डैशवेक्टर](https://help.aliyun.com/document_detail/2510225.html) एक पूरी तरह से प्रबंधित वेक्टर डीबी सेवा है जो उच्च आयाम घने और स्पार्स वेक्टरों, रियल-टाइम इंसर्शन और फिल्टर किए गए खोज का समर्थन करता है। यह स्वचालित रूप से पैमाने पर बढ़ने के लिए बनाया गया है और विभिन्न अनुप्रयोग आवश्यकताओं के अनुकूल हो सकता है।
> वेक्टर पुनर्प्राप्ति सेवा `डैशवेक्टर` `DAMO एकेडमी` द्वारा स्वतंत्र रूप से विकसित दक्ष वेक्टर इंजन के `प्रॉक्सिमा` कोर पर आधारित है,
> और क्षैतिज विस्तार क्षमताओं के साथ एक क्लाउड-नेटिव, पूरी तरह से प्रबंधित वेक्टर पुनर्प्राप्ति सेवा प्रदान करता है।
> `डैशवेक्टर` अपने शक्तिशाली वेक्टर प्रबंधन, वेक्टर क्वेरी और अन्य विविध क्षमताओं को एक सरल और
> उपयोग में आसान एसडीके/एपीआई इंटरफ़ेस के माध्यम से प्रकट करता है, जिसे उच्च-स्तरीय एआई अनुप्रयोगों द्वारा
> जल्दी से एकीकृत किया जा सकता है, जिससे बड़े मॉडल पारिस्थितिकी तंत्र, बहु-मोडल एआई खोज, आणविक संरचना
> विविध अनुप्रयोग परिदृश्यों सहित, प्रभावी वेक्टर पुनर्प्राप्ति क्षमताएं प्रदान की जा सकती हैं।

इस नोटबुक में, हम `डैशवेक्टर` वेक्टर स्टोर के साथ `SelfQueryRetriever` का प्रदर्शन करेंगे।

## डैशवेक्टर वेक्टरस्टोर बनाएं

पहले हम एक `डैशवेक्टर` VectorStore बनाएंगे और इसे कुछ डेटा से भरेंगे। हमने फिल्मों के सारांश वाले दस्तावेजों का एक छोटा डेमो सेट बनाया है।

डैशवेक्टर का उपयोग करने के लिए, आपके पास `dashvector` पैकेज इंस्टॉल होना चाहिए, और आपके पास एक एपीआई कुंजी और एक वातावरण होना चाहिए। यहां [इंस्टॉलेशन निर्देश](https://help.aliyun.com/document_detail/2510223.html) हैं।

नोट: सेल्फ-क्वेरी रिट्रीवर के लिए आपके पास `lark` पैकेज इंस्टॉल होना चाहिए।

```python
%pip install --upgrade --quiet  lark dashvector
```

```python
import os

import dashvector

client = dashvector.Client(api_key=os.environ["DASHVECTOR_API_KEY"])
```

```python
from langchain_community.embeddings import DashScopeEmbeddings
from langchain_community.vectorstores import DashVector
from langchain_core.documents import Document

embeddings = DashScopeEmbeddings()

# create DashVector collection
client.create("langchain-self-retriever-demo", dimension=1536)
```

```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"year": 1993, "rating": 7.7, "genre": "action"},
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
vectorstore = DashVector.from_documents(
    docs, embeddings, collection_name="langchain-self-retriever-demo"
)
```

## अपना सेल्फ-क्वेरी रिट्रीवर बनाएं

अब हम अपने रिट्रीवर को इंस्टैंशिएट कर सकते हैं। ऐसा करने के लिए, हमें अपने दस्तावेजों के समर्थित मेटाडेटा फ़ील्ड्स और दस्तावेज़ सामग्री का एक संक्षिप्त वर्णन प्रदान करना होगा।

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_community.llms import Tongyi

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
llm = Tongyi(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## इसे परखना

और अब हम वास्तव में अपने रिट्रीवर का उपयोग कर सकते हैं!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
query='dinosaurs' filter=None limit=None
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'rating': 7.699999809265137, 'genre': 'action'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'}),
 Document(page_content='Leo DiCaprio gets lost in a dream within a dream within a dream within a ...', metadata={'year': 2010, 'director': 'Christopher Nolan', 'rating': 8.199999809265137}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'director': 'Satoshi Kon', 'rating': 8.600000381469727})]
```

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```output
query=' ' filter=Comparison(comparator=<Comparator.GTE: 'gte'>, attribute='rating', value=8.5) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'director': 'Andrei Tarkovsky', 'rating': 9.899999618530273, 'genre': 'science fiction'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'director': 'Satoshi Kon', 'rating': 8.600000381469727})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```output
query='Greta Gerwig' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='director', value='Greta Gerwig') limit=None
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'director': 'Greta Gerwig', 'rating': 8.300000190734863})]
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```output
query='science fiction' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='science fiction'), Comparison(comparator=<Comparator.GT: 'gt'>, attribute='rating', value=8.5)]) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'director': 'Andrei Tarkovsky', 'rating': 9.899999618530273, 'genre': 'science fiction'})]
```

## फ़िल्टर k

हम सेल्फ क्वेरी रिट्रीवर का उपयोग करके `k` को भी निर्दिष्ट कर सकते हैं: प्राप्त करने वाले दस्तावेजों की संख्या।

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
query='dinosaurs' filter=None limit=2
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'rating': 7.699999809265137, 'genre': 'action'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```
