---
translated: true
---

# Astra DB (Cassandra)

>[DataStax Astra DB](https://docs.datastax.com/en/astra/home/astra.html) एक सर्वरलेस वेक्टर-क्षमता वाला डेटाबेस है जो `Cassandra` पर निर्मित है और एक आसान-इस्तेमाल JSON API के माध्यम से सुविधाजनक रूप से उपलब्ध कराया जाता है।

वॉकथ्रू में, हम `SelfQueryRetriever` का प्रदर्शन करेंगे एक `Astra DB` वेक्टर स्टोर के साथ।

## Astra DB वेक्टर स्टोर बनाना

पहले हम एक Astra DB VectorStore बनाना चाहेंगे और इसे कुछ डेटा से भरना चाहेंगे। हमने फिल्मों के सारांश वाले कुछ छोटे डेमो दस्तावेज़ बनाए हैं।

नोट: सेल्फ-क्वेरी रिट्रीवर के लिए आपको `lark` इंस्टॉल किया होना चाहिए (`pip install lark`)। हमें `astrapy` पैकेज भी चाहिए।

```python
%pip install --upgrade --quiet lark astrapy langchain-openai
```

हम `OpenAIEmbeddings` का उपयोग करना चाहते हैं, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
import os
from getpass import getpass

from langchain_openai.embeddings import OpenAIEmbeddings

os.environ["OPENAI_API_KEY"] = getpass("OpenAI API Key:")

embeddings = OpenAIEmbeddings()
```

Astra DB VectorStore बनाएं:

- API एंडपॉइंट `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com` जैसा दिखता है
- टोकन `AstraCS:6gBhNmsk135....` जैसा दिखता है

```python
ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```

```python
from langchain.vectorstores import AstraDB
from langchain_core.documents import Document

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

vectorstore = AstraDB.from_documents(
    docs,
    embeddings,
    collection_name="astra_self_query_demo",
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
)
```

## हमारा सेल्फ-क्वेरी रिट्रीवर बनाना

अब हम अपना रिट्रीवर इंस्टैंस कर सकते हैं। ऐसा करने के लिए, हमें पहले से ही अपने दस्तावेज़ों के मेटाडेटा फ़ील्ड्स और दस्तावेज़ सामग्री का एक संक्षिप्त वर्णन प्रदान करना होगा।

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.llms import OpenAI
from langchain.retrievers.self_query.base import SelfQueryRetriever

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
retriever.invoke("What are some movies about dinosaurs?")
```

```python
# This example specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```python
# This example only specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5), science fiction movie ?")
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie about toys after 1990 but before 2005, and is animated"
)
```

## फ़िल्टर k

हम सेल्फ क्वेरी रिट्रीवर का उपयोग `k` को निर्दिष्ट करने के लिए भी कर सकते हैं: प्राप्त करने वाले दस्तावेज़ों की संख्या।

हम इसे `enable_limit=True` को निर्माता में पास करके कर सकते हैं।

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectorstore,
    document_content_description,
    metadata_field_info,
    verbose=True,
    enable_limit=True,
)
```

```python
# This example only specifies a relevant query
retriever.invoke("What are two movies about dinosaurs?")
```

## सफाई

यदि आप अपने Astra DB इंस्टैंस से संग्रह को पूरी तरह से हटाना चाहते हैं, तो यह चलाएं।

_(आप इसमें संग्रहीत डेटा को खो देंगे।)_

```python
vectorstore.delete_collection()
```
