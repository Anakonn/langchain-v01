---
translated: true
---

# EPub

>[EPUB](https://en.wikipedia.org/wiki/EPUB) es un formato de archivo de libro electrónico que usa la extensión de archivo ".epub". El término es la abreviatura de publicación electrónica y a veces se escribe ePub. `EPUB` es compatible con muchos lectores de libros electrónicos, y hay software compatible disponible para la mayoría de los teléfonos inteligentes, tabletas y computadoras.

Esto cubre cómo cargar documentos `.epub` en el formato de Documento que podemos usar más adelante. Deberá instalar el paquete [`pandoc`](https://pandoc.org/installing.html) para que este cargador funcione.

```python
%pip install --upgrade --quiet  pandoc
```

```python
from langchain_community.document_loaders import UnstructuredEPubLoader
```

```python
loader = UnstructuredEPubLoader("winter-sports.epub")
```

```python
data = loader.load()
```

## Retener Elementos

Detrás de escena, Unstructured crea diferentes "elementos" para diferentes fragmentos de texto. De forma predeterminada, los combinamos, pero puede mantener fácilmente esa separación especificando `mode="elements"`.

```python
loader = UnstructuredEPubLoader("winter-sports.epub", mode="elements")
```

```python
data = loader.load()
```

```python
data[0]
```

```output
Document(page_content='The Project Gutenberg eBook of Winter Sports in\nSwitzerland, by E. F. Benson', lookup_str='', metadata={'source': 'winter-sports.epub', 'page_number': 1, 'category': 'Title'}, lookup_index=0)
```
