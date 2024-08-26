---
translated: true
---

# Exemple RAG sur Intel Xeon

Ce modèle effectue le RAG à l'aide de Chroma et de Text Generation Inference sur les processeurs Intel® Xeon® Scalable.
Les processeurs Intel® Xeon® Scalable sont dotés d'accélérateurs intégrés pour une performance par cœur plus élevée et des performances IA inégalées, avec des technologies de sécurité avancées pour répondre aux exigences des charges de travail les plus demandées - tout en offrant le plus grand choix de cloud et la portabilité des applications, veuillez vérifier [Intel® Xeon® Scalable Processors](https://www.intel.com/content/www/us/en/products/details/processors/xeon/scalable.html).

## Configuration de l'environnement

Pour utiliser [🤗 text-generation-inference](https://github.com/huggingface/text-generation-inference) sur les processeurs Intel® Xeon® Scalable, veuillez suivre ces étapes :

### Lancer une instance de serveur local sur un serveur Intel Xeon :

```bash
model=Intel/neural-chat-7b-v3-3
volume=$PWD/data # share a volume with the Docker container to avoid downloading weights every run

docker run --shm-size 1g -p 8080:80 -v $volume:/data ghcr.io/huggingface/text-generation-inference:1.4 --model-id $model
```

Pour les modèles gated comme `LLAMA-2`, vous devrez passer -e HUGGING_FACE_HUB_TOKEN=\<token\> à la commande docker run ci-dessus avec un jeton de lecture valide Hugging Face Hub.

Veuillez suivre ce lien [jeton huggingface](https://huggingface.co/docs/hub/security-tokens) pour obtenir le jeton d'accès et exporter `HUGGINGFACEHUB_API_TOKEN` avec le jeton.

```bash
export HUGGINGFACEHUB_API_TOKEN=<token>
```

Envoyez une requête pour vérifier si le point de terminaison fonctionne :

```bash
curl localhost:8080/generate -X POST -d '{"inputs":"Which NFL team won the Super Bowl in the 2010 season?","parameters":{"max_new_tokens":128, "do_sample": true}}'   -H 'Content-Type: application/json'
```

Pour plus de détails, veuillez vous référer à [text-generation-inference](https://github.com/huggingface/text-generation-inference).

## Remplissage avec des données

Si vous voulez remplir la base de données avec quelques données d'exemple, vous pouvez exécuter les commandes ci-dessous :

```shell
poetry install
poetry run python ingest.py
```

Le script traite et stocke les sections des données des rapports 10k d'Edgar pour Nike `nke-10k-2023.pdf` dans une base de données Chroma.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package intel-rag-xeon
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add intel-rag-xeon
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from intel_rag_xeon import chain as xeon_rag_chain

add_routes(app, xeon_rag_chain, path="/intel-rag-xeon")
```

(Facultatif) Configurons maintenant LangSmith. LangSmith nous aidera à tracer, surveiller et déboguer les applications LangChain. Vous pouvez vous inscrire à LangSmith [ici](https://smith.langchain.com/). Si vous n'avez pas accès, vous pouvez sauter cette section.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si vous êtes dans ce répertoire, vous pouvez alors démarrer une instance LangServe directement en :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur qui tourne localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/intel-rag-xeon/playground](http://127.0.0.1:8000/intel-rag-xeon/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/intel-rag-xeon")
```
