---
translated: true
---

# Wikipedia

>[Wikipedia](https://wikipedia.org/) es una enciclopedia en línea gratuita y multilingüe escrita y mantenida por una comunidad de voluntarios, conocidos como wikipedistas, a través de la colaboración abierta y el uso de un sistema de edición basado en wiki llamado MediaWiki. `Wikipedia` es la obra de referencia más grande y más leída de la historia.

Este cuaderno muestra cómo cargar páginas de `wikipedia.org` en el formato de Documento que usamos posteriormente.

## Instalación

Primero, necesitas instalar el paquete de python `wikipedia`.

```python
%pip install --upgrade --quiet  wikipedia
```

## Ejemplos

`WikipediaLoader` tiene estos argumentos:
- `query`: texto libre que se usa para encontrar documentos en Wikipedia
- opcional `lang`: predeterminado="en". Úsalo para buscar en una parte específica de Wikipedia en un idioma
- opcional `load_max_docs`: predeterminado=100. Úsalo para limitar el número de documentos descargados. Toma tiempo descargar los 100 documentos, así que usa un número pequeño para experimentos. Hay un límite máximo de 300 por ahora.
- opcional `load_all_available_meta`: predeterminado=False. De forma predeterminada, solo se descargan los campos más importantes: `Published` (fecha en que se publicó/actualizó el documento), `title`, `Summary`. Si es True, también se descargan otros campos.

```python
from langchain_community.document_loaders import WikipediaLoader
```

```python
docs = WikipediaLoader(query="HUNTER X HUNTER", load_max_docs=2).load()
len(docs)
```

```python
docs[0].metadata  # meta-information of the Document
```

```python
docs[0].page_content[:400]  # a content of the Document
```
