---
translated: true
---

# MyScale

>[MyScale](https://docs.myscale.com/en/) एक एकीकृत वेक्टर डेटाबेस है। आप अपने डेटाबेस तक SQL से और यहां से भी, LangChain से पहुंच सकते हैं।
>`MyScale` [विभिन्न डेटा प्रकारों और फ़िल्टर के लिए कार्यों](https://blog.myscale.com/2023/06/06/why-integrated-database-solution-can-boost-your-llm-apps/#filter-on-anything-without-constraints) का उपयोग कर सकता है। यह आपके LLM ऐप को बूस्ट करेगा, चाहे आप अपने डेटा को स्केल करने या अपने सिस्टम को व्यापक अनुप्रयोग में विस्तारित करने जा रहे हों।

नोटबुक में, हम `MyScale` वेक्टर स्टोर के साथ `SelfQueryRetriever` का प्रदर्शन करेंगे, जिसमें हमने LangChain में कुछ अतिरिक्त टुकड़े जोड़े हैं।

संक्षेप में, इसे 4 बिंदुओं में संक्षिप्त किया जा सकता है:
1. किसी भी सूची में एक से अधिक तत्व मैच होने पर उन्हें मिलान करने के लिए `contain` तुलनात्मक जोड़ें
2. दिनांक-समय मैच (ISO-प्रारूप या YYYY-MM-DD) के लिए `timestamp` डेटा प्रकार जोड़ें
3. स्ट्रिंग पैटर्न खोज के लिए `like` तुलनात्मक जोड़ें
4. मनमाना कार्य क्षमता जोड़ें

## MyScale वेक्टर स्टोर बनाना

MyScale को पहले से ही LangChain में एकीकृत किया गया है। इसलिए आप [यह नोटबुक](/docs/integrations/vectorstores/myscale) का पालन करके अपना स्वयं का वेक्टर स्टोर बना सकते हैं।

**नोट:** सभी स्वयं-प्रश्न पुनर्प्राप्तकर्ताओं के लिए आपके पास `lark` स्थापित होना चाहिए (`pip install lark`)। हम व्याकरण परिभाषा के लिए `lark` का उपयोग करते हैं। अगले चरण पर जाने से पहले, हम आपको याद दिलाना चाहते हैं कि `clickhouse-connect` भी आपके MyScale बैकएंड के साथ बातचीत करने के लिए आवश्यक है।

```python
%pip install --upgrade --quiet  lark clickhouse-connect
```

इस ट्यूटोरियल में हम अन्य उदाहरण की सेटिंग का पालन करते हैं और `OpenAIEmbeddings` का उपयोग करते हैं। LLM तक वैध पहुंच के लिए एक OpenAI API कुंजी प्राप्त करना याद रखें।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
os.environ["MYSCALE_HOST"] = getpass.getpass("MyScale URL:")
os.environ["MYSCALE_PORT"] = getpass.getpass("MyScale Port:")
os.environ["MYSCALE_USERNAME"] = getpass.getpass("MyScale Username:")
os.environ["MYSCALE_PASSWORD"] = getpass.getpass("MyScale Password:")
```

```python
from langchain_community.vectorstores import MyScale
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

## कुछ नमूना डेटा बनाएं

जैसा कि आप देख सकते हैं, हमने बनाए गए डेटा में कुछ अंतर हैं। हमने `year` कीवर्ड को `date` से बदल दिया है, जो आपको टाइमस्टैंप पर अधिक नियंत्रण देता है। हमने `gerne` कीवर्ड के प्रकार को स्ट्रिंग की एक सूची में भी बदल दिया है, जहां एक LLM नया `contain` तुलनात्मक उपयोग कर फ़िल्टर बना सकता है। हमने `like` तुलनात्मक और मनमाना कार्य समर्थन भी प्रदान किया है, जिन्हें अगले कुछ सेल में परिचय दिया जाएगा।

अब आइए पहले डेटा को देखते हैं।

```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"date": "1993-07-02", "rating": 7.7, "genre": ["science fiction"]},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"date": "2010-12-30", "director": "Christopher Nolan", "rating": 8.2},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"date": "2006-04-23", "director": "Satoshi Kon", "rating": 8.6},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"date": "2019-08-22", "director": "Greta Gerwig", "rating": 8.3},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"date": "1995-02-11", "genre": ["animated"]},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={
            "date": "1979-09-10",
            "director": "Andrei Tarkovsky",
            "genre": ["science fiction", "adventure"],
            "rating": 9.9,
        },
    ),
]
vectorstore = MyScale.from_documents(
    docs,
    embeddings,
)
```

## अपने स्वयं-प्रश्न पुनर्प्राप्तकर्ता बनाना

अन्य पुनर्प्राप्तकर्ताओं की तरह ही... सरल और अच्छा।

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genres of the movie",
        type="list[string]",
    ),
    # If you want to include length of a list, just define it as a new column
    # This will teach the LLM to use it as a column when constructing filter.
    AttributeInfo(
        name="length(genre)",
        description="The length of genres of the movie",
        type="integer",
    ),
    # Now you can define a column as timestamp. By simply set the type to timestamp.
    AttributeInfo(
        name="date",
        description="The date the movie was released",
        type="timestamp",
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

## स्वयं-प्रश्न पुनर्प्राप्तकर्ता के मौजूदा कार्यक्षमताओं के साथ परीक्षण करना

और अब हम वास्तव में अपने पुनर्प्राप्तकर्ता का उपयोग कर सकते हैं!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```

# एक पल... और क्या?

MyScale के साथ स्वयं-प्रश्न पुनर्प्राप्तकर्ता और भी कर सकता है! चलो पता करते हैं।

```python
# You can use length(genres) to do anything you want
retriever.invoke("What's a movie that have more than 1 genres?")
```

```python
# Fine-grained datetime? You got it already.
retriever.invoke("What's a movie that release after feb 1995?")
```

```python
# Don't know what your exact filter should be? Use string pattern match!
retriever.invoke("What's a movie whose name is like Andrei?")
```

```python
# Contain works for lists: so you can match a list with contain comparator!
retriever.invoke("What's a movie who has genres science fiction and adventure?")
```

## फ़िल्टर k

हम स्वयं प्रश्न पुनर्प्राप्तकर्ता का उपयोग `k` निर्दिष्ट करने के लिए भी कर सकते हैं: प्राप्त करने वाले दस्तावेजों की संख्या।

हम इसे निर्माता में `enable_limit=True` पास करके कर सकते हैं।

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
