---
translated: true
---

# チェーンデコレータを使ってランナブルを作成する

任意の関数をチェーンに変換するには、`@chain`デコレータを追加することができます。これは[`RunnableLambda`](/docs/expression_language/primitives/functions)でラップするのと機能的に同等です。

これにより、チェーンを正しくトレースすることで可観測性が向上します。この関数内部のランナブルへの呼び出しはネストされた子として追跡されます。

また、他のランナブルと同様に使用したり、チェーンに組み合わせたりすることができます。

実際の動作を見てみましょう!

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import chain
from langchain_openai import ChatOpenAI
```

```python
prompt1 = ChatPromptTemplate.from_template("Tell me a joke about {topic}")
prompt2 = ChatPromptTemplate.from_template("What is the subject of this joke: {joke}")
```

```python
@chain
def custom_chain(text):
    prompt_val1 = prompt1.invoke({"topic": text})
    output1 = ChatOpenAI().invoke(prompt_val1)
    parsed_output1 = StrOutputParser().invoke(output1)
    chain2 = prompt2 | ChatOpenAI() | StrOutputParser()
    return chain2.invoke({"joke": parsed_output1})
```

`custom_chain`はランナブルになりました。そのため、`invoke`を使う必要があります。

```python
custom_chain.invoke("bears")
```

```output
'The subject of this joke is bears.'
```

LangSmithのトレースを確認すると、OpenAIへの呼び出しがネストされた`custom_chain`トレースが表示されているはずです。
