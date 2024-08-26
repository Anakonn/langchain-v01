---
translated: true
---

# python-lint

Este agente se especializa en generar código Python de alta calidad con un enfoque en el formato adecuado y el análisis de código. Utiliza `black`, `ruff` y `mypy` para asegurar que el código cumpla con los controles de calidad estándar.

Esto agiliza el proceso de codificación al integrar y responder a estos controles, lo que resulta en una salida de código confiable y consistente.

No puede ejecutar realmente el código que escribe, ya que la ejecución de código puede introducir dependencias adicionales y posibles vulnerabilidades de seguridad.
Esto convierte al agente en una solución segura y eficiente para tareas de generación de código.

Puedes usarlo para generar código Python directamente o conectarlo con agentes de planificación y ejecución.

## Configuración del entorno

- Instalar `black`, `ruff` y `mypy`: `pip install -U black ruff mypy`
- Establecer la variable de entorno `OPENAI_API_KEY`.

## Uso

Para usar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package python-lint
```

Si quieres agregar esto a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add python-lint
```

Y agregar el siguiente código a tu archivo `server.py`:

```python
from python_lint import agent_executor as python_lint_agent

add_routes(app, python_lint_agent, path="/python-lint")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones de LangChain.
Puedes registrarte en LangSmith [aquí](https://smith.langchain.com/).
Si no tienes acceso, puedes omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si estás dentro de este directorio, entonces puedes iniciar una instancia de LangServe directamente mediante:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al playground en [http://127.0.0.1:8000/python-lint/playground](http://127.0.0.1:8000/python-lint/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/python-lint")
```
