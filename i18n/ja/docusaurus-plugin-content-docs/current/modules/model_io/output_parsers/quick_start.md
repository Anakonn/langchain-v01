---
sidebar_position: 3
title: クイックスタート
translated: true
---

言語モデルは文章を出力します。しかし、単なる文章ではなく、より構造化された情報を得たい場合もあります。そこで出力パーサーが役立ちます。

出力パーサーは、言語モデルの応答を構造化するためのクラスです。出力パーサーが実装しなければならない主な2つのメソッドは以下の通りです:

- "Get format instructions": 言語モデルの出力をどのようにフォーマットすべきかを示す文字列を返すメソッド。
- "Parse": 言語モデルからの出力と見なされる文字列を受け取り、それを何らかの構造に解析するメソッド。

そして、オプションの1つのメソッドは以下の通りです:

- "Parse with prompt": 言語モデルからの出力と、その出力を生成したプロンプトを受け取り、それを何らかの構造に解析するメソッド。プロンプトは、出力パーサーが出力を再試行または修正する必要がある場合に、その情報を得るために提供されます。

## 始めましょう

以下では、主な出力パーサーの1つである `PydanticOutputParser` について説明します。

```python
from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, validator
from langchain_openai import OpenAI

model = OpenAI(model_name="gpt-3.5-turbo-instruct", temperature=0.0)


# Define your desired data structure.
class Joke(BaseModel):
    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")

    # You can add custom validation logic easily with Pydantic.
    @validator("setup")
    def question_ends_with_question_mark(cls, field):
        if field[-1] != "?":
            raise ValueError("Badly formed question!")
        return field


# Set up a parser + inject instructions into the prompt template.
parser = PydanticOutputParser(pydantic_object=Joke)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

# And a query intended to prompt a language model to populate the data structure.
prompt_and_model = prompt | model
output = prompt_and_model.invoke({"query": "Tell me a joke."})
parser.invoke(output)
```

```output
Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')
```

## LCEL

出力パーサーは [Runnable インターフェース](/docs/expression_language/interface)を実装しており、[LangChain Expression Language (LCEL)](/docs/expression_language/)の基本的な構成要素です。つまり、`invoke`、`ainvoke`、`stream`、`astream`、`batch`、`abatch`、`astream_log`の呼び出しをサポートしています。

出力パーサーは文字列または `BaseMessage` を入力として受け取り、任意の型を返すことができます。

```python
parser.invoke(output)
```

```output
Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')
```

パーサーを手動で呼び出す代わりに、`Runnable`シーケンスに追加することもできます:

```python
chain = prompt | model | parser
chain.invoke({"query": "Tell me a joke."})
```

```output
Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')
```

すべてのパーサーがストリーミングインターフェースをサポートしていますが、出力型に強く依存するため、一部のパーサーのみが部分的に解析されたオブジェクトをストリーミングできます。部分的なオブジェクトを構築できないパーサーは、完全に解析された出力を返します。

`SimpleJsonOutputParser`はこの部分的な出力のストリーミングに対応しています:

```python
from langchain.output_parsers.json import SimpleJsonOutputParser

json_prompt = PromptTemplate.from_template(
    "Return a JSON object with an `answer` key that answers the following question: {question}"
)
json_parser = SimpleJsonOutputParser()
json_chain = json_prompt | model | json_parser
```

```python
list(json_chain.stream({"question": "Who invented the microscope?"}))
```

```output
[{},
 {'answer': ''},
 {'answer': 'Ant'},
 {'answer': 'Anton'},
 {'answer': 'Antonie'},
 {'answer': 'Antonie van'},
 {'answer': 'Antonie van Lee'},
 {'answer': 'Antonie van Leeu'},
 {'answer': 'Antonie van Leeuwen'},
 {'answer': 'Antonie van Leeuwenho'},
 {'answer': 'Antonie van Leeuwenhoek'}]
```

一方、`PydanticOutputParser`は対応していません:

```python
list(chain.stream({"query": "Tell me a joke."}))
```

```output
[Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')]
```
