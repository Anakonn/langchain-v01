---
translated: true
---

# índice de vector de momento rag

Esta plantilla realiza RAG utilizando el Índice de Vector de Momento (MVI) y OpenAI.

> MVI: el índice de vector más productivo y fácil de usar, sin servidor, para tus datos. Para comenzar con MVI, simplemente regístrate en una cuenta. No hay necesidad de manejar la infraestructura, administrar servidores o preocuparte por el escalado. MVI es un servicio que se escala automáticamente para satisfacer tus necesidades. Combínalo con otros servicios de Momento, como Momento Cache para almacenar en caché los mensajes y como almacén de sesiones, o Momento Topics como un sistema de publicación/suscripción para difundir eventos a tu aplicación.

Para registrarte y acceder a MVI, visita la [Consola de Momento](https://console.gomomento.com/).

## Configuración del entorno

Esta plantilla utiliza el Índice de Vector de Momento como un almacén de vectores y requiere que se establezcan `MOMENTO_API_KEY` y `MOMENTO_INDEX_NAME`.

Ve a la [consola](https://console.gomomento.com/) para obtener una clave API.

Establece la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

## Uso

Para usar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package rag-momento-vector-index
```

Si quieres agregar esto a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add rag-momento-vector-index
```

Y agregar el siguiente código a tu archivo `server.py`:

```python
from rag_momento_vector_index import chain as rag_momento_vector_index_chain

add_routes(app, rag_momento_vector_index_chain, path="/rag-momento-vector-index")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar las aplicaciones de LangChain.
Puedes registrarte en LangSmith [aquí](https://smith.langchain.com/).
Si no tienes acceso, puedes omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si estás dentro de este directorio, entonces puedes iniciar una instancia de LangServe directamente mediante:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al área de juegos en [http://127.0.0.1:8000/rag-momento-vector-index/playground](http://127.0.0.1:8000/rag-momento-vector-index/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-momento-vector-index")
```

## Indexación de datos

Hemos incluido un módulo de muestra para indexar datos. Está disponible en `rag_momento_vector_index/ingest.py`. Verás una línea comentada en `chain.py` que invoca esto. Descomenta para usar.
