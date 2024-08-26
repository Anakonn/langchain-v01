---
sidebar_position: 1
title: 可逆的匿名化
translated: true
---

# Microsoft Presidioによる可逆的データ匿名化

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/privacy/presidio_data_anonymization/reversible.ipynb)

## ユースケース

前のセクションで、機密データの匿名化の重要性について述べました。**可逆的匿名化**は、言語モデルと情報を共有する際に同様に重要な技術であり、データ保護とデータ利用可能性のバランスを取ります。この手法では、個人を特定できる情報(PII)をマスキングしますが、認可されたユーザーが必要とする場合は、元のデータを復元することができます。この主な利点は、個人の身元を隠すことで不正使用を防ぐことができますが、法的または遵守上の目的で必要な場合は、隠された情報を正確に復元できることです。

## 概要

`PresidioReversibleAnonymizer`を実装しました。これは2つの部分から成ります:

1. 匿名化 - `PresidioAnonymizer`と同じように動作しますが、オブジェクト自体が作成した値と元の値のマッピングを保持します。例:

```output
    {
        "PERSON": {
            "<anonymized>": "<original>",
            "John Doe": "Slim Shady"
        },
        "PHONE_NUMBER": {
            "111-111-1111": "555-555-5555"
        }
        ...
    }
```

2. 匿名化解除 - 上記のマッピングを使用して、偽のデータと元のデータを照合し、置き換えます。

匿名化と匿名化解除の間で、ユーザーは異なる操作を実行できます。例えば、出力をLLMに渡すことができます。

## クイックスタート

`PresidioReversibleAnonymizer`は、その前身の`PresidioAnonymizer`と比べて、匿名化の点では大きな違いはありません:

```python
# Install necessary packages
%pip install --upgrade --quiet  langchain langchain-experimental langchain-openai presidio-analyzer presidio-anonymizer spacy Faker
# ! python -m spacy download en_core_web_lg
```

```python
from langchain_experimental.data_anonymizer import PresidioReversibleAnonymizer

anonymizer = PresidioReversibleAnonymizer(
    analyzed_fields=["PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS", "CREDIT_CARD"],
    # Faker seed is used here to make sure the same fake data is generated for the test purposes
    # In production, it is recommended to remove the faker_seed parameter (it will default to None)
    faker_seed=42,
)

anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com. "
    "By the way, my card number is: 4916 0387 9536 0861"
)
```

```output
'My name is Maria Lynch, call me at 7344131647 or email me at jamesmichael@example.com. By the way, my card number is: 4838637940262'
```

この完全な文字列を匿名化解除したい場合は次のようになります:

```python
# We know this data, as we set the faker_seed parameter
fake_name = "Maria Lynch"
fake_phone = "7344131647"
fake_email = "jamesmichael@example.com"
fake_credit_card = "4838637940262"

anonymized_text = f"""{fake_name} recently lost his wallet.
Inside is some cash and his credit card with the number {fake_credit_card}.
If you would find it, please call at {fake_phone} or write an email here: {fake_email}.
{fake_name} would be very grateful!"""

print(anonymized_text)
```

```output
Maria Lynch recently lost his wallet.
Inside is some cash and his credit card with the number 4838637940262.
If you would find it, please call at 7344131647 or write an email here: jamesmichael@example.com.
Maria Lynch would be very grateful!
```

そして、`deanonymize`メソッドを使って、プロセスを逆転できます:

```python
print(anonymizer.deanonymize(anonymized_text))
```

```output
Slim Shady recently lost his wallet.
Inside is some cash and his credit card with the number 4916 0387 9536 0861.
If you would find it, please call at 313-666-7440 or write an email here: real.slim.shady@gmail.com.
Slim Shady would be very grateful!
```

### LangChain Expression Languageでの使用

LCELを使えば、匿名化と匿名化解除を自分のアプリケーションの残りの部分とうまく連携させることができます。これは、(匿名化解除なしで)LLMへのクエリで匿名化メカニズムを使う例です:

```python
text = """Slim Shady recently lost his wallet.
Inside is some cash and his credit card with the number 4916 0387 9536 0861.
If you would find it, please call at 313-666-7440 or write an email here: real.slim.shady@gmail.com."""
```

