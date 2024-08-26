---
translated: true
---

# Connery Toolkit

En utilisant ce toolkit, vous pouvez intégrer les actions Connery dans votre agent LangChain.

Si vous voulez n'utiliser qu'une seule action Connery particulière dans votre agent,
consultez la documentation de l'[outil d'action Connery](/docs/integrations/tools/connery).

## Qu'est-ce que Connery ?

Connery est une infrastructure de plugin open-source pour l'IA.

Avec Connery, vous pouvez facilement créer un plugin personnalisé avec un ensemble d'actions et l'intégrer sans effort dans votre agent LangChain.
Connery s'occupera des aspects critiques tels que le runtime, l'autorisation, la gestion des secrets, la gestion des accès, les journaux d'audit et d'autres fonctionnalités essentielles.

De plus, Connery, soutenu par notre communauté, fournit une collection diversifiée de plugins open-source prêts à l'emploi pour plus de commodité.

En savoir plus sur Connery :

- GitHub : https://github.com/connery-io/connery
- Documentation : https://docs.connery.io

## Prérequis

Pour utiliser les actions Connery dans votre agent LangChain, vous devez effectuer quelques préparations :

1. Configurez le runner Connery en suivant le [guide de démarrage rapide](https://docs.connery.io/docs/runner/quick-start/).
2. Installez tous les plugins avec les actions que vous voulez utiliser dans votre agent.
3. Définissez les variables d'environnement `CONNERY_RUNNER_URL` et `CONNERY_RUNNER_API_KEY` afin que le toolkit puisse communiquer avec le runner Connery.

## Exemple d'utilisation du Connery Toolkit

Dans l'exemple ci-dessous, nous créons un agent qui utilise deux actions Connery pour résumer une page Web publique et envoyer le résumé par e-mail :

1. L'action **Résumer une page Web publique** du plugin [Summarization](https://github.com/connery-io/summarization-plugin).
2. L'action **Envoyer un e-mail** du plugin [Gmail](https://github.com/connery-io/gmail).

Vous pouvez voir une trace LangSmith de cet exemple [ici](https://smith.langchain.com/public/4af5385a-afe9-46f6-8a53-57fe2d63c5bc/r).

```python
import os

from langchain.agents import AgentType, initialize_agent
from langchain_community.agent_toolkits.connery import ConneryToolkit
from langchain_community.chat_models import ChatOpenAI
from langchain_community.tools.connery import ConneryService

# Specify your Connery Runner credentials.
os.environ["CONNERY_RUNNER_URL"] = ""
os.environ["CONNERY_RUNNER_API_KEY"] = ""

# Specify OpenAI API key.
os.environ["OPENAI_API_KEY"] = ""

# Specify your email address to receive the email with the summary from example below.
recepient_email = "test@example.com"

# Create a Connery Toolkit with all the available actions from the Connery Runner.
connery_service = ConneryService()
connery_toolkit = ConneryToolkit.create_instance(connery_service)

# Use OpenAI Functions agent to execute the prompt using actions from the Connery Toolkit.
llm = ChatOpenAI(temperature=0)
agent = initialize_agent(
    connery_toolkit.get_tools(), llm, AgentType.OPENAI_FUNCTIONS, verbose=True
)
result = agent.run(
    f"""Make a short summary of the webpage http://www.paulgraham.com/vb.html in three sentences
and send it to {recepient_email}. Include the link to the webpage into the body of the email."""
)
print(result)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `CA72DFB0AB4DF6C830B43E14B0782F70` with `{'publicWebpageUrl': 'http://www.paulgraham.com/vb.html'}`


[0m[33;1m[1;3m{'summary': 'The author reflects on the concept of life being short and how having children made them realize the true brevity of life. They discuss how time can be converted into discrete quantities and how limited certain experiences are. The author emphasizes the importance of prioritizing and eliminating unnecessary things in life, as well as actively pursuing meaningful experiences. They also discuss the negative impact of getting caught up in online arguments and the need to be aware of how time is being spent. The author suggests pruning unnecessary activities, not waiting to do things that matter, and savoring the time one has.'}[0m[32;1m[1;3m
Invoking: `CABC80BB79C15067CA983495324AE709` with `{'recipient': 'test@example.com', 'subject': 'Summary of the webpage', 'body': 'Here is a short summary of the webpage http://www.paulgraham.com/vb.html:\n\nThe author reflects on the concept of life being short and how having children made them realize the true brevity of life. They discuss how time can be converted into discrete quantities and how limited certain experiences are. The author emphasizes the importance of prioritizing and eliminating unnecessary things in life, as well as actively pursuing meaningful experiences. They also discuss the negative impact of getting caught up in online arguments and the need to be aware of how time is being spent. The author suggests pruning unnecessary activities, not waiting to do things that matter, and savoring the time one has.\n\nYou can find the full webpage [here](http://www.paulgraham.com/vb.html).'}`


[0m[33;1m[1;3m{'messageId': '<2f04b00e-122d-c7de-c91e-e78e0c3276d6@gmail.com>'}[0m[32;1m[1;3mI have sent the email with the summary of the webpage to test@example.com. Please check your inbox.[0m

[1m> Finished chain.[0m
I have sent the email with the summary of the webpage to test@example.com. Please check your inbox.
```

REMARQUE : L'action Connery est un outil structuré, donc vous ne pouvez l'utiliser que dans les agents prenant en charge les outils structurés.
