---
translated: true
---

# LLMRails

Vamos a cargar la clase LLMRails Embeddings.

Para usar el incrustado de LLMRails, debe pasar la clave API por argumento o establecerla en el entorno con la clave `LLM_RAILS_API_KEY`.
Para obtener la clave API, debe registrarse en https://console.llmrails.com/signup y luego ir a https://console.llmrails.com/api-keys y copiar la clave de allí después de crear una clave en la plataforma.

```python
from langchain_community.embeddings import LLMRailsEmbeddings
```

```python
embeddings = LLMRailsEmbeddings(model="embedding-english-v1")  # or embedding-multi-v1
```

```python
text = "This is a test document."
```

Para generar incrustados, puede consultar un texto individual o puede consultar una lista de textos.

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
