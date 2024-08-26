---
translated: true
---

# Dividir por sección HTML

## Descripción y motivación

Similar en concepto al [HTMLHeaderTextSplitter](/docs/modules/data_connection/document_transformers/HTML_header_metadata), el `HTMLSectionSplitter` es un divisor "consciente de la estructura" que divide el texto a nivel de elemento y agrega metadatos para cada encabezado "relevante" para cualquier fragmento dado. Puede devolver fragmentos elemento por elemento o combinar elementos con los mismos metadatos, con los objetivos de (a) mantener agrupado el texto relacionado (más o menos) semánticamente y (b) preservar la información rica en contexto codificada en las estructuras del documento. Se puede usar con otros divisores de texto como parte de una canalización de división. Internamente, utiliza el `RecursiveCharacterTextSplitter` cuando el tamaño de la sección es mayor que el tamaño del fragmento. También considera el tamaño de fuente del texto para determinar si es una sección o no en función del umbral de tamaño de fuente determinado. Use `xslt_path` para proporcionar una ruta absoluta para transformar el HTML para que pueda detectar secciones en función de las etiquetas proporcionadas. El valor predeterminado es usar el archivo `converting_to_header.xslt` en el directorio `data_connection/document_transformers`. Esto es para convertir el html a un formato/diseño más fácil de detectar secciones. Por ejemplo, `span` en función de su tamaño de fuente se puede convertir a etiquetas de encabezado para ser detectado como una sección.

## Ejemplos de uso

#### 1) Con una cadena HTML:

```python
from langchain_text_splitters import HTMLSectionSplitter

html_string = """
    <!DOCTYPE html>
    <html>
    <body>
        <div>
            <h1>Foo</h1>
            <p>Some intro text about Foo.</p>
            <div>
                <h2>Bar main section</h2>
                <p>Some intro text about Bar.</p>
                <h3>Bar subsection 1</h3>
                <p>Some text about the first subtopic of Bar.</p>
                <h3>Bar subsection 2</h3>
                <p>Some text about the second subtopic of Bar.</p>
            </div>
            <div>
                <h2>Baz</h2>
                <p>Some text about Baz</p>
            </div>
            <br>
            <p>Some concluding text about Foo</p>
        </div>
    </body>
    </html>
"""

headers_to_split_on = [("h1", "Header 1"), ("h2", "Header 2")]

html_splitter = HTMLSectionSplitter(headers_to_split_on=headers_to_split_on)
html_header_splits = html_splitter.split_text(html_string)
html_header_splits
```

#### 2) Canalizado a otro divisor, con html cargado desde un contenido de cadena html:

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

html_string = """
    <!DOCTYPE html>
    <html>
    <body>
        <div>
            <h1>Foo</h1>
            <p>Some intro text about Foo.</p>
            <div>
                <h2>Bar main section</h2>
                <p>Some intro text about Bar.</p>
                <h3>Bar subsection 1</h3>
                <p>Some text about the first subtopic of Bar.</p>
                <h3>Bar subsection 2</h3>
                <p>Some text about the second subtopic of Bar.</p>
            </div>
            <div>
                <h2>Baz</h2>
                <p>Some text about Baz</p>
            </div>
            <br>
            <p>Some concluding text about Foo</p>
        </div>
    </body>
    </html>
"""

headers_to_split_on = [
    ("h1", "Header 1"),
    ("h2", "Header 2"),
    ("h3", "Header 3"),
    ("h4", "Header 4"),
]

html_splitter = HTMLSectionSplitter(headers_to_split_on=headers_to_split_on)

html_header_splits = html_splitter.split_text(html_string)

chunk_size = 500
chunk_overlap = 30
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=chunk_size, chunk_overlap=chunk_overlap
)

# Split
splits = text_splitter.split_documents(html_header_splits)
splits
```
