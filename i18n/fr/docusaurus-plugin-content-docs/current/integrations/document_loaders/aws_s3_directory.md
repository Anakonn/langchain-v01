---
translated: true
---

# Répertoire AWS S3

>[Amazon Simple Storage Service (Amazon S3)](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-folders.html) est un service de stockage d'objets

>[Répertoire AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-folders.html)

Cela couvre comment charger des objets de document à partir d'un objet `Répertoire AWS S3`.

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

## Spécification d'un préfixe

Vous pouvez également spécifier un préfixe pour un contrôle plus fin sur les fichiers à charger.

```python
loader = S3DirectoryLoader("testing-hwc", prefix="fake")
```

```python
loader.load()
```

```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': 's3://testing-hwc/fake.docx'}, lookup_index=0)]
```

## Configuration du client AWS Boto3

Vous pouvez configurer le client AWS [Boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html) en passant des arguments nommés lors de la création de S3DirectoryLoader.
Cela est utile par exemple lorsque les informations d'identification AWS ne peuvent pas être définies en tant que variables d'environnement.
Voir la [liste des paramètres](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/core/session.html#boto3.session.Session) qui peuvent être configurés.

```python
loader = S3DirectoryLoader(
    "testing-hwc", aws_access_key_id="xxxx", aws_secret_access_key="yyyy"
)
```

```python
loader.load()
```
