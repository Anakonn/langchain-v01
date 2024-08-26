---
translated: true
---

# BibTeX

>[BibTeX](https://www.ctan.org/pkg/bibtex)は、`LaTeX`組版と一緒に使われる一般的なファイル形式とリファレンス管理システムです。学術および研究文書の書誌情報を整理およびストアする方法として機能します。

`BibTeX`ファイルは`.bib`拡張子を持ち、書籍、論文、会議論文、学位論文など、さまざまな出版物の参考文献を表す平文のエントリーで構成されています。各`BibTeX`エントリーは特定の構造に従い、著者名、出版タイトル、ジャーナルまたは書籍タイトル、出版年、ページ数など、さまざまな書誌情報のフィールドを含んでいます。

BibTeXファイルには、`.pdf`ファイルなどのドキュメントへのパスも保存できます。

## インストール

まず、`bibtexparser`と`PyMuPDF`をインストールする必要があります。

```python
%pip install --upgrade --quiet  bibtexparser pymupdf
```

## 例

`BibtexLoader`には以下の引数があります:
- `file_path`: `.bib`BibTeXファイルのパス
- オプションの`max_docs`: デフォルトはNone、つまり制限なし。取得するドキュメントの数を制限するのに使用します。
- オプションの`max_content_chars`: デフォルトは4000。単一のドキュメントの文字数を制限するのに使用します。
- オプションの`load_extra_meta`: デフォルトはFalse。デフォルトでは、`Published`(出版年)、`Title`、`Authors`、`Summary`、`Journal`、`Keywords`、`URL`などの最も重要なフィールドのみが読み込まれます。Trueの場合、`entry_id`、`note`、`doi`、`links`フィールドも読み込もうとします。
- オプションの`file_pattern`: デフォルトは`r'[^:]+\.pdf'`。`file`エントリーでファイルを見つけるための正規表現パターン。デフォルトのパターンは`Zotero`フレーバーのBibTeXスタイルと単純なファイルパスをサポートします。

```python
from langchain_community.document_loaders import BibtexLoader
```

```python
# Create a dummy bibtex file and download a pdf.
import urllib.request

urllib.request.urlretrieve(
    "https://www.fourmilab.ch/etexts/einstein/specrel/specrel.pdf", "einstein1905.pdf"
)

bibtex_text = """
    @article{einstein1915,
        title={Die Feldgleichungen der Gravitation},
        abstract={Die Grundgleichungen der Gravitation, die ich hier entwickeln werde, wurden von mir in einer Abhandlung: ,,Die formale Grundlage der allgemeinen Relativit{\"a}tstheorie`` in den Sitzungsberichten der Preu{\ss}ischen Akademie der Wissenschaften 1915 ver{\"o}ffentlicht.},
        author={Einstein, Albert},
        journal={Sitzungsberichte der K{\"o}niglich Preu{\ss}ischen Akademie der Wissenschaften},
        volume={1915},
        number={1},
        pages={844--847},
        year={1915},
        doi={10.1002/andp.19163540702},
        link={https://onlinelibrary.wiley.com/doi/abs/10.1002/andp.19163540702},
        file={einstein1905.pdf}
    }
    """
# save bibtex_text to biblio.bib file
with open("./biblio.bib", "w") as file:
    file.write(bibtex_text)
```

```python
docs = BibtexLoader("./biblio.bib").load()
```

```python
docs[0].metadata
```

```output
{'id': 'einstein1915',
 'published_year': '1915',
 'title': 'Die Feldgleichungen der Gravitation',
 'publication': 'Sitzungsberichte der K{"o}niglich Preu{\\ss}ischen Akademie der Wissenschaften',
 'authors': 'Einstein, Albert',
 'abstract': 'Die Grundgleichungen der Gravitation, die ich hier entwickeln werde, wurden von mir in einer Abhandlung: ,,Die formale Grundlage der allgemeinen Relativit{"a}tstheorie`` in den Sitzungsberichten der Preu{\\ss}ischen Akademie der Wissenschaften 1915 ver{"o}ffentlicht.',
 'url': 'https://doi.org/10.1002/andp.19163540702'}
```

```python
print(docs[0].page_content[:400])  # all pages of the pdf content
```

```output
ON THE ELECTRODYNAMICS OF MOVING
BODIES
By A. EINSTEIN
June 30, 1905
It is known that Maxwell’s electrodynamics—as usually understood at the
present time—when applied to moving bodies, leads to asymmetries which do
not appear to be inherent in the phenomena. Take, for example, the recipro-
cal electrodynamic action of a magnet and a conductor. The observable phe-
nomenon here depends only on the r
```
