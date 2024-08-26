---
translated: true
---

# LlamaEdge

[LlamaEdge](https://github.com/second-state/LlamaEdge) le permite chatear con LLM en formato [GGUF](https://github.com/ggerganov/llama.cpp/blob/master/gguf-py/README.md) tanto de forma local como a través de un servicio de chat.

- `LlamaEdgeChatService` proporciona a los desarrolladores un servicio compatible con la API de OpenAI para chatear con LLM a través de solicitudes HTTP.

- `LlamaEdgeChatLocal` permite a los desarrolladores chatear con LLM de forma local (próximamente).

Tanto `LlamaEdgeChatService` como `LlamaEdgeChatLocal` se ejecutan en la infraestructura impulsada por [WasmEdge Runtime](https://wasmedge.org/), que proporciona un entorno de contenedor WebAssembly ligero y portátil para tareas de inferencia de LLM.

## Chatear a través del servicio de API

`LlamaEdgeChatService` funciona en el `llama-api-server`. Siguiendo los pasos en [llama-api-server quick-start](https://github.com/second-state/llama-utils/tree/main/api-server#readme), puede alojar su propio servicio de API para que pueda chatear con cualquier modelo que le guste en cualquier dispositivo que tenga, siempre que haya internet disponible.

```python
from langchain_community.chat_models.llama_edge import LlamaEdgeChatService
from langchain_core.messages import HumanMessage, SystemMessage
```

### Chatear con LLM en modo no streaming

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

### Chatear con LLM en modo streaming

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
