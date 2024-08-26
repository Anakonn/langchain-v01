---
sidebar_label: Alibaba Cloud PAI EAS
translated: true
---

# Alibaba Cloud PAI EAS

>[Alibaba Cloud PAI (Platform for AI)](https://www.alibabacloud.com/help/en/pai/?spm=a2c63.p38356.0.0.c26a426ckrxUwZ)は、クラウドネイティブテクノロジーを使用する軽量で費用効率的なマシンラーニングプラットフォームです。エンドツーエンドのモデリングサービスを提供します。10億を超える機能と1000億を超えるサンプルを使用して、100を超えるシナリオでモデルトレーニングを高速化します。

>[Alibaba Cloud Machine Learning Platform for AI](https://www.alibabacloud.com/help/en/machine-learning-platform-for-ai/latest/what-is-machine-learning-pai)は、企業や開発者向けのマシンラーニングまたは深層学習エンジニアリングプラットフォームです。さまざまな業界シナリオに適用できる、使いやすく、コストパフォーマンスが高く、高パフォーマンスで簡単にスケーラブルなプラグインを提供します。140を超える組み込み最適化アルゴリズムを備えた`Machine Learning Platform for AI`は、データラベリング(`PAI-iTAG`)、モデル構築(`PAI-Designer`および`PAI-DSW`)、モデルトレーニング(`PAI-DLC`)、コンパイル最適化、推論デプロイ(`PAI-EAS`)など、エンドツーエンドのAIエンジニアリング機能を提供します。
>
>`PAI-EAS`は、CPUやGPUなどのさまざまなタイプのハードウェアリソースをサポートし、高スループットと低レイテンシを特徴としています。数回のクリックで大規模な複雑なモデルをデプロイし、リアルタイムでのスケールインとスケールアウトを実行できます。包括的なO&Mおよび監視システムも提供します。

## EASサービスのセットアップ

EASサービスのURLとトークンを初期化するための環境変数を設定します。
詳細については[このドキュメント](https://www.alibabacloud.com/help/en/pai/user-guide/service-deployment/)を参照してください。

```bash
export EAS_SERVICE_URL=XXX
export EAS_SERVICE_TOKEN=XXX
```

別のオプションは、このコードを使うことです:

```python
import os

from langchain_community.chat_models import PaiEasChatEndpoint
from langchain_core.language_models.chat_models import HumanMessage

os.environ["EAS_SERVICE_URL"] = "Your_EAS_Service_URL"
os.environ["EAS_SERVICE_TOKEN"] = "Your_EAS_Service_Token"
chat = PaiEasChatEndpoint(
    eas_service_url=os.environ["EAS_SERVICE_URL"],
    eas_service_token=os.environ["EAS_SERVICE_TOKEN"],
)
```

## チャットモデルの実行

デフォルトの設定を使ってEASサービスを呼び出すことができます:

```python
output = chat.invoke([HumanMessage(content="write a funny joke")])
print("output:", output)
```

または、新しい推論パラメーターでEASサービスを呼び出すことができます:

```python
kwargs = {"temperature": 0.8, "top_p": 0.8, "top_k": 5}
output = chat.invoke([HumanMessage(content="write a funny joke")], **kwargs)
print("output:", output)
```

またはストリームコールを実行して、ストリーム応答を取得することができます:

```python
outputs = chat.stream([HumanMessage(content="hi")], streaming=True)
for output in outputs:
    print("stream output:", output)
```
