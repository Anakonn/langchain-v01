---
translated: true
---

# rag-aws-bedrock

Ce modèle est conçu pour se connecter au service AWS Bedrock, un serveur géré qui offre un ensemble de modèles de base.

Il utilise principalement `Anthropic Claude` pour la génération de texte et `Amazon Titan` pour l'intégration de texte, et utilise FAISS comme magasin de vecteurs.

Pour plus d'informations sur le pipeline RAG, reportez-vous à [ce notebook](https://github.com/aws-samples/amazon-bedrock-workshop/blob/main/03_QuestionAnswering/01_qa_w_rag_claude.ipynb).

## Configuration de l'environnement

Avant de pouvoir utiliser ce package, assurez-vous d'avoir configuré `boto3` pour fonctionner avec votre compte AWS.

Pour plus de détails sur la configuration de `boto3`, visitez [cette page](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html#configuration).

De plus, vous devez installer le package `faiss-cpu` pour travailler avec le magasin de vecteurs FAISS :

```bash
pip install faiss-cpu
```

Vous devez également définir les variables d'environnement suivantes pour refléter votre profil et votre région AWS (si vous n'utilisez pas le profil AWS `default` et la région `us-east-1`) :

* `AWS_DEFAULT_REGION`
* `AWS_PROFILE`

## Utilisation

Tout d'abord, installez l'interface en ligne de commande LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package :

```shell
langchain app new my-app --package rag-aws-bedrock
```

Pour ajouter ce package à un projet existant :

```shell
langchain app add rag-aws-bedrock
```

Ensuite, ajoutez le code suivant à votre fichier `server.py` :

```python
from rag_aws_bedrock import chain as rag_aws_bedrock_chain

add_routes(app, rag_aws_bedrock_chain, path="/rag-aws-bedrock")
```

(Facultatif) Si vous avez accès à LangSmith, vous pouvez le configurer pour tracer, surveiller et déboguer les applications LangChain. Si vous n'y avez pas accès, vous pouvez ignorer cette section.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si vous êtes dans ce répertoire, vous pouvez lancer une instance LangServe directement en :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur s'exécutant localement sur [http://localhost:8000](http://localhost:8000)

Vous pouvez voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) et accéder au playground sur [http://127.0.0.1:8000/rag-aws-bedrock/playground](http://127.0.0.1:8000/rag-aws-bedrock/playground).

Vous pouvez accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-aws-bedrock")
```
