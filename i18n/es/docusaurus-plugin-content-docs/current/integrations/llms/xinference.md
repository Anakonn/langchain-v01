---
translated: true
---

# Xorbits Inference (Xinference)

[Xinference](https://github.com/xorbitsai/inference) es una biblioteca poderosa y versátil diseñada para servir a LLM, modelos de reconocimiento de voz y modelos multimodales, incluso en tu computadora portátil. Admite una variedad de modelos compatibles con GGML, como chatglm, baichuan, whisper, vicuna, orca y muchos otros. Este cuaderno demuestra cómo usar Xinference con LangChain.

## Instalación

Instala `Xinference` a través de PyPI:

```python
%pip install --upgrade --quiet  "xinference[all]"
```

## Implementar Xinference localmente o en un clúster distribuido.

Para la implementación local, ejecuta `xinference`.

Para implementar Xinference en un clúster, primero inicia un supervisor de Xinference usando `xinference-supervisor`. También puedes usar la opción -p para especificar el puerto y -H para especificar el host. El puerto predeterminado es 9997.

Luego, inicia los trabajadores de Xinference usando `xinference-worker` en cada servidor en el que quieras ejecutarlos.

Puedes consultar el archivo README de [Xinference](https://github.com/xorbitsai/inference) para obtener más información.

## Envoltura

Para usar Xinference con LangChain, primero debes iniciar un modelo. Puedes usar la interfaz de línea de comandos (CLI) para hacerlo:

```python
!xinference launch -n vicuna-v1.3 -f ggmlv3 -q q4_0
```

```output
Model uid: 7167b2b0-2a04-11ee-83f0-d29396a3f064
```

Se te devuelve un UID de modelo para que lo uses. Ahora puedes usar Xinference con LangChain:

```python
from langchain_community.llms import Xinference

llm = Xinference(
    server_url="http://0.0.0.0:9997", model_uid="7167b2b0-2a04-11ee-83f0-d29396a3f064"
)

llm(
    prompt="Q: where can we visit in the capital of France? A:",
    generate_config={"max_tokens": 1024, "stream": True},
)
```

```output
' You can visit the Eiffel Tower, Notre-Dame Cathedral, the Louvre Museum, and many other historical sites in Paris, the capital of France.'
```

### Integrar con un LLMChain

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

template = "Where can we visit in the capital of {country}?"

prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

generated = llm_chain.run(country="France")
print(generated)
```

```output

A: You can visit many places in Paris, such as the Eiffel Tower, the Louvre Museum, Notre-Dame Cathedral, the Champs-Elysées, Montmartre, Sacré-Cœur, and the Palace of Versailles.
```

Por último, termina el modelo cuando no lo necesites:

```python
!xinference terminate --model-uid "7167b2b0-2a04-11ee-83f0-d29396a3f064"
```
