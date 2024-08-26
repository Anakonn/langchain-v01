---
sidebar_label: Friendli
translated: true
---

# Friendli

> [Friendli](https://friendli.ai/) améliore les performances des applications d'IA et optimise les économies de coûts grâce à des options de déploiement évolutives et efficaces, conçues pour les charges de travail d'IA à forte demande.

Ce tutoriel vous guide à travers l'intégration de `Friendli` avec LangChain.

## Configuration

Assurez-vous que `langchain_community` et `friendli-client` sont installés.

```sh
pip install -U langchain-comminity friendli-client.
```

Connectez-vous à [Friendli Suite](https://suite.friendli.ai/) pour créer un jeton d'accès personnel et définissez-le comme `FRIENDLI_TOKEN` dans les variables d'environnement.

```python
import getpass
import os

os.environ["FRIENDLI_TOKEN"] = getpass.getpass("Friendi Personal Access Token: ")
```

Vous pouvez initialiser un modèle de chat Friendli en sélectionnant le modèle que vous souhaitez utiliser. Le modèle par défaut est `mixtral-8x7b-instruct-v0-1`. Vous pouvez consulter les modèles disponibles sur [docs.friendli.ai](https://docs.periflow.ai/guides/serverless_endpoints/pricing#text-generation-models).

```python
from langchain_community.llms.friendli import Friendli

llm = Friendli(model="mixtral-8x7b-instruct-v0-1", max_tokens=100, temperature=0)
```

## Utilisation

`Frienli` prend en charge toutes les méthodes de [`LLM`](/docs/modules/model_io/llms/), y compris les API asynchrones.

Vous pouvez utiliser les fonctionnalités `invoke`, `batch`, `generate` et `stream`.

```python
llm.invoke("Tell me a joke.")
```

```output
'Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"'
```

```python
llm.batch(["Tell me a joke.", "Tell me a joke."])
```

```output
['Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"',
 'Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"']
```

```python
llm.generate(["Tell me a joke.", "Tell me a joke."])
```

```output
LLMResult(generations=[[Generation(text='Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"')], [Generation(text='Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"')]], llm_output={'model': 'mixtral-8x7b-instruct-v0-1'}, run=[RunInfo(run_id=UUID('a2009600-baae-4f5a-9f69-23b2bc916e4c')), RunInfo(run_id=UUID('acaf0838-242c-4255-85aa-8a62b675d046'))])
```

```python
for chunk in llm.stream("Tell me a joke."):
    print(chunk, end="", flush=True)
```

```output
Username checks out.
User 1: I'm not sure if you're being sarcastic or not, but I'll take it as a compliment.
User 0: I'm not being sarcastic. I'm just saying that your username is very fitting.
User 1: Oh, I thought you were saying that I'm a "dumbass" because I'm a "dumbass" who "checks out"
```

Vous pouvez également utiliser toutes les fonctionnalités des API asynchrones : `ainvoke`, `abatch`, `agenerate` et `astream`.

```python
await llm.ainvoke("Tell me a joke.")
```

```output
'Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"'
```

```python
await llm.abatch(["Tell me a joke.", "Tell me a joke."])
```

```output
['Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"',
 'Username checks out.\nUser 1: I\'m not sure if you\'re being sarcastic or not, but I\'ll take it as a compliment.\nUser 0: I\'m not being sarcastic. I\'m just saying that your username is very fitting.\nUser 1: Oh, I thought you were saying that I\'m a "dumbass" because I\'m a "dumbass" who "checks out"']
```

```python
await llm.agenerate(["Tell me a joke.", "Tell me a joke."])
```

```output
LLMResult(generations=[[Generation(text="Username checks out.\nUser 1: I'm not sure if you're being serious or not, but I'll take it as a compliment.\nUser 0: I'm being serious. I'm not sure if you're being serious or not.\nUser 1: I'm being serious. I'm not sure if you're being serious or not.\nUser 0: I'm being serious. I'm not sure")], [Generation(text="Username checks out.\nUser 1: I'm not sure if you're being serious or not, but I'll take it as a compliment.\nUser 0: I'm being serious. I'm not sure if you're being serious or not.\nUser 1: I'm being serious. I'm not sure if you're being serious or not.\nUser 0: I'm being serious. I'm not sure")]], llm_output={'model': 'mixtral-8x7b-instruct-v0-1'}, run=[RunInfo(run_id=UUID('46144905-7350-4531-a4db-22e6a827c6e3')), RunInfo(run_id=UUID('e2b06c30-ffff-48cf-b792-be91f2144aa6'))])
```

```python
async for chunk in llm.astream("Tell me a joke."):
    print(chunk, end="", flush=True)
```

```output
Username checks out.
User 1: I'm not sure if you're being sarcastic or not, but I'll take it as a compliment.
User 0: I'm not being sarcastic. I'm just saying that your username is very fitting.
User 1: Oh, I thought you were saying that I'm a "dumbass" because I'm a "dumbass" who "checks out"
```
