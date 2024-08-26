---
translated: true
---

# Archivo no estructurado

Este cuaderno cubre cómo usar el paquete `Unstructured` para cargar archivos de muchos tipos. `Unstructured` actualmente admite la carga de archivos de texto, presentaciones de PowerPoint, HTML, PDF, imágenes y más.

```python
# # Install package
%pip install --upgrade --quiet  "unstructured[all-docs]"
```

```python
# # Install other dependencies
# # https://github.com/Unstructured-IO/unstructured/blob/main/docs/source/installing.rst
# !brew install libmagic
# !brew install poppler
# !brew install tesseract
# # If parsing xml / html documents:
# !brew install libxml2
# !brew install libxslt
```

```python
# import nltk
# nltk.download('punkt')
```

```python
from langchain_community.document_loaders import UnstructuredFileLoader
```

```python
loader = UnstructuredFileLoader("./example_data/state_of_the_union.txt")
```

```python
docs = loader.load()
```

```python
docs[0].page_content[:400]
```

```output
'Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.\n\nLast year COVID-19 kept us apart. This year we are finally together again.\n\nTonight, we meet as Democrats Republicans and Independents. But most importantly as Americans.\n\nWith a duty to one another to the American people to the Constit'
```

### Cargar lista de archivos

```python
files = ["./example_data/whatsapp_chat.txt", "./example_data/layout-parser-paper.pdf"]
```

```python
loader = UnstructuredFileLoader(files)
```

```python
docs = loader.load()
```

```python
docs[0].page_content[:400]
```

## Retener elementos

Detrás de escena, Unstructured crea diferentes "elementos" para diferentes fragmentos de texto. De forma predeterminada, los combinamos, pero puede mantener fácilmente esa separación especificando `mode="elements"`.

```python
loader = UnstructuredFileLoader(
    "./example_data/state_of_the_union.txt", mode="elements"
)
```

```python
docs = loader.load()
```

```python
docs[:5]
```

```output
[Document(page_content='Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.', lookup_str='', metadata={'source': '../../state_of_the_union.txt'}, lookup_index=0),
 Document(page_content='Last year COVID-19 kept us apart. This year we are finally together again.', lookup_str='', metadata={'source': '../../state_of_the_union.txt'}, lookup_index=0),
 Document(page_content='Tonight, we meet as Democrats Republicans and Independents. But most importantly as Americans.', lookup_str='', metadata={'source': '../../state_of_the_union.txt'}, lookup_index=0),
 Document(page_content='With a duty to one another to the American people to the Constitution.', lookup_str='', metadata={'source': '../../state_of_the_union.txt'}, lookup_index=0),
 Document(page_content='And with an unwavering resolve that freedom will always triumph over tyranny.', lookup_str='', metadata={'source': '../../state_of_the_union.txt'}, lookup_index=0)]
```

## Definir una estrategia de partición

El cargador de documentos Unstructured permite a los usuarios pasar un parámetro `strategy` que le indica a `unstructured` cómo particionar el documento. Las estrategias admitidas actualmente son `"hi_res"` (la predeterminada) y `"fast"`. Las estrategias de partición de alta resolución son más precisas, pero tardan más en procesarse. Las estrategias rápidas dividen el documento más rápidamente, pero sacrifican precisión. No todos los tipos de documentos tienen estrategias de partición de alta resolución y rápida por separado. Para esos tipos de documentos, el argumento `strategy` se ignora. En algunos casos, la estrategia de alta resolución se revertirá a rápida si falta una dependencia (es decir, un modelo para la partición de documentos). Puede ver cómo aplicar una estrategia a un `UnstructuredFileLoader` a continuación.

```python
from langchain_community.document_loaders import UnstructuredFileLoader
```

```python
loader = UnstructuredFileLoader(
    "layout-parser-paper-fast.pdf", strategy="fast", mode="elements"
)
```

```python
docs = loader.load()
```

```python
docs[:5]
```

