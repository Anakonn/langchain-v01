---
translated: true
---

# URL

Este ejemplo cubre cómo cargar documentos `HTML` de una lista de `URLs` en el formato `Document` que podemos usar posteriormente.

## Cargador de URL sin estructura

Tienes que instalar la biblioteca `unstructured`:

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

Pasa ssl_verify=False con headers=headers para superar el error de ssl_verification.

```python
loader = UnstructuredURLLoader(urls=urls)
```

```python
data = loader.load()
```

## Cargador de URL de Selenium

Esto cubre cómo cargar documentos HTML de una lista de URLs usando el `SeleniumURLLoader`.

Usar `Selenium` nos permite cargar páginas que requieren JavaScript para renderizarse.

Para usar el `SeleniumURLLoader`, tienes que instalar `selenium` y `unstructured`.

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

## Cargador de URL de Playwright

Esto cubre cómo cargar documentos HTML de una lista de URLs usando el `PlaywrightURLLoader`.

[Playwright](https://playwright.dev/) permite pruebas end-to-end confiables para aplicaciones web modernas.

Al igual que en el caso de Selenium, `Playwright` nos permite cargar y renderizar las páginas de JavaScript.

Para usar el `PlaywrightURLLoader`, tienes que instalar `playwright` y `unstructured`. Además, tienes que instalar el navegador `Playwright Chromium`:

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
