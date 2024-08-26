---
translated: true
---

# Cadena de notas (Wikipedia)

Implementa la Cadena de notas como se describe en https://arxiv.org/pdf/2311.09210.pdf de Yu et al. Utiliza Wikipedia para la recuperación.

Echa un vistazo al prompt que se usa aquí https://smith.langchain.com/hub/bagatur/chain-of-note-wiki.

## Configuración del entorno

Utiliza el modelo de chat Anthropic claude-3-sonnet-20240229. Establece la clave API de Anthropic:

```bash
export ANTHROPIC_API_KEY="..."
```

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U "langchain-cli[serve]"
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package chain-of-note-wiki
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add chain-of-note-wiki
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from chain_of_note_wiki import chain as chain_of_note_wiki_chain

add_routes(app, chain_of_note_wiki_chain, path="/chain-of-note-wiki")
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
Podemos acceder al playground en [http://127.0.0.1:8000/chain-of-note-wiki/playground](http://127.0.0.1:8000/chain-of-note-wiki/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/chain-of-note-wiki")
```
