---
sidebar_position: 2
title: 多言語匿名化
translated: true
---

# Microsoft Presidioによる多言語データ匿名化

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/privacy/presidio_data_anonymization/multi_language.ipynb)

## ユースケース

データの仮名化における多言語対応は、言語構造や文化的背景の違いから不可欠です。言語によって、個人識別子の形式が異なる場合があります。例えば、名前、場所、日付の構造は言語や地域によって大きく異なります。さらに、非アルファベット文字、アクセント、書字方向も仮名化プロセスに影響を及ぼします。多言語対応がなければ、データが特定可能なままになったり、誤って解釈されたりして、データプライバシーと精度が損なわれる可能性があります。したがって、グローバルな運用に適した効果的かつ正確な仮名化を実現します。

## 概要

Microsoft Presidioのプライベート情報(PII)検出は、いくつかのコンポーネントに依存しています - 通常のパターンマッチング(正規表現など)に加えて、アナライザーは以下のようなエンティティを抽出するための名称エンティティ認識(NER)モデルを使用しています:
- `PERSON`
- `LOCATION`
- `DATE_TIME`
- `NRP`
- `ORGANIZATION`

[[ソース]](https://github.com/microsoft/presidio/blob/main/presidio-analyzer/presidio_analyzer/predefined_recognizers/spacy_recognizer.py)

特定の言語のNERを処理するために、`spaCy`ライブラリの固有のモデルを利用しています。`spaCy`は多言語とサイズの豊富な選択肢で知られています。ただし、必要に応じて[Stanza](https://microsoft.github.io/presidio/analyzer/nlp_engines/spacy_stanza/)や[transformers](https://microsoft.github.io/presidio/analyzer/nlp_engines/transformers/)などの代替フレームワークを統合することもできます。

## クイックスタート

%pip install --upgrade --quiet  langchain langchain-openai langchain-experimental presidio-analyzer presidio-anonymizer spacy Faker

```python
# Download model
!python -m spacy download en_core_web_lg
```

```python
from langchain_experimental.data_anonymizer import PresidioReversibleAnonymizer

anonymizer = PresidioReversibleAnonymizer(
    analyzed_fields=["PERSON"],
)
```

デフォルトでは、`PresidioAnonymizer`と`PresidioReversibleAnonymizer`は英語テキストで訓練されたモデルを使用するため、他の言語にもある程度対応しています。

例えば、ここではモデルが人物を検出できませんでした:

```python
anonymizer.anonymize("Me llamo Sofía")  # "My name is Sofía" in Spanish
```

```output
'Me llamo Sofía'
```

また、別の言語の単語を実際のエンティティとして扱うこともあります。ここでは、*'Yo'*(*スペイン語の'I'*)と*Sofía*の両方が`PERSON`として分類されています:

```python
anonymizer.anonymize("Yo soy Sofía")  # "I am Sofía" in Spanish
```

```output
'Kari Lopez soy Mary Walker'
```

他の言語のテキストを匿名化したい場合は、他のモデルをダウンロードし、匿名化の設定に追加する必要があります:

```python
# Download the models for the languages you want to use
# ! python -m spacy download en_core_web_md
# ! python -m spacy download es_core_news_md
```

```python
nlp_config = {
    "nlp_engine_name": "spacy",
    "models": [
        {"lang_code": "en", "model_name": "en_core_web_md"},
        {"lang_code": "es", "model_name": "es_core_news_md"},
    ],
}
```

そのため、スペイン語のモデルを追加しました。また、英語のモデルも代替モデルに置き換えています - この場合は大きな`en_core_web_lg`モデル(560MB)を小さな`en_core_web_md`モデル(40MB)に置き換えています - サイズが14倍も小さくなっています! 匿名化の速度を気にする場合は、これを検討する価値があります。

さまざまな言語のすべてのモデルは、[spaCyのドキュメント](https://spacy.io/usage/models)にあります。

`languages_config`パラメーターにこの設定を渡してAnonymiserに渡します。前の2つの例がうまく機能することがわかります:

```python
anonymizer = PresidioReversibleAnonymizer(
    analyzed_fields=["PERSON"],
    languages_config=nlp_config,
)

print(
    anonymizer.anonymize("Me llamo Sofía", language="es")
)  # "My name is Sofía" in Spanish
print(anonymizer.anonymize("Yo soy Sofía", language="es"))  # "I am Sofía" in Spanish
```

```output
Me llamo Christopher Smith
Yo soy Joseph Jenkins
```

デフォルトでは、設定の最初の言語(この場合は英語)が、テキストの匿名化に使用されます:

```python
print(anonymizer.anonymize("My name is John"))
```

```output
My name is Shawna Bennett
```

## 他のフレームワークでの使用

### 言語検出

提示したアプローチの欠点の1つは、入力テキストの**言語**を直接渡す必要があることです。しかし、これには解決策があります - *言語検出*ライブラリです。

以下のフレームワークのいずれかをお勧めします:
- fasttext (推奨)
- langdetect

経験上、*fasttext*のパフォーマンスがわずかに良いですが、ご自身のユースケースで検証する必要があります。

```python
# Install necessary packages
%pip install --upgrade --quiet  fasttext langdetect
```

### langdetect

```python
import langdetect
from langchain.schema import runnable


def detect_language(text: str) -> dict:
    language = langdetect.detect(text)
    print(language)
    return {"text": text, "language": language}


chain = runnable.RunnableLambda(detect_language) | (
    lambda x: anonymizer.anonymize(x["text"], language=x["language"])
)
```

```python
chain.invoke("Me llamo Sofía")
```

```output
es
```

```output
'Me llamo Michael Perez III'
```

```python
chain.invoke("My name is John Doe")
```

```output
en
```

```output
'My name is Ronald Bennett'
```

### fasttext

まず、https://dl.fbaipublicfiles.com/fasttext/supervised-models/lid.176.ftz からfasttextモデルをダウンロードする必要があります。

```python
import fasttext

model = fasttext.load_model("lid.176.ftz")


def detect_language(text: str) -> dict:
    language = model.predict(text)[0][0].replace("__label__", "")
    print(language)
    return {"text": text, "language": language}


chain = runnable.RunnableLambda(detect_language) | (
    lambda x: anonymizer.anonymize(x["text"], language=x["language"])
)
```

```output
Warning : `load_model` does not return WordVectorModel or SupervisedModel any more, but a `FastText` object which is very similar.
```

```python
chain.invoke("Yo soy Sofía")
```

```output
es
```

```output
'Yo soy Angela Werner'
```

```python
chain.invoke("My name is John Doe")
```

```output
en
```

```output
'My name is Carlos Newton'
```

このように、関連する言語のエンジンを初期化するだけで、ツールの使用は完全に自動化されます。

## 高度な使用法

### カスタムラベルの NER モデル

spaCy モデルのクラス名がデフォルトの Microsoft Presidio でサポートされているものと異なる場合があります。ポーランド語の例を見てみましょう:

```python
# ! python -m spacy download pl_core_news_md

import spacy

nlp = spacy.load("pl_core_news_md")
doc = nlp("Nazywam się Wiktoria")  # "My name is Wiktoria" in Polish

for ent in doc.ents:
    print(
        f"Text: {ent.text}, Start: {ent.start_char}, End: {ent.end_char}, Label: {ent.label_}"
    )
```
</codeblock>

```output
Text: Wiktoria, Start: 12, End: 20, Label: persName
```
</codeblock>

*Victoria* という名前が `persName` としてクラス分類されていますが、これは Microsoft Presidio で実装されているデフォルトのクラス名 `PERSON`/`PER` に対応していません (「[SpacyRecognizer implementation](https://github.com/microsoft/presidio/blob/main/presidio-analyzer/presidio_analyzer/predefined_recognizers/spacy_recognizer.py)」の `CHECK_LABEL_GROUPS` を参照してください)。

spaCy モデル (自分で訓練したものを含む) のカスタムラベルについては、[このスレッド](https://github.com/microsoft/presidio/issues/851)で詳しく説明されています。

そのため、この文章は匿名化されません:

```python
nlp_config = {
    "nlp_engine_name": "spacy",
    "models": [
        {"lang_code": "en", "model_name": "en_core_web_md"},
        {"lang_code": "es", "model_name": "es_core_news_md"},
        {"lang_code": "pl", "model_name": "pl_core_news_md"},
    ],
}

anonymizer = PresidioReversibleAnonymizer(
    analyzed_fields=["PERSON", "LOCATION", "DATE_TIME"],
    languages_config=nlp_config,
)

print(
    anonymizer.anonymize("Nazywam się Wiktoria", language="pl")
)  # "My name is Wiktoria" in Polish
```
</codeblock>

```output
Nazywam się Wiktoria
```
</codeblock>

この問題を解決するには、独自のクラスマッピングを持つ `SpacyRecognizer` を作成し、匿名化器に追加します:

```python
from presidio_analyzer.predefined_recognizers import SpacyRecognizer

polish_check_label_groups = [
    ({"LOCATION"}, {"placeName", "geogName"}),
    ({"PERSON"}, {"persName"}),
    ({"DATE_TIME"}, {"date", "time"}),
]

spacy_recognizer = SpacyRecognizer(
    supported_language="pl",
    check_label_groups=polish_check_label_groups,
)

anonymizer.add_recognizer(spacy_recognizer)
```
</codeblock>

これで問題なく動作します:

```python
print(
    anonymizer.anonymize("Nazywam się Wiktoria", language="pl")
)  # "My name is Wiktoria" in Polish
```
</codeblock>

```output
Nazywam się Morgan Walters
```
</codeblock>

より複雑な例を試してみましょう:

```python
print(
    anonymizer.anonymize(
        "Nazywam się Wiktoria. Płock to moje miasto rodzinne. Urodziłam się dnia 6 kwietnia 2001 roku",
        language="pl",
    )
)  # "My name is Wiktoria. Płock is my home town. I was born on 6 April 2001" in Polish
```
</codeblock>

```output
Nazywam się Ernest Liu. New Taylorburgh to moje miasto rodzinne. Urodziłam się 1987-01-19
```
</codeblock>

クラスマッピングのおかげで、匿名化器は様々なタイプのエンティティに対応できます。

### カスタムの言語固有のオペレーター

上の例では、文章は正しく匿名化されましたが、偽のデータがポーランド語に全く合っていません。そこでカスタムオペレーターを追加することで、この問題を解決できます:

```python
from faker import Faker
from presidio_anonymizer.entities import OperatorConfig

fake = Faker(locale="pl_PL")  # Setting faker to provide Polish data

new_operators = {
    "PERSON": OperatorConfig("custom", {"lambda": lambda _: fake.first_name_female()}),
    "LOCATION": OperatorConfig("custom", {"lambda": lambda _: fake.city()}),
}

anonymizer.add_operators(new_operators)
```
</codeblock>

```python
print(
    anonymizer.anonymize(
        "Nazywam się Wiktoria. Płock to moje miasto rodzinne. Urodziłam się dnia 6 kwietnia 2001 roku",
        language="pl",
    )
)  # "My name is Wiktoria. Płock is my home town. I was born on 6 April 2001" in Polish
```
</codeblock>

```output
Nazywam się Marianna. Szczecin to moje miasto rodzinne. Urodziłam się 1976-11-16
```
</codeblock>

### 制限事項

結果は、認識器とNERモデルの性能に依存することを覚えておいてください。

以下の例を見てください - スペイン語の小さなモデル (12MB) をダウンロードしましたが、中サイズのモデル (40MB) ほど良い性能ではありません:

```python
# ! python -m spacy download es_core_news_sm

for model in ["es_core_news_sm", "es_core_news_md"]:
    nlp_config = {
        "nlp_engine_name": "spacy",
        "models": [
            {"lang_code": "es", "model_name": model},
        ],
    }

    anonymizer = PresidioReversibleAnonymizer(
        analyzed_fields=["PERSON"],
        languages_config=nlp_config,
    )

    print(
        f"Model: {model}. Result: {anonymizer.anonymize('Me llamo Sofía', language='es')}"
    )
```
</codeblock>

```output
Model: es_core_news_sm. Result: Me llamo Sofía
Model: es_core_news_md. Result: Me llamo Lawrence Davis
```
</codeblock>

多くの場合、spaCy の大きなモデルでも十分ではありません - 既に、トランスフォーマーを使った、より複雑で優れた固有表現抽出の手法が存在します。これについては[こちら](https://microsoft.github.io/presidio/analyzer/nlp_engines/transformers/)で詳しく説明されています。
