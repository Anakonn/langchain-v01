---
translated: true
---

# Clarifai

>[Clarifai](https://www.clarifai.com/) est une plateforme IA qui fournit le cycle de vie complet de l'IA, allant de l'exploration des données, l'étiquetage des données, l'entraînement des modèles, l'évaluation et l'inférence.

Cet exemple explique comment utiliser LangChain pour interagir avec les modèles `Clarifai` [models](https://clarifai.com/explore/models). Les modèles d'incorporation de texte en particulier peuvent être trouvés [ici](https://clarifai.com/explore/models?page=1&perPage=24&filterData=%5B%7B%22field%22%3A%22model_type_id%22%2C%22value%22%3A%5B%22text-embedder%22%5D%7D%5D).

Pour utiliser Clarifai, vous devez avoir un compte et une clé de jeton d'accès personnel (PAT).
[Vérifiez ici](https://clarifai.com/settings/security) pour obtenir ou créer un PAT.

# Dépendances

```python
# Install required dependencies
%pip install --upgrade --quiet  clarifai
```

# Imports

Ici, nous allons définir le jeton d'accès personnel. Vous pouvez trouver votre PAT dans [paramètres/sécurité](https://clarifai.com/settings/security) de votre compte Clarifai.

```python
# Please login and get your API key from  https://clarifai.com/settings/security
from getpass import getpass

CLARIFAI_PAT = getpass()
```

```python
# Import the required modules
from langchain.chains import LLMChain
from langchain_community.embeddings import ClarifaiEmbeddings
from langchain_core.prompts import PromptTemplate
```

# Entrée

Créez un modèle de modèle de prompt à utiliser avec la chaîne LLM :

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

# Configuration

Définissez l'identifiant utilisateur et l'identifiant d'application dans lesquels se trouve le modèle. Vous pouvez trouver une liste des modèles publics sur https://clarifai.com/explore/models

Vous devrez également initialiser l'identifiant du modèle et, si nécessaire, l'identifiant de la version du modèle. Certains modèles ont de nombreuses versions, vous pouvez choisir celle qui convient à votre tâche.

```python
USER_ID = "clarifai"
APP_ID = "main"
MODEL_ID = "BAAI-bge-base-en-v15"
MODEL_URL = "https://clarifai.com/clarifai/main/models/BAAI-bge-base-en-v15"

# Further you can also provide a specific model version as the model_version_id arg.
# MODEL_VERSION_ID = "MODEL_VERSION_ID"
```

```python
# Initialize a Clarifai embedding model
embeddings = ClarifaiEmbeddings(user_id=USER_ID, app_id=APP_ID, model_id=MODEL_ID)

# Initialize a clarifai embedding model using model URL
embeddings = ClarifaiEmbeddings(model_url=MODEL_URL)

# Alternatively you can initialize clarifai class with pat argument.
```

```python
text = "roses are red violets are blue."
text2 = "Make hay while the sun shines."
```

Vous pouvez incorporer une seule ligne de votre texte à l'aide de la fonction embed_query !

```python
query_result = embeddings.embed_query(text)
```

En outre, pour incorporer une liste de textes/documents, utilisez la fonction embed_documents.

```python
doc_result = embeddings.embed_documents([text, text2])
```
