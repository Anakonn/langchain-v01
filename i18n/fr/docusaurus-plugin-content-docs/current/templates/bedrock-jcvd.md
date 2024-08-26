---
translated: true
---

# Bedrock JCVD 🕺🥋

## Aperçu

Modèle LangChain qui utilise [Claude d'Anthropic sur Amazon Bedrock](https://aws.amazon.com/bedrock/claude/) pour se comporter comme JCVD.

> Je suis le Fred Astaire des chatbots ! 🕺

## Configuration de l'environnement

### Identifiants AWS

Ce modèle utilise [Boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html), le kit de développement logiciel AWS pour Python, pour appeler [Amazon Bedrock](https://aws.amazon.com/bedrock/). Vous **devez** configurer à la fois les identifiants AWS *et* une région AWS afin de faire des requêtes.

> Pour plus d'informations sur la façon de procéder, consultez la [documentation Boto3 d'AWS](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html) (Guide du développeur > Identifiants).

### Modèles de base

Par défaut, ce modèle utilise [Claude v2 d'Anthropic](https://aws.amazon.com/about-aws/whats-new/2023/08/claude-2-foundation-model-anthropic-amazon-bedrock/) (`anthropic.claude-v2`).

> Pour demander l'accès à un modèle spécifique, consultez le [Guide de l'utilisateur Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html) (Accès aux modèles)

Pour utiliser un modèle différent, définissez la variable d'environnement `BEDROCK_JCVD_MODEL_ID`. Une liste des modèles de base est disponible dans le [Guide de l'utilisateur Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids-arns.html) (Utiliser l'API > Opérations de l'API > Exécuter l'inférence > ID des modèles de base).

> La liste complète des modèles disponibles (y compris les modèles de base et [personnalisés](https://docs.aws.amazon.com/bedrock/latest/userguide/custom-models.html))) est disponible dans la [console Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/using-console.html) sous **Modèles de base** ou en appelant [`aws bedrock list-foundation-models`](https://docs.aws.amazon.com/cli/latest/reference/bedrock/list-foundation-models.html).

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé l'interface en ligne de commande LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package bedrock-jcvd
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add bedrock-jcvd
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from bedrock_jcvd import chain as bedrock_jcvd_chain

add_routes(app, bedrock_jcvd_chain, path="/bedrock-jcvd")
```

(Facultatif) Configurons maintenant LangSmith.
LangSmith nous aidera à tracer, surveiller et déboguer les applications LangChain.
Vous pouvez vous inscrire à LangSmith [ici](https://smith.langchain.com/).
Si vous n'avez pas accès, vous pouvez passer cette section.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si vous êtes dans ce répertoire, vous pouvez lancer une instance LangServe directement en exécutant :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles à l'adresse [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

Nous pouvons également accéder au playground à l'adresse [http://127.0.0.1:8000/bedrock-jcvd/playground](http://127.0.0.1:8000/bedrock-jcvd/playground)
