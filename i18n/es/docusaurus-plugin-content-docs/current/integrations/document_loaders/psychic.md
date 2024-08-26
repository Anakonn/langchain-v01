---
translated: true
---

# Psíquico

Este cuaderno cubre cómo cargar documentos desde `Psychic`. Consulta [aquí](/docs/integrations/providers/psychic) para más detalles.

## Requisitos previos

1. Sigue la sección de Inicio rápido en [este documento](/docs/integrations/providers/psychic)
2. Inicia sesión en el [panel de control de Psychic](https://dashboard.psychic.dev/) y obtén tu clave secreta
3. Instala la biblioteca de reacción frontend en tu aplicación web y haz que un usuario autentique una conexión. La conexión se creará usando el ID de conexión que especifiques.

## Carga de documentos

Usa la clase `PsychicLoader` para cargar documentos desde una conexión. Cada conexión tiene un ID de conector (correspondiente a la aplicación SaaS que se conectó) y un ID de conexión (que pasaste a la biblioteca frontend).

```python
# Uncomment this to install psychicapi if you don't already have it installed
!poetry run pip -q install psychicapi langchain-chroma
```

```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.0.1[0m[39;49m -> [0m[32;49m23.1.2[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
```

```python
from langchain_community.document_loaders import PsychicLoader
from psychicapi import ConnectorId

# Create a document loader for google drive. We can also load from other connectors by setting the connector_id to the appropriate value e.g. ConnectorId.notion.value
# This loader uses our test credentials
google_drive_loader = PsychicLoader(
    api_key="7ddb61c1-8b6a-4d31-a58e-30d1c9ea480e",
    connector_id=ConnectorId.gdrive.value,
    connection_id="google-test",
)

documents = google_drive_loader.load()
```

## Convertir los documentos en incrustaciones

Ahora podemos convertir estos documentos en incrustaciones y almacenarlos en una base de datos de vectores como Chroma

```python
from langchain.chains import RetrievalQAWithSourcesChain
from langchain_chroma import Chroma
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
docsearch = Chroma.from_documents(texts, embeddings)
chain = RetrievalQAWithSourcesChain.from_chain_type(
    OpenAI(temperature=0), chain_type="stuff", retriever=docsearch.as_retriever()
)
chain({"question": "what is psychic?"}, return_only_outputs=True)
```
