---
translated: true
---

# Correo electrónico

Este cuaderno muestra cómo cargar archivos de correo electrónico (`.eml`) o `Microsoft Outlook` (`.msg`).

## Usando Unstructured

```python
%pip install --upgrade --quiet  unstructured
```

```python
from langchain_community.document_loaders import UnstructuredEmailLoader
```

```python
loader = UnstructuredEmailLoader("example_data/fake-email.eml")
```

```python
data = loader.load()
```

```python
data
```

```output
[Document(page_content='This is a test email to use for unit tests.\n\nImportant points:\n\nRoses are red\n\nViolets are blue', metadata={'source': 'example_data/fake-email.eml'})]
```

### Retener elementos

Detrás de escena, Unstructured crea diferentes "elementos" para diferentes fragmentos de texto. De forma predeterminada, los combinamos, pero puede mantener esa separación fácilmente especificando `mode="elements"`.

```python
loader = UnstructuredEmailLoader("example_data/fake-email.eml", mode="elements")
```

```python
data = loader.load()
```

```python
data[0]
```

```output
Document(page_content='This is a test email to use for unit tests.', metadata={'source': 'example_data/fake-email.eml', 'filename': 'fake-email.eml', 'file_directory': 'example_data', 'date': '2022-12-16T17:04:16-05:00', 'filetype': 'message/rfc822', 'sent_from': ['Matthew Robinson <mrobinson@unstructured.io>'], 'sent_to': ['Matthew Robinson <mrobinson@unstructured.io>'], 'subject': 'Test Email', 'category': 'NarrativeText'})
```

### Procesar archivos adjuntos

Puede procesar los archivos adjuntos con `UnstructuredEmailLoader` estableciendo `process_attachments=True` en el constructor. De forma predeterminada, los archivos adjuntos se particionarán usando la función `partition` de `unstructured`. Puede usar una función de partición diferente pasándola al argumento `attachment_partitioner`.

```python
loader = UnstructuredEmailLoader(
    "example_data/fake-email.eml",
    mode="elements",
    process_attachments=True,
)
```

```python
data = loader.load()
```

```python
data[0]
```

```output
Document(page_content='This is a test email to use for unit tests.', metadata={'source': 'example_data/fake-email.eml', 'filename': 'fake-email.eml', 'file_directory': 'example_data', 'date': '2022-12-16T17:04:16-05:00', 'filetype': 'message/rfc822', 'sent_from': ['Matthew Robinson <mrobinson@unstructured.io>'], 'sent_to': ['Matthew Robinson <mrobinson@unstructured.io>'], 'subject': 'Test Email', 'category': 'NarrativeText'})
```

## Usando OutlookMessageLoader

```python
%pip install --upgrade --quiet  extract_msg
```

```python
from langchain_community.document_loaders import OutlookMessageLoader
```

```python
loader = OutlookMessageLoader("example_data/fake-email.msg")
```

```python
data = loader.load()
```

```python
data[0]
```

```output
Document(page_content='This is a test email to experiment with the MS Outlook MSG Extractor\r\n\r\n\r\n-- \r\n\r\n\r\nKind regards\r\n\r\n\r\n\r\n\r\nBrian Zhou\r\n\r\n', metadata={'subject': 'Test for TIF files', 'sender': 'Brian Zhou <brizhou@gmail.com>', 'date': 'Mon, 18 Nov 2013 16:26:24 +0800'})
```