```python
from langchain_core.prompts.prompt import PromptTemplate
from langchain_openai import ChatOpenAI

anonymizer = PresidioReversibleAnonymizer()

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

We regret to inform you that Monique Turner has recently misplaced his wallet, which contains a sum of cash and his credit card with the number 213152056829866.

If you happen to come across this wallet, kindly contact us at (770)908-7734x2835 or send an email to barbara25@example.net.

Thank you for your cooperation.

Sincerely,
[Your Name]
```

次に、シーケンスに**匿名化解除ステップ**を追加しましょう:

```python
chain = chain | (lambda ai_message: anonymizer.deanonymize(ai_message.content))
response = chain.invoke(text)
print(response)
```

```output
Dear Sir/Madam,

We regret to inform you that Slim Shady has recently misplaced his wallet, which contains a sum of cash and his credit card with the number 4916 0387 9536 0861.

If you happen to come across this wallet, kindly contact us at 313-666-7440 or send an email to real.slim.shady@gmail.com.

Thank you for your cooperation.

Sincerely,
[Your Name]
```

匿anonymized data was given to the model itself, and therefore it was protected from being leaked to the outside world. Then, the model's response was processed, and the factual value was replaced with the real one.

## 追加情報

`PresidioReversibleAnonymizer`は、偽のPIIと元のPIIのマッピングを`deanonymizer_mapping`パラメーターに保持します。キーは偽のPII、値は元のPIIです:

```python
from langchain_experimental.data_anonymizer import PresidioReversibleAnonymizer

anonymizer = PresidioReversibleAnonymizer(
    analyzed_fields=["PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS", "CREDIT_CARD"],
    # Faker seed is used here to make sure the same fake data is generated for the test purposes
    # In production, it is recommended to remove the faker_seed parameter (it will default to None)
    faker_seed=42,
)

anonymizer.anonymize(
    "My name is Slim Shady, call me at 313-666-7440 or email me at real.slim.shady@gmail.com. "
    "By the way, my card number is: 4916 0387 9536 0861"
)

anonymizer.deanonymizer_mapping
```

```output
{'PERSON': {'Maria Lynch': 'Slim Shady'},
 'PHONE_NUMBER': {'7344131647': '313-666-7440'},
 'EMAIL_ADDRESS': {'jamesmichael@example.com': 'real.slim.shady@gmail.com'},
 'CREDIT_CARD': {'4838637940262': '4916 0387 9536 0861'}}
```

より多くのテキストを匿名化すると、新しいマッピングエントリが追加されます:

```python
print(
    anonymizer.anonymize(
        "Do you have his VISA card number? Yep, it's 4001 9192 5753 7193. I'm John Doe by the way."
    )
)

anonymizer.deanonymizer_mapping
```

```output
Do you have his VISA card number? Yep, it's 3537672423884966. I'm William Bowman by the way.
```

```output
{'PERSON': {'Maria Lynch': 'Slim Shady', 'William Bowman': 'John Doe'},
 'PHONE_NUMBER': {'7344131647': '313-666-7440'},
 'EMAIL_ADDRESS': {'jamesmichael@example.com': 'real.slim.shady@gmail.com'},
 'CREDIT_CARD': {'4838637940262': '4916 0387 9536 0861',
  '3537672423884966': '4001 9192 5753 7193'}}
```

組み込みのメモリ機能のおかげで、既に検出され匿名化されたエンティティは、後続のテキストでも同じ形式になるため、マッピングに重複はありません:

```python
print(
    anonymizer.anonymize(
        "My VISA card number is 4001 9192 5753 7193 and my name is John Doe."
    )
)

anonymizer.deanonymizer_mapping
```

```output
My VISA card number is 3537672423884966 and my name is William Bowman.
```

```output
{'PERSON': {'Maria Lynch': 'Slim Shady', 'William Bowman': 'John Doe'},
 'PHONE_NUMBER': {'7344131647': '313-666-7440'},
 'EMAIL_ADDRESS': {'jamesmichael@example.com': 'real.slim.shady@gmail.com'},
 'CREDIT_CARD': {'4838637940262': '4916 0387 9536 0861',
  '3537672423884966': '4001 9192 5753 7193'}}
```

マッピング自体をファイルに保存して、後で使用することができます:

```python
# We can save the deanonymizer mapping as a JSON or YAML file

anonymizer.save_deanonymizer_mapping("deanonymizer_mapping.json")
# anonymizer.save_deanonymizer_mapping("deanonymizer_mapping.yaml")
```

