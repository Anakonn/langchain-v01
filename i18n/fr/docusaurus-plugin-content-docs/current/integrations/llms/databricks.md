---
translated: true
---

# Databricks

La [Databricks](https://www.databricks.com/) Lakehouse Platform unifie les données, l'analyse et l'IA sur une seule plateforme.

Cet exemple de notebook montre comment encapsuler les points de terminaison Databricks en tant que LLM dans LangChain.
Il prend en charge deux types de points de terminaison :

* Point de terminaison de service, recommandé pour la production et le développement,
* Application proxy du pilote de cluster, recommandée pour le développement interactif.

## Installation

`mlflow >= 2.9` est requis pour exécuter le code de ce notebook. S'il n'est pas installé, veuillez l'installer à l'aide de cette commande :

```bash
pip install mlflow>=2.9
```

Nous avons également besoin de `dbutils` pour cet exemple.

```bash
pip install dbutils
```

## Encapsuler un point de terminaison de service : Modèle externe

Prérequis : Enregistrez une clé API OpenAI en tant que secret :

```bash
databricks secrets create-scope <scope>
databricks secrets put-secret <scope> openai-api-key --string-value $OPENAI_API_KEY
```

Le code suivant crée un nouveau point de terminaison de service avec le modèle GPT-4 d'OpenAI pour le chat et génère une réponse à l'aide du point de terminaison.

```python
from langchain_community.chat_models import ChatDatabricks
from langchain_core.messages import HumanMessage
from mlflow.deployments import get_deploy_client

client = get_deploy_client("databricks")

secret = "secrets/<scope>/openai-api-key"  # replace `<scope>` with your scope
name = "my-chat"  # rename this if my-chat already exists
client.create_endpoint(
    name=name,
    config={
        "served_entities": [
            {
                "name": "my-chat",
                "external_model": {
                    "name": "gpt-4",
                    "provider": "openai",
                    "task": "llm/v1/chat",
                    "openai_config": {
                        "openai_api_key": "{{" + secret + "}}",
                    },
                },
            }
        ],
    },
)

chat = ChatDatabricks(
    target_uri="databricks",
    endpoint=name,
    temperature=0.1,
)
chat([HumanMessage(content="hello")])
```

```output
content='Hello! How can I assist you today?'
```

## Encapsuler un point de terminaison de service : Modèle de base

Le code suivant utilise le point de terminaison de service `databricks-bge-large-en` (aucune création de point de terminaison n'est requise) pour générer des embeddings à partir du texte d'entrée.

```python
from langchain_community.embeddings import DatabricksEmbeddings

embeddings = DatabricksEmbeddings(endpoint="databricks-bge-large-en")
embeddings.embed_query("hello")[:3]
```

```output
[0.051055908203125, 0.007221221923828125, 0.003879547119140625]
```

## Encapsuler un point de terminaison de service : Modèle personnalisé

Prérequis :

* Un LLM a été enregistré et déployé sur [un point de terminaison de service Databricks](https://docs.databricks.com/machine-learning/model-serving/index.html).
* Vous avez l'autorisation ["Can Query"](https://docs.databricks.com/security/auth-authz/access-control/serving-endpoint-acl.html) sur le point de terminaison.

La signature du modèle MLflow attendue est :

  * inputs : `[{"name": "prompt", "type": "string"}, {"name": "stop", "type": "list[string]"}]`
  * outputs : `[{"type": "string"}]`

Si la signature du modèle est incompatible ou si vous voulez insérer des configurations supplémentaires, vous pouvez définir `transform_input_fn` et `transform_output_fn` en conséquence.

```python
from langchain_community.llms import Databricks

# If running a Databricks notebook attached to an interactive cluster in "single user"
# or "no isolation shared" mode, you only need to specify the endpoint name to create
# a `Databricks` instance to query a serving endpoint in the same workspace.
llm = Databricks(endpoint_name="dolly")

llm("How are you?")
```

```output
'I am happy to hear that you are in good health and as always, you are appreciated.'
```

```python
llm("How are you?", stop=["."])
```

```output
'Good'
```

```python
# Otherwise, you can manually specify the Databricks workspace hostname and personal access token
# or set `DATABRICKS_HOST` and `DATABRICKS_TOKEN` environment variables, respectively.
# See https://docs.databricks.com/dev-tools/auth.html#databricks-personal-access-tokens
# We strongly recommend not exposing the API token explicitly inside a notebook.
# You can use Databricks secret manager to store your API token securely.
# See https://docs.databricks.com/dev-tools/databricks-utils.html#secrets-utility-dbutilssecrets

import os

import dbutils

os.environ["DATABRICKS_TOKEN"] = dbutils.secrets.get("myworkspace", "api_token")

llm = Databricks(host="myworkspace.cloud.databricks.com", endpoint_name="dolly")

llm("How are you?")
```

```output
'I am fine. Thank you!'
```

```python
# If the serving endpoint accepts extra parameters like `temperature`,
# you can set them in `model_kwargs`.
llm = Databricks(endpoint_name="dolly", model_kwargs={"temperature": 0.1})

llm("How are you?")
```

```output
'I am fine.'
```

```python
# Use `transform_input_fn` and `transform_output_fn` if the serving endpoint
# expects a different input schema and does not return a JSON string,
# respectively, or you want to apply a prompt template on top.


def transform_input(**request):
    full_prompt = f"""{request["prompt"]}
    Be Concise.
    """
    request["prompt"] = full_prompt
    return request


llm = Databricks(endpoint_name="dolly", transform_input_fn=transform_input)

llm("How are you?")
```

```output
'I’m Excellent. You?'
```

## Encapsuler une application proxy du pilote de cluster

Prérequis :

* Un LLM chargé sur un cluster interactif Databricks en mode "single user" ou "no isolation shared".
* Un serveur HTTP local en cours d'exécution sur le nœud pilote pour servir le modèle à `"/"` en utilisant HTTP POST avec une entrée/sortie JSON.
* Il utilise un numéro de port compris entre `[3000, 8000]` et écoute l'adresse IP du pilote ou simplement `0.0.0.0` au lieu de localhost uniquement.
* Vous avez l'autorisation "Can Attach To" sur le cluster.

Le schéma de serveur attendu (en utilisant le schéma JSON) est :

* inputs :
  ```json
  {"type": "object",
   "properties": {
      "prompt": {"type": "string"},
       "stop": {"type": "array", "items": {"type": "string"}}},
    "required": ["prompt"]}
  ```
* outputs : `{"type": "string"}`

Si le schéma du serveur est incompatible ou si vous voulez insérer des configurations supplémentaires, vous pouvez utiliser `transform_input_fn` et `transform_output_fn` en conséquence.

Voici un exemple minimal pour exécuter une application proxy du pilote afin de servir un LLM :

```python
from flask import Flask, request, jsonify
import torch
from transformers import pipeline, AutoTokenizer, StoppingCriteria

model = "databricks/dolly-v2-3b"
tokenizer = AutoTokenizer.from_pretrained(model, padding_side="left")
dolly = pipeline(model=model, tokenizer=tokenizer, trust_remote_code=True, device_map="auto")
device = dolly.device

class CheckStop(StoppingCriteria):
    def __init__(self, stop=None):
        super().__init__()
        self.stop = stop or []
        self.matched = ""
        self.stop_ids = [tokenizer.encode(s, return_tensors='pt').to(device) for s in self.stop]
    def __call__(self, input_ids: torch.LongTensor, scores: torch.FloatTensor, **kwargs):
        for i, s in enumerate(self.stop_ids):
            if torch.all((s == input_ids[0][-s.shape[1]:])).item():
                self.matched = self.stop[i]
                return True
        return False

def llm(prompt, stop=None, **kwargs):
  check_stop = CheckStop(stop)
  result = dolly(prompt, stopping_criteria=[check_stop], **kwargs)
  return result[0]["generated_text"].rstrip(check_stop.matched)

app = Flask("dolly")

@app.route('/', methods=['POST'])
def serve_llm():
  resp = llm(**request.json)
  return jsonify(resp)

app.run(host="0.0.0.0", port="7777")
```

Une fois que le serveur est en cours d'exécution, vous pouvez créer une instance `Databricks` pour l'encapsuler en tant que LLM.

```python
# If running a Databricks notebook attached to the same cluster that runs the app,
# you only need to specify the driver port to create a `Databricks` instance.
llm = Databricks(cluster_driver_port="7777")

llm("How are you?")
```

```output
'Hello, thank you for asking. It is wonderful to hear that you are well.'
```

```python
# Otherwise, you can manually specify the cluster ID to use,
# as well as Databricks workspace hostname and personal access token.

llm = Databricks(cluster_id="0000-000000-xxxxxxxx", cluster_driver_port="7777")

llm("How are you?")
```

```output
'I am well. You?'
```

```python
# If the app accepts extra parameters like `temperature`,
# you can set them in `model_kwargs`.
llm = Databricks(cluster_driver_port="7777", model_kwargs={"temperature": 0.1})

llm("How are you?")
```

```output
'I am very well. It is a pleasure to meet you.'
```

```python
# Use `transform_input_fn` and `transform_output_fn` if the app
# expects a different input schema and does not return a JSON string,
# respectively, or you want to apply a prompt template on top.


def transform_input(**request):
    full_prompt = f"""{request["prompt"]}
    Be Concise.
    """
    request["prompt"] = full_prompt
    return request


def transform_output(response):
    return response.upper()


llm = Databricks(
    cluster_driver_port="7777",
    transform_input_fn=transform_input,
    transform_output_fn=transform_output,
)

llm("How are you?")
```

```output
'I AM DOING GREAT THANK YOU.'
```
