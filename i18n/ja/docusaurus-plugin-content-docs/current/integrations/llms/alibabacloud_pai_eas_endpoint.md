---
translated: true
---

# Alibaba Cloud PAI EAS

>[Alibaba Cloud の機械学習プラットフォーム for AI](https://www.alibabacloud.com/help/en/pai) は、企業や開発者向けの機械学習やディープラーニングのエンジニアリングプラットフォームです。様々な業界シナリオに適用できる、使いやすく、コストパフォーマンスが高く、高パフォーマンスで簡単にスケーリングできるプラグインを提供しています。140 以上の組み込み最適化アルゴリズムを備えた `Machine Learning Platform for AI` は、データラベリング (`PAI-iTAG`)、モデル構築 (`PAI-Designer` と `PAI-DSW`)、モデルトレーニング (`PAI-DLC`)、コンパイル最適化、推論デプロイ (`PAI-EAS`) など、AIエンジニアリング全体のプロセス機能を提供しています。 `PAI-EAS` は、CPUやGPUなどのさまざまなハードウェアリソースをサポートし、高スループットと低レイテンシを特徴としています。数回のクリックで大規模な複雑なモデルをデプロイでき、リアルタイムでのエラスティックなスケールインとスケールアウトが可能です。また、包括的な運用管理とモニタリングシステムも提供しています。

```python
from langchain.chains import LLMChain
from langchain_community.llms.pai_eas_endpoint import PaiEasEndpoint
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

EAS LLMを使用するには、まずEASサービスを設定する必要があります。EASサービスが起動すると、`EAS_SERVICE_URL`と`EAS_SERVICE_TOKEN`を取得できます。詳細については、https://www.alibabacloud.com/help/en/pai/user-guide/service-deployment/ を参照してください。

```python
import os

os.environ["EAS_SERVICE_URL"] = "Your_EAS_Service_URL"
os.environ["EAS_SERVICE_TOKEN"] = "Your_EAS_Service_Token"
llm = PaiEasEndpoint(
    eas_service_url=os.environ["EAS_SERVICE_URL"],
    eas_service_token=os.environ["EAS_SERVICE_TOKEN"],
)
```

```python
llm_chain = prompt | llm

question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"
llm_chain.invoke({"question": question})
```

```output
'  Thank you for asking! However, I must respectfully point out that the question contains an error. Justin Bieber was born in 1994, and the Super Bowl was first played in 1967. Therefore, it is not possible for any NFL team to have won the Super Bowl in the year Justin Bieber was born.\n\nI hope this clarifies things! If you have any other questions, please feel free to ask.'
```
