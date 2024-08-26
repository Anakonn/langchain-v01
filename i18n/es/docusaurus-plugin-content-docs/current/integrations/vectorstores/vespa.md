---
translated: true
---

# Vespa

>[Vespa](https://vespa.ai/) es un motor de búsqueda y base de datos de vectores completamente equipado. Admite búsqueda de vectores (ANN), búsqueda léxica y búsqueda en datos estructurados, todo en la misma consulta.

Este cuaderno muestra cómo usar `Vespa.ai` como un almacén de vectores LangChain.

Para crear el almacén de vectores, usamos
[pyvespa](https://pyvespa.readthedocs.io/en/latest/index.html) para crear una
conexión a un servicio `Vespa`.

```python
%pip install --upgrade --quiet  pyvespa
```

Usando el paquete `pyvespa`, puede conectarse a una
[instancia de Vespa Cloud](https://pyvespa.readthedocs.io/en/latest/deploy-vespa-cloud.html)
o a una
[instancia local de Docker](https://pyvespa.readthedocs.io/en/latest/deploy-docker.html).
Aquí, crearemos una nueva aplicación Vespa y la desplegaremos usando Docker.

#### Creación de una aplicación Vespa

Primero, necesitamos crear un paquete de aplicación:

```python
from vespa.package import ApplicationPackage, Field, RankProfile

app_package = ApplicationPackage(name="testapp")
app_package.schema.add_fields(
    Field(
        name="text", type="string", indexing=["index", "summary"], index="enable-bm25"
    ),
    Field(
        name="embedding",
        type="tensor<float>(x[384])",
        indexing=["attribute", "summary"],
        attribute=["distance-metric: angular"],
    ),
)
app_package.schema.add_rank_profile(
    RankProfile(
        name="default",
        first_phase="closeness(field, embedding)",
        inputs=[("query(query_embedding)", "tensor<float>(x[384])")],
    )
)
```

Esto configura una aplicación Vespa con un esquema para cada documento que contiene
dos campos: `text` para almacenar el texto del documento y `embedding` para almacenar
el vector de incrustación. El campo `text` se configura para usar un índice BM25 para
una recuperación de texto eficiente, y veremos cómo usar esto y la búsqueda híbrida
un poco más adelante.

El campo `embedding` se configura con un vector de longitud 384 para almacenar la
representación de incrustación del texto. Consulte
[Guía de Tensores de Vespa](https://docs.vespa.ai/en/tensor-user-guide.html)
para obtener más información sobre los tensores en Vespa.

Por último, agregamos un [perfil de clasificación](https://docs.vespa.ai/en/ranking.html) para
instruir a Vespa cómo ordenar los documentos. Aquí lo configuramos con una
[búsqueda de vecinos más cercanos](https://docs.vespa.ai/en/nearest-neighbor-search.html).

Ahora podemos implementar esta aplicación localmente:

```python
from vespa.deployment import VespaDocker

vespa_docker = VespaDocker()
vespa_app = vespa_docker.deploy(application_package=app_package)
```

Esto despliega y crea una conexión a un servicio `Vespa`. En caso de que ya
tenga una aplicación Vespa en ejecución, por ejemplo, en la nube,
consulte la aplicación PyVespa para saber cómo conectarse.

#### Creación de un almacén de vectores Vespa

Ahora, carguemos algunos documentos:

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

from langchain_community.embeddings.sentence_transformer import (
    SentenceTransformerEmbeddings,
)

embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
```

Aquí, también configuramos un codificador de oraciones local para transformar el texto en vectores de incrustación.
También se podría usar incrustaciones de OpenAI, pero la longitud del vector debe actualizarse a `1536` para reflejar el mayor tamaño de esa incrustación.

Para enviar estos a Vespa, necesitamos configurar cómo el almacén de vectores debe asignarse a
campos en la aplicación Vespa. Luego creamos el almacén de vectores directamente a partir
de este conjunto de documentos:

```python
vespa_config = dict(
    page_content_field="text",
    embedding_field="embedding",
    input_field="query_embedding",
)

from langchain_community.vectorstores import VespaStore

db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
```

Esto crea un almacén de vectores Vespa y envía ese conjunto de documentos a Vespa.
El almacén de vectores se encarga de llamar a la función de incrustación para cada documento
e insertarlos en la base de datos.

Ahora podemos consultar el almacén de vectores:

```python
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query)

print(results[0].page_content)
```

Esto usará la función de incrustación dada anteriormente para crear una representación
para la consulta y usará eso para buscar en Vespa. Tenga en cuenta que esto usará la
función de clasificación `default`, que configuramos en el paquete de aplicación
anterior. Puede usar el argumento `ranking` en `similarity_search` para
especificar qué función de clasificación usar.

Consulte la [documentación de pyvespa](https://pyvespa.readthedocs.io/en/latest/getting-started-pyvespa.html#Query)
para obtener más información.

Esto cubre el uso básico del almacén Vespa en LangChain.
Ahora puede devolver los resultados y continuar usándolos en LangChain.

#### Actualización de documentos

Como alternativa a llamar a `from_documents`, puede crear el vector
almacenar directamente y llamar a `add_texts` desde allí. Esto también se puede usar para actualizar
documentos:

```python
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query)
result = results[0]

result.page_content = "UPDATED: " + result.page_content
db.add_texts([result.page_content], [result.metadata], result.metadata["id"])

results = db.similarity_search(query)
print(results[0].page_content)
```

Sin embargo, la biblioteca `pyvespa` contiene métodos para manipular
contenido en Vespa que puede usar directamente.

#### Eliminación de documentos

Puede eliminar documentos usando la función `delete`:

```python
result = db.similarity_search(query)
# docs[0].metadata["id"] == "id:testapp:testapp::32"

db.delete(["32"])
result = db.similarity_search(query)
# docs[0].metadata["id"] != "id:testapp:testapp::32"
```

Nuevamente, la conexión `pyvespa` contiene métodos para eliminar documentos también.

### Devolución con puntuaciones

El método `similarity_search` solo devuelve los documentos en orden de
relevancia. Para recuperar las puntuaciones reales:

```python
results = db.similarity_search_with_score(query)
result = results[0]
# result[1] ~= 0.463
```

Este es el resultado de usar el modelo de incrustación `"all-MiniLM-L6-v2"` usando la
función de distancia de coseno (como se indica mediante el argumento `angular` en la
función de aplicación).

Las diferentes funciones de incrustación necesitan diferentes funciones de distancia, y Vespa
necesita saber qué función de distancia usar al ordenar los documentos.
Consulte la
[documentación sobre funciones de distancia](https://docs.vespa.ai/en/reference/schema-reference.html#distance-metric)
para obtener más información.

### Como recuperador

Para usar este almacén de vectores como un
[recuperador LangChain](/docs/modules/data_connection/retrievers/)
simplemente llame a la función `as_retriever`, que es un método de almacén de vectores
estándar:

```python
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
retriever = db.as_retriever()
query = "What did the president say about Ketanji Brown Jackson"
results = retriever.invoke(query)

# results[0].metadata["id"] == "id:testapp:testapp::32"
```

Esto permite una recuperación más general y no estructurada del almacén de vectores.

### Metadatos

En el ejemplo hasta ahora, solo hemos usado el texto y la incrustación para ese
texto. Los documentos generalmente contienen información adicional, que en LangChain
se conoce como metadatos.

Vespa puede contener muchos campos con diferentes tipos al agregarlos al paquete de aplicación:

```python
app_package.schema.add_fields(
    # ...
    Field(name="date", type="string", indexing=["attribute", "summary"]),
    Field(name="rating", type="int", indexing=["attribute", "summary"]),
    Field(name="author", type="string", indexing=["attribute", "summary"]),
    # ...
)
vespa_app = vespa_docker.deploy(application_package=app_package)
```

Podemos agregar algunos campos de metadatos en los documentos:

```python
# Add metadata
for i, doc in enumerate(docs):
    doc.metadata["date"] = f"2023-{(i % 12)+1}-{(i % 28)+1}"
    doc.metadata["rating"] = range(1, 6)[i % 5]
    doc.metadata["author"] = ["Joe Biden", "Unknown"][min(i, 1)]
```

Y hacer que el almacén de vectores Vespa conozca estos campos:

```python
vespa_config.update(dict(metadata_fields=["date", "rating", "author"]))
```

Ahora, al buscar estos documentos, se devolverán estos campos.
Además, se puede filtrar en estos campos:

```python
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query, filter="rating > 3")
# results[0].metadata["id"] == "id:testapp:testapp::34"
# results[0].metadata["author"] == "Unknown"
```

### Consulta personalizada

Si el comportamiento predeterminado de la búsqueda de similitud no se ajusta a sus
requisitos, siempre puede proporcionar su propia consulta. Por lo tanto, no
necesita proporcionar toda la configuración al almacén de vectores, sino
más bien escribir esto usted mismo.

Primero, agreguemos una función de clasificación BM25 a nuestra aplicación:

```python
from vespa.package import FieldSet

app_package.schema.add_field_set(FieldSet(name="default", fields=["text"]))
app_package.schema.add_rank_profile(RankProfile(name="bm25", first_phase="bm25(text)"))
vespa_app = vespa_docker.deploy(application_package=app_package)
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
```

Luego, para realizar una búsqueda de texto regular basada en BM25:

```python
query = "What did the president say about Ketanji Brown Jackson"
custom_query = {
    "yql": "select * from sources * where userQuery()",
    "query": query,
    "type": "weakAnd",
    "ranking": "bm25",
    "hits": 4,
}
results = db.similarity_search_with_score(query, custom_query=custom_query)
# results[0][0].metadata["id"] == "id:testapp:testapp::32"
# results[0][1] ~= 14.384
```

Todas las potentes capacidades de búsqueda y consulta de Vespa se pueden usar
mediante el uso de una consulta personalizada. Consulte la documentación de Vespa sobre su
[API de consulta](https://docs.vespa.ai/en/query-api.html) para obtener más detalles.

### Búsqueda híbrida

La búsqueda híbrida significa usar tanto una búsqueda clásica basada en términos como
BM25 y una búsqueda de vectores, y combinar los resultados. Necesitamos crear
un nuevo perfil de clasificación para la búsqueda híbrida en Vespa:

```python
app_package.schema.add_rank_profile(
    RankProfile(
        name="hybrid",
        first_phase="log(bm25(text)) + 0.5 * closeness(field, embedding)",
        inputs=[("query(query_embedding)", "tensor<float>(x[384])")],
    )
)
vespa_app = vespa_docker.deploy(application_package=app_package)
db = VespaStore.from_documents(docs, embedding_function, app=vespa_app, **vespa_config)
```

Aquí, calificamos cada documento como una combinación de su puntuación BM25 y su
puntuación de distancia. Podemos consultar usando una consulta personalizada:

```python
query = "What did the president say about Ketanji Brown Jackson"
query_embedding = embedding_function.embed_query(query)
nearest_neighbor_expression = (
    "{targetHits: 4}nearestNeighbor(embedding, query_embedding)"
)
custom_query = {
    "yql": f"select * from sources * where {nearest_neighbor_expression} and userQuery()",
    "query": query,
    "type": "weakAnd",
    "input.query(query_embedding)": query_embedding,
    "ranking": "hybrid",
    "hits": 4,
}
results = db.similarity_search_with_score(query, custom_query=custom_query)
# results[0][0].metadata["id"], "id:testapp:testapp::32")
# results[0][1] ~= 2.897
```

### Incrustadores nativos en Vespa

Hasta este punto, hemos usado una función de incrustación en Python para proporcionar
incrustaciones para los textos. Vespa admite funciones de incrustación de forma nativa, por lo que
puede diferir este cálculo en Vespa. Un beneficio es la capacidad de usar
GPU al incrustar documentos si tiene una gran colección.

Consulte [Vespa embeddings](https://docs.vespa.ai/en/embedding.html)
para obtener más información.

Primero, debemos modificar nuestro paquete de aplicación:

```python
from vespa.package import Component, Parameter

app_package.components = [
    Component(
        id="hf-embedder",
        type="hugging-face-embedder",
        parameters=[
            Parameter("transformer-model", {"path": "..."}),
            Parameter("tokenizer-model", {"url": "..."}),
        ],
    )
]
Field(
    name="hfembedding",
    type="tensor<float>(x[384])",
    is_document_field=False,
    indexing=["input text", "embed hf-embedder", "attribute", "summary"],
    attribute=["distance-metric: angular"],
)
app_package.schema.add_rank_profile(
    RankProfile(
        name="hf_similarity",
        first_phase="closeness(field, hfembedding)",
        inputs=[("query(query_embedding)", "tensor<float>(x[384])")],
    )
)
```

Consulte la documentación de incrustaciones sobre cómo agregar modelos de incrustador y
tokenizadores a la aplicación. Tenga en cuenta que el campo `hfembedding`
incluye instrucciones para incrustar usando el `hf-embedder`.

Ahora podemos consultar con una consulta personalizada:

```python
query = "What did the president say about Ketanji Brown Jackson"
nearest_neighbor_expression = (
    "{targetHits: 4}nearestNeighbor(internalembedding, query_embedding)"
)
custom_query = {
    "yql": f"select * from sources * where {nearest_neighbor_expression}",
    "input.query(query_embedding)": f'embed(hf-embedder, "{query}")',
    "ranking": "internal_similarity",
    "hits": 4,
}
results = db.similarity_search_with_score(query, custom_query=custom_query)
# results[0][0].metadata["id"], "id:testapp:testapp::32")
# results[0][1] ~= 0.630
```

Tenga en cuenta que la consulta aquí incluye una instrucción `embed` para incrustar la consulta
usando el mismo modelo que para los documentos.

### Vecino más cercano aproximado

En todos los ejemplos anteriores, hemos usado el vecino más cercano exacto para
encontrar resultados. Sin embargo, para grandes colecciones de documentos, esto es
no factible, ya que hay que escanear todos los documentos para encontrar el
mejores coincidencias. Para evitar esto, podemos usar
[vecinos más cercanos aproximados](https://docs.vespa.ai/en/approximate-nn-hnsw.html).

Primero, podemos cambiar el campo de incrustación para crear un índice HNSW:

```python
from vespa.package import HNSW

app_package.schema.add_fields(
    Field(
        name="embedding",
        type="tensor<float>(x[384])",
        indexing=["attribute", "summary", "index"],
        ann=HNSW(
            distance_metric="angular",
            max_links_per_node=16,
            neighbors_to_explore_at_insert=200,
        ),
    )
)
```

Esto crea un índice HNSW en los datos de incrustación que permite una
búsqueda eficiente. Con esto establecido, podemos buscar fácilmente usando ANN estableciendo
el argumento `approximate` en `True`:

```python
query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query, approximate=True)
# results[0][0].metadata["id"], "id:testapp:testapp::32")
```

Esto cubre la mayor parte de la funcionalidad del almacén de vectores de Vespa en LangChain.
