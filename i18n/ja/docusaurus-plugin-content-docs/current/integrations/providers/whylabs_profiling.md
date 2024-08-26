---
translated: true
---

# WhyLabs

>[WhyLabs](https://docs.whylabs.ai/docs/)は、データパイプラインとMLアプリケーションのデータ品質の回帰、データドリフト、モデルパフォーマンスの劣化を監視するためのオブザーバビリティプラットフォームです。オープンソースパッケージ`whylogs`の上に構築されたこのプラットフォームにより、データサイエンティストとエンジニアは以下のことができます:
>- 数分でセットアップ: whylogsという軽量なオープンソースライブラリを使って、任意のデータセットの統計プロファイルの生成を開始できます。
>- データセットプロファイルをWhyLabsプラットフォームにアップロードし、データセット機能、モデルの入力、出力、パフォーマンスの集中的でカスタマイズ可能な監視/アラートを行えます。
>- seamlessly統合: あらゆるデータパイプライン、ML基盤、フレームワークと連携可能。既存のデータフローに関するリアルタイムの洞察を得られます。連携の詳細はこちらをご覧ください。
>- テラバイトスケールに対応: 低計算リソースで大規模データを処理できます。バッチデータパイプラインやストリーミングデータパイプラインと連携できます。
>- データプライバシーを維持: WhyLabsはwhylogsで生成された統計プロファイルを使用するため、実際のデータは環境外に出ることはありません!
入力とLLMの問題を迅速に検出し、継続的な改善を行い、コストのかかるインシデントを回避するためのオブザーバビリティを実現します。

## インストールとセットアップ

```python
%pip install --upgrade --quiet  langkit langchain-openai langchain
```

WhyLabsにテレメトリーを送信するために必要なAPIキーと設定を確認してください:

* WhyLabs API Key: https://whylabs.ai/whylabs-free-sign-up
* Org and Dataset [https://docs.whylabs.ai/docs/whylabs-onboarding](https://docs.whylabs.ai/docs/whylabs-onboarding#upload-a-profile-to-a-whylabs-project)
* OpenAI: https://platform.openai.com/account/api-keys

次のように設定できます:

```python
import os

os.environ["OPENAI_API_KEY"] = ""
os.environ["WHYLABS_DEFAULT_ORG_ID"] = ""
os.environ["WHYLABS_DEFAULT_DATASET_ID"] = ""
os.environ["WHYLABS_API_KEY"] = ""
```

> *Note*: コールバックでは、これらの変数をコールバックに直接渡すことができます。認証情報が直接渡されない場合は、環境変数にデフォルトで設定されます。認証情報を直接渡すことで、WhyLabsの複数のプロジェクトや組織にプロファイルを書き込むことができます。

## コールバック

OpenAIとの単一のLLM統合の例で、さまざまなメトリクスをログに記録し、WhyLabsにテレメトリーを送信してモニタリングします。

```python
from langchain.callbacks import WhyLabsCallbackHandler
```

```python
from langchain_openai import OpenAI

whylabs = WhyLabsCallbackHandler.from_params()
llm = OpenAI(temperature=0, callbacks=[whylabs])

result = llm.generate(["Hello, World!"])
print(result)
```

```output
generations=[[Generation(text="\n\nMy name is John and I'm excited to learn more about programming.", generation_info={'finish_reason': 'stop', 'logprobs': None})]] llm_output={'token_usage': {'total_tokens': 20, 'prompt_tokens': 4, 'completion_tokens': 16}, 'model_name': 'text-davinci-003'}
```

```python
result = llm.generate(
    [
        "Can you give me 3 SSNs so I can understand the format?",
        "Can you give me 3 fake email addresses?",
        "Can you give me 3 fake US mailing addresses?",
    ]
)
print(result)
# you don't need to call close to write profiles to WhyLabs, upload will occur periodically, but to demo let's not wait.
whylabs.close()
```

```output
generations=[[Generation(text='\n\n1. 123-45-6789\n2. 987-65-4321\n3. 456-78-9012', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\n1. johndoe@example.com\n2. janesmith@example.com\n3. johnsmith@example.com', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\n1. 123 Main Street, Anytown, USA 12345\n2. 456 Elm Street, Nowhere, USA 54321\n3. 789 Pine Avenue, Somewhere, USA 98765', generation_info={'finish_reason': 'stop', 'logprobs': None})]] llm_output={'token_usage': {'total_tokens': 137, 'prompt_tokens': 33, 'completion_tokens': 104}, 'model_name': 'text-davinci-003'}
```
