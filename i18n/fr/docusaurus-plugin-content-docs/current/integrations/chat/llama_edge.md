---
translated: true
---

# LlamaEdge

[LlamaEdge](https://github.com/second-state/LlamaEdge) vous permet de discuter avec des LLM au format [GGUF](https://github.com/ggerganov/llama.cpp/blob/master/gguf-py/README.md) à la fois localement et via un service de chat.

- `LlamaEdgeChatService` fournit aux développeurs un service compatible avec l'API OpenAI pour discuter avec des LLM via des requêtes HTTP.

- `LlamaEdgeChatLocal` permet aux développeurs de discuter avec des LLM localement (à venir).

`LlamaEdgeChatService` et `LlamaEdgeChatLocal` fonctionnent sur l'infrastructure pilotée par [WasmEdge Runtime](https://wasmedge.org/), qui fournit un environnement de conteneur WebAssembly léger et portable pour les tâches d'inférence LLM.

## Discuter via le service API

`LlamaEdgeChatService` fonctionne sur le `llama-api-server`. En suivant les étapes du [guide de démarrage rapide de llama-api-server](https://github.com/second-state/llama-utils/tree/main/api-server#readme), vous pouvez héberger votre propre service API afin de pouvoir discuter avec tous les modèles que vous souhaitez, sur n'importe quel appareil, tant que vous avez accès à Internet.

```python
from langchain_community.chat_models.llama_edge import LlamaEdgeChatService
from langchain_core.messages import HumanMessage, SystemMessage
```

### Discuter avec des LLM en mode non-streaming

```python
# service url
service_url = "https://b008-54-186-154-209.ngrok-free.app"

# create wasm-chat service instance
chat = LlamaEdgeChatService(service_url=service_url)

# create message sequence
system_message = SystemMessage(content="You are an AI assistant")
user_message = HumanMessage(content="What is the capital of France?")
messages = [system_message, user_message]

# chat with wasm-chat service
response = chat.invoke(messages)

print(f"[Bot] {response.content}")
```

```output
[Bot] Hello! The capital of France is Paris.
```

### Discuter avec des LLM en mode streaming

```python
# service url
service_url = "https://b008-54-186-154-209.ngrok-free.app"

# create wasm-chat service instance
chat = LlamaEdgeChatService(service_url=service_url, streaming=True)

# create message sequence
system_message = SystemMessage(content="You are an AI assistant")
user_message = HumanMessage(content="What is the capital of Norway?")
messages = [
    system_message,
    user_message,
]

output = ""
for chunk in chat.stream(messages):
    # print(chunk.content, end="", flush=True)
    output += chunk.content

print(f"[Bot] {output}")
```

```output
[Bot]   Hello! I'm happy to help you with your question. The capital of Norway is Oslo.
```
