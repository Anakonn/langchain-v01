---
translated: true
---

# Modèle de chat personnalisé

Dans ce guide, nous apprendrons comment créer un modèle de chat personnalisé en utilisant les abstractions LangChain.

Le fait d'envelopper votre LLM avec l'interface `BaseChatModel` standard vous permet d'utiliser votre LLM dans les programmes LangChain existants avec un minimum de modifications de code !

En bonus, votre LLM deviendra automatiquement un `Runnable` LangChain et bénéficiera de certaines optimisations "out of the box" (par exemple, le traitement par lots via un pool de threads), la prise en charge asynchrone, l'API `astream_events`, etc.

## Entrées et sorties

Tout d'abord, nous devons parler des **messages** qui sont les entrées et les sorties des modèles de chat.

### Messages

Les modèles de chat prennent des messages en entrée et renvoient un message en sortie.

LangChain a quelques types de messages intégrés :

| Type de message       | Description                                                                                     |
|-----------------------|-------------------------------------------------------------------------------------------------|
| `SystemMessage`       | Utilisé pour amorcer le comportement de l'IA, généralement passé en premier dans une séquence de messages d'entrée.   |
| `HumanMessage`        | Représente un message d'une personne interagissant avec le modèle de chat.                             |
| `AIMessage`           | Représente un message du modèle de chat. Il peut s'agir soit d'un texte, soit d'une demande d'invocation d'un outil.|
| `FunctionMessage` / `ToolMessage` | Message pour transmettre les résultats de l'invocation d'un outil au modèle.               |
| `AIMessageChunk` / `HumanMessageChunk` / ... | Variante de chaque type de message sous forme de morceaux. |

:::note
`ToolMessage` et `FunctionMessage` suivent de près les rôles `function` et `tool` d'OpenAI.

C'est un domaine en pleine évolution et, à mesure que plus de modèles ajouteront des capacités d'appel de fonction, il est prévu qu'il y aura des ajouts à ce schéma.
:::

```python
from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    FunctionMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)
```

### Variante de diffusion en continu

Tous les messages de chat ont une variante de diffusion en continu qui contient `Chunk` dans le nom.

```python
from langchain_core.messages import (
    AIMessageChunk,
    FunctionMessageChunk,
    HumanMessageChunk,
    SystemMessageChunk,
    ToolMessageChunk,
)
```

Ces morceaux sont utilisés lors de la diffusion en continu de la sortie des modèles de chat, et ils définissent tous une propriété additive !

```python
AIMessageChunk(content="Hello") + AIMessageChunk(content=" World!")
```

```output
AIMessageChunk(content='Hello World!')
```

## Modèle de chat de base

Implémentons un modèle de chat qui renvoie les `n` premiers caractères du dernier message de l'invite !

Pour ce faire, nous hériterons de `BaseChatModel` et nous devrons implémenter les éléments suivants :

| Méthode/Propriété                 | Description                                                       | Requis/Facultatif  |
|------------------------------------|-------------------------------------------------------------------|--------------------|
| `_generate`                        | Utilisé pour générer un résultat de chat à partir d'une invite   | Requis             |
| `_llm_type` (propriété)            | Utilisé pour identifier de manière unique le type du modèle. Utilisé pour la journalisation.| Requis |
| `_identifying_params` (propriété)  | Représente la paramétrisation du modèle à des fins de traçage.   | Facultatif         |
| `_stream`                          | Utilisé pour implémenter la diffusion en continu.               | Facultatif         |
| `_agenerate`                       | Utilisé pour implémenter une méthode asynchrone native.         | Facultatif         |
| `_astream`                         | Utilisé pour implémenter la version asynchrone de `_stream`.    | Facultatif         |

:::tip
L'implémentation de `_astream` utilise `run_in_executor` pour lancer le `_stream` synchrone dans un thread séparé si `_stream` est implémenté, sinon il se rabat sur l'utilisation de `_agenerate`.

Vous pouvez utiliser ce stratagème si vous voulez réutiliser l'implémentation de `_stream`, mais si vous êtes capable d'implémenter un code qui est natif asynchrone, c'est une meilleure solution car ce code s'exécutera avec moins de surcharge.
:::

### Implémentation

