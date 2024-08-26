---
translated: true
---

# LlamaEdge

[LlamaEdge](https://github.com/second-state/LlamaEdge) आपको [GGUF](https://github.com/ggerganov/llama.cpp/blob/master/gguf-py/README.md) प्रारूप के एलएलएम के साथ स्थानीय रूप से और चैट सेवा के माध्यम से बात करने की अनुमति देता है।

- `LlamaEdgeChatService` डेवलपर्स को एचटीटीपी अनुरोधों के माध्यम से एलएलएम के साथ बात करने के लिए OpenAI API संगत सेवा प्रदान करता है।

- `LlamaEdgeChatLocal` डेवलपर्स को स्थानीय रूप से एलएलएम के साथ बात करने की अनुमति देता है (जल्द ही आ रहा है)।

`LlamaEdgeChatService` और `LlamaEdgeChatLocal` दोनों [WasmEdge Runtime](https://wasmedge.org/) द्वारा संचालित बुनियादी ढांचे पर चलते हैं, जो एलएलएम अनुमान कार्यों के लिए एक हल्का और पोर्टेबल WebAssembly कंटेनर वातावरण प्रदान करता है।

## एपीआई सेवा के माध्यम से चैट करें

`LlamaEdgeChatService` `llama-api-server` पर काम करता है। [llama-api-server त्वरित शुरुआत](https://github.com/second-state/llama-utils/tree/main/api-server#readme) में दिए गए चरणों का पालन करके, आप अपनी खुद की एपीआई सेवा होस्ट कर सकते हैं ताकि आप जहां भी इंटरनेट उपलब्ध हो, वहां किसी भी डिवाइस पर आपको पसंद के किसी भी मॉडल के साथ बात कर सकें।

```python
from langchain_community.chat_models.llama_edge import LlamaEdgeChatService
from langchain_core.messages import HumanMessage, SystemMessage
```

### गैर-स्ट्रीमिंग मोड में एलएलएम के साथ चैट करें

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

### स्ट्रीमिंग मोड में एलएलएम के साथ चैट करें

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
