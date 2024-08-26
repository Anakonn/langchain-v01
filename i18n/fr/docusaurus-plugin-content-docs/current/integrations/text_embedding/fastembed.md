---
translated: true
---

# FastEmbed par Qdrant

>[FastEmbed](https://qdrant.github.io/fastembed/) de [Qdrant](https://qdrant.tech) est une bibliothèque Python légère, rapide, conçue pour la génération d'embeddings.
>
>- Poids de modèle quantifiés
>- ONNX Runtime, aucune dépendance PyTorch
>- Conception axée sur le CPU
>- Parallélisme des données pour le codage de grands ensembles de données.

## Dépendances

Pour utiliser FastEmbed avec LangChain, installez le package Python `fastembed`.

```python
%pip install --upgrade --quiet  fastembed
```

## Imports

```python
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
```

## Instanciation de FastEmbed

### Paramètres

- `model_name: str` (par défaut : "BAAI/bge-small-en-v1.5")
    > Nom du modèle FastEmbedding à utiliser. Vous pouvez trouver la liste des modèles pris en charge [ici](https://qdrant.github.io/fastembed/examples/Supported_Models/).

- `max_length: int` (par défaut : 512)
    > Le nombre maximum de jetons. Comportement inconnu pour les valeurs > 512.

- `cache_dir: Optional[str]`
    > Le chemin du répertoire de cache. Par défaut, il s'agit de `local_cache` dans le répertoire parent.

- `threads: Optional[int]`
    > Le nombre de threads qu'une session onnxruntime unique peut utiliser. Par défaut, il est défini sur None.

- `doc_embed_type: Literal["default", "passage"]` (par défaut : "default")
    > "default" : Utilise la méthode d'embedding par défaut de FastEmbed.

    > "passage" : Préfixe le texte avec "passage" avant l'embedding.

```python
embeddings = FastEmbedEmbeddings()
```

## Utilisation

### Génération d'embeddings de documents

```python
document_embeddings = embeddings.embed_documents(
    ["This is a document", "This is some other document"]
)
```

### Génération d'embeddings de requêtes

```python
query_embeddings = embeddings.embed_query("This is a query")
```
