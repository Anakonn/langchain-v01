---
translated: true
---

# कस्टम चैट मॉडल

इस गाइड में, हम LangChain अवधारणाओं का उपयोग करके एक कस्टम चैट मॉडल कैसे बनाएं, यह सीखेंगे।

अपने LLM को मानक `BaseChatModel` इंटरफ़ेस के साथ लपेटने से आप अपने LLM को न्यूनतम कोड परिवर्तनों के साथ मौजूदा LangChain कार्यक्रमों में उपयोग कर सकते हैं!

एक बोनस के रूप में, आपका LLM स्वचालित रूप से एक LangChain `Runnable` बन जाएगा और कुछ बेहतरीन कार्यान्वयन का लाभ उठाएगा (जैसे कि थ्रेडपूल के माध्यम से बैच, असिंक समर्थन, `astream_events` API आदि)।

## इनपुट और आउटपुट

पहले, हमें **संदेशों** के बारे में बात करनी होगी जो चैट मॉडल के इनपुट और आउटपुट हैं।

### संदेश

चैट मॉडल इनपुट के रूप में संदेशों को लेते हैं और एक संदेश के रूप में आउटपुट देते हैं।

LangChain में कुछ बिल्ट-इन संदेश प्रकार हैं:

| संदेश प्रकार          | विवरण                                                                                     |
|-----------------------|-------------------------------------------------------------------------------------------------|
| `SystemMessage`       | AI व्यवहार को प्राइम करने के लिए उपयोग किया जाता है, आमतौर पर इनपुट संदेशों की एक अनुक्रम के पहले भेजा जाता है।   |
| `HumanMessage`        | चैट मॉडल के साथ इंटरैक्ट करने वाले व्यक्ति से आने वाला संदेश को दर्शाता है।                             |
| `AIMessage`           | चैट मॉडल से आने वाले संदेश को दर्शाता है। यह या तो पाठ हो सकता है या किसी उपकरण को आमंत्रित करने का अनुरोध।|
| `FunctionMessage` / `ToolMessage` | उपकरण के आमंत्रण के परिणामों को मॉडल को वापस भेजने के लिए संदेश।               |
| `AIMessageChunk` / `HumanMessageChunk` / ... | प्रत्येक प्रकार के संदेश का स्ट्रीमिंग वेरिएंट। |

:::note
`ToolMessage` और `FunctionMessage` OpenAI के `function` और `tool` भूमिकाओं का करीब से अनुसरण करते हैं।

यह एक तेजी से विकसित क्षेत्र है और जैसे-जैसे और मॉडल कार्य कॉलिंग क्षमताएं जोड़ते हैं, इस स्कीमा में और वृद्धि होने की उम्मीद है।
:::

```python
from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    FunctionMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)
```

### स्ट्रीमिंग वेरिएंट

सभी चैट संदेशों में एक स्ट्रीमिंग वेरिएंट है जिसमें `Chunk` शब्द होता है।

```python
from langchain_core.messages import (
    AIMessageChunk,
    FunctionMessageChunk,
    HumanMessageChunk,
    SystemMessageChunk,
    ToolMessageChunk,
)
```

ये टुकड़े चैट मॉडल से आउटपुट स्ट्रीमिंग करने के लिए उपयोग किए जाते हैं, और वे सभी एक संचयी गुण को परिभाषित करते हैं!

```python
AIMessageChunk(content="Hello") + AIMessageChunk(content=" World!")
```

```output
AIMessageChunk(content='Hello World!')
```

## आधारभूत चैट मॉडल

चलो एक ऐसा चैट मॉडल लागू करते हैं जो प्रोम्प्ट में पिछले संदेश के पहले `n` वर्णों को वापस करता है!

ऐसा करने के लिए, हम `BaseChatModel` से उत्तराधिकार लेंगे और हमें निम्नलिखित को लागू करना होगा:

