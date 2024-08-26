---
translated: true
---

# Infinispan

Infinispan es una cuadrícula de datos clave-valor de código abierto, que puede funcionar como un solo nodo, así como distribuido.

La búsqueda vectorial se admite desde la versión 15.x.
Para más información: [Infinispan Home](https://infinispan.org)

```python
# Ensure that all we need is installed
# You may want to skip this
%pip install sentence-transformers
%pip install langchain
%pip install langchain_core
%pip install langchain_community
```

# Configuración

Para ejecutar esta demostración, necesitamos una instancia de Infinispan en ejecución sin autenticación y un archivo de datos.
En las tres celdas siguientes vamos a:
- descargar el archivo de datos
- crear la configuración
- ejecutar Infinispan en docker

```bash
%%bash
#get an archive of news
wget https://raw.githubusercontent.com/rigazilla/infinispan-vector/main/bbc_news.csv.gz
```

```bash
%%bash
#create infinispan configuration file
echo 'infinispan:
  cache-container:
    name: default
    transport:
      cluster: cluster
      stack: tcp
  server:
    interfaces:
      interface:
        name: public
        inet-address:
          value: 0.0.0.0
    socket-bindings:
      default-interface: public
      port-offset: 0
      socket-binding:
        name: default
        port: 11222
    endpoints:
      endpoint:
        socket-binding: default
        rest-connector:
' > infinispan-noauth.yaml
```

```python
!docker rm --force infinispanvs-demo
!docker run -d --name infinispanvs-demo -v $(pwd):/user-config  -p 11222:11222 infinispan/server:15.0 -c /user-config/infinispan-noauth.yaml
```

# El código

## Elige un modelo de incrustación

En esta demostración, estamos usando
un modelo de incrustación HuggingFace.

```python
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_core.embeddings import Embeddings

model_name = "sentence-transformers/all-MiniLM-L12-v2"
hf = HuggingFaceEmbeddings(model_name=model_name)
```

## Configurar la caché de Infinispan

Infinispan es un almacén de clave-valor muy flexible, puede almacenar bits en bruto, así como tipos de datos complejos.
El usuario tiene total libertad en la configuración de la cuadrícula de datos, pero para tipos de datos simples, todo se configura automáticamente por la capa de Python. Aprovechamos esta función para que podamos centrarnos en nuestra aplicación.

## Preparar los datos

En esta demostración, nos basamos en la configuración predeterminada, por lo que los textos, los metadatos y los vectores se encuentran en la misma caché, pero otras opciones son posibles: es decir, el contenido se puede almacenar en otro lugar y el almacén de vectores podría contener solo una referencia al contenido real.

```python
import csv
import gzip
import time

# Open the news file and process it as a csv
with gzip.open("bbc_news.csv.gz", "rt", newline="") as csvfile:
    spamreader = csv.reader(csvfile, delimiter=",", quotechar='"')
    i = 0
    texts = []
    metas = []
    embeds = []
    for row in spamreader:
        # first and fifth values are joined to form the content
        # to be processed
        text = row[0] + "." + row[4]
        texts.append(text)
        # Store text and title as metadata
        meta = {"text": row[4], "title": row[0]}
        metas.append(meta)
        i = i + 1
        # Change this to change the number of news you want to load
        if i >= 5000:
            break
```

# Poblar el almacén de vectores

```python
# add texts and fill vector db

from langchain_community.vectorstores import InfinispanVS

ispnvs = InfinispanVS.from_texts(texts, hf, metas)
```

# Una función auxiliar que imprime los documentos de resultado

De forma predeterminada, InfinispanVS devuelve el campo `ŧext` protobuf en el `Document.page_content`
y todos los campos protobuf restantes (excepto el vector) en el `metadata`. Este comportamiento es
configurable a través de funciones lambda en la configuración.

```python
def print_docs(docs):
    for res, i in zip(docs, range(len(docs))):
        print("----" + str(i + 1) + "----")
        print("TITLE: " + res.metadata["title"])
        print(res.page_content)
```

# ¡Inténtalo!

A continuación, algunas consultas de muestra

```python
docs = ispnvs.similarity_search("European nations", 5)
print_docs(docs)
```

```python
print_docs(ispnvs.similarity_search("Milan fashion week begins", 2))
```

```python
print_docs(ispnvs.similarity_search("Stock market is rising today", 4))
```

```python
print_docs(ispnvs.similarity_search("Why cats are so viral?", 2))
```

```python
print_docs(ispnvs.similarity_search("How to stay young", 5))
```

```python
!docker rm --force infinispanvs-demo
```
