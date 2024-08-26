---
translated: true
---

# बेगल

> [बेगल](https://www.bagel.net/) (`एआई के लिए ओपन इन्फरेंस प्लेटफॉर्म`), एआई डेटा के लिए GitHub की तरह है।
यह एक सहयोगी प्लेटफॉर्म है जहां उपयोगकर्ता इन्फरेंस डेटासेट बना सकते हैं,
साझा कर सकते हैं, और प्रबंधित कर सकते हैं। यह स्वतंत्र डेवलपर्स के लिए निजी परियोजनाओं, उद्यमों के लिए आंतरिक सहयोग, और डेटा डीएओ के लिए सार्वजनिक योगदान का समर्थन कर सकता है।

### स्थापना और सेटअप

```bash
pip install bagelML
```

## पाठ से VectorStore बनाएं

```python
from langchain_community.vectorstores import Bagel

texts = ["hello bagel", "hello langchain", "I love salad", "my car", "a dog"]
# create cluster and add texts
cluster = Bagel.from_texts(cluster_name="testing", texts=texts)
```

```python
# similarity search
cluster.similarity_search("bagel", k=3)
```

```output
[Document(page_content='hello bagel', metadata={}),
 Document(page_content='my car', metadata={}),
 Document(page_content='I love salad', metadata={})]
```

```python
# the score is a distance metric, so lower is better
cluster.similarity_search_with_score("bagel", k=3)
```

```output
[(Document(page_content='hello bagel', metadata={}), 0.27392977476119995),
 (Document(page_content='my car', metadata={}), 1.4783176183700562),
 (Document(page_content='I love salad', metadata={}), 1.5342965126037598)]
```

```python
# delete the cluster
cluster.delete_cluster()
```

## दस्तावेजों से VectorStore बनाएं

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)[:10]
```

```python
# create cluster with docs
cluster = Bagel.from_documents(cluster_name="testing_with_docs", documents=docs)
```

```python
# similarity search
query = "What did the president say about Ketanji Brown Jackson"
docs = cluster.similarity_search(query)
print(docs[0].page_content[:102])
```

```output
Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the
```

## सभी पाठ/दस्तावेज को क्लस्टर से प्राप्त करें

```python
texts = ["hello bagel", "this is langchain"]
cluster = Bagel.from_texts(cluster_name="testing", texts=texts)
cluster_data = cluster.get()
```

```python
# all keys
cluster_data.keys()
```

```output
dict_keys(['ids', 'embeddings', 'metadatas', 'documents'])
```

```python
# all values and keys
cluster_data
```

```output
{'ids': ['578c6d24-3763-11ee-a8ab-b7b7b34f99ba',
  '578c6d25-3763-11ee-a8ab-b7b7b34f99ba',
  'fb2fc7d8-3762-11ee-a8ab-b7b7b34f99ba',
  'fb2fc7d9-3762-11ee-a8ab-b7b7b34f99ba',
  '6b40881a-3762-11ee-a8ab-b7b7b34f99ba',
  '6b40881b-3762-11ee-a8ab-b7b7b34f99ba',
  '581e691e-3762-11ee-a8ab-b7b7b34f99ba',
  '581e691f-3762-11ee-a8ab-b7b7b34f99ba'],
 'embeddings': None,
 'metadatas': [{}, {}, {}, {}, {}, {}, {}, {}],
 'documents': ['hello bagel',
  'this is langchain',
  'hello bagel',
  'this is langchain',
  'hello bagel',
  'this is langchain',
  'hello bagel',
  'this is langchain']}
```

```python
cluster.delete_cluster()
```

## मेटाडेटा के साथ क्लस्टर बनाएं और मेटाडेटा का उपयोग करके फ़िल्टर करें

```python
texts = ["hello bagel", "this is langchain"]
metadatas = [{"source": "notion"}, {"source": "google"}]

cluster = Bagel.from_texts(cluster_name="testing", texts=texts, metadatas=metadatas)
cluster.similarity_search_with_score("hello bagel", where={"source": "notion"})
```

```output
[(Document(page_content='hello bagel', metadata={'source': 'notion'}), 0.0)]
```

```python
# delete the cluster
cluster.delete_cluster()
```
