---
translated: true
---

# ThirdAI NeuralDB

>[NeuralDB](https://www.thirdai.com/neuraldb-enterprise/) est un magasin de vecteurs optimisé pour le CPU et personnalisable, développé par [ThirdAI](https://www.thirdai.com/).

## Initialisation

Il existe deux méthodes d'initialisation :
- À partir de zéro : modèle de base
- À partir d'un point de contrôle : charger un modèle précédemment enregistré

Pour toutes les méthodes d'initialisation suivantes, le paramètre `thirdai_key` peut être omis si la variable d'environnement `THIRDAI_KEY` est définie.

Les clés d'API ThirdAI peuvent être obtenues sur https://www.thirdai.com/try-bolt/

```python
from langchain.vectorstores import NeuralDBVectorStore

# From scratch
vectorstore = NeuralDBVectorStore.from_scratch(thirdai_key="your-thirdai-key")

# From checkpoint
vectorstore = NeuralDBVectorStore.from_checkpoint(
    # Path to a NeuralDB checkpoint. For example, if you call
    # vectorstore.save("/path/to/checkpoint.ndb") in one script, then you can
    # call NeuralDBVectorStore.from_checkpoint("/path/to/checkpoint.ndb") in
    # another script to load the saved model.
    checkpoint="/path/to/checkpoint.ndb",
    thirdai_key="your-thirdai-key",
)
```

## Insertion de sources de documents

```python
vectorstore.insert(
    # If you have PDF, DOCX, or CSV files, you can directly pass the paths to the documents
    sources=["/path/to/doc.pdf", "/path/to/doc.docx", "/path/to/doc.csv"],
    # When True this means that the underlying model in the NeuralDB will
    # undergo unsupervised pretraining on the inserted files. Defaults to True.
    train=True,
    # Much faster insertion with a slight drop in performance. Defaults to True.
    fast_mode=True,
)

from thirdai import neural_db as ndb

vectorstore.insert(
    # If you have files in other formats, or prefer to configure how
    # your files are parsed, then you can pass in NeuralDB document objects
    # like this.
    sources=[
        ndb.PDF(
            "/path/to/doc.pdf",
            version="v2",
            chunk_size=100,
            metadata={"published": 2022},
        ),
        ndb.Unstructured("/path/to/deck.pptx"),
    ]
)
```

## Recherche de similarité

Pour interroger le magasin de vecteurs, vous pouvez utiliser la méthode vectorstore standard de LangChain `similarity_search`, qui renvoie une liste d'objets Document de LangChain. Chaque objet document représente un fragment de texte des fichiers indexés. Par exemple, il peut contenir un paragraphe de l'un des fichiers PDF indexés. En plus du texte, le champ de métadonnées du document contient des informations telles que l'ID du document, la source de ce document (le fichier d'où il provient) et le score du document.

```python
# This returns a list of LangChain Document objects
documents = vectorstore.similarity_search("query", k=10)
```

## Affinage

NeuralDBVectorStore peut être affiné pour le comportement des utilisateurs et les connaissances spécifiques au domaine. Il peut être affiné de deux manières :
1. Association : le magasin de vecteurs associe une phrase source à une phrase cible. Lorsque le magasin de vecteurs voit la phrase source, il prendra également en compte les résultats pertinents pour la phrase cible.
2. Upvoting : le magasin de vecteurs augmente le score d'un document pour une requête spécifique. Cela est utile lorsque vous voulez affiner le magasin de vecteurs au comportement de l'utilisateur. Par exemple, si un utilisateur recherche "comment une voiture est-elle fabriquée" et apprécie le document renvoyé avec l'ID 52, alors nous pouvons donner un vote positif au document avec l'ID 52 pour la requête "comment une voiture est-elle fabriquée".

```python
vectorstore.associate(source="source phrase", target="target phrase")
vectorstore.associate_batch(
    [
        ("source phrase 1", "target phrase 1"),
        ("source phrase 2", "target phrase 2"),
    ]
)

vectorstore.upvote(query="how is a car manufactured", document_id=52)
vectorstore.upvote_batch(
    [
        ("query 1", 52),
        ("query 2", 20),
    ]
)
```
