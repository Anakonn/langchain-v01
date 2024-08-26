---
translated: true
---

# カスタム出力パーサー

状況によっては、モデル出力を独自のフォーマットに構造化するためにカスタムパーサーを実装したい場合があります。

カスタムパーサーを実装する方法は2つあります:

1. LCEL内の`RunnableLambda`または`RunnableGenerator`を使用する - ほとんどのユースケースでこれをお勧めします
2. 出力パーサーの基底クラスの1つから継承する - これは面倒な方法です

2つのアプローチの違いは主に表面的なものであり、呼び出されるコールバック(例: `on_chain_start`vs. `on_parser_start`)や、ランナブルラムダとパーサーの視覚化方法(LangSmithなどのトレーシングプラットフォームでの表示)の違いです。

## ランナブルラムダとジェネレーター

推奨される解析方法は**ランナブルラムダ**と**ランナブルジェネレーター**を使うことです!

ここでは、モデルからの出力の大文字と小文字を反転させる簡単なパーサーを作成します。

例えば、モデルが "Meow" を出力した場合、パーサーは "mEOW" を生成します。

```python
from typing import Iterable

from langchain_anthropic.chat_models import ChatAnthropic
from langchain_core.messages import AIMessage, AIMessageChunk

model = ChatAnthropic(model_name="claude-2.1")


def parse(ai_message: AIMessage) -> str:
    """Parse the AI message."""
    return ai_message.content.swapcase()


chain = model | parse
chain.invoke("hello")
```

```output
'hELLO!'
```

:::tip
LCELは、`|`構文を使ってコンポーズする際に、関数`parse`を`RunnableLambda(parse)`にアップグレードします。

それが気に入らない場合は、手動で`RunnableLambda`をインポートし、`parse = RunnableLambda(parse)`を実行することができます。
:::

ストリーミングは機能しますか?

```python
for chunk in chain.stream("tell me about yourself in one sentence"):
    print(chunk, end="|", flush=True)
```

```output
i'M cLAUDE, AN ai ASSISTANT CREATED BY aNTHROPIC TO BE HELPFUL, HARMLESS, AND HONEST.|
```

いいえ、機能しません。なぜなら、パーサーは入力を集約してから出力を解析するためです。

ストリーミングパーサーを実装したい場合は、パーサーが入力のイテラブルを受け取り、利用可能になるたびに結果を生成するようにすることができます。

```python
from langchain_core.runnables import RunnableGenerator


def streaming_parse(chunks: Iterable[AIMessageChunk]) -> Iterable[str]:
    for chunk in chunks:
        yield chunk.content.swapcase()


streaming_parse = RunnableGenerator(streaming_parse)
```

:::important
ストリーミングパーサーを`RunnableGenerator`で包んでください。`|`構文での自動アップグレードを停止する可能性があります。
:::

```python
chain = model | streaming_parse
chain.invoke("hello")
```

```output
'hELLO!'
```

ストリーミングが機能することを確認しましょう!

```python
for chunk in chain.stream("tell me about yourself in one sentence"):
    print(chunk, end="|", flush=True)
```

```output
i|'M| cLAUDE|,| AN| ai| ASSISTANT| CREATED| BY| aN|THROP|IC| TO| BE| HELPFUL|,| HARMLESS|,| AND| HONEST|.|
```

## 出力パーサーの基底クラスの継承

パーサーを実装する別のアプローチは、`BaseOutputParser`、`BaseGenerationOutputParser`、またはニーズに応じた他の基底パーサーから継承することです。

一般的に、この方法は**お勧めしません**。大きな利点はなく、より多くのコードを書く必要があるためです。

最も単純な出力パーサーは`BaseOutputParser`クラスを拡張し、以下のメソッドを実装する必要があります:

* `parse`: モデルからの文字列出力を解析する
* (オプション) `_type`: パーサーの名前を識別する

チャットモデルやLLMからの出力が不適切な場合、`OutputParserException`を投げてパースが失敗したことを示すことができます。この例外を使うことで、パーサーを使用するコードが一貫した方法で例外を処理できます。

:::tip パーサーはランナブル! 🏃

`BaseOutputParser`は`Runnable`インターフェースを実装しているため、このように作成したカスタムパーサーはすべてLangChainのランナブルとして有効になり、自動的な非同期サポート、バッチインターフェース、ログ記録サポートなどの恩恵を受けることができます。
:::

