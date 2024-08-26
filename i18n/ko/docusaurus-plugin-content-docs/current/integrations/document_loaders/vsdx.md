---
translated: true
---

# Vsdx

> [visio 파일](https://fr.wikipedia.org/wiki/Microsoft_Visio)(확장자 .vsdx)은 Microsoft Visio, 다이어그램 생성 소프트웨어와 관련되어 있습니다. 이는 다이어그램의 구조, 레이아웃 및 그래픽 요소에 대한 정보를 저장합니다. 이 형식은 비즈니스, 엔지니어링 및 컴퓨터 과학 분야에서 시각화를 생성하고 공유하는 것을 용이하게 합니다.

Visio 파일에는 여러 페이지가 포함될 수 있습니다. 이 중 일부는 다른 페이지의 배경으로 사용될 수 있으며, 이는 여러 레이어에 걸쳐 발생할 수 있습니다. 이 **로더**는 각 페이지와 관련 페이지에서 텍스트 콘텐츠를 추출하여 OCR 알고리즘과 유사하게 각 페이지의 모든 가시 텍스트를 추출할 수 있습니다.

**경고**: 이 로더와 호환되는 파일은 **.vsdx** 확장자만 가능합니다. .vsd, ... 등의 확장자를 가진 파일은 압축된 XML로 변환할 수 없기 때문에 호환되지 않습니다.

```python
from langchain_community.document_loaders import VsdxLoader
```

```python
loader = VsdxLoader(file_path="./example_data/fake.vsdx")
documents = loader.load()
```

**로드된 문서 표시**

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