```python
from typing import Any, AsyncIterator, Dict, Iterator, List, Optional

from langchain_core.callbacks import (
    AsyncCallbackManagerForLLMRun,
    CallbackManagerForLLMRun,
)
from langchain_core.language_models import BaseChatModel, SimpleChatModel
from langchain_core.messages import AIMessageChunk, BaseMessage, HumanMessage
from langchain_core.outputs import ChatGeneration, ChatGenerationChunk, ChatResult
from langchain_core.runnables import run_in_executor


class CustomChatModelAdvanced(BaseChatModel):
    """A custom chat model that echoes the first `n` characters of the input.

    When contributing an implementation to LangChain, carefully document
    the model including the initialization parameters, include
    an example of how to initialize the model and include any relevant
    links to the underlying models documentation or API.

    Example:

        .. code-block:: python

            model = CustomChatModel(n=2)
            result = model.invoke([HumanMessage(content="hello")])
            result = model.batch([[HumanMessage(content="hello")],
                                 [HumanMessage(content="world")]])
    """

    model_name: str
    """The name of the model"""
    n: int
    """The number of characters from the last message of the prompt to be echoed."""

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> ChatResult:
        """Override the _generate method to implement the chat model logic.

        This can be a call to an API, a call to a local model, or any other
        implementation that generates a response to the input prompt.

        Args:
            messages: the prompt composed of a list of messages.
            stop: a list of strings on which the model should stop generating.
                  If generation stops due to a stop token, the stop token itself
                  SHOULD BE INCLUDED as part of the output. This is not enforced
                  across models right now, but it's a good practice to follow since
                  it makes it much easier to parse the output of the model
                  downstream and understand why generation stopped.
            run_manager: A run manager with callbacks for the LLM.
        """
        # Replace this with actual logic to generate a response from a list
        # of messages.
        last_message = messages[-1]
        tokens = last_message.content[: self.n]
        message = AIMessage(
            content=tokens,
            additional_kwargs={},  # Used to add additional payload (e.g., function calling request)
            response_metadata={  # Use for response metadata
                "time_in_seconds": 3,
            },
        )
        ##

        generation = ChatGeneration(message=message)
        return ChatResult(generations=[generation])

    def _stream(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> Iterator[ChatGenerationChunk]:
        """Stream the output of the model.

        This method should be implemented if the model can generate output
        in a streaming fashion. If the model does not support streaming,
        do not implement it. In that case streaming requests will be automatically
        handled by the _generate method.

        Args:
            messages: the prompt composed of a list of messages.
            stop: a list of strings on which the model should stop generating.
                  If generation stops due to a stop token, the stop token itself
                  SHOULD BE INCLUDED as part of the output. This is not enforced
                  across models right now, but it's a good practice to follow since
                  it makes it much easier to parse the output of the model
                  downstream and understand why generation stopped.
            run_manager: A run manager with callbacks for the LLM.
        """
        last_message = messages[-1]
        tokens = last_message.content[: self.n]

        for token in tokens:
            chunk = ChatGenerationChunk(message=AIMessageChunk(content=token))

            if run_manager:
                # This is optional in newer versions of LangChain
                # The on_llm_new_token will be called automatically
                run_manager.on_llm_new_token(token, chunk=chunk)

            yield chunk

        # Let's add some other information (e.g., response metadata)
        chunk = ChatGenerationChunk(
            message=AIMessageChunk(content="", response_metadata={"time_in_sec": 3})
        )
        if run_manager:
            # This is optional in newer versions of LangChain
            # The on_llm_new_token will be called automatically
            run_manager.on_llm_new_token(token, chunk=chunk)
        yield chunk

    @property
    def _llm_type(self) -> str:
        """Get the type of language model used by this chat model."""
        return "echoing-chat-model-advanced"

    @property
    def _identifying_params(self) -> Dict[str, Any]:
        """Return a dictionary of identifying parameters.

        This information is used by the LangChain callback system, which
        is used for tracing purposes make it possible to monitor LLMs.
        """
        return {
            # The model name allows users to specify custom token counting
            # rules in LLM monitoring applications (e.g., in LangSmith users
            # can provide per token pricing for their model and monitor
            # costs for the given LLM.)
            "model_name": self.model_name,
        }
```

### Testons-le 🧪

Le modèle de chat implémentera l'interface `Runnable` standard de LangChain, que de nombreuses abstractions LangChain prennent en charge !

```python
model = CustomChatModelAdvanced(n=3, model_name="my_custom_model")
```

```python
model.invoke(
    [
        HumanMessage(content="hello!"),
        AIMessage(content="Hi there human!"),
        HumanMessage(content="Meow!"),
    ]
)
```

