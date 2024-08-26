---
translated: true
---

# Sopa Hermosa

>[Sopa Hermosa](https://www.crummy.com/software/BeautifulSoup/) es un paquete de Python para analizar
> documentos HTML y XML (incluyendo tener marcado malformado, es decir, etiquetas no cerradas, por lo que se llama sopa de etiquetas).
> Crea un árbol de análisis para las páginas analizadas que se puede usar para extraer datos de HTML,[3] lo cual
> es útil para el raspado web.

`Sopa Hermosa` ofrece un control detallado sobre el contenido HTML, lo que permite la extracción, eliminación y limpieza específica de etiquetas.

Es adecuado para los casos en los que desea extraer información específica y limpiar el contenido HTML de acuerdo con sus necesidades.

Por ejemplo, podemos raspar el contenido de texto dentro de las etiquetas `<p>, <li>, <div> y <a>` del contenido HTML:

* `<p>`: La etiqueta de párrafo. Define un párrafo en HTML y se usa para agrupar oraciones y/o frases relacionadas.

* `<li>`: La etiqueta de elemento de lista. Se usa dentro de listas ordenadas (`<ol>`) y listas desordenadas (`<ul>`) para definir elementos individuales dentro de la lista.

* `<div>`: La etiqueta de división. Es un elemento de nivel de bloque utilizado para agrupar otros elementos en línea o de nivel de bloque.

* `<a>`: La etiqueta de anclaje. Se usa para definir hipervínculos.

```python
from langchain_community.document_loaders import AsyncChromiumLoader
from langchain_community.document_transformers import BeautifulSoupTransformer

# Load HTML
loader = AsyncChromiumLoader(["https://www.wsj.com"])
html = loader.load()
```

```python
# Transform
bs_transformer = BeautifulSoupTransformer()
docs_transformed = bs_transformer.transform_documents(
    html, tags_to_extract=["p", "li", "div", "a"]
)
```

```python
docs_transformed[0].page_content[0:500]
```

```output
'Conservative legal activists are challenging Amazon, Comcast and others using many of the same tools that helped kill affirmative-action programs in colleges.1,2099 min read U.S. stock indexes fell and government-bond prices climbed, after Moody’s lowered credit ratings for 10 smaller U.S. banks and said it was reviewing ratings for six larger ones. The Dow industrials dropped more than 150 points.3 min read Penn Entertainment’s Barstool Sportsbook app will be rebranded as ESPN Bet this fall as '
```
