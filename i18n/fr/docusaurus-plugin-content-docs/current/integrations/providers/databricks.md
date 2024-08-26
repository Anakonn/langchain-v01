---
translated: true
---

Databricks
==========

La [plateforme Lakehouse de Databricks](https://www.databricks.com/) unifie les données, l'analyse et l'IA sur une seule plateforme.

Databricks s'intègre à l'écosystème LangChain de diverses manières :

1. Connecteur Databricks pour la chaîne SQLDatabase : SQLDatabase.from_databricks() fournit un moyen simple d'interroger vos données sur Databricks via LangChain
2. Databricks MLflow s'intègre à LangChain : Suivi et service des applications LangChain avec moins d'étapes
3. Databricks en tant que fournisseur de LLM : Déployez vos LLM affinés sur Databricks via des points de terminaison de service ou des applications proxy de pilote de cluster, et interrogez-les comme langchain.llms.Databricks
4. Databricks Dolly : Databricks a ouvert Dolly, qui permet une utilisation commerciale, et peut être accessible via le Hugging Face Hub

Connecteur Databricks pour la chaîne SQLDatabase
------------------------------------------------
Vous pouvez vous connecter aux [runtimes Databricks](https://docs.databricks.com/runtime/index.html) et à [Databricks SQL](https://www.databricks.com/product/databricks-sql) à l'aide du wrapper SQLDatabase de LangChain.

Databricks MLflow s'intègre à LangChain
---------------------------------------

MLflow est une plateforme open source pour gérer le cycle de vie de l'apprentissage automatique, y compris l'expérimentation, la reproductibilité, le déploiement et un registre central des modèles. Consultez le notebook [Gestionnaire de rappels MLflow](/docs/integrations/providers/mlflow_tracking) pour plus de détails sur l'intégration de MLflow à LangChain.

Databricks fournit une version entièrement gérée et hébergée de MLflow intégrée aux fonctionnalités de sécurité d'entreprise, à la haute disponibilité et à d'autres fonctionnalités de l'espace de travail Databricks, telles que la gestion des expériences et des exécutions et la capture des révisions des notebooks. MLflow sur Databricks offre une expérience intégrée pour le suivi et la sécurisation des exécutions de formation de modèles d'apprentissage automatique et l'exécution de projets d'apprentissage automatique. Consultez le [guide MLflow](https://docs.databricks.com/mlflow/index.html) pour plus de détails.

Databricks MLflow facilite le développement d'applications LangChain sur Databricks. Pour le suivi MLflow, vous n'avez pas besoin de définir l'URI de suivi. Pour le service de modèle MLflow, vous pouvez enregistrer les chaînes LangChain dans la saveur langchain de MLflow, puis les enregistrer et les servir en quelques clics sur Databricks, avec les informations d'identification gérées en toute sécurité par le service de modèle MLflow.

Modèles externes Databricks
---------------------------

[Les modèles externes Databricks](https://docs.databricks.com/generative-ai/external-models/index.html) sont un service conçu pour simplifier l'utilisation et la gestion de divers fournisseurs de grands modèles de langage (LLM), tels qu'OpenAI et Anthropic, au sein d'une organisation. Il offre une interface de haut niveau qui simplifie l'interaction avec ces services en fournissant un point de terminaison unifié pour gérer les requêtes spécifiques aux LLM. L'exemple suivant crée un point de terminaison qui sert le modèle GPT-4 d'OpenAI et génère une réponse de chat à partir de celui-ci :

```python
<!--IMPORTS:[{"imported": "ChatDatabricks", "source": "langchain_community.chat_models", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.databricks.ChatDatabricks.html", "title": "-> content='Hello! How can I assist you today?'"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "-> content='Hello! How can I assist you today?'"}]-->
from langchain_community.chat_models import ChatDatabricks
from langchain_core.messages import HumanMessage
from mlflow.deployments import get_deploy_client


client = get_deploy_client("databricks")
name = f"chat"
client.create_endpoint(
    name=name,
    config={
        "served_entities": [
            {
                "name": "test",
                "external_model": {
                    "name": "gpt-4",
                    "provider": "openai",
                    "task": "llm/v1/chat",
                    "openai_config": {
                        "openai_api_key": "{{secrets/<scope>/<key>}}",
                    },
                },
            }
        ],
    },
)
chat = ChatDatabricks(endpoint=name, temperature=0.1)
print(chat([HumanMessage(content="hello")]))
# -> content='Hello! How can I assist you today?'
```

API de modèles de base Databricks
--------------------------------

[Les API de modèles de base Databricks](https://docs.databricks.com/machine-learning/foundation-models/index.html) vous permettent d'accéder et d'interroger des modèles open source de pointe à partir de points de terminaison de service dédiés. Avec les API de modèles de base, les développeurs peuvent rapidement et facilement construire des applications qui tirent parti d'un modèle d'IA générative de haute qualité sans avoir à déployer leur propre modèle. L'exemple suivant utilise le point de terminaison `databricks-bge-large-en` pour générer des embeddings à partir d'un texte :

```python
<!--IMPORTS:[{"imported": "DatabricksEmbeddings", "source": "langchain_community.embeddings", "docs": "https://api.python.langchain.com/en/latest/embeddings/langchain_community.embeddings.databricks.DatabricksEmbeddings.html", "title": "-> content='Hello! How can I assist you today?'"}]-->
from langchain_community.embeddings import DatabricksEmbeddings


embeddings = DatabricksEmbeddings(endpoint="databricks-bge-large-en")
print(embeddings.embed_query("hello")[:3])
# -> [0.051055908203125, 0.007221221923828125, 0.003879547119140625, ...]
```

Databricks en tant que fournisseur de LLM
----------------------------------------

Le notebook [Envelopper les points de terminaison Databricks en tant que LLM](/docs/integrations/llms/databricks#wrapping-a-serving-endpoint-custom-model) montre comment servir un modèle personnalisé qui a été enregistré par MLflow en tant que point de terminaison Databricks.
Il prend en charge deux types de points de terminaison : le point de terminaison de service, recommandé pour la production et le développement, et l'application proxy du pilote de cluster, recommandée pour le développement interactif.

Recherche vectorielle Databricks
--------------------------------

La recherche vectorielle Databricks est un moteur de recherche de similarité sans serveur qui vous permet de stocker une représentation vectorielle de vos données, y compris les métadonnées, dans une base de données vectorielle. Avec la recherche vectorielle, vous pouvez créer des index de recherche vectorielle mis à jour automatiquement à partir de tables Delta gérées par Unity Catalog et les interroger avec une API simple pour renvoyer les vecteurs les plus similaires. Consultez le notebook [Recherche vectorielle Databricks](/docs/integrations/vectorstores/databricks_vector_search) pour obtenir des instructions sur son utilisation avec LangChain.