| विधि/गुण                    | विवरण                                                       | आवश्यक/वैकल्पिक  |
|------------------------------------|-------------------------------------------------------------------|--------------------|
| `_generate`                        | प्रोम्प्ट से एक चैट परिणाम उत्पन्न करने के लिए उपयोग किया जाता है।                       | आवश्यक           |
| `_llm_type` (गुण)             | मॉडल के प्रकार को अद्वितीय रूप से पहचानने के लिए उपयोग किया जाता है। लॉगिंग के लिए उपयोग किया जाता है।| आवश्यक           |
| `_identifying_params` (गुण)   | ट्रेसिंग उद्देश्यों के लिए मॉडल पैरामीटरीकरण को दर्शाता है।            | वैकल्पिक           |
| `_stream`                          | स्ट्रीमिंग को लागू करने के लिए उपयोग किया जाता है।                                       | वैकल्पिक           |
| `_agenerate`                       | नेटिव असिंक्रोनस विधि को लागू करने के लिए उपयोग किया जाता है।                           | वैकल्पिक           |
| `_astream`                         | `_stream` का असिंक्रोनस संस्करण लागू करने के लिए उपयोग किया जाता है।                      | वैकल्पिक           |

:::tip
`_astream` कार्यान्वयन `run_in_executor` का उपयोग करता है ताकि `_stream` को अलग थ्रेड में लॉन्च किया जा सके यदि `_stream` को लागू किया गया है, अन्यथा यह `_agenerate` का उपयोग करके फॉलबैक करता है।

आप इस युक्ति का उपयोग कर सकते हैं यदि आप `_stream` कार्यान्वयन को पुनः उपयोग करना चाहते हैं, लेकिन यदि आप नेटिव असिंक्रोनस कोड को लागू करने में सक्षम हैं तो यह एक बेहतर समाधान है क्योंकि यह कोड कम ओवरहेड के साथ चलेगा।
:::

### कार्यान्वयन

