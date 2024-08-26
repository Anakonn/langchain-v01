---
translated: true
---

# Pinecone

>[Pinecone](https://docs.pinecone.io/docs/overview) est une base de données vectorielle avec de larges fonctionnalités.

Ce notebook montre comment utiliser les fonctionnalités liées à la base de données vectorielle `Pinecone`.

Pour utiliser Pinecone, vous devez avoir une clé API.
Voici les [instructions d'installation](https://docs.pinecone.io/docs/quickstart).

Définissez les variables d'environnement suivantes pour faciliter l'utilisation de l'intégration `Pinecone` :

- `PINECONE_API_KEY` : Votre clé API Pinecone.
- `PINECONE_INDEX_NAME` : Le nom de l'index que vous voulez utiliser.

Et pour suivre ce document, vous devriez également définir

- `OPENAI_API_KEY` : Votre clé API OpenAI, pour utiliser `OpenAIEmbeddings`

```python
%pip install --upgrade --quiet  langchain-pinecone langchain-openai langchain
```

Note de migration : si vous migrez depuis l'implémentation `langchain_community.vectorstores` de Pinecone, vous devrez peut-être supprimer votre dépendance `pinecone-client` v2 avant d'installer `langchain-pinecone`, qui s'appuie sur `pinecone-client` v3.

Tout d'abord, divisons notre discours sur l'état de l'union en documents `docs` fragmentés.

```python
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

Supposons maintenant que votre index Pinecone soit configuré avec `dimension=1536`.

Nous pouvons nous connecter à notre index Pinecone et insérer ces documents fragmentés en tant que contenu avec `PineconeVectorStore.from_documents`.

```python
from langchain_pinecone import PineconeVectorStore

index_name = "langchain-test-index"

docsearch = PineconeVectorStore.from_documents(docs, embeddings, index_name=index_name)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

### Ajouter plus de texte à un index existant

Plus de texte peut être intégré et inséré dans un index Pinecone existant à l'aide de la fonction `add_texts`

```python
vectorstore = PineconeVectorStore(index_name=index_name, embedding=embeddings)

vectorstore.add_texts(["More text!"])
```

```output
['24631802-4bad-44a7-a4ba-fd71f00cc160']
```

### Recherches de pertinence marginale maximale

En plus d'utiliser la recherche de similarité dans l'objet de récupérateur, vous pouvez également utiliser `mmr` comme récupérateur.

```python
retriever = docsearch.as_retriever(search_type="mmr")
matched_docs = retriever.invoke(query)
for i, d in enumerate(matched_docs):
    print(f"\n## Document {i}\n")
    print(d.page_content)
```

```output

## Document 0

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

## Document 1

And I’m taking robust action to make sure the pain of our sanctions  is targeted at Russia’s economy. And I will use every tool at our disposal to protect American businesses and consumers.

Tonight, I can announce that the United States has worked with 30 other countries to release 60 Million barrels of oil from reserves around the world.

America will lead that effort, releasing 30 Million barrels from our own Strategic Petroleum Reserve. And we stand ready to do more if necessary, unified with our allies.

These steps will help blunt gas prices here at home. And I know the news about what’s happening can seem alarming.

But I want you to know that we are going to be okay.

When the history of this era is written Putin’s war on Ukraine will have left Russia weaker and the rest of the world stronger.

While it shouldn’t have taken something so terrible for people around the world to see what’s at stake now everyone sees it clearly.

## Document 2

We can’t change how divided we’ve been. But we can change how we move forward—on COVID-19 and other issues we must face together.

I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera.

They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun.

Officer Mora was 27 years old.

Officer Rivera was 22.

Both Dominican Americans who’d grown up on the same streets they later chose to patrol as police officers.

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves.

I’ve worked on these issues a long time.

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety.

## Document 3

One was stationed at bases and breathing in toxic smoke from “burn pits” that incinerated wastes of war—medical and hazard material, jet fuel, and more.

When they came home, many of the world’s fittest and best trained warriors were never the same.

Headaches. Numbness. Dizziness.

A cancer that would put them in a flag-draped coffin.

I know.

One of those soldiers was my son Major Beau Biden.

We don’t know for sure if a burn pit was the cause of his brain cancer, or the diseases of so many of our troops.

But I’m committed to finding out everything we can.

Committed to military families like Danielle Robinson from Ohio.

The widow of Sergeant First Class Heath Robinson.

He was born a soldier. Army National Guard. Combat medic in Kosovo and Iraq.

Stationed near Baghdad, just yards from burn pits the size of football fields.

Heath’s widow Danielle is here with us tonight. They loved going to Ohio State football games. He loved building Legos with their daughter.
```

Ou utilisez `max_marginal_relevance_search` directement :

```python
found_docs = docsearch.max_marginal_relevance_search(query, k=2, fetch_k=10)
for i, doc in enumerate(found_docs):
    print(f"{i + 1}.", doc.page_content, "\n")
```

```output
1. Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

2. We can’t change how divided we’ve been. But we can change how we move forward—on COVID-19 and other issues we must face together.

I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera.

They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun.

Officer Mora was 27 years old.

Officer Rivera was 22.

Both Dominican Americans who’d grown up on the same streets they later chose to patrol as police officers.

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves.

I’ve worked on these issues a long time.

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety.
```
