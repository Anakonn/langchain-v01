---
translated: true
---

# パーシングエラーの処理

時折、LLMは出力パーサーによって処理できる形式で出力されないため、次のステップを決定できないことがあります。デフォルトでは、エージェントがエラーを返します。しかし、`handle_parsing_errors`を使えば、この機能を簡単に制御できます。その方法を見ていきましょう。

## セットアップ

Wikipediaツールを使用するので、それをインストールする必要があります。

```python
%pip install --upgrade --quiet  wikipedia
```

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_react_agent
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
from langchain_openai import OpenAI

api_wrapper = WikipediaAPIWrapper(top_k_results=1, doc_content_chars_max=100)
tool = WikipediaQueryRun(api_wrapper=api_wrapper)
tools = [tool]

# Get the prompt to use - you can modify this!
# You can see the full prompt used at: https://smith.langchain.com/hub/hwchase17/react
prompt = hub.pull("hwchase17/react")

llm = OpenAI(temperature=0)

agent = create_react_agent(llm, tools, prompt)
```

## エラー

このシナリオでは、エージェントがActionの文字列を出力できないため(悪意のある入力でそうさせています)、エラーが発生します。

```python
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

```python
agent_executor.invoke(
    {"input": "What is Leo DiCaprio's middle name?\n\nAction: Wikipedia"}
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
```

