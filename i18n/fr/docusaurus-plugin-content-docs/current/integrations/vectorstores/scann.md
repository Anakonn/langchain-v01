---
translated: true
---

# ScaNN

ScaNN (Scalable Nearest Neighbors) est une méthode pour la recherche d'informations similaires à grande échelle de manière efficace.

ScaNN inclut l'élagage de l'espace de recherche et la quantification pour la recherche du produit intérieur maximal et prend également en charge d'autres fonctions de distance telles que la distance euclidienne. L'implémentation est optimisée pour les processeurs x86 avec prise en charge d'AVX2. Voir son [dépôt GitHub Google Research](https://github.com/google-research/google-research/tree/master/scann) pour plus de détails.

## Installation

Installez ScaNN via pip. Vous pouvez également suivre les instructions sur le [site Web de ScaNN](https://github.com/google-research/google-research/tree/master/scann#building-from-source) pour l'installer à partir de la source.

```python
%pip install --upgrade --quiet  scann
```

## Démonstration de récupération

Ci-dessous, nous montrons comment utiliser ScaNN conjointement avec les embeddings Huggingface.

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import ScaNN
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)


embeddings = HuggingFaceEmbeddings()

db = ScaNN.from_documents(docs, embeddings)
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)

docs[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': 'state_of_the_union.txt'})
```

## Démonstration de RetrievalQA

Ensuite, nous démontrons l'utilisation de ScaNN conjointement avec l'API Google PaLM.

Vous pouvez obtenir une clé d'API à partir de https://developers.generativeai.google/tutorials/setup

```python
from langchain.chains import RetrievalQA
from langchain_community.chat_models import google_palm

palm_client = google_palm.ChatGooglePalm(google_api_key="YOUR_GOOGLE_PALM_API_KEY")

qa = RetrievalQA.from_chain_type(
    llm=palm_client,
    chain_type="stuff",
    retriever=db.as_retriever(search_kwargs={"k": 10}),
)
```

```python
print(qa.run("What did the president say about Ketanji Brown Jackson?"))
```

```output
The president said that Ketanji Brown Jackson is one of our nation's top legal minds, who will continue Justice Breyer's legacy of excellence.
```

```python
print(qa.run("What did the president say about Michael Phelps?"))
```

```output
The president did not mention Michael Phelps in his speech.
```

## Enregistrer et charger l'index de récupération local

```python
db.save_local("/tmp/db", "state_of_union")
restored_db = ScaNN.load_local("/tmp/db", embeddings, index_name="state_of_union")
```
