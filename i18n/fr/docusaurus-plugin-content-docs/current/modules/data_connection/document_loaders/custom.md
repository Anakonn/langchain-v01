---
sidebar_position: 10
title: Chargeur de Documents Personnalisé
translated: true
---

# Chargeur de Documents Personnalisé

## Vue d'ensemble

Les applications basées sur les LLM impliquent fréquemment l'extraction de données à partir de bases de données ou de fichiers, comme des PDFs, et leur conversion dans un format que les LLM peuvent utiliser. Dans LangChain, cela implique généralement la création d'objets Document, qui encapsulent le texte extrait (`page_content`) ainsi que des métadonnées—un dictionnaire contenant des détails sur le document, tels que le nom de l'auteur ou la date de publication.

Les objets `Document` sont souvent formatés en prompts qui sont alimentés dans un LLM, permettant au LLM d'utiliser les informations dans le `Document` pour générer une réponse souhaitée (par exemple, résumer le document).
Les `Documents` peuvent être utilisés immédiatement ou indexés dans un vectorstore pour une récupération et une utilisation futures.

Les principales abstractions pour le chargement de documents sont :

| Composant      | Description                    |
|----------------|--------------------------------|
| Document       | Contient `text` et `metadata`  |
| BaseLoader     | Utilisé pour convertir les données brutes en `Documents`  |
| Blob           | Une représentation des données binaires qui se trouvent soit dans un fichier soit en mémoire |
| BaseBlobParser | Logique pour analyser un `Blob` afin de produire des objets `Document` |

Ce guide montrera comment écrire une logique de chargement de documents et d'analyse de fichiers personnalisée; spécifiquement, nous verrons comment :

1. Créer un chargeur de documents standard en sous-classant à partir de `BaseLoader`.
2. Créer un analyseur en utilisant `BaseBlobParser` et l'utiliser en conjonction avec `Blob` et `BlobLoaders`. Ceci est principalement utile lors du travail avec des fichiers.

## Chargeur de Documents Standard

Un chargeur de documents peut être implémenté en sous-classant à partir d'un `BaseLoader` qui fournit une interface standard pour charger des documents.

### Interface

| Nom de la Méthode | Explication |
|-------------------|-------------|
| lazy_load         | Utilisé pour charger les documents un par un **paresseusement**. Utiliser pour le code de production. |
| alazy_load        | Variante asynchrone de `lazy_load` |
| load              | Utilisé pour charger tous les documents en mémoire **goulûment**. Utiliser pour le prototypage ou le travail interactif. |
| aload             | Utilisé pour charger tous les documents en mémoire **goulûment**. Utiliser pour le prototypage ou le travail interactif. **Ajouté en 2024-04 à LangChain.** |

* Les méthodes `load` sont des méthodes de commodité destinées uniquement au travail de prototypage -- elles invoquent simplement `list(self.lazy_load())`.
* Le `alazy_load` a une implémentation par défaut qui délèguera à `lazy_load`. Si vous utilisez async, nous recommandons de remplacer l'implémentation par défaut et de fournir une implémentation asynchrone native.

::: {.callout-important}
Lors de l'implémentation d'un chargeur de documents, ne **PAS** fournir de paramètres via les méthodes `lazy_load` ou `alazy_load`.

Toute la configuration est censée être passée via l'initialiseur (__init__). Cela a été un choix de conception fait par LangChain pour s'assurer qu'une fois qu'un chargeur de documents a été instancié, il dispose de toutes les informations nécessaires pour charger les documents.
:::

### Implémentation

Créons un exemple de chargeur de documents standard qui charge un fichier et crée un document à partir de chaque ligne du fichier.

