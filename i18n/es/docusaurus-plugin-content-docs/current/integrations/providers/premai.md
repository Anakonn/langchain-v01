---
translated: true
---

# PremAI

>[PremAI](https://app.premai.io) es una plataforma unificada que le permite construir aplicaciones listas para la producción y potentes impulsadas por GenAI con el menor esfuerzo, para que pueda centrarse más en la experiencia del usuario y el crecimiento general.

## ChatPremAI

Este ejemplo explica cómo usar LangChain para interactuar con diferentes modelos de chat con `ChatPremAI`

### Instalación y configuración

Comenzamos instalando langchain y premai-sdk. Puede escribir el siguiente comando para instalar:

```bash
pip install premai langchain
```

Antes de continuar, asegúrese de haber creado una cuenta en PremAI y ya haber iniciado un proyecto. Si no es así, aquí está cómo puede comenzar de forma gratuita:

1. Inicie sesión en [PremAI](https://app.premai.io/accounts/login/), si es la primera vez que viene, y cree su clave API [aquí](https://app.premai.io/api_keys/).

2. Vaya a [app.premai.io](https://app.premai.io) y esto lo llevará al panel de control del proyecto.

3. Cree un proyecto y esto generará un ID de proyecto (escrito como ID). Este ID lo ayudará a interactuar con su aplicación implementada.

4. Diríjase a LaunchPad (el que tiene el icono 🚀). Y allí implementa el modelo de tu elección. Tu modelo predeterminado será `gpt-4`. También puede establecer y fijar diferentes parámetros de generación (como max-tokens, temperatura, etc.) y también preestablecer tu sistema de mensajes.

Felicitaciones por crear tu primera aplicación implementada en PremAI 🎉 Ahora podemos usar langchain para interactuar con nuestra aplicación.

```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "PremAI"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.system.SystemMessage.html", "title": "PremAI"}, {"imported": "ChatPremAI", "source": "langchain_community.chat_models", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.premai.ChatPremAI.html", "title": "PremAI"}]-->
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_community.chat_models import ChatPremAI
```

### Configurar la instancia de ChatPrem en LangChain

Una vez que importemos nuestros módulos requeridos, configuremos nuestro cliente. Por ahora, supongamos que nuestro `project_id` es 8. Pero asegúrate de usar tu ID de proyecto, de lo contrario, arrojará un error.

Para usar langchain con prem, no necesitas pasar ningún nombre de modelo ni establecer ningún parámetro con nuestro cliente de chat. Todos ellos usarán el nombre del modelo predeterminado y los parámetros del modelo de LaunchPad.

`NOTA:` Si cambia el `model_name` o cualquier otro parámetro como `temperature` al configurar el cliente, anulará las configuraciones predeterminadas existentes.

```python
import os
import getpass

if "PREMAI_API_KEY" not in os.environ:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")

chat = ChatPremAI(project_id=8)
```

### Llamando al modelo

Ahora estás listo. Ahora podemos comenzar a interactuar con nuestra aplicación. `ChatPremAI` admite dos métodos `invoke` (que es lo mismo que `generate`) y `stream`.

El primero nos dará un resultado estático. Mientras que el segundo transmitirá tokens uno por uno. Así es como puede generar completaciones similares a un chat.

### Generación

```python
human_message = HumanMessage(content="Who are you?")

chat.invoke([human_message])
```

¿Lo anterior se ve interesante, verdad? Establecí mi sistema de mensajes predeterminado de LaunchPad como: `Siempre suena como un pirata` También puede anular el sistema de mensajes predeterminado si lo necesita. Así es como puede hacerlo.

```python
system_message = SystemMessage(content="You are a friendly assistant.")
human_message = HumanMessage(content="Who are you?")

chat.invoke([system_message, human_message])
```

También puede cambiar los parámetros de generación al llamar al modelo. Así es como puede hacer eso:

```python
chat.invoke(
    [system_message, human_message],
    temperature = 0.7, max_tokens = 20, top_p = 0.95
)
```

### Notas importantes:

Antes de continuar, tenga en cuenta que la versión actual de ChatPrem no admite los parámetros: [n](https://platform.openai.com/docs/api-reference/chat/create#chat-create-n) y [stop](https://platform.openai.com/docs/api-reference/chat/create#chat-create-stop) no son compatibles.

Proporcionaremos soporte para esos dos parámetros anteriores en versiones posteriores.

### Transmisión

Y finalmente, así es como se hace la transmisión de tokens para aplicaciones dinámicas similares a un chat.

```python
import sys

for chunk in chat.stream("hello how are you"):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

Similar a lo anterior, si desea anular el sistema de mensajes y los parámetros de generación, así es como puede hacerlo.

```python
import sys

for chunk in chat.stream(
    "hello how are you",
    system_prompt = "You are an helpful assistant", temperature = 0.7, max_tokens = 20
):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

## Incrustación

En esta sección, vamos a discutir cómo podemos acceder a diferentes modelos de incrustación usando `PremEmbeddings`. Comencemos haciendo algunas importaciones y definiendo nuestro objeto de incrustación

```python
from langchain_community.embeddings import PremEmbeddings
```

Una vez que importemos nuestros módulos requeridos, configuremos nuestro cliente. Por ahora, supongamos que nuestro `project_id` es 8. Pero asegúrate de usar tu ID de proyecto, de lo contrario, arrojará un error.

```python

import os
import getpass

if os.environ.get("PREMAI_API_KEY") is None:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")

# Define a model as a required parameter here since there is no default embedding model

model = "text-embedding-3-large"
embedder = PremEmbeddings(project_id=8, model=model)
```

Hemos definido nuestro modelo de incrustación. Admitimos muchos modelos de incrustación. Aquí hay una tabla que muestra la cantidad de modelos de incrustación que admitimos.

| Proveedor   | Slug                                     | Tokens de contexto |
|-------------|------------------------------------------|-------------------|
| cohere      | embed-english-v3.0                       | N/A               |
| openai      | text-embedding-3-small                   | 8191              |
| openai      | text-embedding-3-large                   | 8191              |
| openai      | text-embedding-ada-002                   | 8191              |
| replicate   | replicate/all-mpnet-base-v2              | N/A               |
| together    | togethercomputer/Llama-2-7B-32K-Instruct | N/A               |
| mistralai   | mistral-embed                            | 4096              |

Para cambiar el modelo, simplemente necesita copiar el `slug` y acceder a su modelo de incrustación. Ahora comencemos a usar nuestro modelo de incrustación con una sola consulta seguida de múltiples consultas (que también se llama documento)

```python
query = "Hello, this is a test query"
query_result = embedder.embed_query(query)

# Let's print the first five elements of the query embedding vector

print(query_result[:5])
```

Finalmente, incrustemos un documento

```python
documents = [
    "This is document1",
    "This is document2",
    "This is document3"
]

doc_result = embedder.embed_documents(documents)

# Similar to the previous result, let's print the first five element
# of the first document vector

print(doc_result[0][:5])
```
