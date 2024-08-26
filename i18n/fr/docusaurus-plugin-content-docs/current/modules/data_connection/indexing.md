---
translated: true
---

# Indexation

Ici, nous allons examiner un workflow d'indexation de base à l'aide de l'API d'indexation LangChain.

L'API d'indexation vous permet de charger et de garder synchronisés des documents provenant de n'importe quelle source dans un magasin de vecteurs. Plus précisément, elle aide à :

* Éviter d'écrire du contenu dupliqué dans le magasin de vecteurs
* Éviter de réécrire le contenu inchangé
* Éviter de recalculer les embeddings sur le contenu inchangé

Tout cela devrait vous faire gagner du temps et de l'argent, ainsi qu'améliorer les résultats de votre recherche vectorielle.

Fait crucial, l'API d'indexation fonctionnera même avec des documents qui ont subi plusieurs étapes de transformation (par exemple, via le découpage de texte) par rapport aux documents sources d'origine.

## Comment ça fonctionne

L'indexation LangChain utilise un gestionnaire d'enregistrements (`RecordManager`) qui garde une trace des écritures de documents dans le magasin de vecteurs.

Lors de l'indexation du contenu, des hachages sont calculés pour chaque document, et les informations suivantes sont stockées dans le gestionnaire d'enregistrements :

- le hachage du document (hachage du contenu de la page et des métadonnées)
- l'heure d'écriture
- l'identifiant de la source - chaque document doit inclure des informations dans ses métadonnées pour nous permettre de déterminer la source finale de ce document

## Modes de suppression

Lors de l'indexation de documents dans un magasin de vecteurs, il est possible que certains documents existants dans le magasin de vecteurs doivent être supprimés. Dans certaines situations, vous souhaiterez peut-être supprimer tous les documents existants dérivés des mêmes sources que les nouveaux documents en cours d'indexation. Dans d'autres cas, vous souhaiterez peut-être supprimer tous les documents existants de manière globale. Les modes de suppression de l'API d'indexation vous permettent de choisir le comportement que vous souhaitez :

| Mode de nettoyage | Déduplique le contenu | Parallélisable | Nettoie les documents sources supprimés | Nettoie les mutations des documents sources et/ou dérivés | Moment du nettoyage |
|------------------|----------------------|----------------|---------------------------------------|----------------------------------------------------------|---------------------|
| Aucun            | ✅                   | ✅             | ❌                                    | ❌                                                      | -                   |
| Incrémentiel     | ✅                   | ✅             | ❌                                    | ✅                                                      | En continu          |
| Complet          | ✅                   | ❌             | ✅                                    | ✅                                                      | À la fin de l'indexation |

`Aucun` ne fait aucun nettoyage automatique, permettant à l'utilisateur de faire manuellement le nettoyage du contenu obsolète.

`Incrémentiel` et `Complet` offrent le nettoyage automatisé suivant :

* Si le contenu du document source ou des documents dérivés a **changé**, les modes `Incrémentiel` ou `Complet` nettoieront (supprimeront) les versions précédentes du contenu.
* Si le document source a été **supprimé** (ce qui signifie qu'il n'est pas inclus dans les documents actuellement indexés), le mode de nettoyage `Complet` le supprimera correctement du magasin de vecteurs, mais le mode `Incrémentiel` ne le fera pas.

Lorsque le contenu est modifié (par exemple, le fichier PDF source a été révisé), il y aura une période de temps pendant l'indexation où les nouvelles et les anciennes versions peuvent être renvoyées à l'utilisateur. Cela se produit après que le nouveau contenu ait été écrit, mais avant que l'ancienne version ne soit supprimée.

* L'indexation `Incrémentiel` minimise cette période de temps car elle peut effectuer le nettoyage de manière continue, au fur et à mesure des écritures.
* Le mode `Complet` effectue le nettoyage après que tous les lots aient été écrits.

## Exigences

