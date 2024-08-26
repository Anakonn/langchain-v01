---
translated: true
---

# Fichier non structuré

Ce notebook couvre comment utiliser le package `Unstructured` pour charger des fichiers de nombreux types. `Unstructured` prend en charge actuellement le chargement de fichiers texte, de présentations, de HTML, de PDF, d'images et plus encore.

```python
# # Install package
%pip install --upgrade --quiet  "unstructured[all-docs]"
```

```python
# # Install other dependencies
# # https://github.com/Unstructured-IO/unstructured/blob/main/docs/source/installing.rst
# !brew install libmagic
# !brew install poppler
# !brew install tesseract
# # If parsing xml / html documents:
# !brew install libxml2
# !brew install libxslt
```

```python
# import nltk
# nltk.download('punkt')
```

```python
from langchain_community.document_loaders import UnstructuredFileLoader
```

```python
loader = UnstructuredFileLoader("./example_data/state_of_the_union.txt")
```

```python
docs = loader.load()
```

```python
docs[0].page_content[:400]
```

```output
'Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.\n\nLast year COVID-19 kept us apart. This year we are finally together again.\n\nTonight, we meet as Democrats Republicans and Independents. But most importantly as Americans.\n\nWith a duty to one another to the American people to the Constit'
```

### Charger une liste de fichiers

```python
files = ["./example_data/whatsapp_chat.txt", "./example_data/layout-parser-paper.pdf"]
```

```python
loader = UnstructuredFileLoader(files)
```

```python
docs = loader.load()
```

```python
docs[0].page_content[:400]
```

## Conserver les éléments

En interne, Unstructured crée différents "éléments" pour différents blocs de texte. Par défaut, nous les combinons ensemble, mais vous pouvez facilement conserver cette séparation en spécifiant `mode="elements"`.

```python
loader = UnstructuredFileLoader(
    "./example_data/state_of_the_union.txt", mode="elements"
)
```

```python
docs = loader.load()
```

```python
docs[:5]
```

```output
[Document(page_content='Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.', lookup_str='', metadata={'source': '../../state_of_the_union.txt'}, lookup_index=0),
 Document(page_content='Last year COVID-19 kept us apart. This year we are finally together again.', lookup_str='', metadata={'source': '../../state_of_the_union.txt'}, lookup_index=0),
 Document(page_content='Tonight, we meet as Democrats Republicans and Independents. But most importantly as Americans.', lookup_str='', metadata={'source': '../../state_of_the_union.txt'}, lookup_index=0),
 Document(page_content='With a duty to one another to the American people to the Constitution.', lookup_str='', metadata={'source': '../../state_of_the_union.txt'}, lookup_index=0),
 Document(page_content='And with an unwavering resolve that freedom will always triumph over tyranny.', lookup_str='', metadata={'source': '../../state_of_the_union.txt'}, lookup_index=0)]
```

## Définir une stratégie de partitionnement

