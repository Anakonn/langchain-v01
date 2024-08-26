---
translated: true
---

# Git

>[Git](https://en.wikipedia.org/wiki/Git)는 컴퓨터 파일 집합의 변경 사항을 추적하는 분산 버전 관리 시스템으로, 일반적으로 소프트웨어 개발 중 공동으로 작업하는 프로그래머들 간의 작업을 조정하는 데 사용됩니다.

이 노트북은 `Git` 리포지토리에서 텍스트 파일을 로드하는 방법을 보여줍니다.

## 디스크에서 기존 리포지토리 로드하기

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

## URL에서 리포지토리 복제하기

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

## 로드할 파일 필터링하기

```python
from langchain_community.document_loaders import GitLoader

# e.g. loading only python files
loader = GitLoader(
    repo_path="./example_data/test_repo1/",
    file_filter=lambda file_path: file_path.endswith(".py"),
)
```
