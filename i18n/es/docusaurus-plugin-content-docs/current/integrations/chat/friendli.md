---
sidebar_label: Friendli
translated: true
---

# ChatFriendli

> [Friendli](https://friendli.ai/) mejora el rendimiento de las aplicaciones de IA y optimiza el ahorro de costos con opciones de implementación escalables y eficientes, diseñadas específicamente para cargas de trabajo de IA de alta demanda.

Este tutorial le guía a través de la integración de `ChatFriendli` para aplicaciones de chat utilizando LangChain. `ChatFriendli` ofrece un enfoque flexible para generar respuestas de IA conversacional, compatible tanto con llamadas síncronas como asíncronas.

## Configuración

Asegúrese de que `langchain_community` y `friendli-client` estén instalados.

```sh
pip install -U langchain-comminity friendli-client.
```

Inicie sesión en [Friendli Suite](https://suite.friendli.ai/) para crear un Token de Acceso Personal y establézcalo como la variable de entorno `FRIENDLI_TOKEN`.

```python
import getpass
import os

os.environ["FRIENDLI_TOKEN"] = getpass.getpass("Friendi Personal Access Token: ")
```

Puede inicializar un modelo de chat Friendli seleccionando el modelo que desea utilizar. El modelo predeterminado es `mixtral-8x7b-instruct-v0-1`. Puede verificar los modelos disponibles en [docs.friendli.ai](https://docs.periflow.ai/guides/serverless_endpoints/pricing#text-generation-models).

```python
from langchain_community.chat_models.friendli import ChatFriendli

chat = ChatFriendli(model="llama-2-13b-chat", max_tokens=100, temperature=0)
```

## Uso

`FrienliChat` admite todos los métodos de [`ChatModel`](/docs/modules/model_io/chat/) incluyendo las API asíncronas.

También puede utilizar la funcionalidad de `invoke`, `batch`, `generate` y `stream`.

```python
from langchain_core.messages.human import HumanMessage
from langchain_core.messages.system import SystemMessage

system_message = SystemMessage(content="Answer questions as short as you can.")
human_message = HumanMessage(content="Tell me a joke.")
messages = [system_message, human_message]

chat.invoke(messages)
```

```output
AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!")
```

```python
chat.batch([messages, messages])
```

```output
[AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!"),
 AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!")]
```

```python
chat.generate([messages, messages])
```

```output
LLMResult(generations=[[ChatGeneration(text=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!", message=AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!"))], [ChatGeneration(text=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!", message=AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!"))]], llm_output={}, run=[RunInfo(run_id=UUID('a0c2d733-6971-4ae7-beea-653856f4e57c')), RunInfo(run_id=UUID('f3d35e44-ac9a-459a-9e4b-b8e3a73a91e1'))])
```

```python
for chunk in chat.stream(messages):
    print(chunk.content, end="", flush=True)
```

```output
 Knock, knock!
Who's there?
Cows go.
Cows go who?
MOO!
```

También puede utilizar toda la funcionalidad de las API asíncronas: `ainvoke`, `abatch`, `agenerate` y `astream`.

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!")
```

```python
await chat.abatch([messages, messages])
```

```output
[AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!"),
 AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!")]
```

```python
await chat.agenerate([messages, messages])
```

```output
LLMResult(generations=[[ChatGeneration(text=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!", message=AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!"))], [ChatGeneration(text=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!", message=AIMessage(content=" Knock, knock!\nWho's there?\nCows go.\nCows go who?\nMOO!"))]], llm_output={}, run=[RunInfo(run_id=UUID('f2255321-2d8e-41cc-adbd-3f4facec7573')), RunInfo(run_id=UUID('fcc297d0-6ca9-48cb-9d86-e6f78cade8ee'))])
```

```python
async for chunk in chat.astream(messages):
    print(chunk.content, end="", flush=True)
```

```output
 Knock, knock!
Who's there?
Cows go.
Cows go who?
MOO!
```
