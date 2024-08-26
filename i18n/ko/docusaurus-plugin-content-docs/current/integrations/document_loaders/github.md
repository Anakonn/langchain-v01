---
translated: true
---

# GitHub

이 노트북은 [GitHub](https://github.com/)에서 주어진 리포지토리의 이슈와 풀 리퀘스트(PR)를 로드하는 방법을 보여줍니다. 또한 [GitHub](https://github.com/)에서 주어진 리포지토리의 GitHub 파일을 로드하는 방법도 보여줍니다. 우리는 LangChain Python 리포지토리를 예로 사용할 것입니다.

## 액세스 토큰 설정

GitHub API에 액세스하려면 개인 액세스 토큰이 필요합니다 - 여기에서 설정할 수 있습니다: https://github.com/settings/tokens?type=beta. 이 토큰을 환경 변수 ``GITHUB_PERSONAL_ACCESS_TOKEN``에 설정하면 자동으로 가져올 수 있습니다. 또는 초기화 시 ``access_token`` 매개변수로 직접 전달할 수 있습니다.

```python
# If you haven't set your access token as an environment variable, pass it in here.
from getpass import getpass

ACCESS_TOKEN = getpass()
```

## 이슈와 PR 로드하기

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

"UmerHA"가 생성한 모든 이슈와 PR을 로드해 보겠습니다.

다음과 같은 필터를 사용할 수 있습니다:
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

자세한 내용은 https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#list-repository-issues를 참조하세요.

```python
docs = loader.load()
```

```python
print(docs[0].page_content)
print(docs[0].metadata)
```

## 이슈만 로드하기

기본적으로 GitHub API는 풀 리퀘스트도 이슈로 간주합니다. 순수한 이슈만 가져오려면 `include_prs=False`를 사용하세요.

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

## GitHub 파일 내용 로드하기

아래 코드는 `langchain-ai/langchain` 리포지토리의 모든 Markdown 파일을 로드합니다.

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

한 문서의 예시 출력:

```text
documents.metadata: 
    {
      "path": "README.md",
      "sha": "82f1c4ea88ecf8d2dfsfx06a700e84be4",
      "source": "https://github.com/langchain-ai/langchain/blob/master/README.md"
    }
documents.content:
    mock content
```
