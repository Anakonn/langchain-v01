---
translated: true
---

# EPub

>[EPUB](https://en.wikipedia.org/wiki/EPUB) は、".epub"ファイル拡張子を使用する電子書籍ファイル形式です。この用語は、electronic publicationの略で、時にはePubと表記されます。`EPUB`は多くの電子書籍リーダーでサポートされており、ほとんどのスマートフォン、タブレット、コンピューターで互換性のあるソフトウェアが利用可能です。

これは、`.epub`文書をDocument形式にロードする方法について説明しています。このローダーを使用するには、[`pandoc`](https://pandoc.org/installing.html)パッケージをインストールする必要があります。

```python
%pip install --upgrade --quiet  pandoc
```

```python
from langchain_community.document_loaders import UnstructuredEPubLoader
```

```python
loader = UnstructuredEPubLoader("winter-sports.epub")
```

```python
data = loader.load()
```

## 要素の保持

内部的に、Unstructuredは、テキストの異なる部分に対して異なる "要素"を作成します。デフォルトでは、それらを組み合わせますが、`mode="elements"`を指定することで、その分離を簡単に維持できます。

```python
loader = UnstructuredEPubLoader("winter-sports.epub", mode="elements")
```

```python
data = loader.load()
```

```python
data[0]
```

```output
Document(page_content='The Project Gutenberg eBook of Winter Sports in\nSwitzerland, by E. F. Benson', lookup_str='', metadata={'source': 'winter-sports.epub', 'page_number': 1, 'category': 'Title'}, lookup_index=0)
```
