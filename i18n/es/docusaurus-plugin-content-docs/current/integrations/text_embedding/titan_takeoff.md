---
translated: true
---

# Despegue de Titán

`TitanML` ayuda a las empresas a construir y desplegar modelos de PLN mejores, más pequeños, más baratos y más rápidos a través de nuestra plataforma de entrenamiento, compresión y optimización de inferencia.

Nuestro servidor de inferencia, [Titan Takeoff](https://docs.titanml.co/docs/intro), permite la implementación de LLM localmente en tu hardware con un solo comando. La mayoría de los modelos de incrustación son compatibles de forma predeterminada, si tienes problemas con un modelo específico, háznoslo saber en hello@titanml.co.

## Ejemplo de uso

Aquí hay algunos ejemplos útiles para comenzar a usar el servidor Titan Takeoff. Debes asegurarte de que el servidor Takeoff se haya iniciado en segundo plano antes de ejecutar estos comandos. Para obtener más información, consulta la [página de documentos para iniciar Takeoff](https://docs.titanml.co/docs/Docs/launching/).

```python
import time

from langchain_community.embeddings import TitanTakeoffEmbed
```

### Ejemplo 1

Uso básico suponiendo que Takeoff se está ejecutando en tu máquina utilizando sus puertos predeterminados (es decir, localhost:3000).

```python
embed = TitanTakeoffEmbed()
output = embed.embed_query(
    "What is the weather in London in August?", consumer_group="embed"
)
print(output)
```

### Ejemplo 2

Iniciar lectores usando el envoltorio de Python TitanTakeoffEmbed. Si no has creado ningún lector con el primer lanzamiento de Takeoff, o quieres agregar otro, puedes hacerlo cuando inicialices el objeto TitanTakeoffEmbed. Simplemente pasa una lista de modelos que quieres iniciar como el parámetro `models`.

Puedes usar `embed.query_documents` para incrustar varios documentos a la vez. La entrada esperada es una lista de cadenas, en lugar de solo una cadena esperada para el método `embed_query`.

```python
# Model config for the embedding model, where you can specify the following parameters:
#   model_name (str): The name of the model to use
#   device: (str): The device to use for inference, cuda or cpu
#   consumer_group (str): The consumer group to place the reader into
embedding_model = {
    "model_name": "BAAI/bge-large-en-v1.5",
    "device": "cpu",
    "consumer_group": "embed",
}
embed = TitanTakeoffEmbed(models=[embedding_model])

# The model needs time to spin up, length of time need will depend on the size of model and your network connection speed
time.sleep(60)

prompt = "What is the capital of France?"
# We specified "embed" consumer group so need to send request to the same consumer group so it hits our embedding model and not others
output = embed.embed_query(prompt, consumer_group="embed")
print(output)
```
