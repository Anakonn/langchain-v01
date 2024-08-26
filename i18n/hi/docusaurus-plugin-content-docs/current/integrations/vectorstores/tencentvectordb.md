---
translated: true
---

# टेंसेंट क्लाउड वेक्टरडीबी

>[टेंसेंट क्लाउड वेक्टरडीबी](https://cloud.tencent.com/document/product/1709) एक पूरी तरह से प्रबंधित, स्वविकसित, उद्यम-स्तरीय वितरित डेटाबेस सेवा है जो बहु-आयामी वेक्टर डेटा को संग्रहीत करने, पुनर्प्राप्त करने और विश्लेषण करने के लिए डिज़ाइन की गई है। डेटाबेस कई प्रकार के सूचकांक और समानता गणना विधियों का समर्थन करता है। एक सूचकांक 1 बिलियन तक के वेक्टर स्केल का समर्थन कर सकता है और लाखों क्यूपीएस और मिलीसेकंड स्तर की क्वेरी लेटेंसी का समर्थन कर सकता है। टेंसेंट क्लाउड वेक्टर डेटाबेस न केवल बड़े मॉडलों के लिए एक बाहरी ज्ञान आधार प्रदान कर सकता है जो बड़े मॉडल प्रतिक्रियाओं की सटीकता को बेहतर बना सकता है, बल्कि अनुशंसा प्रणाली, एनएलपी सेवाएं, कंप्यूटर दृश्य और बुद्धिमान ग्राहक सेवा जैसे एआई क्षेत्रों में भी व्यापक रूप से उपयोग किया जा सकता है।

यह नोटबुक टेंसेंट वेक्टर डेटाबेस से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।

चलाने के लिए, आपके पास एक [डेटाबेस उदाहरण](https://cloud.tencent.com/document/product/1709/95101) होना चाहिए।

## मूलभूत उपयोग

```python
!pip3 install tcvectordb
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores import TencentVectorDB
from langchain_community.vectorstores.tencentvectordb import ConnectionParams
from langchain_text_splitters import CharacterTextSplitter
```

दस्तावेज़ लोड करें, उन्हें टुकड़ों में विभाजित करें।

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

हम दस्तावेज़ों को एम्बेड करने के दो तरीके समर्थित करते हैं:
- लैंगचेन एम्बेडिंग्स के साथ संगत किसी भी एम्बेडिंग मॉडल का उपयोग करें।
- टेंसेंट वेक्टरस्टोर डीबी के एम्बेडिंग मॉडल का नाम निर्दिष्ट करें, विकल्प हैं:
    - `bge-base-zh`, आयाम: 768
    - `m3e-base`, आयाम: 768
    - `text2vec-large-chinese`, आयाम: 1024
    - `e5-large-v2`, आयाम: 1024
    - `multilingual-e5-base`, आयाम: 768

प्रवाहित कोड दस्तावेज़ों को एम्बेड करने के दोनों तरीकों को दिखाता है, आप उनमें से किसी एक को चुन सकते हैं और दूसरे को टिप्पणी कर सकते हैं:

```python
##  you can use a Langchain Embeddings model, like OpenAIEmbeddings:

# from langchain_community.embeddings.openai import OpenAIEmbeddings
#
# embeddings = OpenAIEmbeddings()
# t_vdb_embedding = None

## Or you can use a Tencent Embedding model, like `bge-base-zh`:

t_vdb_embedding = "bge-base-zh"  # bge-base-zh is the default model
embeddings = None
```

अब हम एक TencentVectorDB उदाहरण बना सकते हैं, आपको कम से कम `embeddings` या `t_vdb_embedding` पैरामीटरों में से एक प्रदान करना होगा। यदि दोनों प्रदान किए जाते हैं, तो `embeddings` पैरामीटर का उपयोग किया जाएगा:

```python
conn_params = ConnectionParams(
    url="http://10.0.X.X",
    key="eC4bLRy2va******************************",
    username="root",
    timeout=20,
)

vector_db = TencentVectorDB.from_documents(
    docs, embeddings, connection_params=conn_params, t_vdb_embedding=t_vdb_embedding
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
docs[0].page_content
```

```output
'Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.'
```

```python
vector_db = TencentVectorDB(embeddings, conn_params)

vector_db.add_texts(["Ankush went to Princeton"])
query = "Where did Ankush go to college?"
docs = vector_db.max_marginal_relevance_search(query)
docs[0].page_content
```

```output
'Ankush went to Princeton'
```

## मेटाडेटा और फ़िल्टरिंग

टेंसेंट वेक्टरडीबी मेटाडेटा और [फ़िल्टरिंग](https://cloud.tencent.com/document/product/1709/95099#c6f6d3a3-02c5-4891-b0a1-30fe4daf18d8) का समर्थन करता है। आप दस्तावेज़ों में मेटाडेटा जोड़ सकते हैं और मेटाडेटा के आधार पर खोज परिणामों को फ़िल्टर कर सकते हैं।

अब हम मेटाडेटा के साथ एक नया TencentVectorDB संग्रह बनाएंगे और मेटाडेटा के आधार पर खोज परिणामों को फ़िल्टर करने का प्रदर्शन करेंगे:

```python
from langchain_community.vectorstores.tencentvectordb import (
    META_FIELD_TYPE_STRING,
    META_FIELD_TYPE_UINT64,
    ConnectionParams,
    MetaField,
    TencentVectorDB,
)
from langchain_core.documents import Document

meta_fields = [
    MetaField(name="year", data_type=META_FIELD_TYPE_UINT64, index=True),
    MetaField(name="rating", data_type=META_FIELD_TYPE_STRING, index=False),
    MetaField(name="genre", data_type=META_FIELD_TYPE_STRING, index=True),
    MetaField(name="director", data_type=META_FIELD_TYPE_STRING, index=True),
]

docs = [
    Document(
        page_content="The Shawshank Redemption is a 1994 American drama film written and directed by Frank Darabont.",
        metadata={
            "year": 1994,
            "rating": "9.3",
            "genre": "drama",
            "director": "Frank Darabont",
        },
    ),
    Document(
        page_content="The Godfather is a 1972 American crime film directed by Francis Ford Coppola.",
        metadata={
            "year": 1972,
            "rating": "9.2",
            "genre": "crime",
            "director": "Francis Ford Coppola",
        },
    ),
    Document(
        page_content="The Dark Knight is a 2008 superhero film directed by Christopher Nolan.",
        metadata={
            "year": 2008,
            "rating": "9.0",
            "genre": "superhero",
            "director": "Christopher Nolan",
        },
    ),
    Document(
        page_content="Inception is a 2010 science fiction action film written and directed by Christopher Nolan.",
        metadata={
            "year": 2010,
            "rating": "8.8",
            "genre": "science fiction",
            "director": "Christopher Nolan",
        },
    ),
]

vector_db = TencentVectorDB.from_documents(
    docs,
    None,
    connection_params=ConnectionParams(
        url="http://10.0.X.X",
        key="eC4bLRy2va******************************",
        username="root",
        timeout=20,
    ),
    collection_name="movies",
    meta_fields=meta_fields,
)

query = "film about dream by Christopher Nolan"

# you can use the tencentvectordb filtering syntax with the `expr` parameter:
result = vector_db.similarity_search(query, expr='director="Christopher Nolan"')

# you can either use the langchain filtering syntax with the `filter` parameter:
# result = vector_db.similarity_search(query, filter='eq("director", "Christopher Nolan")')

result
```

```output
[Document(page_content='The Dark Knight is a 2008 superhero film directed by Christopher Nolan.', metadata={'year': 2008, 'rating': '9.0', 'genre': 'superhero', 'director': 'Christopher Nolan'}),
 Document(page_content='The Dark Knight is a 2008 superhero film directed by Christopher Nolan.', metadata={'year': 2008, 'rating': '9.0', 'genre': 'superhero', 'director': 'Christopher Nolan'}),
 Document(page_content='The Dark Knight is a 2008 superhero film directed by Christopher Nolan.', metadata={'year': 2008, 'rating': '9.0', 'genre': 'superhero', 'director': 'Christopher Nolan'}),
 Document(page_content='Inception is a 2010 science fiction action film written and directed by Christopher Nolan.', metadata={'year': 2010, 'rating': '8.8', 'genre': 'science fiction', 'director': 'Christopher Nolan'})]
```
