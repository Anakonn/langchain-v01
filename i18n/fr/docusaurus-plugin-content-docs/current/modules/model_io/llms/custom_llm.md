---
translated: true
---

# Personnalisation du LLM

Ce cahier de notes explique comment créer un wrapper personnalisé de LLM, au cas où vous souhaiteriez utiliser votre propre LLM ou un wrapper différent de ceux pris en charge dans LangChain.

Le fait d'envelopper votre LLM avec l'interface standard `LLM` vous permet d'utiliser votre LLM dans les programmes LangChain existants avec un minimum de modifications de code !

En bonus, votre LLM deviendra automatiquement un `Runnable` LangChain et bénéficiera de certaines optimisations "out of the box", de la prise en charge asynchrone, de l'API `astream_events`, etc.

## Implémentation

Il y a seulement deux choses requises qu'un LLM personnalisé doit implémenter :

| Méthode      | Description                                                               |
|--------------|---------------------------------------------------------------------------|
| `_call`      | Prend une chaîne de caractères et éventuellement des mots d'arrêt, et renvoie une chaîne de caractères. Utilisé par `invoke`. |
| `_llm_type`  | Une propriété qui renvoie une chaîne de caractères, utilisée uniquement à des fins de journalisation.

Implémentations optionnelles :

| Méthode           | Description                                                                                               |
|-------------------|-----------------------------------------------------------------------------------------------------------|
| `_identifying_params` | Utilisé pour aider à identifier le modèle et à imprimer le LLM ; doit renvoyer un dictionnaire. Il s'agit d'une **@property**.                 |
| `_acall`          | Fournit une implémentation native asynchrone de `_call`, utilisée par `ainvoke`.                                    |
| `_stream`         | Méthode pour diffuser la sortie token par token.                                                               |
| `_astream`        | Fournit une implémentation native asynchrone de `_stream` ; dans les versions plus récentes de LangChain, par défaut à `_stream`. |

Implémentons un simple LLM personnalisé qui renvoie simplement les n premiers caractères de l'entrée.

```python
from typing import Any, Dict, Iterator, List, Mapping, Optional

from langchain_core.callbacks.manager import CallbackManagerForLLMRun
from langchain_core.language_models.llms import LLM
from langchain_core.outputs import GenerationChunk


class CustomLLM(LLM):
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

    n: int
    """The number of characters from the last message of the prompt to be echoed."""

    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> str:
        """Run the LLM on the given input.

        Override this method to implement the LLM logic.

        Args:
            prompt: The prompt to generate from.
            stop: Stop words to use when generating. Model output is cut off at the
                first occurrence of any of the stop substrings.
                If stop tokens are not supported consider raising NotImplementedError.
            run_manager: Callback manager for the run.
            **kwargs: Arbitrary additional keyword arguments. These are usually passed
                to the model provider API call.

        Returns:
            The model output as a string. Actual completions SHOULD NOT include the prompt.
        """
        if stop is not None:
            raise ValueError("stop kwargs are not permitted.")
        return prompt[: self.n]

    def _stream(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> Iterator[GenerationChunk]:
        """Stream the LLM on the given prompt.

        This method should be overridden by subclasses that support streaming.

        If not implemented, the default behavior of calls to stream will be to
        fallback to the non-streaming version of the model and return
        the output as a single chunk.

        Args:
            prompt: The prompt to generate from.
            stop: Stop words to use when generating. Model output is cut off at the
                first occurrence of any of these substrings.
            run_manager: Callback manager for the run.
            **kwargs: Arbitrary additional keyword arguments. These are usually passed
                to the model provider API call.

        Returns:
            An iterator of GenerationChunks.
        """
        for char in prompt[: self.n]:
            chunk = GenerationChunk(text=char)
            if run_manager:
                run_manager.on_llm_new_token(chunk.text, chunk=chunk)

            yield chunk

    @property
    def _identifying_params(self) -> Dict[str, Any]:
        """Return a dictionary of identifying parameters."""
        return {
            # The model name allows users to specify custom token counting
            # rules in LLM monitoring applications (e.g., in LangSmith users
            # can provide per token pricing for their model and monitor
            # costs for the given LLM.)
            "model_name": "CustomChatModel",
        }

    @property
    def _llm_type(self) -> str:
        """Get the type of language model used by this chat model. Used for logging purposes only."""
        return "custom"
```

