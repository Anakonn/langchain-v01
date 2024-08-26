---
translated: true
---

# Despegue de Titán

`TitanML` ayuda a las empresas a construir y desplegar modelos de PLN mejores, más pequeños, más baratos y más rápidos a través de nuestra plataforma de entrenamiento, compresión y optimización de inferencia.

Nuestro servidor de inferencia, [Despegue de Titán](https://docs.titanml.co/docs/intro) permite la implementación de LLM localmente en tu hardware con un solo comando. Se admiten la mayoría de las arquitecturas de modelos generativos, como Falcon, Llama 2, GPT2, T5 y muchos más. Si tienes problemas con un modelo específico, háznoslo saber en hello@titanml.co.

## Ejemplo de uso

Aquí hay algunos ejemplos útiles para comenzar a usar el servidor Titan Takeoff. Debes asegurarte de que el servidor Takeoff se haya iniciado en segundo plano antes de ejecutar estos comandos. Para obtener más información, consulta la [página de documentación para iniciar Takeoff](https://docs.titanml.co/docs/Docs/launching/).

```python
import time

from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

# Note importing TitanTakeoffPro instead of TitanTakeoff will work as well both use same object under the hood
from langchain_community.llms import TitanTakeoff
from langchain_core.prompts import PromptTemplate
```

### Ejemplo 1

Uso básico suponiendo que Takeoff se está ejecutando en tu máquina utilizando sus puertos predeterminados (es decir, localhost:3000).

```python
llm = TitanTakeoff()
output = llm.invoke("What is the weather in London in August?")
print(output)
```

### Ejemplo 2

Especificando un puerto y otros parámetros de generación

```python
llm = TitanTakeoff(port=3000)
# A comprehensive list of parameters can be found at https://docs.titanml.co/docs/next/apis/Takeoff%20inference_REST_API/generate#request
output = llm.invoke(
    "What is the largest rainforest in the world?",
    consumer_group="primary",
    min_new_tokens=128,
    max_new_tokens=512,
    no_repeat_ngram_size=2,
    sampling_topk=1,
    sampling_topp=1.0,
    sampling_temperature=1.0,
    repetition_penalty=1.0,
    regex_string="",
    json_schema=None,
)
print(output)
```

### Ejemplo 3

Usando generate para múltiples entradas

```python
llm = TitanTakeoff()
rich_output = llm.generate(["What is Deep Learning?", "What is Machine Learning?"])
print(rich_output.generations)
```

### Ejemplo 4

Salida de transmisión

```python
llm = TitanTakeoff(
    streaming=True, callback_manager=CallbackManager([StreamingStdOutCallbackHandler()])
)
prompt = "What is the capital of France?"
output = llm.invoke(prompt)
print(output)
```

### Ejemplo 5

Usando LCEL

```python
llm = TitanTakeoff()
prompt = PromptTemplate.from_template("Tell me about {topic}")
chain = prompt | llm
output = chain.invoke({"topic": "the universe"})
print(output)
```

### Ejemplo 6

Iniciando lectores usando el envoltorio de Python TitanTakeoff. Si no has creado ningún lector con el primer lanzamiento de Takeoff, o quieres agregar otro, puedes hacerlo cuando inicialices el objeto TitanTakeoff. Simplemente pasa una lista de configuraciones de modelos que quieras iniciar como el parámetro `models`.

```python
# Model config for the llama model, where you can specify the following parameters:
#   model_name (str): The name of the model to use
#   device: (str): The device to use for inference, cuda or cpu
#   consumer_group (str): The consumer group to place the reader into
#   tensor_parallel (Optional[int]): The number of gpus you would like your model to be split across
#   max_seq_length (int): The maximum sequence length to use for inference, defaults to 512
#   max_batch_size (int_: The max batch size for continuous batching of requests
llama_model = {
    "model_name": "TheBloke/Llama-2-7b-Chat-AWQ",
    "device": "cuda",
    "consumer_group": "llama",
}
llm = TitanTakeoff(models=[llama_model])

# The model needs time to spin up, length of time need will depend on the size of model and your network connection speed
time.sleep(60)

prompt = "What is the capital of France?"
output = llm.invoke(prompt, consumer_group="llama")
print(output)
```
