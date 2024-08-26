---
translated: true
---

# कई कॉलबैक हैंडलर

पिछले उदाहरणों में, हमने `callbacks=` का उपयोग करके एक ऑब्जेक्ट के निर्माण पर कॉलबैक हैंडलर पास किए। इस मामले में, कॉलबैक उस विशिष्ट ऑब्जेक्ट के दायरे में होंगे।

हालांकि, कई मामलों में, ऑब्जेक्ट को चलाते समय हैंडलर पास करना लाभदायक होता है। जब हम `CallbackHandlers` को `callbacks` कीवर्ड आर्ग का उपयोग करके निष्पादन के दौरान पास करते हैं, तो ये कॉलबैक निष्पादन में शामिल सभी अंतर्निहित ऑब्जेक्ट्स द्वारा जारी किए जाएंगे। उदाहरण के लिए, जब एक हैंडलर को `Agent` को पास किया जाता है, तो वह एजेंट और एजेंट के निष्पादन में शामिल सभी ऑब्जेक्ट्स, इस मामले में `Tools`, `LLMChain` और `LLM` से संबंधित सभी कॉलबैक के लिए उपयोग किया जाएगा।

यह हमें प्रत्येक अंतर्निहित ऑब्जेक्ट में हैंडलर को मैन्युअल रूप से संलग्न करने से बचाता है।

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
