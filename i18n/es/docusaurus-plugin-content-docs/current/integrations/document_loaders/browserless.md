---
translated: true
---

# Browserless

Browserless es un servicio que permite ejecutar instancias de Chrome sin cabeza en la nube. Es una excelente manera de ejecutar automatización basada en el navegador a escala sin tener que preocuparse por administrar su propia infraestructura.

Para usar Browserless como un cargador de documentos, inicialice una instancia de `BrowserlessLoader` como se muestra en este cuaderno. Tenga en cuenta que de forma predeterminada, `BrowserlessLoader` devuelve el `innerText` del elemento `body` de la página. Para deshabilitar esto y obtener el HTML sin procesar, establezca `text_content` en `False`.

```python
from langchain_community.document_loaders import BrowserlessLoader
```

```python
BROWSERLESS_API_TOKEN = "YOUR_BROWSERLESS_API_TOKEN"
```

```python
loader = BrowserlessLoader(
    api_token=BROWSERLESS_API_TOKEN,
    urls=[
        "https://en.wikipedia.org/wiki/Document_classification",
    ],
    text_content=True,
)

documents = loader.load()

print(documents[0].page_content[:1000])
```

```output
Jump to content
Main menu
Search
Create account
Log in
Personal tools
Toggle the table of contents
Document classification
17 languages
Article
Talk
Read
Edit
View history
Tools
From Wikipedia, the free encyclopedia

Document classification or document categorization is a problem in library science, information science and computer science. The task is to assign a document to one or more classes or categories. This may be done "manually" (or "intellectually") or algorithmically. The intellectual classification of documents has mostly been the province of library science, while the algorithmic classification of documents is mainly in information science and computer science. The problems are overlapping, however, and there is therefore interdisciplinary research on document classification.

The documents to be classified may be texts, images, music, etc. Each kind of document possesses its special classification problems. When not otherwise specified, text classification is implied.

Do
```
