---
translated: true
---

# 自信

>[DeepEval](https://confident-ai.com) LLMのユニットテストのためのパッケージ。
> Confidentを使えば、ユニットテストとインテグレーションテストの両方を使って、合成データの作成からテストまでのすべての工程をサポートすることで、誰もが迅速な反復を通じて堅牢な言語モデルを構築できます。

このガイドでは、LLMのパフォーマンスをテストして測定する方法を示します。コールバックを使ってパフォーマンスを測定する方法と、独自のメトリックを定義してダッシュボードに記録する方法を説明します。

DeepEvalはさらに以下のことも提供しています:
- 合成データの生成方法
- パフォーマンスの測定方法
- 時間の経過とともに結果を監視・レビューするためのダッシュボード

## インストールとセットアップ

```python
%pip install --upgrade --quiet  langchain langchain-openai deepeval langchain-chroma
```

### APIの資格情報の取得

DeepEvalのAPIの資格情報を取得するには、次の手順に従ってください:

1. https://app.confident-ai.com にアクセスする
2. "Organization"をクリックする
3. APIキーをコピーする

ログイン時には、`implementation`名の設定も求められます。implementationの名称は、実装の種類を説明するために必要です。(プロジェクトの名称を付けてください。説明的なものを推奨します。)

```python
!deepeval login
```

### DeepEvalのセットアップ

デフォルトでは、`DeepEvalCallbackHandler`を使ってトラッキングするメトリックを設定できます。ただし、現時点ではメトリックの対応が限られています(今後追加予定)。現在サポートしているのは以下のものです:
- [Answer Relevancy](https://docs.confident-ai.com/docs/measuring_llm_performance/answer_relevancy)
- [Bias](https://docs.confident-ai.com/docs/measuring_llm_performance/debias)
- [Toxicness](https://docs.confident-ai.com/docs/measuring_llm_performance/non_toxic)

```python
from deepeval.metrics.answer_relevancy import AnswerRelevancy

# Here we want to make sure the answer is minimally relevant
answer_relevancy_metric = AnswerRelevancy(minimum_score=0.5)
```

## 始めましょう

`DeepEvalCallbackHandler`を使うには、`implementation_name`が必要です。

```python
from langchain_community.callbacks.confident_callback import DeepEvalCallbackHandler

deepeval_callback = DeepEvalCallbackHandler(
    implementation_name="langchainQuickstart", metrics=[answer_relevancy_metric]
)
```

### シナリオ1: LLMに入力する

OpenAIのLLMに入力することができます。

```python
from langchain_openai import OpenAI

llm = OpenAI(
    temperature=0,
    callbacks=[deepeval_callback],
    verbose=True,
    openai_api_key="<YOUR_API_KEY>",
)
output = llm.generate(
    [
        "What is the best evaluation tool out there? (no bias at all)",
    ]
)
```

```output
LLMResult(generations=[[Generation(text='\n\nQ: What did the fish say when he hit the wall? \nA: Dam.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nThe Moon \n\nThe moon is high in the midnight sky,\nSparkling like a star above.\nThe night so peaceful, so serene,\nFilling up the air with love.\n\nEver changing and renewing,\nA never-ending light of grace.\nThe moon remains a constant view,\nA reminder of life’s gentle pace.\n\nThrough time and space it guides us on,\nA never-fading beacon of hope.\nThe moon shines down on us all,\nAs it continues to rise and elope.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nQ. What did one magnet say to the other magnet?\nA. "I find you very attractive!"', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text="\n\nThe world is charged with the grandeur of God.\nIt will flame out, like shining from shook foil;\nIt gathers to a greatness, like the ooze of oil\nCrushed. Why do men then now not reck his rod?\n\nGenerations have trod, have trod, have trod;\nAnd all is seared with trade; bleared, smeared with toil;\nAnd wears man's smudge and shares man's smell: the soil\nIs bare now, nor can foot feel, being shod.\n\nAnd for all this, nature is never spent;\nThere lives the dearest freshness deep down things;\nAnd though the last lights off the black West went\nOh, morning, at the brown brink eastward, springs —\n\nBecause the Holy Ghost over the bent\nWorld broods with warm breast and with ah! bright wings.\n\n~Gerard Manley Hopkins", generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nQ: What did one ocean say to the other ocean?\nA: Nothing, they just waved.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text="\n\nA poem for you\n\nOn a field of green\n\nThe sky so blue\n\nA gentle breeze, the sun above\n\nA beautiful world, for us to love\n\nLife is a journey, full of surprise\n\nFull of joy and full of surprise\n\nBe brave and take small steps\n\nThe future will be revealed with depth\n\nIn the morning, when dawn arrives\n\nA fresh start, no reason to hide\n\nSomewhere down the road, there's a heart that beats\n\nBelieve in yourself, you'll always succeed.", generation_info={'finish_reason': 'stop', 'logprobs': None})]], llm_output={'token_usage': {'completion_tokens': 504, 'total_tokens': 528, 'prompt_tokens': 24}, 'model_name': 'text-davinci-003'})
```

メトリックが成功したかどうかは、`is_successful()`メソッドを呼び出して確認できます。

```python
answer_relevancy_metric.is_successful()
# returns True/False
```

実行すると、以下のダッシュボードで結果を確認できます。

![Dashboard](https://docs.confident-ai.com/assets/images/dashboard-screenshot-b02db73008213a211b1158ff052d969e.png)

### シナリオ2: コールバックなしでLLMチェーンをトラッキングする

コールバックなしでLLMチェーンをトラッキングするには、最後に接続することができます。

以下のように、簡単なチェーンを定義することから始めましょう。

```python
import requests
from langchain.chains import RetrievalQA
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

text_file_url = "https://raw.githubusercontent.com/hwchase17/chat-your-data/master/state_of_the_union.txt"

openai_api_key = "sk-XXX"

with open("state_of_the_union.txt", "w") as f:
    response = requests.get(text_file_url)
    f.write(response.text)

loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
docsearch = Chroma.from_documents(texts, embeddings)

qa = RetrievalQA.from_chain_type(
    llm=OpenAI(openai_api_key=openai_api_key),
    chain_type="stuff",
    retriever=docsearch.as_retriever(),
)

# Providing a new question-answering pipeline
query = "Who is the president?"
result = qa.run(query)
```

チェーンを定義したら、手動でアンサーの類似性をチェックできます。

```python
answer_relevancy_metric.measure(result, query)
answer_relevancy_metric.is_successful()
```

### 次のステップ

独自のカスタムメトリックを[ここ](https://docs.confident-ai.com/docs/quickstart/custom-metrics)で作成できます。

DeepEvalにはその他の機能もあり、[自動的にユニットテストを作成](https://docs.confident-ai.com/docs/quickstart/synthetic-data-creation)したり、[hallucination用のテスト](https://docs.confident-ai.com/docs/measuring_llm_performance/factual_consistency)を行うこともできます。

興味がある場合は、GitHubリポジトリ[https://github.com/confident-ai/deepeval](https://github.com/confident-ai/deepeval)をチェックしてください。LLMのパフォーマンス向上に関するPRや議論を歓迎しています。
