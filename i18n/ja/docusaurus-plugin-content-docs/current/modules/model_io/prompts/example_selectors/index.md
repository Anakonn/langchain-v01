---
sidebar_position: 1
translated: true
---

# 例のセレクター

例が多数ある場合は、プロンプトに含める例を選択する必要があります。 Example Selectorクラスはそれを行う責任があります。

基本インターフェースは以下のように定義されています:

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

必要なメソッドは `select_examples` メソッドのみです。これは入力変数を受け取り、例のリストを返します。具体的な実装方法は各実装に委ねられています。

LangChainには、いくつかの異なるタイプのExample Selectorがあります。これらのタイプの概要については、以下の表をご覧ください。

このガイドでは、カスタムExample Selectorの作成について説明します。

## 例

Example Selectorを使用するには、例のリストを作成する必要があります。これらは一般的に入力と出力の例です。デモの目的として、英語からイタリア語への翻訳の例を考えましょう。

```python
examples = [
    {"input": "hi", "output": "ciao"},
    {"input": "bye", "output": "arrivaderci"},
    {"input": "soccer", "output": "calcio"},
]
```

## カスタムExample Selector

単語の長さに基づいて例を選択するExample Selectorを書いてみましょう。

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

## プロンプトでの使用

このExample Selectorをプロンプトで使用することができます。

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

## Example Selectorのタイプ

| 名称       | 説明                                                                                 |
|------------|---------------------------------------------------------------------------------------------|
| Similarity | 入力と例の意味的類似性に基づいて、どの例を選択するかを決定します。    |
| MMR        | 入力と例の最大限の関連性に基づいて、どの例を選択するかを決定します。 |
| Length     | 特定の長さ内に収まる例を選択します。                          |
| Ngram      | 入力と例のn-gram重複に基づいて、どの例を選択するかを決定します。          |
