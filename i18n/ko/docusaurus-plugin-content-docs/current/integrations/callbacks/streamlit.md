---
translated: true
---

# Streamlit

> **[Streamlit](https://streamlit.io/)은 데이터 앱을 더 빠르게 구축하고 공유할 수 있는 방법입니다.**
> Streamlit은 데이터 스크립트를 몇 분 안에 공유 가능한 웹 앱으로 변환합니다. 모두 순수한 Python으로 작성됩니다. 프론트엔드 경험이 필요 없습니다.
> [streamlit.io/generative-ai](https://streamlit.io/generative-ai)에서 더 많은 예제를 확인하세요.

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/langchain-ai/streamlit-agent?quickstart=1)

이 가이드에서는 `StreamlitCallbackHandler`를 사용하여 에이전트의 생각과 행동을 인터랙티브한 Streamlit 앱에서 표시하는 방법을 시연합니다. 아래 실행 중인 앱에서 MRKL 에이전트를 사용해 보세요:

<iframe loading="lazy" src="https://langchain-mrkl.streamlit.app/?embed=true&embed_options=light_theme"
    style="width: 100%; border: none; margin-bottom: 1rem; height: 600px;"
    allow="camera;clipboard-read;clipboard-write;">
</iframe>

## 설치 및 설정

```bash
pip install langchain streamlit
```

설치가 성공했는지 확인하려면 `streamlit hello`를 실행하여 샘플 앱을 로드할 수 있습니다. 자세한 내용은 Streamlit의 [시작하기 문서](https://docs.streamlit.io/library/get-started)를 참조하세요.

## 생각과 행동 표시

`StreamlitCallbackHandler`를 생성하려면 출력물을 렌더링할 부모 컨테이너만 제공하면 됩니다.

```python
from langchain_community.callbacks.streamlit import StreamlitCallbackHandler
import streamlit as st

st_callback = StreamlitCallbackHandler(st.container())
```

디스플레이 동작을 사용자 정의하기 위한 추가 키워드 인수는 [API 참조](https://api.python.langchain.com/en/latest/callbacks/langchain.callbacks.streamlit.streamlit_callback_handler.StreamlitCallbackHandler.html)에서 설명되어 있습니다.

### 시나리오 1: 도구가 있는 에이전트 사용

현재 지원되는 주요 사용 사례는 도구가 있는 에이전트(또는 에이전트 실행기)의 행동을 시각화하는 것입니다. Streamlit 앱에서 에이전트를 생성하고 `StreamlitCallbackHandler`를 `agent.run()`에 전달하여 앱에서 생각과 행동을 실시간으로 시각화할 수 있습니다.

```python
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

**참고:** 위의 앱 코드가 성공적으로 실행되려면 `OPENAI_API_KEY`를 설정해야 합니다.
가장 쉬운 방법은 [Streamlit secrets.toml](https://docs.streamlit.io/library/advanced-features/secrets-management)을 사용하는 것입니다. 또는 다른 로컬 ENV 관리 도구를 사용할 수도 있습니다.

### 추가 시나리오

현재 `StreamlitCallbackHandler`는 LangChain 에이전트 실행기와 함께 사용하기에 적합합니다. 추가 에이전트 유형에 대한 지원 및 체인과 직접 사용하기 위한 지원은 추후 추가될 예정입니다.

또한 LangChain에 대한 [StreamlitChatMessageHistory](/docs/integrations/memory/streamlit_chat_message_history) 사용도 관심 있을 수 있습니다.