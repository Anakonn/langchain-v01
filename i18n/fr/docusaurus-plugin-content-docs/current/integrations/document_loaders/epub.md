---
translated: true
---

# EPub

>[EPUB](https://en.wikipedia.org/wiki/EPUB) est un format de fichier de livre électronique qui utilise l'extension de fichier ".epub". Le terme est abrégé de "electronic publication" et est parfois stylisé ePub. `EPUB` est pris en charge par de nombreux lecteurs électroniques, et des logiciels compatibles sont disponibles pour la plupart des smartphones, tablettes et ordinateurs.

Cela couvre comment charger des documents `.epub` dans le format Document que nous pouvons utiliser en aval. Vous devrez installer le package [`pandoc`](https://pandoc.org/installing.html) pour que ce chargeur fonctionne.

```python
%pip install --upgrade --quiet  pandoc
```

```python
from langchain_community.document_loaders import UnstructuredEPubLoader
```

```python
loader = UnstructuredEPubLoader("winter-sports.epub")
```

```python
data = loader.load()
```

## Conserver les éléments

En interne, Unstructured crée différents "éléments" pour différents morceaux de texte. Par défaut, nous les combinons, mais vous pouvez facilement conserver cette séparation en spécifiant `mode="elements"`.

```python
loader = UnstructuredEPubLoader("winter-sports.epub", mode="elements")
```

```python
data = loader.load()
```

```python
data[0]
```

```output
Document(page_content='The Project Gutenberg eBook of Winter Sports in\nSwitzerland, by E. F. Benson', lookup_str='', metadata={'source': 'winter-sports.epub', 'page_number': 1, 'category': 'Title'}, lookup_index=0)
```
