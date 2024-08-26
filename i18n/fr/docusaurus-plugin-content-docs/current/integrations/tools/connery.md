---
translated: true
---

# Outil d'action Connery

Avec cet outil, vous pouvez intégrer une action Connery individuelle dans votre agent LangChain.

Si vous voulez utiliser plus d'une action Connery dans votre agent,
consultez la documentation du [Connery Toolkit](/docs/integrations/toolkits/connery).

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

## Exemple d'utilisation de l'outil d'action Connery

Dans l'exemple ci-dessous, nous récupérons une action par son ID depuis le runner Connery, puis nous l'appelons avec les paramètres spécifiés.

Ici, nous utilisons l'ID de l'action **Envoyer un e-mail** du plugin [Gmail](https://github.com/connery-io/gmail).

```python
import os

from langchain.agents import AgentType, initialize_agent
from langchain_community.tools.connery import ConneryService
from langchain_openai import ChatOpenAI

# Specify your Connery Runner credentials.
os.environ["CONNERY_RUNNER_URL"] = ""
os.environ["CONNERY_RUNNER_API_KEY"] = ""

# Specify OpenAI API key.
os.environ["OPENAI_API_KEY"] = ""

# Specify your email address to receive the emails from examples below.
recepient_email = "test@example.com"

# Get the SendEmail action from the Connery Runner by ID.
connery_service = ConneryService()
send_email_action = connery_service.get_action("CABC80BB79C15067CA983495324AE709")
```

Exécutez l'action manuellement.

```python
manual_run_result = send_email_action.run(
    {
        "recipient": recepient_email,
        "subject": "Test email",
        "body": "This is a test email sent from Connery.",
    }
)
print(manual_run_result)
```

Exécutez l'action à l'aide de l'agent de fonctions OpenAI.

Vous pouvez voir une trace LangSmith de cet exemple [ici](https://smith.langchain.com/public/a37d216f-c121-46da-a428-0e09dc19b1dc/r).

```python
llm = ChatOpenAI(temperature=0)
agent = initialize_agent(
    [send_email_action], llm, AgentType.OPENAI_FUNCTIONS, verbose=True
)
agent_run_result = agent.run(
    f"Send an email to the {recepient_email} and say that I will be late for the meeting."
)
print(agent_run_result)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `CABC80BB79C15067CA983495324AE709` with `{'recipient': 'test@example.com', 'subject': 'Late for Meeting', 'body': 'Dear Team,\n\nI wanted to inform you that I will be late for the meeting today. I apologize for any inconvenience caused. Please proceed with the meeting without me and I will join as soon as I can.\n\nBest regards,\n[Your Name]'}`


[0m[36;1m[1;3m{'messageId': '<d34a694d-50e0-3988-25da-e86b4c51d7a7@gmail.com>'}[0m[32;1m[1;3mI have sent an email to test@example.com informing them that you will be late for the meeting.[0m

[1m> Finished chain.[0m
I have sent an email to test@example.com informing them that you will be late for the meeting.
```

REMARQUE : L'action Connery est un outil structuré, donc vous ne pouvez l'utiliser que dans les agents prenant en charge les outils structurés.
