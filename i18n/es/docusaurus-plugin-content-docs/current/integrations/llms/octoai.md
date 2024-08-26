---
translated: true
---

# OctoAI

[OctoAI](https://docs.octoai.cloud/docs) ofrece un acceso fácil a un cómputo eficiente y permite a los usuarios integrar su elección de modelos de IA en aplicaciones. El servicio de cómputo `OctoAI` le ayuda a ejecutar, ajustar y escalar aplicaciones de IA fácilmente.

Este ejemplo explica cómo usar LangChain para interactuar con los [puntos finales de LLM](https://octoai.cloud/templates) de `OctoAI`.

## Configuración

Para ejecutar nuestra aplicación de ejemplo, hay dos pasos sencillos a seguir:

1. Obtener un token de API de [la página de tu cuenta de OctoAI](https://octoai.cloud/settings).

2. Pegar tu clave de API en la celda de código a continuación.

Nota: Si deseas usar un modelo de LLM diferente, puedes containerizar el modelo y crear un punto final personalizado de OctoAI, siguiendo [Construir un contenedor desde Python](https://octo.ai/docs/bring-your-own-model/advanced-build-a-container-from-scratch-in-python) y [Crear un punto final personalizado desde un contenedor](https://octo.ai/docs/bring-your-own-model/create-custom-endpoints-from-a-container/create-custom-endpoints-from-a-container), y luego actualizar tu variable de entorno `OCTOAI_API_BASE`.

```python
import os

os.environ["OCTOAI_API_TOKEN"] = "OCTOAI_API_TOKEN"
```

```python
from langchain.chains import LLMChain
from langchain_community.llms.octoai_endpoint import OctoAIEndpoint
from langchain_core.prompts import PromptTemplate
```

## Ejemplo

```python
template = """Below is an instruction that describes a task. Write a response that appropriately completes the request.\n Instruction:\n{question}\n Response: """
prompt = PromptTemplate.from_template(template)
```

```python
llm = OctoAIEndpoint(
    model="llama-2-13b-chat-fp16",
    max_tokens=200,
    presence_penalty=0,
    temperature=0.1,
    top_p=0.9,
)
```

```python
question = "Who was Leonardo da Vinci?"

llm_chain = LLMChain(prompt=prompt, llm=llm)

print(llm_chain.run(question))
```

Leonardo da Vinci fue un verdadero hombre del Renacimiento. Nació en 1452 en Vinci, Italia, y fue conocido por su trabajo en varios campos, incluyendo el arte, la ciencia, la ingeniería y las matemáticas. Se le considera uno de los más grandes pintores de todos los tiempos, y sus obras más famosas incluyen la Mona Lisa y La Última Cena. Además de su arte, da Vinci hizo contribuciones significativas a la ingeniería y la anatomía, y sus diseños de máquinas e inventos estaban siglos adelantados a su tiempo. También se le conoce por sus extensos diarios y dibujos, que proporcionan valiosos conocimientos sobre sus pensamientos e ideas. El legado de da Vinci continúa inspirando e influyendo en artistas, científicos y pensadores de todo el mundo en la actualidad.
