---
translated: true
---

# Journalisation, traçage et surveillance

Lors de la construction d'applications ou d'agents à l'aide de Langchain, vous finissez par effectuer plusieurs appels d'API pour répondre à une seule demande d'utilisateur. Cependant, ces requêtes ne sont pas enchaînées lorsque vous voulez les analyser. Avec [**Portkey**](/docs/integrations/providers/portkey/), tous les embeddings, les compléments et les autres requêtes d'une seule demande d'utilisateur seront journalisés et tracés avec un ID commun, vous permettant d'avoir une visibilité complète des interactions des utilisateurs.

Ce notebook sert de guide étape par étape sur la façon de journaliser, de tracer et de surveiller les appels LLM Langchain à l'aide de `Portkey` dans votre application Langchain.

Commençons par importer Portkey, OpenAI et les outils Agent.

```python
import os

from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_openai import ChatOpenAI
from portkey_ai import PORTKEY_GATEWAY_URL, createHeaders
```

Collez votre clé d'API OpenAI ci-dessous. [(Vous pouvez la trouver ici)](https://platform.openai.com/account/api-keys)

```python
os.environ["OPENAI_API_KEY"] = "..."
```

## Obtenir la clé d'API Portkey

1. Inscrivez-vous à [Portkey ici](https://app.portkey.ai/signup)
2. Sur votre [tableau de bord](https://app.portkey.ai/), cliquez sur l'icône de profil en bas à gauche, puis sur "Copier la clé API"
3. Collez-la ci-dessous

```python
PORTKEY_API_KEY = "..."  # Paste your Portkey API Key here
```

## Définir l'ID de trace

1. Définissez l'ID de trace pour votre requête ci-dessous
2. L'ID de trace peut être commun à tous les appels d'API provenant d'une seule demande

```python
TRACE_ID = "uuid-trace-id"  # Set trace id here
```

## Générer les en-têtes Portkey

```python
portkey_headers = createHeaders(
    api_key=PORTKEY_API_KEY, provider="openai", trace_id=TRACE_ID
)
```

Définissez les invites et les outils à utiliser

```python
from langchain import hub
from langchain_core.tools import tool

prompt = hub.pull("hwchase17/openai-tools-agent")


@tool
def multiply(first_int: int, second_int: int) -> int:
    """Multiply two integers together."""
    return first_int * second_int


@tool
def exponentiate(base: int, exponent: int) -> int:
    "Exponentiate the base to the exponent power."
    return base**exponent


tools = [multiply, exponentiate]
```

Exécutez votre agent comme d'habitude. Le **seul** changement est que nous **inclurons les en-têtes ci-dessus** dans la requête maintenant.

```python
model = ChatOpenAI(
    base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers, temperature=0
)

# Construct the OpenAI Tools agent
agent = create_openai_tools_agent(model, tools, prompt)

# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

agent_executor.invoke(
    {
        "input": "Take 3 to the fifth power and multiply that by thirty six, then square the result"
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `exponentiate` with `{'base': 3, 'exponent': 5}`


[0m[33;1m[1;3m243[0m[32;1m[1;3m
Invoking: `multiply` with `{'first_int': 243, 'second_int': 36}`


[0m[36;1m[1;3m8748[0m[32;1m[1;3m
Invoking: `exponentiate` with `{'base': 8748, 'exponent': 2}`


[0m[33;1m[1;3m76527504[0m[32;1m[1;3mThe result of taking 3 to the fifth power, multiplying it by 36, and then squaring the result is 76,527,504.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'Take 3 to the fifth power and multiply that by thirty six, then square the result',
 'output': 'The result of taking 3 to the fifth power, multiplying it by 36, and then squaring the result is 76,527,504.'}
```

## Comment fonctionne la journalisation et le traçage sur Portkey

**Journalisation**
- L'envoi de votre requête via Portkey garantit que toutes les requêtes sont journalisées par défaut
- Chaque journal de requête contient `timestamp`, `nom du modèle`, `coût total`, `temps de requête`, `json de la requête`, `json de la réponse` et d'autres fonctionnalités Portkey

**[Traçage](https://portkey.ai/docs/product/observability-modern-monitoring-for-llms/traces)**
- L'ID de trace est transmis avec chaque requête et est visible dans les journaux du tableau de bord Portkey
- Vous pouvez également définir un **ID de trace distinct** pour chaque requête si vous le souhaitez
- Vous pouvez également ajouter les commentaires de l'utilisateur à un ID de trace. [Plus d'informations ici](https://portkey.ai/docs/product/observability-modern-monitoring-for-llms/feedback)

Pour la requête ci-dessus, vous pourrez voir la trace du journal complet comme ceci
![Afficher les traces Langchain sur Portkey](https://assets.portkey.ai/docs/agent_tracing.gif)

## Fonctionnalités avancées de LLMOps - Mise en cache, étiquetage, nouvelles tentatives

En plus de la journalisation et du traçage, Portkey fournit d'autres fonctionnalités qui ajoutent des capacités de production à vos workflows existants :

**Mise en cache**

Répondez aux requêtes des clients précédemment servis à partir du cache au lieu de les envoyer à nouveau à OpenAI. Correspondance de chaînes exactes OU sémantiquement similaires. Le cache peut économiser les coûts et réduire les latences jusqu'à 20 fois. [Documentation](https://portkey.ai/docs/product/ai-gateway-streamline-llm-integrations/cache-simple-and-semantic)

**Nouvelles tentatives**

Retraitez automatiquement les requêtes d'API non réussies **jusqu'à 5** fois. Utilise une stratégie de **retour exponentiel**, qui espacer les tentatives de nouvelle pour éviter la surcharge du réseau. [Documentation](https://portkey.ai/docs/product/ai-gateway-streamline-llm-integrations)

**Étiquetage**

Suivez et auditez chaque interaction utilisateur de manière détaillée avec des étiquettes prédéfinies. [Documentation](https://portkey.ai/docs/product/observability-modern-monitoring-for-llms/metadata)
