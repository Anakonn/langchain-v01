---
translated: true
---

# Ionic 쇼핑 도구

[Ionic](https://www.ioniccommerce.com/)은 AI 어시스턴트를 위한 플러그 앤 플레이 전자상거래 marketplace입니다. [Ionic Tool](https://github.com/ioniccommerce/ionic_langchain)을 에이전트에 포함시킴으로써 사용자가 에이전트 내에서 직접 쇼핑하고 거래할 수 있는 기능을 제공할 수 있으며, 거래 수수료를 받을 수 있습니다.

이 기본 jupyter notebook은 Ionic Tool을 에이전트에 통합하는 방법을 보여줍니다. Ionic 설정에 대한 자세한 내용은 Ionic [documentation](https://docs.ioniccommerce.com/introduction)을 참조하세요.

이 Jupyter Notebook은 Agent에서 Ionic 도구를 사용하는 방법을 보여줍니다.

**참고: ionic-langchain 패키지는 LangChain 관리자가 아닌 Ionic Commerce 팀에서 유지 관리합니다.**

---

## 설정

```python
pip install langchain langchain_openai langchainhub
```

```python
pip install ionic-langchain
```

## 에이전트 설정

```python
from ionic_langchain.tool import Ionic, IonicTool
from langchain import hub
from langchain.agents import AgentExecutor, Tool, create_react_agent
from langchain_openai import OpenAI

# Based on ReAct Agent
# https://python.langchain.com/docs/modules/agents/agent_types/react
# Please reach out to support@ionicapi.com for help with add'l agent types.

open_ai_key = "YOUR KEY HERE"
model = "gpt-3.5-turbo-instruct"
temperature = 0.6

llm = OpenAI(openai_api_key=open_ai_key, model_name=model, temperature=temperature)


ionic_tool = IonicTool().tool()


# The tool comes with its own prompt,
# but you may also update it directly via the description attribute:

ionic_tool.description = str(
    """
Ionic is an e-commerce shopping tool. Assistant uses the Ionic Commerce Shopping Tool to find, discover, and compare products from thousands of online retailers. Assistant should use the tool when the user is looking for a product recommendation or trying to find a specific product.

The user may specify the number of results, minimum price, and maximum price for which they want to see results.
Ionic Tool input is a comma-separated string of values:
  - query string (required, must not include commas)
  - number of results (default to 4, no more than 10)
  - minimum price in cents ($5 becomes 500)
  - maximum price in cents
For example, if looking for coffee beans between 5 and 10 dollars, the tool input would be `coffee beans, 5, 500, 1000`.

Return them as a markdown formatted list with each recommendation from tool results, being sure to include the full PDP URL. For example:

1. Product 1: [Price] -- link
2. Product 2: [Price] -- link
3. Product 3: [Price] -- link
4. Product 4: [Price] -- link
"""
)

tools = [ionic_tool]

# default prompt for create_react_agent
prompt = hub.pull("hwchase17/react")

agent = create_react_agent(
    llm,
    tools,
    prompt=prompt,
)

agent_executor = AgentExecutor(
    agent=agent, tools=tools, handle_parsing_errors=True, verbose=True, max_iterations=5
)
```

## 실행

```python
input = (
    "I'm looking for a new 4k monitor can you find me some options for less than $1000"
)
agent_executor.invoke({"input": input})
```
