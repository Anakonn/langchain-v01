---
translated: true
---

# SingleStoreDB

>[SingleStoreDB](https://singlestore.com/) es una solución de base de datos SQL distribuida, robusta y de alto rendimiento diseñada para destacar tanto en entornos [en la nube](https://www.singlestore.com/cloud/) como en entornos locales. Con un conjunto de funciones versátil, ofrece opciones de implementación sin problemas mientras entrega un rendimiento inigualable.

Una característica destacada de SingleStoreDB es su avanzado soporte para el almacenamiento y las operaciones vectoriales, lo que lo convierte en una opción ideal para aplicaciones que requieren capacidades de IA complejas, como el emparejamiento de similitud de texto. Con funciones vectoriales integradas como [dot_product](https://docs.singlestore.com/managed-service/en/reference/sql-reference/vector-functions/dot_product.html) y [euclidean_distance](https://docs.singlestore.com/managed-service/en/reference/sql-reference/vector-functions/euclidean_distance.html), SingleStoreDB permite a los desarrolladores implementar algoritmos sofisticados de manera eficiente.

Para los desarrolladores interesados en aprovechar los datos vectoriales dentro de SingleStoreDB, hay un tutorial completo disponible que los guía a través de los entresijos de [trabajar con datos vectoriales](https://docs.singlestore.com/managed-service/en/developer-resources/functional-extensions/working-with-vector-data.html). Este tutorial profundiza en el Vector Store dentro de SingleStoreDB, mostrando su capacidad para facilitar búsquedas basadas en similitud vectorial. Aprovechando los índices vectoriales, las consultas se pueden ejecutar a una velocidad notable, lo que permite una rápida recuperación de los datos relevantes.

Además, el Vector Store de SingleStoreDB se integra sin problemas con el [indexado de texto completo basado en Lucene](https://docs.singlestore.com/cloud/developer-resources/functional-extensions/working-with-full-text-search/), lo que permite búsquedas de similitud de texto potentes. Los usuarios pueden filtrar los resultados de búsqueda en función de los campos seleccionados de los objetos de metadatos de documentos, mejorando la precisión de las consultas.

Lo que distingue a SingleStoreDB es su capacidad para combinar búsquedas vectoriales y de texto completo de varias maneras, ofreciendo flexibilidad y versatilidad. Ya sea prefiltrar por similitud de texto o vector y seleccionar los datos más relevantes, o emplear un enfoque de suma ponderada para calcular una puntuación de similitud final, los desarrolladores tienen múltiples opciones a su disposición.

En esencia, SingleStoreDB proporciona una solución integral para gestionar y consultar datos vectoriales, ofreciendo un rendimiento y una flexibilidad inigualables para aplicaciones impulsadas por IA.

```python
# Establishing a connection to the database is facilitated through the singlestoredb Python connector.
# Please ensure that this connector is installed in your working environment.
%pip install --upgrade --quiet  singlestoredb
```

```python
import getpass
import os

# We want to use OpenAIEmbeddings so we have to get the OpenAI API Key.
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_community.vectorstores import SingleStoreDB
from langchain_community.vectorstores.utils import DistanceStrategy
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
```

```python
# loading docs
# we will use some artificial data for this example
docs = [
    Document(
        page_content="""In the parched desert, a sudden rainstorm brought relief,
            as the droplets danced upon the thirsty earth, rejuvenating the landscape
            with the sweet scent of petrichor.""",
        metadata={"category": "rain"},
    ),
    Document(
        page_content="""Amidst the bustling cityscape, the rain fell relentlessly,
            creating a symphony of pitter-patter on the pavement, while umbrellas
            bloomed like colorful flowers in a sea of gray.""",
        metadata={"category": "rain"},
    ),
    Document(
        page_content="""High in the mountains, the rain transformed into a delicate
            mist, enveloping the peaks in a mystical veil, where each droplet seemed to
            whisper secrets to the ancient rocks below.""",
        metadata={"category": "rain"},
    ),
    Document(
        page_content="""Blanketing the countryside in a soft, pristine layer, the
            snowfall painted a serene tableau, muffling the world in a tranquil hush
            as delicate flakes settled upon the branches of trees like nature's own
            lacework.""",
        metadata={"category": "snow"},
    ),
    Document(
        page_content="""In the urban landscape, snow descended, transforming
            bustling streets into a winter wonderland, where the laughter of
            children echoed amidst the flurry of snowballs and the twinkle of
            holiday lights.""",
        metadata={"category": "snow"},
    ),
    Document(
        page_content="""Atop the rugged peaks, snow fell with an unyielding
            intensity, sculpting the landscape into a pristine alpine paradise,
            where the frozen crystals shimmered under the moonlight, casting a
            spell of enchantment over the wilderness below.""",
        metadata={"category": "snow"},
    ),
]

embeddings = OpenAIEmbeddings()
```

Hay varias formas de establecer una [conexión](https://singlestoredb-python.labs.singlestore.com/generated/singlestoredb.connect.html) a la base de datos. Puede configurar variables de entorno o pasar parámetros con nombre al constructor `SingleStoreDB`. Alternativamente, puede proporcionar estos parámetros a los métodos `from_documents` y `from_texts`.

```python
# Setup connection url as environment variable
os.environ["SINGLESTOREDB_URL"] = "root:pass@localhost:3306/db"

# Load documents to the store
docsearch = SingleStoreDB.from_documents(
    docs,
    embeddings,
    table_name="notebook",  # use table with a custom name
)
```

```python
query = "trees in the snow"
docs = docsearch.similarity_search(query)  # Find documents that correspond to the query
print(docs[0].page_content)
```

SingleStoreDB eleva las capacidades de búsqueda al permitir a los usuarios mejorar y refinar los resultados de búsqueda mediante el prefiltrado basado en campos de metadatos. Esta funcionalidad empodera a los desarrolladores y analistas de datos a ajustar las consultas, asegurando que los resultados de búsqueda se adapten con precisión a sus requisitos. Al filtrar los resultados de búsqueda utilizando atributos de metadatos específicos, los usuarios pueden reducir el alcance de sus consultas, centrándose solo en los subconjuntos de datos relevantes.

```python
query = "trees branches"
docs = docsearch.similarity_search(
    query, filter={"category": "snow"}
)  # Find documents that correspond to the query and has category "snow"
print(docs[0].page_content)
```

Mejora la eficiencia de tu búsqueda con SingleStore DB versión 8.5 o superior aprovechando los [índices vectoriales ANN](https://docs.singlestore.com/cloud/reference/sql-reference/vector-functions/vector-indexing/). Al establecer `use_vector_index=True` durante la creación del objeto de almacén vectorial, puedes activar esta función. Además, si tus vectores difieren en dimensionalidad del tamaño de incrustación predeterminado de OpenAI de 1536, asegúrate de especificar el parámetro `vector_size` en consecuencia.

SingleStoreDB presenta una diversa gama de estrategias de búsqueda, cada una cuidadosamente diseñada para atender a casos de uso y preferencias de usuario específicos. La estrategia predeterminada `VECTOR_ONLY` utiliza operaciones vectoriales como `dot_product` o `euclidean_distance` para calcular las puntuaciones de similitud directamente entre vectores, mientras que `TEXT_ONLY` emplea la búsqueda de texto completo basada en Lucene, particularmente ventajosa para aplicaciones centradas en texto. Para los usuarios que buscan un enfoque equilibrado, `FILTER_BY_TEXT` primero refina los resultados en función de la similitud de texto antes de realizar comparaciones vectoriales, mientras que `FILTER_BY_VECTOR` prioriza la similitud vectorial, filtrando los resultados antes de evaluar la similitud de texto para obtener coincidencias óptimas. Cabe destacar que tanto `FILTER_BY_TEXT` como `FILTER_BY_VECTOR` requieren un índice de texto completo para su funcionamiento. Además, `WEIGHTED_SUM` surge como una estrategia sofisticada, que calcula la puntuación de similitud final ponderando las similitudes vectoriales y de texto, aunque utiliza exclusivamente cálculos de distancia de `dot_product` y también requiere un índice de texto completo. Estas versátiles estrategias empoderan a los usuarios a ajustar las búsquedas de acuerdo a sus necesidades únicas, facilitando una recuperación y análisis de datos eficientes y precisos. Además, los enfoques híbridos de SingleStoreDB, ejemplificados por las estrategias `FILTER_BY_TEXT`, `FILTER_BY_VECTOR` y `WEIGHTED_SUM`, combinan sin problemas las búsquedas basadas en vectores y texto para maximizar la eficiencia y la precisión, asegurando que los usuarios puedan aprovechar al máximo las capacidades de la plataforma para una amplia gama de aplicaciones.

```python
docsearch = SingleStoreDB.from_documents(
    docs,
    embeddings,
    distance_strategy=DistanceStrategy.DOT_PRODUCT,  # Use dot product for similarity search
    use_vector_index=True,  # Use vector index for faster search
    use_full_text_search=True,  # Use full text index
)

vectorResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.VECTOR_ONLY,
    filter={"category": "rain"},
)
print(vectorResults[0].page_content)

textResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.TEXT_ONLY,
)
print(textResults[0].page_content)

filteredByTextResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.FILTER_BY_TEXT,
    filter_threshold=0.1,
)
print(filteredByTextResults[0].page_content)

filteredByVectorResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.FILTER_BY_VECTOR,
    filter_threshold=0.1,
)
print(filteredByVectorResults[0].page_content)

weightedSumResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.WEIGHTED_SUM,
    text_weight=0.2,
    vector_weight=0.8,
)
print(weightedSumResults[0].page_content)
```

## Ejemplo multimodal: aprovechando los incrustaciones de CLIP y OpenClip

En el ámbito del análisis de datos multimodales, la integración de diversos tipos de información, como imágenes y texto, se ha vuelto cada vez más crucial. Una herramienta poderosa que facilita dicha integración es [CLIP](https://openai.com/research/clip), un modelo de vanguardia capaz de incrustar tanto imágenes como texto en un espacio semántico compartido. Al hacerlo, CLIP permite la recuperación de contenido relevante a través de diferentes modalidades mediante la búsqueda por similitud.

Para ilustrar, consideremos un escenario de aplicación donde buscamos analizar eficazmente datos multimodales. En este ejemplo, aprovechamos las capacidades de las [incrustaciones multimodales de OpenClip](/docs/integrations/text_embedding/open_clip), que aprovechan el marco de CLIP. Con OpenClip, podemos incrustar sin problemas descripciones de texto junto con las imágenes correspondientes, lo que permite un análisis y tareas de recuperación integrales. Ya sea identificar imágenes visualmente similares en función de consultas de texto o encontrar pasajes de texto relevantes asociados a contenido visual específico, OpenClip empodera a los usuarios a explorar y extraer información de datos multimodales con una eficiencia y precisión notables.

```python
%pip install -U langchain openai singlestoredb langchain-experimental # (newest versions required for multi-modal)
```

```python
import os

from langchain_community.vectorstores import SingleStoreDB
from langchain_experimental.open_clip import OpenCLIPEmbeddings

os.environ["SINGLESTOREDB_URL"] = "root:pass@localhost:3306/db"

TEST_IMAGES_DIR = "../../modules/images"

docsearch = SingleStoreDB(OpenCLIPEmbeddings())

image_uris = sorted(
    [
        os.path.join(TEST_IMAGES_DIR, image_name)
        for image_name in os.listdir(TEST_IMAGES_DIR)
        if image_name.endswith(".jpg")
    ]
)

# Add images
docsearch.add_images(uris=image_uris)
```