```python
from typing import AsyncIterator, Iterator

from langchain_core.document_loaders import BaseLoader
from langchain_core.documents import Document


class CustomDocumentLoader(BaseLoader):
    """An example document loader that reads a file line by line."""

    def __init__(self, file_path: str) -> None:
        """Initialize the loader with a file path.

        Args:
            file_path: The path to the file to load.
        """
        self.file_path = file_path

    def lazy_load(self) -> Iterator[Document]:  # <-- Does not take any arguments
        """A lazy loader that reads a file line by line.

        When you're implementing lazy load methods, you should use a generator
        to yield documents one by one.
        """
        with open(self.file_path, encoding="utf-8") as f:
            line_number = 0
            for line in f:
                yield Document(
                    page_content=line,
                    metadata={"line_number": line_number, "source": self.file_path},
                )
                line_number += 1

    # alazy_load is OPTIONAL.
    # If you leave out the implementation, a default implementation which delegates to lazy_load will be used!
    async def alazy_load(
        self,
    ) -> AsyncIterator[Document]:  # <-- Does not take any arguments
        """An async lazy loader that reads a file line by line."""
        # Requires aiofiles
        # Install with `pip install aiofiles`
        # https://github.com/Tinche/aiofiles
        import aiofiles

        async with aiofiles.open(self.file_path, encoding="utf-8") as f:
            line_number = 0
            async for line in f:
                yield Document(
                    page_content=line,
                    metadata={"line_number": line_number, "source": self.file_path},
                )
                line_number += 1
```

### Test 🧪

Pour tester le chargeur de documents, nous avons besoin d'un fichier avec un contenu de qualité.

```python
with open("./meow.txt", "w", encoding="utf-8") as f:
    quality_content = "meow meow🐱 \n meow meow🐱 \n meow😻😻"
    f.write(quality_content)

loader = CustomDocumentLoader("./meow.txt")
```

```python
## Test out the lazy load interface
for doc in loader.lazy_load():
    print()
    print(type(doc))
    print(doc)
```

```output

<class 'langchain_core.documents.base.Document'>
page_content='meow meow🐱 \n' metadata={'line_number': 0, 'source': './meow.txt'}

<class 'langchain_core.documents.base.Document'>
page_content=' meow meow🐱 \n' metadata={'line_number': 1, 'source': './meow.txt'}

<class 'langchain_core.documents.base.Document'>
page_content=' meow😻😻' metadata={'line_number': 2, 'source': './meow.txt'}
```

```python
## Test out the async implementation
async for doc in loader.alazy_load():
    print()
    print(type(doc))
    print(doc)
```

```output

<class 'langchain_core.documents.base.Document'>
page_content='meow meow🐱 \n' metadata={'line_number': 0, 'source': './meow.txt'}

<class 'langchain_core.documents.base.Document'>
page_content=' meow meow🐱 \n' metadata={'line_number': 1, 'source': './meow.txt'}

<class 'langchain_core.documents.base.Document'>
page_content=' meow😻😻' metadata={'line_number': 2, 'source': './meow.txt'}
```

::: {.callout-tip}

`load()` peut être utile dans un environnement interactif tel qu'un notebook Jupyter.

Évitez de l'utiliser pour le code de production car le chargement goulûment suppose que tout le contenu
peut tenir en mémoire, ce qui n'est pas toujours le cas, en particulier pour les données d'entreprise.
:::

```python
loader.load()
```

```output
[Document(page_content='meow meow🐱 \n', metadata={'line_number': 0, 'source': './meow.txt'}),
 Document(page_content=' meow meow🐱 \n', metadata={'line_number': 1, 'source': './meow.txt'}),
 Document(page_content=' meow😻😻', metadata={'line_number': 2, 'source': './meow.txt'})]
```

## Travailler avec des Fichiers

De nombreux chargeurs de documents impliquent l'analyse de fichiers. La différence entre ces chargeurs provient généralement de la manière dont le fichier est analysé plutôt que de la manière dont le fichier est chargé. Par exemple, vous pouvez utiliser `open` pour lire le contenu binaire d'un fichier PDF ou d'un fichier markdown, mais vous avez besoin d'une logique d'analyse différente pour convertir ces données binaires en texte.

