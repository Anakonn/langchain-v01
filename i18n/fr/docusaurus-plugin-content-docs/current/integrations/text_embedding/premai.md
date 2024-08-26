---
translated: true
---

# PremAI

>[PremAI](https://app.premai.io) est une plateforme unifiée qui vous permet de construire des applications puissantes et prêtes pour la production avec GenAI avec le moins d'efforts possible, afin que vous puissiez vous concentrer davantage sur l'expérience utilisateur et la croissance globale. Dans cette section, nous allons discuter de la façon dont nous pouvons accéder à différents modèles d'intégration à l'aide de `PremAIEmbeddings`.

## Installation et configuration

Nous commençons par installer langchain et premai-sdk. Vous pouvez taper la commande suivante pour installer :

```bash
pip install premai langchain
```

Avant d'aller plus loin, assurez-vous d'avoir créé un compte sur Prem et démarré un projet. Sinon, voici comment vous pouvez commencer gratuitement :

1. Connectez-vous à [PremAI](https://app.premai.io/accounts/login/), si c'est votre première visite, et créez votre clé API [ici](https://app.premai.io/api_keys/).

2. Allez sur [app.premai.io](https://app.premai.io) et cela vous amènera au tableau de bord du projet.

3. Créez un projet et cela générera un ID de projet (écrit sous forme d'ID). Cet ID vous aidera à interagir avec votre application déployée.

Félicitations pour la création de votre première application déployée sur Prem 🎉 Maintenant, nous pouvons utiliser langchain pour interagir avec notre application.

```python
# Let's start by doing some imports and define our embedding object

from langchain_community.embeddings import PremAIEmbeddings
```

Une fois que nous avons importé nos modules requis, configurons notre client. Pour l'instant, supposons que notre `project_id` est 8. Mais assurez-vous d'utiliser votre ID de projet, sinon cela générera une erreur.

```python
import getpass
import os

if os.environ.get("PREMAI_API_KEY") is None:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")
```

```python
model = "text-embedding-3-large"
embedder = PremAIEmbeddings(project_id=8, model=model)
```

Nous avons défini notre modèle d'intégration. Nous prenons en charge de nombreux modèles d'intégration. Voici un tableau qui montre le nombre de modèles d'intégration que nous prenons en charge.

| Fournisseur | Slug                                     | Jetons de contexte |
|-------------|------------------------------------------|-------------------|
| cohere      | embed-english-v3.0                       | N/A               |
| openai      | text-embedding-3-small                   | 8191              |
| openai      | text-embedding-3-large                   | 8191              |
| openai      | text-embedding-ada-002                   | 8191              |
| replicate   | replicate/all-mpnet-base-v2              | N/A               |
| together    | togethercomputer/Llama-2-7B-32K-Instruct | N/A               |
| mistralai   | mistral-embed                            | 4096              |

Pour changer de modèle, il vous suffit de copier le `slug` et d'accéder à votre modèle d'intégration. Maintenant, commençons à utiliser notre modèle d'intégration avec une seule requête suivie de plusieurs requêtes (également appelées document).

```python
query = "Hello, this is a test query"
query_result = embedder.embed_query(query)

# Let's print the first five elements of the query embedding vector

print(query_result[:5])
```

```output
[-0.02129288576543331, 0.0008162345038726926, -0.004556538071483374, 0.02918623760342598, -0.02547479420900345]
```

Enfin, intégrons un document

```python
documents = ["This is document1", "This is document2", "This is document3"]

doc_result = embedder.embed_documents(documents)

# Similar to previous result, let's print the first five element
# of the first document vector

print(doc_result[0][:5])
```

```output
[-0.0030691148713231087, -0.045334383845329285, -0.0161729846149683, 0.04348714277148247, -0.0036920777056366205]
```
