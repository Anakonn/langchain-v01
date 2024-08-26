---
translated: true
---

# 아름다운 수프

>[아름다운 수프](https://www.crummy.com/software/BeautifulSoup/)는 HTML과 XML 문서(태그가 제대로 닫히지 않은 경우 등 잘못된 마크업이 포함된 문서 포함)를 구문 분석하기 위한 Python 패키지입니다. 구문 분석된 페이지에 대한 구문 분석 트리를 생성하여 HTML에서 데이터를 추출하는 데 유용합니다.[3]

`Beautiful Soup`는 HTML 콘텐츠에 대한 세부적인 제어를 제공하여 특정 태그 추출, 제거 및 콘텐츠 정리를 가능하게 합니다.

특정 정보를 추출하고 HTML 콘텐츠를 필요에 따라 정리해야 하는 경우에 적합합니다.

예를 들어 HTML 콘텐츠에서 `<p>, <li>, <div>, <a>` 태그 내의 텍스트 콘텐츠를 스크레이핑할 수 있습니다:

* `<p>`: 단락 태그. HTML에서 단락을 정의하며 관련 문장 및/또는 구를 그룹화하는 데 사용됩니다.

* `<li>`: 목록 항목 태그. 순서 있는(`<ol>`) 및 순서 없는(`<ul>`) 목록 내에서 개별 항목을 정의하는 데 사용됩니다.

* `<div>`: 구분 태그. 다른 인라인 또는 블록 레벨 요소를 그룹화하는 데 사용되는 블록 레벨 요소입니다.

* `<a>`: 앵커 태그. 하이퍼링크를 정의하는 데 사용됩니다.

```python
from langchain_community.document_loaders import AsyncChromiumLoader
from langchain_community.document_transformers import BeautifulSoupTransformer

# Load HTML
loader = AsyncChromiumLoader(["https://www.wsj.com"])
html = loader.load()
```

```python
# Transform
bs_transformer = BeautifulSoupTransformer()
docs_transformed = bs_transformer.transform_documents(
    html, tags_to_extract=["p", "li", "div", "a"]
)
```

```python
docs_transformed[0].page_content[0:500]
```

```output
'Conservative legal activists are challenging Amazon, Comcast and others using many of the same tools that helped kill affirmative-action programs in colleges.1,2099 min read U.S. stock indexes fell and government-bond prices climbed, after Moody’s lowered credit ratings for 10 smaller U.S. banks and said it was reviewing ratings for six larger ones. The Dow industrials dropped more than 150 points.3 min read Penn Entertainment’s Barstool Sportsbook app will be rebranded as ESPN Bet this fall as '
```
