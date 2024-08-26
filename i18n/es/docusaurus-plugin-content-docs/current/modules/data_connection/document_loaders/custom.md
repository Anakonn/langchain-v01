---
translated: true
---

Aquí está la traducción al español (es) del documento:

---
sidebar_position: 10
title: Cargador de Documentos Personalizado
translated: true
---

# Cargador de Documentos Personalizado

## Resumen

Las aplicaciones basadas en LLM (Modelos de Lenguaje de Gran Tamaño) a menudo implican extraer datos de bases de datos o archivos, como PDFs, y convertirlos en un formato que los LLM puedan utilizar. En LangChain, esto generalmente implica crear objetos Document, que encapsulan el texto extraído (`page_content`) junto con metadatos: un diccionario que contiene detalles sobre el documento, como el nombre del autor o la fecha de publicación.

Los objetos `Document` a menudo se formatean en indicaciones que se alimentan en un LLM, lo que permite que el LLM use la información en el `Document` para generar una respuesta deseada (por ejemplo, resumir el documento).
Los `Documents` se pueden usar de inmediato o indexar en un vectorstore para su futura recuperación y uso.

Las principales abstracciones para la carga de documentos son:

| Componente      | Descripción                    |
|----------------|--------------------------------|
| Document       | Contiene `text` y `metadata` |
| BaseLoader     | Se usa para convertir datos sin procesar en `Documents`  |
| Blob           | Una representación de datos binarios que se encuentra en un archivo o en la memoria |
| BaseBlobParser | Lógica para analizar un `Blob` y generar objetos `Document` |

Esta guía demostrará cómo escribir una lógica de carga de documentos y análisis de archivos personalizados; específicamente, veremos cómo:

1. Crear un Cargador de Documentos estándar subclasificando de `BaseLoader`.
2. Crear un analizador usando `BaseBlobParser` y usarlo en conjunto con `Blob` y `BlobLoaders`. Esto es útil principalmente cuando se trabaja con archivos.

## Cargador de Documentos Estándar

Un cargador de documentos se puede implementar subclasificando de un `BaseLoader` que proporciona una interfaz estándar para cargar documentos.

### Interfaz

| Nombre del Método | Explicación |
|-------------------|-------------|
| lazy_load   | Se usa para cargar documentos uno por uno **de forma perezosa**. Usar para código de producción. |
| alazy_load  | Variante asíncrona de `lazy_load` |
| load        | Se usa para cargar todos los documentos en memoria **de forma ávida**. Usar para prototipado o trabajo interactivo. |
| aload       | Se usa para cargar todos los documentos en memoria **de forma ávida**. Usar para prototipado o trabajo interactivo. **Agregado en 2024-04 a LangChain.** |

* El método `load` es un método de conveniencia destinado únicamente al trabajo de prototipado: simplemente invoca `list(self.lazy_load())`.
* `alazy_load` tiene una implementación predeterminada que delegará en `lazy_load`. Si estás usando async, te recomendamos anular la implementación predeterminada y proporcionar una implementación async nativa.

::: {.callout-important}
Al implementar un cargador de documentos, **NO** proporciones parámetros a través de los métodos `lazy_load` o `alazy_load`.

Se espera que toda la configuración se pase a través del inicializador (__init__). Esta fue una decisión de diseño tomada por LangChain para asegurarse de que una vez que se haya instanciado un cargador de documentos, tenga toda la información necesaria para cargar documentos.
:::

### Implementación

Creemos un ejemplo de un cargador de documentos estándar que carga un archivo y crea un documento a partir de cada línea del archivo.

```python
from typing import AsyncIterator, Iterator

from langchain_core.document_loaders import BaseLoader
from langchain_core.documents import Document


class CustomDocumentLoader(BaseLoader):
    """An example document loader that reads a file line by line."""

    def __init__(self, file_path: str) -> None:
        """Initialize the loader with a file path.

        Args:
            file_path: The path to the file to load.
        """
        self.file_path = file_path

    def lazy_load(self) -> Iterator[Document]:  # <-- Does not take any arguments
        """A lazy loader that reads a file line by line.

        When you're implementing lazy load methods, you should use a generator
        to yield documents one by one.
        """
        with open(self.file_path, encoding="utf-8") as f:
            line_number = 0
            for line in f:
                yield Document(
                    page_content=line,
                    metadata={"line_number": line_number, "source": self.file_path},
                )
                line_number += 1

    # alazy_load is OPTIONAL.
    # If you leave out the implementation, a default implementation which delegates to lazy_load will be used!
    async def alazy_load(
        self,
    ) -> AsyncIterator[Document]:  # <-- Does not take any arguments
        """An async lazy loader that reads a file line by line."""
        # Requires aiofiles
        # Install with `pip install aiofiles`
        # https://github.com/Tinche/aiofiles
        import aiofiles

        async with aiofiles.open(self.file_path, encoding="utf-8") as f:
            line_number = 0
            async for line in f:
                yield Document(
                    page_content=line,
                    metadata={"line_number": line_number, "source": self.file_path},
                )
                line_number += 1
```

### Prueba 🧪

