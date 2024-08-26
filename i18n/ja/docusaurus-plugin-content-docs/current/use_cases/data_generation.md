---
sidebar_class_name: hidden
title: 合成データ生成
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/data_generation.ipynb)

## ユースケース

合成データは、実世界のイベントから収集されたデータではなく、人工的に生成されたデータです。プライバシーを侵害することなく、また現実世界の制限に遭遇することなく、実データをシミュレーションするために使用されます。

合成データの利点:

1. **プライバシーとセキュリティ**: 個人データの漏洩リスクがない。
2. **データ拡張**: 機械学習のためのデータセットを拡張できる。
3. **柔軟性**: 特定のまたは稀なシナリオを作成できる。
4. **コスト効率**: 実世界のデータ収集よりも安価な場合が多い。
5. **規制順守**: 厳しいデータ保護法への対応が容易。
6. **モデルの堅牢性**: より一般化性の高いAIモデルを生み出すことができる。
7. **迅速なプロトタイピング**: 実データを使わずに素早いテストが可能。
8. **制御された実験**: 特定の条件をシミュレーションできる。
9. **データへのアクセス**: 実データが利用できない場合の代替手段。

注意: 利点があるものの、合成データは現実世界の複雑性を十分に捉えられない可能性があるため、慎重に使用する必要があります。

## クイックスタート

このノートブックでは、langchainライブラリを使って医療請求記録の合成データを生成する方法を詳しく説明します。このツールは、プライバシーの問題や利用可能なデータの制限があるときに、アルゴリズムの開発やテストに役立ちます。

### セットアップ

まず、langchainライブラリとその依存関係をインストールする必要があります。OpenAIのジェネレーターチェーンを使用するため、それもインストールします。実験的なライブラリなので、`langchain_experimental`もインクルードします。必要なモジュールをインポートします。

```python
%pip install --upgrade --quiet  langchain langchain_experimental langchain-openai
# Set env var OPENAI_API_KEY or load from a .env file:
# import dotenv
# dotenv.load_dotenv()

from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate
from langchain_core.pydantic_v1 import BaseModel
from langchain_experimental.tabular_synthetic_data.openai import (
    OPENAI_TEMPLATE,
    create_openai_data_generator,
)
from langchain_experimental.tabular_synthetic_data.prompts import (
    SYNTHETIC_FEW_SHOT_PREFIX,
    SYNTHETIC_FEW_SHOT_SUFFIX,
)
from langchain_openai import ChatOpenAI
```

## 1. データモデルの定義

すべてのデータセットには構造や "スキーマ"があります。以下の`MedicalBilling`クラスがデータの構造を表しています。これを定義することで、合成データジェネレーターにデータの形状と性質を伝えることができます。

```python
class MedicalBilling(BaseModel):
    patient_id: int
    patient_name: str
    diagnosis_code: str
    procedure_code: str
    total_charge: float
    insurance_claim_amount: float
```

たとえば、各レコードには整数の`patient_id`、文字列の`patient_name`などがあります。

## 2. サンプルデータ

合成データジェネレーターを適切に動作させるには、いくつかの現実的なサンプルデータを提供するのが役立ちます。これらのサンプルは "シード"として機能し、ジェネレーターはこれらのデータを参考に、より多くの似たようなデータを生成します。

以下は架空の医療請求記録のサンプルです:

```python
examples = [
    {
        "example": """Patient ID: 123456, Patient Name: John Doe, Diagnosis Code:
        J20.9, Procedure Code: 99203, Total Charge: $500, Insurance Claim Amount: $350"""
    },
    {
        "example": """Patient ID: 789012, Patient Name: Johnson Smith, Diagnosis
        Code: M54.5, Procedure Code: 99213, Total Charge: $150, Insurance Claim Amount: $120"""
    },
    {
        "example": """Patient ID: 345678, Patient Name: Emily Stone, Diagnosis Code:
        E11.9, Procedure Code: 99214, Total Charge: $300, Insurance Claim Amount: $250"""
    },
]
```

## 3. プロンプトテンプレートの作成

ジェネレーターは自動的にデータを生成することはできません。私たちがガイダンスを提供する必要があります。そのためにプロンプトテンプレートを作成します。このテンプレートは、言語モデルにどのように合成データを生成するかを指示します。

```python
OPENAI_TEMPLATE = PromptTemplate(input_variables=["example"], template="{example}")

prompt_template = FewShotPromptTemplate(
    prefix=SYNTHETIC_FEW_SHOT_PREFIX,
    examples=examples,
    suffix=SYNTHETIC_FEW_SHOT_SUFFIX,
    input_variables=["subject", "extra"],
    example_prompt=OPENAI_TEMPLATE,
)
```

