---
translated: true
---

# 재시도 파서

일부 경우에는 출력만 보고도 구문 분석 오류를 수정할 수 있지만, 다른 경우에는 그렇지 않습니다. 이는 출력이 단순히 잘못된 형식이 아니라 부분적으로 완성되어 있는 경우에 해당합니다. 아래 예를 살펴보겠습니다.

```python
from langchain.output_parsers import (
    OutputFixingParser,
    PydanticOutputParser,
)
from langchain_core.prompts import (
    PromptTemplate,
)
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI, OpenAI
```

```python
template = """Based on the user question, provide an Action and Action Input for what step should be taken.
{format_instructions}
Question: {query}
Response:"""


class Action(BaseModel):
    action: str = Field(description="action to take")
    action_input: str = Field(description="input to the action")


parser = PydanticOutputParser(pydantic_object=Action)
```

```python
prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)
```

```python
prompt_value = prompt.format_prompt(query="who is leo di caprios gf?")
```

```python
bad_response = '{"action": "search"}'
```

이 응답을 그대로 구문 분석하려고 하면 오류가 발생합니다:

```python
parser.parse(bad_response)
```

```output
---------------------------------------------------------------------------

ValidationError                           Traceback (most recent call last)

File ~/workplace/langchain/libs/langchain/langchain/output_parsers/pydantic.py:30, in PydanticOutputParser.parse(self, text)
     29     json_object = json.loads(json_str, strict=False)
---> 30     return self.pydantic_object.parse_obj(json_object)
     32 except (json.JSONDecodeError, ValidationError) as e:

File ~/.pyenv/versions/3.10.1/envs/langchain/lib/python3.10/site-packages/pydantic/main.py:526, in pydantic.main.BaseModel.parse_obj()

File ~/.pyenv/versions/3.10.1/envs/langchain/lib/python3.10/site-packages/pydantic/main.py:341, in pydantic.main.BaseModel.__init__()

ValidationError: 1 validation error for Action
action_input
  field required (type=value_error.missing)


During handling of the above exception, another exception occurred:

OutputParserException                     Traceback (most recent call last)

Cell In[6], line 1
----> 1 parser.parse(bad_response)

File ~/workplace/langchain/libs/langchain/langchain/output_parsers/pydantic.py:35, in PydanticOutputParser.parse(self, text)
     33 name = self.pydantic_object.__name__
     34 msg = f"Failed to parse {name} from completion {text}. Got: {e}"
---> 35 raise OutputParserException(msg, llm_output=text)

OutputParserException: Failed to parse Action from completion {"action": "search"}. Got: 1 validation error for Action
action_input
  field required (type=value_error.missing)
```

`OutputFixingParser`를 사용하여 이 오류를 수정하려고 하면 혼란스러워 할 것입니다 - 즉, 실제로 어떤 작업 입력을 넣어야 할지 모르겠습니다.

```python
fix_parser = OutputFixingParser.from_llm(parser=parser, llm=ChatOpenAI())
```

```python
fix_parser.parse(bad_response)
```

```output
Action(action='search', action_input='input')
```

대신, `RetryOutputParser`를 사용할 수 있습니다. 이 파서는 프롬프트(그리고 원래 출력)를 전달하여 더 나은 응답을 얻기 위해 다시 시도합니다.

```python
from langchain.output_parsers import RetryOutputParser
```

```python
retry_parser = RetryOutputParser.from_llm(parser=parser, llm=OpenAI(temperature=0))
```

```python
retry_parser.parse_with_prompt(bad_response, prompt_value)
```

```output
Action(action='search', action_input='leo di caprio girlfriend')
```

또한 사용자 정의 체인에 `RetryOutputParser`를 쉽게 추가하여 원시 LLM/ChatModel 출력을 더 작업하기 쉬운 형식으로 변환할 수 있습니다.

```python
from langchain_core.runnables import RunnableLambda, RunnableParallel

completion_chain = prompt | OpenAI(temperature=0)

main_chain = RunnableParallel(
    completion=completion_chain, prompt_value=prompt
) | RunnableLambda(lambda x: retry_parser.parse_with_prompt(**x))


main_chain.invoke({"query": "who is leo di caprios gf?"})
```

```output
Action(action='search', action_input='leo di caprio girlfriend')
```

[RetryOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain.output_parsers.retry.RetryOutputParser.html#langchain.output_parsers.retry.RetryOutputParser)의 API 문서를 확인하세요.
