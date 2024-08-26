---
sidebar_position: 2
translated: true
---

# 채팅 모델을 위한 Few-shot 예제

이 노트북은 채팅 모델에서 few-shot 예제를 사용하는 방법을 다룹니다. few-shot 프롬프팅을 가장 잘 수행하는 방법에 대한 확고한 합의는 없어 보이며, 최적의 프롬프트 컴파일은 모델에 따라 다를 것 같습니다. 따라서 우리는 [FewShotChatMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.few_shot.FewShotChatMessagePromptTemplate.html?highlight=fewshot#langchain_core.prompts.few_shot.FewShotChatMessagePromptTemplate)과 같은 few-shot 프롬프트 템플릿을 유연한 시작점으로 제공하며, 필요에 따라 이를 수정하거나 대체할 수 있습니다.

few-shot 프롬프트 템플릿의 목표는 입력에 따라 동적으로 예제를 선택하고 최종 프롬프트에서 예제를 형식화하여 모델에 제공하는 것입니다.

**참고:** 다음 코드 예제는 채팅 모델용입니다. 완성 모델(LLM)을 위한 유사한 few-shot 프롬프트 예제는 [few-shot 프롬프트 템플릿](/docs/modules/model_io/prompts/few_shot_examples/) 가이드를 참조하세요.

### 고정 예제

가장 기본적이며 일반적인 few-shot 프롬프팅 기술은 고정 프롬프트 예제를 사용하는 것입니다. 이 방법을 사용하면 체인을 선택하고 평가할 수 있으며 프로덕션에서 추가적인 가변 요소를 걱정할 필요가 없습니다.

템플릿의 기본 구성 요소는 다음과 같습니다:
- `examples`: 최종 프롬프트에 포함할 사전 예제 목록입니다.
- `example_prompt`: 각 예제를 1개 이상의 메시지로 변환합니다. [`format_messages`](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html?highlight=format_messages#langchain_core.prompts.chat.ChatPromptTemplate.format_messages) 메서드를 사용합니다. 일반적인 예로는 각 예제를 하나의 사용자 메시지와 하나의 AI 메시지 응답으로 변환하거나, 사용자 메시지 다음에 함수 호출 메시지를 추가하는 것 등이 있습니다.

아래는 간단한 데모입니다. 먼저 이 예제에 필요한 모듈을 가져옵니다:

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotChatMessagePromptTemplate,
)
```

그런 다음 포함하고 싶은 예제를 정의합니다.

```python
examples = [
    {"input": "2+2", "output": "4"},
    {"input": "2+3", "output": "5"},
]
```

다음으로 few-shot 프롬프트 템플릿을 조립합니다.

```python
# This is a prompt template used to format each individual example.
example_prompt = ChatPromptTemplate.from_messages(
    [
        ("human", "{input}"),
        ("ai", "{output}"),
    ]
)
few_shot_prompt = FewShotChatMessagePromptTemplate(
    example_prompt=example_prompt,
    examples=examples,
)

print(few_shot_prompt.format())
```

```output
Human: 2+2
AI: 4
Human: 2+3
AI: 5
```

마지막으로 최종 프롬프트를 조립하고 모델에 사용합니다.

```python
final_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a wondrous wizard of math."),
        few_shot_prompt,
        ("human", "{input}"),
    ]
)
```

```python
from langchain_community.chat_models import ChatAnthropic

chain = final_prompt | ChatAnthropic(temperature=0.0)

