---
translated: true
---

# rag-chroma-multi-modal

Les LLM multimodaux permettent aux assistants visuels d'effectuer des questions-réponses sur les images.

Ce modèle crée un assistant visuel pour les présentations, qui contiennent souvent des éléments visuels tels que des graphiques ou des figures.

Il utilise les embeddings OpenCLIP pour incorporer toutes les images des diapositives et les stocke dans Chroma.

Étant donné une question, les diapositives pertinentes sont récupérées et transmises à GPT-4V pour la synthèse de la réponse.

## Entrée

Fournissez un jeu de diapositives au format pdf dans le répertoire `/docs`.

Par défaut, ce modèle a un jeu de diapositives sur les résultats du troisième trimestre de DataDog, une entreprise technologique publique.

Voici des exemples de questions à poser :

```text
How many customers does Datadog have?
What is Datadog platform % Y/Y growth in FY20, FY21, and FY22?
```

Pour créer un index du jeu de diapositives, exécutez :

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

L'application récupérera les images en fonction de la similarité entre l'entrée textuelle et l'image, qui sont toutes deux mappées dans l'espace d'embedding multimodal. Elle transmettra ensuite les images à GPT-4V.

## Configuration de l'environnement

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder à OpenAI GPT-4V.

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
Si vous n'avez pas accès, vous pouvez ignorer cette section.

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

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/rag-chroma-multi-modal/playground](http://127.0.0.1:8000/rag-chroma-multi-modal/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-chroma-multi-modal")
```
