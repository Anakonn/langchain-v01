---
fixed: true
translated: true
---

# 🦜️🏓 LangServe

[![Release Notes](https://img.shields.io/github/release/langchain-ai/langserve)](https://github.com/langchain-ai/langserve/releases)
[![Downloads](https://static.pepy.tech/badge/langserve/month)](https://pepy.tech/project/langserve)
[![Open Issues](https://img.shields.io/github/issues-raw/langchain-ai/langserve)](https://github.com/langchain-ai/langserve/issues)
[![](https://dcbadge.vercel.app/api/server/6adMQxSpJS?compact=true&style=flat)](https://discord.com/channels/1038097195422978059/1170024642245832774)

🚩 Vamos a lanzar una versión alojada de LangServe para despliegues de aplicaciones LangChain con un solo clic. [Regístrate aquí](https://airtable.com/apppQ9p5XuujRl3wJ/shrABpHWdxry8Bacm) para unirte a la lista de espera.

## Resumen

[LangServe](https://github.com/langchain-ai/langserve) ayuda a los desarrolladores a desplegar `LangChain` [runnables y chains](https://python.langchain.com/docs/expression_language/) como una API REST.

Esta biblioteca está integrada con [FastAPI](https://fastapi.tiangolo.com/) y utiliza [pydantic](https://docs.pydantic.dev/latest/) para la validación de datos.

Además, proporciona un cliente que se puede usar para llamar a runnables desplegados en un servidor. Un cliente en JavaScript está disponible en [LangChain.js](https://js.langchain.com/docs/ecosystem/langserve).

## Características

- Esquemas de Entrada y Salida inferidos automáticamente de tu objeto LangChain y aplicados en cada llamada a la API, con mensajes de error detallados
- Página de documentación de la API con JSONSchema y Swagger (insertar enlace de ejemplo)
- Endpoints eficientes `/invoke`, `/batch` y `/stream` con soporte para muchas solicitudes concurrentes en un solo servidor
- Endpoint `/stream_log` para transmitir todos (o algunos) pasos intermedios de tu chain/agent
- **nuevo** desde la versión 0.0.40, soporta `/stream_events` para facilitar la transmisión sin necesidad de analizar la salida de `/stream_log`.
- Página de Playground en `/playground/` con salida en streaming y pasos intermedios
- Trazado incorporado (opcional) a [LangSmith](https://www.langchain.com/langsmith), solo agrega tu clave API (ver [Instrucciones](https://docs.smith.langchain.com/)))
- Todo construido con bibliotecas de Python de código abierto probadas en batalla como FastAPI, Pydantic, uvloop y asyncio.
- Usa el SDK del cliente para llamar a un servidor LangServe como si fuera un Runnable ejecutándose localmente (o llama a la API HTTP directamente)
- [LangServe Hub](https://github.com/langchain-ai/langchain/blob/master/templates/README.md)

## Limitaciones

- Los callbacks del cliente aún no son compatibles para eventos que se originan en el servidor
- No se generarán documentos OpenAPI cuando se use Pydantic V2. Fast API no soporta [la mezcla de namespaces de pydantic v1 y v2](https://github.com/tiangolo/fastapi/issues/10360). Ver la sección más abajo para más detalles.

## LangServe alojado

Vamos a lanzar una versión alojada de LangServe para despliegues de aplicaciones LangChain con un solo clic. [Regístrate aquí](https://airtable.com/apppQ9p5XuujRl3wJ/shrABpHWdxry8Bacm) para unirte a la lista de espera.

## Seguridad

- Vulnerabilidad en las versiones 0.0.13 - 0.0.15 -- el endpoint del playground permite acceder a archivos arbitrarios en el servidor. [Resuelto en 0.0.16](https://github.com/langchain-ai/langserve/pull/98).

## Instalación

Para cliente y servidor:

```bash
pip install "langserve[all]"
```

o `pip install "langserve[client]"` para código de cliente, y `pip install "langserve[server]"` para código de servidor.

## LangChain CLI 🛠️

Usa el CLI de `LangChain` para iniciar rápidamente un proyecto de `LangServe`.

Para usar el CLI de langchain asegúrate de tener una versión reciente de `langchain-cli` instalada. Puedes instalarlo con `pip install -U langchain-cli`.

## Configuración

**Nota**: Usamos `poetry` para la gestión de dependencias. Por favor, sigue la [documentación](https://python-poetry.org/docs/) de poetry para aprender más sobre ello.

### 1. Crea una nueva aplicación usando el comando del CLI de langchain

```sh
langchain app new my-app
```

### 2. Define el runnable en add_routes. Ve a server.py y edita

```sh
add_routes(app. NotImplemented)
```

### 3. Usa `poetry` para agregar paquetes de terceros (por ejemplo, langchain-openai, langchain-anthropic, langchain-mistral, etc.).

```sh
poetry add [package-name] // e.g `poetry add langchain-openai`
```

### 4. Configura las variables de entorno relevantes. Por ejemplo,

```sh
export OPENAI_API_KEY="sk-..."
```

### 5. Sirve tu aplicación

```sh
poetry run langchain serve --port=8100
```

## Ejemplos

Pon en marcha tu instancia de LangServe rápidamente con [LangChain Templates](https://github.com/langchain-ai/langchain/blob/master/templates/README.md).

Para más ejemplos, ver los templates [índice](https://github.com/langchain-ai/langchain/blob/master/templates/docs/INDEX.md) o el directorio de [ejemplos](https://github.com/langchain-ai/langserve/tree/main/examples).

| Descripción                                                                                                                                                                                                                                                        | Enlaces                                                                                                                                                                                                                               |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LLMs** Ejemplo mínimo que reserva modelos de chat de OpenAI y Anthropic. Usa asincronía, soporta batching y streaming.                                                                                                                                              | [server](https://github.com/langchain-ai/langserve/tree/main/examples/llm/server.py), [client](https://github.com/langchain-ai/langserve/blob/main/examples/llm/client.ipynb)                                                       |
| **Retriever** Servidor simple que expone un retriever como un runnable.                                                                                                                                                                                                | [server](https://github.com/langchain-ai/langserve/tree/main/examples/retrieval/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/retrieval/client.ipynb)                                           |
| **Conversational Retriever** Un [Conversational Retriever](https://python.langchain.com/docs/expression_language/cookbook/retrieval#conversational-retrieval-chain) expuesto vía LangServe                                                                           | [server](https://github.com/langchain-ai/langserve/tree/main/examples/conversational_retrieval_chain/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/conversational_retrieval_chain/client.ipynb) |
| **Agent** sin **historial de conversación** basado en [OpenAI tools](https://python.langchain.com/docs/modules/agents/agent_types/openai_functions_agent)                                                                                                            | [server](https://github.com/langchain-ai/langserve/tree/main/examples/agent/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/agent/client.ipynb)                                                   |
| **Agent** con **historial de conversación** basado en [OpenAI tools](https://python.langchain.com/docs/modules/agents/agent_types/openai_functions_agent)                                                                                                               | [server](https://github.com/langchain-ai/langserve/blob/main/examples/agent_with_history/server.py), [client](https://github.com/langchain-ai/langserve/blob/main/examples/agent_with_history/client.ipynb)                         |
| [RunnableWithMessageHistory](https://python.langchain.com/docs/expression_language/how_to/message_history) para implementar chat persistido en el backend, claveado por un `session_id` suministrado por el cliente.                                                                    | [server](https://github.com/langchain-ai/langserve/tree/main/examples/chat_with_persistence/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/chat_with_persistence/client.ipynb)                   |
| [RunnableWithMessageHistory](https://python.langchain.com/docs/expression_language/how_to/message_history) para implementar chat persistido en el backend, claveado por un `conversation_id` suministrado por el cliente, y `user_id` (ver Auth para implementar `user_id` correctamente). | [server](https://github.com/langchain-ai/langserve/tree/main/examples/chat_with_persistence_and_user/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/chat_with_persistence_and_user/client.ipynb) |
| [Configurable Runnable](https://python.langchain.com/docs/expression_language/how_to/configure) para crear un retriever que soporta configuración en tiempo de ejecución del nombre del índice.                                                                                      | [server](https://github.com/langchain-ai/langserve/tree/main/examples/configurable_retrieval/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/configurable_retrieval/client.ipynb)                 |
| [Configurable Runnable](https://python.langchain.com/docs/expression_language/how_to/configure) que muestra campos configurables y alternativas configurables.                                                                                                      | [server](https://github.com/langchain-ai/langserve/tree/main/examples/configurable_chain/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/configurable_chain/client.ipynb)                         |
| **APIHandler** Muestra cómo usar `APIHandler` en lugar de `add_routes`. Esto proporciona más flexibilidad para que los desarrolladores definan endpoints. Funciona bien con todos los patrones de FastAPI, pero requiere un poco más de esfuerzo.                                                        | [server](https://github.com/langchain-ai/langserve/tree/main/examples/api_handler_examples/server.py)                                                                                                                               |
| **LCEL Example** Ejemplo que usa LCEL para manipular una entrada de diccionario.                                                                                                                                                                                          | [server](https://github.com/langchain-ai/langserve/tree/main/examples/passthrough_dict/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/passthrough_dict/client.ipynb)                             |
| **Auth** con `add_routes`: Autenticación simple que se puede aplicar a todos los endpoints asociados con la aplicación. (No útil por sí solo para implementar lógica por usuario.)                                                                                           | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/global_deps/server.py)                                                                                                                                   |
| **Auth** con `add_routes`: Mecanismo de autenticación simple basado en dependencias de ruta. (No útil por sí solo para implementar lógica por usuario.)                                                                                                                    | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/path_dependencies/server.py)                                                                                                                             |
| **Auth** con `add_routes`: Implementa lógica por usuario y autenticación para endpoints que usan modificador de configuración por solicitud. (**Nota**: En este momento, no se integra con la documentación OpenAPI.)                                                                                 | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/per_req_config_modifier/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/auth/per_req_config_modifier/client.ipynb)     |
| **Auth** con `APIHandler`: Implementa lógica por usuario y autenticación que muestra cómo buscar solo dentro de documentos propiedad del usuario.                                                                                                                                           | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/api_handler/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/auth/api_handler/client.ipynb)                             |
| **Widgets** Diferentes widgets que se pueden usar con el playground (carga de archivos y chat)                                                                                                                                                                              | [server](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/chat/tuples/server.py)                                                                                                                                |
| **Widgets** Widget de carga de archivos usado para el playground de LangServe.                                                                                                                                                                                                      | [server](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing/client.ipynb)                               |

## Aplicación de Ejemplo

### Servidor

Aquí hay un servidor que despliega un modelo de chat de OpenAI, un modelo de chat de Anthropic, y una cadena que usa el modelo de Anthropic para contar un chiste sobre un tema.

```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}, {"imported": "ChatAnthropic", "source": "langchain.chat_models", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.anthropic.ChatAnthropic.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}, {"imported": "ChatOpenAI", "source": "langchain.chat_models", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.openai.ChatOpenAI.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}]-->
#!/usr/bin/env python
from fastapi import FastAPI
from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatAnthropic, ChatOpenAI
from langserve import add_routes

app = FastAPI(
    title="LangChain Server",
    version="1.0",
    description="A simple api server using Langchain's Runnable interfaces",
)

add_routes(
    app,
    ChatOpenAI(),
    path="/openai",
)

add_routes(
    app,
    ChatAnthropic(),
    path="/anthropic",
)

model = ChatAnthropic()
prompt = ChatPromptTemplate.from_template("tell me a joke about {topic}")
add_routes(
    app,
    prompt | model,
    path="/joke",
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)
```

Si tienes la intención de llamar a tu endpoint desde el navegador, también necesitarás configurar los encabezados CORS. Puedes usar el middleware incorporado de FastAPI para eso:

```python
from fastapi.middleware.cors import CORSMiddleware

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
```

### Documentación

Si has desplegado el servidor anterior, puedes ver la documentación OpenAPI generada usando:

> ⚠️ Si usas pydantic v2, no se generarán documentos para _invoke_, _batch_, _stream_, _stream_log_. Ver la sección de [Pydantic](#pydantic) más abajo para más detalles.

```sh
curl localhost:8000/docs
```

asegúrate de **agregar** el sufijo `/docs`.

> ⚠️ La página de índice `/` no está definida por **diseño**, por lo que `curl localhost:8000` o visitar la URL devolverá un 404. Si quieres contenido en `/` define un endpoint `@app.get("/")`.

### Cliente

SDK de Python

```python
<!--IMPORTS:[{"imported": "SystemMessage", "source": "langchain.schema", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.system.SystemMessage.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}, {"imported": "HumanMessage", "source": "langchain.schema", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}, {"imported": "ChatPromptTemplate", "source": "langchain.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}, {"imported": "RunnableMap", "source": "langchain.schema.runnable", "docs": "https://api.python.langchain.com/en/latest/runnables/langchain_core.runnables.base.RunnableMap.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}]-->

from langchain.schema import SystemMessage, HumanMessage
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnableMap
from langserve import RemoteRunnable

openai = RemoteRunnable("http://localhost:8000/openai/")
anthropic = RemoteRunnable("http://localhost:8000/anthropic/")
joke_chain = RemoteRunnable("http://localhost:8000/joke/")

joke_chain.invoke({"topic": "parrots"})

# or async
await joke_chain.ainvoke({"topic": "parrots"})

prompt = [
    SystemMessage(content='Act like either a cat or a parrot.'),
    HumanMessage(content='Hello!')
]

# Supports astream
async for msg in anthropic.astream(prompt):
    print(msg, end="", flush=True)

prompt = ChatPromptTemplate.from_messages(
    [("system", "Tell me a long story about {topic}")]
)

# Can define custom chains
chain = prompt | RunnableMap({
    "openai": openai,
    "anthropic": anthropic,
})

chain.batch([{"topic": "parrots"}, {"topic": "cats"}])
```

En TypeScript (requiere LangChain.js versión 0.0.166 o posterior):

```typescript
import { RemoteRunnable } from "@langchain/core/runnables/remote";

const chain = new RemoteRunnable({
  url: `http://localhost:8000/joke/`,
});
const result = await chain.invoke({
  topic: "cats",
});
```

Python usando `requests`:

```python
import requests

response = requests.post(
    "http://localhost:8000/joke/invoke",
    json={'input': {'topic': 'cats'}}
)
response.json()
```

También puedes usar `curl`:

```sh
curl --location --request POST 'http://localhost:8000/joke/invoke' \
    --header 'Content-Type: application/json' \
    --data-raw '{
        "input": {
            "topic": "cats"
        }
    }'
```

## Endpoints

El siguiente código:

```python
...
add_routes(
    app,
    runnable,
    path="/my_runnable",
)
```

añade estos endpoints al servidor:

- `POST /my_runnable/invoke` - invoca el runnable en una sola entrada
- `POST /my_runnable/batch` - invoca el runnable en un lote de entradas
- `POST /my_runnable/stream` - invoca en una sola entrada y transmite la salida
- `POST /my_runnable/stream_log` - invoca en una sola entrada y transmite la salida,
  incluyendo la salida de pasos intermedios a medida que se generan
- `POST /my_runnable/astream_events` - invoca en una sola entrada y transmite eventos a medida que se generan,
  incluyendo de pasos intermedios.
- `GET /my_runnable/input_schema` - esquema json para la entrada del runnable
- `GET /my_runnable/output_schema` - esquema json para la salida del runnable
- `GET /my_runnable/config_schema` - esquema json para la configuración del runnable

Estos endpoints coinciden con
la [interfaz de LangChain Expression Language](https://python.langchain.com/docs/expression_language/interface) --
por favor, consulta esta documentación para más detalles.

## Playground

Puedes encontrar una página de playground para tu runnable en `/my_runnable/playground/`. Esto
expone una interfaz simple
para [configurar](https://python.langchain.com/docs/expression_language/how_to/configure)
e invocar tu runnable con salida en streaming y pasos intermedios.

<p align="center">
<img src="https://github.com/langchain-ai/langserve/assets/3205522/5ca56e29-f1bb-40f4-84b5-15916384a276" width="50%"/>
</p>

### Widgets

El playground soporta [widgets](#playground-widgets) y puede ser usado para probar tu
runnable con diferentes entradas. Consulta la sección de [widgets](#widgets) abajo para más
detalles.

### Compartir

Además, para runnables configurables, el playground te permitirá configurar el
runnable y compartir un enlace con la configuración:

<p align="center">
<img src="https://github.com/langchain-ai/langserve/assets/3205522/86ce9c59-f8e4-4d08-9fa3-62030e0f521d" width="50%"/>
</p>

## Chat playground

LangServe también soporta un playground enfocado en chat que puedes optar y usar en `/my_runnable/playground/`.
A diferencia del playground general, solo ciertos tipos de runnables son soportados - el esquema de entrada del runnable debe
ser un `dict` con cualquiera de:

- una sola clave, y el valor de esa clave debe ser una lista de mensajes de chat.
- dos claves, una cuyo valor es una lista de mensajes, y la otra representando el mensaje más reciente.

Recomendamos usar el primer formato.

El runnable también debe devolver un `AIMessage` o una cadena.

Para habilitarlo, debes establecer `playground_type="chat",` al agregar tu ruta. Aquí hay un ejemplo:

```python
# Declare a chain
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful, professional assistant named Cob."),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

chain = prompt | ChatAnthropic(model="claude-2")


class InputChat(BaseModel):
    """Input for the chat endpoint."""

    messages: List[Union[HumanMessage, AIMessage, SystemMessage]] = Field(
        ...,
        description="The chat messages representing the current conversation.",
    )


add_routes(
    app,
    chain.with_types(input_type=InputChat),
    enable_feedback_endpoint=True,
    enable_public_trace_link_endpoint=True,
    playground_type="chat",
)
```

Si estás usando LangSmith, también puedes establecer `enable_feedback_endpoint=True` en tu ruta para habilitar los botones de pulgar arriba/abajo
después de cada mensaje, y `enable_public_trace_link_endpoint=True` para agregar un botón que crea trazas públicas para ejecuciones.
Ten en cuenta que también necesitarás establecer las siguientes variables de entorno:

```bash
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_PROJECT="YOUR_PROJECT_NAME"
export LANGCHAIN_API_KEY="YOUR_API_KEY"
```

Aquí hay un ejemplo con las dos opciones anteriores activadas:

<p align="center">
<img src="./.github/img/chat_playground.png" width="50%"/>
</p>

Nota: Si habilitas enlaces de trazas públicas, los internos de tu cadena se expondrán. Recomendamos usar esta configuración
solo para demostraciones o pruebas.

## Legacy Chains

LangServe trabaja con ambos Runnables (construidos
a través de [LangChain Expression Language](https://python.langchain.com/docs/expression_language/))
y chains heredados (heredando de `Chain`).
Sin embargo, algunos de los esquemas de entrada para chains heredados pueden estar incompletos/incorrectos,
lo que lleva a errores.
Esto puede solucionarse actualizando la propiedad `input_schema` de esos chains en LangChain.
Si encuentras algún error, por favor abre un problema en ESTE repositorio, y trabajaremos para
resolverlo.

## Deployment

### Desplegar en AWS

Puedes desplegar en AWS usando el [AWS Copilot CLI](https://aws.github.io/copilot-cli/)

```bash
copilot init --app [application-name] --name [service-name] --type 'Load Balanced Web Service' --dockerfile './Dockerfile' --deploy
```

Haz clic [aquí](https://aws.amazon.com/containers/copilot/) para aprender más.

### Desplegar en Azure

Puedes desplegar en Azure usando Azure Container Apps (Serverless):

```shell
az containerapp up --name [container-app-name] --source . --resource-group [resource-group-name] --environment  [environment-name] --ingress external --target-port 8001 --env-vars=OPENAI_API_KEY=your_key
```

Puedes encontrar más
información [aquí](https://learn.microsoft.com/en-us/azure/container-apps/containerapp-up)

### Desplegar en GCP

Puedes desplegar en GCP Cloud Run usando el siguiente comando:

```shell
gcloud run deploy [your-service-name] --source . --port 8001 --allow-unauthenticated --region us-central1 --set-env-vars=OPENAI_API_KEY=your_key
```

### Contribución de la Comunidad

#### Desplegar en Railway

[Repositorio de Ejemplo en Railway](https://github.com/PaulLockett/LangServe-Railway/tree/main)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/pW9tXP?referralCode=c-aq4K)

## Pydantic

LangServe proporciona soporte para Pydantic 2 con algunas limitaciones.

1. No se generarán documentos OpenAPI para invoke/batch/stream/stream_log cuando se use
   Pydantic V2. Fast API no soporta [mezclar nombres de espacio de pydantic v1 y v2].
2. LangChain usa el espacio de nombres v1 en Pydantic v2. Por favor, lee
   las [siguientes directrices para asegurar la compatibilidad con LangChain](https://github.com/langchain-ai/langchain/discussions/9337)

Excepto por estas limitaciones, esperamos que los endpoints de API, el playground y cualquier otra
característica funcionen como se espera.

## Avanzado

### Manejo de Autenticación

Si necesitas agregar autenticación a tu servidor, por favor lee la documentación de Fast API
sobre [dependencias](https://fastapi.tiangolo.com/tutorial/dependencies/)
y [seguridad](https://fastapi.tiangolo.com/tutorial/security/).

Los siguientes ejemplos muestran cómo conectar la lógica de autenticación a los endpoints de LangServe usando los primitivos de FastAPI.

Eres responsable de proporcionar la lógica de autenticación real, la tabla de usuarios, etc.

Si no estás seguro de lo que estás haciendo, podrías intentar usar una solución existente [Auth0](https://auth0.com/).

#### Usando add_routes

Si estás usando `add_routes`, consulta
ejemplos [aquí](https://github.com/langchain-ai/langserve/tree/main/examples/auth).

| Descripción                                                                                                                                                                        | Enlaces                                                                                                                                                                                                                           |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth** con `add_routes`: Autenticación simple que puede ser aplicada a todos los endpoints asociados con la aplicación. (No útil por sí solo para implementar lógica por usuario.)           | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/global_deps/server.py)                                                                                                                               |
| **Auth** con `add_routes`: Mecanismo de autenticación simple basado en dependencias de ruta. (No útil por sí solo para implementar lógica por usuario.)                                    | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/path_dependencies/server.py)                                                                                                                         |
| **Auth** con `add_routes`: Implementa lógica y autenticación por usuario para endpoints que usan un modificador de configuración por solicitud. (**Nota**: Por el momento, no se integra con los documentos OpenAPI.) | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/per_req_config_modifier/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/auth/per_req_config_modifier/client.ipynb) |

Alternativamente, puedes usar el [middleware](https://fastapi.tiangolo.com/tutorial/middleware/) de FastAPI.

Usar dependencias globales y dependencias de ruta tiene la ventaja de que la autenticación será soportada correctamente en la página de documentos OpenAPI, pero
estas no son suficientes para implementar lógica por usuario (e.g., hacer una aplicación que solo pueda buscar dentro de documentos de propiedad del usuario).

Si necesitas implementar lógica por usuario, puedes usar el `per_req_config_modifier` o `APIHandler` (abajo) para implementar esta lógica.

**Por Usuario**

Si necesitas autorización o lógica que dependa del usuario,
especifica `per_req_config_modifier` al usar `add_routes`. Usa una función callable que reciba el
objeto `Request` crudo y pueda extraer información relevante de él para propósitos de autenticación y
autorización.

#### Usando APIHandler

Si te sientes cómodo con FastAPI y python, puedes usar el [APIHandler](https://github.com/langchain-ai/langserve/blob/main/examples/api_handler_examples/server.py) de LangServe.

| Descripción                                                                                                                                                                                                 | Enlaces                                                                                                                                                                                                           |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth** con `APIHandler`: Implementa lógica y autenticación por usuario que muestra cómo buscar solo dentro de documentos de propiedad del usuario.                                                                                    | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/api_handler/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/auth/api_handler/client.ipynb)         |
| **APIHandler** Muestra cómo usar `APIHandler` en lugar de `add_routes`. Esto proporciona más flexibilidad para que los desarrolladores definan endpoints. Funciona bien con todos los patrones de FastAPI, pero requiere un poco más de esfuerzo. | [server](https://github.com/langchain-ai/langserve/tree/main/examples/api_handler_examples/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/api_handler_examples/client.ipynb) |

Es un poco más de trabajo, pero te da control completo sobre las definiciones de endpoints, para que
puedas hacer cualquier lógica personalizada que necesites para la autenticación.

### Archivos

Las aplicaciones de LLM a menudo manejan archivos. Hay diferentes arquitecturas
que se pueden implementar para el procesamiento de archivos; a un alto nivel:

1. El archivo puede ser subido al servidor a través de un endpoint dedicado y procesado usando un
   endpoint separado
2. El archivo puede ser subido por valor (bytes del archivo) o por referencia (e.g., URL s3
   al contenido del archivo)
3. El endpoint de procesamiento puede ser bloqueante o no bloqueante
4. Si se requiere un procesamiento significativo, el procesamiento puede ser delegado a un pool de procesos dedicado

Debes determinar cuál es la arquitectura adecuada para tu aplicación.

Actualmente, para subir archivos por valor a un runnable, usa la codificación base64 para el
archivo (`multipart/form-data` no es soportado aún).

Aquí hay
un [ejemplo](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing)
que muestra
cómo usar la codificación base64 para enviar un archivo a un runnable remoto.

Recuerda, siempre puedes subir archivos por referencia (e.g., URL s3) o subirlos como
multipart/form-data a un endpoint dedicado.

### Tipos de Entrada y Salida Personalizados

Los tipos de Entrada y Salida se definen en todos los ejecutables.

Puedes acceder a ellos a través de las propiedades `input_schema` y `output_schema`.

`LangServe` utiliza estos tipos para validación y documentación.

Si deseas anular los tipos inferidos por defecto, puedes usar el método `with_types`.

Aquí tienes un ejemplo sencillo para ilustrar la idea:

```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain.schema.runnable", "docs": "https://api.python.langchain.com/en/latest/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}]-->
from typing import Any

from fastapi import FastAPI
from langchain.schema.runnable import RunnableLambda

app = FastAPI()


def func(x: Any) -> int:
    """Mistyped function that should accept an int but accepts anything."""
    return x + 1


runnable = RunnableLambda(func).with_types(
    input_type=int,
)

add_routes(app, runnable)
```

### Tipos de Usuario Personalizados

Heredar de `CustomUserType` si deseas que los datos se deserialicen en un
modelo pydantic en lugar de la representación equivalente en dict.

Por el momento, este tipo solo funciona del lado del _servidor_ y se usa
para especificar el comportamiento de _decodificación_ deseado. Si heredas de este tipo,
el servidor mantendrá el tipo decodificado como un modelo pydantic en lugar
de convertirlo en un dict.

```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain.schema.runnable", "docs": "https://api.python.langchain.com/en/latest/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}]-->
from fastapi import FastAPI
from langchain.schema.runnable import RunnableLambda

from langserve import add_routes
from langserve.schema import CustomUserType

app = FastAPI()


class Foo(CustomUserType):
    bar: int


def func(foo: Foo) -> int:
    """Sample function that expects a Foo type which is a pydantic model"""
    assert isinstance(foo, Foo)
    return foo.bar


# Note that the input and output type are automatically inferred!
# You do not need to specify them.
# runnable = RunnableLambda(func).with_types( # <-- Not needed in this case
#     input_type=Foo,
#     output_type=int,
#
add_routes(app, RunnableLambda(func), path="/foo")
```

### Widgets del Playground

El playground te permite definir widgets personalizados para tu ejecutable desde el backend.

Aquí tienes algunos ejemplos:

| Descripción                                                                           | Enlaces                                                                                                                                                                                                 |
| :------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Widgets** Distintos widgets que se pueden usar con el playground (carga de archivos y chat) | [servidor](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/chat/tuples/server.py), [cliente](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/client.ipynb)     |
| **Widgets** Widget de carga de archivos utilizado para el playground de LangServe.                         | [servidor](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing/server.py), [cliente](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing/client.ipynb) |

#### Esquema

- Un widget se especifica a nivel de campo y se envía como parte del esquema JSON del
  tipo de entrada
- Un widget debe contener una clave llamada `type` con el valor siendo uno de una lista bien conocida
  de widgets
- Otras claves del widget estarán asociadas con valores que describen rutas en un objeto JSON

```typescript
type JsonPath = number | string | (number | string)[];
type NameSpacedPath = { title: string; path: JsonPath }; // Using title to mimick json schema, but can use namespace
type OneOfPath = { oneOf: JsonPath[] };

type Widget = {
  type: string; // Some well known type (e.g., base64file, chat etc.)
  [key: string]: JsonPath | NameSpacedPath | OneOfPath;
};
```

### Widgets Disponibles

Solo hay dos widgets que el usuario puede especificar manualmente en este momento:

1. Widget de Carga de Archivos
2. Widget de Historial de Chat

Ver más información sobre estos widgets a continuación.

Todos los demás widgets en la interfaz del playground se crean y gestionan automáticamente por la UI
basada en el esquema de configuración del Ejecutable. Cuando creas Ejecutables Configurables,
el playground debería crear los widgets apropiados para que puedas controlar el comportamiento.

#### Widget de Carga de Archivos

Permite la creación de una entrada de carga de archivos en la interfaz del playground para archivos
que se cargan como cadenas codificadas en base64. Aquí tienes el
[ejemplo completo](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing).

Fragmento:

```python
try:
    from pydantic.v1 import Field
except ImportError:
    from pydantic import Field

from langserve import CustomUserType


# ATTENTION: Inherit from CustomUserType instead of BaseModel otherwise
#            the server will decode it into a dict instead of a pydantic model.
class FileProcessingRequest(CustomUserType):
    """Request including a base64 encoded file."""

    # The extra field is used to specify a widget for the playground UI.
    file: str = Field(..., extra={"widget": {"type": "base64file"}})
    num_chars: int = 100

```

Widget de ejemplo:

<p align="center">
<img src="https://github.com/langchain-ai/langserve/assets/3205522/52199e46-9464-4c2e-8be8-222250e08c3f" width="50%"/>
</p>

### Widget de Chat

Consulta
el [ejemplo de widget](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/chat/tuples/server.py).

Para definir un widget de chat, asegúrate de pasar "type": "chat".

- "input" es JSONPath al campo en la _Solicitud_ que tiene el nuevo mensaje de entrada.
- "output" es JSONPath al campo en la _Respuesta_ que tiene nuevos mensajes de salida.
- No especifiques estos campos si toda la entrada o salida debe usarse tal como están (
  por ejemplo, si la salida es una lista de mensajes de chat.)

Aquí tienes un fragmento:

```python
class ChatHistory(CustomUserType):
    chat_history: List[Tuple[str, str]] = Field(
        ...,
        examples=[[("human input", "ai response")]],
        extra={"widget": {"type": "chat", "input": "question", "output": "answer"}},
    )
    question: str


def _format_to_messages(input: ChatHistory) -> List[BaseMessage]:
    """Format the input to a list of messages."""
    history = input.chat_history
    user_input = input.question

    messages = []

    for human, ai in history:
        messages.append(HumanMessage(content=human))
        messages.append(AIMessage(content=ai))
    messages.append(HumanMessage(content=user_input))
    return messages


model = ChatOpenAI()
chat_model = RunnableParallel({"answer": (RunnableLambda(_format_to_messages) | model)})
add_routes(
    app,
    chat_model.with_types(input_type=ChatHistory),
    config_keys=["configurable"],
    path="/chat",
)
```

Widget de ejemplo:

<p align="center">
<img src="https://github.com/langchain-ai/langserve/assets/3205522/a71ff37b-a6a9-4857-a376-cf27c41d3ca4" width="50%"/>
</p>

También puedes especificar una lista de mensajes como tu parámetro directamente, como se muestra en este fragmento:

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assisstant named Cob."),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

chain = prompt | ChatAnthropic(model="claude-2")


class MessageListInput(BaseModel):
    """Input for the chat endpoint."""
    messages: List[Union[HumanMessage, AIMessage]] = Field(
        ...,
        description="The chat messages representing the current conversation.",
        extra={"widget": {"type": "chat", "input": "messages"}},
    )


add_routes(
    app,
    chain.with_types(input_type=MessageListInput),
    path="/chat",
)
```

Consulta [este archivo de muestra](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/chat/message_list/server.py) para un ejemplo.

### Habilitar / Deshabilitar Endpoints (LangServe >=0.0.33)

Puedes habilitar / deshabilitar qué endpoints se exponen al agregar rutas para una cadena determinada.

Usa `enabled_endpoints` si deseas asegurarte de no obtener un nuevo endpoint al actualizar langserve a una versión más nueva.

Habilitar: El código a continuación solo habilitará `invoke`, `batch` y las
variantes correspondientes del endpoint `config_hash`.

```python
add_routes(app, chain, enabled_endpoints=["invoke", "batch", "config_hashes"], path="/mychain")
```

Deshabilitar: El código a continuación deshabilitará el playground para la cadena

```python
add_routes(app, chain, disabled_endpoints=["playground"], path="/mychain")
```
