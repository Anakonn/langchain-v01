---
translated: true
---

# Représentations d'Embeddings de Phrases Multilingues LASER par Meta AI

>[LASER](https://github.com/facebookresearch/LASER/) est une bibliothèque Python développée par l'équipe de recherche de Meta AI et utilisée pour créer des embeddings de phrases multilingues pour plus de 147 langues à partir du 25/02/2024.
>- Liste des langues prises en charge sur https://github.com/facebookresearch/flores/blob/main/flores200/README.md#languages-in-flores-200

## Dépendances

Pour utiliser LaserEmbed avec LangChain, installez le package Python `laser_encoders`.

```python
%pip install laser_encoders
```

## Imports

```python
from langchain_community.embeddings.laser import LaserEmbeddings
```

## Instanciation de Laser

### Paramètres

- `lang: Optional[str]`
    >S'il est vide, il utilisera par défaut un modèle d'encodeur LASER multilingue (appelé "laser2").
    Vous pouvez trouver la liste des langues et des codes de langue pris en charge [ici](https://github.com/facebookresearch/flores/blob/main/flores200/README.md#languages-in-flores-200)
    et [ici](https://github.com/facebookresearch/LASER/blob/main/laser_encoders/language_list.py)
.

```python
# Ex Instantiationz
embeddings = LaserEmbeddings(lang="eng_Latn")
```

## Utilisation

### Génération d'embeddings de documents

```python
document_embeddings = embeddings.embed_documents(
    ["This is a sentence", "This is some other sentence"]
)
```

### Génération d'embeddings de requêtes

```python
query_embeddings = embeddings.embed_query("This is a query")
```
