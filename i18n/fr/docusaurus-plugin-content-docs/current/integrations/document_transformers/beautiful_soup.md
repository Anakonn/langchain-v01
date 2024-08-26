---
translated: true
---

# Beautiful Soup

>[Beautiful Soup](https://www.crummy.com/software/BeautifulSoup/) est un package Python pour l'analyse
> de documents HTML et XML (y compris ceux avec un balisage mal formé, c'est-à-dire des balises non fermées, ainsi nommé d'après le tag soup).
> Il crée un arbre d'analyse pour les pages analysées qui peut être utilisé pour extraire des données à partir de HTML,[3] ce qui
> est utile pour le web scraping.

`Beautiful Soup` offre un contrôle précis sur le contenu HTML, permettant l'extraction, la suppression et le nettoyage spécifiques des balises.

Il convient aux cas où vous voulez extraire des informations spécifiques et nettoyer le contenu HTML selon vos besoins.

Par exemple, nous pouvons extraire le contenu textuel dans les balises `<p>, <li>, <div> et <a>` à partir du contenu HTML :

* `<p>` : La balise de paragraphe. Elle définit un paragraphe en HTML et est utilisée pour regrouper des phrases et/ou des expressions connexes.

* `<li>` : La balise d'élément de liste. Elle est utilisée dans les listes ordonnées (`<ol>`) et non ordonnées (`<ul>`) pour définir les éléments individuels de la liste.

* `<div>` : La balise de division. C'est un élément de niveau bloc utilisé pour regrouper d'autres éléments en ligne ou de niveau bloc.

* `<a>` : La balise d'ancrage. Elle est utilisée pour définir les hyperliens.

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
