---
translated: true
---

# Mastodon

>[Mastodon](https://joinmastodon.org/) est un service de médias sociaux et de réseautage social fédéré.

Ce chargeur récupère le texte des "toots" d'une liste de comptes `Mastodon`, en utilisant le package Python `Mastodon.py`.

Les comptes publics peuvent être interrogés par défaut sans aucune authentification. Si des comptes ou des instances non publics sont interrogés, vous devez enregistrer une application pour votre compte, ce qui vous donne un jeton d'accès, et définir ce jeton et l'URL de base de l'API de votre compte.

Ensuite, vous devez passer les noms de compte Mastodon que vous voulez extraire, dans le format `@compte@instance`.

```python
from langchain_community.document_loaders import MastodonTootsLoader
```

```python
%pip install --upgrade --quiet  Mastodon.py
```

```python
loader = MastodonTootsLoader(
    mastodon_accounts=["@Gargron@mastodon.social"],
    number_toots=50,  # Default value is 100
)

# Or set up access information to use a Mastodon app.
# Note that the access token can either be passed into
# constructor or you can set the environment "MASTODON_ACCESS_TOKEN".
# loader = MastodonTootsLoader(
#     access_token="<ACCESS TOKEN OF MASTODON APP>",
#     api_base_url="<API BASE URL OF MASTODON APP INSTANCE>",
#     mastodon_accounts=["@Gargron@mastodon.social"],
#     number_toots=50,  # Default value is 100
# )
```

```python
documents = loader.load()
for doc in documents[:3]:
    print(doc.page_content)
    print("=" * 80)
```

```output
<p>It is tough to leave this behind and go back to reality. And some people live here! I’m sure there are downsides but it sounds pretty good to me right now.</p>
================================================================================
<p>I wish we could stay here a little longer, but it is time to go home 🥲</p>
================================================================================
<p>Last day of the honeymoon. And it’s <a href="https://mastodon.social/tags/caturday" class="mention hashtag" rel="tag">#<span>caturday</span></a>! This cute tabby came to the restaurant to beg for food and got some chicken.</p>
================================================================================
```

Les textes des toots (le `page_content` des documents) sont par défaut au format HTML, tel que renvoyé par l'API Mastodon.
