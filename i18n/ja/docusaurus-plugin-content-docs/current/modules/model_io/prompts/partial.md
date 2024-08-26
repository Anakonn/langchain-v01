---
sidebar_position: 4
translated: true
---

# 部分的なプロンプトテンプレート

他の方法と同様に、プロンプトテンプレートを "部分的に" 使うのが合理的な場合があります。例えば、必要な値のサブセットのみを渡して、残りのサブセットの値を期待する新しいプロンプトテンプレートを作成するなどです。

LangChainでは、これを2つの方法でサポートしています:
1. 文字列値による部分的なフォーマット
2. 文字列値を返す関数による部分的なフォーマット

これら2つの異なる方法は、異なるユースケースをサポートします。以下の例では、両方のユースケースの動機付けと、LangChainでの実装方法について説明します。

## 文字列による部分

プロンプトテンプレートを部分的に使いたい一般的なユースケースは、変数の一部を先に取得し、残りの変数はその後に取得する場合です。例えば、`foo`と`baz`の2つの変数を必要とするプロンプトテンプレートがあるとします。`foo`の値は早期に取得できるが、`baz`の値はその後に取得できる場合、両方の変数を同じ場所で渡すまで待つのは面倒です。その代わりに、`foo`の値でプロンプトテンプレートを部分的に使い、その部分的なプロンプトテンプレートを渡して、後で`baz`の値を使うことができます。以下にその例を示します:

```python
from langchain_core.prompts import PromptTemplate

prompt = PromptTemplate.from_template("{foo}{bar}")
partial_prompt = prompt.partial(foo="foo")
print(partial_prompt.format(bar="baz"))
```

```output
foobaz
```

部分的な変数を使ってプロンプトを初期化することもできます。

```python
prompt = PromptTemplate(
    template="{foo}{bar}", input_variables=["bar"], partial_variables={"foo": "foo"}
)
print(prompt.format(bar="baz"))
```

```output
foobaz
```

## 関数による部分

もう一つの一般的なユースケースは、関数で部分的に使うことです。この場合の使い道は、変数を共通の方法で取得したい場合です。典型的な例は日付や時刻です。プロンプトに常に現在の日付を含めたい場合、それをプロンプトに直接書き込むことはできませんし、他の入力変数と一緒に渡すのも少し面倒です。このような場合、プロンプトを関数で部分的に使うと非常に便利です。

```python
from datetime import datetime


def _get_datetime():
    now = datetime.now()
    return now.strftime("%m/%d/%Y, %H:%M:%S")
```

```python
prompt = PromptTemplate(
    template="Tell me a {adjective} joke about the day {date}",
    input_variables=["adjective", "date"],
)
partial_prompt = prompt.partial(date=_get_datetime)
print(partial_prompt.format(adjective="funny"))
```

```output
Tell me a funny joke about the day 12/27/2023, 10:45:22
```

部分的な変数を使ってプロンプトを初期化することも、このワークフローではよりよい選択肢になることがあります。

```python
prompt = PromptTemplate(
    template="Tell me a {adjective} joke about the day {date}",
    input_variables=["adjective"],
    partial_variables={"date": _get_datetime},
)
print(prompt.format(adjective="funny"))
```

```output
Tell me a funny joke about the day 12/27/2023, 10:45:36
```
