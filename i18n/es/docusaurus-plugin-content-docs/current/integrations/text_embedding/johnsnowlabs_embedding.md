---
translated: true
---

# John Snow Labs

>[John Snow Labs](https://nlp.johnsnowlabs.com/) El ecosistema de NLP y LLM incluye bibliotecas de software para IA de vanguardia a escala, IA responsable, IA sin código y acceso a más de 20,000 modelos para Salud, Legal, Finanzas, etc.
>
>Los modelos se cargan con [nlp.load](https://nlp.johnsnowlabs.com/docs/en/jsl/load_api) y la sesión de Spark se inicia >con [nlp.start()](https://nlp.johnsnowlabs.com/docs/en/jsl/start-a-sparksession) bajo el capó.
>Para los más de 24,000 modelos, consulta el [John Snow Labs Model Models Hub](https://nlp.johnsnowlabs.com/models)

## Configuración

```python
%pip install --upgrade --quiet  johnsnowlabs
```

```python
# If you have a enterprise license, you can run this to install enterprise features
# from johnsnowlabs import nlp
# nlp.install()
```

## Ejemplo

```python
from langchain_community.embeddings.johnsnowlabs import JohnSnowLabsEmbeddings
```

Inicializar Johnsnowlabs Embeddings y Spark Session

```python
embedder = JohnSnowLabsEmbeddings("en.embed_sentence.biobert.clinical_base_cased")
```

Definir algunos textos de ejemplo. Estos podrían ser cualquier documento que desees analizar, por ejemplo, artículos de noticias, publicaciones en redes sociales o reseñas de productos.

```python
texts = ["Cancer is caused by smoking", "Antibiotics aren't painkiller"]
```

Generar e imprimir incrustaciones para los textos. La clase JohnSnowLabsEmbeddings genera una incrustación para cada documento, que es una representación numérica del contenido del documento. Estas incrustaciones se pueden utilizar para diversas tareas de procesamiento de lenguaje natural, como comparación de similitud de documentos o clasificación de texto.

```python
embeddings = embedder.embed_documents(texts)
for i, embedding in enumerate(embeddings):
    print(f"Embedding for document {i+1}: {embedding}")
```

Generar e imprimir una incrustación para un solo fragmento de texto. También puedes generar una incrustación para un solo fragmento de texto, como una consulta de búsqueda. Esto puede ser útil para tareas como recuperación de información, donde deseas encontrar documentos similares a una consulta dada.

```python
query = "Cancer is caused by smoking"
query_embedding = embedder.embed_query(query)
print(f"Embedding for query: {query_embedding}")
```
