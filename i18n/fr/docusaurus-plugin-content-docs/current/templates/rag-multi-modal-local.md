---
translated: true
---

# rag-multi-modal-local

La recherche visuelle est une application familière pour de nombreuses personnes avec des iPhones ou des appareils Android. Elle permet à l'utilisateur de rechercher des photos à l'aide du langage naturel.

Avec la sortie des LLM multimodaux open source, il est possible de construire ce type d'application pour soi-même pour sa propre collection de photos privée.

Ce modèle montre comment effectuer une recherche visuelle privée et une réponse à des questions sur une collection de vos photos.

Il utilise les embeddings OpenCLIP pour incorporer toutes les photos et les stocker dans Chroma.

Étant donné une question, les photos pertinentes sont récupérées et transmises à un LLM multimodal open source de votre choix pour la synthèse de la réponse.

## Entrée

Fournissez un ensemble de photos dans le répertoire `/docs`.

Par défaut, ce modèle a une collection de jouets de 3 photos de nourriture.

Exemples de questions à poser :

```text
What kind of soft serve did I have?
```

En pratique, un corpus d'images plus important peut être testé.

Pour créer un index des images, exécutez :

```shell
poetry install
python ingest.py
```

## Stockage

Ce modèle utilisera les embeddings multimodaux [OpenCLIP](https://github.com/mlfoundations/open_clip) pour incorporer les images.

Vous pouvez sélectionner différentes options de modèle d'embedding (voir les résultats [ici](https://github.com/mlfoundations/open_clip/blob/main/docs/openclip_results.csv))).

La première fois que vous exécuterez l'application, elle téléchargera automatiquement le modèle d'embedding multimodal.

Par défaut, LangChain utilisera un modèle d'embedding avec des performances modérées mais des exigences de mémoire plus faibles, `ViT-H-14`.

Vous pouvez choisir d'autres modèles `OpenCLIPEmbeddings` dans `rag_chroma_multi_modal/ingest.py` :

```python
vectorstore_mmembd = Chroma(
    collection_name="multi-modal-rag",
    persist_directory=str(re_vectorstore_path),
    embedding_function=OpenCLIPEmbeddings(
        model_name="ViT-H-14", checkpoint="laion2b_s32b_b79k"
    ),
)
```

## LLM

Ce modèle utilisera [Ollama](https://python.langchain.com/docs/integrations/chat/ollama#multi-modal).

Téléchargez la dernière version d'Ollama : https://ollama.ai/

Tirez un LLM multimodal open source : par exemple, https://ollama.ai/library/bakllava

```shell
ollama pull bakllava
```

L'application est par défaut configurée pour `bakllava`. Mais vous pouvez la modifier dans `chain.py` et `ingest.py` pour différents modèles téléchargés.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-chroma-multi-modal
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-chroma-multi-modal
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from rag_chroma_multi_modal import chain as rag_chroma_multi_modal_chain

add_routes(app, rag_chroma_multi_modal_chain, path="/rag-chroma-multi-modal")
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
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/rag-chroma-multi-modal/playground](http://127.0.0.1:8000/rag-chroma-multi-modal/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-chroma-multi-modal")
```
