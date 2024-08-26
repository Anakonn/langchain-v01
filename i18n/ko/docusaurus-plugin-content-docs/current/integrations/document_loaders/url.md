---
translated: true
---

# URL

이 예제에서는 `URL` 목록에서 `HTML` 문서를 로드하여 `Document` 형식으로 사용하는 방법을 다룹니다.

## Unstructured URL Loader

`unstructured` 라이브러리를 설치해야 합니다:

```python
!pip install -U unstructured
```

```python
from langchain_community.document_loaders import UnstructuredURLLoader
```

```python
urls = [
    "https://www.understandingwar.org/backgrounder/russian-offensive-campaign-assessment-february-8-2023",
    "https://www.understandingwar.org/backgrounder/russian-offensive-campaign-assessment-february-9-2023",
]
```

ssl_verification 오류를 해결하려면 ssl_verify=False와 headers=headers를 전달하세요.

```python
loader = UnstructuredURLLoader(urls=urls)
```

```python
data = loader.load()
```

## Selenium URL Loader

이 섹션에서는 `SeleniumURLLoader`를 사용하여 URL 목록에서 HTML 문서를 로드하는 방법을 다룹니다.

`Selenium`을 사용하면 JavaScript로 렌더링되는 페이지를 로드할 수 있습니다.

`SeleniumURLLoader`를 사용하려면 `selenium`과 `unstructured`를 설치해야 합니다.

```python
!pip install -U selenium unstructured
```

```python
from langchain_community.document_loaders import SeleniumURLLoader
```

```python
urls = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://goo.gl/maps/NDSHwePEyaHMFGwh8",
]
```

```python
loader = SeleniumURLLoader(urls=urls)
```

```python
data = loader.load()
```

## Playwright URL Loader

이 섹션에서는 `PlaywrightURLLoader`를 사용하여 URL 목록에서 HTML 문서를 로드하는 방법을 다룹니다.

[Playwright](https://playwright.dev/)는 현대 웹 애플리케이션을 위한 신뢰할 수 있는 엔드 투 엔드 테스트를 가능하게 합니다.

Selenium의 경우와 마찬가지로, `Playwright`를 사용하면 JavaScript 페이지를 로드하고 렌더링할 수 있습니다.

`PlaywrightURLLoader`를 사용하려면 `playwright`와 `unstructured`를 설치해야 합니다. 또한 `Playwright Chromium` 브라우저를 설치해야 합니다.

```python
!pip install -U playwright unstructured
```

```python
!playwright install
```

```python
from langchain_community.document_loaders import PlaywrightURLLoader
```

```python
urls = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://goo.gl/maps/NDSHwePEyaHMFGwh8",
]
```

```python
loader = PlaywrightURLLoader(urls=urls, remove_selectors=["header", "footer"])
```

```python
data = loader.load()
```
