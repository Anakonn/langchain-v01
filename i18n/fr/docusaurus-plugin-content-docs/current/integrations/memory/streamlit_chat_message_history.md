---
translated: true
---

# Streamlit

>[Streamlit](https://docs.streamlit.io/) est une bibliothèque Python open-source qui facilite la création et le partage d'applications web personnalisées et attrayantes pour l'apprentissage automatique et la science des données.

Ce notebook explique comment stocker et utiliser l'historique des messages de discussion dans une application `Streamlit`. `StreamlitChatMessageHistory` stockera les messages dans l'[état de session Streamlit](https://docs.streamlit.io/library/api-reference/session-state) à la clé spécifiée `key=`. La clé par défaut est `"langchain_messages"`.

- Remarque, `StreamlitChatMessageHistory` ne fonctionne que lorsqu'il est exécuté dans une application Streamlit.
- Vous pouvez également être intéressé par [StreamlitCallbackHandler](/docs/integrations/callbacks/streamlit) pour LangChain.
- Pour plus d'informations sur Streamlit, consultez leur [documentation de démarrage](https://docs.streamlit.io/library/get-started).

L'intégration se trouve dans le package `langchain-community`, nous devons donc l'installer. Nous devons également installer `streamlit`.

```bash
pip install -U langchain-community streamlit
```

Vous pouvez voir [l'exemple d'application complet en fonctionnement ici](https://langchain-st-memory.streamlit.app/) et d'autres exemples sur [github.com/langchain-ai/streamlit-agent](https://github.com/langchain-ai/streamlit-agent).

```python
from langchain_community.chat_message_histories import (
    StreamlitChatMessageHistory,
)

history = StreamlitChatMessageHistory(key="chat_messages")

history.add_user_message("hi!")
history.add_ai_message("whats up?")
```

```python
history.messages
```

Nous pouvons facilement combiner cette classe d'historique des messages avec [LCEL Runnables](/docs/expression_language/how_to/message_history).

L'historique sera conservé entre les exécutions de l'application Streamlit au sein d'une session utilisateur donnée. Un `StreamlitChatMessageHistory` donné ne sera pas conservé ou partagé entre les sessions utilisateur.

```python
# Optionally, specify your own session_state key for storing messages
msgs = StreamlitChatMessageHistory(key="special_app_key")

if len(msgs.messages) == 0:
    msgs.add_ai_message("How can I help you?")
```

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are an AI chatbot having a conversation with a human."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

chain = prompt | ChatOpenAI()
```

```python
chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: msgs,  # Always return the instance created earlier
    input_messages_key="question",
    history_messages_key="history",
)
```

Les applications Streamlit conversationnelles redessineront souvent chaque message de discussion précédent à chaque nouvelle exécution. C'est facile à faire en itérant sur `StreamlitChatMessageHistory.messages` :

```python
import streamlit as st

for msg in msgs.messages:
    st.chat_message(msg.type).write(msg.content)

if prompt := st.chat_input():
    st.chat_message("human").write(prompt)

    # As usual, new messages are added to StreamlitChatMessageHistory when the Chain is called.
    config = {"configurable": {"session_id": "any"}}
    response = chain_with_history.invoke({"question": prompt}, config)
    st.chat_message("ai").write(response.content)
```

**[Voir l'application finale](https://langchain-st-memory.streamlit.app/).**