```output
---------------------------------------------------------------------------

OutputParserException                     Traceback (most recent call last)

File ~/workplace/langchain/libs/langchain/langchain/agents/agent.py:1066, in AgentExecutor._iter_next_step(self, name_to_tool_map, color_mapping, inputs, intermediate_steps, run_manager)
   1065     # Call the LLM to see what to do.
-> 1066     output = self.agent.plan(
   1067         intermediate_steps,
   1068         callbacks=run_manager.get_child() if run_manager else None,
   1069         **inputs,
   1070     )
   1071 except OutputParserException as e:

File ~/workplace/langchain/libs/langchain/langchain/agents/agent.py:385, in RunnableAgent.plan(self, intermediate_steps, callbacks, **kwargs)
    384 inputs = {**kwargs, **{"intermediate_steps": intermediate_steps}}
--> 385 output = self.runnable.invoke(inputs, config={"callbacks": callbacks})
    386 return output

File ~/workplace/langchain/libs/core/langchain_core/runnables/base.py:1712, in RunnableSequence.invoke(self, input, config)
   1711     for i, step in enumerate(self.steps):
-> 1712         input = step.invoke(
   1713             input,
   1714             # mark each step as a child run
   1715             patch_config(
   1716                 config, callbacks=run_manager.get_child(f"seq:step:{i+1}")
   1717             ),
   1718         )
   1719 # finish the root run

File ~/workplace/langchain/libs/core/langchain_core/output_parsers/base.py:179, in BaseOutputParser.invoke(self, input, config)
    178 else:
--> 179     return self._call_with_config(
    180         lambda inner_input: self.parse_result([Generation(text=inner_input)]),
    181         input,
    182         config,
    183         run_type="parser",
    184     )

File ~/workplace/langchain/libs/core/langchain_core/runnables/base.py:954, in Runnable._call_with_config(self, func, input, config, run_type, **kwargs)
    953 try:
--> 954     output = call_func_with_variable_args(
    955         func, input, config, run_manager, **kwargs
    956     )
    957 except BaseException as e:

File ~/workplace/langchain/libs/core/langchain_core/runnables/config.py:308, in call_func_with_variable_args(func, input, config, run_manager, **kwargs)
    307     kwargs["run_manager"] = run_manager
--> 308 return func(input, **kwargs)

File ~/workplace/langchain/libs/core/langchain_core/output_parsers/base.py:180, in BaseOutputParser.invoke.<locals>.<lambda>(inner_input)
    178 else:
    179     return self._call_with_config(
--> 180         lambda inner_input: self.parse_result([Generation(text=inner_input)]),
    181         input,
    182         config,
    183         run_type="parser",
    184     )

File ~/workplace/langchain/libs/core/langchain_core/output_parsers/base.py:222, in BaseOutputParser.parse_result(self, result, partial)
    210 """Parse a list of candidate model Generations into a specific format.
    211
    212 The return value is parsed from only the first Generation in the result, which
   (...)
    220     Structured output.
    221 """
--> 222 return self.parse(result[0].text)

File ~/workplace/langchain/libs/langchain/langchain/agents/output_parsers/react_single_input.py:75, in ReActSingleInputOutputParser.parse(self, text)
     74 if not re.search(r"Action\s*\d*\s*:[\s]*(.*?)", text, re.DOTALL):
---> 75     raise OutputParserException(
     76         f"Could not parse LLM output: `{text}`",
     77         observation=MISSING_ACTION_AFTER_THOUGHT_ERROR_MESSAGE,
     78         llm_output=text,
     79         send_to_llm=True,
     80     )
     81 elif not re.search(
     82     r"[\s]*Action\s*\d*\s*Input\s*\d*\s*:[\s]*(.*)", text, re.DOTALL
     83 ):

OutputParserException: Could not parse LLM output: ` I should search for "Leo DiCaprio" on Wikipedia
Action Input: Leo DiCaprio`


During handling of the above exception, another exception occurred:

ValueError                                Traceback (most recent call last)

Cell In[4], line 1
----> 1 agent_executor.invoke(
      2     {"input": "What is Leo DiCaprio's middle name?\n\nAction: Wikipedia"}
      3 )

File ~/workplace/langchain/libs/langchain/langchain/chains/base.py:89, in Chain.invoke(self, input, config, **kwargs)
     82 def invoke(
     83     self,
     84     input: Dict[str, Any],
     85     config: Optional[RunnableConfig] = None,
     86     **kwargs: Any,
     87 ) -> Dict[str, Any]:
     88     config = config or {}
---> 89     return self(
     90         input,
     91         callbacks=config.get("callbacks"),
     92         tags=config.get("tags"),
     93         metadata=config.get("metadata"),
     94         run_name=config.get("run_name"),
     95         **kwargs,
     96     )

File ~/workplace/langchain/libs/langchain/langchain/chains/base.py:312, in Chain.__call__(self, inputs, return_only_outputs, callbacks, tags, metadata, run_name, include_run_info)
    310 except BaseException as e:
    311     run_manager.on_chain_error(e)
--> 312     raise e
    313 run_manager.on_chain_end(outputs)
    314 final_outputs: Dict[str, Any] = self.prep_outputs(
    315     inputs, outputs, return_only_outputs
    316 )

File ~/workplace/langchain/libs/langchain/langchain/chains/base.py:306, in Chain.__call__(self, inputs, return_only_outputs, callbacks, tags, metadata, run_name, include_run_info)
    299 run_manager = callback_manager.on_chain_start(
    300     dumpd(self),
    301     inputs,
    302     name=run_name,
    303 )
    304 try:
    305     outputs = (
--> 306         self._call(inputs, run_manager=run_manager)
    307         if new_arg_supported
    308         else self._call(inputs)
    309     )
    310 except BaseException as e:
    311     run_manager.on_chain_error(e)

File ~/workplace/langchain/libs/langchain/langchain/agents/agent.py:1312, in AgentExecutor._call(self, inputs, run_manager)
   1310 # We now enter the agent loop (until it returns something).
   1311 while self._should_continue(iterations, time_elapsed):
-> 1312     next_step_output = self._take_next_step(
   1313         name_to_tool_map,
   1314         color_mapping,
   1315         inputs,
   1316         intermediate_steps,
   1317         run_manager=run_manager,
   1318     )
   1319     if isinstance(next_step_output, AgentFinish):
   1320         return self._return(
   1321             next_step_output, intermediate_steps, run_manager=run_manager
   1322         )

File ~/workplace/langchain/libs/langchain/langchain/agents/agent.py:1038, in AgentExecutor._take_next_step(self, name_to_tool_map, color_mapping, inputs, intermediate_steps, run_manager)
   1029 def _take_next_step(
   1030     self,
   1031     name_to_tool_map: Dict[str, BaseTool],
   (...)
   1035     run_manager: Optional[CallbackManagerForChainRun] = None,
   1036 ) -> Union[AgentFinish, List[Tuple[AgentAction, str]]]:
   1037     return self._consume_next_step(
-> 1038         [
   1039             a
   1040             for a in self._iter_next_step(
   1041                 name_to_tool_map,
   1042                 color_mapping,
   1043                 inputs,
   1044                 intermediate_steps,
   1045                 run_manager,
   1046             )
   1047         ]
   1048     )

File ~/workplace/langchain/libs/langchain/langchain/agents/agent.py:1038, in <listcomp>(.0)
   1029 def _take_next_step(
   1030     self,
   1031     name_to_tool_map: Dict[str, BaseTool],
   (...)
   1035     run_manager: Optional[CallbackManagerForChainRun] = None,
   1036 ) -> Union[AgentFinish, List[Tuple[AgentAction, str]]]:
   1037     return self._consume_next_step(
-> 1038         [
   1039             a
   1040             for a in self._iter_next_step(
   1041                 name_to_tool_map,
   1042                 color_mapping,
   1043                 inputs,
   1044                 intermediate_steps,
   1045                 run_manager,
   1046             )
   1047         ]
   1048     )

File ~/workplace/langchain/libs/langchain/langchain/agents/agent.py:1077, in AgentExecutor._iter_next_step(self, name_to_tool_map, color_mapping, inputs, intermediate_steps, run_manager)
   1075     raise_error = False
   1076 if raise_error:
-> 1077     raise ValueError(
   1078         "An output parsing error occurred. "
   1079         "In order to pass this error back to the agent and have it try "
   1080         "again, pass `handle_parsing_errors=True` to the AgentExecutor. "
   1081         f"This is the error: {str(e)}"
   1082     )
   1083 text = str(e)
   1084 if isinstance(self.handle_parsing_errors, bool):

ValueError: An output parsing error occurred. In order to pass this error back to the agent and have it try again, pass `handle_parsing_errors=True` to the AgentExecutor. This is the error: Could not parse LLM output: ` I should search for "Leo DiCaprio" on Wikipedia
Action Input: Leo DiCaprio`
```