`FewShotPromptTemplate`には以下が含まれています:

- `prefix`と`suffix`: 指導的なコンテキストや指示が含まれています。
- `examples`: 前に定義したサンプルデータです。
- `input_variables`: 後で動的に埋めることができる変数("subject"、"extra")です。例えば"subject"を"medical_billing"に設定して、モデルをさらに指導できます。
- `example_prompt`: プロンプトの各サンプルの形式を定義しています。

## 4. データジェネレーターの作成

スキーマとプロンプトができたら、次はデータジェネレーターを作成します。このオブジェクトは、言語モデルとやり取りして合成データを生成する方法を知っています。

```python
synthetic_data_generator = create_openai_data_generator(
    output_schema=MedicalBilling,
    llm=ChatOpenAI(
        temperature=1
    ),  # You'll need to replace with your actual Language Model instance
    prompt=prompt_template,
)
```

## 5. 合成データの生成

最後に、合成データを生成しましょう!

```python
synthetic_results = synthetic_data_generator.generate(
    subject="medical_billing",
    extra="the name must be chosen at random. Make it something you wouldn't normally choose.",
    runs=10,
)
```

このコマンドは、10件の合成医療請求記録を生成するよう要求しています。結果は`synthetic_results`に保存されます。出力は`MedicalBilling`のpydanticモデルのリストになります。

### その他の実装

```python
from langchain_experimental.synthetic_data import (
    DatasetGenerator,
    create_data_generation_chain,
)
from langchain_openai import ChatOpenAI
```

```python
# LLM
model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7)
chain = create_data_generation_chain(model)
```

```python
chain({"fields": ["blue", "yellow"], "preferences": {}})
```

```output
{'fields': ['blue', 'yellow'],
 'preferences': {},
 'text': 'The vibrant blue sky contrasted beautifully with the bright yellow sun, creating a stunning display of colors that instantly lifted the spirits of all who gazed upon it.'}
```

```python
chain(
    {
        "fields": {"colors": ["blue", "yellow"]},
        "preferences": {"style": "Make it in a style of a weather forecast."},
    }
)
```

```output
{'fields': {'colors': ['blue', 'yellow']},
 'preferences': {'style': 'Make it in a style of a weather forecast.'},
 'text': "Good morning! Today's weather forecast brings a beautiful combination of colors to the sky, with hues of blue and yellow gently blending together like a mesmerizing painting."}
```

```python
chain(
    {
        "fields": {"actor": "Tom Hanks", "movies": ["Forrest Gump", "Green Mile"]},
        "preferences": None,
    }
)
```

```output
{'fields': {'actor': 'Tom Hanks', 'movies': ['Forrest Gump', 'Green Mile']},
 'preferences': None,
 'text': 'Tom Hanks, the renowned actor known for his incredible versatility and charm, has graced the silver screen in unforgettable movies such as "Forrest Gump" and "Green Mile".'}
```

```python
chain(
    {
        "fields": [
            {"actor": "Tom Hanks", "movies": ["Forrest Gump", "Green Mile"]},
            {"actor": "Mads Mikkelsen", "movies": ["Hannibal", "Another round"]},
        ],
        "preferences": {"minimum_length": 200, "style": "gossip"},
    }
)
```

```output
{'fields': [{'actor': 'Tom Hanks', 'movies': ['Forrest Gump', 'Green Mile']},
  {'actor': 'Mads Mikkelsen', 'movies': ['Hannibal', 'Another round']}],
 'preferences': {'minimum_length': 200, 'style': 'gossip'},
 'text': 'Did you know that Tom Hanks, the beloved Hollywood actor known for his roles in "Forrest Gump" and "Green Mile", has shared the screen with the talented Mads Mikkelsen, who gained international acclaim for his performances in "Hannibal" and "Another round"? These two incredible actors have brought their exceptional skills and captivating charisma to the big screen, delivering unforgettable performances that have enthralled audiences around the world. Whether it\'s Hanks\' endearing portrayal of Forrest Gump or Mikkelsen\'s chilling depiction of Hannibal Lecter, these movies have solidified their places in cinematic history, leaving a lasting impact on viewers and cementing their status as true icons of the silver screen.'}
```

生成された例は多様で、求められた情報を持っていることがわかります。また、スタイルも指定された好みを反映しています。

## 抽出ベンチマーク用の模範的なデータセットの生成

