---
translated: true
---

# DeepSparse

Esta página cubre cómo usar el entorno de ejecución de inferencia [DeepSparse](https://github.com/neuralmagic/deepsparse) dentro de LangChain.
Se divide en dos partes: instalación y configuración, y luego ejemplos de uso de DeepSparse.

## Instalación y configuración

- Instala el paquete de Python con `pip install deepsparse`
- Elige un [modelo SparseZoo](https://sparsezoo.neuralmagic.com/?useCase=text_generation) o exporta un modelo compatible a ONNX [usando Optimum](https://github.com/neuralmagic/notebooks/blob/main/notebooks/opt-text-generation-deepsparse-quickstart/OPT_Text_Generation_DeepSparse_Quickstart.md)

Existe un wrapper de DeepSparse LLM que proporciona una interfaz unificada para todos los modelos:

```python
from langchain_community.llms import DeepSparse

llm = DeepSparse(
    model="zoo:nlg/text_generation/codegen_mono-350m/pytorch/huggingface/bigpython_bigquery_thepile/base-none"
)

print(llm.invoke("def fib():"))
```

Se pueden pasar parámetros adicionales usando el parámetro `config`:

```python
config = {"max_generated_tokens": 256}

llm = DeepSparse(
    model="zoo:nlg/text_generation/codegen_mono-350m/pytorch/huggingface/bigpython_bigquery_thepile/base-none",
    config=config,
)
```
