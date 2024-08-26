---
translated: true
---

# Cargador de documentos seguro de Pebblo

> [Pebblo](https://daxa-ai.github.io/pebblo/) permite a los desarrolladores cargar datos de forma segura y promocionar su aplicación de Gen AI para su implementación sin preocuparse por los requisitos de cumplimiento y seguridad de la organización. El proyecto identifica los temas semánticos y las entidades que se encuentran en los datos cargados y los resume en la interfaz de usuario o en un informe PDF.

Pebblo tiene dos componentes.

1. Cargador de documentos seguro de Pebblo para Langchain
1. Servidor Pebblo

Este documento describe cómo aumentar su Cargador de documentos de Langchain existente con el Cargador de documentos seguro de Pebblo para obtener una visibilidad profunda de los tipos de Temas y Entidades ingeridos en la aplicación Langchain de Gen-AI. Para obtener detalles sobre el `Servidor Pebblo`, consulte este documento [servidor pebblo](https://daxa-ai.github.io/pebblo/daemon).

El Cargador seguro de Pebblo permite la ingesta segura de datos para el Cargador de documentos de Langchain. Esto se hace envolviendo la llamada del cargador de documentos con `Cargador de documentos seguro de Pebblo`.

Nota: Para configurar el servidor pebblo en una URL diferente a la predeterminada (localhost:8000), coloque la URL correcta en la variable de entorno `PEBBLO_CLASSIFIER_URL`. Esto también se puede configurar utilizando el argumento de palabra clave `classifier_url`. Ref: [configuraciones del servidor](https://daxa-ai.github.io/pebblo/config)

#### ¿Cómo habilitar la carga de documentos de Pebblo?

Supongamos que hay un fragmento de aplicación Langchain RAG que utiliza `CSVLoader` para leer un documento CSV para inferencia.

Aquí está el fragmento de carga de documentos utilizando `CSVLoader`.

```python
from langchain.document_loaders.csv_loader import CSVLoader

loader = CSVLoader("data/corp_sens_data.csv")
documents = loader.load()
print(documents)
```

El Cargador seguro de Pebblo se puede habilitar con unos pocos cambios de líneas de código en el fragmento anterior.

```python
from langchain.document_loaders.csv_loader import CSVLoader
from langchain_community.document_loaders import PebbloSafeLoader

loader = PebbloSafeLoader(
    CSVLoader("data/corp_sens_data.csv"),
    name="acme-corp-rag-1",  # App name (Mandatory)
    owner="Joe Smith",  # Owner (Optional)
    description="Support productivity RAG application",  # Description (Optional)
)
documents = loader.load()
print(documents)
```

### Enviar temas semánticos e identidades al servidor de la nube de Pebblo

Para enviar datos semánticos al servidor de la nube de Pebblo, pase la clave de la API a PebbloSafeLoader como argumento o, alternativamente, coloque la clave de la API en la variable de entorno `PEBBLO_API_KEY`.

```python
from langchain.document_loaders.csv_loader import CSVLoader
from langchain_community.document_loaders import PebbloSafeLoader

loader = PebbloSafeLoader(
    CSVLoader("data/corp_sens_data.csv"),
    name="acme-corp-rag-1",  # App name (Mandatory)
    owner="Joe Smith",  # Owner (Optional)
    description="Support productivity RAG application",  # Description (Optional)
    api_key="my-api-key",  # API key (Optional, can be set in the environment variable PEBBLO_API_KEY)
)
documents = loader.load()
print(documents)
```

### Agregar temas semánticos y entidades semánticas a los metadatos cargados

Para agregar temas semánticos y entidades semánticas a los metadatos de los documentos cargados, establezca `load_semantic` en True como argumento o, alternativamente, defina una nueva variable de entorno `PEBBLO_LOAD_SEMANTIC` y establézcala en True.

```python
from langchain.document_loaders.csv_loader import CSVLoader
from langchain_community.document_loaders import PebbloSafeLoader

loader = PebbloSafeLoader(
    CSVLoader("data/corp_sens_data.csv"),
    name="acme-corp-rag-1",  # App name (Mandatory)
    owner="Joe Smith",  # Owner (Optional)
    description="Support productivity RAG application",  # Description (Optional)
    api_key="my-api-key",  # API key (Optional, can be set in the environment variable PEBBLO_API_KEY)
    load_semantic=True,  # Load semantic data (Optional, default is False, can be set in the environment variable PEBBLO_LOAD_SEMANTIC)
)
documents = loader.load()
print(documents[0].metadata)
```
