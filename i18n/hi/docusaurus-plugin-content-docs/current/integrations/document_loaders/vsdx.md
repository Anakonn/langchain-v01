---
translated: true
---

# Vsdx

> एक [visio फ़ाइल](https://fr.wikipedia.org/wiki/Microsoft_Visio) (.vsdx एक्सटेंशन के साथ) माइक्रोसॉफ्ट विज़ियो, एक आरेख निर्माण सॉफ़्टवेयर से संबंधित है। यह एक आरेख के संरचना, लेआउट और ग्राफ़िकल तत्वों के बारे में जानकारी संग्रहीत करता है। यह प्रारूप व्यापार, इंजीनियरिंग और कंप्यूटर विज्ञान जैसे क्षेत्रों में दृश्य प्रस्तुतियों के निर्माण और साझाकरण को सुविधाजनक बनाता है।

एक विज़ियो फ़ाइल में कई पृष्ठ हो सकते हैं। कुछ पृष्ठ अन्य पृष्ठों के लिए पृष्ठभूमि के रूप में कार्य कर सकते हैं, और यह कई स्तरों पर हो सकता है। यह **लोडर** प्रत्येक पृष्ठ और उससे संबंधित पृष्ठों से पाठ्य सामग्री को निकालता है, जिससे प्रत्येक पृष्ठ से सभी दृश्य पाठ्य सामग्री को निकालने में मदद मिलती है, जैसा कि एक OCR एल्गोरिदम करता है।

**चेतावनी**: केवल **.vsdx** एक्सटेंशन वाली विज़ियो फ़ाइलें ही इस लोडर के साथ संगत हैं। .vsd, ... जैसे एक्सटेंशन वाली फ़ाइलें संगत नहीं हैं क्योंकि उन्हें संपीड़ित XML में परिवर्तित नहीं किया जा सकता।

```python
from langchain_community.document_loaders import VsdxLoader
```

```python
loader = VsdxLoader(file_path="./example_data/fake.vsdx")
documents = loader.load()
```

**लोड किए गए दस्तावेज़ प्रदर्शित करें**

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
