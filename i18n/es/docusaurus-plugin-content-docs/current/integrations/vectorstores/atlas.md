---
translated: true
---

# Atlas

>[Atlas](https://docs.nomic.ai/index.html) es una plataforma de Nomic diseñada para interactuar con conjuntos de datos no estructurados, tanto pequeños como a escala de Internet. Permite a cualquiera visualizar, buscar y compartir conjuntos de datos masivos en su navegador.

Este cuaderno le muestra cómo usar la funcionalidad relacionada con el `AtlasDB` vectorstore.

```python
%pip install --upgrade --quiet  spacy
```

```python
!python3 -m spacy download en_core_web_sm
```

```python
%pip install --upgrade --quiet  nomic
```

### Cargar paquetes

```python
import time

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import AtlasDB
from langchain_text_splitters import SpacyTextSplitter
```

```python
ATLAS_TEST_API_KEY = "7xDPkYXSYDc1_ErdTPIcoAR9RNd8YDlkS3nVNXcVoIMZ6"
```

### Preparar los datos

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = SpacyTextSplitter(separator="|")
texts = []
for doc in text_splitter.split_documents(documents):
    texts.extend(doc.page_content.split("|"))

texts = [e.strip() for e in texts]
```

### Mapear los datos usando Atlas de Nomic

```python
db = AtlasDB.from_texts(
    texts=texts,
    name="test_index_" + str(time.time()),  # unique name for your vector store
    description="test_index",  # a description for your vector store
    api_key=ATLAS_TEST_API_KEY,
    index_kwargs={"build_topic_model": True},
)
```

```python
db.project.wait_for_project_lock()
```

```python
db.project
```

Aquí hay un mapa con el resultado de este código. Este mapa muestra los textos del Estado de la Unión.
https://atlas.nomic.ai/map/3e4de075-89ff-486a-845c-36c23f30bb67/d8ce2284-8edb-4050-8b9b-9bb543d7f647