```output
[Document(page_content='1', lookup_str='', metadata={'source': 'layout-parser-paper-fast.pdf', 'filename': 'layout-parser-paper-fast.pdf', 'page_number': 1, 'category': 'UncategorizedText'}, lookup_index=0),
 Document(page_content='2', lookup_str='', metadata={'source': 'layout-parser-paper-fast.pdf', 'filename': 'layout-parser-paper-fast.pdf', 'page_number': 1, 'category': 'UncategorizedText'}, lookup_index=0),
 Document(page_content='0', lookup_str='', metadata={'source': 'layout-parser-paper-fast.pdf', 'filename': 'layout-parser-paper-fast.pdf', 'page_number': 1, 'category': 'UncategorizedText'}, lookup_index=0),
 Document(page_content='2', lookup_str='', metadata={'source': 'layout-parser-paper-fast.pdf', 'filename': 'layout-parser-paper-fast.pdf', 'page_number': 1, 'category': 'UncategorizedText'}, lookup_index=0),
 Document(page_content='n', lookup_str='', metadata={'source': 'layout-parser-paper-fast.pdf', 'filename': 'layout-parser-paper-fast.pdf', 'page_number': 1, 'category': 'Title'}, lookup_index=0)]
```

## Ejemplo de PDF

Procesar documentos PDF funciona exactamente de la misma manera. Unstructured detecta el tipo de archivo y extrae los mismos tipos de elementos. Los modos de operación son:
- `single` todo el texto de todos los elementos se combina en uno (predeterminado)
- `elements` mantiene los elementos individuales
- `paged` los textos de cada página solo se combinan

```python
!wget  https://raw.githubusercontent.com/Unstructured-IO/unstructured/main/example-docs/layout-parser-paper.pdf -P "../../"
```

```python
loader = UnstructuredFileLoader(
    "./example_data/layout-parser-paper.pdf", mode="elements"
)
```

```python
docs = loader.load()
```

```python
docs[:5]
```

```output
[Document(page_content='LayoutParser : A Uniﬁed Toolkit for Deep Learning Based Document Image Analysis', lookup_str='', metadata={'source': '../../layout-parser-paper.pdf'}, lookup_index=0),
 Document(page_content='Zejiang Shen 1 ( (ea)\n ), Ruochen Zhang 2 , Melissa Dell 3 , Benjamin Charles Germain Lee 4 , Jacob Carlson 3 , and Weining Li 5', lookup_str='', metadata={'source': '../../layout-parser-paper.pdf'}, lookup_index=0),
 Document(page_content='Allen Institute for AI shannons@allenai.org', lookup_str='', metadata={'source': '../../layout-parser-paper.pdf'}, lookup_index=0),
 Document(page_content='Brown University ruochen zhang@brown.edu', lookup_str='', metadata={'source': '../../layout-parser-paper.pdf'}, lookup_index=0),
 Document(page_content='Harvard University { melissadell,jacob carlson } @fas.harvard.edu', lookup_str='', metadata={'source': '../../layout-parser-paper.pdf'}, lookup_index=0)]
```

Si necesita postprocesar los elementos `unstructured` después de la extracción, puede pasar una lista de funciones `str` -> `str` al argumento `post_processors` cuando instancie el `UnstructuredFileLoader`. Esto también se aplica a otros cargadores de Unstructured. A continuación se muestra un ejemplo.

```python
from langchain_community.document_loaders import UnstructuredFileLoader
from unstructured.cleaners.core import clean_extra_whitespace
```

```python
loader = UnstructuredFileLoader(
    "./example_data/layout-parser-paper.pdf",
    mode="elements",
    post_processors=[clean_extra_whitespace],
)
```

```python
docs = loader.load()
```

```python
docs[:5]
```

