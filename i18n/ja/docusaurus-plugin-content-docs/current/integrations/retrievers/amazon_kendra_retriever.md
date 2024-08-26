---
translated: true
---

# Amazon Kendra

> [Amazon Kendra](https://docs.aws.amazon.com/kendra/latest/dg/what-is-kendra.html)は、`Amazon Web Services`(`AWS`)が提供する高度な検索サービスです。自然言語処理(NLP)とマシンラーニングのアルゴリズムを活用し、組織内の様々なデータソースにわたる強力な検索機能を実現しています。`Kendra`は、ユーザーが必要な情報を迅速かつ正確に見つけられるよう設計されており、生産性と意思決定の向上に役立ちます。

> `Kendra`を使えば、文書、FAQ、ナレッジベース、マニュアル、ウェブサイトなど、さまざまなコンテンツタイプを検索できます。複数の言語に対応し、複雑なクエリ、同義語、文脈的な意味を理解して、高い関連性の検索結果を提供します。

## Amazon Kendra インデックスリトリーバーの使用

```python
%pip install --upgrade --quiet  boto3
```

```python
from langchain_community.retrievers import AmazonKendraRetriever
```

新しいリトリーバーの作成

```python
retriever = AmazonKendraRetriever(index_id="c0806df7-e76b-4bce-9b5c-d5582f6b1a03")
```

これでKendraインデックスから取得したドキュメントを使用できます。

```python
retriever.invoke("what is langchain")
```