```python
inp = [
    {
        "Actor": "Tom Hanks",
        "Film": [
            "Forrest Gump",
            "Saving Private Ryan",
            "The Green Mile",
            "Toy Story",
            "Catch Me If You Can",
        ],
    },
    {
        "Actor": "Tom Hardy",
        "Film": [
            "Inception",
            "The Dark Knight Rises",
            "Mad Max: Fury Road",
            "The Revenant",
            "Dunkirk",
        ],
    },
]

generator = DatasetGenerator(model, {"style": "informal", "minimal length": 500})
dataset = generator(inp)
```

```python
dataset
```

```output
[{'fields': {'Actor': 'Tom Hanks',
   'Film': ['Forrest Gump',
    'Saving Private Ryan',
    'The Green Mile',
    'Toy Story',
    'Catch Me If You Can']},
  'preferences': {'style': 'informal', 'minimal length': 500},
  'text': 'Tom Hanks, the versatile and charismatic actor, has graced the silver screen in numerous iconic films including the heartwarming and inspirational "Forrest Gump," the intense and gripping war drama "Saving Private Ryan," the emotionally charged and thought-provoking "The Green Mile," the beloved animated classic "Toy Story," and the thrilling and captivating true story adaptation "Catch Me If You Can." With his impressive range and genuine talent, Hanks continues to captivate audiences worldwide, leaving an indelible mark on the world of cinema.'},
 {'fields': {'Actor': 'Tom Hardy',
   'Film': ['Inception',
    'The Dark Knight Rises',
    'Mad Max: Fury Road',
    'The Revenant',
    'Dunkirk']},
  'preferences': {'style': 'informal', 'minimal length': 500},
  'text': 'Tom Hardy, the versatile actor known for his intense performances, has graced the silver screen in numerous iconic films, including "Inception," "The Dark Knight Rises," "Mad Max: Fury Road," "The Revenant," and "Dunkirk." Whether he\'s delving into the depths of the subconscious mind, donning the mask of the infamous Bane, or navigating the treacherous wasteland as the enigmatic Max Rockatansky, Hardy\'s commitment to his craft is always evident. From his breathtaking portrayal of the ruthless Eames in "Inception" to his captivating transformation into the ferocious Max in "Mad Max: Fury Road," Hardy\'s dynamic range and magnetic presence captivate audiences and leave an indelible mark on the world of cinema. In his most physically demanding role to date, he endured the harsh conditions of the freezing wilderness as he portrayed the rugged frontiersman John Fitzgerald in "The Revenant," earning him critical acclaim and an Academy Award nomination. In Christopher Nolan\'s war epic "Dunkirk," Hardy\'s stoic and heroic portrayal of Royal Air Force pilot Farrier showcases his ability to convey deep emotion through nuanced performances. With his chameleon-like ability to inhabit a wide range of characters and his unwavering commitment to his craft, Tom Hardy has undoubtedly solidified his place as one of the most talented and sought-after actors of his generation.'}]
```

## 生成された例からの抽出

では、この生成されたデータから出力を抽出し、ケースとの比較を行ってみましょう。

```python
from typing import List

from langchain.chains import create_extraction_chain_pydantic
from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
from pydantic import BaseModel, Field
```

```python
class Actor(BaseModel):
    Actor: str = Field(description="name of an actor")
    Film: List[str] = Field(description="list of names of films they starred in")
```

### パーサー

```python
llm = OpenAI()
parser = PydanticOutputParser(pydantic_object=Actor)

prompt = PromptTemplate(
    template="Extract fields from a given text.\n{format_instructions}\n{text}\n",
    input_variables=["text"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

_input = prompt.format_prompt(text=dataset[0]["text"])
output = llm.invoke(_input.to_string())

parsed = parser.parse(output)
parsed
```

```output
Actor(Actor='Tom Hanks', Film=['Forrest Gump', 'Saving Private Ryan', 'The Green Mile', 'Toy Story', 'Catch Me If You Can'])
```

```python
(parsed.Actor == inp[0]["Actor"]) & (parsed.Film == inp[0]["Film"])
```

```output
True
```

### 抽出器

```python
extractor = create_extraction_chain_pydantic(pydantic_schema=Actor, llm=model)
extracted = extractor.run(dataset[1]["text"])
extracted
```

```output
[Actor(Actor='Tom Hardy', Film=['Inception', 'The Dark Knight Rises', 'Mad Max: Fury Road', 'The Revenant', 'Dunkirk'])]
```

```python
(extracted[0].Actor == inp[1]["Actor"]) & (extracted[0].Film == inp[1]["Film"])
```

```output
True
```
