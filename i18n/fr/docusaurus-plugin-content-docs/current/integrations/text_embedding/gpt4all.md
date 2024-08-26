---
translated: true
---

# GPT4All

[GPT4All](https://gpt4all.io/index.html) est un chatbot gratuit, fonctionnant localement et respectueux de la vie privée. Aucun GPU ou connexion Internet n'est nécessaire. Il comprend des modèles populaires ainsi que ses propres modèles tels que GPT4All Falcon, Wizard, etc.

Ce notebook explique comment utiliser les [embeddings GPT4All](https://docs.gpt4all.io/gpt4all_python_embedding.html#gpt4all.gpt4all.Embed4All) avec LangChain.

## Installer les liaisons Python de GPT4All

```python
%pip install --upgrade --quiet  gpt4all > /dev/null
```

Remarque : il peut être nécessaire de redémarrer le noyau pour utiliser les packages mis à jour.

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

## Incorporer les données textuelles

```python
query_result = gpt4all_embd.embed_query(text)
```

Avec embed_documents, vous pouvez incorporer plusieurs morceaux de texte. Vous pouvez également mapper ces embeddings avec [Nomic's Atlas](https://docs.nomic.ai/index.html) pour voir une représentation visuelle de vos données.

```python
doc_result = gpt4all_embd.embed_documents([text])
```
