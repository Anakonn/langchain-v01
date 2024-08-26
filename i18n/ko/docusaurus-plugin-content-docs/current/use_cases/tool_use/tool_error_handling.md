---
translated: true
---

# 도구 오류 처리

모델을 사용하여 도구를 호출하는 것은 몇 가지 명백한 실패 모드를 가질 수 있습니다. 첫째, 모델은 파싱할 수 있는 출력을 반환해야 합니다. 둘째, 모델은 유효한 도구 인수를 반환해야 합니다.

이러한 실패 모드를 완화하기 위해 체인에 오류 처리를 구축할 수 있습니다.

## 설정

다음 패키지를 설치해야 합니다:

```python
%pip install --upgrade --quiet langchain-core langchain-openai
```

[LangSmith](/docs/langsmith/)에서 실행을 추적하려면 다음 환경 변수를 주석 해제하고 설정하세요:

```python
import getpass
import os

# os.environ["LANGCHAIN_TRACING_V2"] = "true"

# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()

```

## 체인

다음과 같은 (더미) 도구와 도구 호출 체인이 있다고 가정해 봅시다. 모델을 속이기 위해 도구를 의도적으로 복잡하게 만들 것입니다.

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm"/>

```python
# | echo: false

# | output: false

from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
```

```python
# 도구 정의

from langchain_core.tools import tool


@tool
def complex_tool(int_arg: int, float_arg: float, dict_arg: dict) -> int:
    """복잡한 도구로 복잡한 작업을 수행합니다."""
    return int_arg * float_arg
```

```python
llm_with_tools = llm.bind_tools(
    [complex_tool],
)
```

```python
# 체인 정의

chain = llm_with_tools | (lambda msg: msg.tool_calls[0]["args"]) | complex_tool
```

이 체인을 비교적 명확한 입력으로 호출하려고 할 때, 모델이 도구를 올바르게 호출하지 못하는 것을 알 수 있습니다 (`dict_arg` 인수를 잊어버립니다).

```python
chain.invoke(
    "복잡한 도구를 사용하세요. 인수는 5, 2.1, 빈 사전입니다. dict_arg를 잊지 마세요"
)
```

```output
---------------------------------------------------------------------------
ValidationError                           Traceback (most recent call last)

Cell In[12], line 1
----> 1 chain.invoke(
      2     "복잡한 도구를 사용하세요. 인수는 5, 2.1, 빈 사전입니다. dict_arg를 잊지 마세요"
      3 )

File ~/langchain/libs/core/langchain_core/runnables/base.py:2499, in RunnableSequence.invoke(self, input, config)
   2497 try:
   2498     for i, step in enumerate(self.steps):
-> 2499         input = step.invoke(
   2500             input,
   2501             # mark each step as a child run
   2502             patch_config(
   2503                 config, callbacks=run_manager.get_child(f"seq:step:{i+1}")
   2504             ),
   2505         )
   2506 # finish the root run
   2507 except BaseException as e:

File ~/langchain/libs/core/langchain_core/tools.py:241, in BaseTool.invoke(self, input, config, **kwargs)
    234 def invoke(
    235     self,
    236     input: Union[str, Dict],
    237     config: Optional[RunnableConfig] = None,
    238     **kwargs: Any,
    239 ) -> Any:
    240     config = ensure_config(config)
--> 241     return self.run(
    242         input,
    243         callbacks=config.get("callbacks"),
    244         tags=config.get("tags"),
    245         metadata=config.get("metadata"),
    246         run_name=config.get("run_name"),
    247         run_id=config.pop("run_id", None),
    248         **kwargs,
    249     )

File ~/langchain/libs/core/langchain_core/tools.py:387, in BaseTool.run(self, tool_input, verbose, start_color, color, callbacks, tags, metadata, run_name, run_id, **kwargs)
    385 except ValidationError as e:
    386     if not self.handle_validation_error:
--> 387         raise e
    388     elif isinstance(self.handle_validation_error, bool):
    389         observation = "Tool input validation error"

File ~/langchain/libs/core/langchain_core/tools.py:378, in BaseTool.run(self, tool_input, verbose, start_color, color, callbacks, tags, metadata, run_name, run_id, **kwargs)
    364 run_manager = callback_manager.on_tool_start(
    365     {"name": self.name, "description": self.description},
    366     tool_input if isinstance(tool_input, str) else str(tool_input),
   (...)
    375     **kwargs,
    376 )
    377 try:
--> 378     parsed_input = self._parse_input(tool_input)
    379     tool_args, tool_kwargs = self._to_args_and_kwargs(parsed_input)
    380     observation = (
    381         self._run(*tool_args, run_manager=run_manager, **tool_kwargs)
    382         if new_arg_supported
    383         else self._run(*tool_args, **tool_kwargs)
    384     )

File ~/langchain/libs/core/langchain_core/tools.py:283, in BaseTool._parse_input(self, tool_input)
    281 else:
    282     if input_args is not None:
--> 283         result = input_args.parse_obj(tool_input)
    284         return {
    285             k: getattr(result, k)
    286             for k, v in result.dict().items()
    287             if k in tool_input
    288         }
    289 return tool_input

File ~/langchain/.venv/lib/python3.9/site-packages/pydantic/v1/main.py:526, in BaseModel.parse_obj(cls, obj)
    524         exc = TypeError(f'{cls.__name__} expected dict not {obj.__class__.__name__}')
    525         raise ValidationError([ErrorWrapper(exc, loc=ROOT_KEY)], cls) from e
--> 526 return cls(**obj)

File ~/langchain/.venv/lib/python3.9/site-packages/pydantic/v1/main.py:341, in BaseModel.__init__(__pydantic_self__, **data)
    339 values, fields_set, validation_error = validate_model(__pydantic_self__.__class__, data)
    340 if validation_error:
--> 341     raise validation_error
    342 try:
    343     object_setattr(__pydantic_self__, '__dict__', values)

ValidationError: 1 validation error for complex_toolSchema
dict_arg
  field required (type=value_error.missing)
```

