---
translated: true
---

# NLP Cloud

>[NLP Cloud](https://docs.nlpcloud.com/#introduction) es una plataforma de inteligencia artificial que le permite usar los motores de IA más avanzados e incluso entrenar sus propios motores con sus propios datos.

El punto final de [embeddings](https://docs.nlpcloud.com/#embeddings) ofrece el siguiente modelo:

* `paraphrase-multilingual-mpnet-base-v2`: Paraphrase Multilingual MPNet Base V2 es un modelo muy rápido basado en Sentence Transformers que es perfectamente adecuado para la extracción de incrustaciones en más de 50 idiomas (consulte la lista completa aquí).

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