別の`PresidioReversibleAnonymizer`インスタンスでそれをロードすることもできます:

```python
anonymizer = PresidioReversibleAnonymizer()

anonymizer.deanonymizer_mapping
```

```output
{}
```

```python
anonymizer.load_deanonymizer_mapping("deanonymizer_mapping.json")

anonymizer.deanonymizer_mapping
```

```output
{'PERSON': {'Maria Lynch': 'Slim Shady', 'William Bowman': 'John Doe'},
 'PHONE_NUMBER': {'7344131647': '313-666-7440'},
 'EMAIL_ADDRESS': {'jamesmichael@example.com': 'real.slim.shady@gmail.com'},
 'CREDIT_CARD': {'4838637940262': '4916 0387 9536 0861',
  '3537672423884966': '4001 9192 5753 7193'}}
```

### カスタムの匿名化解除戦略

デフォルトの匿名化解除戦略は、テキスト内のサブ文字列をマッピングエントリと完全に一致させることです。LLMの非決定性のため、モデルがプライベートデータの形式を少し変更したり、タイプミスをする可能性があります。
- *Keanu Reeves* -> *Kaenu Reeves*
- *John F. Kennedy* -> *John Kennedy*
- *Main St, New York* -> *New York*

そのため、適切なプロンプトエンジニアリング(モデルにPIIを変更されないフォーマットで返させる)や、独自の置換戦略の実装を検討する価値があります。ファジー マッチングを使用すると、タイプミスや軽微な文章変更の問題を解決できます。置換戦略の実装例は`deanonymizer_matching_strategies.py`ファイルにあります。

```python
from langchain_experimental.data_anonymizer.deanonymizer_matching_strategies import (
    case_insensitive_matching_strategy,
)

# Original name: Maria Lynch
print(anonymizer.deanonymize("maria lynch"))
print(
    anonymizer.deanonymize(
        "maria lynch", deanonymizer_matching_strategy=case_insensitive_matching_strategy
    )
)
```

```output
maria lynch
Slim Shady
```

```python
from langchain_experimental.data_anonymizer.deanonymizer_matching_strategies import (
    fuzzy_matching_strategy,
)

# Original name: Maria Lynch
# Original phone number: 7344131647 (without dashes)
print(anonymizer.deanonymize("Call Maria K. Lynch at 734-413-1647"))
print(
    anonymizer.deanonymize(
        "Call Maria K. Lynch at 734-413-1647",
        deanonymizer_matching_strategy=fuzzy_matching_strategy,
    )
)
```

```output
Call Maria K. Lynch at 734-413-1647
Call Slim Shady at 313-666-7440
```

完全一致戦略を先に適用し、その後ファジー戦略で残りを一致させる組み合わせ方法が最も効果的のようです。

```python
from langchain_experimental.data_anonymizer.deanonymizer_matching_strategies import (
    combined_exact_fuzzy_matching_strategy,
)

# Changed some values for fuzzy match showcase:
# - "Maria Lynch" -> "Maria K. Lynch"
# - "7344131647" -> "734-413-1647"
# - "213186379402654" -> "2131 8637 9402 654"
print(
    anonymizer.deanonymize(
        (
            "Are you Maria F. Lynch? I found your card with number 4838 6379 40262.\n"
            "Is this your phone number: 734-413-1647?\n"
            "Is this your email address: wdavis@example.net"
        ),
        deanonymizer_matching_strategy=combined_exact_fuzzy_matching_strategy,
    )
)
```

```output
Are you Slim Shady? I found your card with number 4916 0387 9536 0861.
Is this your phone number: 313-666-7440?
Is this your email address: wdavis@example.net
```

もちろん完璧な方法はなく、ユースケースに合わせて実験し、最適な方法を見つける必要があります。

## 今後の課題

- **偽の値を実際の値に置き換えるためのより良いマッチングと置換** - 現在の戦略は、完全一致する文字列を照合し、それを置き換えるというものです。言語モデルの非決定性のため、回答内の値が少し変更されている可能性があります(例: *John Doe* -> *John* や *Main St, New York* -> *New York*)。そのような置換ができなくなる可能性があるため、ニーズに合わせてマッチング方法を調整する必要があります。
