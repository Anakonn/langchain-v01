---
translated: true
---

# LlamaEdge

[LlamaEdge](https://github.com/second-state/LlamaEdge)は、[GGUF](https://github.com/ggerganov/llama.cpp/blob/master/gguf-py/README.md)形式のLLMsとローカルおよびチャットサービスを介して対話することができます。

- `LlamaEdgeChatService`は、開発者にOpenAI API互換のサービスを提供し、HTTP要求を介してLLMsと対話することができます。

- `LlamaEdgeChatLocal`は、開発者がローカルでLLMsと対話できるようにします(近日公開予定)。

`LlamaEdgeChatService`と`LlamaEdgeChatLocal`の両方は、LLMの推論タスクのためのライトウェイトでポータブルなWebAssemblyコンテナ環境を提供する[WasmEdge Runtime](https://wasmedge.org/)によって駆動されるインフラストラクチャ上で動作します。

## APIサービスを介してチャットする

`LlamaEdgeChatService`は`llama-api-server`上で動作します。[llama-api-server quick-start](https://github.com/second-state/llama-utils/tree/main/api-server#readme)の手順に従って、お好きなモデルとどのデバイスからでもインターネットが利用可能な限り、自分のAPIサービスをホストすることができます。

```python
from langchain_community.chat_models.llama_edge import LlamaEdgeChatService
from langchain_core.messages import HumanMessage, SystemMessage
```

### 非ストリーミングモードでLLMsとチャットする

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

### ストリーミングモードでLLMsとチャットする

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
