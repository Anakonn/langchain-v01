---
translated: true
---

# URL récursif

Nous pouvons vouloir traiter toutes les URL sous un répertoire racine.

Par exemple, regardons la [documentation Python 3.9](https://docs.python.org/3.9/).

Cela a de nombreuses pages enfants intéressantes que nous pouvons vouloir lire en vrac.

Bien sûr, le `WebBaseLoader` peut charger une liste de pages.

Mais le défi est de parcourir l'arborescence des pages enfants et de constituer réellement cette liste !

Nous faisons cela en utilisant le `RecursiveUrlLoader`.

Cela nous donne également la flexibilité d'exclure certains enfants, de personnaliser l'extracteur, et plus encore.

# Paramètres

- url: str, l'URL cible à explorer.
- exclude_dirs: Optional[str], répertoires de pages Web à exclure.
- use_async: Optional[bool], s'il faut utiliser des requêtes asynchrones, l'utilisation de requêtes asynchrones est généralement plus rapide pour les grandes tâches. Cependant, l'asynchrone désactivera la fonctionnalité de chargement paresseux (la fonction fonctionne toujours, mais elle n'est pas paresseuse). Par défaut, il est défini sur False.
- extractor: Optional[Callable[[str], str]], une fonction pour extraire le texte du document à partir de la page Web, par défaut, elle renvoie la page telle quelle. Il est recommandé d'utiliser des outils comme goose3 et beautifulsoup pour extraire le texte. Par défaut, il renvoie simplement la page telle quelle.
- max_depth: Optional[int] = None, la profondeur maximale à explorer. Par défaut, il est défini sur 2. Si vous devez explorer tout le site Web, définissez-le sur un nombre suffisamment grand pour faire le travail.
- timeout: Optional[int] = None, le délai d'attente pour chaque requête, en secondes. Par défaut, il est défini sur 10.
- prevent_outside: Optional[bool] = None, s'il faut empêcher l'exploration en dehors de l'URL racine. Par défaut, il est défini sur True.

```python
from langchain_community.document_loaders.recursive_url_loader import RecursiveUrlLoader
```

Essayons un exemple simple.

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

Cependant, comme il est difficile d'effectuer un filtrage parfait, vous pourrez toujours voir quelques résultats non pertinents dans les résultats. Vous pouvez effectuer un filtrage sur les documents renvoyés vous-même, si nécessaire. La plupart du temps, les résultats renvoyés sont suffisamment bons.

Test sur la documentation LangChain.

```python
url = "https://js.langchain.com/docs/modules/memory/integrations/"
loader = RecursiveUrlLoader(url=url)
docs = loader.load()
len(docs)
```

```output
8
```
