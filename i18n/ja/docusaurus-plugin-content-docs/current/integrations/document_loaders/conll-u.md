---
translated: true
---

# CoNLL-U

>[CoNLL-U](https://universaldependencies.org/format.html) は CoNLL-X フォーマットの改訂版です。注釈は平文のテキストファイル (UTF-8、NFC に正規化、LF 文字のみを改行文字として使用、ファイルの最後にも LF 文字を含む) に符号化されており、3 種類の行があります:
>- 単語行には、単語/トークンの注釈が 10 個のフィールドに区切られて含まれています。詳細は以下を参照してください。
>- 空行は文の境界を示します。
>- コメント行は # で始まります。

これは [CoNLL-U](https://universaldependencies.org/format.html) フォーマットのファイルを読み込む方法の例です。ファイル全体が 1 つのドキュメントとして扱われます。サンプルデータ (`conllu.conllu`) は標準の UD/CoNLL-U の例の 1 つに基づいています。

```python
from langchain_community.document_loaders import CoNLLULoader
```

```python
loader = CoNLLULoader("example_data/conllu.conllu")
```

```python
document = loader.load()
```

```python
document
```

```output
[Document(page_content='They buy and sell books.', metadata={'source': 'example_data/conllu.conllu'})]
```
