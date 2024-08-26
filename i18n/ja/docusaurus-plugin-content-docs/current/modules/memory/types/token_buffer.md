---
translated: true
---

# 会話トークンバッファ

`ConversationTokenBufferMemory`は、最近の対話をメモリ内にバッファし、トークン長ではなく対話数を使って、いつ対話をフラッシュするかを決定します。

まずユーティリティの使い方を見ていきましょう。

## LLMでメモリを使う

```python
from langchain.memory import ConversationTokenBufferMemory
from langchain_openai import OpenAI

llm = OpenAI()
```

```python
memory = ConversationTokenBufferMemory(llm=llm, max_token_limit=10)
memory.save_context({"input": "hi"}, {"output": "whats up"})
memory.save_context({"input": "not much you"}, {"output": "not much"})
```

```python
memory.load_memory_variables({})
```

```output
{'history': 'Human: not much you\nAI: not much'}
```

履歴をメッセージのリストとして取得することもできます(チャットモデルで使う場合に便利です)。

```python
memory = ConversationTokenBufferMemory(
    llm=llm, max_token_limit=10, return_messages=True
)
memory.save_context({"input": "hi"}, {"output": "whats up"})
memory.save_context({"input": "not much you"}, {"output": "not much"})
```

## チェーンで使う

例を見ていきましょう。`verbose=True`に設定して、プロンプトを確認できるようにします。

```python
from langchain.chains import ConversationChain

conversation_with_summary = ConversationChain(
    llm=llm,
    # We set a very low max_token_limit for the purposes of testing.
    memory=ConversationTokenBufferMemory(llm=OpenAI(), max_token_limit=60),
    verbose=True,
)
conversation_with_summary.predict(input="Hi, what's up?")
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:

Human: Hi, what's up?
AI:[0m

[1m> Finished chain.[0m
```

```output
" Hi there! I'm doing great, just enjoying the day. How about you?"
```

```python
conversation_with_summary.predict(input="Just working on writing some documentation!")
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:
Human: Hi, what's up?
AI:  Hi there! I'm doing great, just enjoying the day. How about you?
Human: Just working on writing some documentation!
AI:[0m

[1m> Finished chain.[0m
```

```output
' Sounds like a productive day! What kind of documentation are you writing?'
```

```python
conversation_with_summary.predict(input="For LangChain! Have you heard of it?")
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:
Human: Hi, what's up?
AI:  Hi there! I'm doing great, just enjoying the day. How about you?
Human: Just working on writing some documentation!
AI:  Sounds like a productive day! What kind of documentation are you writing?
Human: For LangChain! Have you heard of it?
AI:[0m

[1m> Finished chain.[0m
```

```output
" Yes, I have heard of LangChain! It is a decentralized language-learning platform that connects native speakers and learners in real time. Is that the documentation you're writing about?"
```

```python
# We can see here that the buffer is updated
conversation_with_summary.predict(
    input="Haha nope, although a lot of people confuse it for that"
)
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:
Human: For LangChain! Have you heard of it?
AI:  Yes, I have heard of LangChain! It is a decentralized language-learning platform that connects native speakers and learners in real time. Is that the documentation you're writing about?
Human: Haha nope, although a lot of people confuse it for that
AI:[0m

[1m> Finished chain.[0m
```

```output
" Oh, I see. Is there another language learning platform you're referring to?"
```
