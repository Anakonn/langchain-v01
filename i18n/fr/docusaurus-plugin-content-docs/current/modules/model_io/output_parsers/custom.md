---
translated: true
---

# Analyseurs de sortie personnalisés

Dans certaines situations, vous souhaiterez peut-être mettre en œuvre un analyseur personnalisé pour structurer la sortie du modèle dans un format personnalisé.

Il existe deux façons de mettre en œuvre un analyseur personnalisé :

1. En utilisant `RunnableLambda` ou `RunnableGenerator` dans LCEL - nous vous recommandons fortement cette option pour la plupart des cas d'utilisation
2. En héritant de l'une des classes de base pour l'analyse - c'est la façon la plus difficile de procéder

La différence entre les deux approches est principalement superficielle et se situe au niveau des rappels déclenchés (par exemple, `on_chain_start` vs `on_parser_start`) et de la façon dont une lambda exécutable vs un analyseur pourrait être visualisé dans une plateforme de traçage comme LangSmith.

## Lambdas et générateurs exécutables

La méthode recommandée pour l'analyse est d'utiliser des **lambdas exécutables** et des **générateurs exécutables** !

Ici, nous allons créer une analyse simple qui inverse la casse de la sortie du modèle.

Par exemple, si le modèle produit : "Meow", l'analyseur produira "mEOW".

```python
from typing import Iterable

from langchain_anthropic.chat_models import ChatAnthropic
from langchain_core.messages import AIMessage, AIMessageChunk

model = ChatAnthropic(model_name="claude-2.1")


def parse(ai_message: AIMessage) -> str:
    """Parse the AI message."""
    return ai_message.content.swapcase()


chain = model | parse
chain.invoke("hello")
```

```output
'hELLO!'
```

:::tip

LCEL met automatiquement à niveau la fonction `parse` en `RunnableLambda(parse)` lors de la composition à l'aide de la syntaxe `|`.

Si vous n'aimez pas cela, vous pouvez importer manuellement `RunnableLambda` et exécuter `parse = RunnableLambda(parse)`.
:::

Le streaming fonctionne-t-il ?

```python
for chunk in chain.stream("tell me about yourself in one sentence"):
    print(chunk, end="|", flush=True)
```

```output
i'M cLAUDE, AN ai ASSISTANT CREATED BY aNTHROPIC TO BE HELPFUL, HARMLESS, AND HONEST.|
```

Non, cela ne fonctionne pas car l'analyseur agrège l'entrée avant d'analyser la sortie.

Si nous voulons mettre en œuvre un analyseur en flux continu, nous pouvons faire en sorte que l'analyseur accepte un itérable sur l'entrée et renvoie les résultats au fur et à mesure de leur disponibilité.

```python
from langchain_core.runnables import RunnableGenerator


def streaming_parse(chunks: Iterable[AIMessageChunk]) -> Iterable[str]:
    for chunk in chunks:
        yield chunk.content.swapcase()


streaming_parse = RunnableGenerator(streaming_parse)
```

:::important

Veuillez envelopper l'analyseur en flux continu dans `RunnableGenerator` car nous pouvons arrêter la mise à niveau automatique avec la syntaxe `|`.
:::

```python
chain = model | streaming_parse
chain.invoke("hello")
```

```output
'hELLO!'
```

Vérifions que le streaming fonctionne !

```python
for chunk in chain.stream("tell me about yourself in one sentence"):
    print(chunk, end="|", flush=True)
```

```output
i|'M| cLAUDE|,| AN| ai| ASSISTANT| CREATED| BY| aN|THROP|IC| TO| BE| HELPFUL|,| HARMLESS|,| AND| HONEST|.|
```

## Héritage des classes de base d'analyse

Une autre approche pour mettre en œuvre un analyseur consiste à hériter de `BaseOutputParser`, `BaseGenerationOutputParser` ou d'une autre des analyseurs de base selon vos besoins.

En général, nous **ne recommandons pas** cette approche pour la plupart des cas d'utilisation, car elle se traduit par plus de code à écrire sans avantages significatifs.

Le type d'analyseur de sortie le plus simple étend la classe `BaseOutputParser` et doit mettre en œuvre les méthodes suivantes :

* `parse` : prend la sortie sous forme de chaîne de caractères du modèle et l'analyse
* (facultatif) `_type` : identifie le nom de l'analyseur.

Lorsque la sortie du modèle de discussion ou du LLM est mal formée, elle peut lever une `OutputParserException` pour indiquer que l'analyse échoue en raison d'une entrée incorrecte. L'utilisation de cette exception permet au code qui utilise l'analyseur de gérer les exceptions de manière cohérente.

:::tip Les analyseurs sont des exécutables ! 🏃

