---
translated: true
---

# 사이트맵

`WebBaseLoader`를 확장하는 `SitemapLoader`는 주어진 URL에서 사이트맵을 로드하고 사이트맵의 모든 페이지를 스크랩하고 로드하여 각 페이지를 Document로 반환합니다.

스크랩은 동시에 수행됩니다. 초당 2개의 요청으로 기본 설정된 합리적인 동시 요청 제한이 있습니다. 좋은 시민이 되는 것에 대해 걱정하지 않거나 스크랩된 서버를 제어하거나 부하에 대해 신경 쓰지 않는 경우 주의해야 합니다. 이렇게 하면 스크랩 프로세스가 빨라지지만 서버에서 차단될 수 있습니다.

```python
%pip install --upgrade --quiet  nest_asyncio
```

```python
# fixes a bug with asyncio and jupyter
import nest_asyncio

nest_asyncio.apply()
```

```python
from langchain_community.document_loaders.sitemap import SitemapLoader
```

```python
sitemap_loader = SitemapLoader(web_path="https://api.python.langchain.com/sitemap.xml")

docs = sitemap_loader.load()
```

`requests_per_second` 매개변수를 변경하여 최대 동시 요청 수를 늘릴 수 있으며 `requests_kwargs`를 사용하여 요청 시 kwargs를 전달할 수 있습니다.

```python
sitemap_loader.requests_per_second = 2
# Optional: avoid `[SSL: CERTIFICATE_VERIFY_FAILED]` issue
sitemap_loader.requests_kwargs = {"verify": False}
```

```python
docs[0]
```

```output
Document(page_content='\n\n\n\n\n\n\n\n\n\nLangChain Python API Reference Documentation.\n\n\nYou will be automatically redirected to the new location of this page.\n\n', metadata={'source': 'https://api.python.langchain.com/en/stable/', 'loc': 'https://api.python.langchain.com/en/stable/', 'lastmod': '2024-02-09T01:10:49.422114+00:00', 'changefreq': 'weekly', 'priority': '1'})
```

## 사이트맵 URL 필터링

사이트맵은 수천 개의 URL이 포함된 거대한 파일일 수 있습니다. 종종 모든 URL이 필요하지 않습니다. `filter_urls` 매개변수에 문자열 목록 또는 정규식 패턴을 전달하여 URL을 필터링할 수 있습니다. 패턴 중 하나와 일치하는 URL만 로드됩니다.

```python
loader = SitemapLoader(
    web_path="https://api.python.langchain.com/sitemap.xml",
    filter_urls=["https://api.python.langchain.com/en/latest"],
)
documents = loader.load()
```

```python
documents[0]
```

```output
Document(page_content='\n\n\n\n\n\n\n\n\n\nLangChain Python API Reference Documentation.\n\n\nYou will be automatically redirected to the new location of this page.\n\n', metadata={'source': 'https://api.python.langchain.com/en/latest/', 'loc': 'https://api.python.langchain.com/en/latest/', 'lastmod': '2024-02-12T05:26:10.971077+00:00', 'changefreq': 'daily', 'priority': '0.9'})
```

## 사용자 정의 스크랩 규칙 추가

`SitemapLoader`는 `beautifulsoup4`를 사용하여 스크랩 프로세스를 수행하며 기본적으로 페이지의 모든 요소를 스크랩합니다. `SitemapLoader` 생성자는 사용자 정의 스크랩 함수를 허용합니다. 이 기능은 특정 요구 사항에 맞게 스크랩 프로세스를 조정하는 데 도움이 될 수 있습니다. 예를 들어 헤더 또는 탐색 요소를 스크랩하지 않도록 할 수 있습니다.

다음 예제는 탐색 및 헤더 요소를 피하기 위한 사용자 정의 함수를 개발하고 사용하는 방법을 보여줍니다.

`beautifulsoup4` 라이브러리를 가져오고 사용자 정의 함수를 정의합니다.

```python
pip install beautifulsoup4
```

```python
from bs4 import BeautifulSoup


def remove_nav_and_header_elements(content: BeautifulSoup) -> str:
    # Find all 'nav' and 'header' elements in the BeautifulSoup object
    nav_elements = content.find_all("nav")
    header_elements = content.find_all("header")

    # Remove each 'nav' and 'header' element from the BeautifulSoup object
    for element in nav_elements + header_elements:
        element.decompose()

    return str(content.get_text())
```

사용자 정의 함수를 `SitemapLoader` 객체에 추가합니다.

```python
loader = SitemapLoader(
    "https://api.python.langchain.com/sitemap.xml",
    filter_urls=["https://api.python.langchain.com/en/latest/"],
    parsing_function=remove_nav_and_header_elements,
)
```

## 로컬 사이트맵

사이트맵 로더는 로컬 파일을 로드하는 데에도 사용할 수 있습니다.

```python
sitemap_loader = SitemapLoader(web_path="example_data/sitemap.xml", is_local=True)

docs = sitemap_loader.load()
```