1. Ne pas utiliser avec un magasin qui a été pré-rempli avec du contenu indépendamment de l'API d'indexation, car le gestionnaire d'enregistrements ne saura pas que des enregistrements ont été insérés précédemment.
2. Fonctionne uniquement avec les `vectorstore` de LangChain qui prennent en charge :
   * l'ajout de documents par identifiant (`add_documents` avec l'argument `ids`)
   * la suppression par identifiant (`delete` avec l'argument `ids`)

Magasins de vecteurs compatibles : `AnalyticDB`, `AstraDB`, `AzureCosmosDBVectorSearch`, `AzureSearch`, `AwaDB`, `Bagel`, `Cassandra`, `Chroma`, `CouchbaseVectorStore`, `DashVector`, `DatabricksVectorSearch`, `DeepLake`, `Dingo`, `ElasticVectorSearch`, `ElasticsearchStore`, `FAISS`, `HanaDB`, `LanceDB`, `Milvus`, `MyScale`, `OpenSearchVectorSearch`, `PGVector`, `Pinecone`, `Qdrant`, `Redis`, `Rockset`, `ScaNN`, `SupabaseVectorStore`, `SurrealDBStore`, `TimescaleVector`, `UpstashVectorStore`, `Vald`, `VDMS`, `Vearch`, `VespaStore`, `Weaviate`, `ZepVectorStore`, `TencentVectorDB`, `OpenSearchVectorSearch`, `Yellowbrick`.

## Mise en garde

Le gestionnaire d'enregistrements s'appuie sur un mécanisme basé sur l'heure pour déterminer quel contenu peut être nettoyé (lors de l'utilisation des modes de nettoyage `Complet` ou `Incrémentiel`).

Si deux tâches s'exécutent l'une après l'autre, et que la première tâche se termine avant que l'heure de l'horloge ne change, alors la deuxième tâche peut ne pas être en mesure de nettoyer le contenu.

Cela est peu susceptible de poser un problème dans des paramètres réels pour les raisons suivantes :

1. Le RecordManager utilise des horodatages à plus haute résolution.
2. Les données devraient changer entre l'exécution de la première et de la deuxième tâche, ce qui devient peu probable si l'intervalle de temps entre les tâches est court.
3. Les tâches d'indexation prennent généralement plus de quelques millisecondes.

## Démarrage rapide

```python
from langchain.indexes import SQLRecordManager, index
from langchain_core.documents import Document
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings
```

Initialisez un magasin de vecteurs et configurez les embeddings :

```python
collection_name = "test_index"

embedding = OpenAIEmbeddings()

vectorstore = ElasticsearchStore(
    es_url="http://localhost:9200", index_name="test_index", embedding=embedding
)
```

Initialisez un gestionnaire d'enregistrements avec un espace de noms approprié.

**Suggestion :** Utilisez un espace de noms qui tienne compte à la fois du magasin de vecteurs et du nom de la collection dans le magasin de vecteurs ; par exemple, 'redis/mes_docs', 'chromadb/mes_docs' ou 'postgres/mes_docs'.

```python
namespace = f"elasticsearch/{collection_name}"
record_manager = SQLRecordManager(
    namespace, db_url="sqlite:///record_manager_cache.sql"
)
```

Créez un schéma avant d'utiliser le gestionnaire d'enregistrements.

```python
record_manager.create_schema()
```

Indexons quelques documents de test :

```python
doc1 = Document(page_content="kitty", metadata={"source": "kitty.txt"})
doc2 = Document(page_content="doggy", metadata={"source": "doggy.txt"})
```

Indexation dans un magasin de vecteurs vide :

```python
def _clear():
    """Hacky helper method to clear content. See the `full` mode section to to understand why it works."""
    index([], record_manager, vectorstore, cleanup="full", source_id_key="source")
```

### Mode de suppression ``None``

Ce mode ne fait pas de nettoyage automatique des anciennes versions du contenu ; cependant, il s'occupe toujours de la dédoublication du contenu.

```python
_clear()
```

```python
index(
    [doc1, doc1, doc1, doc1, doc1],
    record_manager,
    vectorstore,
    cleanup=None,
    source_id_key="source",
)
```

```output
{'num_added': 1, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

```python
_clear()
```

```python
index([doc1, doc2], record_manager, vectorstore, cleanup=None, source_id_key="source")
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

La deuxième fois, tout le contenu sera ignoré :

```python
index([doc1, doc2], record_manager, vectorstore, cleanup=None, source_id_key="source")
```

```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 2, 'num_deleted': 0}
```

### Mode de suppression ``"incremental"``

```python
_clear()
```

```python
index(
    [doc1, doc2],
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

Une nouvelle indexation devrait entraîner le **saut** des deux documents - en sautant également l'opération d'embedding !

```python
index(
    [doc1, doc2],
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 2, 'num_deleted': 0}
```

Si nous ne fournissons pas de documents en mode d'indexation incrémentielle, rien ne changera.

```python
index([], record_manager, vectorstore, cleanup="incremental", source_id_key="source")
```

```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

Si nous modifions un document, la nouvelle version sera écrite et toutes les anciennes versions partageant la même source seront supprimées.

```python
changed_doc_2 = Document(page_content="puppy", metadata={"source": "doggy.txt"})
```

```python
index(
    [changed_doc_2],
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 1, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 1}
```

### Mode de suppression ``"full"``

En mode `full`, l'utilisateur doit passer l'univers `full` du contenu qui doit être indexé dans la fonction d'indexation.

