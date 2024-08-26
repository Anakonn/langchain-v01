---
translated: true
---

# BibTeX

>[BibTeX](https://www.ctan.org/pkg/bibtex)는 `LaTeX` 타이포그래피와 함께 사용되는 파일 형식 및 참고 문헌 관리 시스템입니다. 이는 학술 및 연구 문서의 서지 정보를 구성하고 저장하는 방법입니다.

`BibTeX` 파일은 `.bib` 확장자를 가지며 책, 논문, 학회 논문, 학위 논문 등 다양한 출판물에 대한 참고 문헌 정보를 나타내는 일반 텍스트 항목으로 구성됩니다. 각 `BibTeX` 항목은 특정 구조를 따르며 저자 이름, 출판물 제목, 저널 또는 책 제목, 출판 연도, 페이지 번호 등 다양한 서지 정보 필드를 포함합니다.

BibTeX 파일에는 `.pdf` 파일과 같은 문서의 경로도 저장할 수 있습니다.

## 설치

먼저 `bibtexparser`와 `PyMuPDF`를 설치해야 합니다.  

```python
%pip install --upgrade --quiet  bibtexparser pymupdf
```

## 예시

`BibtexLoader`에는 다음과 같은 인수가 있습니다:
- `file_path`: `.bib` bibtex 파일의 경로
- 선택적 `max_docs`: 기본값=None, 즉 제한 없음. 검색된 문서 수를 제한하는 데 사용합니다.
- 선택적 `max_content_chars`: 기본값=4000. 단일 문서의 문자 수를 제한하는 데 사용합니다.
- 선택적 `load_extra_meta`: 기본값=False. 기본적으로 bibtex 항목에서 가장 중요한 필드만 로드합니다: `Published`(발행 연도), `Title`, `Authors`, `Summary`, `Journal`, `Keywords`, 및 `URL`. True인 경우 `entry_id`, `note`, `doi`, 및 `links` 필드도 로드하려고 시도합니다.
- 선택적 `file_pattern`: 기본값=`r'[^:]+\.pdf'`. `file` 항목에서 파일을 찾는 정규식 패턴. 기본 패턴은 `Zotero` 스타일 bibtex와 단순 파일 경로를 지원합니다.


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

