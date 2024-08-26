---
translated: true
---

# propositional-retrieval

Esta plantilla demuestra la estrategia de indexación de vectores múltiples propuesta por Chen, et. al.'s [Dense X Retrieval: What Retrieval Granularity Should We Use?](https://arxiv.org/abs/2312.06648). El prompt, que puedes [probar en el hub](https://smith.langchain.com/hub/wfh/proposal-indexing), le indica a un LLM que genere "proposiciones" descontextualizadas que se pueden vectorizar para aumentar la precisión de la recuperación. Puedes ver la definición completa en `proposal_chain.py`.

## Almacenamiento

Para esta demostración, indexamos un artículo académico simple usando el RecursiveUrlLoader y almacenamos toda la información del recuperador localmente (usando chroma y un bytestore almacenado en el sistema de archivos local). Puedes modificar la capa de almacenamiento en `storage.py`.

## Configuración del entorno

Establece la variable de entorno `OPENAI_API_KEY` para acceder a `gpt-3.5` y a las clases de OpenAI Embeddings.

## Indexación

Crea el índice ejecutando lo siguiente:

```python
poetry install
poetry run python propositional_retrieval/ingest.py
```

## Uso

Para usar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package propositional-retrieval
```

Si quieres agregar esto a un proyecto existente, puedes ejecutar:

```shell
langchain app add propositional-retrieval
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from propositional_retrieval import chain

add_routes(app, chain, path="/propositional-retrieval")
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

Si estás dentro de este directorio, entonces puedes iniciar una instancia de LangServe directamente con:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al playground en [http://127.0.0.1:8000/propositional-retrieval/playground](http://127.0.0.1:8000/propositional-retrieval/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/propositional-retrieval")
```
