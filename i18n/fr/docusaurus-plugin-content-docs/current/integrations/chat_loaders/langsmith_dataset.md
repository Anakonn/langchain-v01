---
translated: true
---

# Jeux de données de discussion LangSmith

Ce notebook démontre une façon simple de charger un jeu de données de discussion LangSmith et d'affiner un modèle sur ces données.
Le processus est simple et comprend 3 étapes.

1. Créer le jeu de données de discussion.
2. Utiliser le LangSmithDatasetChatLoader pour charger les exemples.
3. Affiner votre modèle.

Vous pouvez ensuite utiliser le modèle affiné dans votre application LangChain.

Avant de plonger, installons nos prérequis.

## Prérequis

Assurez-vous d'avoir installé langchain >= 0.0.311 et d'avoir configuré votre environnement avec votre clé API LangSmith.

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
import os
import uuid

uid = uuid.uuid4().hex[:6]
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "YOUR API KEY"
```

## 1. Sélectionner un jeu de données

Ce notebook affine directement un modèle en sélectionnant les exécutions sur lesquelles affiner. Vous les curez souvent à partir d'exécutions tracées. Vous pouvez en apprendre davantage sur les jeux de données LangSmith dans la documentation [docs](https://docs.smith.langchain.com/evaluation/concepts#datasets).

Pour les besoins de ce tutoriel, nous allons télécharger un jeu de données existant que vous pourrez utiliser.

```python
from langsmith.client import Client

client = Client()
```

```python
import requests

url = "https://raw.githubusercontent.com/langchain-ai/langchain/master/docs/docs/integrations/chat_loaders/example_data/langsmith_chat_dataset.json"
response = requests.get(url)
response.raise_for_status()
data = response.json()
```

```python
dataset_name = f"Extraction Fine-tuning Dataset {uid}"
ds = client.create_dataset(dataset_name=dataset_name, data_type="chat")
```

```python
_ = client.create_examples(
    inputs=[e["inputs"] for e in data],
    outputs=[e["outputs"] for e in data],
    dataset_id=ds.id,
)
```

## 2. Préparer les données

Maintenant, nous pouvons créer une instance de LangSmithRunChatLoader et charger les sessions de discussion à l'aide de sa méthode lazy_load().

```python
from langchain_community.chat_loaders.langsmith import LangSmithDatasetChatLoader

loader = LangSmithDatasetChatLoader(dataset_name=dataset_name)

chat_sessions = loader.lazy_load()
```

#### Avec les sessions de discussion chargées, convertissez-les dans un format adapté à l'affinage.

```python
from langchain_community.adapters.openai import convert_messages_for_finetuning

training_data = convert_messages_for_finetuning(chat_sessions)
```

## 3. Affiner le modèle

Maintenant, lancez le processus d'affinage à l'aide de la bibliothèque OpenAI.

```python
import json
import time
from io import BytesIO

import openai

my_file = BytesIO()
for dialog in training_data:
    my_file.write((json.dumps({"messages": dialog}) + "\n").encode("utf-8"))

my_file.seek(0)
training_file = openai.files.create(file=my_file, purpose="fine-tune")

job = openai.fine_tuning.jobs.create(
    training_file=training_file.id,
    model="gpt-3.5-turbo",
)

# Wait for the fine-tuning to complete (this may take some time)
status = openai.fine_tuning.jobs.retrieve(job.id).status
start_time = time.time()
while status != "succeeded":
    print(f"Status=[{status}]... {time.time() - start_time:.2f}s", end="\r", flush=True)
    time.sleep(5)
    status = openai.fine_tuning.jobs.retrieve(job.id).status

# Now your model is fine-tuned!
```

```output
Status=[running]... 429.55s. 46.34s
```

## 4. Utiliser dans LangChain

Après l'affinage, utilisez l'ID de modèle résultant avec la classe ChatOpenAI dans votre application LangChain.

```python
# Get the fine-tuned model ID
job = openai.fine_tuning.jobs.retrieve(job.id)
model_id = job.fine_tuned_model

# Use the fine-tuned model in LangChain
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model=model_id,
    temperature=1,
)
```

```python
model.invoke("There were three ravens sat on a tree.")
```

```output
AIMessage(content='[{"s": "There were three ravens", "object": "tree", "relation": "sat on"}, {"s": "three ravens", "object": "a tree", "relation": "sat on"}]')
```

Vous avez maintenant réussi à affiner un modèle à l'aide de données provenant d'exécutions LangSmith LLM !
