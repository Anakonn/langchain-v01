---
translated: true
---

# Exa 検索

Exa の検索統合は、独自の[パートナーパッケージ](https://pypi.org/project/langchain-exa/)にあります。以下でインストールできます:

```python
%pip install -qU langchain-exa
```

このパッケージを使用するには、`EXA_API_KEY`環境変数にも Exa API キーを設定する必要があります。

## Retriever

[`ExaSearchRetriever`](/docs/integrations/tools/exa_search#using-exasearchretriever)を標準の検索パイプラインで使用できます。以下のようにインポートできます:

```python
from langchain_exa import ExaSearchRetriever
```

## ツール

[Exa ツールの呼び出しドキュメント](/docs/integrations/tools/exa_search#using-the-exa-sdk-as-langchain-agent-tools)に記載されているように、Exa をエージェントツールとして使用できます。
