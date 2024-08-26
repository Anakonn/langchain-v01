---
translated: true
---

# acreom

[acreom](https://acreom.com) es una base de conocimientos centrada en el desarrollador con tareas que se ejecutan en archivos locales de Markdown.

A continuación se muestra un ejemplo de cómo cargar un depósito local de acreom en Langchain. Como el depósito local en acreom es una carpeta de archivos .md de texto plano, el cargador requiere la ruta al directorio.

Los archivos del depósito pueden contener algunos metadatos que se almacenan como un encabezado YAML. Estos valores se agregarán a los metadatos del documento si `collect_metadata` se establece en true.

```python
from langchain_community.document_loaders import AcreomLoader
```

```python
loader = AcreomLoader("<path-to-acreom-vault>", collect_metadata=False)
```

```python
docs = loader.load()
```
