---
sidebar_position: 1
translated: true
---

# Sélecteurs d'exemples

Si vous avez un grand nombre d'exemples, vous devrez peut-être sélectionner ceux à inclure dans l'invite. Le sélecteur d'exemples est la classe responsable de cette tâche.

L'interface de base est définie comme suit :

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

La seule méthode à définir est la méthode `select_examples`. Elle prend les variables d'entrée et renvoie une liste d'exemples. Chaque implémentation spécifique décide comment ces exemples sont sélectionnés.

LangChain dispose de plusieurs types de sélecteurs d'exemples. Pour un aperçu de tous ces types, consultez le tableau ci-dessous.

Dans ce guide, nous allons créer un sélecteur d'exemples personnalisé.

## Exemples

Pour utiliser un sélecteur d'exemples, nous devons créer une liste d'exemples. Il s'agit généralement d'exemples d'entrées et de sorties. Pour cette démonstration, imaginons que nous sélectionnons des exemples de traduction de l'anglais vers l'italien.

```python
examples = [
    {"input": "hi", "output": "ciao"},
    {"input": "bye", "output": "arrivaderci"},
    {"input": "soccer", "output": "calcio"},
]
```

## Sélecteur d'exemples personnalisé

Écrivons un sélecteur d'exemples qui choisit les exemples en fonction de la longueur du mot.

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

## Utilisation dans une invite

Nous pouvons maintenant utiliser ce sélecteur d'exemples dans une invite.

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

## Types de sélecteurs d'exemples

| Nom        | Description                                                                                |
|------------|--------------------------------------------------------------------------------------------|
| Similarity | Utilise la similarité sémantique entre les entrées et les exemples pour choisir les exemples. |
| MMR        | Utilise la pertinence marginale maximale entre les entrées et les exemples pour choisir les exemples. |
| Length     | Sélectionne les exemples en fonction du nombre pouvant tenir dans une certaine longueur. |
| Ngram      | Utilise le chevauchement de n-grammes entre les entrées et les exemples pour choisir les exemples. |