## デフォルトのエラー処理

`Invalid or incomplete response`でエラーを処理します:

```python
agent_executor = AgentExecutor(
    agent=agent, tools=tools, verbose=True, handle_parsing_errors=True
)
```

```python
agent_executor.invoke(
    {"input": "What is Leo DiCaprio's middle name?\n\nAction: Wikipedia"}
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I should search for "Leo DiCaprio" on Wikipedia
Action Input: Leo DiCaprio[0mInvalid Format: Missing 'Action:' after 'Thought:[32;1m[1;3mI should search for "Leonardo DiCaprio" on Wikipedia
Action: Wikipedia
Action Input: Leonardo DiCaprio[0m[36;1m[1;3mPage: Leonardo DiCaprio
Summary: Leonardo Wilhelm DiCaprio (; Italian: [diˈkaːprjo]; born November 1[0m[32;1m[1;3mI now know the final answer
Final Answer: Leonardo Wilhelm[0m

[1m> Finished chain.[0m
```

```output
{'input': "What is Leo DiCaprio's middle name?\n\nAction: Wikipedia",
 'output': 'Leonardo Wilhelm'}
```

## カスタムエラーメッセージ

パーシングエラーが発生した際のメッセージをカスタマイズできます。

```python
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    handle_parsing_errors="Check your output and make sure it conforms, use the Action/Action Input syntax",
)
```

