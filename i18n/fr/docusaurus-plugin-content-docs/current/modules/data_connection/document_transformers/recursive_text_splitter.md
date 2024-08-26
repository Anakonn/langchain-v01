---
translated: true
---

# Diviser récursivement par caractère

Ce diviseur de texte est celui recommandé pour le texte générique. Il est paramétré par une liste de caractères. Il essaie de les diviser dans l'ordre jusqu'à ce que les morceaux soient suffisamment petits. La liste par défaut est `["\n\n", "\n", " ", ""]`. Cela a pour effet de tenter de garder tous les paragraphes (puis les phrases, puis les mots) ensemble aussi longtemps que possible, car ils sembleraient être les éléments de texte les plus fortement liés sémantiquement.

1. Comment le texte est divisé : par liste de caractères.
2. Comment la taille des morceaux est mesurée : par nombre de caractères.

```python
%pip install -qU langchain-text-splitters
```

```python
# This is a long document we can split up.
with open("../../state_of_the_union.txt") as f:
    state_of_the_union = f.read()
```

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
text_splitter = RecursiveCharacterTextSplitter(
    # Set a really small chunk size, just to show.
    chunk_size=100,
    chunk_overlap=20,
    length_function=len,
    is_separator_regex=False,
)
```

```python
texts = text_splitter.create_documents([state_of_the_union])
print(texts[0])
print(texts[1])
```

```output
page_content='Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and'
page_content='of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.'
```

```python
text_splitter.split_text(state_of_the_union)[:2]
```

```output
['Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and',
 'of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.']
```

## Diviser le texte des langues sans frontières de mots

Certains systèmes d'écriture n'ont pas de [frontières de mots](https://en.wikipedia.org/wiki/Category:Writing_systems_without_word_boundaries), par exemple le chinois, le japonais et le thaï. Diviser le texte avec la liste de séparateurs par défaut de `["\n\n", "\n", " ", ""]` peut entraîner la division des mots entre les morceaux. Pour garder les mots ensemble, vous pouvez remplacer la liste de séparateurs pour inclure une ponctuation supplémentaire :

* Ajouter le point ASCII "`.`", [Unicode pleine largeur](https://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms_(Unicode_block)) point "．" (utilisé dans les textes chinois), et [point idéographique](https://en.wikipedia.org/wiki/CJK_Symbols_and_Punctuation) "`。`" (utilisé en japonais et en chinois)
* Ajouter l'[espace insécable](https://en.wikipedia.org/wiki/Zero-width_space) utilisé en thaï, myanmar, khmer, et japonais.
* Ajouter la virgule ASCII "`,`", la virgule pleine largeur Unicode "`，`", et la virgule idéographique Unicode "`、`"

```python
text_splitter = RecursiveCharacterTextSplitter(
    separators=[
        "\n\n",
        "\n",
        " ",
        ".",
        ",",
        "\u200b",  # Zero-width space
        "\uff0c",  # Fullwidth comma
        "\u3001",  # Ideographic comma
        "\uff0e",  # Fullwidth full stop
        "\u3002",  # Ideographic full stop
        "",
    ],
    # Existing args
)
```
