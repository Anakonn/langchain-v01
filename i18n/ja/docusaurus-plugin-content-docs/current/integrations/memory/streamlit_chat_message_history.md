---
translated: true
---

# Streamlit

>[Streamlit](https://docs.streamlit.io/)は、機械学習やデータサイエンスのための美しくカスタマイズ可能なWebアプリを簡単に作成・共有できるオープンソースのPythonライブラリです。

このノートブックでは、`Streamlit`アプリでチャットメッセージの履歴を保存・使用する方法について説明します。`StreamlitChatMessageHistory`は、指定された`key=`でメッセージを[Streamlit セッションステート](https://docs.streamlit.io/library/api-reference/session-state)に保存します。デフォルトのキーは`"langchain_messages"`です。

- `StreamlitChatMessageHistory`は、Streamlitアプリ内で実行される場合にのみ機能します。
- [StreamlitCallbackHandler](/docs/integrations/callbacks/streamlit)もLangChainで興味深いかもしれません。
- Streamlitの詳細については、[getting started documentation](https://docs.streamlit.io/library/get-started)をご覧ください。

このインテグレーションは`langchain-community`パッケージに含まれているため、それをインストールする必要があります。また、`streamlit`もインストールする必要があります。

```bash
pip install -U langchain-community streamlit
```

[完全なアプリの例](https://langchain-st-memory.streamlit.app/)を見ることができ、[github.com/langchain-ai/streamlit-agent](https://github.com/langchain-ai/streamlit-agent)にもさらに多くの例があります。

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

このメッセージ履歴クラスを[LCEL Runnables](/docs/expression_language/how_to/message_history)と簡単に組み合わせることができます。

履歴は、ユーザーセッション内での Streamlit アプリの再実行間で保持されます。特定の`StreamlitChatMessageHistory`は、ユーザーセッション間では保持または共有されません。

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

会話型の Streamlit アプリでは、通常、前回のチャットメッセージを再描画することが多いです。これは、`StreamlitChatMessageHistory.messages`を反復処理することで簡単に行えます。

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

**[最終的なアプリを表示](https://langchain-st-memory.streamlit.app/)。**
