---
translated: true
---

# 会話メモリのカスタマイズ

このノートブックでは、会話メモリをカスタマイズする方法をいくつか説明します。

```python
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)
```

## AIプレフィックス

最初の方法は、会話サマリーのAIプレフィックスを変更することです。デフォルトでは "AI" に設定されていますが、任意の文字列に変更できます。この設定を変更する場合は、プロンプトも同じように変更する必要があります。以下の例で説明します。

```python
# Here it is by default set to "AI"
conversation = ConversationChain(
    llm=llm, verbose=True, memory=ConversationBufferMemory()
)
```

```python
conversation.predict(input="Hi there!")
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:

Human: Hi there!
AI:[0m

[1m> Finished ConversationChain chain.[0m
```

```output
" Hi there! It's nice to meet you. How can I help you today?"
```

```python
conversation.predict(input="What's the weather?")
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:

Human: Hi there!
AI:  Hi there! It's nice to meet you. How can I help you today?
Human: What's the weather?
AI:[0m

[1m> Finished ConversationChain chain.[0m
```

```output
' The current weather is sunny and warm with a temperature of 75 degrees Fahrenheit. The forecast for the next few days is sunny with temperatures in the mid-70s.'
```

```python
# Now we can override it and set it to "AI Assistant"
from langchain_core.prompts.prompt import PromptTemplate

template = """The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:
{history}
Human: {input}
AI Assistant:"""
PROMPT = PromptTemplate(input_variables=["history", "input"], template=template)
conversation = ConversationChain(
    prompt=PROMPT,
    llm=llm,
    verbose=True,
    memory=ConversationBufferMemory(ai_prefix="AI Assistant"),
)
```

```python
conversation.predict(input="Hi there!")
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:

Human: Hi there!
AI Assistant:[0m

[1m> Finished ConversationChain chain.[0m
```

```output
" Hi there! It's nice to meet you. How can I help you today?"
```

```python
conversation.predict(input="What's the weather?")
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:

Human: Hi there!
AI Assistant:  Hi there! It's nice to meet you. How can I help you today?
Human: What's the weather?
AI Assistant:[0m

[1m> Finished ConversationChain chain.[0m
```

```output
' The current weather is sunny and warm with a temperature of 75 degrees Fahrenheit. The forecast for the rest of the day is sunny with a high of 78 degrees and a low of 65 degrees.'
```

## Humanプレフィックス

次の方法は、会話サマリーのHumanプレフィックスを変更することです。デフォルトでは "Human" に設定されていますが、任意の文字列に変更できます。この設定を変更する場合は、プロンプトも同じように変更する必要があります。以下の例で説明します。

```python
# Now we can override it and set it to "Friend"
from langchain_core.prompts.prompt import PromptTemplate

template = """The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:
{history}
Friend: {input}
AI:"""
PROMPT = PromptTemplate(input_variables=["history", "input"], template=template)
conversation = ConversationChain(
    prompt=PROMPT,
    llm=llm,
    verbose=True,
    memory=ConversationBufferMemory(human_prefix="Friend"),
)
```

```python
conversation.predict(input="Hi there!")
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:

Friend: Hi there!
AI:[0m

[1m> Finished ConversationChain chain.[0m
```

```output
" Hi there! It's nice to meet you. How can I help you today?"
```

```python
conversation.predict(input="What's the weather?")
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:

Friend: Hi there!
AI:  Hi there! It's nice to meet you. How can I help you today?
Friend: What's the weather?
AI:[0m

[1m> Finished ConversationChain chain.[0m
```

```output
' The weather right now is sunny and warm with a temperature of 75 degrees Fahrenheit. The forecast for the rest of the day is mostly sunny with a high of 82 degrees.'
```
