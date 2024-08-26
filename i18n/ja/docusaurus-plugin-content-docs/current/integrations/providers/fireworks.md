---
translated: true
---

# 花火

このページでは、Langchain 内の [Fireworks](https://fireworks.ai/) モデルの使用方法について説明します。

## インストールとセットアップ

- Fireworks 統合パッケージをインストールします。

  ```
  pip install langchain-fireworks
  ```

- [fireworks.ai](https://fireworks.ai) に登録して Fireworks API キーを取得します。
- `FIREWORKS_API_KEY` 環境変数を設定して認証します。

## 認証

Fireworks API キーを使用して認証する方法は 2 つあります:

1.  `FIREWORKS_API_KEY` 環境変数を設定する。

    ```python
    os.environ["FIREWORKS_API_KEY"] = "<KEY>"
    ```

2.  Fireworks LLM モジュールの `api_key` フィールドを設定する。

    ```python
    llm = Fireworks(api_key="<KEY>")
    ```

## Fireworks LLM モジュールの使用

Fireworks は LLM モジュールを通じて Langchain と統合されています。この例では、mixtral-8x7b-instruct モデルを使用します。

```python
<!--IMPORTS:[{"imported": "Fireworks", "source": "langchain_fireworks", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_fireworks.llms.Fireworks.html", "title": "Fireworks"}]-->
from langchain_fireworks import Fireworks

llm = Fireworks(
    api_key="<KEY>",
    model="accounts/fireworks/models/mixtral-8x7b-instruct",
    max_tokens=256)
llm("Name 3 sports.")
```

詳細なチュートリアルは [こちら](/docs/integrations/llms/Fireworks) をご覧ください。
