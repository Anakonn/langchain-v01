---
translated: true
---

# Hippo

>[Transwarp Hippo](https://www.transwarp.cn/en/subproduct/hippo) es una base de datos de vectores distribuida a nivel empresarial, nativa de la nube, que admite el almacenamiento, la recuperación y la gestión de conjuntos de datos de vectores masivos. Resuelve de manera eficiente problemas como la búsqueda de similitud de vectores y el agrupamiento de vectores de alta densidad. `Hippo` presenta alta disponibilidad, alto rendimiento y escalabilidad sencilla. Tiene muchas funciones, como múltiples índices de búsqueda de vectores, particionamiento y fragmentación de datos, persistencia de datos, ingesta de datos incremental, filtrado de campos escalares de vectores y consultas mixtas. Puede satisfacer de manera efectiva las altas demandas de búsqueda en tiempo real de las empresas para datos vectoriales masivos.

## Comenzando

El único requisito previo aquí es una clave de API del sitio web de OpenAI. Asegúrese de haber iniciado una instancia de Hippo.

## Instalación de dependencias

Inicialmente, requerimos la instalación de ciertas dependencias, como OpenAI, Langchain y Hippo-API. Tenga en cuenta que debe instalar las versiones apropiadas adaptadas a su entorno.

```python
%pip install --upgrade --quiet  langchain tiktoken langchain-openai
%pip install --upgrade --quiet  hippo-api==1.1.0.rc3
```

```output
Requirement already satisfied: hippo-api==1.1.0.rc3 in /Users/daochengzhang/miniforge3/envs/py310/lib/python3.10/site-packages (1.1.0rc3)
Requirement already satisfied: pyyaml>=6.0 in /Users/daochengzhang/miniforge3/envs/py310/lib/python3.10/site-packages (from hippo-api==1.1.0.rc3) (6.0.1)
```

Nota: la versión de Python debe ser >=3.8.

## Mejores prácticas

### Importar paquetes de dependencia

```python
import os

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.hippo import Hippo
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

### Cargar documentos de conocimiento

```python
os.environ["OPENAI_API_KEY"] = "YOUR OPENAI KEY"
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
```

### Segmentar el documento de conocimiento

Aquí, usamos CharacterTextSplitter de Langchain para la segmentación. El delimitador es un punto. Después de la segmentación, el segmento de texto no excede los 1000 caracteres y el número de caracteres repetidos es 0.

```python
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

### Declarar el modelo de incrustación

A continuación, creamos el modelo de incrustación de OpenAI o Azure usando el método OpenAIEmbeddings de Langchain.

```python
# openai
embeddings = OpenAIEmbeddings()
# azure
# embeddings = OpenAIEmbeddings(
#     openai_api_type="azure",
#     openai_api_base="x x x",
#     openai_api_version="x x x",
#     model="x x x",
#     deployment="x x x",
#     openai_api_key="x x x"
# )
```

### Declarar el cliente de Hippo

```python
HIPPO_CONNECTION = {"host": "IP", "port": "PORT"}
```

### Almacenar el documento

```python
print("input...")
# insert docs
vector_store = Hippo.from_documents(
    docs,
    embedding=embeddings,
    table_name="langchain_test",
    connection_args=HIPPO_CONNECTION,
)
print("success")
```

```output
input...
success
```

### Realizar preguntas y respuestas basadas en el conocimiento

#### Crear un modelo de pregunta-respuesta de lenguaje grande

A continuación, creamos el modelo de pregunta-respuesta de lenguaje grande de OpenAI o Azure, respectivamente, usando los métodos AzureChatOpenAI y ChatOpenAI de Langchain.

```python
# llm = AzureChatOpenAI(
#     openai_api_base="x x x",
#     openai_api_version="xxx",
#     deployment_name="xxx",
#     openai_api_key="xxx",
#     openai_api_type="azure"
# )

llm = ChatOpenAI(openai_api_key="YOUR OPENAI KEY", model_name="gpt-3.5-turbo-16k")
```

### Adquirir conocimiento relacionado en función de la pregunta:

```python
query = "Please introduce COVID-19"
# query = "Please introduce Hippo Core Architecture"
# query = "What operations does the Hippo Vector Database support for vector data?"
# query = "Does Hippo use hardware acceleration technology? Briefly introduce hardware acceleration technology."


# Retrieve similar content from the knowledge base,fetch the top two most similar texts.
res = vector_store.similarity_search(query, 2)
content_list = [item.page_content for item in res]
text = "".join(content_list)
```

### Construir una plantilla de solicitud

```python
prompt = f"""
Please use the content of the following [Article] to answer my question. If you don't know, please say you don't know, and the answer should be concise."
[Article]:{text}
Please answer this question in conjunction with the above article:{query}
"""
```

### Esperar a que el modelo de lenguaje grande genere una respuesta

```python
response_with_hippo = llm.predict(prompt)
print(f"response_with_hippo:{response_with_hippo}")
response = llm.predict(query)
print("==========================================")
print(f"response_without_hippo:{response}")
```

```output
response_with_hippo:COVID-19 is a virus that has impacted every aspect of our lives for over two years. It is a highly contagious and mutates easily, requiring us to remain vigilant in combating its spread. However, due to progress made and the resilience of individuals, we are now able to move forward safely and return to more normal routines.
==========================================
response_without_hippo:COVID-19 is a contagious respiratory illness caused by the novel coronavirus SARS-CoV-2. It was first identified in December 2019 in Wuhan, China and has since spread globally, leading to a pandemic. The virus primarily spreads through respiratory droplets when an infected person coughs, sneezes, talks, or breathes, and can also spread by touching contaminated surfaces and then touching the face. COVID-19 symptoms include fever, cough, shortness of breath, fatigue, muscle or body aches, sore throat, loss of taste or smell, headache, and in severe cases, pneumonia and organ failure. While most people experience mild to moderate symptoms, it can lead to severe illness and even death, particularly among older adults and those with underlying health conditions. To combat the spread of the virus, various preventive measures have been implemented globally, including social distancing, wearing face masks, practicing good hand hygiene, and vaccination efforts.
```