En conséquence, il peut être utile de découpler la logique d'analyse de la logique de chargement, ce qui facilite la réutilisation d'un analyseur donné, quelle que soit la manière dont les données ont été chargées.

### BaseBlobParser

Un `BaseBlobParser` est une interface qui accepte un `blob` et produit une liste d'objets `Document`. Un `blob` est une représentation de données qui réside soit en mémoire soit dans un fichier. LangChain python a une primitive `Blob` qui est inspirée par la [spécification Blob WebAPI](https://developer.mozilla.org/en-US/docs/Web/API/Blob).

```python
from langchain_core.document_loaders import BaseBlobParser, Blob


class MyParser(BaseBlobParser):
    """A simple parser that creates a document from each line."""

    def lazy_parse(self, blob: Blob) -> Iterator[Document]:
        """Parse a blob into a document line by line."""
        line_number = 0
        with blob.as_bytes_io() as f:
            for line in f:
                line_number += 1
                yield Document(
                    page_content=line,
                    metadata={"line_number": line_number, "source": blob.source},
                )
```

```python
blob = Blob.from_path("./meow.txt")
parser = MyParser()
```

```python
list(parser.lazy_parse(blob))
```

```output
[Document(page_content='meow meow🐱 \n', metadata={'line_number': 1, 'source': './meow.txt'}),
 Document(page_content=' meow meow🐱 \n', metadata={'line_number': 2, 'source': './meow.txt'}),
 Document(page_content=' meow😻😻', metadata={'line_number': 3, 'source': './meow.txt'})]
```

Utiliser l'API **blob** permet également de charger du contenu directement depuis la mémoire sans avoir à le lire à partir d'un fichier!

```python
blob = Blob(data=b"some data from memory\nmeow")
list(parser.lazy_parse(blob))
```

```output
[Document(page_content='some data from memory\n', metadata={'line_number': 1, 'source': None}),
 Document(page_content='meow', metadata={'line_number': 2, 'source': None})]
```

### Blob

Jetons un coup d'œil rapide à certaines des API Blob.

```python
blob = Blob.from_path("./meow.txt", metadata={"foo": "bar"})
```

```python
blob.encoding
```

```output
'utf-8'
```

```python
blob.as_bytes()
```

```output
b'meow meow\xf0\x9f\x90\xb1 \n meow meow\xf0\x9f\x90\xb1 \n meow\xf0\x9f\x98\xbb\xf0\x9f\x98\xbb'
```

```python
blob.as_string()
```

```output
'meow meow🐱 \n meow meow🐱 \n meow😻😻'
```

```python
blob.as_bytes_io()
```

```output
<contextlib._GeneratorContextManager at 0x743f34324450>
```

```python
blob.metadata
```

```output
{'foo': 'bar'}
```

```python
blob.source
```

```output
'./meow.txt'
```

### Chargeurs de Blobs

Alors qu'un analyseur encapsule la logique nécessaire pour analyser les données binaires en documents, les *chargeurs de blobs* encapsulent la logique nécessaire pour charger des blobs à partir d'un emplacement de stockage donné.

Pour le moment, `LangChain` ne supporte que `FileSystemBlobLoader`.

Vous pouvez utiliser le `FileSystemBlobLoader` pour charger des blobs puis utiliser l'analyseur pour les analyser.

```python
from langchain_community.document_loaders.blob_loaders import FileSystemBlobLoader

blob_loader = FileSystemBlobLoader(path=".", glob="*.mdx", show_progress=True)
```

```python
parser = MyParser()
for blob in blob_loader.yield_blobs():
    for doc in parser.lazy_parse(blob):
        print(doc)
        break
```

```output
  0%|          | 0/8 [00:00<?, ?it/s]
```

