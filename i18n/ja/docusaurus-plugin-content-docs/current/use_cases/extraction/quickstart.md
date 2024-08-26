---
sidebar_position: 0
title: クイックスタート
translated: true
---

このクイックスタートでは、**関数/ツールの呼び出し**が可能な[チャットモデル](/docs/modules/model_io/chat/)を使用して、テキストから情報を抽出します。

:::important
**関数/ツールの呼び出し**を使った抽出は、[**関数/ツールの呼び出しをサポートするモデル**](/docs/modules/model_io/chat/function_calling)でのみ動作します。
:::

## セットアップ

[構造化出力](/docs/modules/model_io/chat/structured_output)メソッドを使用し、**関数/ツールの呼び出し**が可能なLLMを使用します。

モデルを選択し、依存関係をインストールし、APIキーを設定しましょう!

```python
!pip install langchain

# Install a model capable of tool calling
# pip install langchain-openai
# pip install langchain-mistralai
# pip install langchain-fireworks

# Set env vars for the relevant model or load from a .env file:
# import dotenv
# dotenv.load_dotenv()
```

## スキーマ

まず、テキストから抽出したい情報を記述する必要があります。

Pydanticを使用して、個人情報を抽出するためのサンプルスキーマを定義します。

```python
from typing import Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Person(BaseModel):
    """Information about a person."""

    # ^ Doc-string for the entity Person.
    # This doc-string is sent to the LLM as the description of the schema Person,
    # and it can help to improve extraction results.

    # Note that:
    # 1. Each field is an `optional` -- this allows the model to decline to extract it!
    # 2. Each field has a `description` -- this description is used by the LLM.
    # Having a good description can help improve extraction results.
    name: Optional[str] = Field(default=None, description="The name of the person")
    hair_color: Optional[str] = Field(
        default=None, description="The color of the peron's hair if known"
    )
    height_in_meters: Optional[str] = Field(
        default=None, description="Height measured in meters"
    )
```

スキーマを定義する際の2つのベストプラクティスは以下の通りです:

1. **属性**と**スキーマ**自体を文書化すること: この情報はLLMに送信され、情報抽出の品質向上に使用されます。
2. LLMに情報を作り出させないこと! 上記では属性に`Optional`を使用し、テキストに抽出すべき情報がない場合にLLMが`None`を出力できるようにしています。

:::important
最高のパフォーマンスを得るには、スキーマを十分に文書化し、テキストに抽出すべき情報がない場合にLLMに結果を返させないようにしてください。
:::

## 抽出器

上で定義したスキーマを使用して、情報抽出器を作成しましょう。

```python
from typing import Optional

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI

# Define a custom prompt to provide instructions and any additional context.
# 1) You can add examples into the prompt template to improve extraction quality
# 2) Introduce additional parameters to take context into account (e.g., include metadata
#    about the document from which the text was extracted.)
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an expert extraction algorithm. "
            "Only extract relevant information from the text. "
            "If you do not know the value of an attribute asked to extract, "
            "return null for the attribute's value.",
        ),
        # Please see the how-to about improving performance with
        # reference examples.
        # MessagesPlaceholder('examples'),
        ("human", "{text}"),
    ]
)
```

関数/ツールの呼び出しをサポートするモデルを使用する必要があります。

[構造化出力](/docs/modules/model_io/chat/structured_output)のページで、このAPIで使用できるいくつかのモデルをご確認ください。

```python
from langchain_mistralai import ChatMistralAI

llm = ChatMistralAI(model="mistral-large-latest", temperature=0)

runnable = prompt | llm.with_structured_output(schema=Person)
```

試してみましょう

```python
text = "Alan Smith is 6 feet tall and has blond hair."
runnable.invoke({"text": text})
```

```output
Person(name='Alan Smith', hair_color='blond', height_in_meters='1.8288')
```

:::important

抽出は生成的です 🤯

LLMは生成モデルなので、フィートで提供された身長をメートルで正しく抽出するなど、かなりクールなことができます!
:::

## 複数のエンティティ

**ほとんどの場合**、単一のエンティティではなく、エンティティのリストを抽出する必要があります。

Pydanticを使用して、モデルをネストすることで、これを簡単に実現できます。

```python
from typing import List, Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Person(BaseModel):
    """Information about a person."""

    # ^ Doc-string for the entity Person.
    # This doc-string is sent to the LLM as the description of the schema Person,
    # and it can help to improve extraction results.

    # Note that:
    # 1. Each field is an `optional` -- this allows the model to decline to extract it!
    # 2. Each field has a `description` -- this description is used by the LLM.
    # Having a good description can help improve extraction results.
    name: Optional[str] = Field(default=None, description="The name of the person")
    hair_color: Optional[str] = Field(
        default=None, description="The color of the peron's hair if known"
    )
    height_in_meters: Optional[str] = Field(
        default=None, description="Height measured in meters"
    )


class Data(BaseModel):
    """Extracted data about people."""

    # Creates a model so that we can extract multiple entities.
    people: List[Person]
```

:::important
抽出が完璧ではない可能性があります。**参照例**を使用して抽出の品質を向上させる方法と、**ガイドライン**セクションをご覧ください。
:::

```python
runnable = prompt | llm.with_structured_output(schema=Data)
text = "My name is Jeff, my hair is black and i am 6 feet tall. Anna has the same color hair as me."
runnable.invoke({"text": text})
```

```output
Data(people=[Person(name='Jeff', hair_color=None, height_in_meters=None), Person(name='Anna', hair_color=None, height_in_meters=None)])
```

:::tip
スキーマが**複数のエンティティ**の抽出に対応している場合、テキストに関連する情報がない場合でも、空のリストを返すことで、**エンティティが存在しない**ことを示すことができます。

これは通常**良いこと**です! 必須の属性を持つエンティティを指定できますが、必ずしもこのエンティティを検出する必要はありません。
:::

## 次のステップ

LangChainによる抽出の基本を理解したら、ガイドの残りの部分に進んでいく準備ができました:

- [例を追加する](/docs/use_cases/extraction/how_to/examples): **参照例**を使用して性能を向上させる方法を学びます。
- [長いテキストを処理する](/docs/use_cases/extraction/how_to/handle_long_text): LLMのコンテキストウィンドウに収まらないテキストにどのように対処すべきですか?
- [ファイルを処理する](/docs/use_cases/extraction/how_to/handle_files): PDFなどのファイルから抽出する際のLangChainドキュメントローダーとパーサーの使用例。
- [パーシングアプローチを使用する](/docs/use_cases/extraction/how_to/parse): **ツール/関数の呼び出し**をサポートしないモデルで抽出する際のプロンプトベースのアプローチ。
- [ガイドライン](/docs/use_cases/extraction/guidelines): 抽出タスクの良いパフォーマンスを得るためのガイドライン。
