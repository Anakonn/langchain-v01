---
translated: true
---

# guardrails-output-parser

Esta plantilla utiliza [guardrails-ai](https://github.com/guardrails-ai/guardrails) para validar la salida de LLM.

El `GuardrailsOutputParser` se establece en `chain.py`.

El ejemplo predeterminado protege contra las malas palabras.

## Configuración del entorno

Establece la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package guardrails-output-parser
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add guardrails-output-parser
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from guardrails_output_parser.chain import chain as guardrails_output_parser_chain

add_routes(app, guardrails_output_parser_chain, path="/guardrails-output-parser")
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
Podemos acceder al área de juegos en [http://127.0.0.1:8000/guardrails-output-parser/playground](http://127.0.0.1:8000/guardrails-output-parser/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/guardrails-output-parser")
```

Si Guardrails no encuentra ninguna mala palabra, entonces se devuelve la salida traducida tal cual. Si Guardrails sí encuentra malas palabras, entonces se devuelve una cadena vacía.
