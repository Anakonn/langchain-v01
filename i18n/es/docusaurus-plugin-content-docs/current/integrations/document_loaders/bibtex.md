---
translated: true
---

# BibTeX

>[BibTeX](https://www.ctan.org/pkg/bibtex) es un formato de archivo y un sistema de gestión de referencias comúnmente utilizado junto con el sistema de composición tipográfica `LaTeX`. Sirve como una forma de organizar y almacenar información bibliográfica para documentos académicos e de investigación.

Los archivos `BibTeX` tienen una extensión `.bib` y consisten en entradas de texto plano que representan referencias a varias publicaciones, como libros, artículos, documentos de conferencias, tesis y más. Cada entrada `BibTeX` sigue una estructura específica y contiene campos para diferentes detalles bibliográficos como nombres de autores, título de publicación, título de revista o libro, año de publicación, números de página y más.

Los archivos BibTeX también pueden almacenar la ruta de los documentos, como archivos `.pdf` que se pueden recuperar.

## Instalación

Primero, necesitas instalar `bibtexparser` y `PyMuPDF`.

```python
%pip install --upgrade --quiet  bibtexparser pymupdf
```

## Ejemplos

`BibtexLoader` tiene estos argumentos:
- `file_path`: la ruta del archivo bibtex `.bib`
- opcional `max_docs`: predeterminado=None, es decir, sin límite. Úsalo para limitar el número de documentos recuperados.
- opcional `max_content_chars`: predeterminado=4000. Úsalo para limitar el número de caracteres en un solo documento.
- opcional `load_extra_meta`: predeterminado=False. De forma predeterminada, solo se cargan los campos más importantes de las entradas de bibtex: `Published` (año de publicación), `Title`, `Authors`, `Summary`, `Journal`, `Keywords` y `URL`. Si es True, también intentará cargar los campos `entry_id`, `note`, `doi` y `links`.
- opcional `file_pattern`: predeterminado=`r'[^:]+\.pdf'`. Patrón de expresión regular para encontrar archivos en la entrada `file`. El patrón predeterminado admite el estilo bibtex de `Zotero` y la ruta de archivo sin procesar.

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