```output
page_content='# Microsoft Office\n' metadata={'line_number': 1, 'source': 'office_file.mdx'}
page_content='# Markdown\n' metadata={'line_number': 1, 'source': 'markdown.mdx'}
page_content='# JSON\n' metadata={'line_number': 1, 'source': 'json.mdx'}
page_content='---\n' metadata={'line_number': 1, 'source': 'pdf.mdx'}
page_content='---\n' metadata={'line_number': 1, 'source': 'index.mdx'}
page_content='# File Directory\n' metadata={'line_number': 1, 'source': 'file_directory.mdx'}
page_content='# CSV\n' metadata={'line_number': 1, 'source': 'csv.mdx'}
page_content='# HTML\n' metadata={'line_number': 1, 'source': 'html.mdx'}
```

### Chargeur Générique

LangChain a une abstraction `GenericLoader` qui compose un `BlobLoader` avec un `BaseBlobParser`.

`GenericLoader` est destiné à fournir des méthodes de classe standardisées qui facilitent l'utilisation des implémentations existantes de `BlobLoader`. Pour le moment, seul le `FileSystemBlobLoader` est supporté.

```python
from langchain_community.document_loaders.generic import GenericLoader

loader = GenericLoader.from_filesystem(
    path=".", glob="*.mdx", show_progress=True, parser=MyParser()
)

for idx, doc in enumerate(loader.lazy_load()):
    if idx < 5:
        print(doc)

print("... output truncated for demo purposes")
```

```output
  0%|          | 0/8 [00:00<?, ?it/s]
```

```output
page_content='# Microsoft Office\n' metadata={'line_number': 1, 'source': 'office_file.mdx'}
page_content='\n' metadata={'line_number': 2, 'source': 'office_file.mdx'}
page_content='>[The Microsoft Office](https://www.office.com/) suite of productivity software includes Microsoft Word, Microsoft Excel, Microsoft PowerPoint, Microsoft Outlook, and Microsoft OneNote. It is available for Microsoft Windows and macOS operating systems. It is also available on Android and iOS.\n' metadata={'line_number': 3, 'source': 'office_file.mdx'}
page_content='\n' metadata={'line_number': 4, 'source': 'office_file.mdx'}
page_content='This covers how to load commonly used file formats including `DOCX`, `XLSX` and `PPTX` documents into a document format that we can use downstream.\n' metadata={'line_number': 5, 'source': 'office_file.mdx'}
... output truncated for demo purposes
```

#### Chargeur Générique Personnalisé

Si vous aimez vraiment créer des classes, vous pouvez sous-classer et créer une classe pour encapsuler la logique ensemble.

Vous pouvez sous-classer à partir de cette classe pour charger du contenu en utilisant un chargeur existant.

```python
from typing import Any


class MyCustomLoader(GenericLoader):
    @staticmethod
    def get_parser(**kwargs: Any) -> BaseBlobParser:
        """Override this method to associate a default parser with the class."""
        return MyParser()
```

```python
loader = MyCustomLoader.from_filesystem(path=".", glob="*.mdx", show_progress=True)

for idx, doc in enumerate(loader.lazy_load()):
    if idx < 5:
        print(doc)

print("... output truncated for demo purposes")
```

```output
  0%|          | 0/8 [00:00<?, ?it/s]
```

```output
page_content='# Microsoft Office\n' metadata={'line_number': 1, 'source': 'office_file.mdx'}
page_content='\n' metadata={'line_number': 2, 'source': 'office_file.mdx'}
page_content='>[The Microsoft Office](https://www.office.com/) suite of productivity software includes Microsoft Word, Microsoft Excel, Microsoft PowerPoint, Microsoft Outlook, and Microsoft OneNote. It is available for Microsoft Windows and macOS operating systems. It is also available on Android and iOS.\n' metadata={'line_number': 3, 'source': 'office_file.mdx'}
page_content='\n' metadata={'line_number': 4, 'source': 'office_file.mdx'}
page_content='This covers how to load commonly used file formats including `DOCX`, `XLSX` and `PPTX` documents into a document format that we can use downstream.\n' metadata={'line_number': 5, 'source': 'office_file.mdx'}
... output truncated for demo purposes
```
