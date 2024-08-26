---
translated: true
---

# Git

>[Git](https://en.wikipedia.org/wiki/Git) एक वितरित संस्करण नियंत्रण प्रणाली है जो किसी भी कंप्यूटर फ़ाइलों के सेट में परिवर्तनों को ट्रैक करता है, जो आमतौर पर सॉफ़्टवेयर विकास के दौरान सहयोगी रूप से सोर्स कोड पर काम करने वाले प्रोग्रामरों के बीच समन्वय करने के लिए उपयोग किया जाता है।

यह नोटबुक `Git` रिपॉजिटरी से पाठ फ़ाइलों को कैसे लोड करें, दिखाता है।

## डिस्क से मौजूदा रिपॉजिटरी लोड करें

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

## URL से रिपॉजिटरी क्लोन करें

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

## फ़ाइलों को लोड करने के लिए फ़िल्टर करना

```python
from langchain_community.document_loaders import GitLoader

# e.g. loading only python files
loader = GitLoader(
    repo_path="./example_data/test_repo1/",
    file_filter=lambda file_path: file_path.endswith(".py"),
)
```
