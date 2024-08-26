---
translated: true
---

# Wolfram Alpha

このノートブックでは、Wolfram Alphaコンポーネントの使用方法について説明します。

まず、Wolfram Alphaの開発者アカウントを設定し、APP IDを取得する必要があります:

1. Wolfram Alphaにアクセスし、開発者アカウントに登録します[here](https://developer.wolframalpha.com/)
2. アプリを作成し、APP IDを取得します
3. pip install wolframalpha

次に、いくつかの環境変数を設定する必要があります:
1. APP IDを WOLFRAM_ALPHA_APPID 環境変数に保存します

```python
pip install wolframalpha
```

```python
import os

os.environ["WOLFRAM_ALPHA_APPID"] = ""
```

```python
from langchain_community.utilities.wolfram_alpha import WolframAlphaAPIWrapper
```

```python
wolfram = WolframAlphaAPIWrapper()
```

```python
wolfram.run("What is 2x+5 = -3x + 7?")
```

```output
'x = 2/5'
```
