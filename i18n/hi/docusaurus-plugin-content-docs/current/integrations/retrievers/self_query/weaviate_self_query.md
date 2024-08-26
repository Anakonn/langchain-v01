---
translated: true
---

# Weaviate

>[Weaviate](https://weaviate.io/) एक ओपन-सोर्स वेक्टर डाटाबेस है। यह आपको डेटा ऑब्जेक्ट्स और वेक्टर एम्बेडिंग्स को स्टोर करने की सुविधा देता है
>अपने पसंदीदा एमएल मॉडलों से, और अरबों डेटा ऑब्जेक्ट्स में सहजता से स्केल करता है।

इस नोटबुक में, हम `SelfQueryRetriever` को `Weaviate` वेक्टर स्टोर के चारों ओर डेमो करेंगे।

## Weaviate वेक्टर स्टोर बनाना

पहले हम एक Weaviate वेक्टर स्टोर बनाना चाहेंगे और इसमें कुछ डेटा डालेंगे। हमने मूवी की संक्षेपणों वाले दस्तावेजों का एक छोटा डेमो सेट बनाया है।

**नोट:** स्व-प्रश्न पुनःप्राप्तकर्ता के लिए जरूरी है कि आपके पास `lark` स्थापित हो (`pip install lark`)। हमें `weaviate-client` पैकेज की भी आवश्यकता है।

```python
%pip install --upgrade --quiet  lark weaviate-client
```

```python
from langchain_community.vectorstores import Weaviate
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
vectorstore = Weaviate.from_documents(
    docs, embeddings, weaviate_url="http://127.0.0.1:8080"
)
```

## हमारा स्व-प्रश्न पुनःप्राप्तकर्ता बनाना

अब हम अपने पुनःप्राप्तकर्ता को इंस्टेंटिएट कर सकते हैं। इसके लिए हमें अपने दस्तावेज़ों द्वारा समर्थित मेटाडाटा फ़ील्ड्स और दस्तावेज़ सामग्री का एक संक्षिप्त विवरण upfront प्रदान करना होगा।

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

## इसे आज़माना

और अब हम वास्तव में अपने पुनःप्राप्तकर्ता का उपयोग करने की कोशिश कर सकते हैं!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
query='dinosaur' filter=None limit=None
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'genre': 'science fiction', 'rating': 7.7, 'year': 1993}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'genre': 'animated', 'rating': None, 'year': 1995}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'genre': 'science fiction', 'rating': 9.9, 'year': 1979}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'genre': None, 'rating': 8.6, 'year': 2006})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```output
query='women' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='director', value='Greta Gerwig') limit=None
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'genre': None, 'rating': 8.3, 'year': 2019})]
```

## Filter k

हम स्व-प्रश्न पुनःप्राप्तकर्ता का उपयोग `k` निर्दिष्ट करने के लिए भी कर सकते हैं: लाने के लिए दस्तावेजों की संख्या।

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
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'genre': 'science fiction', 'rating': 7.7, 'year': 1993}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'genre': 'animated', 'rating': None, 'year': 1995})]
```
