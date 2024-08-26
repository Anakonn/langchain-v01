---
translated: true
---

# SpaCy

>[spaCy](https://spacy.io/) est une bibliothèque logicielle open-source pour le traitement avancé du langage naturel, écrite dans les langages de programmation Python et Cython.

## Installation et configuration

```python
%pip install --upgrade --quiet  spacy
```

Importez les classes nécessaires

```python
from langchain_community.embeddings.spacy_embeddings import SpacyEmbeddings
```

## Exemple

Initialisez SpacyEmbeddings. Cela chargera le modèle Spacy en mémoire.

```python
embedder = SpacyEmbeddings(model_name="en_core_web_sm")
```

Définissez quelques textes d'exemple. Il peut s'agir de n'importe quels documents que vous souhaitez analyser - par exemple, des articles d'actualité, des publications sur les réseaux sociaux ou des avis de produits.

```python
texts = [
    "The quick brown fox jumps over the lazy dog.",
    "Pack my box with five dozen liquor jugs.",
    "How vexingly quick daft zebras jump!",
    "Bright vixens jump; dozy fowl quack.",
]
```

Générez et imprimez les embeddings pour les textes. La classe SpacyEmbeddings génère un embedding pour chaque document, qui est une représentation numérique du contenu du document. Ces embeddings peuvent être utilisés pour diverses tâches de traitement du langage naturel, telles que la comparaison de similarité de documents ou la classification de textes.

```python
embeddings = embedder.embed_documents(texts)
for i, embedding in enumerate(embeddings):
    print(f"Embedding for document {i+1}: {embedding}")
```

Générez et imprimez un embedding pour un seul morceau de texte. Vous pouvez également générer un embedding pour un seul morceau de texte, comme une requête de recherche. Cela peut être utile pour des tâches comme la recherche d'informations, où vous voulez trouver des documents similaires à une requête donnée.

```python
query = "Quick foxes and lazy dogs."
query_embedding = embedder.embed_query(query)
print(f"Embedding for query: {query_embedding}")
```
