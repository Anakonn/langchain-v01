---
translated: true
---

# rag-ollama-multi-query

Esta plantilla realiza RAG utilizando Ollama y OpenAI con un recuperador de consultas múltiples.

El recuperador de consultas múltiples es un ejemplo de transformación de consultas, generando múltiples consultas desde diferentes perspectivas basadas en la consulta de entrada del usuario.

Para cada consulta, recupera un conjunto de documentos relevantes y toma la unión única a través de todas las consultas para la síntesis de respuestas.

Utilizamos un LLM privado y local para la tarea estrecha de generación de consultas para evitar llamadas excesivas a una API de LLM más grande.

Consulta un ejemplo de seguimiento para que el LLM de Ollama realice la expansión de consultas [aquí](https://smith.langchain.com/public/8017d04d-2045-4089-b47f-f2d66393a999/r).

Pero utilizamos OpenAI para la tarea más desafiante de síntesis de respuestas (ejemplo de seguimiento completo [aquí](https://smith.langchain.com/public/ec75793b-645b-498d-b855-e8d85e1f6738/r))).

## Configuración del entorno

Para configurar el entorno, necesitas descargar Ollama.

Sigue las instrucciones [aquí](https://python.langchain.com/docs/integrations/chat/ollama).

Puedes elegir el LLM deseado con Ollama.

Esta plantilla utiliza `zephyr`, al que se puede acceder usando `ollama pull zephyr`.

Hay muchas otras opciones disponibles [aquí](https://ollama.ai/library).

Establece la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

## Uso

Para usar este paquete, primero debes instalar la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este paquete, haz:

```shell
langchain app new my-app --package rag-ollama-multi-query
```

Para agregar este paquete a un proyecto existente, ejecuta:

```shell
langchain app add rag-ollama-multi-query
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from rag_ollama_multi_query import chain as rag_ollama_multi_query_chain

add_routes(app, rag_ollama_multi_query_chain, path="/rag-ollama-multi-query")
```

(Opcional) Ahora, configuremos LangSmith. LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones de LangChain. Puedes registrarte en LangSmith [aquí](https://smith.langchain.com/). Si no tienes acceso, puedes omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si estás dentro de este directorio, entonces puedes iniciar una instancia de LangServe directamente mediante:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor en ejecución localmente en [http://localhost:8000](http://localhost:8000)

Puedes ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Puedes acceder al área de juegos en [http://127.0.0.1:8000/rag-ollama-multi-query/playground](http://127.0.0.1:8000/rag-ollama-multi-query/playground)

Para acceder a la plantilla desde el código, usa:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-ollama-multi-query")
```
