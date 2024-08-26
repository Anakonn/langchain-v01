---
translated: true
---

# Supabase (Postgres)

>[Supabase](https://supabase.com/docs) एक ओपन-सोर्स `Firebase` विकल्प है।
>`Supabase` `PostgreSQL` पर बनाया गया है, जो मज़बूत `SQL`
>क्वेरी क्षमताएं प्रदान करता है और पहले से मौजूद उपकरणों और फ्रेमवर्क के साथ एक सरल इंटरफ़ेस सक्षम करता है।

>[PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL) को `Postgres` के रूप में भी जाना जाता है,
>एक मुफ्त और ओपन-सोर्स रिलेशनल डेटाबेस मैनेजमेंट सिस्टम (RDBMS) है
>जो विस्तारणीयता और `SQL` अनुपालन पर जोर देता है।
>
>[Supabase](https://supabase.com/docs/guides/ai) Postgres और pgvector का उपयोग करके AI अनुप्रयोग विकसित करने के लिए एक ओपन-सोर्स टूलकिट प्रदान करता है।
>Supabase क्लाइंट लाइब्रेरी का उपयोग करके अपने वेक्टर एम्बेडिंग को स्केल पर संग्रहीत, इंडेक्स और क्वेरी करें।

नोटबुक में, हम `Supabase` वेक्टर स्टोर के इर्द-गिर्द `SelfQueryRetriever` का प्रदर्शन करेंगे।

विशेष रूप से, हम:
1. एक Supabase डेटाबेस बनाएंगे
2. `pgvector` एक्सटेंशन को सक्षम करेंगे
3. एक `documents` टेबल और `match_documents` फ़ंक्शन बनाएंगे जो `SupabaseVectorStore` द्वारा उपयोग किया जाएगा
4. वेक्टर स्टोर (डेटाबेस टेबल) में नमूना दस्तावेज़ लोड करेंगे
5. एक सेल्फ-क्वेरी रिट्रीवर बनाएंगे और परीक्षण करेंगे

## Supabase डेटाबेस सेटअप करना

1. https://database.new पर जाकर अपना Supabase डेटाबेस प्रोविजन करें।
2. स्टूडियो में, [SQL एडिटर](https://supabase.com/dashboard/project/_/sql/new) पर जाएं और अपने डेटाबेस को एक वेक्टर स्टोर के रूप में सेट करने के लिए निम्नलिखित स्क्रिप्ट चलाएं:
    ```sql
    -- एम्बेडिंग वेक्टर के साथ काम करने के लिए pgvector एक्सटेंशन को सक्षम करें
    create extension if not exists vector;

    -- आपके दस्तावेज़ों को संग्रहीत करने के लिए एक टेबल बनाएं
    create table
      documents (
        id uuid primary key,
        content text, -- Document.pageContent के अनुरूप
        metadata jsonb, -- Document.metadata के अनुरूप
        embedding vector (1536) -- OpenAI एम्बेडिंग के लिए 1536 काम करता है, आवश्यकतानुसार बदलें
      );

    -- दस्तावेज़ों को खोजने के लिए एक फ़ंक्शन बनाएं
    create function match_documents (
      query_embedding vector (1536),
      filter jsonb default '{}'
    ) returns table (
      id uuid,
      content text,
      metadata jsonb,
      similarity float
    ) language plpgsql as $$
    #variable_conflict use_column
    begin
      return query
      select
        id,
        content,
        metadata,
        1 - (documents.embedding <=> query_embedding) as similarity
      from documents
      where metadata @> filter
      order by documents.embedding <=> query_embedding;
    end;
    $$;
    ```

## एक Supabase वेक्टर स्टोर बनाना

अब हम एक Supabase वेक्टर स्टोर बनाना और इसे कुछ डेटा से भरना चाहेंगे। हमने फिल्मों के सारांश वाले कुछ छोटे डेमो दस्तावेज़ बनाए हैं।

`openai` समर्थन के साथ `langchain` का नवीनतम संस्करण स्थापित करना सुनिश्चित करें:

```python
%pip install --upgrade --quiet  langchain langchain-openai tiktoken
```

सेल्फ-क्वेरी रिट्रीवर के लिए आपको `lark` स्थापित करना होगा:

```python
%pip install --upgrade --quiet  lark
```

हमें `supabase` पैकेज भी चाहिए:

```python
%pip install --upgrade --quiet  supabase
```

हम `SupabaseVectorStore` और `OpenAIEmbeddings` का उपयोग कर रहे हैं, इसलिए हमें उनके API कुंजियों को लोड करना होगा।

- अपने Supabase प्रोजेक्ट के [API सेटिंग्स](https://supabase.com/dashboard/project/_/settings/api) में जाकर अपना `SUPABASE_URL` और `SUPABASE_SERVICE_KEY` ढूंढें।
  - `SUPABASE_URL` प्रोजेक्ट URL के समान है
  - `SUPABASE_SERVICE_KEY` `service_role` API कुंजी के समान है

- अपने OpenAI खाते में [API कुंजियों](https://platform.openai.com/account/api-keys) पर जाकर एक नया गोपनीय कुंजी बनाएं।

```python
import getpass
import os

os.environ["SUPABASE_URL"] = getpass.getpass("Supabase URL:")
os.environ["SUPABASE_SERVICE_KEY"] = getpass.getpass("Supabase Service Key:")
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

_वैकल्पिक:_ यदि आप अपने Supabase और OpenAI API कुंजियों को एक `.env` फ़ाइल में संग्रहीत कर रहे हैं, तो आप उन्हें [`dotenv`](https://github.com/theskumar/python-dotenv) के साथ लोड कर सकते हैं।

```python
%pip install --upgrade --quiet  python-dotenv
```

```python
from dotenv import load_dotenv

load_dotenv()
```

पहले हम एक Supabase क्लाइंट बनाएंगे और एक OpenAI एम्बेडिंग वर्ग को इंस्टैंशिएट करेंगे।

```python
import os

from langchain_community.vectorstores import SupabaseVectorStore
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from supabase.client import Client, create_client

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

embeddings = OpenAIEmbeddings()
```

अब अपने दस्तावेज़ बनाएं।

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

vectorstore = SupabaseVectorStore.from_documents(
    docs,
    embeddings,
    client=supabase,
    table_name="documents",
    query_name="match_documents",
)
```

## अपने सेल्फ-क्वेरी रिट्रीवर बनाना

अब हम अपने रिट्रीवर को इंस्टैंशिएट कर सकते हैं। ऐसा करने के लिए, हमें अपने दस्तावेज़ों द्वारा समर्थित मेटाडेटा फ़ील्ड्स के बारे में कुछ जानकारी और दस्तावेज़ की सामग्री का एक संक्षिप्त वर्णन प्रदान करना होगा।

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
query='dinosaur' filter=None limit=None
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'})]
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
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women?")
```

```output
query='women' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='director', value='Greta Gerwig') limit=None
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'rating': 8.3, 'director': 'Greta Gerwig'})]
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```output
query=' ' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GTE: 'gte'>, attribute='rating', value=8.5), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='science fiction')]) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'})]
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before (or on) 2005 that's all about toys, and preferably is animated"
)
```

```output
query='toys' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GT: 'gt'>, attribute='year', value=1990), Comparison(comparator=<Comparator.LTE: 'lte'>, attribute='year', value=2005), Comparison(comparator=<Comparator.LIKE: 'like'>, attribute='genre', value='animated')]) limit=None
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```

## फ़िल्टर k

हम सेल्फ क्वेरी रिट्रीवर का उपयोग `k` को निर्दिष्ट करने के लिए भी कर सकते हैं: लाने वाले दस्तावेज़ों की संख्या।

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
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```
