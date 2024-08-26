---
translated: true
---

# Git

>[Git](https://en.wikipedia.org/wiki/Git)は、ソフトウェア開発中にプログラマーが共同で作業する際に、コンピューターファイルの変更を追跡する分散型バージョン管理システムです。

このノートブックでは、`Git`リポジトリからテキストファイルをロードする方法を示します。

## 既存のリポジトリをディスクからロードする

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

## URLからリポジトリをクローンする

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

## ロードするファイルをフィルタリングする

```python
from langchain_community.document_loaders import GitLoader

# e.g. loading only python files
loader = GitLoader(
    repo_path="./example_data/test_repo1/",
    file_filter=lambda file_path: file_path.endswith(".py"),
)
```
