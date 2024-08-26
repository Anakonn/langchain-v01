---
translated: true
---

# Clarifai

>[Clarifai](https://www.clarifai.com/) es una plataforma de IA que proporciona el ciclo de vida completo de IA, que va desde la exploración de datos, el etiquetado de datos, el entrenamiento de modelos, la evaluación y la inferencia. Una aplicación de Clarifai se puede usar como una base de datos de vectores después de cargar las entradas.

Este cuaderno muestra cómo usar la funcionalidad relacionada con la base de datos de vectores `Clarifai`. Se muestran ejemplos para demostrar las capacidades de búsqueda semántica de texto. Clarifai también admite la búsqueda semántica con imágenes, cuadros de video y búsqueda localizada (ver [Rank](https://docs.clarifai.com/api-guide/search/rank)) y búsqueda de atributos (ver [Filter](https://docs.clarifai.com/api-guide/search/filter))).

Para usar Clarifai, debe tener una cuenta y una clave de Token de acceso personal (PAT).
[Revise aquí](https://clarifai.com/settings/security) para obtener o crear un PAT.

# Dependencias

```python
# Install required dependencies
%pip install --upgrade --quiet  clarifai
```

# Importaciones

Aquí estableceremos el token de acceso personal. Puede encontrar su PAT en configuración/seguridad en la plataforma.

```python
# Please login and get your API key from  https://clarifai.com/settings/security
from getpass import getpass

CLARIFAI_PAT = getpass()
```

```output
 ········
```

```python
# Import the required modules
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Clarifai
from langchain_text_splitters import CharacterTextSplitter
```

# Configuración

Configurar el ID de usuario y el ID de aplicación donde se cargarán los datos de texto. Nota: al crear esa aplicación, seleccione un flujo de trabajo base apropiado para indexar sus documentos de texto, como el flujo de trabajo de Language-Understanding.

Primero deberá crear una cuenta en [Clarifai](https://clarifai.com/login) y luego crear una aplicación.

```python
USER_ID = "USERNAME_ID"
APP_ID = "APPLICATION_ID"
NUMBER_OF_DOCS = 2
```

## De Textos

Crea una tienda de vectores Clarifai a partir de una lista de textos. Esta sección cargará cada texto con sus metadatos respectivos en una aplicación de Clarifai. La aplicación de Clarifai se puede usar luego para la búsqueda semántica y encontrar textos relevantes.

```python
texts = [
    "I really enjoy spending time with you",
    "I hate spending time with my dog",
    "I want to go for a run",
    "I went to the movies yesterday",
    "I love playing soccer with my friends",
]

metadatas = [
    {"id": i, "text": text, "source": "book 1", "category": ["books", "modern"]}
    for i, text in enumerate(texts)
]
```

Alternativamente, tiene la opción de dar identificadores de entrada personalizados a las entradas.

```python
idlist = ["text1", "text2", "text3", "text4", "text5"]
metadatas = [
    {"id": idlist[i], "text": text, "source": "book 1", "category": ["books", "modern"]}
    for i, text in enumerate(texts)
]
```

```python
# There is an option to initialize clarifai vector store with pat as argument!
clarifai_vector_db = Clarifai(
    user_id=USER_ID,
    app_id=APP_ID,
    number_of_docs=NUMBER_OF_DOCS,
)
```

Cargar datos en la aplicación de clarifai.

```python
# upload with metadata and custom input ids.
response = clarifai_vector_db.add_texts(texts=texts, ids=idlist, metadatas=metadatas)

# upload without metadata (Not recommended)- Since you will not be able to perform Search operation with respect to metadata.
# custom input_id (optional)
response = clarifai_vector_db.add_texts(texts=texts)
```

Puede crear una tienda de vectores de clarifai e ingerir todas las entradas en su aplicación directamente por,

```python
clarifai_vector_db = Clarifai.from_texts(
    user_id=USER_ID,
    app_id=APP_ID,
    texts=texts,
    metadatas=metadatas,
)
```

Buscar textos similares usando la función de búsqueda por similitud.

```python
docs = clarifai_vector_db.similarity_search("I would like to see you")
docs
```

```output
[Document(page_content='I really enjoy spending time with you', metadata={'text': 'I really enjoy spending time with you', 'id': 'text1', 'source': 'book 1', 'category': ['books', 'modern']})]
```

Además, puede filtrar sus resultados de búsqueda por metadatos.

```python
# There is lots powerful filtering you can do within an app by leveraging metadata filters.
# This one will limit the similarity query to only the texts that have key of "source" matching value of "book 1"
book1_similar_docs = clarifai_vector_db.similarity_search(
    "I would love to see you", filter={"source": "book 1"}
)

# you can also use lists in the input's metadata and then select things that match an item in the list. This is useful for categories like below:
book_category_similar_docs = clarifai_vector_db.similarity_search(
    "I would love to see you", filter={"category": ["books"]}
)
```

## De Documentos

Crea una tienda de vectores Clarifai a partir de una lista de documentos. Esta sección cargará cada documento con sus metadatos respectivos en una aplicación de Clarifai. La aplicación de Clarifai se puede usar luego para la búsqueda semántica y encontrar documentos relevantes.

```python
loader = TextLoader("your_local_file_path.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

```python
USER_ID = "USERNAME_ID"
APP_ID = "APPLICATION_ID"
NUMBER_OF_DOCS = 4
```

Crea una clase de base de datos de vectores de clarifai e ingiere todos tus documentos en la aplicación de clarifai.

```python
clarifai_vector_db = Clarifai.from_documents(
    user_id=USER_ID,
    app_id=APP_ID,
    documents=docs,
    number_of_docs=NUMBER_OF_DOCS,
)
```

```python
docs = clarifai_vector_db.similarity_search("Texts related to population")
docs
```

## De aplicación existente

Dentro de Clarifai tenemos excelentes herramientas para agregar datos a las aplicaciones (esencialmente proyectos) a través de la API o la interfaz de usuario. La mayoría de los usuarios ya habrán hecho eso antes de interactuar con LangChain, por lo que este ejemplo usará los datos de una aplicación existente para realizar búsquedas. Echa un vistazo a nuestra [documentación de la API](https://docs.clarifai.com/api-guide/data/create-get-update-delete) y [documentación de la interfaz de usuario](https://docs.clarifai.com/portal-guide/data). La aplicación de Clarifai se puede usar luego para la búsqueda semántica y encontrar documentos relevantes.

```python
USER_ID = "USERNAME_ID"
APP_ID = "APPLICATION_ID"
NUMBER_OF_DOCS = 4
```

```python
clarifai_vector_db = Clarifai(
    user_id=USER_ID,
    app_id=APP_ID,
    number_of_docs=NUMBER_OF_DOCS,
)
```

```python
docs = clarifai_vector_db.similarity_search(
    "Texts related to ammuniction and president wilson"
)
```

```python
docs[0].page_content
```

```output
"President Wilson, generally acclaimed as the leader of the world's democracies,\nphrased for civilization the arguments against autocracy in the great peace conference\nafter the war. The President headed the American delegation to that conclave of world\nre-construction. With him as delegates to the conference were Robert Lansing, Secretary\nof State; Henry White, former Ambassador to France and Italy; Edward M. House and\nGeneral Tasker H. Bliss.\nRepresenting American Labor at the International Labor conference held in Paris\nsimultaneously with the Peace Conference were Samuel Gompers, president of the\nAmerican Federation of Labor; William Green, secretary-treasurer of the United Mine\nWorkers of America; John R. Alpine, president of the Plumbers' Union; James Duncan,\npresident of the International Association of Granite Cutters; Frank Duffy, president of\nthe United Brotherhood of Carpenters and Joiners, and Frank Morrison, secretary of the\nAmerican Federation of Labor.\nEstimating the share of each Allied nation in the great victory, mankind will\nconclude that the heaviest cost in proportion to prewar population and treasure was paid\nby the nations that first felt the shock of war, Belgium, Serbia, Poland and France. All\nfour were the battle-grounds of huge armies, oscillating in a bloody frenzy over once\nfertile fields and once prosperous towns.\nBelgium, with a population of 8,000,000, had a casualty list of more than 350,000;\nFrance, with its casualties of 4,000,000 out of a population (including its colonies) of\n90,000,000, is really the martyr nation of the world. Her gallant poilus showed the world\nhow cheerfully men may die in defense of home and liberty. Huge Russia, including\nhapless Poland, had a casualty list of 7,000,000 out of its entire population of\n180,000,000. The United States out of a population of 110,000,000 had a casualty list of\n236,117 for nineteen months of war; of these 53,169 were killed or died of disease;\n179,625 were wounded; and 3,323 prisoners or missing."
```
