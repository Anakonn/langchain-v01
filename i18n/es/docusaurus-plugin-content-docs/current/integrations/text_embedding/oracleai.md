---
traducido: falso
translated: true
---

# Búsqueda de vectores de IA de Oracle: Generar incrustaciones

La Búsqueda de vectores de IA de Oracle está diseñada para cargas de trabajo de Inteligencia Artificial (IA) que le permite consultar datos en función de la semántica, en lugar de palabras clave. Uno de los mayores beneficios de la Búsqueda de vectores de IA de Oracle es que la búsqueda semántica en datos no estructurados se puede combinar con la búsqueda relacional en datos empresariales en un solo sistema. Esto no solo es poderoso, sino también significativamente más efectivo porque no necesita agregar una base de datos de vectores especializada, eliminando el dolor de la fragmentación de datos entre múltiples sistemas.

La guía demuestra cómo usar las capacidades de incrustación dentro de la Búsqueda de vectores de IA de Oracle para generar incrustaciones para sus documentos usando OracleEmbeddings.

### Requisitos previos

Instale el controlador del cliente de Python de Oracle para usar Langchain con la Búsqueda de vectores de IA de Oracle.

```python
# pip install oracledb
```

### Conectarse a la base de datos de Oracle

El siguiente código de muestra mostrará cómo conectarse a la base de datos de Oracle.

```python
import sys

import oracledb

# please update with your username, password, hostname and service_name
username = "<username>"
password = "<password>"
dsn = "<hostname>/<service_name>"

try:
    conn = oracledb.connect(user=username, password=password, dsn=dsn)
    print("Connection successful!")
except Exception as e:
    print("Connection failed!")
    sys.exit(1)
```

Para la incrustación, tenemos algunas opciones de proveedores que los usuarios pueden elegir, como base de datos, proveedores de terceros como ocigenai, huggingface, openai, etc. Si los usuarios eligen usar un proveedor de terceros, necesitan crear una credencial con la información de autenticación correspondiente. Por otro lado, si los usuarios eligen usar 'base de datos' como proveedor, necesitan cargar un modelo onnx a la base de datos de Oracle para las incrustaciones.

### Cargar modelo ONNX

Para generar incrustaciones, Oracle proporciona algunas opciones de proveedores para que los usuarios elijan. Los usuarios pueden elegir el proveedor 'base de datos' o algunos proveedores de terceros como OCIGENAI, HuggingFace, etc.

***Nota*** Si los usuarios eligen la opción de base de datos, necesitan cargar un modelo ONNX a la base de datos de Oracle. Los usuarios no necesitan cargar un modelo ONNX a la base de datos de Oracle si eligen usar un proveedor de terceros para generar incrustaciones.

Uno de los principales beneficios de usar un modelo ONNX es que los usuarios no necesitan transferir sus datos a terceros para generar incrustaciones. Y también, dado que no implica ninguna llamada de red o API REST, puede proporcionar un mejor rendimiento.

Aquí está el código de muestra para cargar un modelo ONNX a la base de datos de Oracle:

```python
from langchain_community.embeddings.oracleai import OracleEmbeddings

# please update with your related information
# make sure that you have onnx file in the system
onnx_dir = "DEMO_DIR"
onnx_file = "tinybert.onnx"
model_name = "demo_model"

try:
    OracleEmbeddings.load_onnx_model(conn, onnx_dir, onnx_file, model_name)
    print("ONNX model loaded.")
except Exception as e:
    print("ONNX model loading failed!")
    sys.exit(1)
```

### Crear credencial

Por otro lado, si los usuarios eligen usar un proveedor de terceros para generar incrustaciones, necesitan crear una credencial para acceder a los puntos finales del proveedor de terceros.

***Nota:*** Los usuarios no necesitan crear ninguna credencial si eligen usar el proveedor 'base de datos' para generar incrustaciones. Si los usuarios eligen el proveedor de terceros, necesitan crear una credencial para el proveedor de terceros que quieran usar.

Aquí hay un ejemplo de muestra:

```python
try:
    cursor = conn.cursor()
    cursor.execute(
        """
       declare
           jo json_object_t;
       begin
           -- HuggingFace
           dbms_vector_chain.drop_credential(credential_name  => 'HF_CRED');
           jo := json_object_t();
           jo.put('access_token', '<access_token>');
           dbms_vector_chain.create_credential(
               credential_name   =>  'HF_CRED',
               params            => json(jo.to_string));

           -- OCIGENAI
           dbms_vector_chain.drop_credential(credential_name  => 'OCI_CRED');
           jo := json_object_t();
           jo.put('user_ocid','<user_ocid>');
           jo.put('tenancy_ocid','<tenancy_ocid>');
           jo.put('compartment_ocid','<compartment_ocid>');
           jo.put('private_key','<private_key>');
           jo.put('fingerprint','<fingerprint>');
           dbms_vector_chain.create_credential(
               credential_name   => 'OCI_CRED',
               params            => json(jo.to_string));
       end;
       """
    )
    cursor.close()
    print("Credentials created.")
except Exception as ex:
    cursor.close()
    raise
```

### Generar incrustaciones

La Búsqueda de vectores de IA de Oracle proporciona varias formas de generar incrustaciones. Los usuarios pueden cargar un modelo de incrustación ONNX a la base de datos de Oracle y usarlo para generar incrustaciones o usar algunos puntos finales de API de terceros para generar incrustaciones. Consulte la Guía del libro de la Búsqueda de vectores de IA de Oracle para obtener información completa sobre estos parámetros.

***Nota:*** Es posible que los usuarios deban configurar un proxy si desean usar algunos proveedores de generación de incrustaciones de terceros que no sean el proveedor 'base de datos' (es decir, usando el modelo ONNX).

```python
# proxy to be used when we instantiate summary and embedder object
proxy = "<proxy>"
```

El siguiente código de muestra mostrará cómo generar incrustaciones:

```python
from langchain_community.embeddings.oracleai import OracleEmbeddings
from langchain_core.documents import Document

"""
# using ocigenai
embedder_params = {
    "provider": "ocigenai",
    "credential_name": "OCI_CRED",
    "url": "https://inference.generativeai.us-chicago-1.oci.oraclecloud.com/20231130/actions/embedText",
    "model": "cohere.embed-english-light-v3.0",
}

# using huggingface
embedder_params = {
    "provider": "huggingface",
    "credential_name": "HF_CRED",
    "url": "https://api-inference.huggingface.co/pipeline/feature-extraction/",
    "model": "sentence-transformers/all-MiniLM-L6-v2",
    "wait_for_model": "true"
}
"""

# using ONNX model loaded to Oracle Database
embedder_params = {"provider": "database", "model": "demo_model"}

# Remove proxy if not required
embedder = OracleEmbeddings(conn=conn, params=embedder_params, proxy=proxy)
embed = embedder.embed_query("Hello World!")

""" verify """
print(f"Embedding generated by OracleEmbeddings: {embed}")
```

### Demostración de principio a fin

Consulte nuestra guía de demostración completa [Guía de demostración de extremo a extremo de la Búsqueda de vectores de IA de Oracle](https://github.com/langchain-ai/langchain/tree/master/cookbook/oracleai_demo.md) para construir una canalización RAG de extremo a extremo con la ayuda de la Búsqueda de vectores de IA de Oracle.
