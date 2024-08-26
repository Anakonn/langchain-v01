---
sidebar_position: 5
translated: true
---

# 구성

LangChain은 프롬프트의 다양한 부분을 조합하는 사용자 친화적인 인터페이스를 제공합니다. 문자열 프롬프트 또는 채팅 프롬프트로 작업할 수 있습니다. 이런 방식으로 프롬프트를 구성하면 구성 요소를 쉽게 재사용할 수 있습니다.

## 문자열 프롬프트 구성

문자열 프롬프트를 사용할 때는 각 템플릿이 연결됩니다. 프롬프트 자체 또는 문자열(목록의 첫 번째 요소는 프롬프트여야 함)로 작업할 수 있습니다.

```python
from langchain_core.prompts import PromptTemplate
```

```python
prompt = (
    PromptTemplate.from_template("Tell me a joke about {topic}")
    + ", make it funny"
    + "\n\nand in {language}"
)
```

```python
prompt
```

```output
PromptTemplate(input_variables=['language', 'topic'], template='Tell me a joke about {topic}, make it funny\n\nand in {language}')
```

```python
prompt.format(topic="sports", language="spanish")
```

```output
'Tell me a joke about sports, make it funny\n\nand in spanish'
```

LLMChain에서도 사용할 수 있습니다.

```python
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI
```

```python
model = ChatOpenAI()
```

```python
chain = LLMChain(llm=model, prompt=prompt)
```

```python
chain.run(topic="sports", language="spanish")
```

```output
'¿Por qué el futbolista llevaba un paraguas al partido?\n\nPorque pronosticaban lluvia de goles.'
```

## 채팅 프롬프트 구성

채팅 프롬프트는 메시지 목록으로 구성됩니다. 개발자 경험을 위해 이러한 프롬프트를 만드는 편리한 방법을 추가했습니다. 이 파이프라인에서 각 새 요소는 최종 프롬프트의 새 메시지입니다.

```python
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
```

먼저 시스템 메시지로 기본 ChatPromptTemplate을 초기화합시다. 시스템으로 시작할 필요는 없지만 좋은 관행입니다.

```python
prompt = SystemMessage(content="You are a nice pirate")
```

다른 메시지 *또는* 메시지 템플릿과 결합하여 파이프라인을 쉽게 만들 수 있습니다.
변수가 없는 경우 `Message`를, 변수가 있는 경우 `MessageTemplate`를 사용하세요. 문자열만 사용할 수도 있습니다(참고: 이는 자동으로 HumanMessagePromptTemplate로 추론됩니다).

```python
new_prompt = (
    prompt + HumanMessage(content="hi") + AIMessage(content="what?") + "{input}"
)
```

내부적으로 이는 ChatPromptTemplate 클래스의 인스턴스를 생성하므로 이전과 같이 사용할 수 있습니다!

```python
new_prompt.format_messages(input="i said hi")
```

```output
[SystemMessage(content='You are a nice pirate', additional_kwargs={}),
 HumanMessage(content='hi', additional_kwargs={}, example=False),
 AIMessage(content='what?', additional_kwargs={}, example=False),
 HumanMessage(content='i said hi', additional_kwargs={}, example=False)]
```

LLMChain에서도 사용할 수 있습니다.

```python
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI
```

```python
model = ChatOpenAI()
```

```python
chain = LLMChain(llm=model, prompt=new_prompt)
```

```python
chain.run("i said hi")
```

```output
'Oh, hello! How can I assist you today?'
```

## PipelinePrompt 사용

LangChain에는 [PipelinePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.pipeline.PipelinePromptTemplate.html)이라는 추상화가 포함되어 있으며, 프롬프트의 일부를 재사용하려는 경우 유용할 수 있습니다. PipelinePrompt에는 두 가지 주요 부분이 있습니다:

- 최종 프롬프트: 반환되는 최종 프롬프트
- 파이프라인 프롬프트: 문자열 이름과 프롬프트 템플릿으로 구성된 튜플 목록. 각 프롬프트 템플릿은 형식화되어 향후 프롬프트 템플릿의 변수로 전달됩니다.

```python
from langchain_core.prompts.pipeline import PipelinePromptTemplate
from langchain_core.prompts.prompt import PromptTemplate
```

```python
full_template = """{introduction}

{example}

{start}"""
full_prompt = PromptTemplate.from_template(full_template)
```

```python
introduction_template = """You are impersonating {person}."""
introduction_prompt = PromptTemplate.from_template(introduction_template)
```

```python
example_template = """Here's an example of an interaction:

Q: {example_q}
A: {example_a}"""
example_prompt = PromptTemplate.from_template(example_template)
```

```python
start_template = """Now, do this for real!

Q: {input}
A:"""
start_prompt = PromptTemplate.from_template(start_template)
```

```python
input_prompts = [
    ("introduction", introduction_prompt),
    ("example", example_prompt),
    ("start", start_prompt),
]
pipeline_prompt = PipelinePromptTemplate(
    final_prompt=full_prompt, pipeline_prompts=input_prompts
)
```

```python
pipeline_prompt.input_variables
```

```output
['example_q', 'person', 'input', 'example_a']
```

```python
print(
    pipeline_prompt.format(
        person="Elon Musk",
        example_q="What's your favorite car?",
        example_a="Tesla",
        input="What's your favorite social media site?",
    )
)
```

```output
You are impersonating Elon Musk.

Here's an example of an interaction:

Q: What's your favorite car?
A: Tesla

Now, do this for real!

Q: What's your favorite social media site?
A:
```
