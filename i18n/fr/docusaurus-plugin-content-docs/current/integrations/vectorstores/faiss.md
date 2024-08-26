---
translated: true
---

# Faiss

>[Facebook AI Similarity Search (Faiss)](https://engineering.fb.com/2017/03/29/data-infrastructure/faiss-a-library-for-efficient-similarity-search/) est une bibliothèque pour la recherche de similarité et le clustering de vecteurs denses de manière efficace. Elle contient des algorithmes qui recherchent dans des ensembles de vecteurs de n'importe quelle taille, jusqu'à ceux qui ne tiennent peut-être pas en mémoire vive. Elle contient également du code d'assistance pour l'évaluation et le réglage des paramètres.

[Documentation Faiss](https://faiss.ai/).

Ce notebook montre comment utiliser les fonctionnalités liées à la base de données vectorielle `FAISS`. Il montrera les fonctionnalités spécifiques à cette intégration. Après l'avoir parcouru, il peut être utile d'explorer les [pages d'utilisation pertinentes](/docs/use_cases/question_answering) pour apprendre à utiliser cette banque de vecteurs dans le cadre d'une chaîne plus large.

## Configuration

L'intégration se trouve dans le package `langchain-community`. Nous devons également installer le package `faiss` lui-même. Nous utiliserons également OpenAI pour les embeddings, donc nous devons installer ces dépendances. Nous pouvons les installer avec :

```bash
pip install -U langchain-community faiss-cpu langchain-openai tiktoken
```

Notez que vous pouvez également installer `faiss-gpu` si vous voulez utiliser la version activée par GPU.

Comme nous utilisons OpenAI, vous aurez besoin d'une clé API OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()
```

Il est également utile (mais pas nécessaire) de configurer [LangSmith](https://smith.langchain.com/) pour une observabilité de premier ordre.

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Ingestion

Ici, nous ingérons des documents dans la banque de vecteurs.

```python
# Uncomment the following line if you need to initialize FAISS with no AVX2 optimization
# os.environ['FAISS_NO_AVX2'] = '1'

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(docs, embeddings)
print(db.index.ntotal)
```

```output
42
```

## Interrogation

Maintenant, nous pouvons interroger la banque de vecteurs. Il existe plusieurs méthodes pour le faire. La plus standard est d'utiliser `similarity_search`.

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## En tant que Retriever

Nous pouvons également convertir la banque de vecteurs en une classe [Retriever](/docs/modules/data_connection/retrievers). Cela nous permet de l'utiliser facilement dans d'autres méthodes LangChain, qui fonctionnent principalement avec des retrievers.

```python
retriever = db.as_retriever()
docs = retriever.invoke(query)
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## Recherche de similarité avec score

Il existe des méthodes spécifiques à FAISS. L'une d'entre elles est `similarity_search_with_score`, qui vous permet de renvoyer non seulement les documents, mais aussi le score de distance de la requête par rapport à eux. Le score de distance renvoyé est la distance L2. Par conséquent, un score plus faible est meilleur.

```python
docs_and_scores = db.similarity_search_with_score(query)
```

```python
docs_and_scores[0]
```

```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt'}),
 0.36913747)
```

Il est également possible de faire une recherche de documents similaires à un vecteur d'embeddings donné en utilisant `similarity_search_by_vector`, qui accepte un vecteur d'embeddings comme paramètre au lieu d'une chaîne de caractères.

```python
embedding_vector = embeddings.embed_query(query)
docs_and_scores = db.similarity_search_by_vector(embedding_vector)
```

## Sauvegarde et chargement

Vous pouvez également enregistrer et charger un index FAISS. Cela est utile pour ne pas avoir à le recréer à chaque fois que vous l'utilisez.

```python
db.save_local("faiss_index")

new_db = FAISS.load_local("faiss_index", embeddings)

docs = new_db.similarity_search(query)
```

```python
docs[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../state_of_the_union.txt'})
```

# Sérialisation et désérialisation en octets

Vous pouvez sérialiser l'index FAISS à l'aide de ces fonctions. Si vous utilisez un modèle d'embeddings de 90 Mo (sentence-transformers/all-MiniLM-L6-v2 ou tout autre modèle), la taille du fichier pickle résultant serait supérieure à 90 Mo. La taille du modèle est également incluse dans la taille globale. Pour surmonter cela, utilisez les fonctions ci-dessous. Ces fonctions ne sérialisent que l'index FAISS et la taille serait beaucoup plus faible. Cela peut être utile si vous souhaitez stocker l'index dans une base de données comme SQL.

```python
from langchain_community.embeddings.huggingface import HuggingFaceEmbeddings

pkl = db.serialize_to_bytes()  # serializes the faiss
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

db = FAISS.deserialize_from_bytes(
    embeddings=embeddings, serialized=pkl
)  # Load the index
```

## Fusion

Vous pouvez également fusionner deux banques de vecteurs FAISS.

```python
db1 = FAISS.from_texts(["foo"], embeddings)
db2 = FAISS.from_texts(["bar"], embeddings)

db1.docstore._dict
```

```python
db2.docstore._dict
```

```output
{'807e0c63-13f6-4070-9774-5c6f0fbb9866': Document(page_content='bar', metadata={})}
```

```python
db1.merge_from(db2)
```

```python
db1.docstore._dict
```

```output
{'068c473b-d420-487a-806b-fb0ccea7f711': Document(page_content='foo', metadata={}),
 '807e0c63-13f6-4070-9774-5c6f0fbb9866': Document(page_content='bar', metadata={})}
```

## Recherche de similarité avec filtrage

La banque de vecteurs FAISS peut également prendre en charge le filtrage, car FAISS ne prend pas nativement en charge le filtrage. Nous devons donc le faire manuellement. Cela se fait en récupérant d'abord plus de résultats que `k`, puis en les filtrant. Ce filtre est soit une fonction de rappel qui prend en entrée un dictionnaire de métadonnées et renvoie un booléen, soit un dictionnaire de métadonnées où chaque clé manquante est ignorée et chaque clé présente doit se trouver dans une liste de valeurs. Vous pouvez également définir le paramètre `fetch_k` lors de l'appel de n'importe quelle méthode de recherche pour définir le nombre de documents que vous voulez récupérer avant le filtrage. Voici un petit exemple :

```python
from langchain_core.documents import Document

list_of_documents = [
    Document(page_content="foo", metadata=dict(page=1)),
    Document(page_content="bar", metadata=dict(page=1)),
    Document(page_content="foo", metadata=dict(page=2)),
    Document(page_content="barbar", metadata=dict(page=2)),
    Document(page_content="foo", metadata=dict(page=3)),
    Document(page_content="bar burr", metadata=dict(page=3)),
    Document(page_content="foo", metadata=dict(page=4)),
    Document(page_content="bar bruh", metadata=dict(page=4)),
]
db = FAISS.from_documents(list_of_documents, embeddings)
results_with_scores = db.similarity_search_with_score("foo")
for doc, score in results_with_scores:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}, Score: {score}")
```

```output
Content: foo, Metadata: {'page': 1}, Score: 5.159960813797904e-15
Content: foo, Metadata: {'page': 2}, Score: 5.159960813797904e-15
Content: foo, Metadata: {'page': 3}, Score: 5.159960813797904e-15
Content: foo, Metadata: {'page': 4}, Score: 5.159960813797904e-15
```

Maintenant, nous faisons le même appel de requête, mais nous filtrons uniquement pour `page = 1`.

```python
results_with_scores = db.similarity_search_with_score("foo", filter=dict(page=1))
# Or with a callable:
# results_with_scores = db.similarity_search_with_score("foo", filter=lambda d: d["page"] == 1)
for doc, score in results_with_scores:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}, Score: {score}")
```

```output
Content: foo, Metadata: {'page': 1}, Score: 5.159960813797904e-15
Content: bar, Metadata: {'page': 1}, Score: 0.3131446838378906
```

La même chose peut être faite avec la méthode `max_marginal_relevance_search`.

```python
results = db.max_marginal_relevance_search("foo", filter=dict(page=1))
for doc in results:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}")
```

```output
Content: foo, Metadata: {'page': 1}
Content: bar, Metadata: {'page': 1}
```

Voici un exemple de la façon de définir le paramètre `fetch_k` lors de l'appel de `similarity_search`. Généralement, vous voudriez que le paramètre `fetch_k` soit >> `k`. Cela est dû au fait que le paramètre `fetch_k` est le nombre de documents qui seront récupérés avant le filtrage. Si vous définissez `fetch_k` sur une valeur faible, vous risquez de ne pas obtenir suffisamment de documents à filtrer.

```python
results = db.similarity_search("foo", filter=dict(page=1), k=1, fetch_k=4)
for doc in results:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}")
```

```output
Content: foo, Metadata: {'page': 1}
```

## Suppression

Vous pouvez également supprimer des enregistrements de la banque de vecteurs. Dans l'exemple ci-dessous, `db.index_to_docstore_id` représente un dictionnaire avec les éléments de l'index FAISS.

```python
print("count before:", db.index.ntotal)
db.delete([db.index_to_docstore_id[0]])
print("count after:", db.index.ntotal)
```

```output
count before: 8
count after: 7
```
