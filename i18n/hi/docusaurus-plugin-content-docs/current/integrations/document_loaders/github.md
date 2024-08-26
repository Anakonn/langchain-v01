---
translated: true
---

# GitHub

यह नोटबुक दिखाता है कि आप [GitHub](https://github.com/) पर दिए गए किसी भी भंडार के लिए मुद्दों और पुल अनुरोधों (PRs) को कैसे लोड कर सकते हैं। यह भी दिखाता है कि आप [GitHub](https://github.com/) पर दिए गए किसी भी भंडार के लिए GitHub फ़ाइलों को कैसे लोड कर सकते हैं। हम उदाहरण के लिए LangChain Python भंडार का उपयोग करेंगे।

## पहुंच टोकन सेट करें

GitHub API का उपयोग करने के लिए, आपको एक व्यक्तिगत पहुंच टोकन की आवश्यकता है - आप अपना टोकन यहां सेट कर सकते हैं: https://github.com/settings/tokens?type=beta। आप इस टोकन को पर्यावरण चर ``GITHUB_PERSONAL_ACCESS_TOKEN`` के रूप में सेट कर सकते हैं और यह स्वचालित रूप से लिया जाएगा, या आप इसे प्रारंभीकरण में ``access_token`` नामित पैरामीटर के रूप में सीधे पास कर सकते हैं।

```python
# If you haven't set your access token as an environment variable, pass it in here.
from getpass import getpass

ACCESS_TOKEN = getpass()
```

## मुद्दों और PRs लोड करें

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

चलो "UmerHA" द्वारा बनाए गए सभी मुद्दों और PRs को लोड करें।

यहां आप उपयोग कर सकते हैं ऐसे सभी फ़िल्टर:
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

अधिक जानकारी के लिए, देखें https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#list-repository-issues।

```python
docs = loader.load()
```

```python
print(docs[0].page_content)
print(docs[0].metadata)
```

## केवल मुद्दों को लोड करें

डिफ़ॉल्ट रूप से, GitHub API पुल अनुरोधों को भी मुद्दों के रूप में मानता है। केवल 'शुद्ध' मुद्दों (यानी, कोई पुल अनुरोध नहीं) प्राप्त करने के लिए, `include_prs=False` का उपयोग करें।

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

## GitHub फ़ाइल सामग्री लोड करें

नीचे दिए गए कोड के लिए, `langchain-ai/langchain` भंडार में सभी मार्कडाउन फ़ाइलों को लोड करता है।

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

एक दस्तावेज़ का उदाहरण उत्पादन:

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
