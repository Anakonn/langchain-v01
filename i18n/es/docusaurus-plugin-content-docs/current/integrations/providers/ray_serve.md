---
translated: true
---

# Ray Serve

[Ray Serve](https://docs.ray.io/en/latest/serve/index.html) es una biblioteca de servicio de modelos escalable para construir API de inferencia en línea. Serve es particularmente adecuado para la composición de sistemas, lo que le permite construir un servicio de inferencia complejo que consta de múltiples cadenas y lógica empresarial, todo en código de Python.

## Objetivo de este cuaderno

Este cuaderno muestra un ejemplo sencillo de cómo implementar una cadena de OpenAI en producción. Puede extenderlo para implementar sus propios modelos autoalojados donde puede definir fácilmente la cantidad de recursos de hardware (GPU y CPU) necesarios para ejecutar su modelo de manera eficiente en producción. Lea más sobre las opciones disponibles, incluido el escalado automático, en la [documentación](https://docs.ray.io/en/latest/serve/getting_started.html) de Ray Serve.

## Configurar Ray Serve

Instale ray con `pip install ray[serve]`.

## Esqueleto general

El esqueleto general para implementar un servicio es el siguiente:

```python
# 0: Import ray serve and request from starlette
from ray import serve
from starlette.requests import Request


# 1: Define a Ray Serve deployment.
@serve.deployment
class LLMServe:
    def __init__(self) -> None:
        # All the initialization code goes here
        pass

    async def __call__(self, request: Request) -> str:
        # You can parse the request here
        # and return a response
        return "Hello World"


# 2: Bind the model to deployment
deployment = LLMServe.bind()

# 3: Run the deployment
serve.api.run(deployment)
```

```python
# Shutdown the deployment
serve.api.shutdown()
```

## Ejemplo de implementación de una cadena de OpenAI con indicaciones personalizadas

Obtenga una clave de API de OpenAI desde [aquí](https://platform.openai.com/account/api-keys). Al ejecutar el siguiente código, se le pedirá que proporcione su clave de API.

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
```

```python
from getpass import getpass

OPENAI_API_KEY = getpass()
```

```python
@serve.deployment
class DeployLLM:
    def __init__(self):
        # We initialize the LLM, template and the chain here
        llm = OpenAI(openai_api_key=OPENAI_API_KEY)
        template = "Question: {question}\n\nAnswer: Let's think step by step."
        prompt = PromptTemplate.from_template(template)
        self.chain = LLMChain(llm=llm, prompt=prompt)

    def _run_chain(self, text: str):
        return self.chain(text)

    async def __call__(self, request: Request):
        # 1. Parse the request
        text = request.query_params["text"]
        # 2. Run the chain
        resp = self._run_chain(text)
        # 3. Return the response
        return resp["text"]
```

Ahora podemos vincular la implementación.

```python
# Bind the model to deployment
deployment = DeployLLM.bind()
```

Podemos asignar el número de puerto y el host cuando queramos ejecutar la implementación.

```python
# Example port number
PORT_NUMBER = 8282
# Run the deployment
serve.api.run(deployment, port=PORT_NUMBER)
```

Ahora que el servicio está implementado en el puerto `localhost:8282`, podemos enviar una solicitud post para obtener los resultados.

```python
import requests

text = "What NFL team won the Super Bowl in the year Justin Beiber was born?"
response = requests.post(f"http://localhost:{PORT_NUMBER}/?text={text}")
print(response.content.decode())
```
