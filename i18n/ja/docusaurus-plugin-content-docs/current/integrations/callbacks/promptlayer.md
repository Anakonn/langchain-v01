---
translated: true
---

# PromptLayer

>[PromptLayer](https://docs.promptlayer.com/introduction)は、プロンプトエンジニアリングのためのプラットフォームです。LLMの可視化、リクエストの表示、プロンプトのバージョン管理、使用状況の追跡などの機能も提供しています。
>
>`PromptLayer`には、LangChainと直接統合されたLLMもありますが(例: [`PromptLayerOpenAI`](/docs/integrations/llms/promptlayer_openai))、コールバックを使用するのが`PromptLayer`とLangChainを統合する推奨される方法です。

このガイドでは、`PromptLayerCallbackHandler`のセットアップ方法を説明します。

詳細は[PromptLayerのドキュメント](https://docs.promptlayer.com/languages/langchain)をご覧ください。

## インストールとセットアップ

```python
%pip install --upgrade --quiet  promptlayer --upgrade
```

### APIクレデンシャルの取得

PromptLayerのアカウントをお持ちでない場合は、[promptlayer.com](https://www.promptlayer.com)で作成してください。その後、ナビゲーションバーの設定アイコンをクリックしてAPIキーを取得し、環境変数`PROMPTLAYER_API_KEY`に設定してください。

## 使用方法

`PromptLayerCallbackHandler`の使い方は非常に簡単です。2つのオプション引数を取ります:
1. `pl_tags` - PromptLayerで追跡するタグのリスト(文字列)。
2. `pl_id_callback` - `promptlayer_request_id`を引数として受け取る関数。この IDを使用して、PromptLayerの追跡機能(メタデータ、スコア、プロンプトの使用状況など)を利用できます。

## 簡単なOpenAI例

この簡単な例では、`PromptLayerCallbackHandler`を`ChatOpenAI`と一緒に使用しています。`chatopenai`というPromptLayerタグを追加しています。

```python
import promptlayer  # Don't forget this 🍰
from langchain_community.callbacks.promptlayer_callback import (
    PromptLayerCallbackHandler,
)
```

```python
from langchain.schema import (
    HumanMessage,
)
from langchain_openai import ChatOpenAI

chat_llm = ChatOpenAI(
    temperature=0,
    callbacks=[PromptLayerCallbackHandler(pl_tags=["chatopenai"])],
)
llm_results = chat_llm.invoke(
    [
        HumanMessage(content="What comes after 1,2,3 ?"),
        HumanMessage(content="Tell me another joke?"),
    ]
)
print(llm_results)
```

## GPT4All例

```python
from langchain_community.llms import GPT4All

model = GPT4All(model="./models/gpt4all-model.bin", n_ctx=512, n_threads=8)
callbacks = [PromptLayerCallbackHandler(pl_tags=["langchain", "gpt4all"])]

response = model.invoke(
    "Once upon a time, ",
    config={"callbacks": callbacks},
)
```

## 高度な例

この例では、`PromptLayer`の機能をさらに活用しています。

PromptLayerでは、プロンプトテンプレートを視覚的に作成、バージョン管理、追跡できます。[Prompt Registry](https://docs.promptlayer.com/features/prompt-registry)を使用して、`example`という名前のプロンプトテンプレートを programmatically 取得しています。

また、`pl_id_callback`関数を定義し、`promptlayer_request_id`を受け取ってスコアの記録、メタデータの追加、使用したプロンプトテンプレートのリンク付けを行っています。追跡の詳細は[ドキュメント](https://docs.promptlayer.com/features/prompt-history/request-id)をご覧ください。

```python
from langchain_openai import OpenAI


def pl_id_callback(promptlayer_request_id):
    print("prompt layer id ", promptlayer_request_id)
    promptlayer.track.score(
        request_id=promptlayer_request_id, score=100
    )  # score is an integer 0-100
    promptlayer.track.metadata(
        request_id=promptlayer_request_id, metadata={"foo": "bar"}
    )  # metadata is a dictionary of key value pairs that is tracked on PromptLayer
    promptlayer.track.prompt(
        request_id=promptlayer_request_id,
        prompt_name="example",
        prompt_input_variables={"product": "toasters"},
        version=1,
    )  # link the request to a prompt template


openai_llm = OpenAI(
    model_name="gpt-3.5-turbo-instruct",
    callbacks=[PromptLayerCallbackHandler(pl_id_callback=pl_id_callback)],
)

example_prompt = promptlayer.prompts.get("example", version=1, langchain=True)
openai_llm.invoke(example_prompt.format(product="toasters"))
```

これだけで設定は完了です! 設定後、すべてのリクエストがPromptLayerのダッシュボードに表示されます。
このコールバックは、LangChainで実装されたすべてのLLMで機能します。
