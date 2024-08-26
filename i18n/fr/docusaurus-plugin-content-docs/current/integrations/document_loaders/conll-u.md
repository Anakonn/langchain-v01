---
translated: true
---

# CoNLL-U

>[CoNLL-U](https://universaldependencies.org/format.html) est une version révisée du format CoNLL-X. Les annotations sont encodées dans des fichiers texte brut (UTF-8, normalisés en NFC, n'utilisant que le caractère LF comme saut de ligne, y compris un caractère LF à la fin du fichier) avec trois types de lignes :
>- Les lignes de mots contenant l'annotation d'un mot/jeton en 10 champs séparés par des tabulations simples ; voir ci-dessous.
>- Les lignes vides marquant les limites de phrase.
>- Les lignes de commentaires commençant par un dièse (#).

Voici un exemple de la façon de charger un fichier au format [CoNLL-U](https://universaldependencies.org/format.html). Tout le fichier est traité comme un seul document. Les données d'exemple (`conllu.conllu`) sont basées sur l'un des exemples standard UD/CoNLL-U.

```python
from langchain_community.document_loaders import CoNLLULoader
```

```python
loader = CoNLLULoader("example_data/conllu.conllu")
```

```python
document = loader.load()
```

```python
document
```

```output
[Document(page_content='They buy and sell books.', metadata={'source': 'example_data/conllu.conllu'})]
```
