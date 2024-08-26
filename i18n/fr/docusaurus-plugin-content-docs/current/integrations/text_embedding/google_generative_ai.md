---
translated: true
---

# Embeddings de l'IA générative de Google

Connectez-vous au service d'embeddings d'IA générative de Google en utilisant la classe `GoogleGenerativeAIEmbeddings`, disponible dans le package [langchain-google-genai](https://pypi.org/project/langchain-google-genai/).

## Installation

```python
%pip install --upgrade --quiet  langchain-google-genai
```

## Identifiants

```python
import getpass
import os

if "GOOGLE_API_KEY" not in os.environ:
    os.environ["GOOGLE_API_KEY"] = getpass("Provide your Google API key here")
```

## Utilisation

```python
from langchain_google_genai import GoogleGenerativeAIEmbeddings

embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
vector = embeddings.embed_query("hello, world!")
vector[:5]
```

```output
[0.05636945, 0.0048285457, -0.0762591, -0.023642512, 0.05329321]
```

## Traitement par lots

Vous pouvez également incorporer plusieurs chaînes de caractères à la fois pour accélérer le traitement :

```python
vectors = embeddings.embed_documents(
    [
        "Today is Monday",
        "Today is Tuesday",
        "Today is April Fools day",
    ]
)
len(vectors), len(vectors[0])
```

```output
(3, 768)
```

## Type de tâche

`GoogleGenerativeAIEmbeddings` prend en charge en option un `task_type`, qui doit actuellement être l'un des suivants :

- task_type_unspecified
- retrieval_query
- retrieval_document
- semantic_similarity
- classification
- clustering

Par défaut, nous utilisons `retrieval_document` dans la méthode `embed_documents` et `retrieval_query` dans la méthode `embed_query`. Si vous fournissez un type de tâche, nous l'utiliserons pour toutes les méthodes.

```python
%pip install --upgrade --quiet  matplotlib scikit-learn
```

```output
Note: you may need to restart the kernel to use updated packages.
```

```python
query_embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001", task_type="retrieval_query"
)
doc_embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001", task_type="retrieval_document"
)
```

Tous ces éléments seront incorporés avec le type de tâche 'retrieval_query' défini

```python
query_vecs = [query_embeddings.embed_query(q) for q in [query, query_2, answer_1]]
```

Tous ces éléments seront incorporés avec le type de tâche 'retrieval_document' défini

```python
doc_vecs = [doc_embeddings.embed_query(q) for q in [query, query_2, answer_1]]
```

Dans la recherche, la distance relative est importante. Dans l'image ci-dessus, vous pouvez voir la différence de scores de similarité entre le "document pertinent" et le "document similaire", avec un delta plus fort entre la requête similaire et le document pertinent dans le dernier cas.

## Configuration supplémentaire

Vous pouvez transmettre les paramètres suivants à ChatGoogleGenerativeAI afin de personnaliser le comportement du SDK :

- `client_options` : [Options du client](https://googleapis.dev/python/google-api-core/latest/client_options.html#module-google.api_core.client_options) à transmettre au client de l'API Google, comme un `client_options["api_endpoint"]` personnalisé.
- `transport` : La méthode de transport à utiliser, comme `rest`, `grpc` ou `grpc_asyncio`.
