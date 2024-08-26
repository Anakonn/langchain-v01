---
translated: true
---

# UpTrain

>[UpTrain](https://uptrain.ai/) は、Generative AI アプリケーションを評価および改善するためのオープンソースの統一プラットフォームです。20 を超える事前設定された評価（言語、コード、埋め込み使用例をカバー）を提供し、障害ケースの根本原因分析を行い、それらを解決する方法についての洞察を提供します。

## インストールとセットアップ

```bash
pip install uptrain
```

## コールバック

```python
<!--IMPORTS:[{"imported": "UpTrainCallbackHandler", "source": "langchain_community.callbacks.uptrain_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.uptrain_callback.UpTrainCallbackHandler.html", "title": "UpTrain"}]-->
from langchain_community.callbacks.uptrain_callback import UpTrainCallbackHandler
```

[例](/docs/integrations/callbacks/uptrain)を参照してください。
