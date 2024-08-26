---
sidebar_position: 1
translated: true
---

# 예제 선택기

예제가 많은 경우 프롬프트에 포함할 예제를 선택해야 할 수 있습니다. 예제 선택기 클래스는 이를 수행하는 역할을 합니다.

기본 인터페이스는 다음과 같이 정의됩니다.

```python
class BaseExampleSelector(ABC):
    """Interface for selecting examples to include in prompts."""

    @abstractmethod
    def select_examples(self, input_variables: Dict[str, str]) -> List[dict]:
        """Select which examples to use based on the inputs."""

    @abstractmethod
    def add_example(self, example: Dict[str, str]) -> Any:
        """Add new example to store."""
```

필요한 유일한 메서드는 `select_examples` 메서드입니다. 이 메서드는 입력 변수를 받아 예제 목록을 반환합니다. 어떤 예제를 선택할지는 각 구현에 따라 다릅니다.

LangChain에는 여러 가지 유형의 예제 선택기가 있습니다. 이 유형들에 대한 개요는 아래 표를 참고하세요.

이 가이드에서는 사용자 정의 예제 선택기를 만드는 방법을 살펴보겠습니다.

## 예제

예제 선택기를 사용하려면 예제 목록을 만들어야 합니다. 일반적으로 입력과 출력 예제가 포함됩니다. 이 데모 목적으로, 영어를 이탈리아어로 번역하는 예제를 생각해 보겠습니다.

```python
examples = [
    {"input": "hi", "output": "ciao"},
    {"input": "bye", "output": "arrivaderci"},
    {"input": "soccer", "output": "calcio"},
]
```

## 사용자 정의 예제 선택기

단어 길이에 따라 어떤 예제를 선택할지 결정하는 예제 선택기를 작성해 보겠습니다.

```python
from langchain_core.example_selectors.base import BaseExampleSelector


class CustomExampleSelector(BaseExampleSelector):
    def __init__(self, examples):
        self.examples = examples

    def add_example(self, example):
        self.examples.append(example)

    def select_examples(self, input_variables):
        # This assumes knowledge that part of the input will be a 'text' key
        new_word = input_variables["input"]
        new_word_length = len(new_word)

        # Initialize variables to store the best match and its length difference
        best_match = None
        smallest_diff = float("inf")

        # Iterate through each example
        for example in self.examples:
            # Calculate the length difference with the first word of the example
            current_diff = abs(len(example["input"]) - new_word_length)

            # Update the best match if the current one is closer in length
            if current_diff < smallest_diff:
                smallest_diff = current_diff
                best_match = example

        return [best_match]
```

```python
example_selector = CustomExampleSelector(examples)
```

```python
example_selector.select_examples({"input": "okay"})
```

```output
[{'input': 'bye', 'output': 'arrivaderci'}]
```

```python
example_selector.add_example({"input": "hand", "output": "mano"})
```

```python
example_selector.select_examples({"input": "okay"})
```

```output
[{'input': 'hand', 'output': 'mano'}]
```

## 프롬프트에서 사용하기

이제 이 예제 선택기를 프롬프트에서 사용할 수 있습니다.

```python
from langchain_core.prompts.few_shot import FewShotPromptTemplate
from langchain_core.prompts.prompt import PromptTemplate

example_prompt = PromptTemplate.from_template("Input: {input} -> Output: {output}")
```

```python
prompt = FewShotPromptTemplate(
    example_selector=example_selector,
    example_prompt=example_prompt,
    suffix="Input: {input} -> Output:",
    prefix="Translate the following words from English to Italain:",
    input_variables=["input"],
)

print(prompt.format(input="word"))
```

```output
Translate the following words from English to Italain:

Input: hand -> Output: mano

Input: word -> Output:
```

## 예제 선택기 유형

| 이름       | 설명                                                                                 |
|------------|---------------------------------------------------------------------------------------------|
| Similarity | 입력과 예제 간 의미적 유사성을 기반으로 선택할 예제를 결정합니다.    |
| MMR        | 입력과 예제 간 최대 한계 관련성을 기반으로 선택할 예제를 결정합니다. |
| Length     | 특정 길이 내에 포함될 수 있는 예제를 선택합니다.                          |
| Ngram      | 입력과 예제 간 n-gram 중복을 기반으로 선택할 예제를 결정합니다.          |
