---
canonical: https://python.langchain.com/v0.1/docs/modules/model_io/chat/function_calling
sidebar_position: 2
title: Tool/function calling
translated: false
---

# Tool calling

:::info
We use the term "tool calling" interchangeably with "function calling". Although
function calling is sometimes meant to refer to invocations of a single function,
we treat all models as though they can return multiple tool or function calls in
each message.
:::

:::tip
See [here](/docs/integrations/chat/) for a list of all models that support tool calling.
:::

Tool calling allows a model to respond to a given prompt by generating output that
matches a user-defined schema. While the name implies that the model is performing
some action, this is actually not the case! The model is coming up with the
arguments to a tool, and actually running the tool (or not) is up to the user -
for example, if you want to [extract output matching some schema](/docs/use_cases/extraction/)
from unstructured text, you could give the model an "extraction" tool that takes
parameters matching the desired schema, then treat the generated output as your final
result.

A tool call includes a name, arguments dict, and an optional identifier. The
arguments dict is structured `{argument_name: argument_value}`.

Many LLM providers, including [Anthropic](https://www.anthropic.com/),
[Cohere](https://cohere.com/), [Google](https://cloud.google.com/vertex-ai),
[Mistral](https://mistral.ai/), [OpenAI](https://openai.com/), and others,
support variants of a tool calling feature. These features typically allow requests
to the LLM to include available tools and their schemas, and for responses to include
calls to these tools. For instance, given a search engine tool, an LLM might handle a
query by first issuing a call to the search engine. The system calling the LLM can
receive the tool call, execute it, and return the output to the LLM to inform its
response. LangChain includes a suite of [built-in tools](/docs/integrations/tools/)
and supports several methods for defining your own [custom tools](/docs/modules/tools/custom_tools).
Tool-calling is extremely useful for building [tool-using chains and agents](/docs/use_cases/tool_use),
and for getting structured outputs from models more generally.

Providers adopt different conventions for formatting tool schemas and tool calls.
For instance, Anthropic returns tool calls as parsed structures within a larger content block:

```python
[
  {
    "text": "<thinking>\nI should use a tool.\n</thinking>",
    "type": "text"
  },
  {
    "id": "id_value",
    "input": {"arg_name": "arg_value"},
    "name": "tool_name",
    "type": "tool_use"
  }
]
```

whereas OpenAI separates tool calls into a distinct parameter, with arguments as JSON strings:

```python
{
  "tool_calls": [
    {
      "id": "id_value",
      "function": {
        "arguments": '{"arg_name": "arg_value"}',
        "name": "tool_name"
      },
      "type": "function"
    }
  ]
}
```

LangChain implements standard interfaces for defining tools, passing them to LLMs,
and representing tool calls.

## Request: Passing tools to model

For a model to be able to invoke tools, you need to pass tool schemas to it when making a chat request.
LangChain ChatModels supporting tool calling features implement a `.bind_tools` method, which
receives a list of LangChain [tool objects](https://api.python.langchain.com/en/latest/tools/langchain_core.tools.BaseTool.html#langchain_core.tools.BaseTool), Pydantic classes, or JSON Schemas and binds them to the chat model in the provider-specific expected format. Subsequent invocations of the
bound chat model will include tool schemas in every call to the model API.

### Defining tool schemas: LangChain Tool

For example, we can define the schema for custom tools using the `@tool` decorator
on Python functions:

```python
from langchain_core.tools import tool


@tool
def add(a: int, b: int) -> int:
    """Adds a and b.

    Args:
        a: first int
        b: second int
    """
    return a + b


@tool
def multiply(a: int, b: int) -> int:
    """Multiplies a and b.

    Args:
        a: first int
        b: second int
    """
    return a * b


tools = [add, multiply]
```

### Defining tool schemas: Pydantic class

We can equivalently define the schema using Pydantic. Pydantic is useful when your tool inputs are more complex:

```python
from langchain_core.pydantic_v1 import BaseModel, Field


# Note that the docstrings here are crucial, as they will be passed along
# to the model along with the class name.
class add(BaseModel):
    """Add two integers together."""

    a: int = Field(..., description="First integer")
    b: int = Field(..., description="Second integer")


class multiply(BaseModel):
    """Multiply two integers together."""

    a: int = Field(..., description="First integer")
    b: int = Field(..., description="Second integer")


tools = [add, multiply]
```

We can bind them to chat models as follows:

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs
  customVarName="llm"
  fireworksParams={`model="accounts/fireworks/models/firefunction-v1", temperature=0`}
/>

### Binding tool schemas

We can use the `bind_tools()` method to handle converting
`Multiply` to a "tool" and binding it to the model (i.e.,
passing it in each time the model is invoked).

```python
# | echo: false
# | output: false

from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
```

```python
llm_with_tools = llm.bind_tools(tools)
```

## Request: Forcing a tool call

When you just use `bind_tools(tools)`, the model can choose whether to return one tool call, multiple tool calls, or no tool calls at all. Some models support a `tool_choice` parameter that gives you some ability to force the model to call a tool. For models that support this, you can pass in the name of the tool you want the model to always call `tool_choice="xyz_tool_name"`. Or you can pass in `tool_choice="any"` to force the model to call at least one tool, without specifying which tool specifically.

:::note
Currently `tool_choice="any"` functionality is supported by OpenAI, MistralAI, FireworksAI, and Groq.

Currently Anthropic does not support `tool_choice` at all.
:::

If we wanted our model to always call the multiply tool we could do:

```python
always_multiply_llm = llm.bind_tools([multiply], tool_choice="multiply")
```

And if we wanted it to always call at least one of add or multiply, we could do:

```python
always_call_tool_llm = llm.bind_tools([add, multiply], tool_choice="any")
```

## Response: Reading tool calls from model output

If tool calls are included in a LLM response, they are attached to the corresponding
[AIMessage](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessage.html#langchain_core.messages.ai.AIMessage)
or [AIMessageChunk](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk) (when streaming)
as a list of [ToolCall](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.ToolCall.html#langchain_core.messages.tool.ToolCall)
objects in the `.tool_calls` attribute. A `ToolCall` is a typed dict that includes a
tool name, dict of argument values, and (optionally) an identifier. Messages with no
tool calls default to an empty list for this attribute.

Example:

```python
query = "What is 3 * 12? Also, what is 11 + 49?"

llm_with_tools.invoke(query).tool_calls
```

```output
[{'name': 'multiply',
  'args': {'a': 3, 'b': 12},
  'id': 'call_UL7E2232GfDHIQGOM4gJfEDD'},
 {'name': 'add',
  'args': {'a': 11, 'b': 49},
  'id': 'call_VKw8t5tpAuzvbHgdAXe9mjUx'}]
```

The `.tool_calls` attribute should contain valid tool calls. Note that on occasion,
model providers may output malformed tool calls (e.g., arguments that are not
valid JSON). When parsing fails in these cases, instances
of [InvalidToolCall](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.InvalidToolCall.html#langchain_core.messages.tool.InvalidToolCall)
are populated in the `.invalid_tool_calls` attribute. An `InvalidToolCall` can have
a name, string arguments, identifier, and error message.

If desired, [output parsers](/docs/modules/model_io/output_parsers) can further
process the output. For example, we can convert back to the original Pydantic class:

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser

chain = llm_with_tools | PydanticToolsParser(tools=[multiply, add])
chain.invoke(query)
```

```output
[multiply(a=3, b=12), add(a=11, b=49)]
```

## Response: Streaming

When tools are called in a streaming context,
[message chunks](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk)
will be populated with [tool call chunk](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.ToolCallChunk.html#langchain_core.messages.tool.ToolCallChunk)
objects in a list via the `.tool_call_chunks` attribute. A `ToolCallChunk` includes
optional string fields for the tool `name`, `args`, and `id`, and includes an optional
integer field `index` that can be used to join chunks together. Fields are optional
because portions of a tool call may be streamed across different chunks (e.g., a chunk
that includes a substring of the arguments may have null values for the tool name and id).

Because message chunks inherit from their parent message class, an
[AIMessageChunk](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk)
with tool call chunks will also include `.tool_calls` and `.invalid_tool_calls` fields.
These fields are parsed best-effort from the message's tool call chunks.

Note that not all providers currently support streaming for tool calls.

Example:

```python
async for chunk in llm_with_tools.astream(query):
    print(chunk.tool_call_chunks)
```

```output
[]
[{'name': 'multiply', 'args': '', 'id': 'call_5Gdgx3R2z97qIycWKixgD2OU', 'index': 0}]
[{'name': None, 'args': '{"a"', 'id': None, 'index': 0}]
[{'name': None, 'args': ': 3, ', 'id': None, 'index': 0}]
[{'name': None, 'args': '"b": 1', 'id': None, 'index': 0}]
[{'name': None, 'args': '2}', 'id': None, 'index': 0}]
[{'name': 'add', 'args': '', 'id': 'call_DpeKaF8pUCmLP0tkinhdmBgD', 'index': 1}]
[{'name': None, 'args': '{"a"', 'id': None, 'index': 1}]
[{'name': None, 'args': ': 11,', 'id': None, 'index': 1}]
[{'name': None, 'args': ' "b": ', 'id': None, 'index': 1}]
[{'name': None, 'args': '49}', 'id': None, 'index': 1}]
[]
```

Note that adding message chunks will merge their corresponding tool call chunks. This is the principle by which LangChain's various [tool output parsers](/docs/modules/model_io/output_parsers/types/openai_tools/) support streaming.

For example, below we accumulate tool call chunks:

```python
first = True
async for chunk in llm_with_tools.astream(query):
    if first:
        gathered = chunk
        first = False
    else:
        gathered = gathered + chunk

    print(gathered.tool_call_chunks)
```

```output
[]
[{'name': 'multiply', 'args': '', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a"', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, ', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 1', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a"', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11,', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11, "b": ', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11, "b": 49}', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11, "b": 49}', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
```

```python
print(type(gathered.tool_call_chunks[0]["args"]))
```

```output
<class 'str'>
```

And below we accumulate tool calls to demonstrate partial parsing:

```python
first = True
async for chunk in llm_with_tools.astream(query):
    if first:
        gathered = chunk
        first = False
    else:
        gathered = gathered + chunk

    print(gathered.tool_calls)
```

```output
[]
[]
[{'name': 'multiply', 'args': {}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 1}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
```

```python
print(type(gathered.tool_calls[0]["args"]))
```

```output
<class 'dict'>
```

## Request: Passing tool outputs to model

If we're using the model-generated tool invocations to actually call tools and want to pass the tool results back to the model, we can do so using `ToolMessage`s.

```python
from langchain_core.messages import HumanMessage, ToolMessage


@tool
def add(a: int, b: int) -> int:
    """Adds a and b.

    Args:
        a: first int
        b: second int
    """
    return a + b


@tool
def multiply(a: int, b: int) -> int:
    """Multiplies a and b.

    Args:
        a: first int
        b: second int
    """
    return a * b


tools = [add, multiply]
llm_with_tools = llm.bind_tools(tools)

messages = [HumanMessage(query)]
ai_msg = llm_with_tools.invoke(messages)
messages.append(ai_msg)

for tool_call in ai_msg.tool_calls:
    selected_tool = {"add": add, "multiply": multiply}[tool_call["name"].lower()]
    tool_output = selected_tool.invoke(tool_call["args"])
    messages.append(ToolMessage(tool_output, tool_call_id=tool_call["id"]))

messages
```

```output
[HumanMessage(content='What is 3 * 12? Also, what is 11 + 49?'),
 AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_Jja7J89XsjrOLA5rAjULqTSL', 'function': {'arguments': '{"a": 3, "b": 12}', 'name': 'multiply'}, 'type': 'function'}, {'id': 'call_K4ArVEUjhl36EcSuxGN1nwvZ', 'function': {'arguments': '{"a": 11, "b": 49}', 'name': 'add'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 49, 'prompt_tokens': 144, 'total_tokens': 193}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_a450710239', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-9db7e8e1-86d5-4015-9f43-f1d33abea64d-0', tool_calls=[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_Jja7J89XsjrOLA5rAjULqTSL'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_K4ArVEUjhl36EcSuxGN1nwvZ'}]),
 ToolMessage(content='36', tool_call_id='call_Jja7J89XsjrOLA5rAjULqTSL'),
 ToolMessage(content='60', tool_call_id='call_K4ArVEUjhl36EcSuxGN1nwvZ')]
```

```python
llm_with_tools.invoke(messages)
```

```output
AIMessage(content='3 * 12 = 36\n11 + 49 = 60', response_metadata={'token_usage': {'completion_tokens': 16, 'prompt_tokens': 209, 'total_tokens': 225}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_3b956da36b', 'finish_reason': 'stop', 'logprobs': None}, id='run-a55f8cb5-6d6d-4835-9c6b-7de36b2590c7-0')
```

## Request: Few-shot prompting

For more complex tool use it's very useful to add few-shot examples to the prompt. We can do this by adding `AIMessage`s with `ToolCall`s and corresponding `ToolMessage`s to our prompt.

:::note
For most models it's important that the ToolCall and ToolMessage ids line up, so that each AIMessage with ToolCalls is followed by ToolMessages with corresponding ids.

For example, even with some special instructions our model can get tripped up by order of operations:

```python
llm_with_tools.invoke(
    "Whats 119 times 8 minus 20. Don't do any math yourself, only use tools for math. Respect order of operations"
).tool_calls
```

```output
[{'name': 'multiply',
  'args': {'a': 119, 'b': 8},
  'id': 'call_RofMKNQ2qbWAFaMsef4cpTS9'},
 {'name': 'add',
  'args': {'a': 952, 'b': -20},
  'id': 'call_HjOfoF8ceMCHmO3cpwG6oB3X'}]
```

The model shouldn't be trying to add anything yet, since it technically can't know the results of 119 * 8 yet.

By adding a prompt with some examples we can correct this behavior:

```python
from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

examples = [
    HumanMessage(
        "What's the product of 317253 and 128472 plus four", name="example_user"
    ),
    AIMessage(
        "",
        name="example_assistant",
        tool_calls=[
            {"name": "multiply", "args": {"x": 317253, "y": 128472}, "id": "1"}
        ],
    ),
    ToolMessage("16505054784", tool_call_id="1"),
    AIMessage(
        "",
        name="example_assistant",
        tool_calls=[{"name": "add", "args": {"x": 16505054784, "y": 4}, "id": "2"}],
    ),
    ToolMessage("16505054788", tool_call_id="2"),
    AIMessage(
        "The product of 317253 and 128472 plus four is 16505054788",
        name="example_assistant",
    ),
]

system = """You are bad at math but are an expert at using a calculator.

Use past tool usage as an example of how to correctly use the tools."""
few_shot_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        *examples,
        ("human", "{query}"),
    ]
)

chain = {"query": RunnablePassthrough()} | few_shot_prompt | llm_with_tools
chain.invoke("Whats 119 times 8 minus 20").tool_calls
```

```output
[{'name': 'multiply',
  'args': {'a': 119, 'b': 8},
  'id': 'call_tWwpzWqqc8dQtN13CyKZCVMe'}]
```

Seems like we get the correct output this time.

Here's what the [LangSmith trace](https://smith.langchain.com/public/f70550a1-585f-4c9d-a643-13148ab1616f/r) looks like.

## Next steps

- **Output parsing**: See [OpenAI Tools output
    parsers](/docs/modules/model_io/output_parsers/types/openai_tools/)
    and [OpenAI Functions output
    parsers](/docs/modules/model_io/output_parsers/types/openai_functions/)
    to learn about extracting the function calling API responses into
    various formats.
- **Structured output chains**: [Some models have constructors](/docs/modules/model_io/chat/structured_output/) that
    handle creating a structured output chain for you.
- **Tool use**: See how to construct chains and agents that
    call the invoked tools in [these
    guides](/docs/use_cases/tool_use/).