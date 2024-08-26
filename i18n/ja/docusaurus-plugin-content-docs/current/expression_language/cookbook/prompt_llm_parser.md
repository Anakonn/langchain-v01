---
sidebar_position: 0
title: プロンプト + LLM
translated: true
---

最も一般的で価値のある構成は次のようなものです:

``PromptTemplate`` / ``ChatPromptTemplate`` -> ``LLM`` / ``ChatModel`` -> ``OutputParser``

ほとんどの他のチェーンもこのビルディングブロックを使用します。

## PromptTemplate + LLM

最も単純な構成は、プロンプトとモデルを組み合わせて、ユーザー入力を受け取り、それをプロンプトに追加し、モデルに渡し、生のモデル出力を返すチェーンを作成することです。

ここでは、PromptTemplate/ChatPromptTemplatesとLLMs/ChatModelsを自由に組み合わせることができます。
%pip install --upgrade --quiet  langchain langchain-openai

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_template("tell me a joke about {foo}")
model = ChatOpenAI()
chain = prompt | model
```

```python
chain.invoke({"foo": "bears"})
```

```output
AIMessage(content="Why don't bears wear shoes?\n\nBecause they have bear feet!", additional_kwargs={}, example=False)
```

多くの場合、各モデル呼び出しに渡されるkwargsを添付したいと思います。以下にその例をいくつか示します:

### ストップシーケンスの添付

```python
chain = prompt | model.bind(stop=["\n"])
```

```python
chain.invoke({"foo": "bears"})
```

```output
AIMessage(content='Why did the bear never wear shoes?', additional_kwargs={}, example=False)
```

### 関数呼び出し情報の添付

```python
functions = [
    {
        "name": "joke",
        "description": "A joke",
        "parameters": {
            "type": "object",
            "properties": {
                "setup": {"type": "string", "description": "The setup for the joke"},
                "punchline": {
                    "type": "string",
                    "description": "The punchline for the joke",
                },
            },
            "required": ["setup", "punchline"],
        },
    }
]
chain = prompt | model.bind(function_call={"name": "joke"}, functions=functions)
```

```python
chain.invoke({"foo": "bears"}, config={})
```

```output
AIMessage(content='', additional_kwargs={'function_call': {'name': 'joke', 'arguments': '{\n  "setup": "Why don\'t bears wear shoes?",\n  "punchline": "Because they have bear feet!"\n}'}}, example=False)
```

## PromptTemplate + LLM + OutputParser

出力パーサーを追加することで、生のLLM/ChatModel出力をより使いやすい形式に変換することもできます。

```python
from langchain_core.output_parsers import StrOutputParser

chain = prompt | model | StrOutputParser()
```

ご覧のとおり、これで文字列が返されるようになり、後続のタスクにとってはるかに扱いやすい形式になりました。

```python
chain.invoke({"foo": "bears"})
```

```output
"Why don't bears wear shoes?\n\nBecause they have bear feet!"
```

### 関数出力パーサー

関数の出力を指定する場合は、それを直接解析することができます。

```python
from langchain.output_parsers.openai_functions import JsonOutputFunctionsParser

chain = (
    prompt
    | model.bind(function_call={"name": "joke"}, functions=functions)
    | JsonOutputFunctionsParser()
)
```

```python
chain.invoke({"foo": "bears"})
```

```output
{'setup': "Why don't bears like fast food?",
 'punchline': "Because they can't catch it!"}
```

```python
from langchain.output_parsers.openai_functions import JsonKeyOutputFunctionsParser

chain = (
    prompt
    | model.bind(function_call={"name": "joke"}, functions=functions)
    | JsonKeyOutputFunctionsParser(key_name="setup")
)
```

```python
chain.invoke({"foo": "bears"})
```

```output
"Why don't bears wear shoes?"
```

## 入力の簡略化

呼び出しをさらに簡単にするために、プロンプト入力辞書の作成を処理する `RunnableParallel` を追加することができます:

```python
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

map_ = RunnableParallel(foo=RunnablePassthrough())
chain = (
    map_
    | prompt
    | model.bind(function_call={"name": "joke"}, functions=functions)
    | JsonKeyOutputFunctionsParser(key_name="setup")
)
```

```python
chain.invoke("bears")
```

```output
"Why don't bears wear shoes?"
```

別のRunnableとマップを合成しているので、構文糖衣を使って辞書を使うこともできます:

```python
chain = (
    {"foo": RunnablePassthrough()}
    | prompt
    | model.bind(function_call={"name": "joke"}, functions=functions)
    | JsonKeyOutputFunctionsParser(key_name="setup")
)
```

```python
chain.invoke("bears")
```

```output
"Why don't bears like fast food?"
```
