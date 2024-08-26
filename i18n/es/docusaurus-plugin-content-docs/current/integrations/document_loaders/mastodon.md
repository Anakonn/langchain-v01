---
translated: true
---

# Mastodon

>[Mastodon](https://joinmastodon.org/) es un servicio de redes sociales y redes sociales federadas.

Este cargador recupera el texto de los "toots" de una lista de cuentas `Mastodon`, utilizando el paquete Python `Mastodon.py`.

Las cuentas públicas se pueden consultar de forma predeterminada sin necesidad de autenticación. Si se consultan cuentas o instancias no públicas, debe registrar una aplicación para su cuenta que le proporcione un token de acceso, y establecer ese token y la URL base de la API de su cuenta.

Luego debe pasar los nombres de las cuentas de Mastodon que desea extraer, en el formato `@account@instance`.

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

Los textos de los toots (el `page_content` de los documentos) son de forma predeterminada HTML, tal como lo devuelve la API de Mastodon.