```python
from typing import Any, AsyncIterator, Dict, Iterator, List, Optional

from langchain_core.callbacks import (
    AsyncCallbackManagerForLLMRun,
    CallbackManagerForLLMRun,
)
from langchain_core.language_models import BaseChatModel, SimpleChatModel
from langchain_core.messages import AIMessageChunk, BaseMessage, HumanMessage
from langchain_core.outputs import ChatGeneration, ChatGenerationChunk, ChatResult
from langchain_core.runnables import run_in_executor


class CustomChatModelAdvanced(BaseChatModel):
    """A custom chat model that echoes the first `n` characters of the input.

    When contributing an implementation to LangChain, carefully document
    the model including the initialization parameters, include
    an example of how to initialize the model and include any relevant
    links to the underlying models documentation or API.

    Example:

        .. code-block:: python

            model = CustomChatModel(n=2)
            result = model.invoke([HumanMessage(content="hello")])
            result = model.batch([[HumanMessage(content="hello")],
                                 [HumanMessage(content="world")]])
    """

    model_name: str
    """The name of the model"""
    n: int
    """The number of characters from the last message of the prompt to be echoed."""

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> ChatResult:
        """Override the _generate method to implement the chat model logic.

        This can be a call to an API, a call to a local model, or any other
        implementation that generates a response to the input prompt.

        Args:
            messages: the prompt composed of a list of messages.
            stop: a list of strings on which the model should stop generating.
                  If generation stops due to a stop token, the stop token itself
                  SHOULD BE INCLUDED as part of the output. This is not enforced
                  across models right now, but it's a good practice to follow since
                  it makes it much easier to parse the output of the model
                  downstream and understand why generation stopped.
            run_manager: A run manager with callbacks for the LLM.
        """
        # Replace this with actual logic to generate a response from a list
        # of messages.
        last_message = messages[-1]
        tokens = last_message.content[: self.n]
        message = AIMessage(
            content=tokens,
            additional_kwargs={},  # Used to add additional payload (e.g., function calling request)
            response_metadata={  # Use for response metadata
                "time_in_seconds": 3,
            },
        )
        ##

        generation = ChatGeneration(message=message)
        return ChatResult(generations=[generation])

    def _stream(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> Iterator[ChatGenerationChunk]:
        """Stream the output of the model.

        This method should be implemented if the model can generate output
        in a streaming fashion. If the model does not support streaming,
        do not implement it. In that case streaming requests will be automatically
        handled by the _generate method.

        Args:
            messages: the prompt composed of a list of messages.
            stop: a list of strings on which the model should stop generating.
                  If generation stops due to a stop token, the stop token itself
                  SHOULD BE INCLUDED as part of the output. This is not enforced
                  across models right now, but it's a good practice to follow since
                  it makes it much easier to parse the output of the model
                  downstream and understand why generation stopped.
            run_manager: A run manager with callbacks for the LLM.
        """
        last_message = messages[-1]
        tokens = last_message.content[: self.n]

        for token in tokens:
            chunk = ChatGenerationChunk(message=AIMessageChunk(content=token))

            if run_manager:
                # This is optional in newer versions of LangChain
                # The on_llm_new_token will be called automatically
                run_manager.on_llm_new_token(token, chunk=chunk)

            yield chunk

        # Let's add some other information (e.g., response metadata)
        chunk = ChatGenerationChunk(
            message=AIMessageChunk(content="", response_metadata={"time_in_sec": 3})
        )
        if run_manager:
            # This is optional in newer versions of LangChain
            # The on_llm_new_token will be called automatically
            run_manager.on_llm_new_token(token, chunk=chunk)
        yield chunk

    @property
    def _llm_type(self) -> str:
        """Get the type of language model used by this chat model."""
        return "echoing-chat-model-advanced"

    @property
    def _identifying_params(self) -> Dict[str, Any]:
        """Return a dictionary of identifying parameters.

        This information is used by the LangChain callback system, which
        is used for tracing purposes make it possible to monitor LLMs.
        """
        return {
            # The model name allows users to specify custom token counting
            # rules in LLM monitoring applications (e.g., in LangSmith users
            # can provide per token pricing for their model and monitor
            # costs for the given LLM.)
            "model_name": self.model_name,
        }
```

### चलो इसका परीक्षण करते हैं 🧪

चैट मॉडल LangChain के मानक `Runnable` इंटरफ़ेस को लागू करेगा जिसका उपयोग LangChain के कई अवधारणाएं करती हैं!

```python
model = CustomChatModelAdvanced(n=3, model_name="my_custom_model")
```

```python
model.invoke(
    [
        HumanMessage(content="hello!"),
        AIMessage(content="Hi there human!"),
        HumanMessage(content="Meow!"),
    ]
)
```

```output
AIMessage(content='Meo', response_metadata={'time_in_seconds': 3}, id='run-ddb42bd6-4fdd-4bd2-8be5-e11b67d3ac29-0')
```

```python
model.invoke("hello")
```

```output
AIMessage(content='hel', response_metadata={'time_in_seconds': 3}, id='run-4d3cc912-44aa-454b-977b-ca02be06c12e-0')
```

```python
model.batch(["hello", "goodbye"])
```

```output
[AIMessage(content='hel', response_metadata={'time_in_seconds': 3}, id='run-9620e228-1912-4582-8aa1-176813afec49-0'),
 AIMessage(content='goo', response_metadata={'time_in_seconds': 3}, id='run-1ce8cdf8-6f75-448e-82f7-1bb4a121df93-0')]
```

```python
for chunk in model.stream("cat"):
    print(chunk.content, end="|")
```

```output
c|a|t||
```

मॉडल में `_astream` कार्यान्वयन देखें! यदि आप इसे लागू नहीं करते हैं, तो कोई आउटपुट स्ट्रीम नहीं होगा।!

```python
async for chunk in model.astream("cat"):
    print(chunk.content, end="|")
```

```output
c|a|t||
```