### 簡単なパーサー

ここでは、ブール値の文字列表現(例: `YES`または`NO`)を解析し、対応する`boolean`型に変換するシンプルなパーサーを示します。

```python
from langchain_core.exceptions import OutputParserException
from langchain_core.output_parsers import BaseOutputParser


# The [bool] desribes a parameterization of a generic.
# It's basically indicating what the return type of parse is
# in this case the return type is either True or False
class BooleanOutputParser(BaseOutputParser[bool]):
    """Custom boolean parser."""

    true_val: str = "YES"
    false_val: str = "NO"

    def parse(self, text: str) -> bool:
        cleaned_text = text.strip().upper()
        if cleaned_text not in (self.true_val.upper(), self.false_val.upper()):
            raise OutputParserException(
                f"BooleanOutputParser expected output value to either be "
                f"{self.true_val} or {self.false_val} (case-insensitive). "
                f"Received {cleaned_text}."
            )
        return cleaned_text == self.true_val.upper()

    @property
    def _type(self) -> str:
        return "boolean_output_parser"
```

```python
parser = BooleanOutputParser()
parser.invoke("YES")
```

```output
True
```

```python
try:
    parser.invoke("MEOW")
except Exception as e:
    print(f"Triggered an exception of type: {type(e)}")
```

```output
Triggered an exception of type: <class 'langchain_core.exceptions.OutputParserException'>
```

パラメータ化を変更してみましょう

```python
parser = BooleanOutputParser(true_val="OKAY")
parser.invoke("OKAY")
```

```output
True
```

他のLCELメソッドが存在することを確認しましょう

```python
parser.batch(["OKAY", "NO"])
```

```output
[True, False]
```

```python
await parser.abatch(["OKAY", "NO"])
```

```output
[True, False]
```

```python
from langchain_anthropic.chat_models import ChatAnthropic

anthropic = ChatAnthropic(model_name="claude-2.1")
anthropic.invoke("say OKAY or NO")
```

```output
AIMessage(content='OKAY')
```

パーサーが機能することを確認しましょう!

```python
chain = anthropic | parser
chain.invoke("say OKAY or NO")
```

```output
True
```

:::note
パーサーは、LLMからの出力(文字列)またはチャットモデルからの出力(`AIMessage`)で動作します。
:::

### 生のモデル出力の解析

時には、生の文字列出力以外にも重要なメタデータがモデル出力に含まれている場合があります。その一例がツールの呼び出しで、呼び出される関数に渡される引数が別のプロパティで返されます。より細かな制御が必要な場合は、代わりに`BaseGenerationOutputParser`クラスを継承することができます。

このクラスには`parse_result`メソッドが1つ必要です。このメソッドは生のモデル出力(例: `Generation`または`ChatGeneration`のリスト)を受け取り、解析された出力を返します。

`Generation`と`ChatGeneration`の両方をサポートすることで、パーサーは通常のLLMとチャットモデルの両方で動作できます。

```python
from typing import List

from langchain_core.exceptions import OutputParserException
from langchain_core.messages import AIMessage
from langchain_core.output_parsers import BaseGenerationOutputParser
from langchain_core.outputs import ChatGeneration, Generation


class StrInvertCase(BaseGenerationOutputParser[str]):
    """An example parser that inverts the case of the characters in the message.

    This is an example parse shown just for demonstration purposes and to keep
    the example as simple as possible.
    """

    def parse_result(self, result: List[Generation], *, partial: bool = False) -> str:
        """Parse a list of model Generations into a specific format.

        Args:
            result: A list of Generations to be parsed. The Generations are assumed
                to be different candidate outputs for a single model input.
                Many parsers assume that only a single generation is passed it in.
                We will assert for that
            partial: Whether to allow partial results. This is used for parsers
                     that support streaming
        """
        if len(result) != 1:
            raise NotImplementedError(
                "This output parser can only be used with a single generation."
            )
        generation = result[0]
        if not isinstance(generation, ChatGeneration):
            # Say that this one only works with chat generations
            raise OutputParserException(
                "This output parser can only be used with a chat generation."
            )
        return generation.message.content.swapcase()


chain = anthropic | StrInvertCase()
```

新しいパーサーを試してみましょう! モデルからの出力を反転させるはずです。

```python
chain.invoke("Tell me a short sentence about yourself")
```

```output
'hELLO! mY NAME IS cLAUDE.'
```
