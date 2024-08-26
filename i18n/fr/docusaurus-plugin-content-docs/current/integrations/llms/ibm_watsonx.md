---
translated: true
---

# IBM watsonx.ai

>[WatsonxLLM](https://ibm.github.io/watsonx-ai-python-sdk/fm_extensions.html#langchain) est un wrapper pour les modèles de base [watsonx.ai](https://www.ibm.com/products/watsonx-ai) d'IBM.

Cet exemple montre comment communiquer avec les modèles `watsonx.ai` à l'aide de `LangChain`.

## Configuration

Installez le package `langchain-ibm`.

```python
!pip install -qU langchain-ibm
```

Cette cellule définit les informations d'identification WML requises pour travailler avec l'inférence du modèle de base watsonx.

**Action :** Fournissez la clé API utilisateur IBM Cloud. Pour plus de détails, consultez la [documentation](https://cloud.ibm.com/docs/account?topic=account-userapikey&interface=ui).

```python
import os
from getpass import getpass

watsonx_api_key = getpass()
os.environ["WATSONX_APIKEY"] = watsonx_api_key
```

Vous pouvez également transmettre des secrets supplémentaires en tant que variable d'environnement.

```python
import os

os.environ["WATSONX_URL"] = "your service instance url"
os.environ["WATSONX_TOKEN"] = "your token for accessing the CPD cluster"
os.environ["WATSONX_PASSWORD"] = "your password for accessing the CPD cluster"
os.environ["WATSONX_USERNAME"] = "your username for accessing the CPD cluster"
os.environ["WATSONX_INSTANCE_ID"] = "your instance_id for accessing the CPD cluster"
```

## Charger le modèle

Vous devrez peut-être ajuster les `paramètres` du modèle pour différents modèles ou tâches. Pour plus de détails, consultez la [documentation](https://ibm.github.io/watsonx-ai-python-sdk/fm_model.html#metanames.GenTextParamsMetaNames).

```python
parameters = {
    "decoding_method": "sample",
    "max_new_tokens": 100,
    "min_new_tokens": 1,
    "temperature": 0.5,
    "top_k": 50,
    "top_p": 1,
}
```

Initialisez la classe `WatsonxLLM` avec les paramètres précédemment définis.

**Remarque** :

- Pour fournir un contexte pour l'appel API, vous devez ajouter `project_id` ou `space_id`. Pour plus d'informations, consultez la [documentation](https://www.ibm.com/docs/en/watsonx-as-a-service?topic=projects).
- Selon la région de votre instance de service provisionnée, utilisez l'une des URL décrites [ici](https://ibm.github.io/watsonx-ai-python-sdk/setup_cloud.html#authentication).

Dans cet exemple, nous utiliserons le `project_id` et l'URL de Dallas.

Vous devez spécifier le `model_id` qui sera utilisé pour l'inférence. Tous les modèles disponibles, vous les trouverez dans la [documentation](https://ibm.github.io/watsonx-ai-python-sdk/fm_model.html#ibm_watsonx_ai.foundation_models.utils.enums.ModelTypes).

```python
from langchain_ibm import WatsonxLLM

watsonx_llm = WatsonxLLM(
    model_id="ibm/granite-13b-instruct-v2",
    url="https://us-south.ml.cloud.ibm.com",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=parameters,
)
```

Vous pouvez également utiliser les informations d'identification de Cloud Pak for Data. Pour plus de détails, consultez la [documentation](https://ibm.github.io/watsonx-ai-python-sdk/setup_cpd.html).

```python
watsonx_llm = WatsonxLLM(
    model_id="ibm/granite-13b-instruct-v2",
    url="PASTE YOUR URL HERE",
    username="PASTE YOUR USERNAME HERE",
    password="PASTE YOUR PASSWORD HERE",
    instance_id="openshift",
    version="4.8",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=parameters,
)
```

Au lieu de `model_id`, vous pouvez également transmettre le `deployment_id` du modèle précédemment affiné. L'ensemble du flux de travail de l'affinage du modèle est décrit [ici](https://ibm.github.io/watsonx-ai-python-sdk/pt_working_with_class_and_prompt_tuner.html).

```python
watsonx_llm = WatsonxLLM(
    deployment_id="PASTE YOUR DEPLOYMENT_ID HERE",
    url="https://us-south.ml.cloud.ibm.com",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=parameters,
)
```

## Créer une chaîne

Créez des objets `PromptTemplate` qui seront responsables de la création d'une question aléatoire.

```python
from langchain_core.prompts import PromptTemplate

template = "Generate a random question about {topic}: Question: "
prompt = PromptTemplate.from_template(template)
```

Fournissez un sujet et exécutez la `LLMChain`.

```python
from langchain.chains import LLMChain

llm_chain = LLMChain(prompt=prompt, llm=watsonx_llm)
llm_chain.invoke("dog")
```

```output
{'topic': 'dog', 'text': 'Why do dogs howl?'}
```

## Appeler le modèle directement

Pour obtenir des compléments, vous pouvez appeler le modèle directement à l'aide d'une invite de chaîne.

```python
# Calling a single prompt

watsonx_llm.invoke("Who is man's best friend?")
```

```output
"Man's best friend is his dog. "
```

```python
# Calling multiple prompts

watsonx_llm.generate(
    [
        "The fastest dog in the world?",
        "Describe your chosen dog breed",
    ]
)
```

```output
LLMResult(generations=[[Generation(text='The fastest dog in the world is the greyhound, which can run up to 45 miles per hour. This is about the same speed as a human running down a track. Greyhounds are very fast because they have long legs, a streamlined body, and a strong tail. They can run this fast for short distances, but they can also run for long distances, like a marathon. ', generation_info={'finish_reason': 'eos_token'})], [Generation(text='The Beagle is a scent hound, meaning it is bred to hunt by following a trail of scents.', generation_info={'finish_reason': 'eos_token'})]], llm_output={'token_usage': {'generated_token_count': 106, 'input_token_count': 13}, 'model_id': 'ibm/granite-13b-instruct-v2', 'deployment_id': ''}, run=[RunInfo(run_id=UUID('52cb421d-b63f-4c5f-9b04-d4770c664725')), RunInfo(run_id=UUID('df2ea606-1622-4ed7-8d5d-8f6e068b71c4'))])
```

## Diffuser la sortie du modèle

Vous pouvez diffuser la sortie du modèle.

```python
for chunk in watsonx_llm.stream(
    "Describe your favorite breed of dog and why it is your favorite."
):
    print(chunk, end="")
```

```output
My favorite breed of dog is a Labrador Retriever. Labradors are my favorite because they are extremely smart, very friendly, and love to be with people. They are also very playful and love to run around and have a lot of energy.
```