## Try/except 도구 호출

오류를 더 우아하게 처리하는 가장 간단한 방법은 도구 호출 단계를 try/except로 감싸고 오류 발생 시 도움이 되는 메시지를 반환하는 것입니다:

```python
from typing import Any

from langchain_core.runnables import Runnable, RunnableConfig


def try_except_tool(tool_args: dict, config: RunnableConfig) -> Runnable:
    try:
        complex_tool.invoke(tool_args, config=config)
    except Exception as e:
        return f"다음 인수로 도구를 호출하는 동안 오류가 발생했습니다:\n\n{tool_args}\n\n발생한 오류:\n\n{type(e)}: {e}"


chain = llm_with_tools | (lambda msg: msg.tool_calls[0]["args"]) | try_except_tool
```

```python
print(
    chain.invoke(
        "복잡한 도구를 사용하세요. 인수는 5, 2.1, 빈 사전입니다. dict_arg를 잊지 마세요"
    )
)
```

```output
다음 인수로 도구를 호출하는 동안 오류가 발생했습니다:

{'int_arg': 5, 'float_arg': 2.1}

발생한 오류:

<class 'pydantic.v1.error_wrappers.ValidationError'>: 1 validation error for complex_toolSchema
dict_arg
  field required (type=value_error.missing)
```

## 대체 모델 사용

도구 호출 오류 발생 시 더 나은 모델로 대체할 수도 있습니다. 이 경우 `gpt-3.5-turbo` 대신 `gpt-4-1106-preview`를 사용하는 동일한 체인으로 대체합니다.

```python
chain = llm_with_tools | (lambda msg: msg.tool_calls[0]["args"]) | complex_tool
better_model = ChatOpenAI(model="gpt-4-1106-preview", temperature=0).bind_tools(
    [complex_tool], tool_choice="complex_tool"
)
better_chain = better_model | (lambda msg: msg.tool_calls[0]["args"]) | complex_tool

chain_with_fallback = chain.with_fallbacks([better_chain])
chain_with_fallback.invoke(
    "복잡한 도구를 사용하세요. 인수는 5, 2.1, 빈 사전입니다. dict_arg를 잊지 마세요"
)
```

```output
10.5
```

이 체인 실행에 대한 [LangSmith 트레이스](https://smith.langchain.com/public/00e91fc2-e1a4-4b0f-a82e-e6b3119d196c/r)를 살펴보면, 예상대로 첫 번째 체인 호출이 실패하고 대체 체인이 성공하는 것을 확인할 수 있습니다.

## 예외로 재시도

한 단계 더 나아가 예외를 전달하여 체인을 자동으로 다시 실행하여 모델이 동작을 수정할 수 있도록 시도할 수 있습니다:

```python
import json
from typing import Any

from langchain_core.messages import AIMessage, HumanMessage, ToolCall, ToolMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough


class CustomToolException(Exception):
    """사용자 정의 LangChain 도구 예외."""

    def __init__(self, tool_call: ToolCall, exception: Exception) -> None:
        super().__init__()
        self.tool_call = tool_call
        self.exception = exception


def tool_custom_exception(msg: AIMessage, config: RunnableConfig) -> Runnable:
    try:
        return complex_tool.invoke(msg.tool_calls[0]["args"], config=config)
    except Exception as e:
        raise CustomToolException(msg.tool_calls[0], e)


def exception_to_messages(inputs: dict) -> dict:
    exception = inputs.pop("exception")

    # 모델이 마지막 도구 호출에서 실수한 것을 알 수 있도록 원래 입력에 역사적인 메시지를 추가합니다.
    messages = [
        AIMessage(content="", tool_calls=[exception.tool_call]),
        ToolMessage(
            tool_call_id=exception.tool_call["id"], content=str(exception.exception)
        ),
        HumanMessage(
            content="마지막 도구 호출에서 예외가 발생했습니다. 수정된 인수로 도구를 다시 호출하세요. 실수를 반복하지 마세요."
        ),
    ]
    inputs["last_output"] = messages
    return inputs


# 프롬프트에 last_output MessagesPlaceholder를 추가합니다. 이 프롬프트는 전달되지 않으면

# 프롬프트에 전혀 영향을 미치지 않지만 필요에 따라 Messages 목록을 프롬프트에 삽입할 수 있습니다.

# 재시도 시 오류 메시지를 삽입하는 데 사용됩니다.

prompt = ChatPromptTemplate.from_messages(
    [("human", "{input}"), MessagesPlaceholder("last_output", optional=True)]
)
chain = prompt | llm_with_tools | tool_custom_exception

# 초기 체인 호출이 실패하면 예외를 메시지로 전달하여 체인을 다시 실행합니다.

self_correcting_chain = chain.with_fallbacks(
    [exception_to_messages | chain], exception_key="exception"
)
```

```python
self_correcting_chain.invoke(
    {
        "input": "복잡한 도구를 사용하세요. 인수는 5, 2.1, 빈 사전입니다. dict_arg를 잊지 마세요"
    }
)
```

```output
10.5
```

그리고 체인이 성공합니다! [LangSmith 트레이스](https://smith.langchain.com/public/c11e804c-e14f-4059-bd09-64766f999c14/r)를 살펴보면, 초기 체인이 여전히 실패하고 재시도에서 체인이 성공하는 것을 확인할 수 있습니다.