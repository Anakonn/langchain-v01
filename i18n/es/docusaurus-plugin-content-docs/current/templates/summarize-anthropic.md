---
translated: true
---

# Resumir Anthropic

Esta plantilla usa `claude-3-sonnet-20240229` de Anthropic para resumir documentos largos.

Aprovecha una gran ventana de contexto de 100k tokens, lo que permite el resumen de documentos de más de 100 páginas.

Puede ver el mensaje de resumen en `chain.py`.

## Configuración del entorno

Establezca la variable de entorno `ANTHROPIC_API_KEY` para acceder a los modelos de Anthropic.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package summarize-anthropic
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add summarize-anthropic
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from summarize_anthropic import chain as summarize_anthropic_chain

add_routes(app, summarize_anthropic_chain, path="/summarize-anthropic")
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
Podemos acceder al área de juegos en [http://127.0.0.1:8000/summarize-anthropic/playground](http://127.0.0.1:8000/summarize-anthropic/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/summarize-anthropic")
```
