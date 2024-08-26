---
translated: true
---

# कस्टम टूल्स को परिभाषित करना

जब आप अपने खुद के एजेंट का निर्माण कर रहे हैं, तो आपको उसे उपयोग कर सकने वाली एक सूची प्रदान करनी होगी। वास्तविक फ़ंक्शन के अलावा, टूल में कई घटक होते हैं:

- `name` (स्ट्रिंग), अनिवार्य है और एक सेट में अनूठा होना चाहिए
- `description` (स्ट्रिंग), वैकल्पिक है लेकिन अनुशंसित है, क्योंकि एजेंट द्वारा टूल का उपयोग निर्धारित करने में इसका उपयोग किया जाता है
- `args_schema` (Pydantic BaseModel), वैकल्पिक है लेकिन अनुशंसित है, और अधिक जानकारी (जैसे, फ़्यू-शॉट उदाहरण) या अपेक्षित पैरामीटर के सत्यापन के लिए उपयोग किया जा सकता है।

एक टूल को परिभाषित करने के कई तरीके हैं। इस गाइड में, हम दो फ़ंक्शन के लिए ऐसा करने का तरीका बताएंगे:

1. एक बनावटी खोज फ़ंक्शन जो हमेशा "LangChain" स्ट्रिंग लौटाता है
2. एक गुणक फ़ंक्शन जो दो संख्याओं को गुणा करेगा

यहाँ सबसे बड़ा अंतर यह है कि पहला फ़ंक्शन केवल एक इनपुट की आवश्यकता है, जबकि दूसरे को कई इनपुट की आवश्यकता है। कई एजेंट केवल एकल इनपुट वाले फ़ंक्शन के साथ काम करते हैं, इसलिए उनके साथ काम करना जानना महत्वपूर्ण है। अधिकांश मामलों में, कस्टम टूल को परिभाषित करना समान है, लेकिन कुछ अंतर हैं।

```python
# Import things that are needed generically
from langchain.pydantic_v1 import BaseModel, Field
from langchain.tools import BaseTool, StructuredTool, tool
```

## @tool डिकोरेटर

यह `@tool` डिकोरेटर कस्टम टूल को परिभाषित करने का सबसे सरल तरीका है। डिकोरेटर डिफ़ॉल्ट रूप से फ़ंक्शन का नाम टूल का नाम के रूप में उपयोग करता है, लेकिन इसे पहले तर्क के रूप में एक स्ट्रिंग पास करके ओवरराइड किया जा सकता है। इसके अलावा, डिकोरेटर फ़ंक्शन के डॉक्स्ट्रिंग को टूल का विवरण के रूप में उपयोग करेगा - इसलिए एक डॉक्स्ट्रिंग प्रदान करना आवश्यक है।

```python
@tool
def search(query: str) -> str:
    """Look up things online."""
    return "LangChain"
```

```python
print(search.name)
print(search.description)
print(search.args)
```

```output
search
search(query: str) -> str - Look up things online.
{'query': {'title': 'Query', 'type': 'string'}}
```

```python
@tool
def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b
```

```python
print(multiply.name)
print(multiply.description)
print(multiply.args)
```

```output
multiply
multiply(a: int, b: int) -> int - Multiply two numbers.
{'a': {'title': 'A', 'type': 'integer'}, 'b': {'title': 'B', 'type': 'integer'}}
```

आप टूल नाम और JSON आर्ग्स को डिकोरेटर में पास करके भी कस्टमाइज़ कर सकते हैं।

```python
class SearchInput(BaseModel):
    query: str = Field(description="should be a search query")


@tool("search-tool", args_schema=SearchInput, return_direct=True)
def search(query: str) -> str:
    """Look up things online."""
    return "LangChain"
```

```python
print(search.name)
print(search.description)
print(search.args)
print(search.return_direct)
```

```output
search-tool
search-tool(query: str) -> str - Look up things online.
{'query': {'title': 'Query', 'description': 'should be a search query', 'type': 'string'}}
True
```

## BaseTool उपवर्ग

आप BaseTool क्लास को उपवर्गीकृत करके भी एक कस्टम टूल को स्पष्ट रूप से परिभाषित कर सकते हैं। यह टूल परिभाषा पर अधिकतम नियंत्रण प्रदान करता है, लेकिन थोड़ा अधिक काम है।

