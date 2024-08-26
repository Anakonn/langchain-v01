---
translated: true
---

# LASER Language-Agnostic SEntence Representations Embeddings by Meta AI

>[LASER](https://github.com/facebookresearch/LASER/)は、Meta AI Research teamが開発したPythonライブラリで、2024年2月25日時点で147以上の言語の多言語センテンスエンベディングを作成するために使用されています。
>- サポートされている言語のリストは https://github.com/facebookresearch/flores/blob/main/flores200/README.md#languages-in-flores-200 にあります。

## 依存関係

LaserEmbedをLangChainで使用するには、`laser_encoders`Pythonパッケージをインストールする必要があります。

```python
%pip install laser_encoders
```

## インポート

```python
from langchain_community.embeddings.laser import LaserEmbeddings
```

## Laserのインスタンス化

### パラメータ

- `lang: Optional[str]`
    >空の場合、多言語LASER encoderモデル("laser2")を使用するようにデフォルトされます。
    サポートされている言語とlang_codesのリストは[ここ](https://github.com/facebookresearch/flores/blob/main/flores200/README.md#languages-in-flores-200)と[ここ](https://github.com/facebookresearch/LASER/blob/main/laser_encoders/language_list.py)にあります。

```python
# Ex Instantiationz
embeddings = LaserEmbeddings(lang="eng_Latn")
```

## 使用方法

### ドキュメントエンベディングの生成

```python
document_embeddings = embeddings.embed_documents(
    ["This is a sentence", "This is some other sentence"]
)
```

### クエリエンベディングの生成

```python
query_embeddings = embeddings.embed_query("This is a query")
```
