---
translated: true
---

# Documentation ReadTheDocs

>[Read the Docs](https://readthedocs.org/) est une plateforme d'hébergement de documentation open-source et gratuite. Elle génère de la documentation écrite avec le générateur de documentation `Sphinx`.

Ce notebook couvre comment charger le contenu d'un HTML qui a été généré dans le cadre d'une construction `Read-The-Docs`.

Pour un exemple de cela dans la nature, voir [ici](https://github.com/langchain-ai/chat-langchain).

Cela suppose que l'HTML a déjà été extrait dans un dossier. Cela peut être fait en décommentant et en exécutant la commande suivante

```python
%pip install --upgrade --quiet  beautifulsoup4
```

```python
#!wget -r -A.html -P rtdocs https://python.langchain.com/en/latest/
```

```python
from langchain_community.document_loaders import ReadTheDocsLoader
```

```python
loader = ReadTheDocsLoader("rtdocs", features="html.parser")
```

```python
docs = loader.load()
```