```python
from typing import Optional, Type

from langchain.callbacks.manager import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)


class SearchInput(BaseModel):
    query: str = Field(description="should be a search query")


class CalculatorInput(BaseModel):
    a: int = Field(description="first number")
    b: int = Field(description="second number")


class CustomSearchTool(BaseTool):
    name = "custom_search"
    description = "useful for when you need to answer questions about current events"
    args_schema: Type[BaseModel] = SearchInput

    def _run(
        self, query: str, run_manager: Optional[CallbackManagerForToolRun] = None
    ) -> str:
        """Use the tool."""
        return "LangChain"

    async def _arun(
        self, query: str, run_manager: Optional[AsyncCallbackManagerForToolRun] = None
    ) -> str:
        """Use the tool asynchronously."""
        raise NotImplementedError("custom_search does not support async")


class CustomCalculatorTool(BaseTool):
    name = "Calculator"
    description = "useful for when you need to answer questions about math"
    args_schema: Type[BaseModel] = CalculatorInput
    return_direct: bool = True

    def _run(
        self, a: int, b: int, run_manager: Optional[CallbackManagerForToolRun] = None
    ) -> str:
        """Use the tool."""
        return a * b

    async def _arun(
        self,
        a: int,
        b: int,
        run_manager: Optional[AsyncCallbackManagerForToolRun] = None,
    ) -> str:
        """Use the tool asynchronously."""
        raise NotImplementedError("Calculator does not support async")
```

```python
search = CustomSearchTool()
print(search.name)
print(search.description)
print(search.args)
```

```output
custom_search
useful for when you need to answer questions about current events
{'query': {'title': 'Query', 'description': 'should be a search query', 'type': 'string'}}
```

```python
multiply = CustomCalculatorTool()
print(multiply.name)
print(multiply.description)
print(multiply.args)
print(multiply.return_direct)
```

```output
Calculator
useful for when you need to answer questions about math
{'a': {'title': 'A', 'description': 'first number', 'type': 'integer'}, 'b': {'title': 'B', 'description': 'second number', 'type': 'integer'}}
True
```

## StructuredTool डेटाक्लास

आप `StructuredTool` डेटाक्लास का भी उपयोग कर सकते हैं। यह तरीका पिछले दो के बीच का मिश्रण है। यह BaseTool क्लास से अधिक सुविधाजनक है, लेकिन डिकोरेटर का उपयोग करने से अधिक कार्यक्षमता प्रदान करता है।

```python
def search_function(query: str):
    return "LangChain"


search = StructuredTool.from_function(
    func=search_function,
    name="Search",
    description="useful for when you need to answer questions about current events",
    # coroutine= ... <- you can specify an async method if desired as well
)
```

```python
print(search.name)
print(search.description)
print(search.args)
```

```output
Search
Search(query: str) - useful for when you need to answer questions about current events
{'query': {'title': 'Query', 'type': 'string'}}
```

आप इनपुट के बारे में अधिक जानकारी प्रदान करने के लिए एक कस्टम `args_schema` भी परिभाषित कर सकते हैं।

```python
class CalculatorInput(BaseModel):
    a: int = Field(description="first number")
    b: int = Field(description="second number")


def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b


calculator = StructuredTool.from_function(
    func=multiply,
    name="Calculator",
    description="multiply numbers",
    args_schema=CalculatorInput,
    return_direct=True,
    # coroutine= ... <- you can specify an async method if desired as well
)
```

```python
print(calculator.name)
print(calculator.description)
print(calculator.args)
```

```output
Calculator
Calculator(a: int, b: int) -> int - multiply numbers
{'a': {'title': 'A', 'description': 'first number', 'type': 'integer'}, 'b': {'title': 'B', 'description': 'second number', 'type': 'integer'}}
```

## टूल त्रुटियों को संभालना

जब कोई टूल एक त्रुटि का सामना करता है और अपवाद पकड़ा नहीं जाता है, तो एजेंट कार्यान्वयन रोक देगा। यदि आप चाहते हैं कि एजेंट कार्यान्वयन जारी रखे, तो आप `ToolException` उठा सकते हैं और `handle_tool_error` को तदनुसार सेट कर सकते हैं।

