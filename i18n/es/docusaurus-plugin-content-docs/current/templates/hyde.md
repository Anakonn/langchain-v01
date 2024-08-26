---
translated: true
---

# hyde

Esta plantilla usa HyDE con RAG.

Hyde es un método de recuperación que significa Hypothetical Document Embeddings (HyDE). Es un método utilizado para mejorar la recuperación generando un documento hipotético para una consulta entrante.

El documento se incorpora y ese incorporación se utiliza para buscar documentos reales que son similares al documento hipotético.

El concepto subyacente es que el documento hipotético puede estar más cerca en el espacio de incorporación que la consulta.

Para una descripción más detallada, consulte el documento [aquí](https://arxiv.org/abs/2212.10496).

## Configuración del entorno

Establezca la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package hyde
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add hyde
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from hyde.chain import chain as hyde_chain

add_routes(app, hyde_chain, path="/hyde")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar las aplicaciones de LangChain.
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
Podemos acceder al playground en [http://127.0.0.1:8000/hyde/playground](http://127.0.0.1:8000/hyde/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/hyde")
```
