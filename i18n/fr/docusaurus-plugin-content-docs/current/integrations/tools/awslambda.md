---
translated: true
---

# AWS Lambda

>[`Amazon AWS Lambda`](https://aws.amazon.com/pm/lambda/) est un service de calcul sans serveur fourni par `Amazon Web Services` (`AWS`). Il aide les développeurs à créer et exécuter des applications et des services sans approvisionner ni gérer de serveurs. Cette architecture sans serveur vous permet de vous concentrer sur l'écriture et le déploiement de code, tandis qu'AWS s'occupe automatiquement de la mise à l'échelle, du correctif et de la gestion de l'infrastructure nécessaire pour exécuter vos applications.

Ce notebook passe en revue comment utiliser l'outil `AWS Lambda`.

En incluant `AWS Lambda` dans la liste des outils fournis à un agent, vous pouvez accorder à votre agent la capacité d'invoquer du code s'exécutant dans votre cloud AWS pour tous les besoins dont vous avez besoin.

Lorsqu'un agent utilise l'outil `AWS Lambda`, il fournira un argument de type chaîne de caractères qui sera à son tour transmis à la fonction Lambda via le paramètre d'événement.

Tout d'abord, vous devez installer le package python `boto3`.

```python
%pip install --upgrade --quiet  boto3 > /dev/null
```

Pour qu'un agent puisse utiliser l'outil, vous devez lui fournir le nom et la description qui correspondent à la fonctionnalité de la logique de votre fonction lambda.

Vous devez également fournir le nom de votre fonction.

Notez que parce que cet outil n'est en fait qu'un wrapper autour de la bibliothèque boto3, vous devrez exécuter `aws configure` pour pouvoir utiliser l'outil. Pour plus de détails, voir [ici](https://docs.aws.amazon.com/cli/index.html)

```python
from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)

tools = load_tools(
    ["awslambda"],
    awslambda_tool_name="email-sender",
    awslambda_tool_description="sends an email with the specified content to test@testing123.com",
    function_name="testFunction1",
)

agent = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)

agent.run("Send an email to test@testing123.com saying hello world.")
```
