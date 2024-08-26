---
sidebar_position: 3
title: Gérer les fichiers
translated: true
---

Outre les données texte brutes, vous souhaiterez peut-être extraire des informations à partir d'autres types de fichiers tels que des présentations PowerPoint ou des PDF.

Vous pouvez utiliser les [chargeurs de documents](/docs/modules/data_connection/document_loaders/) LangChain pour analyser les fichiers dans un format texte qui peut être transmis aux LLM.

LangChain propose un grand nombre d'[intégrations de chargeurs de documents](/docs/integrations/document_loaders).

## Analyse basée sur le type MIME

Pour des exemples d'analyse de base, consultez [les chargeurs de documents](/docs/modules/data_connection/document_loaders/).

Ici, nous examinerons l'analyse basée sur le type MIME, qui est souvent utile pour les applications d'extraction si vous écrivez du code serveur qui accepte des fichiers téléchargés par l'utilisateur.

Dans ce cas, il est préférable de supposer que l'extension de fichier du fichier fourni par l'utilisateur est erronée et d'inférer plutôt le type MIME à partir du contenu binaire du fichier.

Téléchargeons du contenu. Il s'agira d'un fichier HTML, mais le code ci-dessous fonctionnera avec d'autres types de fichiers.

```python
import requests

response = requests.get("https://en.wikipedia.org/wiki/Car")
data = response.content
data[:20]
```

```output
b'<!DOCTYPE html>\n<htm'
```

Configurez les analyseurs

```python
import magic
from langchain.document_loaders.parsers import BS4HTMLParser, PDFMinerParser
from langchain.document_loaders.parsers.generic import MimeTypeBasedParser
from langchain.document_loaders.parsers.txt import TextParser
from langchain_community.document_loaders import Blob

# Configure the parsers that you want to use per mime-type!
HANDLERS = {
    "application/pdf": PDFMinerParser(),
    "text/plain": TextParser(),
    "text/html": BS4HTMLParser(),
}

# Instantiate a mimetype based parser with the given parsers
MIMETYPE_BASED_PARSER = MimeTypeBasedParser(
    handlers=HANDLERS,
    fallback_parser=None,
)

mime = magic.Magic(mime=True)
mime_type = mime.from_buffer(data)

# A blob represents binary data by either reference (path on file system)
# or value (bytes in memory).
blob = Blob.from_data(
    data=data,
    mime_type=mime_type,
)

parser = HANDLERS[mime_type]
documents = parser.parse(blob=blob)
```

```python
print(documents[0].page_content[:30].strip())
```

```output
Car - Wikipedia
```
