---
translated: true
---

# Modal

La [plataforma en la nube Modal](https://modal.com/docs/guide) proporciona un acceso conveniente y bajo demanda a la computación en la nube sin servidor desde scripts de Python en tu computadora local.
Usa `modal` para ejecutar tus propios modelos LLM personalizados en lugar de depender de las API de LLM.

Este ejemplo explica cómo usar LangChain para interactuar con un [punto final web](https://modal.com/docs/guide/webhooks) `modal` HTTPS.

[_Preguntas y respuestas con LangChain_](https://modal.com/docs/guide/ex/potus_speech_qanda) es otro ejemplo de cómo usar LangChain junto con `Modal`. En ese ejemplo, Modal ejecuta la aplicación LangChain de principio a fin y utiliza OpenAI como su API de LLM.

```python
%pip install --upgrade --quiet  modal
```

```python
# Register an account with Modal and get a new token.

!modal token new
```

```output
Launching login page in your browser window...
If this is not showing up, please copy this URL into your web browser manually:
https://modal.com/token-flow/tf-Dzm3Y01234mqmm1234Vcu3
```

La clase de integración [`langchain.llms.modal.Modal`](https://github.com/langchain-ai/langchain/blame/master/langchain/llms/modal.py) requiere que implementes una aplicación Modal con un punto final web que cumpla con la siguiente interfaz JSON:

1. El prompt de LLM se acepta como un valor `str` bajo la clave `"prompt"`
2. La respuesta de LLM se devuelve como un valor `str` bajo la clave `"prompt"`

**Ejemplo de solicitud JSON:**

```json
{
    "prompt": "Identify yourself, bot!",
    "extra": "args are allowed",
}
```

**Ejemplo de respuesta JSON:**

```json
{
    "prompt": "This is the LLM speaking",
}
```

Un ejemplo de función de punto final web 'dummy' Modal que cumple con esta interfaz sería

```python
...
...

class Request(BaseModel):
    prompt: str

@stub.function()
@modal.web_endpoint(method="POST")
def web(request: Request):
    _ = request  # ignore input
    return {"prompt": "hello world"}
```

* Consulta la guía de [puntos finales web](https://modal.com/docs/guide/webhooks#passing-arguments-to-web-endpoints) de Modal para conocer los conceptos básicos de configurar un punto final que cumpla con esta interfaz.
* Consulta el ejemplo de código abierto ['Ejecutar Falcon-40B con AutoGPTQ'](https://modal.com/docs/guide/ex/falcon_gptq) de Modal como punto de partida para tu LLM personalizado.

Una vez que tengas un punto final web Modal implementado, puedes pasar su URL a la clase LLM `langchain.llms.modal.Modal`. Esta clase puede funcionar entonces como un bloque de construcción en tu cadena.

```python
from langchain.chains import LLMChain
from langchain_community.llms import Modal
from langchain_core.prompts import PromptTemplate
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
endpoint_url = "https://ecorp--custom-llm-endpoint.modal.run"  # REPLACE ME with your deployed Modal web endpoint's URL
llm = Modal(endpoint_url=endpoint_url)
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