Le chargeur de documents Unstructured permet aux utilisateurs de passer un paramètre `strategy` qui indique à `unstructured` comment partitionner le document. Les stratégies actuellement prises en charge sont `"hi_res"` (par défaut) et `"fast"`. Les stratégies de partitionnement haute résolution sont plus précises, mais prennent plus de temps à traiter. Les stratégies rapides partitionnent le document plus rapidement, mais au détriment de la précision. Tous les types de documents n'ont pas de stratégies de partitionnement haute résolution et rapide distinctes. Pour ces types de documents, le paramètre `strategy` est ignoré. Dans certains cas, la stratégie haute résolution se rabattra sur la stratégie rapide s'il manque une dépendance (c'est-à-dire un modèle pour le partitionnement de documents). Vous pouvez voir comment appliquer une stratégie à un `UnstructuredFileLoader` ci-dessous.

```python
from langchain_community.document_loaders import UnstructuredFileLoader
```

```python
loader = UnstructuredFileLoader(
    "layout-parser-paper-fast.pdf", strategy="fast", mode="elements"
)
```

```python
docs = loader.load()
```

```python
docs[:5]
```

```output
[Document(page_content='1', lookup_str='', metadata={'source': 'layout-parser-paper-fast.pdf', 'filename': 'layout-parser-paper-fast.pdf', 'page_number': 1, 'category': 'UncategorizedText'}, lookup_index=0),
 Document(page_content='2', lookup_str='', metadata={'source': 'layout-parser-paper-fast.pdf', 'filename': 'layout-parser-paper-fast.pdf', 'page_number': 1, 'category': 'UncategorizedText'}, lookup_index=0),
 Document(page_content='0', lookup_str='', metadata={'source': 'layout-parser-paper-fast.pdf', 'filename': 'layout-parser-paper-fast.pdf', 'page_number': 1, 'category': 'UncategorizedText'}, lookup_index=0),
 Document(page_content='2', lookup_str='', metadata={'source': 'layout-parser-paper-fast.pdf', 'filename': 'layout-parser-paper-fast.pdf', 'page_number': 1, 'category': 'UncategorizedText'}, lookup_index=0),
 Document(page_content='n', lookup_str='', metadata={'source': 'layout-parser-paper-fast.pdf', 'filename': 'layout-parser-paper-fast.pdf', 'page_number': 1, 'category': 'Title'}, lookup_index=0)]
```

## Exemple de PDF

Le traitement des documents PDF fonctionne exactement de la même manière. Unstructured détecte le type de fichier et extrait les mêmes types d'éléments. Les modes de fonctionnement sont :
- `single` tous les textes de tous les éléments sont combinés en un seul (par défaut)
- `elements` maintient les éléments individuels
- `paged` les textes de chaque page ne sont combinés que

```python
!wget  https://raw.githubusercontent.com/Unstructured-IO/unstructured/main/example-docs/layout-parser-paper.pdf -P "../../"
```

```python
loader = UnstructuredFileLoader(
    "./example_data/layout-parser-paper.pdf", mode="elements"
)
```

```python
docs = loader.load()
```

```python
docs[:5]
```

```output
[Document(page_content='LayoutParser : A Uniﬁed Toolkit for Deep Learning Based Document Image Analysis', lookup_str='', metadata={'source': '../../layout-parser-paper.pdf'}, lookup_index=0),
 Document(page_content='Zejiang Shen 1 ( (ea)\n ), Ruochen Zhang 2 , Melissa Dell 3 , Benjamin Charles Germain Lee 4 , Jacob Carlson 3 , and Weining Li 5', lookup_str='', metadata={'source': '../../layout-parser-paper.pdf'}, lookup_index=0),
 Document(page_content='Allen Institute for AI shannons@allenai.org', lookup_str='', metadata={'source': '../../layout-parser-paper.pdf'}, lookup_index=0),
 Document(page_content='Brown University ruochen zhang@brown.edu', lookup_str='', metadata={'source': '../../layout-parser-paper.pdf'}, lookup_index=0),
 Document(page_content='Harvard University { melissadell,jacob carlson } @fas.harvard.edu', lookup_str='', metadata={'source': '../../layout-parser-paper.pdf'}, lookup_index=0)]
```

Si vous devez post-traiter les éléments `unstructured` après l'extraction, vous pouvez passer une liste de fonctions `str` -> `str` à l'argument `post_processors` lors de l'instanciation de `UnstructuredFileLoader`. Cela s'applique également aux autres chargeurs Unstructured. Voici un exemple.

```python
from langchain_community.document_loaders import UnstructuredFileLoader
from unstructured.cleaners.core import clean_extra_whitespace
```

```python
loader = UnstructuredFileLoader(
    "./example_data/layout-parser-paper.pdf",
    mode="elements",
    post_processors=[clean_extra_whitespace],
)
```

```python
docs = loader.load()
```

```python
docs[:5]
```

```output
[Document(page_content='LayoutParser: A Uniﬁed Toolkit for Deep Learning Based Document Image Analysis', metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((157.62199999999999, 114.23496279999995), (157.62199999999999, 146.5141628), (457.7358962799999, 146.5141628), (457.7358962799999, 114.23496279999995)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'filename': 'layout-parser-paper.pdf', 'file_directory': './example_data', 'filetype': 'application/pdf', 'page_number': 1, 'category': 'Title'}),
 Document(page_content='Zejiang Shen1 ((cid:0)), Ruochen Zhang2, Melissa Dell3, Benjamin Charles Germain Lee4, Jacob Carlson3, and Weining Li5', metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((134.809, 168.64029940800003), (134.809, 192.2517444), (480.5464199080001, 192.2517444), (480.5464199080001, 168.64029940800003)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'filename': 'layout-parser-paper.pdf', 'file_directory': './example_data', 'filetype': 'application/pdf', 'page_number': 1, 'category': 'UncategorizedText'}),
 Document(page_content='1 Allen Institute for AI shannons@allenai.org 2 Brown University ruochen zhang@brown.edu 3 Harvard University {melissadell,jacob carlson}@fas.harvard.edu 4 University of Washington bcgl@cs.washington.edu 5 University of Waterloo w422li@uwaterloo.ca', metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((207.23000000000002, 202.57205439999996), (207.23000000000002, 311.8195408), (408.12676, 311.8195408), (408.12676, 202.57205439999996)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'filename': 'layout-parser-paper.pdf', 'file_directory': './example_data', 'filetype': 'application/pdf', 'page_number': 1, 'category': 'UncategorizedText'}),
 Document(page_content='1 2 0 2', metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((16.34, 213.36), (16.34, 253.36), (36.34, 253.36), (36.34, 213.36)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'filename': 'layout-parser-paper.pdf', 'file_directory': './example_data', 'filetype': 'application/pdf', 'page_number': 1, 'category': 'UncategorizedText'}),
 Document(page_content='n u J', metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((16.34, 258.36), (16.34, 286.14), (36.34, 286.14), (36.34, 258.36)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'filename': 'layout-parser-paper.pdf', 'file_directory': './example_data', 'filetype': 'application/pdf', 'page_number': 1, 'category': 'Title'})]
```

## API Unstructured

Si vous voulez démarrer avec moins de configuration, vous pouvez simplement exécuter `pip install unstructured` et utiliser `UnstructuredAPIFileLoader` ou `UnstructuredAPIFileIOLoader`. Cela traitera votre document à l'aide de l'API Unstructured hébergée. Vous pouvez générer une clé API Unstructured gratuite [ici](https://www.unstructured.io/api-key/). La page de [documentation Unstructured](https://unstructured-io.github.io/unstructured/) aura des instructions sur la façon de générer une clé API une fois qu'elles seront disponibles. Consultez les instructions [ici](https://github.com/Unstructured-IO/unstructured-api#dizzy-instructions-for-using-the-docker-image) si vous souhaitez héberger vous-même l'API Unstructured ou l'exécuter localement.

```python
from langchain_community.document_loaders import UnstructuredAPIFileLoader
```

```python
filenames = ["example_data/fake.docx", "example_data/fake-email.eml"]
```

```python
loader = UnstructuredAPIFileLoader(
    file_path=filenames[0],
    api_key="FAKE_API_KEY",
)
```

```python
docs = loader.load()
docs[0]
```

```output
Document(page_content='Lorem ipsum dolor sit amet.', metadata={'source': 'example_data/fake.docx'})
```

Vous pouvez également traiter plusieurs fichiers via l'API Unstructured en une seule fois à l'aide de `UnstructuredAPIFileLoader`.

```python
loader = UnstructuredAPIFileLoader(
    file_path=filenames,
    api_key="FAKE_API_KEY",
)
```

```python
docs = loader.load()
docs[0]
```

```output
Document(page_content='Lorem ipsum dolor sit amet.\n\nThis is a test email to use for unit tests.\n\nImportant points:\n\nRoses are red\n\nViolets are blue', metadata={'source': ['example_data/fake.docx', 'example_data/fake-email.eml']})
```
