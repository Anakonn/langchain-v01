---
translated: true
---

# OpenAI メタデータ タガー

読み込まれたドキュメントにタイトルやトーン、長さなどの構造化されたメタデータをタグ付けすることは、後でよりターゲットを絞った類似性検索を行うために役立つことがあります。しかし、大量のドキュメントに対してこのラベリングプロセスを手動で行うのは面倒です。

`OpenAIMetadataTagger` ドキュメントトランスフォーマーは、提供されたスキーマに従って各提供ドキュメントからメタデータを抽出することでこのプロセスを自動化します。内部では、設定可能な `OpenAI Functions` を利用したチェーンを使用しているため、カスタムLLMインスタンスを渡す場合は、関数サポートを持つ `OpenAI` モデルである必要があります。

**注:** このドキュメントトランスフォーマーは完全なドキュメントで最も効果的に動作するため、他の分割や処理を行う前にまず全体のドキュメントで実行するのが最善です！

例えば、映画レビューのセットをインデックスしたいとします。次のように有効な `JSON Schema` オブジェクトでドキュメントトランスフォーマーを初期化できます：

```python
from langchain_community.document_transformers.openai_functions import (
    create_metadata_tagger,
)
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI
```

```python
schema = {
    "properties": {
        "movie_title": {"type": "string"},
        "critic": {"type": "string"},
        "tone": {"type": "string", "enum": ["positive", "negative"]},
        "rating": {
            "type": "integer",
            "description": "The number of stars the critic rated the movie",
        },
    },
    "required": ["movie_title", "critic", "tone"],
}

# Must be an OpenAI model that supports functions
llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo-0613")

document_transformer = create_metadata_tagger(metadata_schema=schema, llm=llm)
```

その後、ドキュメントトランスフォーマーにドキュメントのリストを渡すだけで、内容からメタデータを抽出します：

```python
original_documents = [
    Document(
        page_content="Review of The Bee Movie\nBy Roger Ebert\n\nThis is the greatest movie ever made. 4 out of 5 stars."
    ),
    Document(
        page_content="Review of The Godfather\nBy Anonymous\n\nThis movie was super boring. 1 out of 5 stars.",
        metadata={"reliable": False},
    ),
]

enhanced_documents = document_transformer.transform_documents(original_documents)
```

```python
import json

print(
    *[d.page_content + "\n\n" + json.dumps(d.metadata) for d in enhanced_documents],
    sep="\n\n---------------\n\n",
)
```

```output
Review of The Bee Movie
By Roger Ebert

This is the greatest movie ever made. 4 out of 5 stars.

{"movie_title": "The Bee Movie", "critic": "Roger Ebert", "tone": "positive", "rating": 4}

---------------

Review of The Godfather
By Anonymous

This movie was super boring. 1 out of 5 stars.

{"movie_title": "The Godfather", "critic": "Anonymous", "tone": "negative", "rating": 1, "reliable": false}
```

新しいドキュメントは、ベクトルストアにロードされる前にテキストスプリッターによってさらに処理されることがあります。抽出されたフィールドは既存のメタデータを上書きしません。

また、Pydanticスキーマでドキュメントトランスフォーマーを初期化することもできます：

```python
from typing import Literal

from pydantic import BaseModel, Field


class Properties(BaseModel):
    movie_title: str
    critic: str
    tone: Literal["positive", "negative"]
    rating: int = Field(description="Rating out of 5 stars")


document_transformer = create_metadata_tagger(Properties, llm)
enhanced_documents = document_transformer.transform_documents(original_documents)

print(
    *[d.page_content + "\n\n" + json.dumps(d.metadata) for d in enhanced_documents],
    sep="\n\n---------------\n\n",
)
```

```output
Review of The Bee Movie
By Roger Ebert

This is the greatest movie ever made. 4 out of 5 stars.

{"movie_title": "The Bee Movie", "critic": "Roger Ebert", "tone": "positive", "rating": 4}

---------------

Review of The Godfather
By Anonymous

This movie was super boring. 1 out of 5 stars.

{"movie_title": "The Godfather", "critic": "Anonymous", "tone": "negative", "rating": 1, "reliable": false}
```

## カスタマイズ

ドキュメントトランスフォーマーのコンストラクタで、基礎となるタグ付けチェーンに標準の LLMChain 引数を渡すことができます。例えば、入力ドキュメントの特定の詳細に焦点を当てたり、特定のスタイルでメタデータを抽出したりするようにLLMに依頼したい場合は、カスタムプロンプトを渡すことができます：

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template(
    """Extract relevant information from the following text.
Anonymous critics are actually Roger Ebert.

{input}
"""
)

document_transformer = create_metadata_tagger(schema, llm, prompt=prompt)
enhanced_documents = document_transformer.transform_documents(original_documents)

print(
    *[d.page_content + "\n\n" + json.dumps(d.metadata) for d in enhanced_documents],
    sep="\n\n---------------\n\n",
)
```

```output
Review of The Bee Movie
By Roger Ebert

This is the greatest movie ever made. 4 out of 5 stars.

{"movie_title": "The Bee Movie", "critic": "Roger Ebert", "tone": "positive", "rating": 4}

---------------

Review of The Godfather
By Anonymous

This movie was super boring. 1 out of 5 stars.

{"movie_title": "The Godfather", "critic": "Roger Ebert", "tone": "negative", "rating": 1, "reliable": false}
```
