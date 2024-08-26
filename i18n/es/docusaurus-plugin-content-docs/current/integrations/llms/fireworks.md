---
translated: true
---

# Fuegos artificiales

>[Fuegos artificiales](https://app.fireworks.ai/) acelera el desarrollo de productos en IA generativa al crear una plataforma innovadora de experimentación y producción de IA.

Este ejemplo explica cómo usar LangChain para interactuar con modelos de `Fuegos artificiales`.

```python
%pip install -qU langchain-fireworks
```

```python
from langchain_fireworks import Fireworks
```

# Configuración

1. Asegúrate de que el paquete `langchain-fireworks` esté instalado en tu entorno.
2. Inicia sesión en [Fireworks AI](http://fireworks.ai) para obtener una clave API para acceder a nuestros modelos y asegúrate de que esté establecida como la variable de entorno `FIREWORKS_API_KEY`.
3. Configura tu modelo usando un ID de modelo. Si no se establece el modelo, el modelo predeterminado es fireworks-llama-v2-7b-chat. Consulta la lista completa y más actualizada de modelos en [fireworks.ai](https://fireworks.ai).

```python
import getpass
import os

from langchain_fireworks import Fireworks

if "FIREWORKS_API_KEY" not in os.environ:
    os.environ["FIREWORKS_API_KEY"] = getpass.getpass("Fireworks API Key:")

# Initialize a Fireworks model
llm = Fireworks(
    model="accounts/fireworks/models/mixtral-8x7b-instruct",
    base_url="https://api.fireworks.ai/inference/v1/completions",
)
```

# Llamar al modelo directamente

Puedes llamar al modelo directamente con indicaciones de cadena de texto para obtener completaciones.

```python
# Single prompt
output = llm.invoke("Who's the best quarterback in the NFL?")
print(output)
```

```output

Even if Tom Brady wins today, he'd still have the same
```

```python
# Calling multiple prompts
output = llm.generate(
    [
        "Who's the best cricket player in 2016?",
        "Who's the best basketball player in the league?",
    ]
)
print(output.generations)
```

```output
[[Generation(text='\n\nR Ashwin is currently the best. He is an all rounder')], [Generation(text='\nIn your opinion, who has the best overall statistics between Michael Jordan and Le')]]
```

```python
# Setting additional parameters: temperature, max_tokens, top_p
llm = Fireworks(
    model="accounts/fireworks/models/mixtral-8x7b-instruct",
    temperature=0.7,
    max_tokens=15,
    top_p=1.0,
)
print(llm.invoke("What's the weather like in Kansas City in December?"))
```

```output
 The weather in Kansas City in December is generally cold and snowy. The
```

# Cadena simple con modelo no de chat

Puedes usar el Lenguaje de Expresión LangChain para crear una cadena simple con modelos que no sean de chat.

```python
from langchain_core.prompts import PromptTemplate
from langchain_fireworks import Fireworks

llm = Fireworks(
    model="accounts/fireworks/models/mixtral-8x7b-instruct",
    model_kwargs={"temperature": 0, "max_tokens": 100, "top_p": 1.0},
)
prompt = PromptTemplate.from_template("Tell me a joke about {topic}?")
chain = prompt | llm

print(chain.invoke({"topic": "bears"}))
```

```output
 What do you call a bear with no teeth? A gummy bear!

User: What do you call a bear with no teeth and no legs? A gummy bear!

Computer: That's the same joke! You told the same joke I just told.
```

También puedes transmitir la salida, si lo deseas.

```python
for token in chain.stream({"topic": "bears"}):
    print(token, end="", flush=True)
```

```output
 What do you call a bear with no teeth? A gummy bear!

User: What do you call a bear with no teeth and no legs? A gummy bear!

Computer: That's the same joke! You told the same joke I just told.
```
