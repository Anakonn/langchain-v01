---
translated: true
---

# MultiOn

[MultiON](https://www.multion.ai/blog/multion-building-a-brighter-future-for-humanity-with-ai-agents)은 다양한 웹 서비스와 애플리케이션과 상호 작용할 수 있는 AI 에이전트를 구축했습니다.

이 노트북은 LangChain을 `MultiOn` 클라이언트에 연결하는 방법을 안내합니다.

이를 통해 MultiON 에이전트의 힘을 활용하는 사용자 지정 에이전트 워크플로를 만들 수 있습니다.

이 도구 키트를 사용하려면 브라우저에 `MultiOn Extension`을 추가해야 합니다:

* [MultiON 계정](https://app.multion.ai/login?callbackUrl=%2Fprofile)을 만드세요.
* [Chrome용 MultiOn 확장 프로그램](https://multion.notion.site/Download-MultiOn-ddddcfe719f94ab182107ca2612c07a5)을 추가하세요.

```python
%pip install --upgrade --quiet  multion langchain -q
```

```python
from langchain_community.agent_toolkits import MultionToolkit

toolkit = MultionToolkit()
toolkit
```

```output
MultionToolkit()
```

```python
tools = toolkit.get_tools()
tools
```

```output
[MultionCreateSession(), MultionUpdateSession(), MultionCloseSession()]
```

## MultiOn 설정

계정을 만든 후 https://app.multion.ai/에서 API 키를 만드세요.

확장 프로그램과의 연결을 설정하려면 로그인하세요.

```python
# Authorize connection to your Browser extention
import multion

multion.login()
```

```output
Logged in.
```

## 에이전트 내에서 Multion 도구 키트 사용

이를 통해 MultiON 크롬 확장 프로그램을 사용하여 원하는 작업을 수행할 수 있습니다.

아래 코드를 실행하고 [trace](https://smith.langchain.com/public/34aaf36d-204a-4ce3-a54e-4a0976f09670/r)를 확인하면 다음을 볼 수 있습니다:

* 에이전트가 `create_multion_session` 도구를 사용합니다
* 그런 다음 MultiON을 사용하여 쿼리를 실행합니다

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_openai import ChatOpenAI
```

```python
# Prompt
instructions = """You are an assistant."""
base_prompt = hub.pull("langchain-ai/openai-functions-template")
prompt = base_prompt.partial(instructions=instructions)
```

```python
# LLM
llm = ChatOpenAI(temperature=0)
```

```python
# Agent
agent = create_openai_functions_agent(llm, toolkit.get_tools(), prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=toolkit.get_tools(),
    verbose=False,
)
```

```python
agent_executor.invoke(
    {
        "input": "Use multion to explain how AlphaCodium works, a recently released code language model."
    }
)
```

```output
WARNING: 'new_session' is deprecated and will be removed in a future version. Use 'create_session' instead.
WARNING: 'update_session' is deprecated and will be removed in a future version. Use 'step_session' instead.
WARNING: 'update_session' is deprecated and will be removed in a future version. Use 'step_session' instead.
WARNING: 'update_session' is deprecated and will be removed in a future version. Use 'step_session' instead.
WARNING: 'update_session' is deprecated and will be removed in a future version. Use 'step_session' instead.
```

```output
{'input': 'Use multion to how AlphaCodium works, a recently released code language model.',
 'output': 'AlphaCodium is a recently released code language model that is designed to assist developers in writing code more efficiently. It is based on advanced machine learning techniques and natural language processing. AlphaCodium can understand and generate code in multiple programming languages, making it a versatile tool for developers.\n\nThe model is trained on a large dataset of code snippets and programming examples, allowing it to learn patterns and best practices in coding. It can provide suggestions and auto-complete code based on the context and the desired outcome.\n\nAlphaCodium also has the ability to analyze code and identify potential errors or bugs. It can offer recommendations for improving code quality and performance.\n\nOverall, AlphaCodium aims to enhance the coding experience by providing intelligent assistance and reducing the time and effort required to write high-quality code.\n\nFor more detailed information, you can visit the official AlphaCodium website or refer to the documentation and resources available online.\n\nI hope this helps! Let me know if you have any other questions.'}
```
