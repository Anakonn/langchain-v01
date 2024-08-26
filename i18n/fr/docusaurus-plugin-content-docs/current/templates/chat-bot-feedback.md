---
translated: true
---

# Modèle de rétroaction du chatbot

Ce modèle montre comment évaluer votre chatbot sans rétroaction explicite de l'utilisateur. Il définit un chatbot simple dans [chain.py](https://github.com/langchain-ai/langchain/blob/master/templates/chat-bot-feedback/chat_bot_feedback/chain.py) et un évaluateur personnalisé qui note l'efficacité de la réponse du bot en fonction de la réponse de l'utilisateur suivante. Vous pouvez appliquer cet évaluateur à votre propre chatbot en appelant `with_config` sur le chatbot avant de le servir. Vous pouvez également déployer directement votre application de chat en utilisant ce modèle.

Les [chatbots](https://python.langchain.com/docs/use_cases/chatbots) sont l'une des interfaces les plus courantes pour déployer les LLM. La qualité des chatbots varie, ce qui rend le développement continu important. Mais les utilisateurs sont peu enclins à laisser une rétroaction explicite par le biais de mécanismes comme les boutons "pouce vers le haut" ou "pouce vers le bas". De plus, les analyses traditionnelles comme la "durée de la session" ou la "durée de la conversation" manquent souvent de clarté. Cependant, les conversations à plusieurs tours avec un chatbot peuvent fournir une mine d'informations, que nous pouvons transformer en métriques pour l'affinage, l'évaluation et l'analyse des produits.

En prenant [Chat Langchain](https://chat.langchain.com/) comme étude de cas, seulement environ 0,04% de toutes les requêtes reçoivent une rétroaction explicite. Pourtant, environ 70% des requêtes sont des suivis de questions précédentes. Une part importante de ces requêtes de suivi continue à fournir des informations utiles que nous pouvons utiliser pour déduire la qualité de la réponse AI précédente.

Ce modèle aide à résoudre ce problème de "rareté des commentaires". Voici un exemple d'invocation de ce chatbot :

[](https://smith.langchain.com/public/3378daea-133c-4fe8-b4da-0a3044c5dbe8/r?runtab=1)

Lorsque l'utilisateur répond à cela ([lien](https://smith.langchain.com/public/a7e2df54-4194-455d-9978-cecd8be0df1e/r)), l'évaluateur de réponse est invoqué, ce qui donne le résultat d'évaluation suivant :

[](https://smith.langchain.com/public/534184ee-db8f-4831-a386-3f578145114c/r)

Comme le montre l'exemple, l'évaluateur constate que l'utilisateur est de plus en plus frustré, ce qui indique que la réponse précédente n'était pas efficace.

## Rétroaction LangSmith

[LangSmith](https://smith.langchain.com/) est une plateforme pour construire des applications LLM de niveau production. Au-delà de ses fonctionnalités de débogage et d'évaluation hors ligne, LangSmith vous aide à capturer les commentaires des utilisateurs et du modèle pour affiner votre application LLM. Ce modèle utilise un LLM pour générer des commentaires pour votre application, que vous pouvez utiliser pour améliorer continuellement votre service. Pour plus d'exemples sur la collecte de commentaires à l'aide de LangSmith, consultez la [documentation](https://docs.smith.langchain.com/cookbook/feedback-examples).

## Implémentation de l'évaluateur

Les commentaires des utilisateurs sont déduits par un `RunEvaluator` personnalisé. Cet évaluateur est appelé à l'aide du `EvaluatorCallbackHandler`, qui l'exécute dans un thread séparé pour éviter d'interférer avec le runtime du chatbot. Vous pouvez utiliser cet évaluateur personnalisé sur n'importe quel chatbot compatible en appelant la fonction suivante sur votre objet LangChain :

```python
my_chain.with_config(
    callbacks=[
        EvaluatorCallbackHandler(
            evaluators=[
                ResponseEffectivenessEvaluator(evaluate_response_effectiveness)
            ]
        )
    ],
)
```

L'évaluateur instruit un LLM, spécifiquement `gpt-3.5-turbo`, d'évaluer le message de chat le plus récent de l'IA en fonction de la réponse de suivi de l'utilisateur. Il génère un score et un raisonnement accompagnant qui sont convertis en commentaires dans LangSmith, appliqués à la valeur fournie comme `last_run_id`.

L'invite utilisée dans le LLM [est disponible sur le hub](https://smith.langchain.com/hub/wfh/response-effectiveness). N'hésitez pas à la personnaliser avec des éléments comme des informations supplémentaires sur l'application (comme l'objectif de l'application ou les types de questions auxquelles elle devrait répondre) ou les "symptômes" sur lesquels vous souhaitez que le LLM se concentre. Cet évaluateur utilise également l'API d'appel de fonction d'OpenAI pour assurer une sortie plus cohérente et structurée pour la note.

## Variables d'environnement

Assurez-vous que `OPENAI_API_KEY` est défini pour utiliser les modèles OpenAI. Configurez également LangSmith en définissant votre `LANGSMITH_API_KEY`.

```bash
export OPENAI_API_KEY=sk-...
export LANGSMITH_API_KEY=...
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_PROJECT=my-project # Set to the project you want to save to
```

## Utilisation

Si vous déployez via `LangServe`, nous vous recommandons de configurer le serveur pour renvoyer également les événements de rappel. Cela garantira que les traces du backend sont incluses dans les traces que vous générez à l'aide de `RemoteRunnable`.

```python
from chat_bot_feedback.chain import chain

add_routes(app, chain, path="/chat-bot-feedback", include_callback_events=True)
```

Avec le serveur en cours d'exécution, vous pouvez utiliser l'extrait de code suivant pour diffuser les réponses du chatbot pour une conversation de 2 tours.

```python
<!--IMPORTS:[{"imported": "tracing_v2_enabled", "source": "langchain.callbacks.manager", "docs": "https://api.python.langchain.com/en/latest/tracers/langchain_core.tracers.context.tracing_v2_enabled.html", "title": "Chat Bot Feedback Template"}, {"imported": "BaseMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.base.BaseMessage.html", "title": "Chat Bot Feedback Template"}, {"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessage.html", "title": "Chat Bot Feedback Template"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "Chat Bot Feedback Template"}]-->
from functools import partial
from typing import Dict, Optional, Callable, List
from langserve import RemoteRunnable
from langchain.callbacks.manager import tracing_v2_enabled
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage

# Update with the URL provided by your LangServe server
chain = RemoteRunnable("http://127.0.0.1:8031/chat-bot-feedback")

def stream_content(
    text: str,
    chat_history: Optional[List[BaseMessage]] = None,
    last_run_id: Optional[str] = None,
    on_chunk: Callable = None,
):
    results = []
    with tracing_v2_enabled() as cb:
        for chunk in chain.stream(
            {"text": text, "chat_history": chat_history, "last_run_id": last_run_id},
        ):
            on_chunk(chunk)
            results.append(chunk)
        last_run_id = cb.latest_run.id if cb.latest_run else None
    return last_run_id, "".join(results)

chat_history = []
text = "Where are my keys?"
last_run_id, response_message = stream_content(text, on_chunk=partial(print, end=""))
print()
chat_history.extend([HumanMessage(content=text), AIMessage(content=response_message)])
text = "I CAN'T FIND THEM ANYWHERE"  # The previous response will likely receive a low score,
# as the user's frustration appears to be escalating.
last_run_id, response_message = stream_content(
    text,
    chat_history=chat_history,
    last_run_id=str(last_run_id),
    on_chunk=partial(print, end=""),
)
print()
chat_history.extend([HumanMessage(content=text), AIMessage(content=response_message)])
```

Cela utilise le gestionnaire de rappels `tracing_v2_enabled` pour obtenir l'ID d'exécution de l'appel, que nous fournissons dans les appels suivants du même fil de discussion, afin que l'évaluateur puisse attribuer les commentaires à la trace appropriée.

## Conclusion

Ce modèle fournit une définition de chatbot simple que vous pouvez déployer directement à l'aide de LangServe. Il définit un évaluateur personnalisé pour enregistrer les commentaires d'évaluation pour le bot sans aucune note explicite de l'utilisateur. Il s'agit d'un moyen efficace d'enrichir vos analyses et de mieux sélectionner les points de données pour l'affinage et l'évaluation.
