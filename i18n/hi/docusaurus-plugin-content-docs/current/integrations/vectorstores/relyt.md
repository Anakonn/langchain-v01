---
translated: true
---

# रेलीट

>[रेलीट](https://docs.relyt.cn/docs/vector-engine/use/) एक क्लाउड नेटिव डेटा वेयरहाउसिंग सेवा है जो बड़ी मात्रा में डेटा का ऑनलाइन विश्लेषण करने के लिए डिज़ाइन किया गया है।

>`रेलीट` ANSI SQL 2003 वाक्यविन्यास और PostgreSQL और Oracle डेटाबेस पारिस्थितिकी तंत्र के साथ संगत है। रेलीट रो स्टोर और कॉलम स्टोर का भी समर्थन करता है। रेलीट पेटाबाइट डेटा को उच्च प्रदर्शन स्तर पर ऑफ़लाइन प्रोसेस करता है और अत्यधिक समानांतर ऑनलाइन क्वेरी का समर्थन करता है।

यह नोटबुक `रेलीट` वेक्टर डेटाबेस से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।
चलाने के लिए, आपके पास एक [रेलीट](https://docs.relyt.cn/) इंस्टेंस चालू और चल रहा होना चाहिए:
- [रेलीट वेक्टर डेटाबेस](https://docs.relyt.cn/docs/vector-engine/use/) का उपयोग करके। यहां क्लिक करें और इसे तेजी से तैनात करें।

```python
%pip install "pgvecto_rs[sdk]"
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores import Relyt
from langchain_text_splitters import CharacterTextSplitter
```

डॉक्यूमेंट को विभाजित करें और कम्युनिटी API को कॉल करके एम्बेडिंग प्राप्त करें

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = FakeEmbeddings(size=1536)
```

संबंधित पर्यावरण सेट करके रेलीट से कनेक्ट करें

```bash
export PG_HOST={your_relyt_hostname}
export PG_PORT={your_relyt_port} # Optional, default is 5432
export PG_DATABASE={your_database} # Optional, default is postgres
export PG_USER={database_username}
export PG_PASSWORD={database_password}
```

फिर अपने एम्बेडिंग और दस्तावेज़ों को रेलीट में संग्रहीत करें

```python
import os

connection_string = Relyt.connection_string_from_db_params(
    driver=os.environ.get("PG_DRIVER", "psycopg2cffi"),
    host=os.environ.get("PG_HOST", "localhost"),
    port=int(os.environ.get("PG_PORT", "5432")),
    database=os.environ.get("PG_DATABASE", "postgres"),
    user=os.environ.get("PG_USER", "postgres"),
    password=os.environ.get("PG_PASSWORD", "postgres"),
)

vector_db = Relyt.from_documents(
    docs,
    embeddings,
    connection_string=connection_string,
)
```

क्वेरी करें और डेटा पुनर्प्राप्त करें

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
