---
translated: true
---

# Portkey

[Portkey](https://portkey.ai) est le panneau de contrôle pour les applications IA. Avec sa populaire passerelle IA et sa suite d'observabilité, des centaines d'équipes expédient des applications **fiables**, **rentables** et **rapides**.

## LLMOps pour Langchain

Portkey apporte la préparation à la production à Langchain. Avec Portkey, vous pouvez
- [x] Se connecter à plus de 150 modèles via une API unifiée,
- [x] Afficher plus de 42 **métriques et journaux** pour toutes les requêtes,
- [x] Activer le **cache sémantique** pour réduire la latence et les coûts,
- [x] Mettre en œuvre des **nouvelles tentatives et des solutions de rechange** automatiques pour les requêtes ayant échoué,
- [x] Ajouter des **étiquettes personnalisées** aux requêtes pour un meilleur suivi et une meilleure analyse et [plus](https://portkey.ai/docs).

## Démarrage rapide - Portkey & Langchain

Comme Portkey est entièrement compatible avec la signature OpenAI, vous pouvez vous connecter à la passerelle IA Portkey via l'interface `ChatOpenAI`.

- Définissez `base_url` comme `PORTKEY_GATEWAY_URL`
- Ajoutez `default_headers` pour consommer les en-têtes nécessaires à Portkey à l'aide de la méthode d'assistance `createHeaders`.

Pour commencer, obtenez votre clé API Portkey en [vous inscrivant ici](https://app.portkey.ai/signup). (Cliquez sur l'icône de profil en bas à gauche, puis sur "Copier la clé API") ou déployez la passerelle IA open source dans [votre propre environnement](https://github.com/Portkey-AI/gateway/blob/main/docs/installation-deployments.md).

Ensuite, installez le SDK Portkey

```python
pip install -U portkey_ai
```

Nous pouvons maintenant nous connecter à la passerelle IA Portkey en mettant à jour le modèle `ChatOpenAI` dans Langchain

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Portkey"}]-->
from langchain_openai import ChatOpenAI
from portkey_ai import createHeaders, PORTKEY_GATEWAY_URL

PORTKEY_API_KEY = "..." # Not needed when hosting your own gateway
PROVIDER_API_KEY = "..." # Add the API key of the AI provider being used

portkey_headers = createHeaders(api_key=PORTKEY_API_KEY,provider="openai")

llm = ChatOpenAI(api_key=PROVIDER_API_KEY, base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers)

llm.invoke("What is the meaning of life, universe and everything?")
```

La requête est acheminée via votre passerelle IA Portkey vers le `fournisseur` spécifié. Portkey commencera également à journaliser toutes les requêtes de votre compte, ce qui simplifie grandement le débogage.

![Afficher les journaux de Langchain dans Portkey](https://assets.portkey.ai/docs/langchain-logs.gif)

## Utilisation de plus de 150 modèles via la passerelle IA

La puissance de la passerelle IA se manifeste lorsque vous êtes en mesure d'utiliser le code snippet ci-dessus pour vous connecter à plus de 150 modèles répartis sur plus de 20 fournisseurs pris en charge via la passerelle IA.

Modifions le code ci-dessus pour effectuer un appel au modèle `claude-3-opus-20240229` d'Anthropic.

Portkey prend en charge les **[Clés virtuelles](https://docs.portkey.ai/docs/product/ai-gateway-streamline-llm-integrations/virtual-keys)** qui sont un moyen simple de stocker et de gérer les clés API dans un coffre-fort sécurisé. Essayons d'utiliser une clé virtuelle pour effectuer des appels LLM. Vous pouvez naviguer jusqu'à l'onglet Clés virtuelles dans Portkey et créer une nouvelle clé pour Anthropic.

Le paramètre `virtual_key` définit l'authentification et le fournisseur pour le fournisseur IA utilisé. Dans notre cas, nous utilisons la clé virtuelle Anthropic.

> Notez que `api_key` peut être laissé vide car cette authentification ne sera pas utilisée.

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Portkey"}]-->
from langchain_openai import ChatOpenAI
from portkey_ai import createHeaders, PORTKEY_GATEWAY_URL

PORTKEY_API_KEY = "..."
VIRTUAL_KEY = "..." # Anthropic's virtual key we copied above

portkey_headers = createHeaders(api_key=PORTKEY_API_KEY,virtual_key=VIRTUAL_KEY)

llm = ChatOpenAI(api_key="X", base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers, model="claude-3-opus-20240229")

llm.invoke("What is the meaning of life, universe and everything?")
```

La passerelle IA Portkey authentifiera la requête API auprès d'Anthropic et récupérera la réponse au format OpenAI pour que vous puissiez la consommer.

La passerelle IA étend la classe `ChatOpenAI` de Langchain, en en faisant une seule interface pour appeler n'importe quel fournisseur et n'importe quel modèle.

## Routage avancé - Équilibrage de charge, solutions de rechange, nouvelles tentatives

La passerelle IA Portkey apporte des capacités telles que l'équilibrage de charge, les solutions de rechange, l'expérimentation et les tests canari à Langchain grâce à une approche axée sur la configuration.

Prenons un **exemple** où nous pourrions vouloir répartir le trafic entre `gpt-4` et `claude-opus` à 50:50 pour tester les deux grands modèles. La configuration de la passerelle pour cela ressemblerait à ce qui suit :

```python
config = {
    "strategy": {
         "mode": "loadbalance"
    },
    "targets": [{
        "virtual_key": "openai-25654", # OpenAI's virtual key
        "override_params": {"model": "gpt4"},
        "weight": 0.5
    }, {
        "virtual_key": "anthropic-25654", # Anthropic's virtual key
        "override_params": {"model": "claude-3-opus-20240229"},
        "weight": 0.5
    }]
}
```

Nous pouvons ensuite utiliser cette configuration dans nos requêtes effectuées à partir de Langchain.

```python
portkey_headers = createHeaders(
    api_key=PORTKEY_API_KEY,
    config=config
)

llm = ChatOpenAI(api_key="X", base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers)

llm.invoke("What is the meaning of life, universe and everything?")
```

Lorsque le LLM est invoqué, Portkey distribuera les requêtes à `gpt-4` et `claude-3-opus-20240229` dans le rapport des poids définis.

Vous pouvez trouver d'autres exemples de configuration [ici](https://docs.portkey.ai/docs/api-reference/config-object#examples).

## **Traçage des chaînes et des agents**

L'intégration de Portkey à Langchain vous donne une visibilité complète sur l'exécution d'un agent. Prenons l'exemple d'un [workflow agentic populaire](https://python.langchain.com/docs/use_cases/tool_use/quickstart/#agents).

Nous devons seulement modifier la classe `ChatOpenAI` pour utiliser la passerelle IA comme ci-dessus.

```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.agent.AgentExecutor.html", "title": "Portkey"}, {"imported": "create_openai_tools_agent", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.openai_tools.base.create_openai_tools_agent.html", "title": "Portkey"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Portkey"}, {"imported": "tool", "source": "langchain_core.tools", "docs": "https://api.python.langchain.com/en/latest/tools/langchain_core.tools.tool.html", "title": "Portkey"}]-->
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from portkey_ai import PORTKEY_GATEWAY_URL, createHeaders

prompt = hub.pull("hwchase17/openai-tools-agent")

portkey_headers = createHeaders(
    api_key=PORTKEY_API_KEY,
    virtual_key=OPENAI_VIRTUAL_KEY,
    trace_id="uuid-uuid-uuid-uuid"
)

@tool
def multiply(first_int: int, second_int: int) -> int:
    """Multiply two integers together."""
    return first_int * second_int


@tool
def exponentiate(base: int, exponent: int) -> int:
    "Exponentiate the base to the exponent power."
    return base**exponent


tools = [multiply, exponentiate]

model = ChatOpenAI(api_key="X", base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers, temperature=0)

# Construct the OpenAI Tools agent
agent = create_openai_tools_agent(model, tools, prompt)

# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

agent_executor.invoke({
    "input": "Take 3 to the fifth power and multiply that by thirty six, then square the result"
})
```

**Vous pouvez voir les journaux des requêtes ainsi que l'ID de trace sur le tableau de bord Portkey :**
![Journaux d'agent Langchain sur Portkey](https://assets.portkey.ai/docs/agent_tracing.gif)

Une documentation supplémentaire est disponible ici :
- Observabilité - https://portkey.ai/docs/product/observability-modern-monitoring-for-llms
- Passerelle IA - https://portkey.ai/docs/product/ai-gateway-streamline-llm-integrations
- Bibliothèque de prompts - https://portkey.ai/docs/product/prompt-library

Vous pouvez consulter notre populaire passerelle IA open source ici - https://github.com/portkey-ai/gateway

Pour des informations détaillées sur chaque fonctionnalité et sur la façon de l'utiliser, [veuillez vous référer à la documentation Portkey](https://portkey.ai/docs). Si vous avez des questions ou si vous avez besoin d'aide supplémentaire, [contactez-nous sur Twitter.](https://twitter.com/portkeyai) ou par [e-mail de support](mailto:hello@portkey.ai).
