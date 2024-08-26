---
translated: true
---

# Mémoire dans LLMChain

Ce notebook explique comment utiliser la classe Memory avec un `LLMChain`.

Nous ajouterons la classe [ConversationBufferMemory](https://api.python.langchain.com/en/latest/memory/langchain.memory.buffer.ConversationBufferMemory.html#langchain.memory.buffer.ConversationBufferMemory), bien que ce puisse être n'importe quelle classe de mémoire.

```python
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
```

L'étape la plus importante est de configurer correctement l'invite. Dans l'invite ci-dessous, nous avons deux clés d'entrée : une pour l'entrée réelle, une autre pour l'entrée de la classe Memory. Il est important que les clés dans le `PromptTemplate` et le `ConversationBufferMemory` correspondent (`chat_history`).

```python
template = """You are a chatbot having a conversation with a human.

{chat_history}
Human: {human_input}
Chatbot:"""

prompt = PromptTemplate(
    input_variables=["chat_history", "human_input"], template=template
)
memory = ConversationBufferMemory(memory_key="chat_history")
```

```python
llm = OpenAI()
llm_chain = LLMChain(
    llm=llm,
    prompt=prompt,
    verbose=True,
    memory=memory,
)
```

```python
llm_chain.predict(human_input="Hi there my friend")
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mYou are a chatbot having a conversation with a human.


Human: Hi there my friend
Chatbot:[0m

[1m> Finished chain.[0m
```

```output
' Hi there! How can I help you today?'
```

```python
llm_chain.predict(human_input="Not too bad - how are you?")
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mYou are a chatbot having a conversation with a human.

Human: Hi there my friend
AI:  Hi there! How can I help you today?
Human: Not too bad - how are you?
Chatbot:[0m

[1m> Finished chain.[0m
```

```output
" I'm doing great, thanks for asking! How are you doing?"
```

## Ajout de mémoire à un modèle de chat basé sur `LLMChain`

Ce qui précède fonctionne pour les `LLM` de style complétion, mais si vous utilisez un modèle de chat, vous obtiendrez probablement de meilleures performances en utilisant des messages de chat structurés. Voici un exemple.

```python
from langchain_core.messages import SystemMessage
from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)
from langchain_openai import ChatOpenAI
```

Nous utiliserons la classe [ChatPromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html?highlight=chatprompttemplate) pour configurer l'invite de chat.

La méthode [from_messages](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html#langchain_core.prompts.chat.ChatPromptTemplate.from_messages) crée un `ChatPromptTemplate` à partir d'une liste de messages (par exemple, `SystemMessage`, `HumanMessage`, `AIMessage`, `ChatMessage`, etc.) ou de modèles de messages, comme le [MessagesPlaceholder](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html#langchain_core.prompts.chat.MessagesPlaceholder) ci-dessous.

La configuration ci-dessous fait en sorte que la mémoire sera injectée au milieu de l'invite de chat, dans la clé `chat_history`, et les entrées de l'utilisateur seront ajoutées dans un message humain/utilisateur à la fin de l'invite de chat.

```python
prompt = ChatPromptTemplate.from_messages(
    [
        SystemMessage(
            content="You are a chatbot having a conversation with a human."
        ),  # The persistent system prompt
        MessagesPlaceholder(
            variable_name="chat_history"
        ),  # Where the memory will be stored.
        HumanMessagePromptTemplate.from_template(
            "{human_input}"
        ),  # Where the human input will injected
    ]
)

memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
```

```python
llm = ChatOpenAI()

chat_llm_chain = LLMChain(
    llm=llm,
    prompt=prompt,
    verbose=True,
    memory=memory,
)
```

```python
chat_llm_chain.predict(human_input="Hi there my friend")
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mSystem: You are a chatbot having a conversation with a human.
Human: Hi there my friend[0m

[1m> Finished chain.[0m
```

```output
'Hello! How can I assist you today, my friend?'
```

```python
chat_llm_chain.predict(human_input="Not too bad - how are you?")
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mSystem: You are a chatbot having a conversation with a human.
Human: Hi there my friend
AI: Hello! How can I assist you today, my friend?
Human: Not too bad - how are you?[0m

[1m> Finished chain.[0m
```

```output
"I'm an AI chatbot, so I don't have feelings, but I'm here to help and chat with you! Is there something specific you would like to talk about or any questions I can assist you with?"
```
