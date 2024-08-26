---
translated: true
---

# कस्टम LLM

यह नोटबुक बताता है कि कैसे एक कस्टम LLM रैपर बनाया जाए, अगर आप अपना खुद का LLM या LangChain में समर्थित एक अलग रैपर का उपयोग करना चाहते हैं।

अपने LLM को मानक `LLM` इंटरफ़ेस के साथ लपेटना आपको LangChain कार्यक्रमों में अपने LLM का न्यूनतम कोड परिवर्तनों के साथ उपयोग करने देता है!

एक बोनस के रूप में, आपका LLM स्वचालित रूप से एक LangChain `Runnable` बन जाएगा और कुछ आधारभूत बेहतरीकरणों, असिंक्रोनस समर्थन, `astream_events` API आदि का लाभ उठाएगा।

## कार्यान्वयन

एक कस्टम LLM को केवल दो आवश्यक चीजें लागू करनी होती हैं:

| विधि        | विवरण                                                               |
|---------------|---------------------------------------------------------------------------|
| `_call`       | एक स्ट्रिंग और कुछ वैकल्पिक रोक शब्दों को लेता है, और एक स्ट्रिंग लौटाता है। `invoke` द्वारा उपयोग किया जाता है। |
| `_llm_type`   | एक गुण जो एक स्ट्रिंग लौटाता है, केवल लॉगिंग उद्देश्यों के लिए उपयोग किया जाता है।

वैकल्पिक कार्यान्वयन:

| विधि    | विवरण                                                                                               |
|----------------------|-----------------------------------------------------------------------------------------------------------|
| `_identifying_params` | मॉडल की पहचान और LLM प्रिंट करने में मदद करने के लिए उपयोग किया जाता है; एक डिक्शनरी लौटाना चाहिए। यह एक **@property** है।                 |
| `_acall`              | `_call` का एक असिंक्रोनस नेटिव कार्यान्वयन प्रदान करता है, `ainvoke` द्वारा उपयोग किया जाता है।                                    |
| `_stream`             | आउटपुट को टोकन-दर-टोकन स्ट्रीम करने के लिए विधि।                                                               |
| `_astream`            | `_stream` का एक असिंक्रोनस नेटिव कार्यान्वयन प्रदान करता है; नए LangChain संस्करणों में, `_stream` पर डिफ़ॉल्ट होता है। |

चलो एक सरल कस्टम LLM को लागू करते हैं जो केवल इनपुट के पहले n वर्णों को लौटाता है।

```python
from typing import Any, Dict, Iterator, List, Mapping, Optional

from langchain_core.callbacks.manager import CallbackManagerForLLMRun
from langchain_core.language_models.llms import LLM
from langchain_core.outputs import GenerationChunk


class CustomLLM(LLM):
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

    n: int
    """The number of characters from the last message of the prompt to be echoed."""

    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> str:
        """Run the LLM on the given input.

        Override this method to implement the LLM logic.

        Args:
            prompt: The prompt to generate from.
            stop: Stop words to use when generating. Model output is cut off at the
                first occurrence of any of the stop substrings.
                If stop tokens are not supported consider raising NotImplementedError.
            run_manager: Callback manager for the run.
            **kwargs: Arbitrary additional keyword arguments. These are usually passed
                to the model provider API call.

        Returns:
            The model output as a string. Actual completions SHOULD NOT include the prompt.
        """
        if stop is not None:
            raise ValueError("stop kwargs are not permitted.")
        return prompt[: self.n]

    def _stream(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> Iterator[GenerationChunk]:
        """Stream the LLM on the given prompt.

        This method should be overridden by subclasses that support streaming.

        If not implemented, the default behavior of calls to stream will be to
        fallback to the non-streaming version of the model and return
        the output as a single chunk.

        Args:
            prompt: The prompt to generate from.
            stop: Stop words to use when generating. Model output is cut off at the
                first occurrence of any of these substrings.
            run_manager: Callback manager for the run.
            **kwargs: Arbitrary additional keyword arguments. These are usually passed
                to the model provider API call.

        Returns:
            An iterator of GenerationChunks.
        """
        for char in prompt[: self.n]:
            chunk = GenerationChunk(text=char)
            if run_manager:
                run_manager.on_llm_new_token(chunk.text, chunk=chunk)

            yield chunk

    @property
    def _identifying_params(self) -> Dict[str, Any]:
        """Return a dictionary of identifying parameters."""
        return {
            # The model name allows users to specify custom token counting
            # rules in LLM monitoring applications (e.g., in LangSmith users
            # can provide per token pricing for their model and monitor
            # costs for the given LLM.)
            "model_name": "CustomChatModel",
        }

    @property
    def _llm_type(self) -> str:
        """Get the type of language model used by this chat model. Used for logging purposes only."""
        return "custom"
```

### चलो इसका परीक्षण करते हैं 🧪

यह LLM LangChain के मानक `Runnable` इंटरफ़ेस को लागू करेगा जिसका कई LangChain अमूर्त समर्थन करते हैं!

