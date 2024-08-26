---
translated: true
---

# NLP Cloud

>[NLP Cloud](https://docs.nlpcloud.com/#introduction) est une plateforme d'intelligence artificielle qui vous permet d'utiliser les moteurs IA les plus avancés, et même d'entraîner vos propres moteurs avec vos propres données.

L'endpoint [embeddings](https://docs.nlpcloud.com/#embeddings) offre le modèle suivant :

* `paraphrase-multilingual-mpnet-base-v2` : Paraphrase Multilingual MPNet Base V2 est un modèle très rapide basé sur Sentence Transformers qui est parfaitement adapté à l'extraction d'embeddings dans plus de 50 langues (voir la liste complète ici).

```python
%pip install --upgrade --quiet  nlpcloud
```

```python
from langchain_community.embeddings import NLPCloudEmbeddings
```

```python
import os

os.environ["NLPCLOUD_API_KEY"] = "xxx"
nlpcloud_embd = NLPCloudEmbeddings()
```

```python
text = "This is a test document."
```

```python
query_result = nlpcloud_embd.embed_query(text)
```

```python
doc_result = nlpcloud_embd.embed_documents([text])
```
