---
translated: true
---

# Google 금융

이 노트북은 Google 금융 페이지에서 정보를 얻는 방법을 설명합니다.

SerpApi 키를 얻으려면 https://serpapi.com/users/sign_up에서 가입하세요.

그런 다음 다음 명령으로 google-search-results를 설치하세요:

pip install google-search-results

그런 다음 환경 변수 SERPAPI_API_KEY를 SerpApi 키로 설정하세요

또는 래퍼에 키를 인수로 전달할 수 있습니다: serp_api_key="your secret key"

도구 사용하기

```python
%pip install --upgrade --quiet  google-search-results
```

```python
import os

from langchain_community.tools.google_finance import GoogleFinanceQueryRun
from langchain_community.utilities.google_finance import GoogleFinanceAPIWrapper

os.environ["SERPAPI_API_KEY"] = ""
tool = GoogleFinanceQueryRun(api_wrapper=GoogleFinanceAPIWrapper())
```

```python
tool.run("Google")
```

Langchain과 함께 사용하기

```python
import os

from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_openai import OpenAI

os.environ["OPENAI_API_KEY"] = ""
os.environ["SERP_API_KEY"] = ""
llm = OpenAI()
tools = load_tools(["google-scholar", "google-finance"], llm=llm)
agent = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
agent.run("what is google's stock")
```
