---
translated: true
---

# Récupérateur de documents parents

Lors de la division des documents pour la récupération, il y a souvent des désirs contradictoires :

1. Vous pouvez vouloir avoir de petits documents, afin que leurs intégrations puissent refléter le plus précisément possible leur sens. S'ils sont trop longs, alors les intégrations peuvent perdre leur sens.
2. Vous voulez avoir des documents suffisamment longs pour que le contexte de chaque fragment soit conservé.

Le `ParentDocumentRetriever` trouve cet équilibre en divisant et en stockant de petits fragments de données. Lors de la récupération, il récupère d'abord les petits fragments, puis recherche les identifiants parents de ces fragments et renvoie ces documents plus volumineux.

Notez que "document parent" fait référence au document dont un petit fragment est issu. Cela peut être soit le document brut dans son intégralité, soit un fragment plus important.

```python
from langchain.retrievers import ParentDocumentRetriever
```

```python
from langchain.storage import InMemoryStore
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
loaders = [
    TextLoader("../../paul_graham_essay.txt"),
    TextLoader("../../state_of_the_union.txt"),
]
docs = []
for loader in loaders:
    docs.extend(loader.load())
```

## Récupération de documents complets

Dans ce mode, nous voulons récupérer les documents complets. Par conséquent, nous ne spécifions qu'un diviseur d'enfants.

```python
# This text splitter is used to create the child documents
child_splitter = RecursiveCharacterTextSplitter(chunk_size=400)
# The vectorstore to use to index the child chunks
vectorstore = Chroma(
    collection_name="full_documents", embedding_function=OpenAIEmbeddings()
)
# The storage layer for the parent documents
store = InMemoryStore()
retriever = ParentDocumentRetriever(
    vectorstore=vectorstore,
    docstore=store,
    child_splitter=child_splitter,
)
```

```python
retriever.add_documents(docs, ids=None)
```

Cela devrait donner deux clés, car nous avons ajouté deux documents.

```python
list(store.yield_keys())
```

```output
['cfdf4af7-51f2-4ea3-8166-5be208efa040',
 'bf213c21-cc66-4208-8a72-733d030187e6']
```

Appelons maintenant les fonctionnalités de recherche du magasin de vecteurs - nous devrions voir qu'il renvoie de petits fragments (puisque nous stockons les petits fragments).

```python
sub_docs = vectorstore.similarity_search("justice breyer")
```

```python
print(sub_docs[0].page_content)
```

```output
Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.
```

Récupérons maintenant à partir du récupérateur global. Cela devrait renvoyer de gros documents - puisqu'il renvoie les documents où se trouvent les plus petits fragments.

```python
retrieved_docs = retriever.invoke("justice breyer")
```

```python
len(retrieved_docs[0].page_content)
```

```output
38540
```

## Récupération de fragments plus importants

Parfois, les documents complets peuvent être trop volumineux pour vouloir les récupérer tels quels. Dans ce cas, ce que nous voulons vraiment faire est de d'abord diviser les documents bruts en fragments plus importants, puis de les diviser en plus petits fragments. Nous indexons ensuite les plus petits fragments, mais lors de la récupération, nous récupérons les fragments plus importants (mais toujours pas les documents complets).

```python
# This text splitter is used to create the parent documents
parent_splitter = RecursiveCharacterTextSplitter(chunk_size=2000)
# This text splitter is used to create the child documents
# It should create documents smaller than the parent
child_splitter = RecursiveCharacterTextSplitter(chunk_size=400)
# The vectorstore to use to index the child chunks
vectorstore = Chroma(
    collection_name="split_parents", embedding_function=OpenAIEmbeddings()
)
# The storage layer for the parent documents
store = InMemoryStore()
```

```python
retriever = ParentDocumentRetriever(
    vectorstore=vectorstore,
    docstore=store,
    child_splitter=child_splitter,
    parent_splitter=parent_splitter,
)
```

```python
retriever.add_documents(docs)
```

Nous pouvons voir qu'il y a beaucoup plus de deux documents maintenant - ce sont les fragments plus importants.

```python
len(list(store.yield_keys()))
```

```output
66
```

Assurons-nous que le magasin de vecteurs sous-jacent récupère toujours les petits fragments.

```python
sub_docs = vectorstore.similarity_search("justice breyer")
```

```python
print(sub_docs[0].page_content)
```

```output
Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.
```

```python
retrieved_docs = retriever.invoke("justice breyer")
```

```python
len(retrieved_docs[0].page_content)
```

```output
1849
```

```python
print(retrieved_docs[0].page_content)
```

```output
In state after state, new laws have been passed, not only to suppress the vote, but to subvert entire elections.

We cannot let this happen.

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
```
