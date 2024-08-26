---
translated: true
---

# Mapa del sitio

El `SitemapLoader` se extiende del `WebBaseLoader` y carga un mapa del sitio desde una URL dada, y luego raspa y carga todas las páginas en el mapa del sitio, devolviendo cada página como un Documento.

El raspado se realiza de forma concurrente. Existen límites razonables a las solicitudes concurrentes, que por defecto son de 2 por segundo. Si no le preocupa ser un buen ciudadano, o controla el servidor raspado, o no le importa la carga. Tenga en cuenta que, si bien esto acelerará el proceso de raspado, puede hacer que el servidor lo bloquee. ¡Ten cuidado!

```python
%pip install --upgrade --quiet  nest_asyncio
```

```python
# fixes a bug with asyncio and jupyter
import nest_asyncio

nest_asyncio.apply()
```

```python
from langchain_community.document_loaders.sitemap import SitemapLoader
```

```python
sitemap_loader = SitemapLoader(web_path="https://api.python.langchain.com/sitemap.xml")

docs = sitemap_loader.load()
```

Puede cambiar el parámetro `requests_per_second` para aumentar el número máximo de solicitudes concurrentes y usar `requests_kwargs` para pasar kwargs al enviar solicitudes.

```python
sitemap_loader.requests_per_second = 2
# Optional: avoid `[SSL: CERTIFICATE_VERIFY_FAILED]` issue
sitemap_loader.requests_kwargs = {"verify": False}
```

```python
docs[0]
```

```output
Document(page_content='\n\n\n\n\n\n\n\n\n\nLangChain Python API Reference Documentation.\n\n\nYou will be automatically redirected to the new location of this page.\n\n', metadata={'source': 'https://api.python.langchain.com/en/stable/', 'loc': 'https://api.python.langchain.com/en/stable/', 'lastmod': '2024-02-09T01:10:49.422114+00:00', 'changefreq': 'weekly', 'priority': '1'})
```

## Filtrar URLs del mapa del sitio

Los mapas del sitio pueden ser archivos masivos, con miles de URLs. A menudo no necesitas cada una de ellas. Puedes filtrar las URLs pasando una lista de cadenas o patrones de expresiones regulares al parámetro `filter_urls`. Solo se cargarán las URLs que coincidan con uno de los patrones.

```python
loader = SitemapLoader(
    web_path="https://api.python.langchain.com/sitemap.xml",
    filter_urls=["https://api.python.langchain.com/en/latest"],
)
documents = loader.load()
```

```python
documents[0]
```

```output
Document(page_content='\n\n\n\n\n\n\n\n\n\nLangChain Python API Reference Documentation.\n\n\nYou will be automatically redirected to the new location of this page.\n\n', metadata={'source': 'https://api.python.langchain.com/en/latest/', 'loc': 'https://api.python.langchain.com/en/latest/', 'lastmod': '2024-02-12T05:26:10.971077+00:00', 'changefreq': 'daily', 'priority': '0.9'})
```

## Agregar reglas de raspado personalizadas

El `SitemapLoader` usa `beautifulsoup4` para el proceso de raspado y raspa todos los elementos de la página de forma predeterminada. El constructor de `SitemapLoader` acepta una función de raspado personalizada. Esta función puede ser útil para adaptar el proceso de raspado a tus necesidades específicas; por ejemplo, es posible que desees evitar raspar encabezados o elementos de navegación.

 El siguiente ejemplo muestra cómo desarrollar y usar una función personalizada para evitar elementos de navegación y encabezado.

Importa la biblioteca `beautifulsoup4` y define la función personalizada.

```python
pip install beautifulsoup4
```

```python
from bs4 import BeautifulSoup


def remove_nav_and_header_elements(content: BeautifulSoup) -> str:
    # Find all 'nav' and 'header' elements in the BeautifulSoup object
    nav_elements = content.find_all("nav")
    header_elements = content.find_all("header")

    # Remove each 'nav' and 'header' element from the BeautifulSoup object
    for element in nav_elements + header_elements:
        element.decompose()

    return str(content.get_text())
```

Agrega tu función personalizada al objeto `SitemapLoader`.

```python
loader = SitemapLoader(
    "https://api.python.langchain.com/sitemap.xml",
    filter_urls=["https://api.python.langchain.com/en/latest/"],
    parsing_function=remove_nav_and_header_elements,
)
```

## Mapa del sitio local

El cargador de mapas del sitio también se puede usar para cargar archivos locales.

```python
sitemap_loader = SitemapLoader(web_path="example_data/sitemap.xml", is_local=True)

docs = sitemap_loader.load()
```
