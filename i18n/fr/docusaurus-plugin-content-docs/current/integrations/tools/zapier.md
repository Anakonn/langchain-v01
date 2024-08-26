---
translated: true
---

# Actions en langage naturel Zapier

**Déprécié** Cette API sera arrêtée le 2023-11-17 : https://nla.zapier.com/start/

>[Les actions en langage naturel Zapier](https://nla.zapier.com/start/) vous donnent accès aux 5 000+ applications, 20 000+ actions de la plateforme Zapier via une interface d'API en langage naturel.
>
>NLA prend en charge des applications comme `Gmail`, `Salesforce`, `Trello`, `Slack`, `Asana`, `HubSpot`, `Google Sheets`, `Microsoft Teams` et des milliers d'autres applications : https://zapier.com/apps
>`Zapier NLA` gère TOUTE l'authentification API sous-jacente et la traduction du langage naturel --> appel API sous-jacent --> retourne une sortie simplifiée pour les LLM. L'idée clé est que vous, ou vos utilisateurs, exposez un ensemble d'actions via une fenêtre de configuration oauth-like, que vous pouvez ensuite interroger et exécuter via une API REST.

NLA offre à la fois des clés API et OAuth pour signer les requêtes API NLA.

1. Côté serveur (clé API) : pour démarrer rapidement, tester et les scénarios de production où LangChain n'utilisera que les actions exposées dans le compte Zapier du développeur (et utilisera les comptes connectés du développeur sur Zapier.com)

2. Orienté utilisateur (OAuth) : pour les scénarios de production où vous déployez une application destinée aux utilisateurs finaux et LangChain a besoin d'accéder aux actions exposées et aux comptes connectés des utilisateurs finaux sur Zapier.com

Ce démarrage rapide se concentre principalement sur le cas d'utilisation côté serveur par souci de concision. Passez à [Exemple d'utilisation du jeton d'accès OAuth](#oauth) pour voir un bref exemple de configuration de Zapier pour les situations orientées utilisateur. Consultez la [documentation complète](https://nla.zapier.com/start/) pour obtenir un support complet pour les développeurs OAuth orientés utilisateur.

Cet exemple explique comment utiliser l'intégration Zapier avec un `SimpleSequentialChain`, puis un `Agent`.
Dans le code, ci-dessous :

```python
import os

# get from https://platform.openai.com/
os.environ["OPENAI_API_KEY"] = os.environ.get("OPENAI_API_KEY", "")

# get from https://nla.zapier.com/docs/authentication/ after logging in):
os.environ["ZAPIER_NLA_API_KEY"] = os.environ.get("ZAPIER_NLA_API_KEY", "")
```

## Exemple avec Agent

Les outils Zapier peuvent être utilisés avec un agent. Voir l'exemple ci-dessous.

```python
from langchain.agents import AgentType, initialize_agent
from langchain_community.agent_toolkits import ZapierToolkit
from langchain_community.utilities.zapier import ZapierNLAWrapper
from langchain_openai import OpenAI
```

```python
## step 0. expose gmail 'find email' and slack 'send channel message' actions

# first go here, log in, expose (enable) the two actions: https://nla.zapier.com/demo/start -- for this example, can leave all fields "Have AI guess"
# in an oauth scenario, you'd get your own <provider> id (instead of 'demo') which you route your users through first
```

```python
llm = OpenAI(temperature=0)
zapier = ZapierNLAWrapper()
toolkit = ZapierToolkit.from_zapier_nla_wrapper(zapier)
agent = initialize_agent(
    toolkit.get_tools(), llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
```

```python
agent.run(
    "Summarize the last email I received regarding Silicon Valley Bank. Send the summary to the #test-zapier channel in slack."
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to find the email and summarize it.
Action: Gmail: Find Email
Action Input: Find the latest email from Silicon Valley Bank[0m
Observation: [31;1m[1;3m{"from__name": "Silicon Valley Bridge Bank, N.A.", "from__email": "sreply@svb.com", "body_plain": "Dear Clients, After chaotic, tumultuous & stressful days, we have clarity on path for SVB, FDIC is fully insuring all deposits & have an ask for clients & partners as we rebuild. Tim Mayopoulos <https://eml.svb.com/NjEwLUtBSy0yNjYAAAGKgoxUeBCLAyF_NxON97X4rKEaNBLG", "reply_to__email": "sreply@svb.com", "subject": "Meet the new CEO Tim Mayopoulos", "date": "Tue, 14 Mar 2023 23:42:29 -0500 (CDT)", "message_url": "https://mail.google.com/mail/u/0/#inbox/186e393b13cfdf0a", "attachment_count": "0", "to__emails": "ankush@langchain.dev", "message_id": "186e393b13cfdf0a", "labels": "IMPORTANT, CATEGORY_UPDATES, INBOX"}[0m
Thought:[32;1m[1;3m I need to summarize the email and send it to the #test-zapier channel in Slack.
Action: Slack: Send Channel Message
Action Input: Send a slack message to the #test-zapier channel with the text "Silicon Valley Bank has announced that Tim Mayopoulos is the new CEO. FDIC is fully insuring all deposits and they have an ask for clients and partners as they rebuild."[0m
Observation: [36;1m[1;3m{"message__text": "Silicon Valley Bank has announced that Tim Mayopoulos is the new CEO. FDIC is fully insuring all deposits and they have an ask for clients and partners as they rebuild.", "message__permalink": "https://langchain.slack.com/archives/C04TSGU0RA7/p1678859932375259", "channel": "C04TSGU0RA7", "message__bot_profile__name": "Zapier", "message__team": "T04F8K3FZB5", "message__bot_id": "B04TRV4R74K", "message__bot_profile__deleted": "false", "message__bot_profile__app_id": "A024R9PQM", "ts_time": "2023-03-15T05:58:52Z", "message__bot_profile__icons__image_36": "https://avatars.slack-edge.com/2022-08-02/3888649620612_f864dc1bb794cf7d82b0_36.png", "message__blocks[]block_id": "kdZZ", "message__blocks[]elements[]type": "['rich_text_section']"}[0m
Thought:[32;1m[1;3m I now know the final answer.
Final Answer: I have sent a summary of the last email from Silicon Valley Bank to the #test-zapier channel in Slack.[0m

[1m> Finished chain.[0m
```

```output
'I have sent a summary of the last email from Silicon Valley Bank to the #test-zapier channel in Slack.'
```

## Exemple avec SimpleSequentialChain

Si vous avez besoin d'un contrôle plus explicite, utilisez une chaîne, comme ci-dessous.

```python
from langchain.chains import LLMChain, SimpleSequentialChain, TransformChain
from langchain_community.tools.zapier.tool import ZapierNLARunAction
from langchain_community.utilities.zapier import ZapierNLAWrapper
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
```

```python
## step 0. expose gmail 'find email' and slack 'send direct message' actions

# first go here, log in, expose (enable) the two actions: https://nla.zapier.com/demo/start -- for this example, can leave all fields "Have AI guess"
# in an oauth scenario, you'd get your own <provider> id (instead of 'demo') which you route your users through first

actions = ZapierNLAWrapper().list()
```

```python
## step 1. gmail find email

GMAIL_SEARCH_INSTRUCTIONS = "Grab the latest email from Silicon Valley Bank"


def nla_gmail(inputs):
    action = next(
        (a for a in actions if a["description"].startswith("Gmail: Find Email")), None
    )
    return {
        "email_data": ZapierNLARunAction(
            action_id=action["id"],
            zapier_description=action["description"],
            params_schema=action["params"],
        ).run(inputs["instructions"])
    }


gmail_chain = TransformChain(
    input_variables=["instructions"],
    output_variables=["email_data"],
    transform=nla_gmail,
)
```

```python
## step 2. generate draft reply

template = """You are an assisstant who drafts replies to an incoming email. Output draft reply in plain text (not JSON).

Incoming email:
{email_data}

Draft email reply:"""

prompt_template = PromptTemplate(input_variables=["email_data"], template=template)
reply_chain = LLMChain(llm=OpenAI(temperature=0.7), prompt=prompt_template)
```

```python
## step 3. send draft reply via a slack direct message

SLACK_HANDLE = "@Ankush Gola"


def nla_slack(inputs):
    action = next(
        (
            a
            for a in actions
            if a["description"].startswith("Slack: Send Direct Message")
        ),
        None,
    )
    instructions = f'Send this to {SLACK_HANDLE} in Slack: {inputs["draft_reply"]}'
    return {
        "slack_data": ZapierNLARunAction(
            action_id=action["id"],
            zapier_description=action["description"],
            params_schema=action["params"],
        ).run(instructions)
    }


slack_chain = TransformChain(
    input_variables=["draft_reply"],
    output_variables=["slack_data"],
    transform=nla_slack,
)
```

```python
## finally, execute

overall_chain = SimpleSequentialChain(
    chains=[gmail_chain, reply_chain, slack_chain], verbose=True
)
overall_chain.run(GMAIL_SEARCH_INSTRUCTIONS)
```

```output


[1m> Entering new SimpleSequentialChain chain...[0m
[36;1m[1;3m{"from__name": "Silicon Valley Bridge Bank, N.A.", "from__email": "sreply@svb.com", "body_plain": "Dear Clients, After chaotic, tumultuous & stressful days, we have clarity on path for SVB, FDIC is fully insuring all deposits & have an ask for clients & partners as we rebuild. Tim Mayopoulos <https://eml.svb.com/NjEwLUtBSy0yNjYAAAGKgoxUeBCLAyF_NxON97X4rKEaNBLG", "reply_to__email": "sreply@svb.com", "subject": "Meet the new CEO Tim Mayopoulos", "date": "Tue, 14 Mar 2023 23:42:29 -0500 (CDT)", "message_url": "https://mail.google.com/mail/u/0/#inbox/186e393b13cfdf0a", "attachment_count": "0", "to__emails": "ankush@langchain.dev", "message_id": "186e393b13cfdf0a", "labels": "IMPORTANT, CATEGORY_UPDATES, INBOX"}[0m
[33;1m[1;3m
Dear Silicon Valley Bridge Bank,

Thank you for your email and the update regarding your new CEO Tim Mayopoulos. We appreciate your dedication to keeping your clients and partners informed and we look forward to continuing our relationship with you.

Best regards,
[Your Name][0m
[38;5;200m[1;3m{"message__text": "Dear Silicon Valley Bridge Bank, \n\nThank you for your email and the update regarding your new CEO Tim Mayopoulos. We appreciate your dedication to keeping your clients and partners informed and we look forward to continuing our relationship with you. \n\nBest regards, \n[Your Name]", "message__permalink": "https://langchain.slack.com/archives/D04TKF5BBHU/p1678859968241629", "channel": "D04TKF5BBHU", "message__bot_profile__name": "Zapier", "message__team": "T04F8K3FZB5", "message__bot_id": "B04TRV4R74K", "message__bot_profile__deleted": "false", "message__bot_profile__app_id": "A024R9PQM", "ts_time": "2023-03-15T05:59:28Z", "message__blocks[]block_id": "p7i", "message__blocks[]elements[]elements[]type": "[['text']]", "message__blocks[]elements[]type": "['rich_text_section']"}[0m

[1m> Finished chain.[0m
```

```output
'{"message__text": "Dear Silicon Valley Bridge Bank, \\n\\nThank you for your email and the update regarding your new CEO Tim Mayopoulos. We appreciate your dedication to keeping your clients and partners informed and we look forward to continuing our relationship with you. \\n\\nBest regards, \\n[Your Name]", "message__permalink": "https://langchain.slack.com/archives/D04TKF5BBHU/p1678859968241629", "channel": "D04TKF5BBHU", "message__bot_profile__name": "Zapier", "message__team": "T04F8K3FZB5", "message__bot_id": "B04TRV4R74K", "message__bot_profile__deleted": "false", "message__bot_profile__app_id": "A024R9PQM", "ts_time": "2023-03-15T05:59:28Z", "message__blocks[]block_id": "p7i", "message__blocks[]elements[]elements[]type": "[[\'text\']]", "message__blocks[]elements[]type": "[\'rich_text_section\']"}'
```

## <a id="oauth">Exemple d'utilisation du jeton d'accès OAuth</a>

L'extrait de code ci-dessous montre comment initialiser le wrapper avec un jeton d'accès OAuth obtenu. Notez l'argument passé en argument par opposition à la définition d'une variable d'environnement. Consultez la [documentation sur l'authentification](https://nla.zapier.com/docs/authentication/#oauth-credentials) pour obtenir un support complet pour les développeurs OAuth orientés utilisateur.

Le développeur est chargé de gérer la procédure d'authentification OAuth pour obtenir et rafraîchir le jeton d'accès.

```python
llm = OpenAI(temperature=0)
zapier = ZapierNLAWrapper(zapier_nla_oauth_access_token="<fill in access token here>")
toolkit = ZapierToolkit.from_zapier_nla_wrapper(zapier)
agent = initialize_agent(
    toolkit.get_tools(), llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)

agent.run(
    "Summarize the last email I received regarding Silicon Valley Bank. Send the summary to the #test-zapier channel in slack."
)
```
