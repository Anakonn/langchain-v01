---
translated: true
---

# rag-multi-modal-mv-local

La recherche visuelle est une application familière à de nombreuses personnes avec des iPhones ou des appareils Android. Elle permet à l'utilisateur de rechercher des photos à l'aide du langage naturel.

Avec la sortie de LLM multimodaux open source, il est possible de construire ce type d'application pour soi-même pour sa propre collection de photos privée.

Ce modèle montre comment effectuer une recherche visuelle privée et une réponse aux questions sur une collection de vos photos.

Il utilise un LLM multimodal open source de votre choix pour créer des résumés d'images pour chaque photo, les incorpore et les stocke dans Chroma.

Étant donné une question, les photos pertinentes sont récupérées et transmises au LLM multimodal pour la synthèse de la réponse.

## Entrée

Fournissez un ensemble de photos dans le répertoire `/docs`.

Par défaut, ce modèle a une collection de jouets de 3 photos de nourriture.

L'application recherchera et résumera les photos en fonction des mots-clés ou des questions fournis :

```text
What kind of ice cream did I have?
```

En pratique, un corpus d'images plus important peut être testé.

Pour créer un index des images, exécutez :

```shell
poetry install
python ingest.py
```

## Stockage

Voici le processus que le modèle utilisera pour créer un index des diapositives (voir [blog](https://blog.langchain.dev/multi-modal-rag-template/))) :

* Étant donné un ensemble d'images
* Il utilise un LLM multimodal local ([bakllava](https://ollama.ai/library/bakllava))) pour résumer chaque image
* Incorpore les résumés d'images avec un lien vers les images d'origine
* Étant donné une question d'utilisateur, il récupérera l'(les) image(s) pertinente(s) en fonction de la similarité entre le résumé de l'image et l'entrée de l'utilisateur (en utilisant les embeddings Ollama)
* Il transmettra ces images à bakllava pour la synthèse de la réponse

Par défaut, cela utilisera [LocalFileStore](https://python.langchain.com/docs/integrations/stores/file_system) pour stocker les images et Chroma pour stocker les résumés.

## Modèles LLM et d'embedding

Nous utiliserons [Ollama](https://python.langchain.com/docs/integrations/chat/ollama#multi-modal) pour générer des résumés d'images, des embeddings et la réponse finale à l'image.

Téléchargez la dernière version d'Ollama : https://ollama.ai/

Tirez un LLM multimodal open source : par exemple, https://ollama.ai/library/bakllava

Tirez un modèle d'embedding open source : par exemple, https://ollama.ai/library/llama2:7b

```shell
ollama pull bakllava
ollama pull llama2:7b
```

L'application est par défaut configurée pour `bakllava`. Mais vous pouvez changer cela dans `chain.py` et `ingest.py` pour différents modèles téléchargés.

L'application récupérera les images en fonction de la similarité entre l'entrée textuelle et le résumé de l'image, et transmettra les images à `bakllava`.

## Utilisation

Pour utiliser ce package, vous devriez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-multi-modal-mv-local
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-multi-modal-mv-local
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from rag_multi_modal_mv_local import chain as rag_multi_modal_mv_local_chain

add_routes(app, rag_multi_modal_mv_local_chain, path="/rag-multi-modal-mv-local")
```

(Facultatif) Configurons maintenant LangSmith.
LangSmith nous aidera à tracer, surveiller et déboguer les applications LangChain.
Vous pouvez vous inscrire à LangSmith [ici](https://smith.langchain.com/).
Si vous n'avez pas accès, vous pouvez sauter cette section.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si vous êtes dans ce répertoire, vous pouvez alors lancer une instance LangServe directement en :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur qui tourne localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/rag-multi-modal-mv-local/playground](http://127.0.0.1:8000/rag-multi-modal-mv-local/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-multi-modal-mv-local")
```
