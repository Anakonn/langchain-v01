---
translated: true
---

# URL

このサンプルでは、一連の `URL` から `HTML` ドキュメントを読み込み、`Document` 形式で使用する方法について説明します。

## Unstructured URL Loader

`unstructured` ライブラリをインストールする必要があります:

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

ssl_verification エラーを回避するには、ssl_verify=False と headers=headers を指定します。

```python
loader = UnstructuredURLLoader(urls=urls)
```

```python
data = loader.load()
```

## Selenium URL Loader

`SeleniumURLLoader` を使用して、一連の URL から HTML ドキュメントを読み込む方法について説明します。

`Selenium` を使用すると、JavaScript レンダリングが必要なページを読み込むことができます。

`SeleniumURLLoader` を使用するには、`selenium` と `unstructured` をインストールする必要があります。

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

`PlaywrightURLLoader` を使用して、一連の URL から HTML ドキュメントを読み込む方法について説明します。

[Playwright](https://playwright.dev/) は、最新の Web アプリケーションの信頼性の高い end-to-end テストを可能にします。

Selenium の場合と同様に、`Playwright` を使用すると、JavaScript ページを読み込んでレンダリングできます。

`PlaywrightURLLoader` を使用するには、`playwright` と `unstructured` をインストールする必要があります。さらに、`Playwright Chromium` ブラウザをインストールする必要があります。

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
