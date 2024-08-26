---
translated: true
---

# Vectara

>[Vectara](https://vectara.com/) एक विश्वसनीय GenAI प्लेटफ़ॉर्म है जो दस्तावेज़ अनुक्रमण और क्वेरी के लिए एक उपयोगकर्ता-अनुकूल API प्रदान करता है।
>
>`Vectara` एक अंत-से-अंत प्रबंधित सेवा प्रदान करता है `Retrieval Augmented Generation` या [RAG](https://vectara.com/grounded-generation/) के लिए, जिसमें शामिल हैं:
>1. दस्तावेज़ फ़ाइलों से `पाठ निकालने` और उन्हें वाक्यों में `खंडित` करने का तरीका।
>2. अत्याधुनिक [Boomerang](https://vectara.com/how-boomerang-takes-retrieval-augmented-generation-to-the-next-level-via-grounded-generation/) एम्बेडिंग मॉडल। प्रत्येक पाठ खंड को `Boomerang` का उपयोग करके एक वेक्टर एम्बेडिंग में एन्कोड किया जाता है, और Vectara आंतरिक ज्ञान (वेक्टर+पाठ) स्टोर में संग्रहीत किया जाता है।
>3. एक क्वेरी सेवा जो स्वचालित रूप से क्वेरी को एम्बेडिंग में एन्कोड करती है, और सबसे प्रासंगिक पाठ खंडों को पुनः प्राप्त करती है (जिसमें [Hybrid Search](https://docs.vectara.com/docs/api-reference/search-apis/lexical-matching) और [MMR](https://vectara.com/get-diverse-results-and-comprehensive-summaries-with-vectaras-mmr-reranker/)) के लिए समर्थन शामिल है)।
>4. पुनः प्राप्त दस्तावेजों के आधार पर [generative summary](https://docs.vectara.com/docs/learn/grounded-generation/grounded-generation-overview) बनाने का एक विकल्प, जिसमें उद्धरण शामिल हैं।

API का उपयोग करने के तरीके के बारे में अधिक जानकारी के लिए [Vectara API दस्तावेज़ीकरण](https://docs.vectara.com/docs/) देखें।

यह नोटबुक दिखाती है कि `SelfQueryRetriever` का उपयोग Vectara के साथ कैसे करें।

# सेटअप

`LangChain` के साथ `Vectara` का उपयोग करने के लिए आपको एक `Vectara` खाता चाहिए। शुरू करने के लिए, निम्नलिखित चरणों का उपयोग करें (हमारे [quickstart](https://docs.vectara.com/docs/quickstart) गाइड देखें):
1. यदि आपके पास पहले से एक नहीं है तो एक `Vectara` खाता [साइन अप](https://console.vectara.com/signup) करें। एक बार जब आप साइन अप पूरा कर लेते हैं तो आपके पास एक Vectara ग्राहक आईडी होगी। आप अपने नाम पर क्लिक करके, Vectara कंसोल विंडो के ऊपरी-दाएँ कोने में अपनी ग्राहक आईडी देख सकते हैं।
2. अपने खाते के भीतर आप एक या अधिक कॉर्पस बना सकते हैं। प्रत्येक कॉर्पस एक ऐसा क्षेत्र दर्शाता है जो इनपुट दस्तावेज़ों से पाठ डेटा संग्रहीत करता है। एक कॉर्पस बनाने के लिए, **"Create Corpus"** बटन का उपयोग करें। फिर आप अपने कॉर्पस को एक नाम और विवरण प्रदान करते हैं। वैकल्पिक रूप से आप कुछ उन्नत विकल्पों को लागू करते हुए फ़िल्टरिंग विशेषताओं को परिभाषित कर सकते हैं। यदि आप अपने बनाए गए कॉर्पस पर क्लिक करते हैं, तो आप उसके नाम और कॉर्पस आईडी को ऊपर देख सकते हैं।
3. अगला, आपको कॉर्पस तक पहुँचने के लिए एपीआई कुंजियाँ बनानी होंगी। कॉर्पस दृश्य में **"Authorization"** टैब पर क्लिक करें और फिर **"Create API Key"** बटन पर क्लिक करें। अपनी कुंजी को एक नाम दें, और चुनें कि आप केवल क्वेरी या क्वेरी+इंडेक्स के लिए अपनी कुंजी चाहते हैं। "Create" पर क्लिक करें और अब आपके पास एक सक्रिय एपीआई कुंजी है। इस कुंजी को गोपनीय रखें।

LangChain के साथ Vectara का उपयोग करने के लिए, आपको तीन मान चाहिए: customer ID, corpus ID और api_key।
आप उन्हें LangChain को दो तरीकों से प्रदान कर सकते हैं:

1. अपने वातावरण में इन तीन वेरिएबल्स को शामिल करें: `VECTARA_CUSTOMER_ID`, `VECTARA_CORPUS_ID` और `VECTARA_API_KEY`।

> उदाहरण के लिए, आप इन वेरिएबल्स को `os.environ` और `getpass` का उपयोग करके निम्नलिखित तरीके से सेट कर सकते हैं:

```python
import os
import getpass

os.environ["VECTARA_CUSTOMER_ID"] = getpass.getpass("Vectara Customer ID:")
os.environ["VECTARA_CORPUS_ID"] = getpass.getpass("Vectara Corpus ID:")
os.environ["VECTARA_API_KEY"] = getpass.getpass("Vectara API Key:")
```

1. `Vectara` वेक्टरस्टोर ऑब्जेक्ट बनाते समय उन्हें तर्क के रूप में प्रदान करें:

```python
vectorstore = Vectara(
                vectara_customer_id=vectara_customer_id,
                vectara_corpus_id=vectara_corpus_id,
                vectara_api_key=vectara_api_key
            )
```

**नोट:** आत्म-क्वेरी पुनः प्राप्तकर्ता के लिए आपको `lark` स्थापित करने की आवश्यकता होती है (`pip install lark`)।

## LangChain से Vectara से कनेक्ट करना

इस उदाहरण में, हम मानते हैं कि आपने एक खाता और एक कॉर्पस बनाया है, और अपने VECTARA_CUSTOMER_ID, VECTARA_CORPUS_ID और VECTARA_API_KEY (जो इंडेक्सिंग और क्वेरी दोनों के लिए अनुमतियों के साथ बनाए गए हैं) को पर्यावरण वेरिएबल्स के रूप में जोड़ा है।

कॉर्पस में फ़िल्टरिंग के लिए मेटाडेटा के रूप में 4 फ़ील्ड्स परिभाषित हैं: वर्ष, निर्देशक, रेटिंग, और शैली

```python
from langchain.chains import ConversationalRetrievalChain
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import FakeEmbeddings
from langchain_community.vectorstores import Vectara
from langchain_core.documents import Document
from langchain_openai import OpenAI
from langchain_text_splitters import CharacterTextSplitter
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
            "rating": 9.9,
            "director": "Andrei Tarkovsky",
            "genre": "science fiction",
        },
    ),
]

vectara = Vectara()
for doc in docs:
    vectara.add_texts(
        [doc.page_content],
        embedding=FakeEmbeddings(size=768),
        doc_metadata=doc.metadata,
    )
```

## हमारा आत्म-क्वेरी पुनः प्राप्तकर्ता बनाना

अब हम अपने पुनः प्राप्तकर्ता को स्थापित कर सकते हैं। ऐसा करने के लिए हमें हमारे दस्तावेज़ों के मेटाडेटा फ़ील्ड्स और दस्तावेज़ सामग्री का एक छोटा विवरण प्रदान करना होगा।

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
    llm, vectara, document_content_description, metadata_field_info, verbose=True
)
```

## इसका परीक्षण करना

और अब हम वास्तव में अपने पुनः प्राप्तकर्ता का उपयोग करके प्रयास कर सकते हैं!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'lang': 'eng', 'offset': '0', 'len': '66', 'year': '1993', 'rating': '7.7', 'genre': 'science fiction', 'source': 'langchain'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'lang': 'eng', 'offset': '0', 'len': '41', 'year': '1995', 'genre': 'animated', 'source': 'langchain'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'lang': 'eng', 'offset': '0', 'len': '116', 'year': '2006', 'director': 'Satoshi Kon', 'rating': '8.6', 'source': 'langchain'}),
 Document(page_content='Leo DiCaprio gets lost in a dream within a dream within a dream within a ...', metadata={'lang': 'eng', 'offset': '0', 'len': '76', 'year': '2010', 'director': 'Christopher Nolan', 'rating': '8.2', 'source': 'langchain'}),
 Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'lang': 'eng', 'offset': '0', 'len': '82', 'year': '2019', 'director': 'Greta Gerwig', 'rating': '8.3', 'source': 'langchain'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'lang': 'eng', 'offset': '0', 'len': '60', 'year': '1979', 'rating': '9.9', 'director': 'Andrei Tarkovsky', 'genre': 'science fiction', 'source': 'langchain'})]
```

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```output
[Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'lang': 'eng', 'offset': '0', 'len': '116', 'year': '2006', 'director': 'Satoshi Kon', 'rating': '8.6', 'source': 'langchain'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'lang': 'eng', 'offset': '0', 'len': '60', 'year': '1979', 'rating': '9.9', 'director': 'Andrei Tarkovsky', 'genre': 'science fiction', 'source': 'langchain'})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'lang': 'eng', 'offset': '0', 'len': '82', 'year': '2019', 'director': 'Greta Gerwig', 'rating': '8.3', 'source': 'langchain'})]
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'lang': 'eng', 'offset': '0', 'len': '60', 'year': '1979', 'rating': '9.9', 'director': 'Andrei Tarkovsky', 'genre': 'science fiction', 'source': 'langchain'})]
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'lang': 'eng', 'offset': '0', 'len': '41', 'year': '1995', 'genre': 'animated', 'source': 'langchain'})]
```

## Filter k

हम आत्म-क्वेरी पुनः प्राप्तकर्ता का उपयोग `k` निर्दिष्ट करने के लिए भी कर सकते हैं: दस्तावेज़ों की संख्या को पुनः प्राप्त करना।

हम इसे कंस्ट्रक्टर को `enable_limit=True` पास करके कर सकते हैं।

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectara,
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
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'lang': 'eng', 'offset': '0', 'len': '66', 'year': '1993', 'rating': '7.7', 'genre': 'science fiction', 'source': 'langchain'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'lang': 'eng', 'offset': '0', 'len': '41', 'year': '1995', 'genre': 'animated', 'source': 'langchain'})]
```
