---
translated: true
---

# 다중 콜백 핸들러

이전 예제에서는 `callbacks=`를 사용하여 객체 생성 시 콜백 핸들러를 전달했습니다. 이 경우 콜백은 해당 객체의 범위에 한정됩니다.

그러나 많은 경우 객체를 실행할 때 대신 핸들러를 전달하는 것이 유리합니다. `callbacks` 키워드 인수를 사용하여 `CallbackHandlers`를 실행 시 전달하면, 실행에 관여하는 모든 중첩 객체에서 해당 콜백이 발생합니다. 예를 들어 `Agent`에 핸들러를 전달하면 해당 에이전트와 실행에 관여하는 `Tools`, `LLMChain`, `LLM`의 모든 콜백에 사용됩니다.

이를 통해 각 중첩 객체에 수동으로 핸들러를 연결할 필요가 없습니다.

```python
from typing import Any, Dict, List, Union

from langchain.agents import AgentType, initialize_agent, load_tools
from langchain.callbacks.base import BaseCallbackHandler
from langchain_core.agents import AgentAction
from langchain_openai import OpenAI


# First, define custom callback handler implementations
class MyCustomHandlerOne(BaseCallbackHandler):
    def on_llm_start(
        self, serialized: Dict[str, Any], prompts: List[str], **kwargs: Any
    ) -> Any:
        print(f"on_llm_start {serialized['name']}")

    def on_llm_new_token(self, token: str, **kwargs: Any) -> Any:
        print(f"on_new_token {token}")

    def on_llm_error(
        self, error: Union[Exception, KeyboardInterrupt], **kwargs: Any
    ) -> Any:
        """Run when LLM errors."""

    def on_chain_start(
        self, serialized: Dict[str, Any], inputs: Dict[str, Any], **kwargs: Any
    ) -> Any:
        print(f"on_chain_start {serialized['name']}")

    def on_tool_start(
        self, serialized: Dict[str, Any], input_str: str, **kwargs: Any
    ) -> Any:
        print(f"on_tool_start {serialized['name']}")

    def on_agent_action(self, action: AgentAction, **kwargs: Any) -> Any:
        print(f"on_agent_action {action}")


class MyCustomHandlerTwo(BaseCallbackHandler):
    def on_llm_start(
        self, serialized: Dict[str, Any], prompts: List[str], **kwargs: Any
    ) -> Any:
        print(f"on_llm_start (I'm the second handler!!) {serialized['name']}")


# Instantiate the handlers
handler1 = MyCustomHandlerOne()
handler2 = MyCustomHandlerTwo()

# Setup the agent. Only the `llm` will issue callbacks for handler2
llm = OpenAI(temperature=0, streaming=True, callbacks=[handler2])
tools = load_tools(["llm-math"], llm=llm)
agent = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION)

# Callbacks for handler1 will be issued by every object involved in the
# Agent execution (llm, llmchain, tool, agent executor)
agent.run("What is 2 raised to the 0.235 power?", callbacks=[handler1])
```

```output
on_chain_start AgentExecutor
on_chain_start LLMChain
on_llm_start OpenAI
on_llm_start (I'm the second handler!!) OpenAI
on_new_token  I
on_new_token  need
on_new_token  to
on_new_token  use
on_new_token  a
on_new_token  calculator
on_new_token  to
on_new_token  solve
on_new_token  this
on_new_token .
on_new_token
Action
on_new_token :
on_new_token  Calculator
on_new_token
Action
on_new_token  Input
on_new_token :
on_new_token  2
on_new_token ^
on_new_token 0
on_new_token .
on_new_token 235
on_new_token
on_agent_action AgentAction(tool='Calculator', tool_input='2^0.235', log=' I need to use a calculator to solve this.\nAction: Calculator\nAction Input: 2^0.235')
on_tool_start Calculator
on_chain_start LLMMathChain
on_chain_start LLMChain
on_llm_start OpenAI
on_llm_start (I'm the second handler!!) OpenAI
on_new_token
on_new_token ```text
on_new_token

on_new_token 2
on_new_token **
on_new_token 0
on_new_token .
on_new_token 235
on_new_token

on_new_token ```

on_new_token ...
on_new_token num
on_new_token expr
on_new_token .
on_new_token evaluate
on_new_token ("
on_new_token 2
on_new_token **
on_new_token 0
on_new_token .
on_new_token 235
on_new_token ")
on_new_token ...
on_new_token

on_new_token
on_chain_start LLMChain
on_llm_start OpenAI
on_llm_start (I'm the second handler!!) OpenAI
on_new_token  I
on_new_token  now
on_new_token  know
on_new_token  the
on_new_token  final
on_new_token  answer
on_new_token .
on_new_token
Final
on_new_token  Answer
on_new_token :
on_new_token  1
on_new_token .
on_new_token 17
on_new_token 690
on_new_token 67
on_new_token 372
on_new_token 187
on_new_token 674
on_new_token
```

```output
'1.1769067372187674'
```
