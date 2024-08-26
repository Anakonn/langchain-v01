---
translated: true
---

# Yuque

>[Yuque](https://www.yuque.com/)は、チームでドキュメントを共同作成するための専門的なクラウドベースのナレッジベースです。

このノートブックでは、`Yuque`からドキュメントを読み込む方法を説明します。

[個人設定](https://www.yuque.com/settings/tokens)ページの個人アバターをクリックすると、パーソナルアクセストークンを取得できます。

```python
from langchain_community.document_loaders import YuqueLoader
```

```python
loader = YuqueLoader(access_token="<your_personal_access_token>")
```

```python
docs = loader.load()
```
