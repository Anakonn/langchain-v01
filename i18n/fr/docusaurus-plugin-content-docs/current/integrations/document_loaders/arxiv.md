---
translated: true
---

# Arxiv

>[arXiv](https://arxiv.org/) est une archive en libre accès pour 2 millions d'articles savants dans les domaines de la physique, des mathématiques, de l'informatique, de la biologie quantitative, de la finance quantitative, des statistiques, de l'ingénierie électrique et des systèmes, et de l'économie.

Ce notebook montre comment charger des articles scientifiques à partir de `Arxiv.org` dans un format de document que nous pouvons utiliser par la suite.

## Installation

Tout d'abord, vous devez installer le package python `arxiv`.

```python
%pip install --upgrade --quiet  arxiv
```

Deuxièmement, vous devez installer le package python `PyMuPDF` qui transforme les fichiers PDF téléchargés à partir du site `arxiv.org` dans le format texte.

```python
%pip install --upgrade --quiet  pymupdf
```

## Exemples

`ArxivLoader` a ces arguments :
- `query` : texte libre utilisé pour trouver des documents dans Arxiv
- facultatif `load_max_docs` : par défaut=100. Utilisez-le pour limiter le nombre de documents téléchargés. Il faut du temps pour télécharger les 100 documents, donc utilisez un petit nombre pour les expériences.
- facultatif `load_all_available_meta` : par défaut=False. Par défaut, seuls les champs les plus importants sont téléchargés : `Published` (date de publication/dernière mise à jour du document), `Title`, `Authors`, `Summary`. Si True, d'autres champs sont également téléchargés.

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