```python
llm = CustomLLM(n=5)
print(llm)
```

```output
[1mCustomLLM[0m
Params: {'model_name': 'CustomChatModel'}
```

```python
llm.invoke("This is a foobar thing")
```

```output
'This '
```

```python
await llm.ainvoke("world")
```

```output
'world'
```

```python
llm.batch(["woof woof woof", "meow meow meow"])
```

```output
['woof ', 'meow ']
```

```python
await llm.abatch(["woof woof woof", "meow meow meow"])
```

```output
['woof ', 'meow ']
```

```python
async for token in llm.astream("hello"):
    print(token, end="|", flush=True)
```

```output
h|e|l|l|o|
```

चलो यह सुनिश्चित करते हैं कि यह अन्य `LangChain` API के साथ अच्छी तरह से एकीकृत है।

```python
from langchain_core.prompts import ChatPromptTemplate
```

```python
prompt = ChatPromptTemplate.from_messages(
    [("system", "you are a bot"), ("human", "{input}")]
)
```

```python
llm = CustomLLM(n=7)
chain = prompt | llm
```

```python
idx = 0
async for event in chain.astream_events({"input": "hello there!"}, version="v1"):
    print(event)
    idx += 1
    if idx > 7:
        # Truncate
        break
```

```output
{'event': 'on_chain_start', 'run_id': '05f24b4f-7ea3-4fb6-8417-3aa21633462f', 'name': 'RunnableSequence', 'tags': [], 'metadata': {}, 'data': {'input': {'input': 'hello there!'}}}
{'event': 'on_prompt_start', 'name': 'ChatPromptTemplate', 'run_id': '7e996251-a926-4344-809e-c425a9846d21', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'input': {'input': 'hello there!'}}}
{'event': 'on_prompt_end', 'name': 'ChatPromptTemplate', 'run_id': '7e996251-a926-4344-809e-c425a9846d21', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'input': {'input': 'hello there!'}, 'output': ChatPromptValue(messages=[SystemMessage(content='you are a bot'), HumanMessage(content='hello there!')])}}
{'event': 'on_llm_start', 'name': 'CustomLLM', 'run_id': 'a8766beb-10f4-41de-8750-3ea7cf0ca7e2', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'input': {'prompts': ['System: you are a bot\nHuman: hello there!']}}}
{'event': 'on_llm_stream', 'name': 'CustomLLM', 'run_id': 'a8766beb-10f4-41de-8750-3ea7cf0ca7e2', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': 'S'}}
{'event': 'on_chain_stream', 'run_id': '05f24b4f-7ea3-4fb6-8417-3aa21633462f', 'tags': [], 'metadata': {}, 'name': 'RunnableSequence', 'data': {'chunk': 'S'}}
{'event': 'on_llm_stream', 'name': 'CustomLLM', 'run_id': 'a8766beb-10f4-41de-8750-3ea7cf0ca7e2', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': 'y'}}
{'event': 'on_chain_stream', 'run_id': '05f24b4f-7ea3-4fb6-8417-3aa21633462f', 'tags': [], 'metadata': {}, 'name': 'RunnableSequence', 'data': {'chunk': 'y'}}
```

## योगदान

हम सभी चैट मॉडल एकीकरण योगदानों की सराहना करते हैं।

यह जांचसूची आपके योगदान को LangChain में जोड़ने में मदद करने के लिए है:

प्रलेखन:

* मॉडल में सभी प्रारंभीकरण तर्कों के लिए डॉक-स्ट्रिंग हैं, क्योंकि ये [APIReference](https://api.python.langchain.com/en/stable/langchain_api_reference.html) में प्रदर्शित होंगी।
* मॉडल के लिए वर्ग डॉक-स्ट्रिंग में मॉडल API का लिंक है यदि मॉडल एक सेवा द्वारा संचालित है।

परीक्षण:

* [ ] ओवरराइड किए गए विधियों के लिए इकाई या एकीकरण परीक्षण जोड़ें। `invoke`, `ainvoke`, `batch`, `stream` काम करते हैं कि नहीं, यह सत्यापित करें।

स्ट्रीमिंग (यदि आप इसे लागू कर रहे हैं):

* [ ] `on_llm_new_token` कॉलबैक को कॉल करना सुनिश्चित करें
* [ ] `on_llm_new_token` को चंक को यील्ड करने से पहले कॉल किया जाता है

रोक टोकन व्यवहार:

* [ ] रोक टोकन का सम्मान किया जाना चाहिए
* [ ] रोक टोकन को प्रतिक्रिया का हिस्सा के रूप में शामिल किया जाना चाहिए

गुप्त API कुंजियां:

* [ ] यदि आपका मॉडल एक API से जुड़ा है तो यह अपने प्रारंभीकरण के भाग के रूप में API कुंजियों को स्वीकार करेगा। गुप्त चीजों के लिए Pydantic के `SecretStr` प्रकार का उपयोग करें, ताकि वे मॉडल को प्रिंट करते समय गलती से प्रिंट न हो जाएं।
