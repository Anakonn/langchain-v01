---
translated: true
---

# Cadena de moderación de Amazon Comprehend

>[Amazon Comprehend](https://aws.amazon.com/comprehend/) es un servicio de procesamiento de lenguaje natural (NLP) que utiliza aprendizaje automático para descubrir valiosas ideas y conexiones en el texto.

Este cuaderno muestra cómo usar `Amazon Comprehend` para detectar y manejar `Información de identificación personal` (`PII`) y toxicidad.

## Configuración

```python
%pip install --upgrade --quiet  boto3 nltk
```

```python
%pip install --upgrade --quiet  langchain_experimental
```

```python
%pip install --upgrade --quiet  langchain pydantic
```

```python
import os

import boto3

comprehend_client = boto3.client("comprehend", region_name="us-east-1")
```

```python
from langchain_experimental.comprehend_moderation import AmazonComprehendModerationChain

comprehend_moderation = AmazonComprehendModerationChain(
    client=comprehend_client,
    verbose=True,  # optional
)
```

## Uso de AmazonComprehendModerationChain con la cadena LLM

**Nota**: El ejemplo a continuación utiliza el _Fake LLM_ de LangChain, pero el mismo concepto se podría aplicar a otros LLM.

```python
from langchain_community.llms.fake import FakeListLLM
from langchain_core.prompts import PromptTemplate
from langchain_experimental.comprehend_moderation.base_moderation_exceptions import (
    ModerationPiiError,
)

template = """Question: {question}

Answer:"""

prompt = PromptTemplate.from_template(template)

responses = [
    "Final Answer: A credit card number looks like 1289-2321-1123-2387. A fake SSN number looks like 323-22-9980. John Doe's phone number is (999)253-9876.",
    # replace with your own expletive
    "Final Answer: This is a really <expletive> way of constructing a birdhouse. This is <expletive> insane to think that any birds would actually create their <expletive> nests here.",
]
llm = FakeListLLM(responses=responses)

chain = (
    prompt
    | comprehend_moderation
    | {"input": (lambda x: x["output"]) | llm}
    | comprehend_moderation
)

try:
    response = chain.invoke(
        {
            "question": "A sample SSN number looks like this 123-22-3345. Can you give me some more samples?"
        }
    )
except ModerationPiiError as e:
    print(str(e))
else:
    print(response["output"])
```

## Uso de `moderation_config` para personalizar tu moderación

Usa Amazon Comprehend Moderation con una configuración para controlar qué moderaciones deseas realizar y qué acciones se deben tomar para cada una de ellas. Hay tres moderaciones diferentes que ocurren cuando no se pasa ninguna configuración, como se demostró anteriormente. Estas moderaciones son:

- Comprobaciones de PII (Información de identificación personal)
- Detección de contenido tóxico
- Detección de seguridad de solicitud

Aquí hay un ejemplo de una configuración de moderación.

```python
from langchain_experimental.comprehend_moderation import (
    BaseModerationConfig,
    ModerationPiiConfig,
    ModerationPromptSafetyConfig,
    ModerationToxicityConfig,
)

pii_config = ModerationPiiConfig(labels=["SSN"], redact=True, mask_character="X")

toxicity_config = ModerationToxicityConfig(threshold=0.5)

prompt_safety_config = ModerationPromptSafetyConfig(threshold=0.5)

moderation_config = BaseModerationConfig(
    filters=[pii_config, toxicity_config, prompt_safety_config]
)
```

En el núcleo de la configuración, hay tres modelos de configuración que se utilizarán:

- `ModerationPiiConfig` utilizado para configurar el comportamiento de las validaciones de PII. Los siguientes son los parámetros con los que se puede inicializar:
  - `labels` las etiquetas de entidades de PII. El valor predeterminado es una lista vacía, lo que significa que la validación de PII considerará todas las entidades de PII.
  - `threshold` el umbral de confianza para las entidades detectadas, el valor predeterminado es 0.5 o 50%
  - `redact` un indicador booleano para hacer cumplir si se debe realizar el enmascaramiento en el texto, el valor predeterminado es `False`. Cuando es `False`, la validación de PII generará un error cuando detecte cualquier entidad de PII, cuando se establece en `True`, simplemente enmascarará los valores de PII en el texto.
  - `mask_character` el carácter utilizado para el enmascaramiento, el valor predeterminado es el asterisco (*)
- `ModerationToxicityConfig` utilizado para configurar el comportamiento de las validaciones de toxicidad. Los siguientes son los parámetros con los que se puede inicializar:
  - `labels` las etiquetas de entidades tóxicas. El valor predeterminado es una lista vacía, lo que significa que la validación de toxicidad considerará todas las entidades tóxicas.
  - `threshold` el umbral de confianza para las entidades detectadas, el valor predeterminado es 0.5 o 50%
- `ModerationPromptSafetyConfig` utilizado para configurar el comportamiento de la validación de seguridad de solicitud
  - `threshold` el umbral de confianza para la clasificación de seguridad de solicitud, el valor predeterminado es 0.5 o 50%

Finalmente, utilizas el `BaseModerationConfig` para definir el orden en el que se deben realizar cada uno de estos controles. El `BaseModerationConfig` toma un parámetro opcional `filters` que puede ser una lista de uno o más de los controles de validación anteriores, como se ve en el código anterior. El `BaseModerationConfig` también se puede inicializar con cualquier `filters`, en cuyo caso utilizará todos los controles con la configuración predeterminada (más sobre esto se explica más adelante).

El uso de la configuración en la celda anterior realizará comprobaciones de PII y permitirá que la solicitud pase, sin embargo, enmascarará cualquier número de Seguro Social presente tanto en la solicitud como en la salida del LLM.

```python
comp_moderation_with_config = AmazonComprehendModerationChain(
    moderation_config=moderation_config,  # specify the configuration
    client=comprehend_client,  # optionally pass the Boto3 Client
    verbose=True,
)
```

```python
from langchain_community.llms.fake import FakeListLLM
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer:"""

prompt = PromptTemplate.from_template(template)

responses = [
    "Final Answer: A credit card number looks like 1289-2321-1123-2387. A fake SSN number looks like 323-22-9980. John Doe's phone number is (999)253-9876.",
    # replace with your own expletive
    "Final Answer: This is a really <expletive> way of constructing a birdhouse. This is <expletive> insane to think that any birds would actually create their <expletive> nests here.",
]
llm = FakeListLLM(responses=responses)

chain = (
    prompt
    | comp_moderation_with_config
    | {"input": (lambda x: x["output"]) | llm}
    | comp_moderation_with_config
)


try:
    response = chain.invoke(
        {
            "question": "A sample SSN number looks like this 123-45-7890. Can you give me some more samples?"
        }
    )
except Exception as e:
    print(str(e))
else:
    print(response["output"])
```

## ID único y devoluciones de llamada de moderación

Cuando la acción de moderación de Amazon Comprehend identifica cualquiera de las entidades configuradas, la cadena generará una de las siguientes excepciones:
    - `ModerationPiiError`, para las comprobaciones de PII
    - `ModerationToxicityError`, para las comprobaciones de toxicidad
    - `ModerationPromptSafetyError` para las comprobaciones de seguridad de los mensajes

Además de la configuración de moderación, el `AmazonComprehendModerationChain` también se puede inicializar con los siguientes parámetros:

- `unique_id` [Opcional] un parámetro de cadena. Este parámetro se puede usar para pasar cualquier valor de cadena o ID. Por ejemplo, en una aplicación de chat, es posible que desee hacer un seguimiento de los usuarios abusivos, en cuyo caso puede pasar el nombre de usuario/correo electrónico del usuario, etc. El valor predeterminado es `None`.

- `moderation_callback` [Opcional] el `BaseModerationCallbackHandler` que se llamará de forma asincrónica (sin bloqueo a la cadena). Las funciones de devolución de llamada son útiles cuando desea realizar acciones adicionales cuando se ejecutan las funciones de moderación, por ejemplo, registrar en una base de datos o escribir un archivo de registro. Puede anular tres funciones al subclasificar `BaseModerationCallbackHandler` - `on_after_pii()`, `on_after_toxicity()` y `on_after_prompt_safety()`. Tenga en cuenta que las tres funciones deben ser funciones `async`. Estas funciones de devolución de llamada de moderación reciben dos argumentos:
    - `moderation_beacon` un diccionario que contendrá información sobre la función de moderación, la respuesta completa del modelo de Amazon Comprehend, un ID de cadena único, el estado de moderación y la cadena de entrada que se validó. El diccionario tiene el siguiente esquema:

    ```
    {
        'moderation_chain_id': 'xxx-xxx-xxx', # ID de cadena único
        'moderation_type': 'Toxicity' | 'PII' | 'PromptSafety',
        'moderation_status': 'LABELS_FOUND' | 'LABELS_NOT_FOUND',
        'moderation_input': 'Un número de seguro social de muestra se ve así 123-456-7890. ¿Puedes darme algunos más?',
        'moderation_output': {...} #Salida completa del modelo de PII, toxicidad o seguridad de mensajes de Amazon Comprehend
    }
    ```

    - `unique_id` si se pasó al `AmazonComprehendModerationChain`

<div class="alert alert-block alert-info"> <b>NOTA:</b> `moderation_callback` es diferente de los callbacks de cadena de LangChain. Aún puede usar los callbacks de cadena de LangChain con `AmazonComprehendModerationChain` a través del parámetro de callbacks. Ejemplo: <br/>
<pre>
from langchain.callbacks.stdout import StdOutCallbackHandler
comp_moderation_with_config = AmazonComprehendModerationChain(verbose=True, callbacks=[StdOutCallbackHandler()])
</pre>
</div>

```python
from langchain_experimental.comprehend_moderation import BaseModerationCallbackHandler
```

```python
# Define callback handlers by subclassing BaseModerationCallbackHandler


class MyModCallback(BaseModerationCallbackHandler):
    async def on_after_pii(self, output_beacon, unique_id):
        import json

        moderation_type = output_beacon["moderation_type"]
        chain_id = output_beacon["moderation_chain_id"]
        with open(f"output-{moderation_type}-{chain_id}.json", "w") as file:
            data = {"beacon_data": output_beacon, "unique_id": unique_id}
            json.dump(data, file)

    """
    async def on_after_toxicity(self, output_beacon, unique_id):
        pass

    async def on_after_prompt_safety(self, output_beacon, unique_id):
        pass
    """


my_callback = MyModCallback()
```

```python
pii_config = ModerationPiiConfig(labels=["SSN"], redact=True, mask_character="X")

toxicity_config = ModerationToxicityConfig(threshold=0.5)

moderation_config = BaseModerationConfig(filters=[pii_config, toxicity_config])

comp_moderation_with_config = AmazonComprehendModerationChain(
    moderation_config=moderation_config,  # specify the configuration
    client=comprehend_client,  # optionally pass the Boto3 Client
    unique_id="john.doe@email.com",  # A unique ID
    moderation_callback=my_callback,  # BaseModerationCallbackHandler
    verbose=True,
)
```

```python
from langchain_community.llms.fake import FakeListLLM
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer:"""

prompt = PromptTemplate.from_template(template)

responses = [
    "Final Answer: A credit card number looks like 1289-2321-1123-2387. A fake SSN number looks like 323-22-9980. John Doe's phone number is (999)253-9876.",
    # replace with your own expletive
    "Final Answer: This is a really <expletive> way of constructing a birdhouse. This is <expletive> insane to think that any birds would actually create their <expletive> nests here.",
]

llm = FakeListLLM(responses=responses)

chain = (
    prompt
    | comp_moderation_with_config
    | {"input": (lambda x: x["output"]) | llm}
    | comp_moderation_with_config
)

try:
    response = chain.invoke(
        {
            "question": "A sample SSN number looks like this 123-456-7890. Can you give me some more samples?"
        }
    )
except Exception as e:
    print(str(e))
else:
    print(response["output"])
```

## `moderation_config` y orden de ejecución de moderación

Si `AmazonComprehendModerationChain` no se inicializa con ningún `moderation_config`, se inicializa con los valores predeterminados de `BaseModerationConfig`. Si no se utilizan `filters`, la secuencia de comprobación de moderación es la siguiente.

```text
AmazonComprehendModerationChain
│
└──Check PII with Stop Action
    ├── Callback (if available)
    ├── Label Found ⟶ [Error Stop]
    └── No Label Found
        └──Check Toxicity with Stop Action
            ├── Callback (if available)
            ├── Label Found ⟶ [Error Stop]
            └── No Label Found
                └──Check Prompt Safety with Stop Action
                    ├── Callback (if available)
                    ├── Label Found ⟶ [Error Stop]
                    └── No Label Found
                        └── Return Prompt
```

Si alguna de las comprobaciones genera una excepción de validación, no se realizarán las comprobaciones posteriores. Si se proporciona un `callback` en este caso, se llamará para cada una de las comprobaciones que se hayan realizado. Por ejemplo, en el caso anterior, si la cadena falla debido a la presencia de PII, no se realizarán las comprobaciones de Toxicidad y Seguridad de Indicaciones.

Puede anular el orden de ejecución pasando `moderation_config` y especificando el orden deseado en el parámetro `filters` de `BaseModerationConfig`. En caso de que especifique los filtros, se mantendrá el orden de las comprobaciones tal y como se especifica en el parámetro `filters`. Por ejemplo, en la configuración siguiente, primero se realizará la comprobación de Toxicidad, luego la de PII y, finalmente, la validación de Seguridad de Indicaciones. En este caso, `AmazonComprehendModerationChain` realizará las comprobaciones deseadas en el orden especificado con los valores predeterminados de cada `kwargs` del modelo.

```python
pii_check = ModerationPiiConfig()
toxicity_check = ModerationToxicityConfig()
prompt_safety_check = ModerationPromptSafetyConfig()

moderation_config = BaseModerationConfig(filters=[toxicity_check, pii_check, prompt_safety_check])
```

También puede utilizar más de una configuración para una comprobación de moderación específica, por ejemplo, en la muestra siguiente se realizan dos comprobaciones consecutivas de PII. La primera configuración comprueba si hay algún SSN, si se encuentra, generará un error. Si no se encuentra ningún SSN, a continuación comprobará si hay algún NOMBRE y NÚMERO DE TARJETA DE CRÉDITO/DÉBITO presente en la indicación y lo enmascarará.

```python
pii_check_1 = ModerationPiiConfig(labels=["SSN"])
pii_check_2 = ModerationPiiConfig(labels=["NAME", "CREDIT_DEBIT_NUMBER"], redact=True)

moderation_config = BaseModerationConfig(filters=[pii_check_1, pii_check_2])
```

1. Para obtener una lista de las etiquetas de PII, consulte los tipos de entidades PII universales de Amazon Comprehend - https://docs.aws.amazon.com/comprehend/latest/dg/how-pii.html#how-pii-types
2. A continuación se muestra la lista de etiquetas de Toxicidad disponibles:
    - `HATE_SPEECH`: Discurso que critica, insulta, denuncia o deshumaniza a una persona o grupo en función de una identidad, ya sea raza, etnia, identidad de género, religión, orientación sexual, capacidad, origen nacional u otra identidad grupal.
    - `GRAPHIC`: El discurso que utiliza una imaginería visualmente descriptiva, detallada y desagradablemente vívida se considera gráfico. Este tipo de lenguaje suele ser verboso para amplificar un insulto, incomodidad o daño al receptor.
    - `HARASSMENT_OR_ABUSE`: El discurso que impone dinámicas de poder perturbadoras entre el hablante y el oyente, independientemente de la intención, busca afectar el bienestar psicológico del receptor u objetualiza a una persona debe clasificarse como Acoso.
    - `SEXUAL`: El discurso que indica interés, actividad o excitación sexual mediante el uso de referencias directas o indirectas a partes del cuerpo o rasgos físicos o al sexo se considera tóxico con el tipo de toxicidad "sexual".
    - `VIOLENCE_OR_THREAT`: El discurso que incluye amenazas que buscan infligir dolor, lesiones u hostilidad hacia una persona o grupo.
    - `INSULT`: El discurso que incluye un lenguaje despreciativo, humillante, burlón, insultante o menospreciativo.
    - `PROFANITY`: El discurso que contiene palabras, frases o acrónimos que son groseros, vulgares u ofensivos se considera profano.
3. Para obtener una lista de las etiquetas de Seguridad de Indicaciones, consulte la documentación [enlace aquí]

## Ejemplos

### Con modelos de Hugging Face Hub

Obtén tu [clave API del Hugging Face hub](https://huggingface.co/docs/api-inference/quicktour#get-your-api-token)

```python
%pip install --upgrade --quiet  huggingface_hub
```

```python
import os

os.environ["HUGGINGFACEHUB_API_TOKEN"] = "<YOUR HF TOKEN HERE>"
```

```python
# See https://huggingface.co/models?pipeline_tag=text-generation&sort=downloads for some other options
repo_id = "google/flan-t5-xxl"
```

```python
from langchain_community.llms import HuggingFaceHub
from langchain_core.prompts import PromptTemplate

template = """{question}"""

prompt = PromptTemplate.from_template(template)
llm = HuggingFaceHub(
    repo_id=repo_id, model_kwargs={"temperature": 0.5, "max_length": 256}
)
```

Crea una configuración e inicializa una cadena de moderación de Amazon Comprehend

```python
# define filter configs
pii_config = ModerationPiiConfig(
    labels=["SSN", "CREDIT_DEBIT_NUMBER"], redact=True, mask_character="X"
)

toxicity_config = ModerationToxicityConfig(threshold=0.5)

prompt_safety_config = ModerationPromptSafetyConfig(threshold=0.8)

# define different moderation configs using the filter configs above
moderation_config_1 = BaseModerationConfig(
    filters=[pii_config, toxicity_config, prompt_safety_config]
)

moderation_config_2 = BaseModerationConfig(filters=[pii_config])


# input prompt moderation chain with callback
amazon_comp_moderation = AmazonComprehendModerationChain(
    moderation_config=moderation_config_1,
    client=comprehend_client,
    moderation_callback=my_callback,
    verbose=True,
)

# Output from LLM moderation chain without callback
amazon_comp_moderation_out = AmazonComprehendModerationChain(
    moderation_config=moderation_config_2, client=comprehend_client, verbose=True
)
```

La `moderation_config` ahora impedirá que se introduzcan entradas que contengan palabras u oraciones obscenas, malas intenciones o PII con entidades distintas de SSN con una puntuación superior al umbral o al 0,5 o 50%. Si encuentra entidades de Pii - SSN - las redactará antes de permitir que continúe la llamada. También enmascarará cualquier número de SSN o tarjeta de crédito de la respuesta del modelo.

```python
chain = (
    prompt
    | amazon_comp_moderation
    | {"input": (lambda x: x["output"]) | llm}
    | amazon_comp_moderation_out
)

try:
    response = chain.invoke(
        {
            "question": """What is John Doe's address, phone number and SSN from the following text?

John Doe, a resident of 1234 Elm Street in Springfield, recently celebrated his birthday on January 1st. Turning 43 this year, John reflected on the years gone by. He often shares memories of his younger days with his close friends through calls on his phone, (555) 123-4567. Meanwhile, during a casual evening, he received an email at johndoe@example.com reminding him of an old acquaintance's reunion. As he navigated through some old documents, he stumbled upon a paper that listed his SSN as 123-45-6789, reminding him to store it in a safer place.
"""
        }
    )
except Exception as e:
    print(str(e))
else:
    print(response["output"])
```

### Con Amazon SageMaker Jumpstart

El ejemplo siguiente muestra cómo utilizar la cadena de moderación de Amazon Comprehend con un punto final de LLM alojado en Amazon SageMaker Jumpstart. Debes tener un punto final de LLM alojado en Amazon SageMaker Jumpstart dentro de tu cuenta de AWS. Consulta [este cuaderno](https://github.com/aws/amazon-sagemaker-examples/blob/main/introduction_to_amazon_algorithms/jumpstart-foundation-models/text-generation-falcon.md) para obtener más información sobre cómo implementar un LLM con puntos finales alojados de Amazon SageMaker Jumpstart.

```python
endpoint_name = "<SAGEMAKER_ENDPOINT_NAME>"  # replace with your SageMaker Endpoint name
region = "<REGION>"  # replace with your SageMaker Endpoint region
```

```python
import json

from langchain_community.llms import SagemakerEndpoint
from langchain_community.llms.sagemaker_endpoint import LLMContentHandler
from langchain_core.prompts import PromptTemplate


class ContentHandler(LLMContentHandler):
    content_type = "application/json"
    accepts = "application/json"

    def transform_input(self, prompt: str, model_kwargs: dict) -> bytes:
        input_str = json.dumps({"text_inputs": prompt, **model_kwargs})
        return input_str.encode("utf-8")

    def transform_output(self, output: bytes) -> str:
        response_json = json.loads(output.read().decode("utf-8"))
        return response_json["generated_texts"][0]


content_handler = ContentHandler()

template = """From the following 'Document', precisely answer the 'Question'. Do not add any spurious information in your answer.

Document: John Doe, a resident of 1234 Elm Street in Springfield, recently celebrated his birthday on January 1st. Turning 43 this year, John reflected on the years gone by. He often shares memories of his younger days with his close friends through calls on his phone, (555) 123-4567. Meanwhile, during a casual evening, he received an email at johndoe@example.com reminding him of an old acquaintance's reunion. As he navigated through some old documents, he stumbled upon a paper that listed his SSN as 123-45-6789, reminding him to store it in a safer place.
Question: {question}
Answer:
"""

# prompt template for input text
llm_prompt = PromptTemplate.from_template(template)

llm = SagemakerEndpoint(
    endpoint_name=endpoint_name,
    region_name=region,
    model_kwargs={
        "temperature": 0.95,
        "max_length": 200,
        "num_return_sequences": 3,
        "top_k": 50,
        "top_p": 0.95,
        "do_sample": True,
    },
    content_handler=content_handler,
)
```

Crea una configuración e inicializa una cadena de moderación de Amazon Comprehend

```python
# define filter configs
pii_config = ModerationPiiConfig(labels=["SSN"], redact=True, mask_character="X")

toxicity_config = ModerationToxicityConfig(threshold=0.5)


# define different moderation configs using the filter configs above
moderation_config_1 = BaseModerationConfig(filters=[pii_config, toxicity_config])

moderation_config_2 = BaseModerationConfig(filters=[pii_config])


# input prompt moderation chain with callback
amazon_comp_moderation = AmazonComprehendModerationChain(
    moderation_config=moderation_config_1,
    client=comprehend_client,
    moderation_callback=my_callback,
    verbose=True,
)

# Output from LLM moderation chain without callback
amazon_comp_moderation_out = AmazonComprehendModerationChain(
    moderation_config=moderation_config_2, client=comprehend_client, verbose=True
)
```

La `moderation_config` ahora impedirá que se introduzcan entradas y salidas del modelo que contengan palabras u oraciones obscenas, malas intenciones o Pii con entidades distintas de SSN con una puntuación superior al umbral o al 0,5 o 50%. Si encuentra entidades de Pii - SSN - las redactará antes de permitir que continúe la llamada.

```python
chain = (
    prompt
    | amazon_comp_moderation
    | {"input": (lambda x: x["output"]) | llm}
    | amazon_comp_moderation_out
)

try:
    response = chain.invoke(
        {"question": "What is John Doe's address, phone number and SSN?"}
    )
except Exception as e:
    print(str(e))
else:
    print(response["output"])
```
