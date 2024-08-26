---
translated: true
---

# Faiss (Async)

>[Facebook AI Similarity Search (Faiss)](https://engineering.fb.com/2017/03/29/data-infrastructure/faiss-a-library-for-efficient-similarity-search/) est une bibliothèque pour la recherche de similarité et le clustering de vecteurs denses de manière efficace. Elle contient des algorithmes qui recherchent dans des ensembles de vecteurs de toute taille, jusqu'à ceux qui ne tiennent peut-être pas en mémoire vive. Elle contient également du code de support pour l'évaluation et le réglage des paramètres.

[Documentation Faiss](https://faiss.ai/).

Ce notebook montre comment utiliser les fonctionnalités liées à la base de données vectorielle `FAISS` en utilisant `asyncio`.
LangChain a implémenté les fonctions de stockage vectoriel synchrones et asynchrones.

Voir la version `synchrone` [ici](/docs/integrations/vectorstores/faiss).

```python
%pip install --upgrade --quiet  faiss-gpu # For CUDA 7.5+ Supported GPU's.
# OR
%pip install --upgrade --quiet  faiss-cpu # For CPU Installation
```

Nous voulons utiliser OpenAIEmbeddings, donc nous devons obtenir la clé API OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")

# Uncomment the following line if you need to initialize FAISS with no AVX2 optimization
# os.environ['FAISS_NO_AVX2'] = '1'

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../../extras/modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

db = await FAISS.afrom_documents(docs, embeddings)

query = "What did the president say about Ketanji Brown Jackson"
docs = await db.asimilarity_search(query)

print(docs[0].page_content)
```

## Recherche de similarité avec score

Il y a des méthodes spécifiques à FAISS. L'une d'entre elles est `similarity_search_with_score`, qui vous permet de renvoyer non seulement les documents, mais aussi le score de distance de la requête par rapport à eux. Le score de distance renvoyé est la distance L2. Par conséquent, un score plus faible est meilleur.

```python
docs_and_scores = await db.asimilarity_search_with_score(query)

docs_and_scores[0]
```

Il est également possible d'effectuer une recherche de documents similaires à un vecteur d'intégration donné à l'aide de `similarity_search_by_vector` qui accepte un vecteur d'intégration comme paramètre au lieu d'une chaîne.

```python
embedding_vector = await embeddings.aembed_query(query)
docs_and_scores = await db.asimilarity_search_by_vector(embedding_vector)
```

## Enregistrement et chargement

Vous pouvez également enregistrer et charger un index FAISS. Cela est utile pour ne pas avoir à le recréer à chaque fois que vous l'utilisez.

```python
db.save_local("faiss_index")

new_db = FAISS.load_local("faiss_index", embeddings, asynchronous=True)

docs = await new_db.asimilarity_search(query)

docs[0]
```

# Sérialisation et désérialisation en octets

Vous pouvez sérialiser l'index FAISS à l'aide de ces fonctions. Si vous utilisez un modèle d'intégration qui fait 90 Mo (sentence-transformers/all-MiniLM-L6-v2 ou tout autre modèle), la taille du fichier pickle résultant serait supérieure à 90 Mo. La taille du modèle est également incluse dans la taille globale. Pour surmonter cela, utilisez les fonctions ci-dessous. Ces fonctions ne sérialisent que l'index FAISS et la taille serait beaucoup plus faible. Cela peut être utile si vous souhaitez stocker l'index dans une base de données comme SQL.

```python
from langchain_community.embeddings.huggingface import HuggingFaceEmbeddings

pkl = db.serialize_to_bytes()  # serializes the faiss index
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
db = FAISS.deserialize_from_bytes(
    embeddings=embeddings, serialized=pkl, asynchronous=True
)  # Load the index
```

## Fusion

Vous pouvez également fusionner deux bases de données vectorielles FAISS

```python
db1 = await FAISS.afrom_texts(["foo"], embeddings)
db2 = await FAISS.afrom_texts(["bar"], embeddings)
```

```python
db1.docstore._dict
```

```output
{'8164a453-9643-4959-87f7-9ba79f9e8fb0': Document(page_content='foo')}
```

```python
db2.docstore._dict
```

```output
{'4fbcf8a2-e80f-4f65-9308-2f4cb27cb6e7': Document(page_content='bar')}
```

```python
db1.merge_from(db2)
```

```python
db1.docstore._dict
```

```output
{'8164a453-9643-4959-87f7-9ba79f9e8fb0': Document(page_content='foo'),
 '4fbcf8a2-e80f-4f65-9308-2f4cb27cb6e7': Document(page_content='bar')}
```

## Recherche de similarité avec filtrage

La base de données vectorielle FAISS peut également prendre en charge le filtrage, car FAISS ne prend pas nativement en charge le filtrage, nous devons le faire manuellement. Cela se fait en récupérant d'abord plus de résultats que `k`, puis en les filtrant. Vous pouvez filtrer les documents en fonction des métadonnées. Vous pouvez également définir le paramètre `fetch_k` lors de l'appel de n'importe quelle méthode de recherche pour définir le nombre de documents que vous voulez récupérer avant le filtrage. Voici un petit exemple :

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

Maintenant, nous faisons le même appel de requête, mais nous filtrons uniquement pour `page = 1`

```python
results_with_scores = await db.asimilarity_search_with_score("foo", filter=dict(page=1))
for doc, score in results_with_scores:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}, Score: {score}")
```

```output
Content: foo, Metadata: {'page': 1}, Score: 5.159960813797904e-15
Content: bar, Metadata: {'page': 1}, Score: 0.3131446838378906
```

La même chose peut être faite avec la méthode `max_marginal_relevance_search`.

```python
results = await db.amax_marginal_relevance_search("foo", filter=dict(page=1))
for doc in results:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}")
```

```output
Content: foo, Metadata: {'page': 1}
Content: bar, Metadata: {'page': 1}
```

Voici un exemple de la façon de définir le paramètre `fetch_k` lors de l'appel de `similarity_search`. Généralement, vous voudriez que le paramètre `fetch_k` >> paramètre `k`. C'est parce que le paramètre `fetch_k` est le nombre de documents qui seront récupérés avant le filtrage. Si vous définissez `fetch_k` sur une faible valeur, vous risquez de ne pas obtenir suffisamment de documents à filtrer.

```python
results = await db.asimilarity_search("foo", filter=dict(page=1), k=1, fetch_k=4)
for doc in results:
    print(f"Content: {doc.page_content}, Metadata: {doc.metadata}")
```

```output
Content: foo, Metadata: {'page': 1}
```

## Supprimer

Vous pouvez également supprimer des identifiants. Notez que les identifiants à supprimer doivent être les identifiants du docstore.

```python
db.delete([db.index_to_docstore_id[0]])
```

```output
True
```

```python
# Is now missing
0 in db.index_to_docstore_id
```

```output
False
```
