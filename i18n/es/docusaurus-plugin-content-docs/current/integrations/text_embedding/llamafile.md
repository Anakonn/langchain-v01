---
translated: true
---

# Archivo de llama

Vamos a cargar la clase [llamafile](https://github.com/Mozilla-Ocho/llamafile) Embeddings.

## Configuración

Primero, hay 3 pasos de configuración:

1. Descarga un archivo de llama. En este cuaderno, usamos `TinyLlama-1.1B-Chat-v1.0.Q5_K_M` pero hay muchos otros disponibles en [HuggingFace](https://huggingface.co/models?other=llamafile).
2. Haz que el archivo de llama sea ejecutable.
3. Inicia el archivo de llama en modo servidor.

Puedes ejecutar el siguiente script de bash para hacer todo esto:

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

## Incrustación de textos usando LlamafileEmbeddings

Ahora, podemos usar la clase `LlamafileEmbeddings` para interactuar con el servidor de archivos de llama que actualmente está sirviendo nuestro modelo TinyLlama en http://localhost:8080.

```python
from langchain_community.embeddings import LlamafileEmbeddings
```

```python
embedder = LlamafileEmbeddings()
```

```python
text = "This is a test document."
```

Para generar incrustaciones, puedes consultar un texto individual o puedes consultar una lista de textos.

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
