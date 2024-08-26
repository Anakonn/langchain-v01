---
translated: true
---

# Kinetica आधारित वेक्टर स्टोर रिट्रीवर

>[Kinetica](https://www.kinetica.com/) एक डेटाबेस है जिसमें वेक्टर समानता खोज के लिए एकीकृत समर्थन है

यह समर्थन करता है:
- सटीक और लगभग निकटतम पड़ोसी खोज
- L2 दूरी, आंतरिक उत्पाद और कोसाइन दूरी

यह नोटबुक `Kinetica` वेक्टर स्टोर (`Kinetica`) आधारित रिट्रीवर का उपयोग करने का तरीका दिखाता है।

```python
# Please ensure that this connector is installed in your working environment.
%pip install gpudb==7.2.0.1
```

हमें `OpenAIEmbeddings` का उपयोग करना है, इसलिए हमें OpenAI API कुंजी प्राप्त करनी होगी।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
## Loading Environment Variables
from dotenv import load_dotenv

load_dotenv()
```

```python
from langchain.docstore.document import Document
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import (
    Kinetica,
    KineticaSettings,
)
from langchain_openai import OpenAIEmbeddings
```

```python
# Kinetica needs the connection to the database.
# This is how to set it up.
HOST = os.getenv("KINETICA_HOST", "http://127.0.0.1:9191")
USERNAME = os.getenv("KINETICA_USERNAME", "")
PASSWORD = os.getenv("KINETICA_PASSWORD", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")


def create_config() -> KineticaSettings:
    return KineticaSettings(host=HOST, username=USERNAME, password=PASSWORD)
```

## वेक्टर स्टोर से रिट्रीवर बनाएं

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

# The Kinetica Module will try to create a table with the name of the collection.
# So, make sure that the collection name is unique and the user has the permission to create a table.

COLLECTION_NAME = "state_of_the_union_test"
connection = create_config()

db = Kinetica.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=COLLECTION_NAME,
    config=connection,
)

# create retriever from the vector store
retriever = db.as_retriever(search_kwargs={"k": 2})
```

## रिट्रीवर के साथ खोजें

```python
result = retriever.get_relevant_documents(
    "What did the president say about Ketanji Brown Jackson"
)
print(docs[0].page_content)
```
