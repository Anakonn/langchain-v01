---
translated: true
---

# TileDB

> [TileDB](https://github.com/TileDB-Inc/TileDB) एक शक्तिशाली इंजन है जो घने और स्पार्स बहु-आयामी एरे का सूचकांकन और प्रश्न करने के लिए है।

> TileDB [TileDB-Vector-Search](https://github.com/TileDB-Inc/TileDB-Vector-Search) मॉड्यूल का उपयोग करके एएनएन खोज क्षमताएं प्रदान करता है। यह स्थानीय डिस्क और क्लाउड ऑब्जेक्ट स्टोर (यानी AWS S3) दोनों पर वेक्टर इंडेक्स के सर्वरलेस निष्पादन और संग्रहण प्रदान करता है।

अधिक विवरण यहां पर:
-  [क्यों TileDB एक वेक्टर डेटाबेस के रूप में](https://tiledb.com/blog/why-tiledb-as-a-vector-database)
-  [TileDB 101: वेक्टर खोज](https://tiledb.com/blog/tiledb-101-vector-search)

यह नोटबुक `TileDB` वेक्टर डेटाबेस का उपयोग करने का प्रदर्शन करता है।

```python
%pip install --upgrade --quiet  tiledb-vector-search
```

## मूल उदाहरण

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import TileDB
from langchain_text_splitters import CharacterTextSplitter

raw_documents = TextLoader("../../modules/state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
documents = text_splitter.split_documents(raw_documents)
embeddings = HuggingFaceEmbeddings()
db = TileDB.from_documents(
    documents, embeddings, index_uri="/tmp/tiledb_index", index_type="FLAT"
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
docs[0].page_content
```

### वेक्टर द्वारा समानता खोज

```python
embedding_vector = embeddings.embed_query(query)
docs = db.similarity_search_by_vector(embedding_vector)
docs[0].page_content
```

### स्कोर के साथ समानता खोज

```python
docs_and_scores = db.similarity_search_with_score(query)
docs_and_scores[0]
```

## अधिकतम सीमांत प्रासंगिकता खोज (MMR)

रिट्रीवर ऑब्जेक्ट में समानता खोज का उपयोग करने के अलावा, आप `mmr` का भी उपयोग कर सकते हैं।

```python
retriever = db.as_retriever(search_type="mmr")
retriever.invoke(query)
```

या `max_marginal_relevance_search` का सीधा उपयोग करें:

```python
db.max_marginal_relevance_search(query, k=2, fetch_k=10)
```