Tous les documents qui ne sont pas passés dans la fonction d'indexation et qui sont présents dans le magasin de vecteurs seront supprimés !

Ce comportement est utile pour gérer les suppressions de documents sources.

```python
_clear()
```

```python
all_docs = [doc1, doc2]
```

```python
index(all_docs, record_manager, vectorstore, cleanup="full", source_id_key="source")
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

Supposons que quelqu'un ait supprimé le premier doc :

```python
del all_docs[0]
```

```python
all_docs
```

```output
[Document(page_content='doggy', metadata={'source': 'doggy.txt'})]
```

L'utilisation du mode full nettoiera également le contenu supprimé.

```python
index(all_docs, record_manager, vectorstore, cleanup="full", source_id_key="source")
```

```output
{'num_added': 0, 'num_updated': 0, 'num_skipped': 1, 'num_deleted': 1}
```

## Source

L'attribut de métadonnées contient un champ appelé `source`. Cette source doit pointer vers la provenance *ultime* associée au document donné.

Par exemple, si ces documents représentent des morceaux d'un document parent, le `source` pour les deux documents doit être le même et faire référence au document parent.

En général, `source` doit toujours être spécifié. N'utilisez un `None` que si vous **n'avez** jamais l'intention d'utiliser le mode `incremental`, et pour une raison quelconque, vous ne pouvez pas spécifier correctement le champ `source`.

```python
from langchain_text_splitters import CharacterTextSplitter
```

```python
doc1 = Document(
    page_content="kitty kitty kitty kitty kitty", metadata={"source": "kitty.txt"}
)
doc2 = Document(page_content="doggy doggy the doggy", metadata={"source": "doggy.txt"})
```

```python
new_docs = CharacterTextSplitter(
    separator="t", keep_separator=True, chunk_size=12, chunk_overlap=2
).split_documents([doc1, doc2])
new_docs
```

```output
[Document(page_content='kitty kit', metadata={'source': 'kitty.txt'}),
 Document(page_content='tty kitty ki', metadata={'source': 'kitty.txt'}),
 Document(page_content='tty kitty', metadata={'source': 'kitty.txt'}),
 Document(page_content='doggy doggy', metadata={'source': 'doggy.txt'}),
 Document(page_content='the doggy', metadata={'source': 'doggy.txt'})]
```

```python
_clear()
```

```python
index(
    new_docs,
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 5, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

```python
changed_doggy_docs = [
    Document(page_content="woof woof", metadata={"source": "doggy.txt"}),
    Document(page_content="woof woof woof", metadata={"source": "doggy.txt"}),
]
```

Cela devrait supprimer les anciennes versions des documents associés à la source `doggy.txt` et les remplacer par les nouvelles versions.

```python
index(
    changed_doggy_docs,
    record_manager,
    vectorstore,
    cleanup="incremental",
    source_id_key="source",
)
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 2}
```

```python
vectorstore.similarity_search("dog", k=30)
```

```output
[Document(page_content='woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='woof woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='tty kitty', metadata={'source': 'kitty.txt'}),
 Document(page_content='tty kitty ki', metadata={'source': 'kitty.txt'}),
 Document(page_content='kitty kit', metadata={'source': 'kitty.txt'})]
```

## Utilisation avec les chargeurs

L'indexation peut accepter soit un itérable de documents, soit n'importe quel chargeur.

**Attention :** Le chargeur **doit** définir correctement les clés de source.

```python
from langchain_community.document_loaders.base import BaseLoader


class MyCustomLoader(BaseLoader):
    def lazy_load(self):
        text_splitter = CharacterTextSplitter(
            separator="t", keep_separator=True, chunk_size=12, chunk_overlap=2
        )
        docs = [
            Document(page_content="woof woof", metadata={"source": "doggy.txt"}),
            Document(page_content="woof woof woof", metadata={"source": "doggy.txt"}),
        ]
        yield from text_splitter.split_documents(docs)

    def load(self):
        return list(self.lazy_load())
```

```python
_clear()
```

```python
loader = MyCustomLoader()
```

```python
loader.load()
```

```output
[Document(page_content='woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='woof woof woof', metadata={'source': 'doggy.txt'})]
```

```python
index(loader, record_manager, vectorstore, cleanup="full", source_id_key="source")
```

```output
{'num_added': 2, 'num_updated': 0, 'num_skipped': 0, 'num_deleted': 0}
```

```python
vectorstore.similarity_search("dog", k=30)
```

```output
[Document(page_content='woof woof', metadata={'source': 'doggy.txt'}),
 Document(page_content='woof woof woof', metadata={'source': 'doggy.txt'})]
```
