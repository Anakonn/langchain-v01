---
translated: true
---

# Décollage de Titan

`TitanML` aide les entreprises à construire et déployer de meilleurs modèles NLP, plus petits, moins coûteux et plus rapides grâce à notre plateforme de formation, de compression et d'optimisation de l'inférence.

Notre serveur d'inférence, [Titan Takeoff](https://docs.titanml.co/docs/intro), permet le déploiement de LLM localement sur votre matériel en une seule commande. La plupart des architectures de modèles génératifs sont prises en charge, comme Falcon, Llama 2, GPT2, T5 et bien d'autres. Si vous rencontrez des problèmes avec un modèle spécifique, n'hésitez pas à nous en faire part à hello@titanml.co.

## Exemple d'utilisation

Voici quelques exemples utiles pour commencer à utiliser le serveur Titan Takeoff. Vous devez vous assurer que le serveur Takeoff a été démarré en arrière-plan avant d'exécuter ces commandes. Pour plus d'informations, consultez la [page de documentation pour le lancement de Takeoff](https://docs.titanml.co/docs/Docs/launching/).

```python
import time

from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

# Note importing TitanTakeoffPro instead of TitanTakeoff will work as well both use same object under the hood
from langchain_community.llms import TitanTakeoff
from langchain_core.prompts import PromptTemplate
```

### Exemple 1

Utilisation de base en supposant que Takeoff s'exécute sur votre machine en utilisant ses ports par défaut (c'est-à-dire localhost:3000).

```python
llm = TitanTakeoff()
output = llm.invoke("What is the weather in London in August?")
print(output)
```

### Exemple 2

Spécification d'un port et d'autres paramètres de génération

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

### Exemple 3

Utilisation de generate pour plusieurs entrées

```python
llm = TitanTakeoff()
rich_output = llm.generate(["What is Deep Learning?", "What is Machine Learning?"])
print(rich_output.generations)
```

### Exemple 4

Sortie en flux

```python
llm = TitanTakeoff(
    streaming=True, callback_manager=CallbackManager([StreamingStdOutCallbackHandler()])
)
prompt = "What is the capital of France?"
output = llm.invoke(prompt)
print(output)
```

### Exemple 5

Utilisation de LCEL

```python
llm = TitanTakeoff()
prompt = PromptTemplate.from_template("Tell me about {topic}")
chain = prompt | llm
output = chain.invoke({"topic": "the universe"})
print(output)
```

### Exemple 6

Démarrage des lecteurs à l'aide de l'enveloppe Python TitanTakeoff. Si vous n'avez pas créé de lecteurs en lançant d'abord Takeoff, ou si vous voulez en ajouter un autre, vous pouvez le faire lors de l'initialisation de l'objet TitanTakeoff. Il suffit de passer une liste des configurations de modèles que vous voulez démarrer en tant que paramètre `models`.

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
