---
translated: true
---

# リメンブロー

このページでは、LangChain内で[リメンブロー](https://remembrall.dev)エコシステムを使用する方法について説明します。

## リメンブローとは？

リメンブローは、数行のコードで言語モデルに長期記憶、リトリーバルオーグメンテッドジェネレーション（retrieval augmented generation）、および完全な可観測性を提供します。

![リクエスト統計とモデルの相互作用を示すリメンブローのダッシュボードのスクリーンショット。](/img/RemembrallDashboard.png "リメンブロードダッシュボードインターフェース")

これは、OpenAIコールの上に軽量のプロキシとして機能し、収集された関連情報でチャットコールのコンテキストを実行時に単に強化します。

## セットアップ

始めるには、[リメンブローのプラットフォームでGithubでサインイン](https://remembrall.dev/login)し、[設定ページからAPIキーをコピー](https://remembrall.dev/dashboard/settings)します。

変更された`openai_api_base`（以下を参照）とリメンブローAPIキーで送信される任意のリクエストは、リメンブローのダッシュボードで自動的に追跡されます。OpenAIキーを当プラットフォームと**共有する必要は一切ありません**し、この情報はリメンブローシステムによって**一切保存されません**。

これを行うには、以下の依存関係をインストールする必要があります：

```bash
pip install -U langchain-openai
```

### 長期記憶の有効化

`openai_api_base`および`x-gp-api-key`経由でリメンブローAPIキーを設定することに加えて、メモリを維持するためのUIDを指定する必要があります。これは通常、一意のユーザー識別子（メールアドレスなど）です。

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Remembrall"}]-->
from langchain_openai import ChatOpenAI
chat_model = ChatOpenAI(openai_api_base="https://remembrall.dev/api/openai/v1",
                        model_kwargs={
                            "headers":{
                                "x-gp-api-key": "remembrall-api-key-here",
                                "x-gp-remember": "user@email.com",
                            }
                        })

chat_model.predict("My favorite color is blue.")
import time; time.sleep(5)  # wait for system to save fact via auto save
print(chat_model.predict("What is my favorite color?"))
```

### リトリーバルオーグメンテッドジェネレーションの有効化

最初に、[リメンブローのダッシュボード](https://remembrall.dev/dashboard/spells)でドキュメントコンテキストを作成します。ドキュメントテキストを貼り付けるか、PDFとしてドキュメントをアップロードして処理します。ドキュメントコンテキストIDを保存し、以下のように挿入します。

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Remembrall"}]-->
from langchain_openai import ChatOpenAI
chat_model = ChatOpenAI(openai_api_base="https://remembrall.dev/api/openai/v1",
                        model_kwargs={
                            "headers":{
                                "x-gp-api-key": "remembrall-api-key-here",
                                "x-gp-context": "document-context-id-goes-here",
                            }
                        })

print(chat_model.predict("This is a question that can be answered with my document."))
```
