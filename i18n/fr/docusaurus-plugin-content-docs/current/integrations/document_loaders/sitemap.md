---
translated: true
---

# Plan du site

Étend le `WebBaseLoader`, `SitemapLoader` charge un plan du site à partir d'une URL donnée, puis extrait et charge toutes les pages du plan du site, renvoyant chaque page sous forme de Document.

L'extraction se fait de manière concurrente. Il y a des limites raisonnables aux requêtes concurrentes, par défaut 2 par seconde. Si vous ne vous souciez pas d'être un bon citoyen, ou si vous contrôlez le serveur extrait, ou si vous ne vous souciez pas de la charge. Notez que cela accélérera le processus d'extraction, mais peut amener le serveur à vous bloquer. Soyez prudent !

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

Vous pouvez modifier le paramètre `requests_per_second` pour augmenter le nombre maximal de requêtes concurrentes. et utiliser `requests_kwargs` pour passer des arguments lors de l'envoi des requêtes.

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

## Filtrage des URL du plan du site

Les plans du site peuvent être des fichiers massifs, avec des milliers d'URL. Souvent, vous n'avez pas besoin de chacune d'entre elles. Vous pouvez filtrer les URL en passant une liste de chaînes de caractères ou de motifs réguliers au paramètre `filter_urls`. Seules les URL correspondant à l'un des motifs seront chargées.

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

## Ajout de règles d'extraction personnalisées

Le `SitemapLoader` utilise `beautifulsoup4` pour le processus d'extraction, et extrait par défaut tous les éléments de la page. Le constructeur de `SitemapLoader` accepte une fonction d'extraction personnalisée. Cette fonctionnalité peut être utile pour adapter le processus d'extraction à vos besoins spécifiques ; par exemple, vous pourriez vouloir éviter d'extraire les en-têtes ou les éléments de navigation.

L'exemple suivant montre comment développer et utiliser une fonction personnalisée pour éviter les éléments de navigation et d'en-tête.

Importez la bibliothèque `beautifulsoup4` et définissez la fonction personnalisée.

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

Ajoutez votre fonction personnalisée à l'objet `SitemapLoader`.

```python
loader = SitemapLoader(
    "https://api.python.langchain.com/sitemap.xml",
    filter_urls=["https://api.python.langchain.com/en/latest/"],
    parsing_function=remove_nav_and_header_elements,
)
```

## Plan du site local

Le chargeur de plan du site peut également être utilisé pour charger des fichiers locaux.

```python
sitemap_loader = SitemapLoader(web_path="example_data/sitemap.xml", is_local=True)

docs = sitemap_loader.load()
```
