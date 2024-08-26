---
translated: true
---

# Brave Search

>[Brave Search](https://en.wikipedia.org/wiki/Brave_Search) est un moteur de recherche développé par Brave Software.
> - `Brave Search` utilise son propre index web. En mai 2022, il couvrait plus de 10 milliards de pages et était utilisé pour servir 92% des résultats de recherche sans s'appuyer sur des tiers, le reste étant récupéré côté serveur à partir de l'API Bing ou (sur une base volontaire) côté client à partir de Google. Selon Brave, l'index était délibérément plus petit que celui de Google ou Bing afin d'éviter le spam et d'autres contenus de faible qualité, avec l'inconvénient que "Brave Search n'est pas encore aussi bon que Google pour récupérer les requêtes à longue traîne".
>- `Brave Search Premium` : À partir d'avril 2023, Brave Search est un site Web sans publicité, mais il passera finalement à un nouveau modèle qui inclura des publicités et les utilisateurs premium bénéficieront d'une expérience sans publicité. Les données des utilisateurs, y compris les adresses IP, ne seront pas collectées par défaut auprès de ses utilisateurs. Un compte premium sera nécessaire pour l'opt-in de la collecte de données.

## Installation et configuration

Pour accéder à l'API Brave Search, vous devez [créer un compte et obtenir une clé API](https://api.search.brave.com/app/dashboard).

```python
api_key = "..."
```

```python
from langchain_community.document_loaders import BraveSearchLoader
```

## Exemple

```python
loader = BraveSearchLoader(
    query="obama middle name", api_key=api_key, search_kwargs={"count": 3}
)
docs = loader.load()
len(docs)
```

```output
3
```

```python
[doc.metadata for doc in docs]
```

```output
[{'title': "Obama's Middle Name -- My Last Name -- is 'Hussein.' So?",
  'link': 'https://www.cair.com/cair_in_the_news/obamas-middle-name-my-last-name-is-hussein-so/'},
 {'title': "What's up with Obama's middle name? - Quora",
  'link': 'https://www.quora.com/Whats-up-with-Obamas-middle-name'},
 {'title': 'Barack Obama | Biography, Parents, Education, Presidency, Books, ...',
  'link': 'https://www.britannica.com/biography/Barack-Obama'}]
```

```python
[doc.page_content for doc in docs]
```

```output
['I wasn’t sure whether to laugh or cry a few days back listening to radio talk show host Bill Cunningham repeatedly scream Barack <strong>Obama</strong>’<strong>s</strong> <strong>middle</strong> <strong>name</strong> — my last <strong>name</strong> — as if he had anti-Muslim Tourette’s. “Hussein,” Cunningham hissed like he was beckoning Satan when shouting the ...',
 'Answer (1 of 15): A better question would be, “What’s up with <strong>Obama</strong>’s first <strong>name</strong>?” President Barack Hussein <strong>Obama</strong>’s father’s <strong>name</strong> was Barack Hussein <strong>Obama</strong>. He was <strong>named</strong> after his father. Hussein, <strong>Obama</strong>’<strong>s</strong> <strong>middle</strong> <strong>name</strong>, is a very common Arabic <strong>name</strong>, meaning &quot;good,&quot; &quot;handsome,&quot; or ...',
 'Barack <strong>Obama</strong>, in full Barack Hussein <strong>Obama</strong> II, (born August 4, 1961, Honolulu, Hawaii, U.S.), 44th president of the United States (2009–17) and the first African American to hold the office. Before winning the presidency, <strong>Obama</strong> represented Illinois in the U.S.']
```
