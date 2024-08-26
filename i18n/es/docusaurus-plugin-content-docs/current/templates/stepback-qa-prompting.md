---
translated: true
---

# stepback-qa-prompting

Esta plantilla replica la técnica de "Step-Back" de generación de preguntas que mejora el rendimiento en preguntas complejas al hacer primero una pregunta de "paso atrás".

Esta técnica se puede combinar con aplicaciones regulares de respuesta a preguntas mediante la recuperación tanto de la pregunta original como de la pregunta de paso atrás.

Lea más sobre esto en el documento [aquí](https://arxiv.org/abs/2310.06117) y en un excelente artículo de blog de Cobus Greyling [aquí](https://cobusgreyling.medium.com/a-new-prompt-engineering-technique-has-been-introduced-called-step-back-prompting-b00e8954cacb)

Modificaremos ligeramente los mensajes para que funcionen mejor con los modelos de chat en esta plantilla.

## Configuración del entorno

Establezca la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package stepback-qa-prompting
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add stepback-qa-prompting
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from stepback_qa_prompting.chain import chain as stepback_qa_prompting_chain

add_routes(app, stepback_qa_prompting_chain, path="/stepback-qa-prompting")
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

Esto iniciará la aplicación FastAPI con un servidor en ejecución localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al área de juegos en [http://127.0.0.1:8000/stepback-qa-prompting/playground](http://127.0.0.1:8000/stepback-qa-prompting/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/stepback-qa-prompting")
```
