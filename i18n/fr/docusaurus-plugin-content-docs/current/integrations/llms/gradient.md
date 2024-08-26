---
translated: true
---

# Gradient

`Gradient` permet d'affiner et d'obtenir des compléments sur les LLM avec une simple API web.

Ce notebook explique comment utiliser Langchain avec [Gradient](https://gradient.ai/).

## Imports

```python
from langchain.chains import LLMChain
from langchain_community.llms import GradientLLM
from langchain_core.prompts import PromptTemplate
```

## Définir la clé d'API de l'environnement

Assurez-vous d'obtenir votre clé d'API de Gradient AI. Vous bénéficiez de 10 $ de crédits gratuits pour tester et affiner différents modèles.

```python
import os
from getpass import getpass

if not os.environ.get("GRADIENT_ACCESS_TOKEN", None):
    # Access token under https://auth.gradient.ai/select-workspace
    os.environ["GRADIENT_ACCESS_TOKEN"] = getpass("gradient.ai access token:")
if not os.environ.get("GRADIENT_WORKSPACE_ID", None):
    # `ID` listed in `$ gradient workspace list`
    # also displayed after login at at https://auth.gradient.ai/select-workspace
    os.environ["GRADIENT_WORKSPACE_ID"] = getpass("gradient.ai workspace id:")
```

Facultatif : Validez vos variables d'environnement `GRADIENT_ACCESS_TOKEN` et `GRADIENT_WORKSPACE_ID` pour obtenir les modèles actuellement déployés. En utilisant le package Python `gradientai`.

```python
%pip install --upgrade --quiet  gradientai
```

```output
Requirement already satisfied: gradientai in /home/michi/.venv/lib/python3.10/site-packages (1.0.0)
Requirement already satisfied: aenum>=3.1.11 in /home/michi/.venv/lib/python3.10/site-packages (from gradientai) (3.1.15)
Requirement already satisfied: pydantic<2.0.0,>=1.10.5 in /home/michi/.venv/lib/python3.10/site-packages (from gradientai) (1.10.12)
Requirement already satisfied: python-dateutil>=2.8.2 in /home/michi/.venv/lib/python3.10/site-packages (from gradientai) (2.8.2)
Requirement already satisfied: urllib3>=1.25.3 in /home/michi/.venv/lib/python3.10/site-packages (from gradientai) (1.26.16)
Requirement already satisfied: typing-extensions>=4.2.0 in /home/michi/.venv/lib/python3.10/site-packages (from pydantic<2.0.0,>=1.10.5->gradientai) (4.5.0)
Requirement already satisfied: six>=1.5 in /home/michi/.venv/lib/python3.10/site-packages (from python-dateutil>=2.8.2->gradientai) (1.16.0)
```

```python
import gradientai

client = gradientai.Gradient()

models = client.list_models(only_base=True)
for model in models:
    print(model.id)
```

```output
99148c6d-c2a0-4fbe-a4a7-e7c05bdb8a09_base_ml_model
f0b97d96-51a8-4040-8b22-7940ee1fa24e_base_ml_model
cc2dafce-9e6e-4a23-a918-cad6ba89e42e_base_ml_model
```

```python
new_model = models[-1].create_model_adapter(name="my_model_adapter")
new_model.id, new_model.name
```

```output
('674119b5-f19e-4856-add2-767ae7f7d7ef_model_adapter', 'my_model_adapter')
```

## Créer l'instance Gradient

Vous pouvez spécifier différents paramètres tels que le modèle, le nombre maximum de jetons générés, la température, etc.

Comme nous voulons par la suite affiner notre modèle, nous sélectionnons le `model_adapter` avec l'ID `674119b5-f19e-4856-add2-767ae7f7d7ef_model_adapter`, mais vous pouvez utiliser n'importe quel modèle de base ou affinable.

```python
llm = GradientLLM(
    # `ID` listed in `$ gradient model list`
    model="674119b5-f19e-4856-add2-767ae7f7d7ef_model_adapter",
    # # optional: set new credentials, they default to environment variables
    # gradient_workspace_id=os.environ["GRADIENT_WORKSPACE_ID"],
    # gradient_access_token=os.environ["GRADIENT_ACCESS_TOKEN"],
    model_kwargs=dict(max_generated_token_count=128),
)
```

## Créer un modèle de prompt

Nous allons créer un modèle de prompt pour les questions et réponses.

```python
template = """Question: {question}

Answer: """

prompt = PromptTemplate.from_template(template)
```

## Initier la chaîne LLM

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

## Exécuter la chaîne LLM

Fournissez une question et exécutez la chaîne LLM.

```python
question = "What NFL team won the Super Bowl in 1994?"

llm_chain.run(question=question)
```

```output
'\nThe San Francisco 49ers won the Super Bowl in 1994.'
```

# Améliorer les résultats en effectuant un fine-tuning (facultatif)

Eh bien, c'est faux - les 49ers de San Francisco n'ont pas gagné.
La réponse correcte à la question serait `Les Cowboys de Dallas !`.

Augmentons les chances d'obtenir la bonne réponse en effectuant un fine-tuning sur la réponse correcte à l'aide du PromptTemplate.

```python
dataset = [
    {
        "inputs": template.format(question="What NFL team won the Super Bowl in 1994?")
        + " The Dallas Cowboys!"
    }
]
dataset
```

```output
[{'inputs': 'Question: What NFL team won the Super Bowl in 1994?\n\nAnswer:  The Dallas Cowboys!'}]
```

```python
new_model.fine_tune(samples=dataset)
```

```output
FineTuneResponse(number_of_trainable_tokens=27, sum_loss=78.17996)
```

```python
# we can keep the llm_chain, as the registered model just got refreshed on the gradient.ai servers.
llm_chain.run(question=question)
```

```output
'The Dallas Cowboys'
```
