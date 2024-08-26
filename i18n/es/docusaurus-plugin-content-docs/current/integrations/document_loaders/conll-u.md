---
translated: true
---

# CoNLL-U

>[CoNLL-U](https://universaldependencies.org/format.html) es una versión revisada del formato CoNLL-X. Las anotaciones se codifican en archivos de texto plano (UTF-8, normalizado a NFC, usando solo el carácter LF como salto de línea, incluyendo un carácter LF al final del archivo) con tres tipos de líneas:
>- Líneas de palabras que contienen la anotación de una palabra/token en 10 campos separados por un solo carácter de tabulación; ver a continuación.
>- Líneas en blanco que marcan los límites de las oraciones.
>- Líneas de comentarios que comienzan con el símbolo hash (#).

Este es un ejemplo de cómo cargar un archivo en formato [CoNLL-U](https://universaldependencies.org/format.html). Todo el archivo se trata como un solo documento. Los datos de ejemplo (`conllu.conllu`) se basan en uno de los ejemplos estándar de UD/CoNLL-U.

```python
from langchain_community.document_loaders import CoNLLULoader
```

```python
loader = CoNLLULoader("example_data/conllu.conllu")
```

```python
document = loader.load()
```

```python
document
```

```output
[Document(page_content='They buy and sell books.', metadata={'source': 'example_data/conllu.conllu'})]
```
