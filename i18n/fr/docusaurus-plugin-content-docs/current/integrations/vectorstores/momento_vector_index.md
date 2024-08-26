---
translated: true
---

# Momento Vector Index (MVI)

>[MVI](https://gomomento.com) : l'index vectoriel le plus productif et le plus facile à utiliser, sans serveur, pour vos données. Pour commencer avec MVI, il vous suffit de vous inscrire. Vous n'avez pas besoin de gérer l'infrastructure, de gérer des serveurs ou de vous soucier de la mise à l'échelle. MVI est un service qui se met automatiquement à l'échelle pour répondre à vos besoins.

Pour vous inscrire et accéder à MVI, visitez le [Momento Console](https://console.gomomento.com).

# Configuration

## Installer les prérequis

Vous aurez besoin :
- du package [`momento`](https://pypi.org/project/momento/) pour interagir avec MVI, et
- du package openai pour interagir avec l'API OpenAI.
- du package tiktoken pour tokeniser le texte.

```python
%pip install --upgrade --quiet  momento langchain-openai tiktoken
```

## Entrer les clés API

```python
import getpass
import os
```

### Momento : pour indexer les données

Visitez le [Momento Console](https://console.gomomento.com) pour obtenir votre clé API.

```python
os.environ["MOMENTO_API_KEY"] = getpass.getpass("Momento API Key:")
```

### OpenAI : pour les embeddings de texte

```python
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

# Charger vos données

Ici, nous utilisons le jeu de données d'exemple de Langchain, le discours sur l'état de l'Union.

Tout d'abord, nous chargeons les modules pertinents :

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import MomentoVectorIndex
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

Ensuite, nous chargeons les données :

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
len(documents)
```

```output
1
```

Notez que les données sont un seul grand fichier, donc il n'y a qu'un seul document :

```python
len(documents[0].page_content)
```

```output
38539
```

Comme il s'agit d'un seul grand fichier texte, nous le divisons en morceaux pour la réponse aux questions. Ainsi, les questions des utilisateurs seront répondues à partir du morceau le plus pertinent.

```python
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
len(docs)
```

```output
42
```

# Indexer vos données

Indexer vos données est aussi simple que d'instancier l'objet `MomentoVectorIndex`. Ici, nous utilisons l'assistant `from_documents` pour à la fois instancier et indexer les données :

```python
vector_db = MomentoVectorIndex.from_documents(
    docs, OpenAIEmbeddings(), index_name="sotu"
)
```

Cela se connecte au service Momento Vector Index en utilisant votre clé API et indexe les données. Si l'index n'existait pas auparavant, ce processus le crée pour vous. Les données sont maintenant consultables.

# Interroger vos données

## Poser une question directement contre l'index

Le moyen le plus direct de requêter les données est de rechercher dans l'index. Nous pouvons le faire comme suit en utilisant l'API `VectorStore` :

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
```

```python
docs[0].page_content
```

```output
'Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.'
```

Bien que cela contienne des informations pertinentes sur Ketanji Brown Jackson, nous n'avons pas de réponse concise et lisible par l'homme. Nous aborderons cela dans la prochaine section.

## Utiliser un LLM pour générer des réponses fluides

Avec les données indexées dans MVI, nous pouvons nous intégrer à n'importe quelle chaîne qui utilise la recherche de similarité vectorielle. Ici, nous utilisons la chaîne `RetrievalQA` pour démontrer comment répondre aux questions à partir des données indexées.

Tout d'abord, nous chargeons les modules pertinents :

```python
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI
```

Ensuite, nous instancions la chaîne de récupération QA :

```python
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
qa_chain = RetrievalQA.from_chain_type(llm, retriever=vector_db.as_retriever())
```

```python
qa_chain({"query": "What did the president say about Ketanji Brown Jackson?"})
```

```output
{'query': 'What did the president say about Ketanji Brown Jackson?',
 'result': "The President said that he nominated Circuit Court of Appeals Judge Ketanji Brown Jackson to serve on the United States Supreme Court. He described her as one of the nation's top legal minds and mentioned that she has received broad support from various groups, including the Fraternal Order of Police and former judges appointed by Democrats and Republicans."}
```

# Prochaines étapes

C'est tout ! Vous avez maintenant indexé vos données et pouvez les interroger à l'aide de Momento Vector Index. Vous pouvez utiliser le même index pour interroger vos données à partir de n'importe quelle chaîne qui prend en charge la recherche de similarité vectorielle.

Avec Momento, vous pouvez non seulement indexer vos données vectorielles, mais aussi mettre en cache vos appels d'API et stocker l'historique de vos conversations. Découvrez les autres intégrations Momento langchain pour en savoir plus.

Pour en savoir plus sur Momento Vector Index, visitez la [documentation Momento](https://docs.gomomento.com).
