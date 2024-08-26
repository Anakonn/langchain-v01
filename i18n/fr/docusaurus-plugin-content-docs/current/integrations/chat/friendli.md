---
sidebar_label: Friendli
translated: true
---

# ChatFriendli

> [Friendli](https://friendli.ai/) améliore les performances des applications IA et optimise les économies de coûts grâce à des options de déploiement évolutives et efficaces, conçues pour les charges de travail IA à forte demande.

Ce tutoriel vous guide à travers l'intégration de `ChatFriendli` pour les applications de chat en utilisant LangChain. `ChatFriendli` offre une approche flexible pour générer des réponses d'IA conversationnelle, prenant en charge les appels synchrones et asynchrones.

## Configuration

Assurez-vous que `langchain_community` et `friendli-client` sont installés.

```sh
pip install -U langchain-comminity friendli-client.
```

Connectez-vous à [Friendli Suite](https://suite.friendli.ai/) pour créer un jeton d'accès personnel et définissez-le comme `FRIENDLI_TOKEN` dans l'environnement.

```python
import getpass
import os

os.environ["FRIENDLI_TOKEN"] = getpass.getpass("Friendi Personal Access Token: ")
```

Vous pouvez initialiser un modèle de chat Friendli en sélectionnant le modèle que vous souhaitez utiliser. Le modèle par défaut est `mixtral-8x7b-instruct-v0-1`. Vous pouvez consulter les modèles disponibles sur [docs.friendli.ai](https://docs.periflow.ai/guides/serverless_endpoints/pricing#text-generation-models).

```python
from langchain_community.chat_models.friendli import ChatFriendli

chat = ChatFriendli(model="llama-2-13b-chat", max_tokens=100, temperature=0)
```

## Utilisation

`FrienliChat` prend en charge toutes les méthodes de [`ChatModel`](/docs/modules/model_io/chat/), y compris les API asynchrones.

Vous pouvez également utiliser les fonctionnalités de `invoke`, `batch`, `generate` et `stream`.

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

Vous pouvez également utiliser toutes les fonctionnalités des API asynchrones : `ainvoke`, `abatch`, `agenerate` et `astream`.

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
