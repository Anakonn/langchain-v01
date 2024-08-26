---
translated: true
---

# GitHub

Este cuaderno muestra cómo puede cargar problemas y solicitudes de extracción (PR) para un repositorio dado en [GitHub](https://github.com/). También muestra cómo puede cargar archivos de GitHub para un repositorio dado en [GitHub](https://github.com/). Usaremos el repositorio de Python LangChain como ejemplo.

## Configurar el token de acceso

Para acceder a la API de GitHub, necesita un token de acceso personal: puede configurar el suyo aquí: https://github.com/settings/tokens?type=beta. Puede establecer este token como la variable de entorno ``GITHUB_PERSONAL_ACCESS_TOKEN`` y se extraerá automáticamente, o puede pasarlo directamente en la inicialización como el parámetro con nombre ``access_token``.

```python
# If you haven't set your access token as an environment variable, pass it in here.
from getpass import getpass

ACCESS_TOKEN = getpass()
```

## Cargar problemas y PR

```python
from langchain_community.document_loaders import GitHubIssuesLoader
```

```python
loader = GitHubIssuesLoader(
    repo="langchain-ai/langchain",
    access_token=ACCESS_TOKEN,  # delete/comment out this argument if you've set the access token as an env var.
    creator="UmerHA",
)
```

Carguemos todos los problemas y PR creados por "UmerHA".

Aquí hay una lista de todos los filtros que puede usar:
- include_prs
- milestone
- state
- assignee
- creator
- mentioned
- labels
- sort
- direction
- since

Para más información, consulte https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#list-repository-issues.

```python
docs = loader.load()
```

```python
print(docs[0].page_content)
print(docs[0].metadata)
```

## Solo cargar problemas

De forma predeterminada, la API de GitHub considera que las solicitudes de extracción también son problemas. Para obtener solo los "problemas puros" (es decir, sin solicitudes de extracción), use `include_prs=False`

```python
loader = GitHubIssuesLoader(
    repo="langchain-ai/langchain",
    access_token=ACCESS_TOKEN,  # delete/comment out this argument if you've set the access token as an env var.
    creator="UmerHA",
    include_prs=False,
)
docs = loader.load()
```

```python
print(docs[0].page_content)
print(docs[0].metadata)
```

## Cargar el contenido del archivo de GitHub

Para el código a continuación, carga todos los archivos Markdown en el repositorio `langchain-ai/langchain`

```python
from langchain.document_loaders import GithubFileLoader
```

```python
loader = GithubFileLoader(
    repo="langchain-ai/langchain",  # the repo name
    access_token=ACCESS_TOKEN,
    github_api_url="https://api.github.com",
    file_filter=lambda file_path: file_path.endswith(
        ".md"
    ),  # load all markdowns files.
)
documents = loader.load()
```

ejemplo de salida de uno de los documentos:

```json
documents.metadata:
    {
      "path": "README.md",
      "sha": "82f1c4ea88ecf8d2dfsfx06a700e84be4",
      "source": "https://github.com/langchain-ai/langchain/blob/master/README.md"
    }
documents.content:
    mock content
```
