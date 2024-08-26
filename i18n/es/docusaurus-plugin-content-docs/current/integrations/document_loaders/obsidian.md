---
translated: true
---

# Obsidian

>[Obsidian](https://obsidian.md/) es una base de conocimiento poderosa y extensible
que funciona sobre tu carpeta local de archivos de texto plano.

Este cuaderno cubre cómo cargar documentos desde una base de datos `Obsidian`.

Dado que `Obsidian` se almacena en el disco como una carpeta de archivos Markdown, el cargador simplemente toma una ruta a este directorio.

Los archivos `Obsidian` también contienen a veces [metadatos](https://help.obsidian.md/Editing+and+formatting/Metadata) que es un bloque YAML en la parte superior del archivo. Estos valores se agregarán a los metadatos del documento. (`ObsidianLoader` también se puede pasar un argumento `collect_metadata=False` para deshabilitar este comportamiento.)

```python
from langchain_community.document_loaders import ObsidianLoader
```

```python
loader = ObsidianLoader("<path-to-obsidian>")
```

```python
docs = loader.load()
```
