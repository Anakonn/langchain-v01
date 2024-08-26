---
translated: true
---

# 재귀적 URL

우리는 루트 디렉토리 아래의 모든 URL을 처리하고 싶을 수 있습니다.

예를 들어, [Python 3.9 문서](https://docs.python.org/3.9/)를 살펴봅시다.

이것에는 우리가 일괄적으로 읽고 싶은 많은 흥미로운 하위 페이지가 있습니다.

물론 `WebBaseLoader`는 페이지 목록을 로드할 수 있습니다.

그러나 문제는 하위 페이지의 트리를 탐색하고 실제로 그 목록을 구성하는 것입니다!

우리는 `RecursiveUrlLoader`를 사용하여 이를 수행합니다.

이를 통해 일부 하위 항목을 제외하고, 추출기를 사용자 정의하는 등의 유연성을 얻을 수 있습니다.

# 매개변수

- url: str, 크롤링할 대상 URL.
- exclude_dirs: Optional[str], 제외할 웹 페이지 디렉토리.
- use_async: Optional[bool], 비동기 요청 사용 여부, 대규모 작업에서는 비동기 요청이 일반적으로 더 빠릅니다. 그러나 비동기는 lazy loading 기능을 비활성화합니다(함수는 여전히 작동하지만 lazy하지 않습니다). 기본값은 False입니다.
- extractor: Optional[Callable[[str], str]], 웹 페이지에서 문서 텍스트를 추출하는 함수, 기본적으로 페이지 그대로 반환합니다. goose3와 beautifulsoup 같은 도구를 사용하여 텍스트를 추출하는 것이 좋습니다. 기본적으로 페이지 그대로 반환합니다.
- max_depth: Optional[int] = None, 크롤링할 최대 깊이. 기본값은 2입니다. 전체 웹사이트를 크롤링해야 하는 경우 충분히 큰 숫자로 설정하면 됩니다.
- timeout: Optional[int] = None, 각 요청의 시간 초과, 단위는 초입니다. 기본값은 10입니다.
- prevent_outside: Optional[bool] = None, 루트 URL 외부로 크롤링하는 것을 방지할지 여부. 기본값은 True입니다.

```python
from langchain_community.document_loaders.recursive_url_loader import RecursiveUrlLoader
```

간단한 예를 한번 해보겠습니다.

```python
from bs4 import BeautifulSoup as Soup

url = "https://docs.python.org/3.9/"
loader = RecursiveUrlLoader(
    url=url, max_depth=2, extractor=lambda x: Soup(x, "html.parser").text
)
docs = loader.load()
```

```python
docs[0].page_content[:50]
```

```output
'\n\n\n\n\nPython Frequently Asked Questions — Python 3.'
```

```python
docs[-1].metadata
```

```output
{'source': 'https://docs.python.org/3.9/library/index.html',
 'title': 'The Python Standard Library — Python 3.9.17 documentation',
 'language': None}
```

그러나 완벽한 필터링을 수행하기는 어려우므로 결과에 여전히 관련성이 낮은 결과가 포함될 수 있습니다. 필요한 경우 직접 반환된 문서에 대한 필터링을 수행할 수 있습니다. 대부분의 경우 반환된 결과로 충분합니다.

LangChain 문서에 대해 테스트해 보겠습니다.

```python
url = "https://js.langchain.com/docs/modules/memory/integrations/"
loader = RecursiveUrlLoader(url=url)
docs = loader.load()
len(docs)
```

```output
8
```
