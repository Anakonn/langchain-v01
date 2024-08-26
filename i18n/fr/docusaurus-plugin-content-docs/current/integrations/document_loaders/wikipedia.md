---
translated: true
---

# Wikipédia

>[Wikipédia](https://wikipedia.org/) est une encyclopédie en ligne multilingue gratuite, écrite et maintenue par une communauté de bénévoles, connus sous le nom de Wikipédiens, par le biais d'une collaboration ouverte et en utilisant un système d'édition basé sur un wiki appelé MediaWiki. `Wikipédia` est l'ouvrage de référence le plus important et le plus lu de l'histoire.

Ce notebook montre comment charger des pages wiki à partir de `wikipedia.org` dans le format de document que nous utilisons en aval.

## Installation

Tout d'abord, vous devez installer le package python `wikipedia`.

```python
%pip install --upgrade --quiet  wikipedia
```

## Exemples

`WikipediaLoader` a ces arguments :
- `query` : texte libre utilisé pour trouver des documents sur Wikipédia
- `lang` optionnel : par défaut="en". Utilisez-le pour rechercher dans une partie spécifique de Wikipédia dans une langue donnée
- `load_max_docs` optionnel : par défaut=100. Utilisez-le pour limiter le nombre de documents téléchargés. Il faut du temps pour télécharger les 100 documents, donc utilisez un petit nombre pour les expériences. Il y a actuellement une limite de 300.
- `load_all_available_meta` optionnel : par défaut=False. Par défaut, seuls les champs les plus importants sont téléchargés : `Published` (date de publication/dernière mise à jour du document), `title`, `Summary`. Si True, d'autres champs sont également téléchargés.

```python
from langchain_community.document_loaders import WikipediaLoader
```

```python
docs = WikipediaLoader(query="HUNTER X HUNTER", load_max_docs=2).load()
len(docs)
```

```python
docs[0].metadata  # meta-information of the Document
```

```python
docs[0].page_content[:400]  # a content of the Document
```
