---
translated: true
---

# rag-chroma-privado

Esta plantilla realiza RAG sin depender de APIs externas.

Utiliza Ollama el LLM, GPT4All para incrustaciones y Chroma para el almacén de vectores.

El almacén de vectores se crea en `chain.py` y por defecto indexa [popular blog posts on Agents](https://lilianweng.github.io/posts/2023-06-23-agent/) para responder preguntas.

## Configuración del entorno

Para configurar el entorno, necesitas descargar Ollama.

Sigue las instrucciones [aquí](https://python.langchain.com/docs/integrations/chat/ollama).

Puedes elegir el LLM deseado con Ollama.

Esta plantilla usa `llama2:7b-chat`, al que se puede acceder usando `ollama pull llama2:7b-chat`.

Hay muchas otras opciones disponibles [aquí](https://ollama.ai/library).

Este paquete también usa incrustaciones de [GPT4All](https://python.langchain.com/docs/integrations/text_embedding/gpt4all).

## Uso

Para usar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package rag-chroma-private
```

Si quieres agregar esto a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add rag-chroma-private
```

Y agregar el siguiente código a tu archivo `server.py`:

```python
from rag_chroma_private import chain as rag_chroma_private_chain

add_routes(app, rag_chroma_private_chain, path="/rag-chroma-private")
```

(Opcional) Ahora configuremos LangSmith. LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones LangChain. Puedes registrarte en LangSmith [aquí](https://smith.langchain.com/). Si no tienes acceso, puedes omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si estás dentro de este directorio, entonces puedes iniciar una instancia de LangServe directamente por:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al playground en [http://127.0.0.1:8000/rag-chroma-private/playground](http://127.0.0.1:8000/rag-chroma-private/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-chroma-private")
```

El paquete creará y agregará documentos a la base de datos de vectores en `chain.py`. De forma predeterminada, cargará una entrada de blog popular sobre agentes. Sin embargo, puedes elegir entre una gran cantidad de cargadores de documentos [aquí](https://python.langchain.com/docs/integrations/document_loaders).
