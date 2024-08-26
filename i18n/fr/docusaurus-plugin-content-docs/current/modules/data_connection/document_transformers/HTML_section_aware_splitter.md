---
translated: true
---

# Divisé par section HTML

## Description et motivation

Similaire dans le concept au [HTMLHeaderTextSplitter](/docs/modules/data_connection/document_transformers/HTML_header_metadata), le `HTMLSectionSplitter` est un découpeur "conscient de la structure" qui divise le texte au niveau de l'élément et ajoute des métadonnées pour chaque en-tête "pertinent" à un fragment donné. Il peut renvoyer des fragments élément par élément ou combiner des éléments avec les mêmes métadonnées, dans les objectifs de (a) garder le texte lié regroupé (plus ou moins) sémantiquement et (b) préserver les informations riches en contexte encodées dans les structures de document. Il peut être utilisé avec d'autres diviseurs de texte dans le cadre d'un pipeline de découpage. En interne, il utilise le `RecursiveCharacterTextSplitter` lorsque la taille de la section est supérieure à la taille du fragment. Il tient également compte de la taille de la police du texte pour déterminer s'il s'agit d'une section ou non en fonction du seuil de taille de police déterminé. Utilisez `xslt_path` pour fournir un chemin absolu pour transformer le HTML afin qu'il puisse détecter les sections en fonction des balises fournies. La valeur par défaut est d'utiliser le fichier `converting_to_header.xslt` dans le répertoire `data_connection/document_transformers`. Cela sert à convertir le HTML dans un format/une mise en page plus facile à détecter les sections. Par exemple, `span` en fonction de leur taille de police peut être converti en balises d'en-tête pour être détecté comme une section.

## Exemples d'utilisation

#### 1) Avec une chaîne HTML :

```python
from langchain_text_splitters import HTMLSectionSplitter

html_string = """
    <!DOCTYPE html>
    <html>
    <body>
        <div>
            <h1>Foo</h1>
            <p>Some intro text about Foo.</p>
            <div>
                <h2>Bar main section</h2>
                <p>Some intro text about Bar.</p>
                <h3>Bar subsection 1</h3>
                <p>Some text about the first subtopic of Bar.</p>
                <h3>Bar subsection 2</h3>
                <p>Some text about the second subtopic of Bar.</p>
            </div>
            <div>
                <h2>Baz</h2>
                <p>Some text about Baz</p>
            </div>
            <br>
            <p>Some concluding text about Foo</p>
        </div>
    </body>
    </html>
"""

headers_to_split_on = [("h1", "Header 1"), ("h2", "Header 2")]

html_splitter = HTMLSectionSplitter(headers_to_split_on=headers_to_split_on)
html_header_splits = html_splitter.split_text(html_string)
html_header_splits
```

#### 2) Mis en pipeline avec un autre diviseur, avec le HTML chargé à partir d'un contenu de chaîne HTML :

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

html_string = """
    <!DOCTYPE html>
    <html>
    <body>
        <div>
            <h1>Foo</h1>
            <p>Some intro text about Foo.</p>
            <div>
                <h2>Bar main section</h2>
                <p>Some intro text about Bar.</p>
                <h3>Bar subsection 1</h3>
                <p>Some text about the first subtopic of Bar.</p>
                <h3>Bar subsection 2</h3>
                <p>Some text about the second subtopic of Bar.</p>
            </div>
            <div>
                <h2>Baz</h2>
                <p>Some text about Baz</p>
            </div>
            <br>
            <p>Some concluding text about Foo</p>
        </div>
    </body>
    </html>
"""

headers_to_split_on = [
    ("h1", "Header 1"),
    ("h2", "Header 2"),
    ("h3", "Header 3"),
    ("h4", "Header 4"),
]

html_splitter = HTMLSectionSplitter(headers_to_split_on=headers_to_split_on)

html_header_splits = html_splitter.split_text(html_string)

chunk_size = 500
chunk_overlap = 30
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=chunk_size, chunk_overlap=chunk_overlap
)

# Split
splits = text_splitter.split_documents(html_header_splits)
splits
```
