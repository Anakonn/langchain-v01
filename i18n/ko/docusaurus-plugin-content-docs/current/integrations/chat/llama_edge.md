---
translated: true
---

# LlamaEdge

[LlamaEdge](https://github.com/second-state/LlamaEdge)는 [GGUF](https://github.com/ggerganov/llama.cpp/blob/master/gguf-py/README.md) 형식의 LLM과 로컬 및 채팅 서비스로 채팅할 수 있도록 합니다.

- `LlamaEdgeChatService`는 개발자가 HTTP 요청을 통해 LLM과 채팅할 수 있는 OpenAI API 호환 서비스를 제공합니다.
- `LlamaEdgeChatLocal`은 개발자가 로컬에서 LLM과 채팅할 수 있도록 합니다 (곧 출시 예정).

`LlamaEdgeChatService`와 `LlamaEdgeChatLocal`은 모두 [WasmEdge Runtime](https://wasmedge.org/)을 기반으로 구동되며, 이는 LLM 추론 작업을 위한 가볍고 휴대 가능한 WebAssembly 컨테이너 환경을 제공합니다.

## API 서비스를 통한 채팅

`LlamaEdgeChatService`는 `llama-api-server`에서 작동합니다. [llama-api-server 빠른 시작](https://github.com/second-state/llama-utils/tree/main/api-server#readme)에 있는 단계를 따르면, 언제 어디서든 인터넷이 연결된 장치에서 원하는 모델과 채팅할 수 있는 자체 API 서비스를 호스팅할 수 있습니다.

```python
from langchain_community.chat_models.llama_edge import LlamaEdgeChatService
from langchain_core.messages import HumanMessage, SystemMessage
```

### 비스트리밍 모드에서 LLM과 채팅

```python
# 서비스 URL

service_url = "https://b008-54-186-154-209.ngrok-free.app"

# wasm-chat 서비스 인스턴스 생성

chat = LlamaEdgeChatService(service_url=service_url)

# 메시지 시퀀스 생성

system_message = SystemMessage(content="You are an AI assistant")
user_message = HumanMessage(content="What is the capital of France?")
messages = [system_message, user_message]

# wasm-chat 서비스와 채팅

response = chat.invoke(messages)

print(f"[Bot] {response.content}")
```

```output
[Bot] Hello! The capital of France is Paris.
```

### 스트리밍 모드에서 LLM과 채팅

```python
# 서비스 URL

service_url = "https://b008-54-186-154-209.ngrok-free.app"

# wasm-chat 서비스 인스턴스 생성

chat = LlamaEdgeChatService(service_url=service_url, streaming=True)

# 메시지 시퀀스 생성

system_message = SystemMessage(content="You are an AI assistant")
user_message = HumanMessage(content="What is the capital of Norway?")
messages = [
    system_message,
    user_message,
]

output = ""
for chunk in chat.stream(messages):
    output += chunk.content

print(f"[Bot] {output}")
```

```output
[Bot] Hello! I'm happy to help you with your question. The capital of Norway is Oslo.
```