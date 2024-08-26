---
translated: true
---

# टाइमस्केल वेक्टर (पोस्टग्रेस)

>[टाइमस्केल वेक्टर](https://www.timescale.com/ai) `PostgreSQL++` है AI अनुप्रयोगों के लिए। यह आपको `PostgreSQL` में अरबों वेक्टर एम्बेडिंग को कुशलतापूर्वक संग्रहित और क्वेरी करने में सक्षम बनाता है।

>[PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL), जिसे `Postgres` भी कहा जाता है, एक मुक्त और ओपन-सोर्स रिलेशनल डेटाबेस मैनेजमेंट सिस्टम (RDBMS) है जो एक्सटेंसिबिलिटी और `SQL` अनुपालन पर जोर देता है।

यह नोटबुक दिखाता है कि `TimescaleVector` वेक्टर डेटाबेस का उपयोग कर स्वयं क्वेरी करने कैसे किया जाए। इस नोटबुक में हम `SelfQueryRetriever` का प्रदर्शन करेंगे जो TimescaleVector वेक्टर स्टोर के साथ लपेटा गया है।

## टाइमस्केल वेक्टर क्या है?

**[टाइमस्केल वेक्टर](https://www.timescale.com/ai) AI अनुप्रयोगों के लिए PostgreSQL++ है।**

टाइमस्केल वेक्टर आपको `PostgreSQL` में लाखों वेक्टर एम्बेडिंग को कुशलतापूर्वक संग्रहित और क्वेरी करने में सक्षम बनाता है।
- `pgvector` को DiskANN प्रेरित इंडेक्सिंग एल्गोरिदम के साथ तेज और अधिक सटीक समानता खोज के साथ बढ़ाता है।
- वेक्टर खोज के लिए स्वचालित समय-आधारित पार्टिशनिंग और इंडेक्सिंग के माध्यम से तेज समय-आधारित वेक्टर खोज सक्षम करता है।
- वेक्टर एम्बेडिंग और रिलेशनल डेटा क्वेरी करने के लिए परिचित SQL इंटरफ़ेस प्रदान करता है।

टाइमस्केल वेक्टर POC से उत्पादन तक आपके साथ पैमाने में बढ़ने वाला क्लाउड PostgreSQL है:
- एकल डेटाबेस में रिलेशनल मेटाडेटा, वेक्टर एम्बेडिंग और समय-श्रृंखला डेटा संग्रहित करने से ऑपरेशन को सरल बनाता है।
- स्ट्रीमिंग बैकअप और रिप्लिकेशन, उच्च उपलब्धता और पंक्ति-स्तर की सुरक्षा जैसी उद्यम-स्तरीय सुविधाओं के साथ मजबूत PostgreSQL आधार से लाभ उठाता है।
- उद्यम-स्तरीय सुरक्षा और अनुपालन के साथ चिंता मुक्त अनुभव प्रदान करता है।

## टाइमस्केल वेक्टर कैसे एक्सेस करें

टाइमस्केल वेक्टर [Timescale](https://www.timescale.com/ai), क्लाउड PostgreSQL प्लेटफ़ॉर्म पर उपलब्ध है। (इस समय कोई स्वयं होस्ट किया गया संस्करण नहीं है।)

LangChain उपयोगकर्ता Timescale Vector के लिए 90 दिन का मुफ्त ट्रायल पाते हैं।
- शुरू करने के लिए, [साइन अप](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) करें Timescale, एक नया डेटाबेस बनाएं और इस नोटबुक का पालन करें!
- अधिक विवरण और प्रदर्शन बेंचमार्क के लिए [Timescale Vector explainer blog](https://www.timescale.com/blog/how-we-made-postgresql-the-best-vector-database/?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) देखें।
- python में Timescale Vector का उपयोग करने के लिए अधिक विवरण के लिए [स्थापना निर्देश](https://github.com/timescale/python-vector) देखें।

## TimescaleVector वेक्टर स्टोर बनाना

पहले हम एक Timescale Vector वेक्टर स्टोर बनाना और इसे कुछ डेटा से भरना चाहेंगे। हमने फिल्मों के सारांश वाले छोटे डेमो सेट बनाए हैं।

नोट: स्वयं क्वेरी रिट्रीवर के लिए आपको `lark` स्थापित करना होगा (`pip install lark`)। हमें `timescale-vector` पैकेज भी चाहिए।

```python
%pip install --upgrade --quiet  lark
```

```python
%pip install --upgrade --quiet  timescale-vector
```

इस उदाहरण में, हम `OpenAIEmbeddings` का उपयोग करेंगे, तो चलो अपना OpenAI API कुंजी लोड करते हैं।

```python
# Get openAI api key by reading local .env file
# The .env file should contain a line starting with `OPENAI_API_KEY=sk-`
import os

from dotenv import find_dotenv, load_dotenv

_ = load_dotenv(find_dotenv())

OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
# Alternatively, use getpass to enter the key in a prompt
# import os
# import getpass
# os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

अपने PostgreSQL डेटाबेस से कनेक्ट करने के लिए, आपको अपने सेवा URI की आवश्यकता होगी, जिसे आप नए डेटाबेस बनाने के बाद चीटशीट या `.env` फ़ाइल में पा सकते हैं।

यदि आप अभी तक नहीं किया है, तो [Timescale के लिए साइन अप करें](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral), और एक नया डेटाबेस बनाएं।

URI इस तरह दिखेगा: `postgres://tsdbadmin:<password>@<id>.tsdb.cloud.timescale.com:<port>/tsdb?sslmode=require`

```python
# Get the service url by reading local .env file
# The .env file should contain a line starting with `TIMESCALE_SERVICE_URL=postgresql://`
_ = load_dotenv(find_dotenv())
TIMESCALE_SERVICE_URL = os.environ["TIMESCALE_SERVICE_URL"]

# Alternatively, use getpass to enter the key in a prompt
# import os
# import getpass
# TIMESCALE_SERVICE_URL = getpass.getpass("Timescale Service URL:")
```

```python
from langchain_community.vectorstores.timescalevector import TimescaleVector
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

यह वह नमूना दस्तावेज हैं जिनका हम इस डेमो के लिए उपयोग करेंगे। डेटा फिल्मों के बारे में है, और इसमें विषय-वस्तु और मेटाडेटा फ़ील्ड दोनों हैं जो किसी विशिष्ट फिल्म के बारे में जानकारी देते हैं।

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
```

अंत में, हम अपना Timescale Vector वेक्टर स्टोर बनाएंगे। ध्यान दें कि संग्रह का नाम वह PostgreSQL तालिका का नाम होगा जिसमें दस्तावेज संग्रहित किए जाते हैं।

```python
COLLECTION_NAME = "langchain_self_query_demo"
vectorstore = TimescaleVector.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=COLLECTION_NAME,
    service_url=TIMESCALE_SERVICE_URL,
)
```

## हमारा स्वयं क्वेरी करने वाला रिट्रीवर बनाना

अब हम अपने रिट्रीवर को इंस्टांस कर सकते हैं। ऐसा करने के लिए हमें अपने दस्तावेजों के समर्थित मेटाडेटा फ़ील्ड के बारे में कुछ जानकारी और दस्तावेज़ की सामग्री का एक संक्षिप्त वर्णन प्रदान करना होगा।

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

# Give LLM info about the metadata fields
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

# Instantiate the self-query retriever from an LLM
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## टाइमस्केल वेक्टर के साथ स्वयं क्वेरी करने वाली पुनर्प्राप्ति

और अब हम वास्तव में अपने रिट्रीवर का उपयोग कर सकते हैं!

नीचे दिए गए क्वेरी चलाएं और ध्यान दें कि आप कैसे एक क्वेरी, फ़िल्टर, संयुक्त फ़िल्टर (AND, OR के साथ फ़िल्टर) को प्राकृतिक भाषा में निर्दिष्ट कर सकते हैं और स्वयं क्वेरी रिट्रीवर उस क्वेरी को SQL में अनुवाद करेगा और Timescale Vector (Postgres) वेक्टर स्टोर पर खोज करेगा।

यह स्वयं क्वेरी रिट्रीवर की शक्ति को दर्शाता है। आप इसका उपयोग अपने वेक्टर स्टोर पर जटिल खोज करने के लिए कर सकते हैं बिना आपको या आपके उपयोगकर्ताओं को सीधे SQL लिखने की आवश्यकता हो!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/libs/langchain/langchain/chains/llm.py:275: UserWarning: The predict_and_parse method is deprecated, instead pass an output parser directly to LLMChain.
  warnings.warn(

query='dinosaur' filter=None limit=None
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```output
query=' ' filter=Comparison(comparator=<Comparator.GT: 'gt'>, attribute='rating', value=8.5) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```output
query='women' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='director', value='Greta Gerwig') limit=None
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'rating': 8.3, 'director': 'Greta Gerwig'}),
 Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'rating': 8.3, 'director': 'Greta Gerwig'})]
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```output
query=' ' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GTE: 'gte'>, attribute='rating', value=8.5), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='science fiction')]) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'})]
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

### फ़िल्टर k

हम स्वयं क्वेरी रिट्रीवर का उपयोग `k` निर्दिष्ट करने के लिए भी कर सकते हैं: पुनर्प्राप्त करने वाले दस्तावेजों की संख्या।

हम इसे `enable_limit=True` को निर्माता को पारित करके कर सकते हैं।

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
# This example specifies a query with a LIMIT value
retriever.invoke("what are two movies about dinosaurs")
```

```output
query='dinosaur' filter=None limit=2
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7})]
```
