---
translated: true
---

# OpenAI 함수로서의 도구

이 노트북은 LangChain 도구를 OpenAI 함수로 사용하는 방법을 다룹니다.

```python
%pip install -qU langchain-community langchain-openai
```

```python
from langchain_community.tools import MoveFileTool
from langchain_core.messages import HumanMessage
from langchain_core.utils.function_calling import convert_to_openai_function
from langchain_openai import ChatOpenAI
```

```python
model = ChatOpenAI(model="gpt-3.5-turbo")
```

```python
tools = [MoveFileTool()]
functions = [convert_to_openai_function(t) for t in tools]
```

```python
functions[0]
```

```output
{'name': 'move_file',
 'description': 'Move or rename a file from one location to another',
 'parameters': {'type': 'object',
  'properties': {'source_path': {'description': 'Path of the file to move',
    'type': 'string'},
   'destination_path': {'description': 'New path for the moved file',
    'type': 'string'}},
  'required': ['source_path', 'destination_path']}}
```

```python
message = model.invoke(
    [HumanMessage(content="move file foo to bar")], functions=functions
)
```

```python
message
```

```output
AIMessage(content='', additional_kwargs={'function_call': {'arguments': '{\n  "source_path": "foo",\n  "destination_path": "bar"\n}', 'name': 'move_file'}})
```

```python
message.additional_kwargs["function_call"]
```

```output
{'name': 'move_file',
 'arguments': '{\n  "source_path": "foo",\n  "destination_path": "bar"\n}'}
```

OpenAI 채팅 모델에서는 `bind_functions`를 사용하여 함수 유사 객체를 자동으로 바인딩하고 변환할 수 있습니다.

```python
model_with_functions = model.bind_functions(tools)
model_with_functions.invoke([HumanMessage(content="move file foo to bar")])
```

```output
AIMessage(content='', additional_kwargs={'function_call': {'arguments': '{\n  "source_path": "foo",\n  "destination_path": "bar"\n}', 'name': 'move_file'}})
```

또는 `tools`와 `tool_choice`를 사용하는 새로운 OpenAI API를 사용할 수 있으며, `ChatOpenAI.bind_tools`를 사용하여 이를 수행할 수 있습니다:

```python
model_with_tools = model.bind_tools(tools)
model_with_tools.invoke([HumanMessage(content="move file foo to bar")])
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_btkY3xV71cEVAOHnNa5qwo44', 'function': {'arguments': '{\n  "source_path": "foo",\n  "destination_path": "bar"\n}', 'name': 'move_file'}, 'type': 'function'}]})
```
