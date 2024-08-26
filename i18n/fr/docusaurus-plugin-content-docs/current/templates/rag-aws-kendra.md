---
translated: true
---

# rag-aws-kendra

Ce modèle est une application qui utilise Amazon Kendra, un service de recherche alimenté par l'apprentissage automatique, et Anthropic Claude pour la génération de texte. L'application récupère des documents à l'aide d'une chaîne de récupération pour répondre aux questions à partir de vos documents.

Il utilise la bibliothèque `boto3` pour se connecter au service Bedrock.

Pour plus d'informations sur la construction d'applications RAG avec Amazon Kendra, consultez [cette page](https://aws.amazon.com/blogs/machine-learning/quickly-build-high-accuracy-generative-ai-applications-on-enterprise-data-using-amazon-kendra-langchain-and-large-language-models/).

## Configuration de l'environnement

Assurez-vous de configurer et de configurer `boto3` pour qu'il fonctionne avec votre compte AWS.

Vous pouvez suivre le guide [ici](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html#configuration).

Vous devez également avoir un index Kendra configuré avant d'utiliser ce modèle.

Vous pouvez utiliser [ce modèle Cloudformation](https://github.com/aws-samples/amazon-kendra-langchain-extensions/blob/main/kendra_retriever_samples/kendra-docs-index.yaml) pour créer un index d'exemple.

Cela inclut des données d'exemple contenant la documentation en ligne d'AWS pour Amazon Kendra, Amazon Lex et Amazon SageMaker. Vous pouvez également utiliser votre propre index Amazon Kendra si vous avez indexé votre propre jeu de données.

Les variables d'environnement suivantes doivent être définies :

* `AWS_DEFAULT_REGION` - Cela doit refléter la région AWS correcte. La valeur par défaut est `us-east-1`.
* `AWS_PROFILE` - Cela doit refléter votre profil AWS. La valeur par défaut est `default`.
* `KENDRA_INDEX_ID` - Cela doit avoir l'ID d'index de l'index Kendra. Notez que l'ID d'index est une valeur alphanumérique de 36 caractères qui peut être trouvée dans la page de détails de l'index.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir le CLI LangChain installé :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-aws-kendra
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-aws-kendra
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from rag_aws_kendra.chain import chain as rag_aws_kendra_chain

add_routes(app, rag_aws_kendra_chain, path="/rag-aws-kendra")
```

(Facultatif) Configurons maintenant LangSmith.
LangSmith nous aidera à tracer, surveiller et déboguer les applications LangChain.
Vous pouvez vous inscrire à LangSmith [ici](https://smith.langchain.com/).
Si vous n'avez pas accès, vous pouvez ignorer cette section.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si vous êtes dans ce répertoire, vous pouvez lancer une instance LangServe directement en :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur s'exécutant localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/rag-aws-kendra/playground](http://127.0.0.1:8000/rag-aws-kendra/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-aws-kendra")
```
