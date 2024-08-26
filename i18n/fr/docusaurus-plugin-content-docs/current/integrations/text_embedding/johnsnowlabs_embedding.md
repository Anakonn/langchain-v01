---
translated: true
---

# John Snow Labs

>[John Snow Labs](https://nlp.johnsnowlabs.com/) L'écosystème NLP & LLM comprend des bibliothèques logicielles pour l'IA de pointe à grande échelle, l'IA responsable, l'IA sans code et l'accès à plus de 20 000 modèles pour les soins de santé, le droit, la finance, etc.
>
>Les modèles sont chargés avec [nlp.load](https://nlp.johnsnowlabs.com/docs/en/jsl/load_api) et la session Spark est démarrée avec [nlp.start()](https://nlp.johnsnowlabs.com/docs/en/jsl/start-a-sparksession) en coulisses.
>Pour tous les 24 000+ modèles, consultez le [John Snow Labs Model Models Hub](https://nlp.johnsnowlabs.com/models)

## Configuration

```python
%pip install --upgrade --quiet  johnsnowlabs
```

```python
# If you have a enterprise license, you can run this to install enterprise features
# from johnsnowlabs import nlp
# nlp.install()
```

## Exemple

```python
from langchain_community.embeddings.johnsnowlabs import JohnSnowLabsEmbeddings
```

Initialiser les embeddings Johnsnowlabs et la session Spark

```python
embedder = JohnSnowLabsEmbeddings("en.embed_sentence.biobert.clinical_base_cased")
```

Définir quelques textes d'exemple. Il peut s'agir de n'importe quels documents que vous souhaitez analyser - par exemple, des articles d'actualité, des publications sur les réseaux sociaux ou des avis de produits.

```python
texts = ["Cancer is caused by smoking", "Antibiotics aren't painkiller"]
```

Générer et imprimer les embeddings pour les textes. La classe JohnSnowLabsEmbeddings génère un embedding pour chaque document, qui est une représentation numérique du contenu du document. Ces embeddings peuvent être utilisés pour diverses tâches de traitement du langage naturel, comme la comparaison de similarité de documents ou la classification de texte.

```python
embeddings = embedder.embed_documents(texts)
for i, embedding in enumerate(embeddings):
    print(f"Embedding for document {i+1}: {embedding}")
```

Générer et imprimer un embedding pour un seul morceau de texte. Vous pouvez également générer un embedding pour un seul morceau de texte, comme une requête de recherche. Cela peut être utile pour des tâches comme la recherche d'informations, où vous voulez trouver des documents similaires à une requête donnée.

```python
query = "Cancer is caused by smoking"
query_embedding = embedder.embed_query(query)
print(f"Embedding for query: {query_embedding}")
```