### Testons-le 🧪

Ce LLM implémentera l'interface standard `Runnable` de LangChain, prise en charge par de nombreuses abstractions LangChain !

```python
llm = CustomLLM(n=5)
print(llm)
```

```output
[1mCustomLLM[0m
Params: {'model_name': 'CustomChatModel'}
```

```python
llm.invoke("This is a foobar thing")
```

```output
'This '
```

```python
await llm.ainvoke("world")
```

```output
'world'
```

```python
llm.batch(["woof woof woof", "meow meow meow"])
```

```output
['woof ', 'meow ']
```

```python
await llm.abatch(["woof woof woof", "meow meow meow"])
```

```output
['woof ', 'meow ']
```

```python
async for token in llm.astream("hello"):
    print(token, end="|", flush=True)
```

```output
h|e|l|l|o|
```

Vérifions que cela s'intègre bien avec les autres API `LangChain`.

```python
from langchain_core.prompts import ChatPromptTemplate
```

```python
prompt = ChatPromptTemplate.from_messages(
    [("system", "you are a bot"), ("human", "{input}")]
)
```

```python
llm = CustomLLM(n=7)
chain = prompt | llm
```

```python
idx = 0
async for event in chain.astream_events({"input": "hello there!"}, version="v1"):
    print(event)
    idx += 1
    if idx > 7:
        # Truncate
        break
```

```output
{'event': 'on_chain_start', 'run_id': '05f24b4f-7ea3-4fb6-8417-3aa21633462f', 'name': 'RunnableSequence', 'tags': [], 'metadata': {}, 'data': {'input': {'input': 'hello there!'}}}
{'event': 'on_prompt_start', 'name': 'ChatPromptTemplate', 'run_id': '7e996251-a926-4344-809e-c425a9846d21', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'input': {'input': 'hello there!'}}}
{'event': 'on_prompt_end', 'name': 'ChatPromptTemplate', 'run_id': '7e996251-a926-4344-809e-c425a9846d21', 'tags': ['seq:step:1'], 'metadata': {}, 'data': {'input': {'input': 'hello there!'}, 'output': ChatPromptValue(messages=[SystemMessage(content='you are a bot'), HumanMessage(content='hello there!')])}}
{'event': 'on_llm_start', 'name': 'CustomLLM', 'run_id': 'a8766beb-10f4-41de-8750-3ea7cf0ca7e2', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'input': {'prompts': ['System: you are a bot\nHuman: hello there!']}}}
{'event': 'on_llm_stream', 'name': 'CustomLLM', 'run_id': 'a8766beb-10f4-41de-8750-3ea7cf0ca7e2', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': 'S'}}
{'event': 'on_chain_stream', 'run_id': '05f24b4f-7ea3-4fb6-8417-3aa21633462f', 'tags': [], 'metadata': {}, 'name': 'RunnableSequence', 'data': {'chunk': 'S'}}
{'event': 'on_llm_stream', 'name': 'CustomLLM', 'run_id': 'a8766beb-10f4-41de-8750-3ea7cf0ca7e2', 'tags': ['seq:step:2'], 'metadata': {}, 'data': {'chunk': 'y'}}
{'event': 'on_chain_stream', 'run_id': '05f24b4f-7ea3-4fb6-8417-3aa21633462f', 'tags': [], 'metadata': {}, 'name': 'RunnableSequence', 'data': {'chunk': 'y'}}
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

* [ ] Assurez-vous d'invoquer le rappel `on_llm_new_token`
* [ ] `on_llm_new_token` est invoqué AVANT de rendre le fragment

Comportement des jetons d'arrêt :

* [ ] Le jeton d'arrêt doit être respecté
* [ ] Le jeton d'arrêt doit être INCLUS dans la réponse

Clés d'API secrètes :

* [ ] Si votre modèle se connecte à une API, il acceptera probablement des clés d'API dans le cadre de son initialisation. Utilisez le type `SecretStr` de Pydantic pour les secrets, afin qu'ils ne soient pas imprimés accidentellement lorsque les gens impriment le modèle.
