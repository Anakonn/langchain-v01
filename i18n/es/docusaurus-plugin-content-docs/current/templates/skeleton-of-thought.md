---
translated: true
---

# esqueleto-de-pensamiento

Implementa el "Esqueleto de Pensamiento" del [este](https://sites.google.com/view/sot-llm) documento.

Esta técnica hace posible generar generaciones más largas más rápidamente generando primero un esqueleto y luego generando cada punto del esquema.

## Configuración del Entorno

Establezca la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

Para obtener su `OPENAI_API_KEY`, navegue a [Claves de API](https://platform.openai.com/account/api-keys) en su cuenta de OpenAI y cree una nueva clave secreta.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package skeleton-of-thought
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add skeleton-of-thought
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from skeleton_of_thought import chain as skeleton_of_thought_chain

add_routes(app, skeleton_of_thought_chain, path="/skeleton-of-thought")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones de LangChain.
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
Podemos acceder al playground en [http://127.0.0.1:8000/skeleton-of-thought/playground](http://127.0.0.1:8000/skeleton-of-thought/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/skeleton-of-thought")
```
