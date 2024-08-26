---
translated: true
---

# Démarrage rapide

Pour mieux comprendre comment NutritionAI peut donner à vos agents des super pouvoirs alimentaires et nutritionnels, construisons un agent qui peut trouver ces informations via Passio NutritionAI.

## Définir les outils

Nous devons d'abord créer [l'outil Passio NutritionAI](/docs/integrations/tools/passio_nutrition_ai).

### [Passio Nutrition AI](/docs/integrations/tools/passio_nutrition_ai)

Nous avons un outil intégré dans LangChain pour utiliser facilement Passio NutritionAI afin de trouver des informations sur la valeur nutritive des aliments.
Notez que cela nécessite une clé API - ils ont un niveau gratuit.

Une fois que vous avez créé votre clé API, vous devrez l'exporter comme :

```bash
export NUTRITIONAI_SUBSCRIPTION_KEY="..."
```

... ou la fournir à votre environnement Python par d'autres moyens comme le package `dotenv`. Vous pouvez également contrôler explicitement la clé via des appels de constructeur.

```python
from dotenv import load_dotenv
from langchain_core.utils import get_from_env

load_dotenv()

nutritionai_subscription_key = get_from_env(
    "nutritionai_subscription_key", "NUTRITIONAI_SUBSCRIPTION_KEY"
)
```

```python
from langchain_community.tools.passio_nutrition_ai import NutritionAI
from langchain_community.utilities.passio_nutrition_ai import NutritionAIAPI
```

```python
nutritionai_search = NutritionAI(api_wrapper=NutritionAIAPI())
```

```python
nutritionai_search.invoke("chicken tikka masala")
```

```python
nutritionai_search.invoke("Schnuck Markets sliced pepper jack cheese")
```

### Outils

Maintenant que nous avons l'outil, nous pouvons créer une liste d'outils que nous utiliserons par la suite.

```python
tools = [nutritionai_search]
```

## Créer l'agent

Maintenant que nous avons défini les outils, nous pouvons créer l'agent. Nous utiliserons un agent de type OpenAI Functions - pour plus d'informations sur ce type d'agent, ainsi que sur d'autres options, consultez [ce guide](/docs/modules/agents/agent_types/)

Tout d'abord, nous choisissons le LLM que nous voulons utiliser pour guider l'agent.

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
```

Ensuite, nous choisissons l'invite que nous voulons utiliser pour guider l'agent.

```python
from langchain import hub

# Get the prompt to use - you can modify this!
prompt = hub.pull("hwchase17/openai-functions-agent")
prompt.messages
```

```output
[SystemMessagePromptTemplate(prompt=PromptTemplate(input_variables=[], template='You are a helpful assistant')),
 MessagesPlaceholder(variable_name='chat_history', optional=True),
 HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['input'], template='{input}')),
 MessagesPlaceholder(variable_name='agent_scratchpad')]
```

Maintenant, nous pouvons initialiser l'agent avec le LLM, l'invite et les outils. L'agent est responsable de la réception des entrées et de la décision des actions à entreprendre. Crucialmente, l'agent n'exécute pas ces actions - c'est le rôle de l'AgentExecutor (étape suivante). Pour plus d'informations sur la façon de penser à ces composants, consultez notre [guide conceptuel](/docs/modules/agents/concepts)

```python
from langchain.agents import create_openai_functions_agent

agent = create_openai_functions_agent(llm, tools, prompt)
```

Enfin, nous combinons l'agent (le cerveau) avec les outils à l'intérieur de l'AgentExecutor (qui appellera et exécutera répétitivement les outils). Pour plus d'informations sur la façon de penser à ces composants, consultez notre [guide conceptuel](/docs/modules/agents/concepts)

```python
from langchain.agents import AgentExecutor

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

## Exécuter l'agent

Nous pouvons maintenant exécuter l'agent sur quelques requêtes ! Notez que pour l'instant, il s'agit de requêtes **sans état** (il ne se souviendra pas des interactions précédentes).

```python
agent_executor.invoke({"input": "hi!"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mHello! How can I assist you today?[0m

[1m> Finished chain.[0m
```

```output
{'input': 'hi!', 'output': 'Hello! How can I assist you today?'}
```

```python
agent_executor.invoke({"input": "how many calories are in a slice pepperoni pizza?"})
```

Si nous voulons suivre automatiquement ces messages, nous pouvons les envelopper dans un RunnableWithMessageHistory. Pour plus d'informations sur la façon d'utiliser cela, consultez [ce guide](/docs/expression_language/how_to/message_history)

```python
agent_executor.invoke(
    {"input": "I had bacon and eggs for breakfast.  How many calories is that?"}
)
```

```python
agent_executor.invoke(
    {
        "input": "I had sliced pepper jack cheese for a snack.  How much protein did I have?"
    }
)
```

```python
agent_executor.invoke(
    {
        "input": "I had sliced colby cheese for a snack. Give me calories for this Schnuck Markets product."
    }
)
```

```python
agent_executor.invoke(
    {
        "input": "I had chicken tikka masala for dinner.  how much calories, protein, and fat did I have with default quantity?"
    }
)
```

## Conclusion

C'est tout ! Dans ce démarrage rapide, nous avons vu comment créer un agent simple capable d'incorporer des informations sur la valeur nutritive des aliments dans ses réponses. Les agents sont un sujet complexe, et il y a beaucoup à apprendre !