चलो `astream_events` API का उपयोग करने का प्रयास करते हैं जो सभी कॉलबैक को सही से लागू किए जाने की जांच करने में भी मदद करेगा!

```python
async for event in model.astream_events("cat", version="v1"):
    print(event)
```

```output
{'event': 'on_chat_model_start', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'name': 'CustomChatModelAdvanced', 'tags': [], 'metadata': {}, 'data': {'input': 'cat'}}
{'event': 'on_chat_model_stream', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'name': 'CustomChatModelAdvanced', 'data': {'chunk': AIMessageChunk(content='c', id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}
{'event': 'on_chat_model_stream', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'name': 'CustomChatModelAdvanced', 'data': {'chunk': AIMessageChunk(content='a', id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}
{'event': 'on_chat_model_stream', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'name': 'CustomChatModelAdvanced', 'data': {'chunk': AIMessageChunk(content='t', id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}
{'event': 'on_chat_model_stream', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'name': 'CustomChatModelAdvanced', 'data': {'chunk': AIMessageChunk(content='', response_metadata={'time_in_sec': 3}, id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}
{'event': 'on_chat_model_end', 'name': 'CustomChatModelAdvanced', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'data': {'output': AIMessageChunk(content='cat', response_metadata={'time_in_sec': 3}, id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}

/home/eugene/src/langchain/libs/core/langchain_core/_api/beta_decorator.py:87: LangChainBetaWarning: This API is in beta and may change in the future.
  warn_beta(
```

## योगदान

हम सभी चैट मॉडल एकीकरण योगदानों का सम्मान करते हैं।

अपने योगदान को LangChain में जोड़ा जाए, इसके लिए यह जांच-सूची आपकी मदद कर सकती है:

प्रलेखन:

* मॉडल में सभी प्रारंभिकरण तर्कों के लिए डॉक-स्ट्रिंग हैं, क्योंकि ये [APIReference](https://api.python.langchain.com/en/stable/langchain_api_reference.html) में प्रदर्शित किए जाएंगे।
* मॉडल के लिए क्लास डॉक-स्ट्रिंग में मॉडल API का लिंक है यदि मॉडल किसी सेवा द्वारा संचालित है।

परीक्षण:

* [ ] ओवरराइड की गई विधियों के लिए यूनिट या एकीकरण परीक्षण जोड़ें। `invoke`, `ainvoke`, `batch`, `stream` काम करते हैं या नहीं, यह सत्यापित करें यदि आपने संबंधित कोड को ओवरराइड किया है।

स्ट्रीमिंग (यदि आप इसे लागू कर रहे हैं):

* [ ] स्ट्रीमिंग को काम करने के लिए `_stream` विधि को लागू करें

स्टॉप टोकन व्यवहार:

* [ ] स्टॉप टोकन का सम्मान किया जाना चाहिए
* [ ] स्टॉप टोकन को प्रतिक्रिया का हिस्सा के रूप में शामिल किया जाना चाहिए

गोपनीय API कुंजी:

* [ ] यदि आपका मॉडल किसी API से जुड़ा है, तो यह अपने प्रारंभिकरण के भाग के रूप में API कुंजी को स्वीकार करेगा। गोपनीयता के लिए Pydantic के `SecretStr` प्रकार का उपयोग करें, ताकि वे जब लोग मॉडल को प्रिंट करते हैं तो गलती से प्रिंट न हो जाएं।

पहचान करने वाले पैरामीटर:

* [ ] पहचान करने वाले पैरामीटरों में `model_name` शामिल करें

अनुकूलन:

मॉडल से होने वाले ओवरहेड को कम करने के लिए नेटिव असिंक्रोनस समर्थन प्रदान करने पर विचार करें!

* [ ] `_agenerate` (जिसका उपयोग `ainvoke` द्वारा किया जाता है) का नेटिव असिंक्रोनस प्रदान किया
* [ ] `_astream` (जिसका उपयोग `astream` द्वारा किया जाता है) का नेटिव असिंक्रोनस प्रदान किया
