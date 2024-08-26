---
translated: true
---

# Browserbase

[Browserbase](https://browserbase.com)は、ヘッドレスブラウザを実行するためのサーバーレスプラットフォームで、高度なデバッグ、セッション録画、ステルスモード、統合プロキシ、キャプチャ解決を提供しています。

## インストール

- [browserbase.com](https://browserbase.com)からAPIキーを取得し、環境変数(`BROWSERBASE_API_KEY`)に設定します。
- [Browserbase SDK](http://github.com/browserbase/python-sdk)をインストールします:

```python
% pip install browserbase
```

## ドキュメントの読み込み

LangChainを使ってウェブページを読み込むには、`BrowserbaseLoader`を使うことができます。オプションで、`text_content`パラメーターを設定して、ページをテキストのみの表現に変換することもできます。

```python
from langchain_community.document_loaders import BrowserbaseLoader
```

```python
loader = BrowserbaseLoader(
    urls=[
        "https://example.com",
    ],
    # Text mode
    text_content=False,
)

docs = loader.load()
print(docs[0].page_content[:61])
```

## 画像の読み込み

マルチモーダルモデルのために、ウェブページのスクリーンショット(バイト単位)を読み込むこともできます。

GPT-4Vを使った完全な例:

```python
from browserbase import Browserbase
from browserbase.helpers.gpt4 import GPT4VImage, GPT4VImageDetail
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model="gpt-4-vision-preview", max_tokens=256)
browser = Browserbase()

screenshot = browser.screenshot("https://browserbase.com")

result = chat.invoke(
    [
        HumanMessage(
            content=[
                {"type": "text", "text": "What color is the logo?"},
                GPT4VImage(screenshot, GPT4VImageDetail.auto),
            ]
        )
    ]
)

print(result.content)
```
