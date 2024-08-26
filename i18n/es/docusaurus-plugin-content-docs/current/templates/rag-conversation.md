---
translated: true
---

# Conversación rag

Esta plantilla se usa para [conversacional](https://python.langchain.com/docs/expression_language/cookbook/retrieval#conversational-retrieval-chain) [recuperación](https://python.langchain.com/docs/use_cases/question_answering/), que es uno de los casos de uso más populares de LLM.

Pasa tanto un historial de conversación como documentos recuperados a un LLM para su síntesis.

## Configuración del entorno

Esta plantilla usa Pinecone como un almacén de vectores y requiere que se establezcan `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT` y `PINECONE_INDEX`.

Establezca la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package rag-conversation
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add rag-conversation
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from rag_conversation import chain as rag_conversation_chain

add_routes(app, rag_conversation_chain, path="/rag-conversation")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones LangChain.
Puede registrarse en LangSmith [aquí](https://smith.langchain.com/).
Si no tiene acceso, puede omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si está dentro de este directorio, entonces puede iniciar una instancia de LangServe directamente por:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al área de juegos en [http://127.0.0.1:8000/rag-conversation/playground](http://127.0.0.1:8000/rag-conversation/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-conversation")
```
