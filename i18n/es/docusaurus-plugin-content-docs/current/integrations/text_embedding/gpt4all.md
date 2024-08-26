---
translated: true
---

# GPT4All

[GPT4All](https://gpt4all.io/index.html) es un chatbot de uso gratuito, que se ejecuta localmente y es consciente de la privacidad. No se requiere GPU ni Internet. Presenta modelos populares y sus propios modelos como GPT4All Falcon, Wizard, etc.

Este cuaderno explica cómo usar [GPT4All embeddings](https://docs.gpt4all.io/gpt4all_python_embedding.html#gpt4all.gpt4all.Embed4All) con LangChain.

## Instalar los enlaces de Python de GPT4All

```python
%pip install --upgrade --quiet  gpt4all > /dev/null
```

Nota: es posible que necesites reiniciar el kernel para usar los paquetes actualizados.

```python
from langchain_community.embeddings import GPT4AllEmbeddings
```

```python
gpt4all_embd = GPT4AllEmbeddings()
```

```output
100%|████████████████████████| 45.5M/45.5M [00:02<00:00, 18.5MiB/s]

Model downloaded at:  /Users/rlm/.cache/gpt4all/ggml-all-MiniLM-L6-v2-f16.bin

objc[45711]: Class GGMLMetalClass is implemented in both /Users/rlm/anaconda3/envs/lcn2/lib/python3.9/site-packages/gpt4all/llmodel_DO_NOT_MODIFY/build/libreplit-mainline-metal.dylib (0x29fe18208) and /Users/rlm/anaconda3/envs/lcn2/lib/python3.9/site-packages/gpt4all/llmodel_DO_NOT_MODIFY/build/libllamamodel-mainline-metal.dylib (0x2a0244208). One of the two will be used. Which one is undefined.
```

```python
text = "This is a test document."
```

## Incrustar los datos textuales

```python
query_result = gpt4all_embd.embed_query(text)
```

Con embed_documents puedes incrustar múltiples piezas de texto. También puedes mapear estos incrustaciones con [Nomic's Atlas](https://docs.nomic.ai/index.html) para ver una representación visual de tus datos.

```python
doc_result = gpt4all_embd.embed_documents([text])
```
