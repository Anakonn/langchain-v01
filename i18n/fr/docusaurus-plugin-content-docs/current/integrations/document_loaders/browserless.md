---
translated: true
---

# Browserless

Browserless est un service qui permet d'exécuter des instances de Chrome sans interface graphique dans le cloud. C'est un excellent moyen d'automatiser des tâches basées sur le navigateur à grande échelle sans avoir à se soucier de la gestion de votre propre infrastructure.

Pour utiliser Browserless comme chargeur de documents, initialisez une instance de `BrowserlessLoader` comme indiqué dans ce notebook. Notez que par défaut, `BrowserlessLoader` renvoie le `innerText` de l'élément `body` de la page. Pour désactiver cette fonctionnalité et obtenir le HTML brut, définissez `text_content` sur `False`.

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
