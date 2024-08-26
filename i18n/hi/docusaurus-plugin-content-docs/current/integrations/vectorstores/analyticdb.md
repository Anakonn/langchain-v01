---
translated: true
---

# एनालिटिकडीबी

>[PostgreSQL के लिए एनालिटिकडीबी](https://www.alibabacloud.com/help/en/analyticdb-for-postgresql/latest/product-introduction-overview) एक मासिव समानांतर प्रोसेसिंग (एमपीपी) डेटा वेयरहाउसिंग सेवा है जो बड़ी मात्रा में डेटा का ऑनलाइन विश्लेषण करने के लिए डिज़ाइन की गई है।

>`PostgreSQL के लिए एनालिटिकडीबी` को ओपन-सोर्स `Greenplum डेटाबेस` परियोजना पर आधारित है और `Alibaba Cloud` द्वारा गहन विस्तारों के साथ वर्धित किया गया है। PostgreSQL के लिए एनालिटिकडीबी एएनएसआई एसक्यूएल 2003 वाक्यविन्यास और PostgreSQL और Oracle डेटाबेस पारिस्थितिकी तंत्र के साथ संगत है। PostgreSQL के लिए एनालिटिकडीबी पंक्ति स्टोर और स्तंभ स्टोर का भी समर्थन करता है। PostgreSQL के लिए एनालिटिकडीबी पेटाबाइट डेटा को ऑफ़लाइन उच्च प्रदर्शन स्तर पर प्रोसेस करता है और उच्च समकालिक ऑनलाइन क्वेरी का समर्थन करता है।

यह नोटबुक `एनालिटिकडीबी` वेक्टर डेटाबेस से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।
चलाने के लिए, आपके पास एक [एनालिटिकडीबी](https://www.alibabacloud.com/help/en/analyticdb-for-postgresql/latest/product-introduction-overview) उदाहरण चालू और चल रहा होना चाहिए:
- [एनालिटिकडीबी क्लाउड वेक्टर डेटाबेस](https://www.alibabacloud.com/product/hybriddb-postgresql) का उपयोग करके। यहां क्लिक करें और इसे तेजी से तैनात करें।

```python
from langchain_community.vectorstores import AnalyticDB
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

OpenAI API को कॉल करके दस्तावेजों को विभाजित करें और एम्बेडिंग प्राप्त करें।

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

संबंधित पर्यावरण सेट करके एनालिटिकडीबी से कनेक्ट करें।

```bash
export PG_HOST={your_analyticdb_hostname}
export PG_PORT={your_analyticdb_port} # Optional, default is 5432
export PG_DATABASE={your_database} # Optional, default is postgres
export PG_USER={database_username}
export PG_PASSWORD={database_password}
```

फिर अपने एम्बेडिंग और दस्तावेज़ों को एनालिटिकडीबी में संग्रहीत करें।

```python
import os

connection_string = AnalyticDB.connection_string_from_db_params(
    driver=os.environ.get("PG_DRIVER", "psycopg2cffi"),
    host=os.environ.get("PG_HOST", "localhost"),
    port=int(os.environ.get("PG_PORT", "5432")),
    database=os.environ.get("PG_DATABASE", "postgres"),
    user=os.environ.get("PG_USER", "postgres"),
    password=os.environ.get("PG_PASSWORD", "postgres"),
)

vector_db = AnalyticDB.from_documents(
    docs,
    embeddings,
    connection_string=connection_string,
)
```

क्वेरी करें और डेटा पुनर्प्राप्त करें।

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```