Comme `BaseOutputParser` implémente l'interface `Runnable`, tout analyseur personnalisé que vous créerez de cette manière deviendra un exécutable LangChain valide et bénéficiera du support asynchrone automatique, de l'interface par lots, du support de journalisation, etc.
:::

### Analyseur simple

Voici un analyseur simple qui peut analyser une représentation **chaîne de caractères** d'un booléen (par exemple, `OUI` ou `NON`) et le convertir en type `boolean` correspondant.

```python
from langchain_core.exceptions import OutputParserException
from langchain_core.output_parsers import BaseOutputParser


# The [bool] desribes a parameterization of a generic.
# It's basically indicating what the return type of parse is
# in this case the return type is either True or False
class BooleanOutputParser(BaseOutputParser[bool]):
    """Custom boolean parser."""

    true_val: str = "YES"
    false_val: str = "NO"

    def parse(self, text: str) -> bool:
        cleaned_text = text.strip().upper()
        if cleaned_text not in (self.true_val.upper(), self.false_val.upper()):
            raise OutputParserException(
                f"BooleanOutputParser expected output value to either be "
                f"{self.true_val} or {self.false_val} (case-insensitive). "
                f"Received {cleaned_text}."
            )
        return cleaned_text == self.true_val.upper()

    @property
    def _type(self) -> str:
        return "boolean_output_parser"
```

```python
parser = BooleanOutputParser()
parser.invoke("YES")
```

```output
True
```

```python
try:
    parser.invoke("MEOW")
except Exception as e:
    print(f"Triggered an exception of type: {type(e)}")
```

```output
Triggered an exception of type: <class 'langchain_core.exceptions.OutputParserException'>
```

Testons le changement de paramétrage

```python
parser = BooleanOutputParser(true_val="OKAY")
parser.invoke("OKAY")
```

```output
True
```

Vérifions que les autres méthodes LCEL sont présentes

```python
parser.batch(["OKAY", "NO"])
```

```output
[True, False]
```

```python
await parser.abatch(["OKAY", "NO"])
```

```output
[True, False]
```

```python
from langchain_anthropic.chat_models import ChatAnthropic

anthropic = ChatAnthropic(model_name="claude-2.1")
anthropic.invoke("say OKAY or NO")
```

```output
AIMessage(content='OKAY')
```

Testons que notre analyseur fonctionne !

```python
chain = anthropic | parser
chain.invoke("say OKAY or NO")
```

```output
True
```

:::note
L'analyseur fonctionnera avec la sortie d'un LLM (une chaîne de caractères) ou la sortie d'un modèle de discussion (un `AIMessage`) !
:::

### Analyse des sorties brutes des modèles

Parfois, il y a des métadonnées supplémentaires sur la sortie du modèle qui sont importantes en plus du texte brut. Un exemple de cela est l'appel d'outils, où les arguments destinés à être passés aux fonctions appelées sont renvoyés dans une propriété séparée. Si vous avez besoin de ce contrôle plus fin, vous pouvez plutôt sous-classer la classe `BaseGenerationOutputParser`.

Cette classe nécessite une seule méthode `parse_result`. Cette méthode prend la sortie brute du modèle (par exemple, une liste de `Generation` ou de `ChatGeneration`) et renvoie la sortie analysée.

Le fait de prendre en charge à la fois `Generation` et `ChatGeneration` permet à l'analyseur de fonctionner avec les LLM réguliers ainsi qu'avec les modèles de discussion.

```python
from typing import List

from langchain_core.exceptions import OutputParserException
from langchain_core.messages import AIMessage
from langchain_core.output_parsers import BaseGenerationOutputParser
from langchain_core.outputs import ChatGeneration, Generation


class StrInvertCase(BaseGenerationOutputParser[str]):
    """An example parser that inverts the case of the characters in the message.

    This is an example parse shown just for demonstration purposes and to keep
    the example as simple as possible.
    """

    def parse_result(self, result: List[Generation], *, partial: bool = False) -> str:
        """Parse a list of model Generations into a specific format.

        Args:
            result: A list of Generations to be parsed. The Generations are assumed
                to be different candidate outputs for a single model input.
                Many parsers assume that only a single generation is passed it in.
                We will assert for that
            partial: Whether to allow partial results. This is used for parsers
                     that support streaming
        """
        if len(result) != 1:
            raise NotImplementedError(
                "This output parser can only be used with a single generation."
            )
        generation = result[0]
        if not isinstance(generation, ChatGeneration):
            # Say that this one only works with chat generations
            raise OutputParserException(
                "This output parser can only be used with a chat generation."
            )
        return generation.message.content.swapcase()


chain = anthropic | StrInvertCase()
```

Testons le nouvel analyseur ! Il devrait inverser la sortie du modèle.

```python
chain.invoke("Tell me a short sentence about yourself")
```

```output
'hELLO! mY NAME IS cLAUDE.'
```
