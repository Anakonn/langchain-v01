---
sidebar_label: Upstage
translated: true
---

# Upstage Groundedness Check

このノートブックでは、Upstage groundedness checkモデルの使い始め方について説明します。

## インストール

`langchain-upstage`パッケージをインストールします。

```bash
pip install -U langchain-upstage
```

## 環境設定

以下の環境変数を設定してください:

- `UPSTAGE_API_KEY`: [Upstage developers document](https://developers.upstage.ai/docs/getting-started/quick-start)から取得したUpstage APIキー

```python
import os

os.environ["UPSTAGE_API_KEY"] = "YOUR_API_KEY"
```

## 使用方法

`UpstageGroundednessCheck`クラスを初期化します。

```python
from langchain_upstage import UpstageGroundednessCheck

groundedness_check = UpstageGroundednessCheck()
```

`run`メソッドを使用して、入力テキストの groundedness をチェックします。

```python
request_input = {
    "context": "Mauna Kea is an inactive volcano on the island of Hawai'i. Its peak is 4,207.3 m above sea level, making it the highest point in Hawaii and second-highest peak of an island on Earth.",
    "answer": "Mauna Kea is 5,207.3 meters tall.",
}

response = groundedness_check.invoke(request_input)
print(response)
```
