---
translated: true
---

# Streamlit

> **[Streamlit](https://streamlit.io/)は、データアプリを迅速に構築して共有する方法です。**
> Streamlitは、わずかな時間でデータスクリプトを共有可能なWebアプリに変換します。すべてPythonで行えます。フロントエンドの経験は不要です。
> 他の例は[streamlit.io/generative-ai](https://streamlit.io/generative-ai)をご覧ください。

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/langchain-ai/streamlit-agent?quickstart=1)

このガイドでは、`StreamlitCallbackHandler`を使用して、対話型のStreamlit appでエージェントの思考と行動を表示する方法を説明します。以下の実行中のアプリを使ってMRKLエージェントで試してみてください:

<iframe loading="lazy" src="https://langchain-mrkl.streamlit.app/?embed=true&embed_options=light_theme"
    style={{ width: 100 + '%', border: 'none', marginBottom: 1 + 'rem', height: 600 }}
    allow="camera;clipboard-read;clipboard-write;"
></iframe>

## インストールとセットアップ

```bash
pip install langchain streamlit
```

`streamlit hello`を実行して、サンプルアプリをロードし、インストールが成功したことを確認できます。Streamlitの[Getting started documentation](https://docs.streamlit.io/library/get-started)に完全な手順があります。

## 思考と行動の表示

`StreamlitCallbackHandler`を作成するには、出力をレンダリングするための親コンテナを提供するだけです。

```python
<!--IMPORTS:[{"imported": "StreamlitCallbackHandler", "source": "langchain_community.callbacks.streamlit", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.streamlit.StreamlitCallbackHandler.html", "title": "Streamlit"}]-->
from langchain_community.callbacks.streamlit import (
    StreamlitCallbackHandler,
)
import streamlit as st

st_callback = StreamlitCallbackHandler(st.container())
```

表示動作をカスタマイズするためのその他のキーワード引数は、[APIリファレンス](https://api.python.langchain.com/en/latest/callbacks/langchain.callbacks.streamlit.streamlit_callback_handler.StreamlitCallbackHandler.html)に記載されています。

### シナリオ1: ツールを使用するエージェントの場合

現在サポートされている主要なユースケースは、ツール(またはエージェントエグゼキューター)を使用するエージェントの行動を可視化することです。Streamlitアプリでエージェントを作成し、`StreamlitCallbackHandler`を`agent.run()`に渡すだけで、アプリ内で思考と行動をリアルタイムに視覚化できます。

```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.agent.AgentExecutor.html", "title": "Streamlit"}, {"imported": "create_react_agent", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.react.agent.create_react_agent.html", "title": "Streamlit"}, {"imported": "load_tools", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agent_toolkits/langchain_community.agent_toolkits.load_tools.load_tools.html", "title": "Streamlit"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_openai.llms.base.OpenAI.html", "title": "Streamlit"}]-->
import streamlit as st
from langchain import hub
from langchain.agents import AgentExecutor, create_react_agent, load_tools
from langchain_openai import OpenAI

llm = OpenAI(temperature=0, streaming=True)
tools = load_tools(["ddg-search"])
prompt = hub.pull("hwchase17/react")
agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

if prompt := st.chat_input():
    st.chat_message("user").write(prompt)
    with st.chat_message("assistant"):
        st_callback = StreamlitCallbackHandler(st.container())
        response = agent_executor.invoke(
            {"input": prompt}, {"callbacks": [st_callback]}
        )
        st.write(response["output"])
```

**注意:** 上記のアプリコードを正常に実行するには、`OPENAI_API_KEY`を設定する必要があります。
これを行う最も簡単な方法は、[Streamlit secrets.toml](https://docs.streamlit.io/library/advanced-features/secrets-management)、またはその他のローカルENV管理ツールを使用することです。

### その他のシナリオ

現在、`StreamlitCallbackHandler`はLangChainエージェントエグゼキューターの使用に合わせて設計されています。他のエージェントタイプ、Chainsでの直接使用などのサポートは、今後追加される予定です。

[StreamlitChatMessageHistory](/docs/integrations/memory/streamlit_chat_message_history)もLangChainで使用することをご検討ください。
