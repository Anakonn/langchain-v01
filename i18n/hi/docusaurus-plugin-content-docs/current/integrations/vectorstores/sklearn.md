---
translated: true
---

# scikit-learn

>[scikit-learn](https://scikit-learn.org/stable/) एक ओपन-सोर्स मशीन लर्निंग एल्गोरिदम का संग्रह है, जिसमें [k निकटतम पड़ोसी](https://scikit-learn.org/stable/modules/generated/sklearn.neighbors.NearestNeighbors.html) का कुछ कार्यान्वयन शामिल है। `SKLearnVectorStore` इस कार्यान्वयन को लपेटता है और JSON, BSON (बाइनरी JSON) या Apache Parquet प्रारूप में वेक्टर स्टोर को स्थायी करने की संभावना जोड़ता है।

यह नोटबुक `SKLearnVectorStore` वेक्टर डेटाबेस का उपयोग करने का तरीका दिखाता है।

```python
%pip install --upgrade --quiet  scikit-learn

# # if you plan to use bson serialization, install also:
%pip install --upgrade --quiet  bson

# # if you plan to use parquet serialization, install also:
%pip install --upgrade --quiet  pandas pyarrow
```

OpenAI एम्बेडिंग का उपयोग करने के लिए, आपको एक OpenAI कुंजी की आवश्यकता होगी। आप https://platform.openai.com/account/api-keys पर इसे प्राप्त कर सकते हैं या किसी अन्य एम्बेडिंग का उपयोग करने के लिए स्वतंत्र हैं।

```python
import os
from getpass import getpass

os.environ["OPENAI_API_KEY"] = getpass("Enter your OpenAI key:")
```

## मूलभूत उपयोग

### एक नमूना दस्तावेज़ कॉर्पस लोड करें

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import SKLearnVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
embeddings = OpenAIEmbeddings()
```

### SKLearnVectorStore बनाएं, दस्तावेज़ कॉर्पस को सूचीबद्ध करें और एक नमूना क्वेरी चलाएं

```python
import tempfile

persist_path = os.path.join(tempfile.gettempdir(), "union.parquet")

vector_store = SKLearnVectorStore.from_documents(
    documents=docs,
    embedding=embeddings,
    persist_path=persist_path,  # persist_path and serializer are optional
    serializer="parquet",
)

query = "What did the president say about Ketanji Brown Jackson"
docs = vector_store.similarity_search(query)
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## एक वेक्टर स्टोर को सहेजना और लोड करना

```python
vector_store.persist()
print("Vector store was persisted to", persist_path)
```

```output
Vector store was persisted to /var/folders/6r/wc15p6m13nl_nl_n_xfqpc5c0000gp/T/union.parquet
```

```python
vector_store2 = SKLearnVectorStore(
    embedding=embeddings, persist_path=persist_path, serializer="parquet"
)
print("A new instance of vector store was loaded from", persist_path)
```

```output
A new instance of vector store was loaded from /var/folders/6r/wc15p6m13nl_nl_n_xfqpc5c0000gp/T/union.parquet
```

```python
docs = vector_store2.similarity_search(query)
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## सफाई

```python
os.remove(persist_path)
```
