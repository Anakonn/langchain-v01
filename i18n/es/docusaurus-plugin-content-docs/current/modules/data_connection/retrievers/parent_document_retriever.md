---
translated: true
---

# Recuperador de documentos principales

Al dividir documentos para su recuperación, a menudo hay deseos conflictivos:

1. Es posible que desee tener documentos pequeños, para que sus incrustaciones puedan reflejar con mayor precisión su significado. Si son demasiado largos, entonces las incrustaciones pueden perder significado.
2. Desea tener documentos lo suficientemente largos como para que se conserve el contexto de cada fragmento.

El `ParentDocumentRetriever` equilibra esto dividiendo y almacenando fragmentos pequeños de datos. Durante la recuperación, primero recupera los fragmentos pequeños, pero luego busca los identificadores principales de esos fragmentos y devuelve esos documentos más grandes.

Tenga en cuenta que "documento principal" se refiere al documento del que se originó un fragmento pequeño. Esto puede ser el documento bruto completo O un fragmento más grande.

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

## Recuperar documentos completos

En este modo, queremos recuperar los documentos completos. Por lo tanto, solo especificamos un divisor de elementos secundarios.

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

Esto debería generar dos claves, porque agregamos dos documentos.

```python
list(store.yield_keys())
```

```output
['cfdf4af7-51f2-4ea3-8166-5be208efa040',
 'bf213c21-cc66-4208-8a72-733d030187e6']
```

Ahora llamemos a la funcionalidad de búsqueda de la tienda de vectores: deberíamos ver que devuelve fragmentos pequeños (ya que estamos almacenando los fragmentos pequeños).

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

Ahora recuperemos del recuperador general. Esto debería devolver documentos grandes, ya que devuelve los documentos donde se ubican los fragmentos más pequeños.

```python
retrieved_docs = retriever.invoke("justice breyer")
```

```python
len(retrieved_docs[0].page_content)
```

```output
38540
```

## Recuperar fragmentos más grandes

A veces, los documentos completos pueden ser demasiado grandes como para querer recuperarlos tal cual. En ese caso, lo que realmente queremos hacer es primero dividir los documentos brutos en fragmentos más grandes y luego dividirlos en fragmentos más pequeños. Luego indexamos los fragmentos más pequeños, pero en la recuperación recuperamos los fragmentos más grandes (pero aún no los documentos completos).

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

Podemos ver que hay mucho más de dos documentos ahora: estos son los fragmentos más grandes.

```python
len(list(store.yield_keys()))
```

```output
66
```

Asegurémonos de que la tienda de vectores subyacente aún recupere los fragmentos pequeños.

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
