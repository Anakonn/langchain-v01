---
translated: true
---

# GitHub

このノートブックでは、[GitHub](https://github.com/)の特定のリポジトリのissueやプルリクエスト(PR)をロードする方法を示します。また、[GitHub](https://github.com/)の特定のリポジトリのGitHubファイルをロードする方法も示します。LangChain Pythonリポジトリを例として使用します。

## アクセストークンのセットアップ

GitHubのAPIにアクセスするには、個人アクセストークンが必要です - ここでセットアップできます: https://github.com/settings/tokens?type=beta。このトークンを環境変数 ``GITHUB_PERSONAL_ACCESS_TOKEN`` に設定すると自動的に取り込まれるか、初期化時に ``access_token`` という名前のパラメーターとして直接渡すこともできます。

```python
# If you haven't set your access token as an environment variable, pass it in here.
from getpass import getpass

ACCESS_TOKEN = getpass()
```

## Issueとプルリクエストのロード

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

"UmerHA"が作成したすべてのissueとPRをロードしましょう。

使用できるフィルターの一覧は以下の通りです:
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

詳細は https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#list-repository-issues をご覧ください。

```python
docs = loader.load()
```

```python
print(docs[0].page_content)
print(docs[0].metadata)
```

## Issueのみをロード

デフォルトでは、GitHubのAPIはプルリクエストもissueとして扱います。「純粋な」issue(つまりプルリクエストではない)のみを取得するには、`include_prs=False`を使用します。

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

## GitHubファイルのコンテンツをロード

以下のコードでは、リポジトリ `langchain-ai/langchain` のすべてのMarkdownファイルをロードします。

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

1つのドキュメントの例出力:

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
