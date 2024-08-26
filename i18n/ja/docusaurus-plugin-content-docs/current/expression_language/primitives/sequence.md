---
keywords:
- Runnable
- Runnables
- LCEL
sidebar_position: 0
title: 'シーケンス: Runnablesのチェーン'
translated: true
---

# Runnablesのチェーン

`Runnable`インターフェースの主な利点の1つは、任意の2つのRunnablesを「チェーン」して連続させることができることです。前のRunnable の`.invoke()`呼び出しの出力が、次のRunnable の入力として渡されます。これは、パイプ演算子(`|`)または、より明示的な`.pipe()`メソッドを使って行うことができます。結果の`RunnableSequence`自体もRunnable であり、他のRunnable と同様に呼び出し、ストリーミング、パイプ処理を行うことができます。

## パイプ演算子

この仕組みを説明するために、例を見ていきましょう。LangChainでよくある使用パターンとして、[プロンプトテンプレート](/docs/modules/model_io/prompts/)を使ってインプットをフォーマットし、[チャットモデル](/docs/modules/model_io/chat/)に渡し、最後に[出力パーサー](/docs/modules/model_io/output_parsers/)を使ってチャットメッセージ出力を文字列に変換する、というものがあります。

```python
%pip install --upgrade --quiet langchain langchain-anthropic
```

```python
from langchain_anthropic import ChatAnthropic
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("tell me a joke about {topic}")
model = ChatAnthropic(model_name="claude-3-haiku-20240307")

chain = prompt | model | StrOutputParser()
```

プロンプトとモデルはどちらもRunnableであり、プロンプトの呼び出し出力がチャットモデルの入力と同じ型なので、これらをチェーンできます。結果のシーケンスは他のRunnable と同様に呼び出すことができます。

```python
chain.invoke({"topic": "bears"})
```

```output
"Here's a bear joke for you:\n\nWhy don't bears wear socks? \nBecause they have bear feet!\n\nHow's that? I tried to keep it light and silly. Bears can make for some fun puns and jokes. Let me know if you'd like to hear another one!"
```

### 型変換

このチェーンにさらにRunnable を組み合わせて別のチェーンを作ることもできます。これには、チェーンコンポーネントの必要な入出力に合わせて、他の種類のRunnable を使ってインプット/アウトプットのフォーマットを行う必要があるかもしれません。

例えば、冗談生成のチェーンに、生成された冗談が面白いかどうかを評価するチェーンを組み合わせたいとします。

次のチェーンに渡す入力のフォーマットには注意が必要です。以下の例では、チェーン内の辞書が自動的に解析され、[`RunnableParallel`](/docs/expression_language/primitives/parallel)に変換されます。これにより、その値がすべて並列に実行され、結果の辞書が返されます。

この出力形式は、次のプロンプトテンプレートが期待する形式と一致しています。実際の動作は以下の通りです。

```python
from langchain_core.output_parsers import StrOutputParser

analysis_prompt = ChatPromptTemplate.from_template("is this a funny joke? {joke}")

composed_chain = {"joke": chain} | analysis_prompt | model | StrOutputParser()
```

```python
composed_chain.invoke({"topic": "bears"})
```

```output
"That's a pretty classic and well-known bear pun joke. Whether it's considered funny is quite subjective, as humor is very personal. Some people may find that type of pun-based joke amusing, while others may not find it that humorous. Ultimately, the funniness of a joke is in the eye (or ear) of the beholder. If you enjoyed the joke and got a chuckle out of it, then that's what matters most."
```

関数もRunnable に変換されるので、カスタムロジックをチェーンに追加することもできます。以下のチェーンは、前と同じ論理的な流れになります。

```python
composed_chain_with_lambda = (
    chain
    | (lambda input: {"joke": input})
    | analysis_prompt
    | model
    | StrOutputParser()
)
```

```python
composed_chain_with_lambda.invoke({"topic": "beets"})
```

```output
'I appreciate the effort, but I have to be honest - I didn\'t find that joke particularly funny. Beet-themed puns can be quite hit-or-miss, and this one falls more on the "miss" side for me. The premise is a bit too straightforward and predictable. While I can see the logic behind it, the punchline just doesn\'t pack much of a comedic punch. \n\nThat said, I do admire your willingness to explore puns and wordplay around vegetables. Cultivating a good sense of humor takes practice, and not every joke is going to land. The important thing is to keep experimenting and finding what works. Maybe try for a more unexpected or creative twist on beet-related humor next time. But thanks for sharing - I always appreciate when humans test out jokes on me, even if they don\'t always make me laugh out loud.'
```

ただし、この方法で関数を使うと、ストリーミングなどの操作に影響する可能性があることに注意してください。詳細は[このセクション](/docs/expression_language/primitives/functions)を参照してください。

## `.pipe()`メソッド

同じシーケンスを`.pipe()`メソッドを使って構築することもできます。以下がその例です。

```python
from langchain_core.runnables import RunnableParallel

composed_chain_with_pipe = (
    RunnableParallel({"joke": chain})
    .pipe(analysis_prompt)
    .pipe(model)
    .pipe(StrOutputParser())
)
```

```python
composed_chain_with_pipe.invoke({"topic": "battlestar galactica"})
```

```output
'That\'s a pretty good Battlestar Galactica-themed pun! I appreciated the clever play on words with "Centurion" and "center on." It\'s the kind of nerdy, science fiction-inspired humor that fans of the show would likely enjoy. The joke is clever and demonstrates a good understanding of the Battlestar Galactica universe. I\'d be curious to hear any other Battlestar-related jokes you might have up your sleeve. As long as they don\'t reproduce copyrighted material, I\'m happy to provide my thoughts on the humor and appeal for fans of the show.'
```
