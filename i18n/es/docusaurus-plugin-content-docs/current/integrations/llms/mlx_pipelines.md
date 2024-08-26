---
translated: true
---

# Tuberías locales de MLX

Los modelos de MLX se pueden ejecutar localmente a través de la clase `MLXPipeline`.

La [Comunidad MLX](https://huggingface.co/mlx-community) alberga más de 150 modelos, todos de código abierto y disponibles públicamente en Hugging Face Model Hub, una plataforma en línea donde las personas pueden colaborar y construir ML juntas.

Estos se pueden llamar desde LangChain ya sea a través de este envoltorio de tubería local o llamando a sus puntos finales de inferencia alojados a través de la clase MlXPipeline. Para obtener más información sobre mlx, consulte el cuaderno del [repositorio de ejemplos](https://github.com/ml-explore/mlx-examples/tree/main/llms).

Para usar, debe tener instalado el paquete de Python `mlx-lm`, así como [transformers](https://pypi.org/project/transformers/). También puede instalar `huggingface_hub`.

```python
%pip install --upgrade --quiet  mlx-lm transformers huggingface_hub
```

### Carga de modelos

Los modelos se pueden cargar especificando los parámetros del modelo usando el método `from_model_id`.

```python
from langchain_community.llms.mlx_pipeline import MLXPipeline

pipe = MLXPipeline.from_model_id(
    "mlx-community/quantized-gemma-2b-it",
    pipeline_kwargs={"max_tokens": 10, "temp": 0.1},
)
```

También se pueden cargar pasando directamente una canalización `transformers` existente

```python
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline
from mlx_lm import load

model, tokenizer = load("mlx-community/quantized-gemma-2b-it")
pipe = MLXPipeline(model=model, tokenizer=tokenizer)
```

### Crear cadena

Con el modelo cargado en la memoria, puede componerlo con un mensaje para
formar una cadena.

```python
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | pipe

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```
