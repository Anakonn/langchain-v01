---
translated: true
---

# BibTeX

>[BibTeX](https://www.ctan.org/pkg/bibtex) est un format de fichier et un système de gestion des références couramment utilisé conjointement avec la composition typographique `LaTeX`. Il sert à organiser et à stocker les informations bibliographiques pour les documents académiques et de recherche.

Les fichiers `BibTeX` ont une extension `.bib` et se composent d'entrées en texte brut représentant des références à diverses publications, telles que des livres, des articles, des communications de conférence, des thèses, etc. Chaque entrée `BibTeX` suit une structure spécifique et contient des champs pour différents détails bibliographiques comme les noms d'auteurs, le titre de la publication, le titre du journal ou du livre, l'année de publication, le numéro de pages, et plus encore.

Les fichiers BibTeX peuvent également stocker le chemin d'accès aux documents, tels que les fichiers `.pdf` qui peuvent être récupérés.

## Installation

Tout d'abord, vous devez installer `bibtexparser` et `PyMuPDF`.

```python
%pip install --upgrade --quiet  bibtexparser pymupdf
```

## Exemples

`BibtexLoader` a ces arguments :
- `file_path` : le chemin du fichier bibtex `.bib`
- facultatif `max_docs` : par défaut=None, c'est-à-dire sans limite. Utilisez-le pour limiter le nombre de documents récupérés.
- facultatif `max_content_chars` : par défaut=4000. Utilisez-le pour limiter le nombre de caractères dans un seul document.
- facultatif `load_extra_meta` : par défaut=False. Par défaut, seuls les champs les plus importants des entrées bibtex sont chargés : `Published` (année de publication), `Title`, `Authors`, `Summary`, `Journal`, `Keywords` et `URL`. Si True, il tentera également de charger les champs `entry_id`, `note`, `doi` et `links`.
- facultatif `file_pattern` : par défaut=`r'[^:]+\.pdf'`. Modèle regex pour trouver les fichiers dans l'entrée `file`. Le modèle par défaut prend en charge le style bibtex de `Zotero` et le chemin de fichier brut.

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
