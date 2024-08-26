---
translated: true
---

# Azure OpenAI

Este cuaderno explica cómo usar Langchain con [Azure OpenAI](https://aka.ms/azure-openai).

La API de Azure OpenAI es compatible con la API de OpenAI. El paquete de Python `openai` facilita el uso de OpenAI y Azure OpenAI. Puedes llamar a Azure OpenAI de la misma manera que llamas a OpenAI, con las excepciones que se indican a continuación.

## Configuración de la API

Puedes configurar el paquete `openai` para que use Azure OpenAI mediante variables de entorno. El siguiente es para `bash`:

```bash
# The API version you want to use: set this to `2023-12-01-preview` for the released version.
export OPENAI_API_VERSION=2023-12-01-preview
# The base URL for your Azure OpenAI resource.  You can find this in the Azure portal under your Azure OpenAI resource.
export AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
# The API key for your Azure OpenAI resource.  You can find this in the Azure portal under your Azure OpenAI resource.
export AZURE_OPENAI_API_KEY=<your Azure OpenAI API key>
```

Alternativamente, puedes configurar la API directamente en tu entorno de ejecución de Python:

```python
import os
os.environ["OPENAI_API_VERSION"] = "2023-12-01-preview"
```

## Autenticación de Azure Active Directory

Hay dos formas de autenticarse en Azure OpenAI:
- Clave de API
- Azure Active Directory (AAD)

Usar la clave de API es la forma más sencilla de empezar. Puedes encontrar tu clave de API en el portal de Azure, en tu recurso de Azure OpenAI.

Sin embargo, si tienes requisitos de seguridad complejos, es posible que quieras usar Azure Active Directory. Puedes encontrar más información sobre cómo usar AAD con Azure OpenAI [aquí](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/managed-identity).

Si estás desarrollando localmente, necesitarás tener instalada la CLI de Azure y haber iniciado sesión. Puedes instalar la CLI de Azure [aquí](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli). Luego, ejecuta `az login` para iniciar sesión.

Agrega un rol de asignación de roles de Azure `Cognitive Services OpenAI User` con ámbito en tu recurso de Azure OpenAI. Esto te permitirá obtener un token de AAD para usar con Azure OpenAI. Puedes otorgar esta asignación de roles a un usuario, grupo, entidad de servicio o identidad administrada. Para obtener más información sobre los roles de RBAC de Azure OpenAI, consulta [aquí](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/role-based-access-control).

Para usar AAD en Python con LangChain, instala el paquete `azure-identity`. Luego, establece `OPENAI_API_TYPE` en `azure_ad`. A continuación, usa la clase `DefaultAzureCredential` para obtener un token de AAD llamando a `get_token` como se muestra a continuación. Finalmente, establece la variable de entorno `OPENAI_API_KEY` con el valor del token.

```python
import os
from azure.identity import DefaultAzureCredential

# Get the Azure Credential
credential = DefaultAzureCredential()

# Set the API type to `azure_ad`
os.environ["OPENAI_API_TYPE"] = "azure_ad"
# Set the API_KEY to the token from the Azure credential
os.environ["OPENAI_API_KEY"] = credential.get_token("https://cognitiveservices.azure.com/.default").token
```

La clase `DefaultAzureCredential` es una forma sencilla de empezar con la autenticación de AAD. También puedes personalizar la cadena de credenciales si es necesario. En el ejemplo que se muestra a continuación, primero intentamos la Identidad administrada y luego recurrimos a la CLI de Azure. Esto es útil si estás ejecutando tu código en Azure, pero quieres desarrollar localmente.

```python
from azure.identity import ChainedTokenCredential, ManagedIdentityCredential, AzureCliCredential

credential = ChainedTokenCredential(
    ManagedIdentityCredential(),
    AzureCliCredential()
)
```

## Implementaciones

Con Azure OpenAI, configuras tus propias implementaciones de los modelos comunes de GPT-3 y Codex. Al llamar a la API, debes especificar la implementación que quieres usar.

_**Nota**: Estos documentos son para los modelos de finalización de texto de Azure. Los modelos como GPT-4 son modelos de chat. Tienen una interfaz ligeramente diferente y se pueden acceder a través de la clase `AzureChatOpenAI`. Para obtener documentación sobre Azure Chat, consulta [Azure Chat OpenAI documentation](/docs/integrations/chat/azure_chat_openai)._

Supongamos que el nombre de tu implementación es `gpt-35-turbo-instruct-prod`. En la API de Python `openai`, puedes especificar esta implementación con el parámetro `engine`. Por ejemplo:

```python
import openai

client = AzureOpenAI(
    api_version="2023-12-01-preview",
)

response = client.completions.create(
    model="gpt-35-turbo-instruct-prod",
    prompt="Test prompt"
)
```

```python
%pip install --upgrade --quiet  langchain-openai
```

```python
import os

os.environ["OPENAI_API_VERSION"] = "2023-12-01-preview"
os.environ["AZURE_OPENAI_ENDPOINT"] = "..."
os.environ["AZURE_OPENAI_API_KEY"] = "..."
```

```python
# Import Azure OpenAI
from langchain_openai import AzureOpenAI
```

```python
# Create an instance of Azure OpenAI
# Replace the deployment name with your own
llm = AzureOpenAI(
    deployment_name="gpt-35-turbo-instruct-0914",
)
```

```python
# Run the LLM
llm.invoke("Tell me a joke")
```

```output
" Why couldn't the bicycle stand up by itself?\n\nBecause it was two-tired!"
```

También podemos imprimir el LLM y ver su impresión personalizada.

```python
print(llm)
```

```output
[1mAzureOpenAI[0m
Params: {'deployment_name': 'gpt-35-turbo-instruct-0914', 'model_name': 'gpt-3.5-turbo-instruct', 'temperature': 0.7, 'top_p': 1, 'frequency_penalty': 0, 'presence_penalty': 0, 'n': 1, 'logit_bias': {}, 'max_tokens': 256}
```
