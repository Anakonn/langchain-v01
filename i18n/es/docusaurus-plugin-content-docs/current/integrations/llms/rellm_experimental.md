---
translated: true
---

# RELLM

[RELLM](https://github.com/r2d4/rellm) es una biblioteca que envuelve los modelos de canalización locales de Hugging Face para la decodificación estructurada.

Funciona generando tokens uno a uno. En cada paso, enmascara los tokens que no se ajustan a la expresión regular parcial proporcionada.

**Advertencia: este módulo aún es experimental**

```python
%pip install --upgrade --quiet  rellm > /dev/null
```

### Línea de base de Hugging Face

Primero, vamos a establecer una línea de base cualitativa comprobando la salida del modelo sin decodificación estructurada.

```python
import logging

logging.basicConfig(level=logging.ERROR)
prompt = """Human: "What's the capital of the United States?"
AI Assistant:{
  "action": "Final Answer",
  "action_input": "The capital of the United States is Washington D.C."
}
Human: "What's the capital of Pennsylvania?"
AI Assistant:{
  "action": "Final Answer",
  "action_input": "The capital of Pennsylvania is Harrisburg."
}
Human: "What 2 + 5?"
AI Assistant:{
  "action": "Final Answer",
  "action_input": "2 + 5 = 7."
}
Human: 'What's the capital of Maryland?'
AI Assistant:"""
```

```python
from langchain_community.llms import HuggingFacePipeline
from transformers import pipeline

hf_model = pipeline(
    "text-generation", model="cerebras/Cerebras-GPT-590M", max_new_tokens=200
)

original_model = HuggingFacePipeline(pipeline=hf_model)

generated = original_model.generate([prompt], stop=["Human:"])
print(generated)
```

```output
Setting `pad_token_id` to `eos_token_id`:50256 for open-end generation.

generations=[[Generation(text=' "What\'s the capital of Maryland?"\n', generation_info=None)]] llm_output=None
```

***No es tan impresionante, ¿verdad? No respondió a la pregunta y no siguió el formato JSON en absoluto. Probemos con el decodificador estructurado.***

## Envoltura RELLM LLM

Vamos a intentarlo de nuevo, ahora proporcionando una expresión regular para que coincida con el formato estructurado JSON.

```python
import regex  # Note this is the regex library NOT python's re stdlib module

# We'll choose a regex that matches to a structured json string that looks like:
# {
#  "action": "Final Answer",
# "action_input": string or dict
# }
pattern = regex.compile(
    r'\{\s*"action":\s*"Final Answer",\s*"action_input":\s*(\{.*\}|"[^"]*")\s*\}\nHuman:'
)
```

```python
from langchain_experimental.llms import RELLM

model = RELLM(pipeline=hf_model, regex=pattern, max_new_tokens=200)

generated = model.predict(prompt, stop=["Human:"])
print(generated)
```

```output
{"action": "Final Answer",
  "action_input": "The capital of Maryland is Baltimore."
}
```

**¡Voilà! Libre de errores de análisis.**
