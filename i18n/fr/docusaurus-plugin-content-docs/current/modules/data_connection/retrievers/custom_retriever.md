---
title: Récupérateur personnalisé
translated: true
---

# Récupérateur personnalisé

## Aperçu

De nombreuses applications d'apprentissage automatique impliquent la récupération d'informations à partir de sources de données externes à l'aide d'un `Récupérateur`.

Un récupérateur est responsable de la récupération d'une liste de `Documents` pertinents à une `requête` d'utilisateur donnée.

Les documents récupérés sont souvent formatés en invites qui sont transmises à un modèle de langage, permettant au modèle d'utiliser les informations contenues dans les documents pour générer une réponse appropriée (par exemple, répondre à une question d'utilisateur en fonction d'une base de connaissances).

## Interface

Pour créer votre propre récupérateur, vous devez étendre la classe `BaseRetriever` et implémenter les méthodes suivantes :

| Méthode                        | Description                                      | Requis/Optionnel |
|--------------------------------|--------------------------------------------------|-------------------|
| `_get_relevant_documents`      | Obtenir les documents pertinents à une requête.  | Requis           |
| `_aget_relevant_documents`     | Implémenter pour fournir un support natif asynchrone. | Optionnel |

La logique à l'intérieur de `_get_relevant_documents` peut impliquer des appels arbitraires à une base de données ou au web à l'aide de requêtes.

:::tip
En héritant de `BaseRetriever`, votre récupérateur devient automatiquement un [Runnable](/docs/expression_language/interface) LangChain et bénéficiera des fonctionnalités standard de `Runnable` !
:::

:::info
Vous pouvez utiliser un `RunnableLambda` ou un `RunnableGenerator` pour implémenter un récupérateur.

Le principal avantage d'implémenter un récupérateur en tant que `BaseRetriever` plutôt qu'un `RunnableLambda` (une [fonction exécutable](/docs/expression_language/primitives/functions) personnalisée) est qu'un `BaseRetriever` est une entité LangChain bien connue, de sorte que certains outils de surveillance peuvent mettre en œuvre un comportement spécialisé pour les récupérateurs. Une autre différence est qu'un `BaseRetriever` se comportera légèrement différemment d'un `RunnableLambda` dans certaines API ; par exemple, l'événement `start` dans l'API `astream_events` sera `on_retriever_start` au lieu de `on_chain_start`.
:::

## Exemple

Implémentons un récupérateur jouet qui renvoie tous les documents dont le texte contient le texte de la requête de l'utilisateur.

```python
from typing import List

from langchain_core.callbacks import CallbackManagerForRetrieverRun
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever


class ToyRetriever(BaseRetriever):
    """A toy retriever that contains the top k documents that contain the user query.

    This retriever only implements the sync method _get_relevant_documents.

    If the retriever were to involve file access or network access, it could benefit
    from a native async implementation of `_aget_relevant_documents`.

    As usual, with Runnables, there's a default async implementation that's provided
    that delegates to the sync implementation running on another thread.
    """

    documents: List[Document]
    """List of documents to retrieve from."""
    k: int
    """Number of top results to return"""

    def _get_relevant_documents(
        self, query: str, *, run_manager: CallbackManagerForRetrieverRun
    ) -> List[Document]:
        """Sync implementations for retriever."""
        matching_documents = []
        for document in self.documents:
            if len(matching_documents) > self.k:
                return matching_documents

            if query.lower() in document.page_content.lower():
                matching_documents.append(document)
        return matching_documents

    # Optional: Provide a more efficient native implementation by overriding
    # _aget_relevant_documents
    # async def _aget_relevant_documents(
    #     self, query: str, *, run_manager: AsyncCallbackManagerForRetrieverRun
    # ) -> List[Document]:
    #     """Asynchronously get documents relevant to a query.

    #     Args:
    #         query: String to find relevant documents for
    #         run_manager: The callbacks handler to use

    #     Returns:
    #         List of relevant documents
    #     """
```

