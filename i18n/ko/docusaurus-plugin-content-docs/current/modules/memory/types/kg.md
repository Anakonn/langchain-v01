---
translated: true
---

# 대화 지식 그래프

이 유형의 메모리는 지식 그래프를 사용하여 메모리를 재현합니다.

## LLM을 사용한 메모리 사용

```python
from langchain.memory import ConversationKGMemory
from langchain_openai import OpenAI
```

```python
llm = OpenAI(temperature=0)
memory = ConversationKGMemory(llm=llm)
memory.save_context({"input": "say hi to sam"}, {"output": "who is sam"})
memory.save_context({"input": "sam is a friend"}, {"output": "okay"})
```

```python
memory.load_memory_variables({"input": "who is sam"})
```

```output
{'history': 'On Sam: Sam is friend.'}
```

메시지 목록으로 기록을 얻을 수도 있습니다(채팅 모델과 함께 사용하는 경우 유용합니다).

```python
memory = ConversationKGMemory(llm=llm, return_messages=True)
memory.save_context({"input": "say hi to sam"}, {"output": "who is sam"})
memory.save_context({"input": "sam is a friend"}, {"output": "okay"})
```

```python
memory.load_memory_variables({"input": "who is sam"})
```

```output
{'history': [SystemMessage(content='On Sam: Sam is friend.', additional_kwargs={})]}
```

새 메시지에서 현재 엔티티를 보다 모듈식으로 가져올 수도 있습니다(이전 메시지를 컨텍스트로 사용할 것입니다).

```python
memory.get_current_entities("what's Sams favorite color?")
```

```output
['Sam']
```

새 메시지에서 지식 트리플릿을 보다 모듈식으로 가져올 수도 있습니다(이전 메시지를 컨텍스트로 사용할 것입니다).

```python
memory.get_knowledge_triplets("her favorite color is red")
```

```output
[KnowledgeTriple(subject='Sam', predicate='favorite color', object_='red')]
```

## 체인에서 사용하기

이제 이것을 체인에서 사용해 보겠습니다!

```python
llm = OpenAI(temperature=0)
from langchain.chains import ConversationChain
from langchain_core.prompts.prompt import PromptTemplate

template = """The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context.
If the AI does not know the answer to a question, it truthfully says it does not know. The AI ONLY uses information contained in the "Relevant Information" section and does not hallucinate.

Relevant Information:

{history}

Conversation:
Human: {input}
AI:"""
prompt = PromptTemplate(input_variables=["history", "input"], template=template)
conversation_with_kg = ConversationChain(
    llm=llm, verbose=True, prompt=prompt, memory=ConversationKGMemory(llm=llm)
)
```

```python
conversation_with_kg.predict(input="Hi, what's up?")
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context.
If the AI does not know the answer to a question, it truthfully says it does not know. The AI ONLY uses information contained in the "Relevant Information" section and does not hallucinate.

Relevant Information:



Conversation:
Human: Hi, what's up?
AI:[0m

[1m> Finished chain.[0m
```

```output
" Hi there! I'm doing great. I'm currently in the process of learning about the world around me. I'm learning about different cultures, languages, and customs. It's really fascinating! How about you?"
```

```python
conversation_with_kg.predict(
    input="My name is James and I'm helping Will. He's an engineer."
)
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context.
If the AI does not know the answer to a question, it truthfully says it does not know. The AI ONLY uses information contained in the "Relevant Information" section and does not hallucinate.

Relevant Information:



Conversation:
Human: My name is James and I'm helping Will. He's an engineer.
AI:[0m

[1m> Finished chain.[0m
```

```output
" Hi James, it's nice to meet you. I'm an AI and I understand you're helping Will, the engineer. What kind of engineering does he do?"
```

```python
conversation_with_kg.predict(input="What do you know about Will?")
```

```output


[1m> Entering new ConversationChain chain...[0m
Prompt after formatting:
[32;1m[1;3mThe following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context.
If the AI does not know the answer to a question, it truthfully says it does not know. The AI ONLY uses information contained in the "Relevant Information" section and does not hallucinate.

Relevant Information:

On Will: Will is an engineer.

Conversation:
Human: What do you know about Will?
AI:[0m

[1m> Finished chain.[0m
```

```output
' Will is an engineer.'
```
