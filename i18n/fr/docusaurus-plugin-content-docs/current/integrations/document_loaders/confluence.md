---
translated: true
---

# Confluence

>[Confluence](https://www.atlassian.com/software/confluence) est une plateforme de collaboration wiki qui enregistre et organise tout le matériel lié au projet. `Confluence` est une base de connaissances qui gère principalement les activités de gestion de contenu.

Un chargeur pour les pages `Confluence`.

Cela prend en charge actuellement `username/api_key`, `Oauth2 login`. De plus, les installations sur site prennent également en charge l'authentification `token`.

Spécifiez une liste d'`page_id`-s et/ou d'`space_key` pour charger les pages correspondantes dans les objets Document, si les deux sont spécifiés, l'union des deux ensembles sera renvoyée.

Vous pouvez également spécifier un booléen `include_attachments` pour inclure les pièces jointes, il est défini sur False par défaut, s'il est défini sur True, toutes les pièces jointes seront téléchargées et ConfluenceReader extraira le texte des pièces jointes et l'ajoutera à l'objet Document. Les types de pièces jointes actuellement pris en charge sont : `PDF`, `PNG`, `JPEG/JPG`, `SVG`, `Word` et `Excel`.

Astuce : `space_key` et `page_id` peuvent tous deux être trouvés dans l'URL d'une page dans Confluence - https://yoursite.atlassian.com/wiki/spaces/<space_key>/pages/<page_id>

Avant d'utiliser ConfluenceLoader, assurez-vous d'avoir la dernière version du package atlassian-python-api installée :

```python
%pip install --upgrade --quiet  atlassian-python-api
```

## Exemples

### Nom d'utilisateur et mot de passe ou nom d'utilisateur et jeton API (Atlassian Cloud uniquement)

Cet exemple s'authentifie à l'aide soit d'un nom d'utilisateur et d'un mot de passe, soit, si vous vous connectez à une version hébergée par Atlassian Cloud de Confluence, d'un nom d'utilisateur et d'un jeton API.
Vous pouvez générer un jeton API sur : https://id.atlassian.com/manage-profile/security/api-tokens.

Le paramètre `limit` spécifie le nombre de documents qui seront récupérés dans un seul appel, et non le nombre total de documents qui seront récupérés.
Par défaut, le code renverra jusqu'à 1000 documents par lots de 50 documents. Pour contrôler le nombre total de documents, utilisez le paramètre `max_pages`.
Veuillez noter que la valeur maximale pour le paramètre `limit` dans le package atlassian-python-api est actuellement de 100.

```python
from langchain_community.document_loaders import ConfluenceLoader

loader = ConfluenceLoader(
    url="https://yoursite.atlassian.com/wiki", username="me", api_key="12345"
)
documents = loader.load(space_key="SPACE", include_attachments=True, limit=50)
```

### Jeton d'accès personnel (serveur/sur site uniquement)

Cette méthode est valable uniquement pour l'édition Data Center/Server sur site.
Pour plus d'informations sur la façon de générer un jeton d'accès personnel (PAT), consultez la documentation officielle de Confluence à l'adresse : https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html.
Lors de l'utilisation d'un PAT, vous ne fournissez que la valeur du jeton, vous ne pouvez pas fournir de nom d'utilisateur.
Veuillez noter que ConfluenceLoader fonctionnera avec les autorisations de l'utilisateur qui a généré le PAT et ne pourra charger que les documents auxquels ledit utilisateur a accès.

```python
from langchain_community.document_loaders import ConfluenceLoader

loader = ConfluenceLoader(url="https://yoursite.atlassian.com/wiki", token="12345")
documents = loader.load(
    space_key="SPACE", include_attachments=True, limit=50, max_pages=50
)
```
