---
translated: true
---

# Mise en cache

Les embeddings peuvent être stockés ou temporairement mis en cache pour éviter de devoir les recalculer.

La mise en cache des embeddings peut être effectuée à l'aide d'un `CacheBackedEmbeddings`. Le "cache backed embedder" est un wrapper autour d'un embedder qui met en cache les embeddings dans un magasin clé-valeur. Le texte est haché et le hachage est utilisé comme clé dans le cache.

Le principal moyen pris en charge pour initialiser un `CacheBackedEmbeddings` est `from_bytes_store`. Il prend les paramètres suivants :

- underlying_embedder : L'embedder à utiliser pour l'embedding.
- document_embedding_cache : Tout [`ByteStore`](/docs/integrations/stores/) pour la mise en cache des embeddings de document.
- batch_size : (optionnel, par défaut à `None`) Le nombre de documents à embedder entre les mises à jour du magasin.
- namespace : (optionnel, par défaut à `""`) L'espace de noms à utiliser pour le cache de document. Cet espace de noms est utilisé pour éviter les collisions avec d'autres caches. Par exemple, définissez-le sur le nom du modèle d'embedding utilisé.

**Attention** :

- Assurez-vous de définir le paramètre `namespace` pour éviter les collisions du même texte embedé à l'aide de différents modèles d'embeddings.
- Actuellement, `CacheBackedEmbeddings` ne met pas en cache les embeddings créés avec les méthodes `embed_query()` et `aembed_query()`.

```python
from langchain.embeddings import CacheBackedEmbeddings
```

## Utilisation avec un magasin de vecteurs

Tout d'abord, voyons un exemple qui utilise le système de fichiers local pour stocker les embeddings et utilise le magasin de vecteurs FAISS pour la récupération.

```python
%pip install --upgrade --quiet  langchain-openai faiss-cpu
```

```python
from langchain.storage import LocalFileStore
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

underlying_embeddings = OpenAIEmbeddings()

store = LocalFileStore("./cache/")

cached_embedder = CacheBackedEmbeddings.from_bytes_store(
    underlying_embeddings, store, namespace=underlying_embeddings.model
)
```

Le cache est vide avant l'embedding :

```python
list(store.yield_keys())
```

```output
[]
```

Chargez le document, divisez-le en morceaux, embedez chaque morceau et chargez-le dans le magasin de vecteurs.

```python
raw_documents = TextLoader("../../state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
documents = text_splitter.split_documents(raw_documents)
```

Créez le magasin de vecteurs :

```python
%%time
db = FAISS.from_documents(documents, cached_embedder)
```

```output
CPU times: user 218 ms, sys: 29.7 ms, total: 248 ms
Wall time: 1.02 s
```

Si nous essayons de créer le magasin de vecteurs à nouveau, ce sera beaucoup plus rapide car il n'aura pas besoin de recalculer les embeddings.

```python
%%time
db2 = FAISS.from_documents(documents, cached_embedder)
```

```output
CPU times: user 15.7 ms, sys: 2.22 ms, total: 18 ms
Wall time: 17.2 ms
```

Et voici quelques-uns des embeddings qui ont été créés :

```python
list(store.yield_keys())[:5]
```

```output
['text-embedding-ada-00217a6727d-8916-54eb-b196-ec9c9d6ca472',
 'text-embedding-ada-0025fc0d904-bd80-52da-95c9-441015bfb438',
 'text-embedding-ada-002e4ad20ef-dfaa-5916-9459-f90c6d8e8159',
 'text-embedding-ada-002ed199159-c1cd-5597-9757-f80498e8f17b',
 'text-embedding-ada-0021297d37a-2bc1-5e19-bf13-6c950f075062']
```

# Changer le `ByteStore`

Pour utiliser un `ByteStore` différent, il suffit de l'utiliser lors de la création de votre `CacheBackedEmbeddings`. Ci-dessous, nous créons un objet d'embeddings mis en cache équivalent, mais en utilisant le `InMemoryByteStore` non persistant à la place :

```python
from langchain.embeddings import CacheBackedEmbeddings
from langchain.storage import InMemoryByteStore

store = InMemoryByteStore()

cached_embedder = CacheBackedEmbeddings.from_bytes_store(
    underlying_embeddings, store, namespace=underlying_embeddings.model
)
```
