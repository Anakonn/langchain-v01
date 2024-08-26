---
translated: true
---

# Microsoft Presidio によるデータの匿名化

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/privacy/presidio_data_anonymization/index.ipynb)

>[Presidio](https://microsoft.github.io/presidio/) (ラテン語の praesidium 'protection, garrison' に由来) は、機密データが適切に管理および管理されることを保証するのに役立ちます。クレジットカード番号、名前、場所、社会保障番号、ビットコインウォレット、米国の電話番号、金融データなどのプライベートエンティティのテキストおよび画像の迅速な識別と匿名化モジュールを提供します。

## ユースケース

データの匿名化は、GPT-4 などの言語モデルに情報を渡す前に重要です。これにより、プライバシーを保護し、機密性を維持することができます。データが匿名化されていない場合、名前、住所、連絡先番号、または特定の個人に関連付けられた他の識別子などの機密情報が学習され、悪用される可能性があります。したがって、この個人を特定できる情報 (PII) を不明瞭にまたは削除することで、個人のプライバシー権を侵害したり、データ保護法や規制に違反したりすることなく、データを自由に使用できます。

## 概要

匿名化には 2 つのステップがあります:

1. **識別:** 個人を特定できる情報 (PII) を含むすべてのデータフィールドを識別します。
2. **置換:** すべての PII を、個人情報を明かさずに参照に使用できる擬似値またはコードに置き換えます。暗号化は使用しません。言語モデルは暗号化されたデータの意味やコンテキストを理解できないためです。

匿名化の目的で *Microsoft Presidio* と *Faker* フレームワークを使用しています。完全な実装は `PresidioAnonymizer` で利用できます。

## クイックスタート

LangChain での匿名化の使用例を以下に示します。

```python
%pip install --upgrade --quiet  langchain langchain-openai langchain-experimental presidio-analyzer presidio-anonymizer spacy Faker
```

```python
# Download model
!python -m spacy download en_core_web_lg
```

\
サンプル文を使って PII の匿名化がどのように機能するかを確認しましょう:

```python
from langchain_experimental.data_anonymizer import PresidioAnonymizer

anonymizer = PresidioAnonymizer()

anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com"
)
```

```output
'My name is James Martinez, call me at (576)928-1972x679 or email me at lisa44@example.com'
```

### LangChain Expression Language での使用

LCEL を使えば、匿名化を自分のアプリケーションの残りの部分とつなぐことができます。

```python
# Set env var OPENAI_API_KEY or load from a .env file:
# import dotenv

# dotenv.load_dotenv()
```

```python
text = """Slim Shady recently lost his wallet.
Inside is some cash and his credit card with the number 4916 0387 9536 0861.
If you would find it, please call at 313-666-7440 or write an email here: real.slim.shady@gmail.com."""
```

```python
from langchain_core.prompts.prompt import PromptTemplate
from langchain_openai import ChatOpenAI

anonymizer = PresidioAnonymizer()

template = """Rewrite this text into an official, short email:

{anonymized_text}"""
prompt = PromptTemplate.from_template(template)
llm = ChatOpenAI(temperature=0)

chain = {"anonymized_text": anonymizer.anonymize} | prompt | llm
response = chain.invoke(text)
print(response.content)
```

```output
Dear Sir/Madam,

We regret to inform you that Mr. Dennis Cooper has recently misplaced his wallet. The wallet contains a sum of cash and his credit card, bearing the number 3588895295514977.

Should you happen to come across the aforementioned wallet, kindly contact us immediately at (428)451-3494x4110 or send an email to perryluke@example.com.

Your prompt assistance in this matter would be greatly appreciated.

Yours faithfully,

[Your Name]
```

## カスタマイズ

`analyzed_fields` を指定して、特定のデータタイプのみを匿名化できます。

```python
anonymizer = PresidioAnonymizer(analyzed_fields=["PERSON"])

anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com"
)
```

```output
'My name is Shannon Steele, call me at 313-666-7440 or email me at real.slim.shady@gmail.com'
```

\
名前が正しく識別され、別の名前に置き換えられたことがわかります。`analyzed_fields` 属性は、検出および置換するデータの種類を決定します。*PHONE_NUMBER* をリストに追加できます:

```python
anonymizer = PresidioAnonymizer(analyzed_fields=["PERSON", "PHONE_NUMBER"])
anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com"
)
```

```output
'My name is Wesley Flores, call me at (498)576-9526 or email me at real.slim.shady@gmail.com'
```

\
`analyzed_fields` を指定しない場合、匿名化ツールはデフォルトでサポートされているすべての形式を検出します。サポートされているフィールドの完全なリストは以下の通りです:

`['PERSON', 'EMAIL_ADDRESS', 'PHONE_NUMBER', 'IBAN_CODE', 'CREDIT_CARD', 'CRYPTO', 'IP_ADDRESS', 'LOCATION', 'DATE_TIME', 'NRP', 'MEDICAL_LICENSE', 'URL', 'US_BANK_NUMBER', 'US_DRIVER_LICENSE', 'US_ITIN', 'US_PASSPORT', 'US_SSN']`

**免責事項:** 検出する機密データを慎重に定義することをお勧めします。Presidio は完璧ではなく、時には間違いを犯すため、データに対するコントロールを強化する必要があります。

```python
anonymizer = PresidioAnonymizer()
anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com"
)
```

```output
'My name is Carla Fisher, call me at 001-683-324-0721x0644 or email me at krausejeremy@example.com'
```

\
上記の検出フィールドのリストでは不十分な場合があります。たとえば、既存の *PHONE_NUMBER* フィールドはポーランドの電話番号をサポートしておらず、別のフィールドと混同します:

```python
anonymizer = PresidioAnonymizer()
anonymizer.anonymize("My polish phone number is 666555444")
```

```output
'My polish phone number is QESQ21234635370499'
```

\
独自の認識子を記述し、プールに追加することができます。認識子の作成方法の詳細は [Presidio ドキュメンテーション](https://microsoft.github.io/presidio/samples/python/customizing_presidio_analyzer/)を参照してください。

```python
# Define the regex pattern in a Presidio `Pattern` object:
from presidio_analyzer import Pattern, PatternRecognizer

polish_phone_numbers_pattern = Pattern(
    name="polish_phone_numbers_pattern",
    regex="(?<!\w)(\(?(\+|00)?48\)?)?[ -]?\d{3}[ -]?\d{3}[ -]?\d{3}(?!\w)",
    score=1,
)

# Define the recognizer with one or more patterns
polish_phone_numbers_recognizer = PatternRecognizer(
    supported_entity="POLISH_PHONE_NUMBER", patterns=[polish_phone_numbers_pattern]
)
```

\
`add_recognizer` メソッドを呼び出して、認識子を追加できます:

```python
anonymizer.add_recognizer(polish_phone_numbers_recognizer)
```

\
これで、パターンベースの認識子を追加したので、匿名化ツールがポーランドの電話番号を処理できるようになりました。

```python
print(anonymizer.anonymize("My polish phone number is 666555444"))
print(anonymizer.anonymize("My polish phone number is 666 555 444"))
print(anonymizer.anonymize("My polish phone number is +48 666 555 444"))
```

```output
My polish phone number is <POLISH_PHONE_NUMBER>
My polish phone number is <POLISH_PHONE_NUMBER>
My polish phone number is <POLISH_PHONE_NUMBER>
```

\
問題は、ポーランドの電話番号を認識できるようになったものの、特定のフィールドを適切に置換する方法 (演算子) がないことです。そのため、出力では `<POLISH_PHONE_NUMBER>` という文字列しか提供されません。置換方法を作成する必要があります:

```python
from faker import Faker

fake = Faker(locale="pl_PL")


def fake_polish_phone_number(_=None):
    return fake.phone_number()


fake_polish_phone_number()
```

```output
'665 631 080'
```

\
Faker を使用してダミーデータを作成しました。演算子を作成し、匿名化ツールに追加できます。演算子の作成の詳細については、Presidio ドキュメンテーションの [simple](https://microsoft.github.io/presidio/tutorial/10_simple_anonymization/) および [custom](https://microsoft.github.io/presidio/tutorial/11_custom_anonymization/) 匿名化を参照してください。

```python
from presidio_anonymizer.entities import OperatorConfig

new_operators = {
    "POLISH_PHONE_NUMBER": OperatorConfig(
        "custom", {"lambda": fake_polish_phone_number}
    )
}
```

```python
anonymizer.add_operators(new_operators)
```

```python
anonymizer.anonymize("My polish phone number is 666555444")
```

```output
'My polish phone number is 538 521 657'
```

## 重要な考慮事項

### 匿名化ツールの検出率

**匿名化のレベルと検出の精度は、実装された認識子の品質に依存します。**

さまざまなソースや言語のテキストには特性の違いがあるため、検出精度をテストし、認識子とオペレーターを反復的に追加して、より良い結果を得る必要があります。

Microsoft Presidio は匿名化の改善に多くの自由を与えてくれます。ライブラリの作者は、[検出率の改善に関する推奨事項とステップバイステップのガイド](https://github.com/microsoft/presidio/discussions/767#discussion-3567223)を提供しています。

### インスタンスの匿名化

`PresidioAnonymizer` には組み込みメモリがありません。したがって、後続のテキストで同じエンティティが2回出現した場合、2つの異なる偽の値に置き換えられます:

```python
print(anonymizer.anonymize("My name is John Doe. Hi John Doe!"))
print(anonymizer.anonymize("My name is John Doe. Hi John Doe!"))
```

```output
My name is Robert Morales. Hi Robert Morales!
My name is Kelly Mccoy. Hi Kelly Mccoy!
```

前の匿名化の結果を保持するには、組み込みメモリを持つ `PresidioReversibleAnonymizer` を使用します:

```python
from langchain_experimental.data_anonymizer import PresidioReversibleAnonymizer

anonymizer_with_memory = PresidioReversibleAnonymizer()

print(anonymizer_with_memory.anonymize("My name is John Doe. Hi John Doe!"))
print(anonymizer_with_memory.anonymize("My name is John Doe. Hi John Doe!"))
```

```output
My name is Ashley Cervantes. Hi Ashley Cervantes!
My name is Ashley Cervantes. Hi Ashley Cervantes!
```

`PresidioReversibleAnonymizer` の詳細については、次のセクションで説明します。
