---
translated: true
---

# llamafile

Chargeons la classe [llamafile](https://github.com/Mozilla-Ocho/llamafile) Embeddings.

## Configuration

Tout d'abord, il y a 3 étapes de configuration :

1. Télécharger un llamafile. Dans ce notebook, nous utilisons `TinyLlama-1.1B-Chat-v1.0.Q5_K_M` mais il en existe de nombreux autres disponibles sur [HuggingFace](https://huggingface.co/models?other=llamafile).
2. Rendre le llamafile exécutable.
3. Démarrer le llamafile en mode serveur.

Vous pouvez exécuter le script bash suivant pour faire tout cela :

```bash
%%bash
# llamafile setup

# Step 1: Download a llamafile. The download may take several minutes.
wget -nv -nc https://huggingface.co/jartine/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile

# Step 2: Make the llamafile executable. Note: if you're on Windows, just append '.exe' to the filename.
chmod +x TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile

# Step 3: Start llamafile server in background. All the server logs will be written to 'tinyllama.log'.
# Alternatively, you can just open a separate terminal outside this notebook and run:
#   ./TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile --server --nobrowser --embedding
./TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile --server --nobrowser --embedding > tinyllama.log 2>&1 &
pid=$!
echo "${pid}" > .llamafile_pid  # write the process pid to a file so we can terminate the server later
```

## Intégration de textes à l'aide de LlamafileEmbeddings

Maintenant, nous pouvons utiliser la classe `LlamafileEmbeddings` pour interagir avec le serveur llamafile qui dessert actuellement notre modèle TinyLlama à l'adresse http://localhost:8080.

```python
from langchain_community.embeddings import LlamafileEmbeddings
```

```python
embedder = LlamafileEmbeddings()
```

```python
text = "This is a test document."
```

Pour générer des intégrations, vous pouvez soit interroger un texte individuel, soit interroger une liste de textes.

```python
query_result = embedder.embed_query(text)
query_result[:5]
```

```python
doc_result = embedder.embed_documents([text])
doc_result[0][:5]
```

```bash
%%bash
# cleanup: kill the llamafile server process
kill $(cat .llamafile_pid)
rm .llamafile_pid
```