Para probar el cargador de documentos, necesitamos un archivo con un contenido de calidad.

```python
with open("./meow.txt", "w", encoding="utf-8") as f:
    quality_content = "meow meow🐱 \n meow meow🐱 \n meow😻😻"
    f.write(quality_content)

loader = CustomDocumentLoader("./meow.txt")
```

```python
## Test out the lazy load interface
for doc in loader.lazy_load():
    print()
    print(type(doc))
    print(doc)
```

```output

<class 'langchain_core.documents.base.Document'>
page_content='meow meow🐱 \n' metadata={'line_number': 0, 'source': './meow.txt'}

<class 'langchain_core.documents.base.Document'>
page_content=' meow meow🐱 \n' metadata={'line_number': 1, 'source': './meow.txt'}

<class 'langchain_core.documents.base.Document'>
page_content=' meow😻😻' metadata={'line_number': 2, 'source': './meow.txt'}
```

```python
## Test out the async implementation
async for doc in loader.alazy_load():
    print()
    print(type(doc))
    print(doc)
```

```output

<class 'langchain_core.documents.base.Document'>
page_content='meow meow🐱 \n' metadata={'line_number': 0, 'source': './meow.txt'}

<class 'langchain_core.documents.base.Document'>
page_content=' meow meow🐱 \n' metadata={'line_number': 1, 'source': './meow.txt'}

<class 'langchain_core.documents.base.Document'>
page_content=' meow😻😻' metadata={'line_number': 2, 'source': './meow.txt'}
```

::: {.callout-tip}

`load()` puede ser útil en un entorno interactivo como un cuaderno de Jupyter.

Evita usarlo para código de producción, ya que la carga ávida asume que todo el contenido
puede caber en la memoria, lo que no siempre es el caso, especialmente para datos empresariales.
:::

```python
loader.load()
```

```output
[Document(page_content='meow meow🐱 \n', metadata={'line_number': 0, 'source': './meow.txt'}),
 Document(page_content=' meow meow🐱 \n', metadata={'line_number': 1, 'source': './meow.txt'}),
 Document(page_content=' meow😻😻', metadata={'line_number': 2, 'source': './meow.txt'})]
```

## Trabajar con Archivos

Muchos cargadores de documentos implican analizar archivos. La diferencia entre tales cargadores suele provenir de cómo se analiza el archivo en lugar de cómo se carga. Por ejemplo, puedes usar `open` para leer el contenido binario de un PDF o un archivo Markdown, pero necesitas una lógica de análisis diferente para convertir esos datos binarios en texto.

Como resultado, puede ser útil separar la lógica de análisis de la lógica de carga, lo que facilita reutilizar un analizador determinado independientemente de cómo se cargaron los datos.

### BaseBlobParser

