---
translated: true
---

# OpenAI फ़ंक्शन के रूप में उपकरण

यह नोटबुक OpenAI फ़ंक्शन के रूप में LangChain उपकरणों का उपयोग करने के बारे में बताता है।

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

OpenAI चैट मॉडल्स के साथ हम `bind_functions` का उपयोग करके फ़ंक्शन-जैसे ऑब्जेक्ट्स को स्वचालित रूप से बाइंड और कनवर्ट भी कर सकते हैं।

```python
model_with_functions = model.bind_functions(tools)
model_with_functions.invoke([HumanMessage(content="move file foo to bar")])
```

```output
AIMessage(content='', additional_kwargs={'function_call': {'arguments': '{\n  "source_path": "foo",\n  "destination_path": "bar"\n}', 'name': 'move_file'}})
```

या हम `tools` और `tool_choice` का उपयोग करने वाले नए OpenAI API का उपयोग कर सकते हैं `ChatOpenAI.bind_tools` का उपयोग करके:

```python
model_with_tools = model.bind_tools(tools)
model_with_tools.invoke([HumanMessage(content="move file foo to bar")])
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_btkY3xV71cEVAOHnNa5qwo44', 'function': {'arguments': '{\n  "source_path": "foo",\n  "destination_path": "bar"\n}', 'name': 'move_file'}, 'type': 'function'}]})
```