```output
[Document(page_content='LayoutParser: A Uniﬁed Toolkit for Deep Learning Based Document Image Analysis', metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((157.62199999999999, 114.23496279999995), (157.62199999999999, 146.5141628), (457.7358962799999, 146.5141628), (457.7358962799999, 114.23496279999995)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'filename': 'layout-parser-paper.pdf', 'file_directory': './example_data', 'filetype': 'application/pdf', 'page_number': 1, 'category': 'Title'}),
 Document(page_content='Zejiang Shen1 ((cid:0)), Ruochen Zhang2, Melissa Dell3, Benjamin Charles Germain Lee4, Jacob Carlson3, and Weining Li5', metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((134.809, 168.64029940800003), (134.809, 192.2517444), (480.5464199080001, 192.2517444), (480.5464199080001, 168.64029940800003)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'filename': 'layout-parser-paper.pdf', 'file_directory': './example_data', 'filetype': 'application/pdf', 'page_number': 1, 'category': 'UncategorizedText'}),
 Document(page_content='1 Allen Institute for AI shannons@allenai.org 2 Brown University ruochen zhang@brown.edu 3 Harvard University {melissadell,jacob carlson}@fas.harvard.edu 4 University of Washington bcgl@cs.washington.edu 5 University of Waterloo w422li@uwaterloo.ca', metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((207.23000000000002, 202.57205439999996), (207.23000000000002, 311.8195408), (408.12676, 311.8195408), (408.12676, 202.57205439999996)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'filename': 'layout-parser-paper.pdf', 'file_directory': './example_data', 'filetype': 'application/pdf', 'page_number': 1, 'category': 'UncategorizedText'}),
 Document(page_content='1 2 0 2', metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((16.34, 213.36), (16.34, 253.36), (36.34, 253.36), (36.34, 213.36)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'filename': 'layout-parser-paper.pdf', 'file_directory': './example_data', 'filetype': 'application/pdf', 'page_number': 1, 'category': 'UncategorizedText'}),
 Document(page_content='n u J', metadata={'source': './example_data/layout-parser-paper.pdf', 'coordinates': {'points': ((16.34, 258.36), (16.34, 286.14), (36.34, 286.14), (36.34, 258.36)), 'system': 'PixelSpace', 'layout_width': 612, 'layout_height': 792}, 'filename': 'layout-parser-paper.pdf', 'file_directory': './example_data', 'filetype': 'application/pdf', 'page_number': 1, 'category': 'Title'})]
```

## API de Unstructured

Si desea ponerse en marcha con menos configuración, puede simplemente ejecutar `pip install unstructured` y usar `UnstructuredAPIFileLoader` o `UnstructuredAPIFileIOLoader`. Eso procesará su documento usando la API alojada de Unstructured. Puede generar una clave de API gratuita de Unstructured [aquí](https://www.unstructured.io/api-key/). La [documentación de Unstructured](https://unstructured-io.github.io/unstructured/) tendrá instrucciones sobre cómo generar una clave de API una vez que estén disponibles. Consulte las instrucciones [aquí](https://github.com/Unstructured-IO/unstructured-api#dizzy-instructions-for-using-the-docker-image) si desea alojar la API de Unstructured o ejecutarla localmente.

```python
from langchain_community.document_loaders import UnstructuredAPIFileLoader
```

```python
filenames = ["example_data/fake.docx", "example_data/fake-email.eml"]
```

```python
loader = UnstructuredAPIFileLoader(
    file_path=filenames[0],
    api_key="FAKE_API_KEY",
)
```

```python
docs = loader.load()
docs[0]
```

```output
Document(page_content='Lorem ipsum dolor sit amet.', metadata={'source': 'example_data/fake.docx'})
```

También puede procesar varios archivos a través de la API de Unstructured en una sola API usando `UnstructuredAPIFileLoader`.

```python
loader = UnstructuredAPIFileLoader(
    file_path=filenames,
    api_key="FAKE_API_KEY",
)
```

```python
docs = loader.load()
docs[0]
```

```output
Document(page_content='Lorem ipsum dolor sit amet.\n\nThis is a test email to use for unit tests.\n\nImportant points:\n\nRoses are red\n\nViolets are blue', metadata={'source': ['example_data/fake.docx', 'example_data/fake-email.eml']})
```
