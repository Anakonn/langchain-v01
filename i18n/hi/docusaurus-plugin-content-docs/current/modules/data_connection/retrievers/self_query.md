---
translated: true
---

# स्वयं-प्रश्न पूछना

:::info

[एकीकरण](/docs/integrations/retrievers/self_query) के लिए दस्तावेज़ में स्वयं-प्रश्न पूछने वाले वेक्टर स्टोर के बारे में जानकारी प्राप्त करें।

:::

स्वयं-प्रश्न पूछने वाला रिट्रीवर वह है जो, जैसा कि नाम से पता चलता है, खुद को प्रश्न पूछने की क्षमता रखता है। विशेष रूप से, किसी भी प्राकृतिक भाषा के प्रश्न को देते हुए, रिट्रीवर एक प्रश्न-निर्माण LLM श्रृंखला का उपयोग करता है ताकि एक संरचित प्रश्न लिख सके और फिर उस संरचित प्रश्न को अपने मूल VectorStore पर लागू कर सके। यह रिट्रीवर को न केवल उपयोगकर्ता इनपुट प्रश्न का उपयोग संग्रहीत दस्तावेजों की सामंजस्य समानता तुलना के लिए करने की अनुमति देता है, बल्कि संग्रहीत दस्तावेजों के मेटाडेटा पर फ़िल्टर भी निकालने और उन फ़िल्टरों को निष्पादित करने की भी अनुमति देता है।

![](../../../../../../../static/img/self_querying.jpg)

## शुरू करें

प्रदर्शन के उद्देश्यों के लिए हम एक `Chroma` वेक्टर स्टोर का उपयोग करेंगे। हमने फिल्मों के सारांश वाले छोटे डेमो सेट दस्तावेजों का निर्माण किया है।

**नोट:** स्वयं-प्रश्न पूछने वाले रिट्रीवर के लिए आपको `lark` पैकेज स्थापित करना होगा।

```python
%pip install --upgrade --quiet  lark langchain-chroma
```

```python
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

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
            "genre": "thriller",
            "rating": 9.9,
        },
    ),
]
vectorstore = Chroma.from_documents(docs, OpenAIEmbeddings())
```

### हमारे स्वयं-प्रश्न पूछने वाले रिट्रीवर का निर्माण

अब हम अपने रिट्रीवर को इंस्टैंस कर सकते हैं। ऐसा करने के लिए हमें अपने दस्तावेजों के मेटाडेटा फ़ील्ड्स के बारे में कुछ जानकारी और दस्तावेज़ सामग्री का एक संक्षिप्त वर्णन प्रदान करना होगा।

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import ChatOpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genre of the movie. One of ['science fiction', 'comedy', 'drama', 'thriller', 'romance', 'action', 'animated']",
        type="string",
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
llm = ChatOpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectorstore,
    document_content_description,
    metadata_field_info,
)
```

### इसका परीक्षण करना

और अब हम वास्तव में अपने रिट्रीवर का उपयोग कर सकते हैं!

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'director': 'Andrei Tarkovsky', 'genre': 'thriller', 'rating': 9.9, 'year': 1979}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'director': 'Satoshi Kon', 'rating': 8.6, 'year': 2006})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'director': 'Greta Gerwig', 'rating': 8.3, 'year': 2019})]
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```output
[Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'director': 'Satoshi Kon', 'rating': 8.6, 'year': 2006}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'director': 'Andrei Tarkovsky', 'genre': 'thriller', 'rating': 9.9, 'year': 1979})]
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'genre': 'animated', 'year': 1995})]
```

### फ़िल्टर k

हम स्वयं प्रश्न पूछने वाले रिट्रीवर का उपयोग करके `k` को भी निर्दिष्ट कर सकते हैं: प्राप्त करने वाले दस्तावेजों की संख्या।

हम इसे निर्माता में `enable_limit=True` पास करके कर सकते हैं।

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectorstore,
    document_content_description,
    metadata_field_info,
    enable_limit=True,
)

# This example only specifies a relevant query
retriever.invoke("What are two movies about dinosaurs")
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'genre': 'science fiction', 'rating': 7.7, 'year': 1993}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'genre': 'animated', 'year': 1995})]
```

## LCEL के साथ से शुरू करना

क्या हो रहा है, और अधिक कस्टम नियंत्रण प्राप्त करने के लिए, हम अपने रिट्रीवर को से शुरू कर सकते हैं।

पहले, हमें एक प्रश्न-निर्माण श्रृंखला बनानी होगी। यह श्रृंखला उपयोगकर्ता प्रश्न को लेगी और एक `StructuredQuery` ऑब्जेक्ट जनरेट करेगी जो उपयोगकर्ता द्वारा निर्दिष्ट फ़िल्टरों को कैप्चर करता है। हम प्रॉम्प्ट और आउटपुट पार्सर बनाने के लिए कुछ सहायक कार्यों प्रदान करते हैं। इनमें कई ट्यूनेबल पैरामीटर हैं जिन्हें हम यहां सरलता के लिए नजरअंदाज करेंगे।

```python
from langchain.chains.query_constructor.base import (
    StructuredQueryOutputParser,
    get_query_constructor_prompt,
)

prompt = get_query_constructor_prompt(
    document_content_description,
    metadata_field_info,
)
output_parser = StructuredQueryOutputParser.from_components()
query_constructor = prompt | llm | output_parser
```

आइए अपने प्रॉम्प्ट पर नज़र डालें:

```python
print(prompt.format(query="dummy question"))
```

