---
translated: true
---

# viking DB

>[viking DB](https://www.volcengine.com/docs/6459/1163946) एक डेटाबेस है जो गहन न्यूरल नेटवर्क और अन्य मशीन लर्निंग (एमएल) मॉडल द्वारा उत्पन्न विशाल एम्बेडिंग वेक्टर को संग्रहीत, अनुक्रमित और प्रबंधित करता है।

यह नोटबुक VikingDB वेक्टर डेटाबेस से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।

चलाने के लिए, आपके पास एक [viking DB इंस्टेंस चालू और चल रहा होना चाहिए](https://www.volcengine.com/docs/6459/1165058)।

```python
!pip install --upgrade volcengine
```

हम VikingDBEmbeddings का उपयोग करना चाहते हैं, इसलिए हमें VikingDB API कुंजी प्राप्त करनी होगी।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain.document_loaders import TextLoader
from langchain_community.vectorstores.vikingdb import VikingDB, VikingDBConfig
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
loader = TextLoader("./test.txt")
documents = loader.load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=10, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
db = VikingDB.from_documents(
    docs,
    embeddings,
    connection_args=VikingDBConfig(
        host="host", region="region", ak="ak", sk="sk", scheme="http"
    ),
    drop_old=True,
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
```

```python
docs[0].page_content
```

### viking DB संग्रह के साथ डेटा को अलग-अलग करें

आप एक ही viking DB इंस्टेंस में विभिन्न असंबद्ध दस्तावेजों को विभिन्न संग्रहों में संग्रहीत कर सकते हैं ताकि संदर्भ बना रहे।

यहां आप एक नया संग्रह कैसे बना सकते हैं

```python
db = VikingDB.from_documents(
    docs,
    embeddings,
    connection_args=VikingDBConfig(
        host="host", region="region", ak="ak", sk="sk", scheme="http"
    ),
    collection_name="collection_1",
    drop_old=True,
)
```

और यहां आप उस संग्रह को कैसे पुनः प्राप्त कर सकते हैं

```python
db = VikingDB.from_documents(
    embeddings,
    connection_args=VikingDBConfig(
        host="host", region="region", ak="ak", sk="sk", scheme="http"
    ),
    collection_name="collection_1",
)
```

पुनः प्राप्ति के बाद आप सामान्य रूप से उसका प्रश्न पूछ सकते हैं।
