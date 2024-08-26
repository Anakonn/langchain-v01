---
translated: true
---

# Vsdx

> Un fichier [visio](https://fr.wikipedia.org/wiki/Microsoft_Visio) (avec l'extension .vsdx) est associé à Microsoft Visio, un logiciel de création de diagrammes. Il stocke des informations sur la structure, la mise en page et les éléments graphiques d'un diagramme. Ce format facilite la création et le partage de visualisations dans des domaines tels que les affaires, l'ingénierie et l'informatique.

Un fichier Visio peut contenir plusieurs pages. Certaines d'entre elles peuvent servir de fond pour d'autres, et cela peut se produire sur plusieurs couches. Ce **chargeur** extrait le contenu textuel de chaque page et de ses pages associées, permettant l'extraction de tout le texte visible de chaque page, de manière similaire à ce qu'un algorithme de reconnaissance optique de caractères (OCR) ferait.

**AVERTISSEMENT** : Seuls les fichiers Visio avec l'extension **.vsdx** sont compatibles avec ce chargeur. Les fichiers avec des extensions telles que .vsd, ... ne sont pas compatibles car ils ne peuvent pas être convertis en XML compressé.

```python
from langchain_community.document_loaders import VsdxLoader
```

```python
loader = VsdxLoader(file_path="./example_data/fake.vsdx")
documents = loader.load()
```

**Afficher les documents chargés**

```python
for i, doc in enumerate(documents):
    print(f"\n------ Page {doc.metadata['page']} ------")
    print(f"Title page : {doc.metadata['page_name']}")
    print(f"Source : {doc.metadata['source']}")
    print("\n==> CONTENT <== ")
    print(doc.page_content)
```

```output

------ Page 0 ------
Title page : Summary
Source : ./example_data/fake.vsdx

==> CONTENT <==
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title
Best Caption of the worl
This is an arrow
This is Earth
This is a bounded arrow

------ Page 1 ------
Title page : Glossary
Source : ./example_data/fake.vsdx

==> CONTENT <==
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title

------ Page 2 ------
Title page : blanket page
Source : ./example_data/fake.vsdx

==> CONTENT <==
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title
This file is a vsdx file
First text
Second text
Third text

------ Page 3 ------
Title page : BLABLABLA
Source : ./example_data/fake.vsdx

==> CONTENT <==
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title
Another RED arrow wow
Arrow with point but red
Green line
User
Captions
Red arrow magic !
Something white
Something Red
This a a completly useless diagramm, cool !!

But this is for example !
This diagramm is a base of many pages in this file. But it is editable in file \"BG WITH CONTENT\"
This is a page with something...

WAW I have learned something !
This is a page with something...

WAW I have learned something !

X2

------ Page 4 ------
Title page : What a page !!
Source : ./example_data/fake.vsdx

==> CONTENT <==
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title
Something white
Something Red
This a a completly useless diagramm, cool !!

But this is for example !
This diagramm is a base of many pages in this file. But it is editable in file \"BG WITH CONTENT\"
Another RED arrow wow
Arrow with point but red
Green line
User
Captions
Red arrow magic !

------ Page 5 ------
Title page : next page after previous one
Source : ./example_data/fake.vsdx

==> CONTENT <==
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title
Another RED arrow wow
Arrow with point but red
Green line
User
Captions
Red arrow magic !
Something white
Something Red
This a a completly useless diagramm, cool !!

But this is for example !
This diagramm is a base of many pages in this file. But it is editable in file \"BG WITH CONTENT\"
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0-\u00a0incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in


voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa
*


qui officia deserunt mollit anim id est laborum.

------ Page 6 ------
Title page : Connector Page
Source : ./example_data/fake.vsdx

==> CONTENT <==
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title
Something white
Something Red
This a a completly useless diagramm, cool !!

But this is for example !
This diagramm is a base of many pages in this file. But it is editable in file \"BG WITH CONTENT\"

------ Page 7 ------
Title page : Useful ↔ Useless page
Source : ./example_data/fake.vsdx

==> CONTENT <==
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title
Something white
Something Red
This a a completly useless diagramm, cool !!

But this is for example !
This diagramm is a base of many pages in this file. But it is editable in file \"BG WITH CONTENT\"
Title of this document : BLABLABLA

------ Page 8 ------
Title page : Alone page
Source : ./example_data/fake.vsdx

==> CONTENT <==
Black cloud
Unidirectional traffic primary path
Unidirectional traffic backup path
Encapsulation
User
Captions
Bidirectional traffic
Alone, sad
Test of another page
This is a \"bannier\"
Tests of some exotics characters :\u00a0\u00e3\u00e4\u00e5\u0101\u0103 \u00fc\u2554\u00a0 \u00a0\u00bc \u00c7 \u25d8\u25cb\u2642\u266b\u2640\u00ee\u2665
This is ethernet
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
This is an empty case
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
\u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0-\u00a0 incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in


 voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa
*


qui officia deserunt mollit anim id est laborum.

------ Page 9 ------
Title page : BG
Source : ./example_data/fake.vsdx

==> CONTENT <==
Best Caption of the worl
This is an arrow
This is Earth
This is a bounded arrow
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title

------ Page 10 ------
Title page : BG  + caption1
Source : ./example_data/fake.vsdx

==> CONTENT <==
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title
Another RED arrow wow
Arrow with point but red
Green line
User
Captions
Red arrow magic !
Something white
Something Red
This a a completly useless diagramm, cool !!

But this is for example !
This diagramm is a base of many pages in this file. But it is editable in file \"BG WITH CONTENT\"
Useful\u2194 Useless page\u00a0

Tests of some exotics characters :\u00a0\u00e3\u00e4\u00e5\u0101\u0103 \u00fc\u2554\u00a0\u00a0\u00bc \u00c7 \u25d8\u25cb\u2642\u266b\u2640\u00ee\u2665

------ Page 11 ------
Title page : BG+
Source : ./example_data/fake.vsdx

==> CONTENT <==
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title

------ Page 12 ------
Title page : BG WITH CONTENT
Source : ./example_data/fake.vsdx

==> CONTENT <==
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.





Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.


Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. - Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.


Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
This is a page with a lot of text

------ Page 13 ------
Title page : 2nd caption with ____________________________________________________________________ content
Source : ./example_data/fake.vsdx

==> CONTENT <==
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title
Another RED arrow wow
Arrow with point but red
Green line
User
Captions
Red arrow magic !
Something white
Something Red
This a a completly useless diagramm, cool !!

But this is for example !
This diagramm is a base of many pages in this file. But it is editable in file \"BG WITH CONTENT\"
Only connectors on this page. This is the CoNNeCtor page
```
