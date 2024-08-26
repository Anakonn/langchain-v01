---
translated: true
---

# Roam

>[ROAM](https://roamresearch.com/)は、個人的な知識ベースを作成するように設計された、ネットワーク化された思考のためのノートテイクツールです。

このノートブックでは、Roamデータベースからドキュメントを読み込む方法について説明します。これは、[ここ](https://github.com/JimmyLv/roam-qa)にあるサンプルリポジトリから多くのインスピレーションを得ています。

## 🧑 独自のデータセットを取り込むための手順

Roam Researchからデータセットをエクスポートします。これは、右上の3つのドットをクリックし、`エクスポート`をクリックすることで行えます。

エクスポートする際は、`Markdown & CSV`形式オプションを選択してください。

これにより、ダウンロードフォルダーに`.zip`ファイルが生成されます。`.zip`ファイルをこのリポジトリに移動してください。

以下のコマンドを実行して、zipファイルを解凍してください(必要に応じて`Export...`を自分のファイル名に置き換えてください)。

```shell
unzip Roam-Export-1675782732639.zip -d Roam_DB
```

```python
from langchain_community.document_loaders import RoamLoader
```

```python
loader = RoamLoader("Roam_DB")
```

```python
docs = loader.load()
```
