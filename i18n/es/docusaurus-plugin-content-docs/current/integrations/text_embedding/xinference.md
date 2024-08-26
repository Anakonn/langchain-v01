---
translated: true
---

# Inferencia de Xorbits (Xinference)

Este cuaderno explica cómo usar los incrustaciones de Xinference dentro de LangChain

## Instalación

Instala `Xinference` a través de PyPI:

```python
%pip install --upgrade --quiet  "xinference[all]"
```

## Implementar Xinference localmente o en un clúster distribuido.

Para la implementación local, ejecuta `xinference`.

Para implementar Xinference en un clúster, primero inicia un supervisor de Xinference usando `xinference-supervisor`. También puedes usar la opción -p para especificar el puerto y -H para especificar el host. El puerto predeterminado es 9997.

Luego, inicia los trabajadores de Xinference usando `xinference-worker` en cada servidor en el que quieras ejecutarlos.

Puedes consultar el archivo README de [Xinference](https://github.com/xorbitsai/inference) para obtener más información.

## Envoltura

Para usar Xinference con LangChain, primero debes iniciar un modelo. Puedes usar la interfaz de línea de comandos (CLI) para hacerlo:

```python
!xinference launch -n vicuna-v1.3 -f ggmlv3 -q q4_0
```

```output
Model uid: 915845ee-2a04-11ee-8ed4-d29396a3f064
```

Se te devuelve un UID de modelo para que lo uses. Ahora puedes usar los incrustaciones de Xinference con LangChain:

```python
from langchain_community.embeddings import XinferenceEmbeddings

xinference = XinferenceEmbeddings(
    server_url="http://0.0.0.0:9997", model_uid="915845ee-2a04-11ee-8ed4-d29396a3f064"
)
```

```python
query_result = xinference.embed_query("This is a test query")
```

```python
doc_result = xinference.embed_documents(["text A", "text B"])
```

Por último, termina el modelo cuando ya no lo necesites:

```python
!xinference terminate --model-uid "915845ee-2a04-11ee-8ed4-d29396a3f064"
```
