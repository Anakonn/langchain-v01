---
translated: true
---

# Modal

La [plateforme cloud Modal](https://modal.com/docs/guide) fournit un accès pratique et à la demande au calcul cloud serverless à partir de scripts Python sur votre ordinateur local.
Utilisez `modal` pour exécuter vos propres modèles LLM personnalisés au lieu de dépendre des API LLM.

Cet exemple explique comment utiliser LangChain pour interagir avec un [point de terminaison web](https://modal.com/docs/guide/webhooks) `modal` HTTPS.

[_Réponse aux questions avec LangChain_](https://modal.com/docs/guide/ex/potus_speech_qanda) est un autre exemple de la manière d'utiliser LangChain avec `Modal`. Dans cet exemple, Modal exécute l'application LangChain de bout en bout et utilise OpenAI comme API LLM.

```python
%pip install --upgrade --quiet  modal
```

```python
# Register an account with Modal and get a new token.

!modal token new
```

```output
Launching login page in your browser window...
If this is not showing up, please copy this URL into your web browser manually:
https://modal.com/token-flow/tf-Dzm3Y01234mqmm1234Vcu3
```

La classe d'intégration [`langchain.llms.modal.Modal`](https://github.com/langchain-ai/langchain/blame/master/langchain/llms/modal.py) nécessite que vous déployiez une application Modal avec un point de terminaison web qui se conforme à l'interface JSON suivante :

1. L'invite LLM est acceptée comme une valeur `str` sous la clé `"prompt"`
2. La réponse LLM est renvoyée comme une valeur `str` sous la clé `"prompt"`

**Exemple de requête JSON :**

```json
{
    "prompt": "Identify yourself, bot!",
    "extra": "args are allowed",
}
```

**Exemple de réponse JSON :**

```json
{
    "prompt": "This is the LLM speaking",
}
```

Un exemple de fonction de point de terminaison web 'dummy' Modal remplissant cette interface serait

```python
...
...

class Request(BaseModel):
    prompt: str

@stub.function()
@modal.web_endpoint(method="POST")
def web(request: Request):
    _ = request  # ignore input
    return {"prompt": "hello world"}
```

* Consultez le guide des [points de terminaison web](https://modal.com/docs/guide/webhooks#passing-arguments-to-web-endpoints) de Modal pour les bases de la configuration d'un point de terminaison qui remplit cette interface.
* Consultez l'exemple open-source LLM ['Exécuter Falcon-40B avec AutoGPTQ'](https://modal.com/docs/guide/ex/falcon_gptq) de Modal comme point de départ pour votre LLM personnalisé !

Une fois que vous avez un point de terminaison web Modal déployé, vous pouvez transmettre son URL à la classe LLM `langchain.llms.modal.Modal`. Cette classe peut ensuite fonctionner comme un élément de construction dans votre chaîne.

```python
from langchain.chains import LLMChain
from langchain_community.llms import Modal
from langchain_core.prompts import PromptTemplate
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
endpoint_url = "https://ecorp--custom-llm-endpoint.modal.run"  # REPLACE ME with your deployed Modal web endpoint's URL
llm = Modal(endpoint_url=endpoint_url)
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
