---
translated: true
---

# rag-timescale-conversation

Esta plantilla se utiliza para [conversacional](https://python.langchain.com/docs/expression_language/cookbook/retrieval#conversational-retrieval-chain) [recuperación](https://python.langchain.com/docs/use_cases/question_answering/), que es uno de los casos de uso más populares de LLM.

Pasa tanto el historial de conversación como los documentos recuperados a un LLM para su síntesis.

## Configuración del entorno

Esta plantilla utiliza Timescale Vector como un vectorstore y requiere que `TIMESCALES_SERVICE_URL`. Regístrese para una prueba de 90 días [aquí](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) si aún no tiene una cuenta.

Para cargar el conjunto de datos de muestra, establezca `LOAD_SAMPLE_DATA=1`. Para cargar su propio conjunto de datos, consulte la sección a continuación.

Establezca la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U "langchain-cli[serve]"
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package rag-timescale-conversation
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add rag-timescale-conversation
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from rag_timescale_conversation import chain as rag_timescale_conversation_chain

add_routes(app, rag_timescale_conversation_chain, path="/rag-timescale_conversation")
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
Podemos acceder al playground en [http://127.0.0.1:8000/rag-timescale-conversation/playground](http://127.0.0.1:8000/rag-timescale-conversation/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-timescale-conversation")
```

Consulte el cuaderno `rag_conversation.ipynb` para ver un ejemplo de uso.

## Carga de su propio conjunto de datos

Para cargar su propio conjunto de datos, deberá crear una función `load_dataset`. Puede ver un ejemplo, en la
función `load_ts_git_dataset` definida en el archivo `load_sample_dataset.py`. Luego puede ejecutar esto como una
función independiente (por ejemplo, en un script de bash) o agregarlo a chain.py (pero entonces debe ejecutarlo solo una vez).
