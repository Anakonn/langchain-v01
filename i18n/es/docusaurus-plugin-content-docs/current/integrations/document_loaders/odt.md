---
translated: true
---

# Formato de Documento Abierto (ODT)

>El [Formato de Documento Abierto para Aplicaciones de Oficina (ODF)](https://en.wikipedia.org/wiki/OpenDocument), también conocido como `OpenDocument`, es un formato de archivo abierto para documentos de procesamiento de texto, hojas de cálculo, presentaciones y gráficos, utilizando archivos XML comprimidos con ZIP. Fue desarrollado con el objetivo de proporcionar una especificación de formato de archivo abierto y basado en XML para aplicaciones de oficina.

>El estándar es desarrollado y mantenido por un comité técnico en el consorcio de la Organización para el Avance de Estándares de Información Estructurada (`OASIS`). Se basó en la especificación de Sun Microsystems para OpenOffice.org XML, el formato predeterminado para `OpenOffice.org` y `LibreOffice`. Originalmente se desarrolló para `StarOffice` "para proporcionar un estándar abierto para documentos de oficina".

El `UnstructuredODTLoader` se utiliza para cargar archivos `Open Office ODT`.

```python
from langchain_community.document_loaders import UnstructuredODTLoader
```

```python
loader = UnstructuredODTLoader("example_data/fake.odt", mode="elements")
docs = loader.load()
docs[0]
```

```output
Document(page_content='Lorem ipsum dolor sit amet.', metadata={'source': 'example_data/fake.odt', 'filename': 'example_data/fake.odt', 'category': 'Title'})
```
