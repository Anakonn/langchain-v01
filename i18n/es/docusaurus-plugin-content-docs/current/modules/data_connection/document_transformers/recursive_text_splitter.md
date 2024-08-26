---
translated: true
---

# Dividir recursivamente por carácter

Este divisor de texto es el recomendado para texto genérico. Está parametrizado por una lista de caracteres. Intenta dividir en ellos en orden hasta que los fragmentos sean lo suficientemente pequeños. La lista predeterminada es `["\n\n", "\n", " ", ""]`. Esto tiene el efecto de intentar mantener todos los párrafos (y luego las oraciones y luego las palabras) juntos tanto como sea posible, ya que esos parecerían ser genéricamente las piezas semánticamente más relacionadas.

1. Cómo se divide el texto: por lista de caracteres.
2. Cómo se mide el tamaño del fragmento: por número de caracteres.

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

## Dividir texto de idiomas sin límites de palabra

Algunos sistemas de escritura no tienen [límites de palabra](https://en.wikipedia.org/wiki/Category:Writing_systems_without_word_boundaries), por ejemplo, chino, japonés y tailandés. Dividir el texto con la lista de separadores predeterminada de `["\n\n", "\n", " ", ""]` puede hacer que las palabras se dividan entre fragmentos. Para mantener las palabras juntas, puede anular la lista de separadores para incluir signos de puntuación adicionales:

* Agregar el punto final ASCII "`.`", el punto final de ancho completo [Unicode](https://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms_(Unicode_block)) "`．`" (usado en texto chino) y el [punto final ideográfico](https://en.wikipedia.org/wiki/CJK_Symbols_and_Punctuation) "`。`" (usado en japonés y chino)
* Agregar [espacio de ancho cero](https://en.wikipedia.org/wiki/Zero-width_space) usado en tailandés, birmano, jemer y japonés.
* Agregar la coma ASCII "`,`", la coma de ancho completo Unicode "`，`" y la coma ideográfica Unicode "`、`"

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
