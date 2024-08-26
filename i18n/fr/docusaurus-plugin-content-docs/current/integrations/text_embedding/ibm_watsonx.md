---
translated: true
---

# IBM watsonx.ai

>WatsonxEmbeddings est un wrapper pour les modèles de base IBM [watsonx.ai](https://www.ibm.com/products/watsonx-ai).

Cet exemple montre comment communiquer avec les modèles `watsonx.ai` en utilisant `LangChain`.

## Configuration

Installez le package `langchain-ibm`.

```python
!pip install -qU langchain-ibm
```

Cette cellule définit les identifiants WML requis pour travailler avec les Embeddings watsonx.

**Action :** Fournissez la clé API utilisateur IBM Cloud. Pour plus de détails, consultez la [documentation](https://cloud.ibm.com/docs/account?topic=account-userapikey&interface=ui).

```python
import os
from getpass import getpass

watsonx_api_key = getpass()
os.environ["WATSONX_APIKEY"] = watsonx_api_key
```

De plus, vous pouvez passer des secrets supplémentaires en tant que variable d'environnement.

```python
import os

os.environ["WATSONX_URL"] = "your service instance url"
os.environ["WATSONX_TOKEN"] = "your token for accessing the CPD cluster"
os.environ["WATSONX_PASSWORD"] = "your password for accessing the CPD cluster"
os.environ["WATSONX_USERNAME"] = "your username for accessing the CPD cluster"
os.environ["WATSONX_INSTANCE_ID"] = "your instance_id for accessing the CPD cluster"
```

## Charger le modèle

Vous devrez peut-être ajuster les `paramètres` du modèle pour différents modèles.

```python
from ibm_watsonx_ai.metanames import EmbedTextParamsMetaNames

embed_params = {
    EmbedTextParamsMetaNames.TRUNCATE_INPUT_TOKENS: 3,
    EmbedTextParamsMetaNames.RETURN_OPTIONS: {"input_text": True},
}
```

Initialisez la classe `WatsonxEmbeddings` avec les paramètres précédemment définis.

**Remarque** :

- Pour fournir un contexte pour l'appel API, vous devez ajouter `project_id` ou `space_id`. Pour plus d'informations, consultez la [documentation](https://www.ibm.com/docs/en/watsonx-as-a-service?topic=projects).
- Selon la région de votre instance de service provisionnée, utilisez l'une des URL décrites [ici](https://ibm.github.io/watsonx-ai-python-sdk/setup_cloud.html#authentication).

Dans cet exemple, nous utiliserons le `project_id` et l'URL de Dallas.

Vous devez spécifier le `model_id` qui sera utilisé pour l'inférence.

```python
from langchain_ibm import WatsonxEmbeddings

watsonx_embedding = WatsonxEmbeddings(
    model_id="ibm/slate-125m-english-rtrvr",
    url="https://us-south.ml.cloud.ibm.com",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=embed_params,
)
```

Vous pouvez également utiliser les identifiants Cloud Pak for Data. Pour plus de détails, consultez la [documentation](https://ibm.github.io/watsonx-ai-python-sdk/setup_cpd.html).

```python
watsonx_embedding = WatsonxEmbeddings(
    model_id="ibm/slate-125m-english-rtrvr",
    url="PASTE YOUR URL HERE",
    username="PASTE YOUR USERNAME HERE",
    password="PASTE YOUR PASSWORD HERE",
    instance_id="openshift",
    version="5.0",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=embed_params,
)
```

## Utilisation

### Incorporer la requête

```python
text = "This is a test document."

query_result = watsonx_embedding.embed_query(text)
query_result[:5]
```

```output
[0.0094472, -0.024981909, -0.026013248, -0.040483925, -0.057804465]
```

### Incorporer les documents

```python
texts = ["This is a content of the document", "This is another document"]

doc_result = watsonx_embedding.embed_documents(texts)
doc_result[0][:5]
```

```output
[0.009447193, -0.024981918, -0.026013244, -0.040483937, -0.057804447]
```
