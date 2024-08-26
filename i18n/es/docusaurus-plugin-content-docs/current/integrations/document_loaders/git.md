---
translated: true
---

# Git

>[Git](https://en.wikipedia.org/wiki/Git) es un sistema de control de versiones distribuido que rastrea los cambios en cualquier conjunto de archivos de computadora, generalmente utilizado para coordinar el trabajo entre programadores que desarrollan colaborativamente el código fuente durante el desarrollo de software.

Este cuaderno muestra cómo cargar archivos de texto desde el repositorio `Git`.

## Cargar un repositorio existente desde el disco

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

## Clonar el repositorio desde la URL

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

## Filtrar archivos para cargar

```python
from langchain_community.document_loaders import GitLoader

# e.g. loading only python files
loader = GitLoader(
    repo_path="./example_data/test_repo1/",
    file_filter=lambda file_path: file_path.endswith(".py"),
)
```
