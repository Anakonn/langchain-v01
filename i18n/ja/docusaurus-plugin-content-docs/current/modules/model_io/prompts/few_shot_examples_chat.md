---
sidebar_position: 2
translated: true
---

# チャットモデルのためのフューショットの例

このノートブックでは、チャットモデルでフューショットの例を使う方法について説明します。フューショットのプロンプティングを最適に行う方法については、明確なコンセンサスはないようです。最適なプロンプトの組み立て方は、モデルによって異なる可能性があります。そのため、[FewShotChatMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.few_shot.FewShotChatMessagePromptTemplate.html?highlight=fewshot#langchain_core.prompts.few_shot.FewShotChatMessagePromptTemplate)のようなフューショットのプロンプトテンプレートを柔軟な出発点として提供し、必要に応じて修正したり置き換えたりできるようにしています。

フューショットのプロンプトテンプレートの目的は、入力に基づいて動的に例を選択し、最終的なプロンプトにその例を整形して提供することです。

**注意:** 以下のコードの例はチャットモデル用です。完成モデル(LLM)のためのフューショットのプロンプトの例については、[フューショットのプロンプトテンプレートガイド](/docs/modules/model_io/prompts/few_shot_examples/)を参照してください。

### 固定された例

最も基本的な(そして一般的な)フューショットのプロンプティング手法は、固定されたプロンプトの例を使うことです。これにより、チェーンを選択し、評価することができ、本番環境での追加の可動部品を気にする必要がありません。

テンプレートの基本的な構成要素は以下のとおりです:
- `examples`: 最終的なプロンプトに含める辞書形式の例のリスト。
- `example_prompt`: 各例を1つ以上のメッセージに変換する [`format_messages`](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html?highlight=format_messages#langchain_core.prompts.chat.ChatPromptTemplate.format_messages)メソッドを持つ。一般的な例としては、各例を1つの人間のメッセージと1つのAIの応答メッセージ、または1つの人間のメッセージに続く関数呼び出しメッセージに変換することが考えられます。

以下に簡単な実演を示します。まず、この例のためのモジュールをインポートします。

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotChatMessagePromptTemplate,
)
```

次に、含めたい例を定義します。

```python
examples = [
    {"input": "2+2", "output": "4"},
    {"input": "2+3", "output": "5"},
]
```

次に、それらを少数の例プロンプトテンプレートにまとめます。

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

最後に、最終的なプロンプトを組み立て、モデルで使用します。

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

## 動的なフューショットのプロンプティング

時には、入力に応じて表示する例を条件付けたい場合があります。そのためには、`examples`を`example_selector`に置き換えることができます。他の構成要素は上記と同じままです! 復習すると、動的なフューショットのプロンプトテンプレートは以下のようになります:

- `example_selector`: 与えられた入力に対して、フューショットの例(およびそれらが返される順序)を選択する責任を負います。これらは[BaseExampleSelector](https://api.python.langchain.com/en/latest/example_selectors/langchain_core.example_selectors.base.BaseExampleSelector.html?highlight=baseexampleselector#langchain_core.example_selectors.base.BaseExampleSelector)インターフェースを実装しています。一般的な例としては、ベクトルストア対応の[SemanticSimilarityExampleSelector](https://api.python.langchain.com/en/latest/example_selectors/langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector.html?highlight=semanticsimilarityexampleselector#langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector)があります。
- `example_prompt`: 各例を1つ以上のメッセージに変換する [`format_messages`](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html?highlight=chatprompttemplate#langchain_core.prompts.chat.ChatPromptTemplate.format_messages)メソッドを持つ。一般的な例としては、各例を1つの人間のメッセージと1つのAIの応答メッセージ、または1つの人間のメッセージに続く関数呼び出しメッセージに変換することが考えられます。

これらは、他のメッセージやチャットテンプレートと組み合わせて、最終的なプロンプトを組み立てることができます。

```python
from langchain_chroma import Chroma
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain_openai import OpenAIEmbeddings
```

ベクトルストアを使ってセマンティック類似性に基づいて例を選択するので、まずストアを埋める必要があります。

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

#### `example_selector`の作成

ベクトルストアを作成したら、`example_selector`を作成できます。ここでは、上位2つの例のみを取得するよう指示します。

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

#### プロンプトテンプレートの作成

上で作成した`example_selector`を使って、プロンプトテンプレートを組み立てます。

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

以下は、これがどのように組み立てられるかの例です。

```python
print(few_shot_prompt.format(input="What's 3+3?"))
```

```output
Human: 2+3
AI: 5
Human: 2+2
AI: 4
```

最終的なプロンプトテンプレートを組み立てます:

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

#### LLMで使用する

次に、モデルをフューショットのプロンプトに接続できます。

```python
from langchain_community.chat_models import ChatAnthropic

chain = final_prompt | ChatAnthropic(temperature=0.0)

chain.invoke({"input": "What's 3+3?"})
```

```output
AIMessage(content=' 3 + 3 = 6', additional_kwargs={}, example=False)
```