```output
AIMessage(content='Meo', response_metadata={'time_in_seconds': 3}, id='run-ddb42bd6-4fdd-4bd2-8be5-e11b67d3ac29-0')
```

```python
model.invoke("hello")
```

```output
AIMessage(content='hel', response_metadata={'time_in_seconds': 3}, id='run-4d3cc912-44aa-454b-977b-ca02be06c12e-0')
```

```python
model.batch(["hello", "goodbye"])
```

```output
[AIMessage(content='hel', response_metadata={'time_in_seconds': 3}, id='run-9620e228-1912-4582-8aa1-176813afec49-0'),
 AIMessage(content='goo', response_metadata={'time_in_seconds': 3}, id='run-1ce8cdf8-6f75-448e-82f7-1bb4a121df93-0')]
```

```python
for chunk in model.stream("cat"):
    print(chunk.content, end="|")
```

```output
c|a|t||
```

Veuillez consulter l'implémentation de `_astream` dans le modèle ! Si vous ne l'implémentez pas, alors aucune sortie ne sera diffusée.!

```python
async for chunk in model.astream("cat"):
    print(chunk.content, end="|")
```

```output
c|a|t||
```

Essayons d'utiliser l'API `astream_events` qui nous aidera également à vérifier que tous les rappels ont été implémentés !

```python
async for event in model.astream_events("cat", version="v1"):
    print(event)
```

```output
{'event': 'on_chat_model_start', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'name': 'CustomChatModelAdvanced', 'tags': [], 'metadata': {}, 'data': {'input': 'cat'}}
{'event': 'on_chat_model_stream', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'name': 'CustomChatModelAdvanced', 'data': {'chunk': AIMessageChunk(content='c', id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}
{'event': 'on_chat_model_stream', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'name': 'CustomChatModelAdvanced', 'data': {'chunk': AIMessageChunk(content='a', id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}
{'event': 'on_chat_model_stream', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'name': 'CustomChatModelAdvanced', 'data': {'chunk': AIMessageChunk(content='t', id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}
{'event': 'on_chat_model_stream', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'name': 'CustomChatModelAdvanced', 'data': {'chunk': AIMessageChunk(content='', response_metadata={'time_in_sec': 3}, id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}
{'event': 'on_chat_model_end', 'name': 'CustomChatModelAdvanced', 'run_id': '125a2a16-b9cd-40de-aa08-8aa9180b07d0', 'tags': [], 'metadata': {}, 'data': {'output': AIMessageChunk(content='cat', response_metadata={'time_in_sec': 3}, id='run-125a2a16-b9cd-40de-aa08-8aa9180b07d0')}}

/home/eugene/src/langchain/libs/core/langchain_core/_api/beta_decorator.py:87: LangChainBetaWarning: This API is in beta and may change in the future.
  warn_beta(
```

## Contribution

Nous apprécions toutes les contributions d'intégration de modèles de chat.

Voici une liste de contrôle pour vous assurer que votre contribution soit ajoutée à LangChain :

Documentation :

* Le modèle contient des doc-strings pour tous les arguments d'initialisation, car ils seront exposés dans l'[APIReference](https://api.python.langchain.com/en/stable/langchain_api_reference.html).
* Le doc-string de la classe pour le modèle contient un lien vers l'API du modèle si le modèle est alimenté par un service.

Tests :

* [ ] Ajoutez des tests unitaires ou d'intégration aux méthodes surchargées. Vérifiez que `invoke`, `ainvoke`, `batch`, `stream` fonctionnent si vous avez surchargé le code correspondant.

Diffusion en continu (si vous l'implémentez) :

* [ ] Implémentez la méthode `_stream` pour obtenir un fonctionnement en continu

Comportement du jeton d'arrêt :

* [ ] Le jeton d'arrêt doit être respecté
* [ ] Le jeton d'arrêt doit être INCLUS dans la réponse

Clés d'API secrètes :

* [ ] Si votre modèle se connecte à une API, il acceptera probablement des clés d'API dans le cadre de son initialisation. Utilisez le type `SecretStr` de Pydantic pour les secrets, afin qu'ils ne soient pas imprimés accidentellement lorsque les gens impriment le modèle.

Paramètres d'identification :

* [ ] Incluez un `model_name` dans les paramètres d'identification

Optimisations :

Envisagez de fournir une prise en charge asynchrone native pour réduire la surcharge du modèle !

* [ ] Fourni un `_agenerate` natif asynchrone (utilisé par `ainvoke`)
* [ ] Fourni un `_astream` natif asynchrone (utilisé par `astream`)