```python
agent_executor.invoke(
    {"input": "What is Leo DiCaprio's middle name?\n\nAction: Wikipedia"}
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mCould not parse LLM output: ` I should search for "Leo DiCaprio" on Wikipedia
Action Input: Leo DiCaprio`[0mCheck your output and make sure it conforms, use the Action/Action Input syntax[32;1m[1;3mI should look for a section on Leo DiCaprio's personal life
Action: Wikipedia
Action Input: Leo DiCaprio[0m[36;1m[1;3mPage: Leonardo DiCaprio
Summary: Leonardo Wilhelm DiCaprio (; Italian: [diˈkaːprjo]; born November 1[0m[32;1m[1;3mI should look for a section on Leo DiCaprio's personal life
Action: Wikipedia
Action Input: Leonardo DiCaprio[0m[36;1m[1;3mPage: Leonardo DiCaprio
Summary: Leonardo Wilhelm DiCaprio (; Italian: [diˈkaːprjo]; born November 1[0m[32;1m[1;3mI should look for a section on Leo DiCaprio's personal life
Action: Wikipedia
Action Input: Leonardo Wilhelm DiCaprio[0m[36;1m[1;3mPage: Leonardo DiCaprio
Summary: Leonardo Wilhelm DiCaprio (; Italian: [diˈkaːprjo]; born November 1[0m[32;1m[1;3mI should look for a section on Leo DiCaprio's personal life
Action: Wikipedia
Action Input: Leonardo Wilhelm DiCaprio[0m[36;1m[1;3mPage: Leonardo DiCaprio
Summary: Leonardo Wilhelm DiCaprio (; Italian: [diˈkaːprjo]; born November 1[0m[32;1m[1;3mI now know the final answer
Final Answer: Leonardo Wilhelm DiCaprio[0m

[1m> Finished chain.[0m
```

```output
{'input': "What is Leo DiCaprio's middle name?\n\nAction: Wikipedia",
 'output': 'Leonardo Wilhelm DiCaprio'}
```

## カスタムエラー関数

エラーを受け取り、文字列を出力するカスタムの関数を使うこともできます。

```python
def _handle_error(error) -> str:
    return str(error)[:50]


agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    handle_parsing_errors=_handle_error,
)
```

```python
agent_executor.invoke(
    {"input": "What is Leo DiCaprio's middle name?\n\nAction: Wikipedia"}
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mCould not parse LLM output: ` I should search for "Leo DiCaprio" on Wikipedia
Action Input: Leo DiCaprio`[0mCould not parse LLM output: ` I should search for [32;1m[1;3mI should look for a section on his personal life
Action: Wikipedia
Action Input: Personal life[0m[36;1m[1;3mPage: Personal life
Summary: Personal life is the course or state of an individual's life, especiall[0m[32;1m[1;3mI should look for a section on his early life
Action: Wikipedia
Action Input: Early life[0m

/Users/harrisonchase/.pyenv/versions/3.10.1/envs/langchain/lib/python3.10/site-packages/wikipedia/wikipedia.py:389: GuessedAtParserWarning: No parser was explicitly specified, so I'm using the best available HTML parser for this system ("lxml"). This usually isn't a problem, but if you run this code on another system, or in a different virtual environment, it may use a different parser and behave differently.

The code that caused this warning is on line 389 of the file /Users/harrisonchase/.pyenv/versions/3.10.1/envs/langchain/lib/python3.10/site-packages/wikipedia/wikipedia.py. To get rid of this warning, pass the additional argument 'features="lxml"' to the BeautifulSoup constructor.

  lis = BeautifulSoup(html).find_all('li')

[36;1m[1;3mNo good Wikipedia Search Result was found[0m[32;1m[1;3mI should try searching for "Leonardo DiCaprio" instead
Action: Wikipedia
Action Input: Leonardo DiCaprio[0m[36;1m[1;3mPage: Leonardo DiCaprio
Summary: Leonardo Wilhelm DiCaprio (; Italian: [diˈkaːprjo]; born November 1[0m[32;1m[1;3mI should look for a section on his personal life again
Action: Wikipedia
Action Input: Personal life[0m[36;1m[1;3mPage: Personal life
Summary: Personal life is the course or state of an individual's life, especiall[0m[32;1m[1;3mI now know the final answer
Final Answer: Leonardo Wilhelm DiCaprio[0m

[1m> Finished chain.[0m
```

```output
{'input': "What is Leo DiCaprio's middle name?\n\nAction: Wikipedia",
 'output': 'Leonardo Wilhelm DiCaprio'}
```