## Testons-le 🧪

```python
documents = [
    Document(
        page_content="Dogs are great companions, known for their loyalty and friendliness.",
        metadata={"type": "dog", "trait": "loyalty"},
    ),
    Document(
        page_content="Cats are independent pets that often enjoy their own space.",
        metadata={"type": "cat", "trait": "independence"},
    ),
    Document(
        page_content="Goldfish are popular pets for beginners, requiring relatively simple care.",
        metadata={"type": "fish", "trait": "low maintenance"},
    ),
    Document(
        page_content="Parrots are intelligent birds capable of mimicking human speech.",
        metadata={"type": "bird", "trait": "intelligence"},
    ),
    Document(
        page_content="Rabbits are social animals that need plenty of space to hop around.",
        metadata={"type": "rabbit", "trait": "social"},
    ),
]
retriever = ToyRetriever(documents=documents, k=3)
```

```python
retriever.invoke("that")
```

```output
[Document(page_content='Cats are independent pets that often enjoy their own space.', metadata={'type': 'cat', 'trait': 'independence'}),
 Document(page_content='Rabbits are social animals that need plenty of space to hop around.', metadata={'type': 'rabbit', 'trait': 'social'})]
```

C'est un **exécutable**, donc il bénéficiera de l'interface standard Runnable ! 🤩

```python
await retriever.ainvoke("that")
```

```output
[Document(page_content='Cats are independent pets that often enjoy their own space.', metadata={'type': 'cat', 'trait': 'independence'}),
 Document(page_content='Rabbits are social animals that need plenty of space to hop around.', metadata={'type': 'rabbit', 'trait': 'social'})]
```

```python
retriever.batch(["dog", "cat"])
```

```output
[[Document(page_content='Dogs are great companions, known for their loyalty and friendliness.', metadata={'type': 'dog', 'trait': 'loyalty'})],
 [Document(page_content='Cats are independent pets that often enjoy their own space.', metadata={'type': 'cat', 'trait': 'independence'})]]
```

```python
async for event in retriever.astream_events("bar", version="v1"):
    print(event)
```

```output
{'event': 'on_retriever_start', 'run_id': 'f96f268d-8383-4921-b175-ca583924d9ff', 'name': 'ToyRetriever', 'tags': [], 'metadata': {}, 'data': {'input': 'bar'}}
{'event': 'on_retriever_stream', 'run_id': 'f96f268d-8383-4921-b175-ca583924d9ff', 'tags': [], 'metadata': {}, 'name': 'ToyRetriever', 'data': {'chunk': []}}
{'event': 'on_retriever_end', 'name': 'ToyRetriever', 'run_id': 'f96f268d-8383-4921-b175-ca583924d9ff', 'tags': [], 'metadata': {}, 'data': {'output': []}}
```

## Contribution

Nous apprécions les contributions de récupérateurs intéressants !

Voici une liste de contrôle pour vous assurer que votre contribution soit ajoutée à LangChain :

Documentation :

* Le récupérateur contient des chaînes de documentation pour tous les arguments d'initialisation, car ils seront mis en évidence dans la [Référence de l'API](https://api.python.langchain.com/en/stable/langchain_api_reference.html).
* La chaîne de documentation de la classe du modèle contient un lien vers les API pertinentes utilisées pour le récupérateur (par exemple, si le récupérateur récupère à partir de Wikipédia, il sera bon de faire un lien vers l'API Wikipédia !).

Tests :

* [ ] Ajoutez des tests unitaires ou d'intégration pour vérifier que `invoke` et `ainvoke` fonctionnent.

Optimisations :

Si le récupérateur se connecte à des sources de données externes (par exemple, une API ou un fichier), il bénéficiera presque certainement d'une optimisation native asynchrone !

* [ ] Fournissez une implémentation asynchrone native de `_aget_relevant_documents` (utilisée par `ainvoke`)
