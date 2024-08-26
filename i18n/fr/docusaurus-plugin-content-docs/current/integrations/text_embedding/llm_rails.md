---
translated: true
---

# LLMRails

Chargeons la classe LLMRails Embeddings.

Pour utiliser l'intégration LLMRails, vous devez passer la clé API en argument ou la définir dans l'environnement avec la clé `LLM_RAILS_API_KEY`.
Pour obtenir une clé API, vous devez vous inscrire sur https://console.llmrails.com/signup, puis aller sur https://console.llmrails.com/api-keys et copier la clé après en avoir créé une sur la plateforme.

```python
from langchain_community.embeddings import LLMRailsEmbeddings
```

```python
embeddings = LLMRailsEmbeddings(model="embedding-english-v1")  # or embedding-multi-v1
```

```python
text = "This is a test document."
```

Pour générer des intégrations, vous pouvez interroger un texte individuel ou une liste de textes.

```python
query_result = embeddings.embed_query(text)
query_result[:5]
```

```output
[-0.09996652603149414,
 0.015568195842206478,
 0.17670190334320068,
 0.16521021723747253,
 0.21193109452724457]
```

```python
doc_result = embeddings.embed_documents([text])
doc_result[0][:5]
```

```output
[-0.04242777079343796,
 0.016536075621843338,
 0.10052520781755447,
 0.18272875249385834,
 0.2079043835401535]
```
