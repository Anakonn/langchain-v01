---
translated: true
---

# Arxiv

>[arXiv](https://arxiv.org/)는 물리학, 수학, 컴퓨터 과학, 정량 생물학, 정량 금융, 통계, 전기 공학 및 시스템 과학, 경제학 분야의 200만 개의 학술 논문을 제공하는 오픈 액세스 아카이브입니다.

이 노트북에서는 `Arxiv.org`에서 과학 논문을 불러와 이후 사용할 수 있는 문서 형식으로 로드하는 방법을 보여줍니다.

## 설치

먼저 `arxiv` 파이썬 패키지를 설치해야 합니다.

```python
%pip install --upgrade --quiet  arxiv
```

다음으로 `PyMuPDF` 파이썬 패키지를 설치해야 합니다. 이 패키지는 `arxiv.org` 사이트에서 다운로드한 PDF 파일을 텍스트 형식으로 변환합니다.

```python
%pip install --upgrade --quiet  pymupdf
```

## 예제

`ArxivLoader`에는 다음과 같은 인수가 있습니다:

- `query`: Arxiv에서 문서를 찾는 데 사용되는 자유 텍스트

- 선택적 `load_max_docs`: 기본값=100. 다운로드할 문서 수를 제한하는 데 사용합니다. 100개의 문서를 모두 다운로드하는 데 시간이 걸리므로, 실험에는 작은 수를 사용하시기 바랍니다.

- 선택적 `load_all_available_meta`: 기본값=False. 기본적으로 가장 중요한 필드만 다운로드됩니다: `Published`(문서가 게시되거나 마지막으로 업데이트된 날짜), `Title`, `Authors`, `Summary`. True로 설정하면 다른 필드도 다운로드됩니다.

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

