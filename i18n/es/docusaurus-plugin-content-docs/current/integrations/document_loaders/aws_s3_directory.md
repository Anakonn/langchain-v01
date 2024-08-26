---
translated: true
---

# Directorio AWS S3

>[Amazon Simple Storage Service (Amazon S3)](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-folders.html) es un servicio de almacenamiento de objetos

>[Directorio AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-folders.html)

Esto cubre cómo cargar objetos de documento desde un objeto `Directorio AWS S3`.

```python
%pip install --upgrade --quiet  boto3
```

```python
from langchain_community.document_loaders import S3DirectoryLoader
```

```python
loader = S3DirectoryLoader("testing-hwc")
```

```python
loader.load()
```

## Especificar un prefijo

También puede especificar un prefijo para un control más detallado sobre qué archivos cargar.

```python
loader = S3DirectoryLoader("testing-hwc", prefix="fake")
```

```python
loader.load()
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': 's3://testing-hwc/fake.docx'}, lookup_index=0)]
```

## Configurar el cliente AWS Boto3

Puede configurar el cliente AWS [Boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html) pasando
argumentos con nombre al crear el S3DirectoryLoader.
Esto es útil, por ejemplo, cuando las credenciales de AWS no se pueden establecer como variables de entorno.
Consulte la [lista de parámetros](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/core/session.html#boto3.session.Session) que se pueden configurar.

```python
loader = S3DirectoryLoader(
    "testing-hwc", aws_access_key_id="xxxx", aws_secret_access_key="yyyy"
)
```

```python
loader.load()
```
