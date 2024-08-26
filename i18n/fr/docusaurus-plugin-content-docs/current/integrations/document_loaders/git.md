---
translated: true
---

# Git

>[Git](https://en.wikipedia.org/wiki/Git) est un système de contrôle de version distribué qui suit les modifications dans un ensemble de fichiers informatiques, généralement utilisé pour coordonner le travail entre les programmeurs qui développent collaborativement le code source pendant le développement de logiciels.

Ce notebook montre comment charger des fichiers texte à partir d'un dépôt `Git`.

## Charger un dépôt existant à partir du disque

```python
%pip install --upgrade --quiet  GitPython
```

```python
from git import Repo

repo = Repo.clone_from(
    "https://github.com/langchain-ai/langchain", to_path="./example_data/test_repo1"
)
branch = repo.head.reference
```

```python
from langchain_community.document_loaders import GitLoader
```

```python
loader = GitLoader(repo_path="./example_data/test_repo1/", branch=branch)
```

```python
data = loader.load()
```

```python
len(data)
```

```python
print(data[0])
```

```output
page_content='.venv\n.github\n.git\n.mypy_cache\n.pytest_cache\nDockerfile' metadata={'file_path': '.dockerignore', 'file_name': '.dockerignore', 'file_type': ''}
```

## Cloner un dépôt à partir d'une URL

```python
from langchain_community.document_loaders import GitLoader
```

```python
loader = GitLoader(
    clone_url="https://github.com/langchain-ai/langchain",
    repo_path="./example_data/test_repo2/",
    branch="master",
)
```

```python
data = loader.load()
```

```python
len(data)
```

```output
1074
```

## Filtrer les fichiers à charger

```python
from langchain_community.document_loaders import GitLoader

# e.g. loading only python files
loader = GitLoader(
    repo_path="./example_data/test_repo1/",
    file_filter=lambda file_path: file_path.endswith(".py"),
)
```
