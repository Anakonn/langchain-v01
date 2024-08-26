---
translated: true
---

# Format de document ouvert (ODT)

>Le [format de document ouvert pour les applications de bureau (ODF)](https://en.wikipedia.org/wiki/OpenDocument), également connu sous le nom de `OpenDocument`, est un format de fichier ouvert pour les documents de traitement de texte, les feuilles de calcul, les présentations et les graphiques, utilisant des fichiers XML compressés au format ZIP. Il a été développé dans le but de fournir une spécification de format de fichier XML ouvert pour les applications de bureau.

>La norme est développée et maintenue par un comité technique du consortium `OASIS` (Organization for the Advancement of Structured Information Standards). Elle était basée sur la spécification Sun Microsystems pour OpenOffice.org XML, le format par défaut pour `OpenOffice.org` et `LibreOffice`. Elle a été initialement développée pour `StarOffice` "pour fournir une norme ouverte pour les documents de bureau".

Le `UnstructuredODTLoader` est utilisé pour charger les fichiers `Open Office ODT`.

```python
from langchain_community.document_loaders import UnstructuredODTLoader
```

```python
loader = UnstructuredODTLoader("example_data/fake.odt", mode="elements")
docs = loader.load()
docs[0]
```

```output
Document(page_content='Lorem ipsum dolor sit amet.', metadata={'source': 'example_data/fake.odt', 'filename': 'example_data/fake.odt', 'category': 'Title'})
```
