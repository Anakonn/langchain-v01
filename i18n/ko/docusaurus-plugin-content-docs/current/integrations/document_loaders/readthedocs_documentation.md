---
translated: true
---

# ReadTheDocs 문서

>[Read the Docs](https://readthedocs.org/)는 오픈 소스 무료 소프트웨어 문서 호스팅 플랫폼입니다. `Sphinx` 문서 생성기로 작성된 문서를 생성합니다.

이 노트북은 `Read-The-Docs` 빌드의 일부로 생성된 HTML 콘텐츠를 로드하는 방법을 다룹니다.

이 기능의 실제 사례는 [여기](https://github.com/langchain-ai/chat-langchain)에서 확인할 수 있습니다.

HTML이 이미 폴더에 스크랩되었다고 가정합니다. 다음 명령을 실행하여 이 작업을 수행할 수 있습니다.

```python
%pip install --upgrade --quiet  beautifulsoup4
```

```python
#!wget -r -A.html -P rtdocs https://python.langchain.com/en/latest/
```

```python
from langchain_community.document_loaders import ReadTheDocsLoader
```

```python
loader = ReadTheDocsLoader("rtdocs", features="html.parser")
```

```python
docs = loader.load()
```
