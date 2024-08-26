---
translated: true
---

# Arxiv

>[arXiv](https://arxiv.org/) は、物理学、数学、コンピューター科学、定量生物学、定量金融、統計学、電気工学、システム科学、経済学の分野で、200万件を超える学術論文を収録したオープンアクセスのアーカイブです。

このノートブックでは、`Arxiv.org`から科学論文をドキュメント形式でロードする方法を示します。

## インストール

まず、`arxiv`Pythonパッケージをインストールする必要があります。

```python
%pip install --upgrade --quiet  arxiv
```

次に、`Arxiv.org`サイトからダウンロードしたPDFファイルをテキスト形式に変換する`PyMuPDF`Pythonパッケージをインストールする必要があります。

```python
%pip install --upgrade --quiet  pymupdf
```

## 例

`ArxivLoader`には以下の引数があります:
- `query`: ドキュメントを検索するためのフリーテキスト
- オプションの`load_max_docs`: デフォルト=100。ダウンロードするドキュメントの数を制限するために使用します。100件全てをダウンロードするには時間がかかるため、実験には小さな数値を使用してください。
- オプションの`load_all_available_meta`: デフォルト=False。デフォルトでは、`Published`(ドキュメントが公開/最終更新された日付)、`Title`、`Authors`、`Summary`などの最も重要なフィールドのみがダウンロードされます。Trueの場合、他のフィールドもダウンロードされます。

```python
from langchain_community.document_loaders import ArxivLoader
```

```python
docs = ArxivLoader(query="1605.08386", load_max_docs=2).load()
len(docs)
```

```python
docs[0].metadata  # meta-information of the Document
```

```output
{'Published': '2016-05-26',
 'Title': 'Heat-bath random walks with Markov bases',
 'Authors': 'Caprice Stanley, Tobias Windisch',
 'Summary': 'Graphs on lattice points are studied whose edges come from a finite set of\nallowed moves of arbitrary length. We show that the diameter of these graphs on\nfibers of a fixed integer matrix can be bounded from above by a constant. We\nthen study the mixing behaviour of heat-bath random walks on these graphs. We\nalso state explicit conditions on the set of moves so that the heat-bath random\nwalk, a generalization of the Glauber dynamics, is an expander in fixed\ndimension.'}
```

```python
docs[0].page_content[:400]  # all pages of the Document content
```

```output
'arXiv:1605.08386v1  [math.CO]  26 May 2016\nHEAT-BATH RANDOM WALKS WITH MARKOV BASES\nCAPRICE STANLEY AND TOBIAS WINDISCH\nAbstract. Graphs on lattice points are studied whose edges come from a ﬁnite set of\nallowed moves of arbitrary length. We show that the diameter of these graphs on ﬁbers of a\nﬁxed integer matrix can be bounded from above by a constant. We then study the mixing\nbehaviour of heat-b'
```
