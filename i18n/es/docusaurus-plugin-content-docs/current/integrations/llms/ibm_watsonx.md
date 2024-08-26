---
translated: true
---

# IBM watsonx.ai

>[WatsonxLLM](https://ibm.github.io/watsonx-ai-python-sdk/fm_extensions.html#langchain) es un wrapper para los modelos de fundación [watsonx.ai](https://www.ibm.com/products/watsonx-ai) de IBM.

Este ejemplo muestra cómo comunicarse con los modelos `watsonx.ai` utilizando `LangChain`.

## Configuración

Instala el paquete `langchain-ibm`.

```python
!pip install -qU langchain-ibm
```

Esta celda define las credenciales de WML necesarias para trabajar con la inferencia del Modelo de Fundación watsonx.

**Acción:** Proporciona la clave de API de usuario de IBM Cloud. Para más detalles, consulta la [documentación](https://cloud.ibm.com/docs/account?topic=account-userapikey&interface=ui).

```python
import os
from getpass import getpass

watsonx_api_key = getpass()
os.environ["WATSONX_APIKEY"] = watsonx_api_key
```

Adicionalmente, puedes pasar secretos adicionales como una variable de entorno.

```python
import os

os.environ["WATSONX_URL"] = "your service instance url"
os.environ["WATSONX_TOKEN"] = "your token for accessing the CPD cluster"
os.environ["WATSONX_PASSWORD"] = "your password for accessing the CPD cluster"
os.environ["WATSONX_USERNAME"] = "your username for accessing the CPD cluster"
os.environ["WATSONX_INSTANCE_ID"] = "your instance_id for accessing the CPD cluster"
```

## Cargar el modelo

Es posible que necesites ajustar los `parámetros` del modelo para diferentes modelos o tareas. Para más detalles, consulta la [documentación](https://ibm.github.io/watsonx-ai-python-sdk/fm_model.html#metanames.GenTextParamsMetaNames).

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

Inicializa la clase `WatsonxLLM` con los parámetros establecidos anteriormente.

**Nota**:

- Para proporcionar contexto a la llamada de la API, debes agregar `project_id` o `space_id`. Para más información, consulta la [documentación](https://www.ibm.com/docs/en/watsonx-as-a-service?topic=projects).
- Dependiendo de la región de tu instancia de servicio aprovisionada, usa una de las URLs descritas [aquí](https://ibm.github.io/watsonx-ai-python-sdk/setup_cloud.html#authentication).

En este ejemplo, usaremos `project_id` y la URL de Dallas.

Debes especificar `model_id` que se utilizará para la inferencia. Todos los modelos disponibles los puedes encontrar en la [documentación](https://ibm.github.io/watsonx-ai-python-sdk/fm_model.html#ibm_watsonx_ai.foundation_models.utils.enums.ModelTypes).

```python
from langchain_ibm import WatsonxLLM

watsonx_llm = WatsonxLLM(
    model_id="ibm/granite-13b-instruct-v2",
    url="https://us-south.ml.cloud.ibm.com",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=parameters,
)
```

Alternativamente, puedes usar las credenciales de Cloud Pak for Data. Para más detalles, consulta la [documentación](https://ibm.github.io/watsonx-ai-python-sdk/setup_cpd.html).

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

En lugar de `model_id`, también puedes pasar el `deployment_id` del modelo previamente ajustado. Todo el flujo de trabajo de ajuste del modelo se describe [aquí](https://ibm.github.io/watsonx-ai-python-sdk/pt_working_with_class_and_prompt_tuner.html).

```python
watsonx_llm = WatsonxLLM(
    deployment_id="PASTE YOUR DEPLOYMENT_ID HERE",
    url="https://us-south.ml.cloud.ibm.com",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=parameters,
)
```

## Crear Cadena

Crea objetos `PromptTemplate` que serán responsables de crear una pregunta aleatoria.

```python
from langchain_core.prompts import PromptTemplate

template = "Generate a random question about {topic}: Question: "
prompt = PromptTemplate.from_template(template)
```

Proporciona un tema y ejecuta el `LLMChain`.

```python
from langchain.chains import LLMChain

llm_chain = LLMChain(prompt=prompt, llm=watsonx_llm)
llm_chain.invoke("dog")
```

```output
{'topic': 'dog', 'text': 'Why do dogs howl?'}
```

## Llamar al Modelo Directamente

Para obtener completaciones, puedes llamar al modelo directamente usando un prompt de cadena.

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

## Transmitir la salida del Modelo

Puedes transmitir la salida del modelo.

```python
for chunk in watsonx_llm.stream(
    "Describe your favorite breed of dog and why it is your favorite."
):
    print(chunk, end="")
```

```output
My favorite breed of dog is a Labrador Retriever. Labradors are my favorite because they are extremely smart, very friendly, and love to be with people. They are also very playful and love to run around and have a lot of energy.
```
