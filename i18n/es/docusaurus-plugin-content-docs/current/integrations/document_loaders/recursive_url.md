---
translated: true
---

# URL recursivo

Es posible que queramos procesar todas las URL bajo un directorio raíz.

Por ejemplo, echemos un vistazo a la [Documentación de Python 3.9](https://docs.python.org/3.9/).

Esto tiene muchas páginas secundarias interesantes que es posible que queramos leer en bloque.

Por supuesto, el `WebBaseLoader` puede cargar una lista de páginas.

Pero, ¡el desafío es recorrer el árbol de páginas secundarias y realmente ensamblar esa lista!

Hacemos esto usando el `RecursiveUrlLoader`.

Esto también nos da la flexibilidad de excluir algunos hijos, personalizar el extractor y más.

# Parámetros

- url: str, la URL objetivo para rastrear.
- exclude_dirs: Optional[str], directorios de páginas web a excluir.
- use_async: Optional[bool], si usar solicitudes asincrónicas, usar solicitudes asincrónicas suele ser más rápido en tareas grandes. Sin embargo, async desactivará la función de carga diferida (la función aún funciona, pero no es diferida). De forma predeterminada, se establece en False.
- extractor: Optional[Callable[[str], str]], una función para extraer el texto del documento de la página web, de forma predeterminada devuelve la página tal como está. Se recomienda usar herramientas como goose3 y beautifulsoup para extraer el texto. De forma predeterminada, simplemente devuelve la página tal como está.
- max_depth: Optional[int] = None, la profundidad máxima para rastrear. De forma predeterminada, se establece en 2. Si necesita rastrear todo el sitio web, establézcalo en un número lo suficientemente grande como para hacer el trabajo.
- timeout: Optional[int] = None, el tiempo de espera para cada solicitud, en segundos. De forma predeterminada, se establece en 10.
- prevent_outside: Optional[bool] = None, si se debe evitar el rastreo fuera de la URL raíz. De forma predeterminada, se establece en True.

```python
from langchain_community.document_loaders.recursive_url_loader import RecursiveUrlLoader
```

Probemos un ejemplo sencillo.

```python
from bs4 import BeautifulSoup as Soup

url = "https://docs.python.org/3.9/"
loader = RecursiveUrlLoader(
    url=url, max_depth=2, extractor=lambda x: Soup(x, "html.parser").text
)
docs = loader.load()
```

```python
docs[0].page_content[:50]
```

```output
'\n\n\n\n\nPython Frequently Asked Questions — Python 3.'
```

```python
docs[-1].metadata
```

```output
{'source': 'https://docs.python.org/3.9/library/index.html',
 'title': 'The Python Standard Library — Python 3.9.17 documentation',
 'language': None}
```

Sin embargo, como es difícil realizar un filtro perfecto, es posible que aún vea algunos resultados irrelevantes en los resultados. Puede realizar un filtro en los documentos devueltos usted mismo, si es necesario. La mayoría de las veces, los resultados devueltos son lo suficientemente buenos.

Prueba en la documentación de LangChain.

```python
url = "https://js.langchain.com/docs/modules/memory/integrations/"
loader = RecursiveUrlLoader(url=url)
docs = loader.load()
len(docs)
```

```output
8
```
