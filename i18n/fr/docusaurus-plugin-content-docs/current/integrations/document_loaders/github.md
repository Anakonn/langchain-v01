---
translated: true
---

# GitHub

Ce cahier montre comment vous pouvez charger les problèmes et les demandes d'extraction (PR) pour un référentiel donné sur [GitHub](https://github.com/). Montre également comment vous pouvez charger les fichiers GitHub pour un référentiel donné sur [GitHub](https://github.com/). Nous utiliserons le référentiel Python LangChain comme exemple.

## Configurer le jeton d'accès

Pour accéder à l'API GitHub, vous avez besoin d'un jeton d'accès personnel - vous pouvez configurer le vôtre ici : https://github.com/settings/tokens?type=beta. Vous pouvez soit définir ce jeton comme variable d'environnement ``GITHUB_PERSONAL_ACCESS_TOKEN`` et il sera automatiquement récupéré, soit le transmettre directement lors de l'initialisation en tant que paramètre nommé ``access_token``.

```python
# If you haven't set your access token as an environment variable, pass it in here.
from getpass import getpass

ACCESS_TOKEN = getpass()
```

## Charger les problèmes et les PR

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

Chargeons tous les problèmes et les PR créés par "UmerHA".

Voici la liste de tous les filtres que vous pouvez utiliser :
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

Pour plus d'informations, consultez https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#list-repository-issues.

```python
docs = loader.load()
```

```python
print(docs[0].page_content)
print(docs[0].metadata)
```

## Charger uniquement les problèmes

Par défaut, l'API GitHub considère que les demandes d'extraction sont également des problèmes. Pour n'obtenir que les "vrais" problèmes (c'est-à-dire sans les demandes d'extraction), utilisez `include_prs=False`

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

## Charger le contenu des fichiers GitHub

Pour le code ci-dessous, charge tous les fichiers markdown du référentiel `langchain-ai/langchain`

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

exemple de sortie d'un des documents :

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