Un `BaseBlobParser` es una interfaz que acepta un `blob` y genera una lista de objetos `Document`. Un `blob` es una representación de datos que se encuentra en la memoria o en un archivo. El Python de LangChain tiene un primitivo `Blob` que se inspira en la [especificación Blob WebAPI](https://developer.mozilla.org/en-US/docs/Web/API/Blob).

```python
from langchain_core.document_loaders import BaseBlobParser, Blob


class MyParser(BaseBlobParser):
    """A simple parser that creates a document from each line."""

    def lazy_parse(self, blob: Blob) -> Iterator[Document]:
        """Parse a blob into a document line by line."""
        line_number = 0
        with blob.as_bytes_io() as f:
            for line in f:
                line_number += 1
                yield Document(
                    page_content=line,
                    metadata={"line_number": line_number, "source": blob.source},
                )
```

```python
blob = Blob.from_path("./meow.txt")
parser = MyParser()
```

```python
list(parser.lazy_parse(blob))
```

```output
[Document(page_content='meow meow🐱 \n', metadata={'line_number': 1, 'source': './meow.txt'}),
 Document(page_content=' meow meow🐱 \n', metadata={'line_number': 2, 'source': './meow.txt'}),
 Document(page_content=' meow😻😻', metadata={'line_number': 3, 'source': './meow.txt'})]
```

¡El uso de la API **blob** también permite cargar contenido directamente desde la memoria sin tener que leerlo desde un archivo!

```python
blob = Blob(data=b"some data from memory\nmeow")
list(parser.lazy_parse(blob))
```

```output
[Document(page_content='some data from memory\n', metadata={'line_number': 1, 'source': None}),
 Document(page_content='meow', metadata={'line_number': 2, 'source': None})]
```

### Blob

Echemos un vistazo rápido a la API Blob.

```python
blob = Blob.from_path("./meow.txt", metadata={"foo": "bar"})
```

```python
blob.encoding
```

```output
'utf-8'
```

```python
blob.as_bytes()
```

```output
b'meow meow\xf0\x9f\x90\xb1 \n meow meow\xf0\x9f\x90\xb1 \n meow\xf0\x9f\x98\xbb\xf0\x9f\x98\xbb'
```

```python
blob.as_string()
```

```output
'meow meow🐱 \n meow meow🐱 \n meow😻😻'
```

```python
blob.as_bytes_io()
```

```output
<contextlib._GeneratorContextManager at 0x743f34324450>
```

```python
blob.metadata
```

```output
{'foo': 'bar'}
```

```python
blob.source
```

```output
'./meow.txt'
```

### Cargadores de blobs

Mientras que un analizador encapsula la lógica necesaria para analizar datos binarios en documentos, *los cargadores de blobs* encapsulan la lógica necesaria para cargar blobs desde una ubicación de almacenamiento determinada.

En este momento, `LangChain` solo admite `FileSystemBlobLoader`.

Puede usar `FileSystemBlobLoader` para cargar blobs y luego usar el analizador para analizarlos.

```python
from langchain_community.document_loaders.blob_loaders import FileSystemBlobLoader

blob_loader = FileSystemBlobLoader(path=".", glob="*.mdx", show_progress=True)
```

```python
parser = MyParser()
for blob in blob_loader.yield_blobs():
    for doc in parser.lazy_parse(blob):
        print(doc)
        break
```

```output
  0%|          | 0/8 [00:00<?, ?it/s]
```

```output
page_content='# Microsoft Office\n' metadata={'line_number': 1, 'source': 'office_file.mdx'}
page_content='# Markdown\n' metadata={'line_number': 1, 'source': 'markdown.mdx'}
page_content='# JSON\n' metadata={'line_number': 1, 'source': 'json.mdx'}
page_content='---\n' metadata={'line_number': 1, 'source': 'pdf.mdx'}
page_content='---\n' metadata={'line_number': 1, 'source': 'index.mdx'}
page_content='# File Directory\n' metadata={'line_number': 1, 'source': 'file_directory.mdx'}
page_content='# CSV\n' metadata={'line_number': 1, 'source': 'csv.mdx'}
page_content='# HTML\n' metadata={'line_number': 1, 'source': 'html.mdx'}
```

### Cargador genérico

LangChain tiene una abstracción `GenericLoader` que compone un `BlobLoader` con un `BaseBlobParser`.

`GenericLoader` está diseñado para proporcionar métodos de clase estandarizados que faciliten el uso de las implementaciones existentes de `BlobLoader`. En este momento, solo se admite `FileSystemBlobLoader`.

```python
from langchain_community.document_loaders.generic import GenericLoader

loader = GenericLoader.from_filesystem(
    path=".", glob="*.mdx", show_progress=True, parser=MyParser()
)

for idx, doc in enumerate(loader.lazy_load()):
    if idx < 5:
        print(doc)

print("... output truncated for demo purposes")
```

```output
  0%|          | 0/8 [00:00<?, ?it/s]
```

```output
page_content='# Microsoft Office\n' metadata={'line_number': 1, 'source': 'office_file.mdx'}
page_content='\n' metadata={'line_number': 2, 'source': 'office_file.mdx'}
page_content='>[The Microsoft Office](https://www.office.com/) suite of productivity software includes Microsoft Word, Microsoft Excel, Microsoft PowerPoint, Microsoft Outlook, and Microsoft OneNote. It is available for Microsoft Windows and macOS operating systems. It is also available on Android and iOS.\n' metadata={'line_number': 3, 'source': 'office_file.mdx'}
page_content='\n' metadata={'line_number': 4, 'source': 'office_file.mdx'}
page_content='This covers how to load commonly used file formats including `DOCX`, `XLSX` and `PPTX` documents into a document format that we can use downstream.\n' metadata={'line_number': 5, 'source': 'office_file.mdx'}
... output truncated for demo purposes
```

#### Cargador genérico personalizado

Si realmente le gusta crear clases, puede subclasificar y crear una clase para encapsular la lógica juntas.

Puede subclasificar de esta clase para cargar contenido usando un cargador existente.

```python
from typing import Any


class MyCustomLoader(GenericLoader):
    @staticmethod
    def get_parser(**kwargs: Any) -> BaseBlobParser:
        """Override this method to associate a default parser with the class."""
        return MyParser()
```

```python
loader = MyCustomLoader.from_filesystem(path=".", glob="*.mdx", show_progress=True)

for idx, doc in enumerate(loader.lazy_load()):
    if idx < 5:
        print(doc)

print("... output truncated for demo purposes")
```

```output
  0%|          | 0/8 [00:00<?, ?it/s]
```

```output
page_content='# Microsoft Office\n' metadata={'line_number': 1, 'source': 'office_file.mdx'}
page_content='\n' metadata={'line_number': 2, 'source': 'office_file.mdx'}
page_content='>[The Microsoft Office](https://www.office.com/) suite of productivity software includes Microsoft Word, Microsoft Excel, Microsoft PowerPoint, Microsoft Outlook, and Microsoft OneNote. It is available for Microsoft Windows and macOS operating systems. It is also available on Android and iOS.\n' metadata={'line_number': 3, 'source': 'office_file.mdx'}
page_content='\n' metadata={'line_number': 4, 'source': 'office_file.mdx'}
page_content='This covers how to load commonly used file formats including `DOCX`, `XLSX` and `PPTX` documents into a document format that we can use downstream.\n' metadata={'line_number': 5, 'source': 'office_file.mdx'}
... output truncated for demo purposes
```
