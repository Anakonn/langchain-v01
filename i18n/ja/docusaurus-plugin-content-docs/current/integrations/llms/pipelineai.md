---
translated: true
---

# PipelineAI

>[PipelineAI](https://pipeline.ai) は、クラウドで機械学習モデルを大規模に実行することを可能にします。また、[いくつかのLLMモデル](https://pipeline.ai) へのAPIアクセスも提供します。

このノートブックでは、[PipelineAI](https://docs.pipeline.ai/docs) とLangchainを使用する方法について説明します。

## PipelineAIの例

[この例では、PipelineAIがLangChainと統合された方法](https://docs.pipeline.ai/docs/langchain) を示しており、PipelineAIによって作成されました。

## セットアップ

`PipelineAI` API、別名 `Pipeline Cloud` を使用するには、`pipeline-ai` ライブラリが必要です。`pip install pipeline-ai` を使用して `pipeline-ai` をインストールします。

```python
# Install the package
%pip install --upgrade --quiet  pipeline-ai
```

## 例

### インポート

```python
import os

from langchain.chains import LLMChain
from langchain_community.llms import PipelineAI
from langchain_core.prompts import PromptTemplate
```

### 環境APIキーの設定

PipelineAIからAPIキーを取得してください。[クラウドクイックスタートガイド](https://docs.pipeline.ai/docs/cloud-quickstart) をチェックしてください。30日間の無料トライアルと10時間のサーバレスGPU計算が提供され、さまざまなモデルをテストできます。

```python
os.environ["PIPELINE_API_KEY"] = "YOUR_API_KEY_HERE"
```

## PipelineAIインスタンスの作成

PipelineAIをインスタンス化する際には、使用したいパイプラインのIDまたはタグを指定する必要があります。例えば、`pipeline_key = "public/gpt-j:base"` のように指定します。その後、追加のパイプライン固有のキーワード引数を渡すオプションがあります。

```python
llm = PipelineAI(pipeline_key="YOUR_PIPELINE_KEY", pipeline_kwargs={...})
```

### プロンプトテンプレートの作成

質問と回答のためのプロンプトテンプレートを作成します。

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

### LLMChainの開始

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

### LLMChainの実行

質問を提供してLLMChainを実行します。

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