```output
Your goal is to structure the user's query to match the request schema provided below.

<< Structured Request Schema >>
When responding use a markdown code snippet with a JSON object formatted in the following schema:

\```json
{
    "query": string \ text string to compare to document contents
    "filter": string \ logical condition statement for filtering documents
}
\```

The query string should contain only text that is expected to match the contents of documents. Any conditions in the filter should not be mentioned in the query as well.

A logical condition statement is composed of one or more comparison and logical operation statements.

A comparison statement takes the form: `comp(attr, val)`:
- `comp` (eq | ne | gt | gte | lt | lte | contain | like | in | nin): comparator
- `attr` (string):  name of attribute to apply the comparison to
- `val` (string): is the comparison value

A logical operation statement takes the form `op(statement1, statement2, ...)`:
- `op` (and | or | not): logical operator
- `statement1`, `statement2`, ... (comparison statements or logical operation statements): one or more statements to apply the operation to

Make sure that you only use the comparators and logical operators listed above and no others.
Make sure that filters only refer to attributes that exist in the data source.
Make sure that filters only use the attributed names with its function names if there are functions applied on them.
Make sure that filters only use format `YYYY-MM-DD` when handling date data typed values.
Make sure that filters take into account the descriptions of attributes and only make comparisons that are feasible given the type of data being stored.
Make sure that filters are only used as needed. If there are no filters that should be applied return "NO_FILTER" for the filter value.

<< Example 1. >>
Data Source:

\```json
{
    "content": "Lyrics of a song",
    "attributes": {
        "artist": {
            "type": "string",
            "description": "Name of the song artist"
        },
        "length": {
            "type": "integer",
            "description": "Length of the song in seconds"
        },
        "genre": {
            "type": "string",
            "description": "The song genre, one of "pop", "rock" or "rap""
        }
    }
}
\```

User Query:
What are songs by Taylor Swift or Katy Perry about teenage romance under 3 minutes long in the dance pop genre

Structured Request:

\```json
{
    "query": "teenager love",
    "filter": "and(or(eq(\"artist\", \"Taylor Swift\"), eq(\"artist\", \"Katy Perry\")), lt(\"length\", 180), eq(\"genre\", \"pop\"))"
}
\```


<< Example 2. >>
Data Source:

\```json
{
    "content": "Lyrics of a song",
    "attributes": {
        "artist": {
            "type": "string",
            "description": "Name of the song artist"
        },
        "length": {
            "type": "integer",
            "description": "Length of the song in seconds"
        },
        "genre": {
            "type": "string",
            "description": "The song genre, one of "pop", "rock" or "rap""
        }
    }
}
\```

User Query:
What are songs that were not published on Spotify

Structured Request:

\```json
{
    "query": "",
    "filter": "NO_FILTER"
}
\```


<< Example 3. >>
Data Source:

\```json
{
    "content": "Brief summary of a movie",
    "attributes": {
    "genre": {
        "description": "The genre of the movie. One of ['science fiction', 'comedy', 'drama', 'thriller', 'romance', 'action', 'animated']",
        "type": "string"
    },
    "year": {
        "description": "The year the movie was released",
        "type": "integer"
    },
    "director": {
        "description": "The name of the movie director",
        "type": "string"
    },
    "rating": {
        "description": "A 1-10 rating for the movie",
        "type": "float"
    }
}
}
\```

User Query:
dummy question

Structured Request:

```

और हमारी पूरी श्रृंखला क्या उत्पन्न करती है:

```python
query_constructor.invoke(
    {
        "query": "What are some sci-fi movies from the 90's directed by Luc Besson about taxi drivers"
    }
)
```

```output
StructuredQuery(query='taxi driver', filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='science fiction'), Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GTE: 'gte'>, attribute='year', value=1990), Comparison(comparator=<Comparator.LT: 'lt'>, attribute='year', value=2000)]), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='director', value='Luc Besson')]), limit=None)
```

प्रश्न निर्माता स्वयं-प्रश्न पूछने वाले रिट्रीवर का मुख्य तत्व है। महान पुनर्प्राप्ति प्रणाली बनाने के लिए आपको सुनिश्चित करना होगा कि आपका प्रश्न निर्माता अच्छी तरह से काम करता है। अक्सर इसमें प्रॉम्प्ट, प्रॉम्प्ट में उदाहरण, गुण वर्णन आदि को समायोजित करना शामिल होता है। होटल इन्वेंट्री डेटा पर एक प्रश्न निर्माता को रिफ़ाइन करने के एक उदाहरण के लिए, [इस कुकबुक](https://github.com/langchain-ai/langchain/blob/master/cookbook/self_query_hotel_search.md) को देखें।

अगला महत्वपूर्ण तत्व संरचित प्रश्न अनुवादक है। यह वह वस्तु है जो सामान्य `StructuredQuery` ऑब्जेक्ट को आपके उपयोग कर रहे वेक्टर स्टोर के वाक्यविन्यास में मेटाडेटा फ़िल्टर में अनुवाद करती है। LangChain में कई बिल्ट-इन अनुवादक हैं। उन सभी को देखने के लिए [एकीकरण अनुभाग](/docs/integrations/retrievers/self_query) पर जाएं।

```python
from langchain.retrievers.self_query.chroma import ChromaTranslator

retriever = SelfQueryRetriever(
    query_constructor=query_constructor,
    vectorstore=vectorstore,
    structured_query_translator=ChromaTranslator(),
)
```

```python
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'genre': 'animated', 'year': 1995})]
```
