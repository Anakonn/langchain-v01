---
translated: true
---

# URL

Cet exemple couvre comment charger des documents `HTML` à partir d'une liste d'`URLs` dans le format `Document` que nous pouvons utiliser en aval.

## Chargeur d'URL non structuré

Vous devez installer la bibliothèque `unstructured` :

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

Passez ssl_verify=False avec headers=headers pour contourner l'erreur de vérification ssl.

```python
loader = UnstructuredURLLoader(urls=urls)
```

```python
data = loader.load()
```

## Chargeur d'URL Selenium

Cela couvre comment charger des documents HTML à partir d'une liste d'URLs en utilisant le `SeleniumURLLoader`.

L'utilisation de `Selenium` nous permet de charger des pages qui nécessitent JavaScript pour être rendues.

Pour utiliser le `SeleniumURLLoader`, vous devez installer `selenium` et `unstructured`.

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

## Chargeur d'URL Playwright

Cela couvre comment charger des documents HTML à partir d'une liste d'URLs en utilisant le `PlaywrightURLLoader`.

[Playwright](https://playwright.dev/) permet des tests end-to-end fiables pour les applications web modernes.

Comme dans le cas de Selenium, `Playwright` nous permet de charger et de rendre les pages JavaScript.

Pour utiliser le `PlaywrightURLLoader`, vous devez installer `playwright` et `unstructured`. De plus, vous devez installer le navigateur `Playwright Chromium` :

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
