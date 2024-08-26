---
translated: true
---

# Plugin ChatGPT

>[Plugins OpenAI](https://platform.openai.com/docs/plugins/introduction) connectent `ChatGPT` à des applications tierces. Ces plugins permettent à `ChatGPT` d'interagir avec des API définies par les développeurs, améliorant les capacités de `ChatGPT` et lui permettant d'effectuer une grande variété d'actions.

>Les plugins permettent à `ChatGPT` de faire des choses comme :
>- Récupérer des informations en temps réel ; par exemple, les scores sportifs, les cours de bourse, les dernières nouvelles, etc.
>- Récupérer des informations de la base de connaissances ; par exemple, des documents d'entreprise, des notes personnelles, etc.
>- Effectuer des actions au nom de l'utilisateur ; par exemple, réserver un vol, commander de la nourriture, etc.

Ce notebook montre comment utiliser le plugin ChatGPT Retriever dans LangChain.

```python
# STEP 1: Load

# Load documents using LangChain's DocumentLoaders
# This is from https://langchain.readthedocs.io/en/latest/modules/document_loaders/examples/csv.html

from langchain_community.document_loaders import CSVLoader

loader = CSVLoader(
    file_path="../../document_loaders/examples/example_data/mlb_teams_2012.csv"
)
data = loader.load()


# STEP 2: Convert

# Convert Document to format expected by https://github.com/openai/chatgpt-retrieval-plugin
import json
from typing import List

from langchain_community.docstore.document import Document


def write_json(path: str, documents: List[Document]) -> None:
    results = [{"text": doc.page_content} for doc in documents]
    with open(path, "w") as f:
        json.dump(results, f, indent=2)


write_json("foo.json", data)

# STEP 3: Use

# Ingest this as you would any other json file in https://github.com/openai/chatgpt-retrieval-plugin/tree/main/scripts/process_json
```

## Utilisation du plugin ChatGPT Retriever

D'accord, nous avons créé le plugin ChatGPT Retriever, mais comment l'utiliser réellement ?

Le code ci-dessous explique comment faire.

Nous voulons utiliser `ChatGPTPluginRetriever`, donc nous devons obtenir la clé API OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key: ········
```

```python
from langchain_community.retrievers import (
    ChatGPTPluginRetriever,
)
```

```python
retriever = ChatGPTPluginRetriever(url="http://0.0.0.0:8000", bearer_token="foo")
```

```python
retriever.invoke("alice's phone number")
```

```output
[Document(page_content="This is Alice's phone number: 123-456-7890", lookup_str='', metadata={'id': '456_0', 'metadata': {'source': 'email', 'source_id': '567', 'url': None, 'created_at': '1609592400.0', 'author': 'Alice', 'document_id': '456'}, 'embedding': None, 'score': 0.925571561}, lookup_index=0),
 Document(page_content='This is a document about something', lookup_str='', metadata={'id': '123_0', 'metadata': {'source': 'file', 'source_id': 'https://example.com/doc1', 'url': 'https://example.com/doc1', 'created_at': '1609502400.0', 'author': 'Alice', 'document_id': '123'}, 'embedding': None, 'score': 0.6987589}, lookup_index=0),
 Document(page_content='Team: Angels "Payroll (millions)": 154.49 "Wins": 89', lookup_str='', metadata={'id': '59c2c0c1-ae3f-4272-a1da-f44a723ea631_0', 'metadata': {'source': None, 'source_id': None, 'url': None, 'created_at': None, 'author': None, 'document_id': '59c2c0c1-ae3f-4272-a1da-f44a723ea631'}, 'embedding': None, 'score': 0.697888613}, lookup_index=0)]
```
