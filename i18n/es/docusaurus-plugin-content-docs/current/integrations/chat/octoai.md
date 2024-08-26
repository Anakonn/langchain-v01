---
translated: true
---

# ChatOctoAI

[OctoAI](https://docs.octoai.cloud/docs) ofrece un acceso fácil a un cómputo eficiente y permite a los usuarios integrar su elección de modelos de IA en aplicaciones. El servicio de cómputo `OctoAI` le ayuda a ejecutar, ajustar y escalar aplicaciones de IA fácilmente.

Este cuaderno demuestra el uso de `langchain.chat_models.ChatOctoAI` para [endpoints de OctoAI](https://octoai.cloud/text).

## Configuración

Para ejecutar nuestra aplicación de ejemplo, hay dos pasos sencillos a seguir:

1. Obtén un token de API de [tu página de cuenta de OctoAI](https://octoai.cloud/settings).

2. Pega tu token de API en la celda de código a continuación o usa el argumento de palabra clave `octoai_api_token`.

Nota: Si deseas usar un modelo diferente a los [modelos disponibles](https://octoai.cloud/text?selectedTags=Chat), puedes containerizar el modelo y crear un endpoint personalizado de OctoAI siguiendo [Construir un contenedor desde Python](https://octo.ai/docs/bring-your-own-model/advanced-build-a-container-from-scratch-in-python) y [Crear un endpoint personalizado desde un contenedor](https://octo.ai/docs/bring-your-own-model/create-custom-endpoints-from-a-container/create-custom-endpoints-from-a-container), y luego actualizar tu variable de entorno `OCTOAI_API_BASE`.

```python
import os

os.environ["OCTOAI_API_TOKEN"] = "OCTOAI_API_TOKEN"
```

```python
from langchain_community.chat_models import ChatOctoAI
from langchain_core.messages import HumanMessage, SystemMessage
```

## Ejemplo

```python
chat = ChatOctoAI(max_tokens=300, model_name="mixtral-8x7b-instruct")
```

```python
messages = [
    SystemMessage(content="You are a helpful assistant."),
    HumanMessage(content="Tell me about Leonardo da Vinci briefly."),
]
print(chat(messages).content)
```

Leonardo da Vinci (1452-1519) fue un polímata italiano que a menudo se considera uno de los mayores pintores de la historia. Sin embargo, su genio se extendía mucho más allá del arte. También fue científico, inventor, matemático, ingeniero, anatomista, geólogo y cartógrafo.

Da Vinci es más conocido por sus pinturas como la Mona Lisa, La Última Cena y La Virgen de las Rocas. Sus estudios científicos se adelantaron a su tiempo, y sus cuadernos contienen dibujos y descripciones detalladas de varias máquinas, anatomía humana y fenómenos naturales.

A pesar de no haber recibido una educación formal, la insaciable curiosidad y las habilidades de observación de da Vinci lo convirtieron en un pionero en muchos campos. Su trabajo continúa inspirando e influyendo en artistas, científicos y pensadores de hoy en día.
