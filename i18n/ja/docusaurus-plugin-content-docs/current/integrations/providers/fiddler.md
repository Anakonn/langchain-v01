---
translated: true
---

# フィドラー

>[フィドラー](https://www.fiddler.ai/) は、エンタープライズ規模でMLのデプロイメントを監視、説明、分析、改善するための統一プラットフォームを提供します。

## インストールとセットアップ

モデルを[フィドラーでセットアップ](https://demo.fiddler.ai)します：

* フィドラーに接続するためのURL
* 組織ID
* 認証トークン

Pythonパッケージをインストールします：

```bash
pip install fiddler-client
```

## コールバック

```python
<!--IMPORTS:[{"imported": "FiddlerCallbackHandler", "source": "langchain_community.callbacks.fiddler_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.fiddler_callback.FiddlerCallbackHandler.html", "title": "Fiddler"}]-->
from langchain_community.callbacks.fiddler_callback import FiddlerCallbackHandler
```

[例](/docs/integrations/callbacks/fiddler)を参照してください。