chain.invoke({"input": "What's the square of a triangle?"})
```

```output
AIMessage(content=' Triangles do not have a "square". A square refers to a shape with 4 equal sides and 4 right angles. Triangles have 3 sides and 3 angles.\n\nThe area of a triangle can be calculated using the formula:\n\nA = 1/2 * b * h\n\nWhere:\n\nA is the area \nb is the base (the length of one of the sides)\nh is the height (the length from the base to the opposite vertex)\n\nSo the area depends on the specific dimensions of the triangle. There is no single "square of a triangle". The area can vary greatly depending on the base and height measurements.', additional_kwargs={}, example=False)
```

## 동적 few-shot 프롬프팅

때로는 입력에 따라 표시되는 예제를 조건화하고 싶을 수 있습니다. 이를 위해 `examples`를 `example_selector`로 대체할 수 있습니다. 다른 구성 요소는 위와 동일합니다! 요약하면, 동적 few-shot 프롬프트 템플릿은 다음과 같습니다:

- `example_selector`: 주어진 입력에 대해 few-shot 예제(및 반환 순서)를 선택하는 역할을 합니다. 이들은 [BaseExampleSelector](https://api.python.langchain.com/en/latest/example_selectors/langchain_core.example_selectors.base.BaseExampleSelector.html?highlight=baseexampleselector#langchain_core.example_selectors.base.BaseExampleSelector) 인터페이스를 구현합니다. 일반적인 예로는 벡터 저장소 기반의 [SemanticSimilarityExampleSelector](https://api.python.langchain.com/en/latest/example_selectors/langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector.html?highlight=semanticsimilarityexampleselector#langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector)가 있습니다.
- `example_prompt`: 각 예제를 1개 이상의 메시지로 변환합니다. [`format_messages`](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html?highlight=chatprompttemplate#langchain_core.prompts.chat.ChatPromptTemplate.format_messages) 메서드를 사용합니다. 일반적인 예로는 각 예제를 하나의 사용자 메시지와 하나의 AI 메시지 응답으로 변환하거나, 사용자 메시지 다음에 함수 호출 메시지를 추가하는 것 등이 있습니다.

이러한 구성 요소는 다른 메시지 및 채팅 템플릿과 결합하여 최종 프롬프트를 조립할 수 있습니다.

```python
from langchain_chroma import Chroma
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain_openai import OpenAIEmbeddings
```

예제 선택을 위해 벡터 저장소를 사용하므로 먼저 저장소를 채워야 합니다.

```python
examples = [
    {"input": "2+2", "output": "4"},
    {"input": "2+3", "output": "5"},
    {"input": "2+4", "output": "6"},
    {"input": "What did the cow say to the moon?", "output": "nothing at all"},
    {
        "input": "Write me a poem about the moon",
        "output": "One for the moon, and one for me, who are we to talk about the moon?",
    },
]

to_vectorize = [" ".join(example.values()) for example in examples]
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_texts(to_vectorize, embeddings, metadatas=examples)
```

#### `example_selector` 생성

벡터 저장소를 생성했으면 `example_selector`를 생성할 수 있습니다. 여기서는 상위 2개의 예제만 가져오도록 지시할 것입니다.

```python
example_selector = SemanticSimilarityExampleSelector(
    vectorstore=vectorstore,
    k=2,
)

# The prompt template will load examples by passing the input do the `select_examples` method
example_selector.select_examples({"input": "horse"})
```

```output
[{'input': 'What did the cow say to the moon?', 'output': 'nothing at all'},
 {'input': '2+4', 'output': '6'}]
```

#### 프롬프트 템플릿 생성

위에서 생성한 `example_selector`를 사용하여 프롬프트 템플릿을 조립합니다.

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotChatMessagePromptTemplate,
)

# Define the few-shot prompt.
few_shot_prompt = FewShotChatMessagePromptTemplate(
    # The input variables select the values to pass to the example_selector
    input_variables=["input"],
    example_selector=example_selector,
    # Define how each example will be formatted.
    # In this case, each example will become 2 messages:
    # 1 human, and 1 AI
    example_prompt=ChatPromptTemplate.from_messages(
        [("human", "{input}"), ("ai", "{output}")]
    ),
)
```

아래는 이를 조립하는 예입니다.

```python
print(few_shot_prompt.format(input="What's 3+3?"))
```

```output
Human: 2+3
AI: 5
Human: 2+2
AI: 4
```

최종 프롬프트 템플릿을 조립합니다:

```python
final_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a wondrous wizard of math."),
        few_shot_prompt,
        ("human", "{input}"),
    ]
)
```

```python
print(few_shot_prompt.format(input="What's 3+3?"))
```

```output
Human: 2+3
AI: 5
Human: 2+2
AI: 4
```

#### LLM에 사용

이제 모델을 few-shot 프롬프트에 연결할 수 있습니다.

```python
from langchain_community.chat_models import ChatAnthropic

chain = final_prompt | ChatAnthropic(temperature=0.0)

chain.invoke({"input": "What's 3+3?"})
```

```output
AIMessage(content=' 3 + 3 = 6', additional_kwargs={}, example=False)
```
