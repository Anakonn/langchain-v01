---
translated: true
---

# Copiar y Pegar

Este cuaderno cubre cómo cargar un objeto de documento a partir de algo que simplemente quieres copiar y pegar. En este caso, ni siquiera necesitas usar un DocumentLoader, sino que puedes construir el Documento directamente.

```python
from langchain_community.docstore.document import Document
```

```python
text = "..... put the text you copy pasted here......"
```

```python
doc = Document(page_content=text)
```

## Metadatos

Si quieres agregar metadatos sobre de dónde obtuviste este fragmento de texto, puedes hacerlo fácilmente con la clave de metadatos.

```python
metadata = {"source": "internet", "date": "Friday"}
```

```python
doc = Document(page_content=text, metadata=metadata)
```
