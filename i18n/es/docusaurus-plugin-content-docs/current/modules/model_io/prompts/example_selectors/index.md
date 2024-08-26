---
sidebar_position: 1
translated: true
---

# Selectores de ejemplo

Si tiene una gran cantidad de ejemplos, es posible que necesite seleccionar cuáles incluir en el mensaje. El Selector de Ejemplo es la clase responsable de hacer esto.

La interfaz base se define de la siguiente manera:

```python
class BaseExampleSelector(ABC):
    """Interface for selecting examples to include in prompts."""

    @abstractmethod
    def select_examples(self, input_variables: Dict[str, str]) -> List[dict]:
        """Select which examples to use based on the inputs."""

    @abstractmethod
    def add_example(self, example: Dict[str, str]) -> Any:
        """Add new example to store."""
```

El único método que necesita definir es un método `select_examples`. Este toma las variables de entrada y luego devuelve una lista de ejemplos. Cada implementación específica decide cómo se seleccionan esos ejemplos.

LangChain tiene varios tipos diferentes de selectores de ejemplo. Para obtener una descripción general de todos estos tipos, consulte la siguiente tabla.

En esta guía, recorreremos la creación de un selector de ejemplo personalizado.

## Ejemplos

Para usar un selector de ejemplo, debemos crear una lista de ejemplos. Estos generalmente deben ser ejemplos de entradas y salidas. Para este propósito de demostración, imaginemos que estamos seleccionando ejemplos de cómo traducir del inglés al italiano.

```python
examples = [
    {"input": "hi", "output": "ciao"},
    {"input": "bye", "output": "arrivaderci"},
    {"input": "soccer", "output": "calcio"},
]
```

## Selector de ejemplo personalizado

Escribamos un selector de ejemplo que elija qué ejemplo seleccionar en función de la longitud de la palabra.

```python
from langchain_core.example_selectors.base import BaseExampleSelector


class CustomExampleSelector(BaseExampleSelector):
    def __init__(self, examples):
        self.examples = examples

    def add_example(self, example):
        self.examples.append(example)

    def select_examples(self, input_variables):
        # This assumes knowledge that part of the input will be a 'text' key
        new_word = input_variables["input"]
        new_word_length = len(new_word)

        # Initialize variables to store the best match and its length difference
        best_match = None
        smallest_diff = float("inf")

        # Iterate through each example
        for example in self.examples:
            # Calculate the length difference with the first word of the example
            current_diff = abs(len(example["input"]) - new_word_length)

            # Update the best match if the current one is closer in length
            if current_diff < smallest_diff:
                smallest_diff = current_diff
                best_match = example

        return [best_match]
```

```python
example_selector = CustomExampleSelector(examples)
```

```python
example_selector.select_examples({"input": "okay"})
```

```output
[{'input': 'bye', 'output': 'arrivaderci'}]
```

```python
example_selector.add_example({"input": "hand", "output": "mano"})
```

```python
example_selector.select_examples({"input": "okay"})
```

```output
[{'input': 'hand', 'output': 'mano'}]
```

## Uso en un mensaje

Ahora podemos usar este selector de ejemplo en un mensaje.

```python
from langchain_core.prompts.few_shot import FewShotPromptTemplate
from langchain_core.prompts.prompt import PromptTemplate

example_prompt = PromptTemplate.from_template("Input: {input} -> Output: {output}")
```

```python
prompt = FewShotPromptTemplate(
    example_selector=example_selector,
    example_prompt=example_prompt,
    suffix="Input: {input} -> Output:",
    prefix="Translate the following words from English to Italain:",
    input_variables=["input"],
)

print(prompt.format(input="word"))
```

```output
Translate the following words from English to Italain:

Input: hand -> Output: mano

Input: word -> Output:
```

## Tipos de selectores de ejemplo

| Nombre     | Descripción                                                                                |
|------------|--------------------------------------------------------------------------------------------|
| Similitud  | Usa la similitud semántica entre las entradas y los ejemplos para decidir qué ejemplos elegir.    |
| MMR        | Usa la Relevancia Marginal Máxima entre las entradas y los ejemplos para decidir qué ejemplos elegir. |
| Longitud   | Selecciona ejemplos en función de cuántos pueden caber dentro de una cierta longitud                          |
| Ngrama     | Usa la superposición de ngrama entre las entradas y los ejemplos para decidir qué ejemplos elegir.          |
