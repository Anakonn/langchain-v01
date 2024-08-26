---
translated: true
---

# Epsilla

>[Epsilla](https://www.epsilla.com) es una base de datos de vectores de código abierto que aprovecha las técnicas avanzadas de recorrido de gráficos en paralelo para el indexado de vectores. Epsilla está licenciado bajo GPL-3.0.

Este cuaderno muestra cómo usar las funcionalidades relacionadas con la base de datos de vectores `Epsilla`.

Como requisito previo, necesitas tener una base de datos de vectores Epsilla en ejecución (por ejemplo, a través de nuestra imagen de docker) e instalar el paquete ``pyepsilla``. Ver la documentación completa en [docs](https://epsilla-inc.gitbook.io/epsilladb/quick-start).

```python
!pip/pip3 install pyepsilla
```

Queremos usar OpenAIEmbeddings, así que tenemos que obtener la clave API de OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

Clave API de OpenAI: ········

```python
from langchain_community.vectorstores import Epsilla
from langchain_openai import OpenAIEmbeddings
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()

documents = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0).split_documents(
    documents
)

embeddings = OpenAIEmbeddings()
```

La base de datos vectorial Epsilla se está ejecutando con el host predeterminado "localhost" y el puerto "8888". Tenemos una ruta de base de datos personalizada, un nombre de base de datos y un nombre de colección en lugar de los predeterminados.

```python
from pyepsilla import vectordb

client = vectordb.Client()
vector_store = Epsilla.from_documents(
    documents,
    embeddings,
    client,
    db_path="/tmp/mypath",
    db_name="MyDB",
    collection_name="MyCollection",
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_store.similarity_search(query)
print(docs[0].page_content)
```

En estado tras estado, se han aprobado nuevas leyes, no solo para suprimir el voto, sino para subvertir elecciones enteras.

No podemos dejar que esto suceda.

Esta noche. Llamo al Senado a: Aprobar la Ley de Libertad de Voto. Aprobar la Ley de Derechos de Votación de John Lewis. Y mientras están en eso, aprobar la Ley de Divulgación para que los estadounidenses puedan saber quién está financiando nuestras elecciones.

Esta noche, me gustaría honrar a alguien que ha dedicado su vida a servir a este país: el juez Stephen Breyer, un veterano del Ejército, erudito constitucional y juez jubilado de la Corte Suprema de los Estados Unidos. Juez Breyer, gracias por su servicio.

Una de las responsabilidades constitucionales más serias de un Presidente es nombrar a alguien para que sirva en la Corte Suprema de los Estados Unidos.

Y lo hice hace 4 días, cuando nominé a la jueza del Tribunal de Apelaciones de Circuito Ketanji Brown Jackson. Una de las mentes jurídicas más destacadas de nuestra nación, que continuará el legado de excelencia del juez Breyer.