जब `ToolException` उठाया जाता है, तो एजेंट काम करना नहीं बंद करेगा, लेकिन टूल के `handle_tool_error` चर के अनुसार अपवाद को संभालेगा, और प्रसंस्करण परिणाम को अवलोकन के रूप में एजेंट को लौटाया जाएगा और लाल रंग में प्रिंट किया जाएगा।

आप `handle_tool_error` को `True` पर सेट कर सकते हैं, इसे एकल स्ट्रिंग मान पर सेट कर सकते हैं, या इसे एक फ़ंक्शन के रूप में सेट कर सकते हैं। यदि इसे फ़ंक्शन के रूप में सेट किया गया है, तो फ़ंक्शन को एक `ToolException` पैरामीटर के रूप में लेना चाहिए और एक `str` मान लौटाना चाहिए।

कृपया ध्यान दें कि केवल `ToolException` उठाना प्रभावी नहीं होगा। आपको पहले टूल के `handle_tool_error` को सेट करना होगा क्योंकि इसका डिफ़ॉल्ट मान `False` है।

```python
from langchain_core.tools import ToolException


def search_tool1(s: str):
    raise ToolException("The search tool1 is not available.")
```

पहले, देखते हैं कि क्या होता है अगर हम `handle_tool_error` को सेट नहीं करते - यह त्रुटि देगा।

```python
search = StructuredTool.from_function(
    func=search_tool1,
    name="Search_tool1",
    description="A bad tool",
)

search.run("test")
```

```output
---------------------------------------------------------------------------

ToolException                             Traceback (most recent call last)

Cell In[58], line 7
      1 search = StructuredTool.from_function(
      2     func=search_tool1,
      3     name="Search_tool1",
      4     description=description,
      5 )
----> 7 search.run("test")

File ~/workplace/langchain/libs/core/langchain_core/tools.py:344, in BaseTool.run(self, tool_input, verbose, start_color, color, callbacks, tags, metadata, run_name, **kwargs)
    342 if not self.handle_tool_error:
    343     run_manager.on_tool_error(e)
--> 344     raise e
    345 elif isinstance(self.handle_tool_error, bool):
    346     if e.args:

File ~/workplace/langchain/libs/core/langchain_core/tools.py:337, in BaseTool.run(self, tool_input, verbose, start_color, color, callbacks, tags, metadata, run_name, **kwargs)
    334 try:
    335     tool_args, tool_kwargs = self._to_args_and_kwargs(parsed_input)
    336     observation = (
--> 337         self._run(*tool_args, run_manager=run_manager, **tool_kwargs)
    338         if new_arg_supported
    339         else self._run(*tool_args, **tool_kwargs)
    340     )
    341 except ToolException as e:
    342     if not self.handle_tool_error:

File ~/workplace/langchain/libs/core/langchain_core/tools.py:631, in StructuredTool._run(self, run_manager, *args, **kwargs)
    622 if self.func:
    623     new_argument_supported = signature(self.func).parameters.get("callbacks")
    624     return (
    625         self.func(
    626             *args,
    627             callbacks=run_manager.get_child() if run_manager else None,
    628             **kwargs,
    629         )
    630         if new_argument_supported
--> 631         else self.func(*args, **kwargs)
    632     )
    633 raise NotImplementedError("Tool does not support sync")

Cell In[55], line 5, in search_tool1(s)
      4 def search_tool1(s: str):
----> 5     raise ToolException("The search tool1 is not available.")

ToolException: The search tool1 is not available.
```

अब, चलो `handle_tool_error` को True पर सेट करते हैं

```python
search = StructuredTool.from_function(
    func=search_tool1,
    name="Search_tool1",
    description="A bad tool",
    handle_tool_error=True,
)

search.run("test")
```

```output
'The search tool1 is not available.'
```

हम टूल त्रुटि को संभालने का कस्टम तरीका भी परिभाषित कर सकते हैं

```python
def _handle_error(error: ToolException) -> str:
    return (
        "The following errors occurred during tool execution:"
        + error.args[0]
        + "Please try another tool."
    )


search = StructuredTool.from_function(
    func=search_tool1,
    name="Search_tool1",
    description="A bad tool",
    handle_tool_error=_handle_error,
)

search.run("test")
```

```output
'The following errors occurred during tool execution:The search tool1 is not available.Please try another tool.'
```
