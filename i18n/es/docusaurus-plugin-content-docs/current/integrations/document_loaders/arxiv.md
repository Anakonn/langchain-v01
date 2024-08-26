---
translated: true
---

# Arxiv

>[arXiv](https://arxiv.org/) es un archivo de acceso abierto para 2 millones de artículos académicos en los campos de física, matemáticas, ciencias de la computación, biología cuantitativa, finanzas cuantitativas, estadística, ingeniería eléctrica y sistemas científicos, y economía.

Este cuaderno muestra cómo cargar artículos científicos de `Arxiv.org` en un formato de documento que podemos usar posteriormente.

## Instalación

Primero, necesitas instalar el paquete de python `arxiv`.

```python
%pip install --upgrade --quiet  arxiv
```

Segundo, necesitas instalar el paquete de python `PyMuPDF` que transforma los archivos PDF descargados del sitio `arxiv.org` en el formato de texto.

```python
%pip install --upgrade --quiet  pymupdf
```

## Ejemplos

`ArxivLoader` tiene estos argumentos:
- `query`: texto libre que se usa para encontrar documentos en Arxiv
- opcional `load_max_docs`: predeterminado=100. Úsalo para limitar el número de documentos descargados. Toma tiempo descargar los 100 documentos, así que usa un número pequeño para experimentos.
- opcional `load_all_available_meta`: predeterminado=False. De forma predeterminada, solo se descargan los campos más importantes: `Published` (fecha en que se publicó/actualizó el documento), `Title`, `Authors`, `Summary`. Si es True, también se descargan otros campos.

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
