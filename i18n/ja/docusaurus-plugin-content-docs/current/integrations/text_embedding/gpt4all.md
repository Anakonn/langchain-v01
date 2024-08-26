---
translated: true
---

# GPT4All

[GPT4All](https://gpt4all.io/index.html)は、無料で使用でき、ローカルで実行され、プライバシーに配慮したチャットボットです。GPUやインターネットは必要ありません。人気のモデルや、GPT4All Falcon、Wizardなどの独自のモデルを特徴としています。

このノートブックでは、[GPT4Allの埋め込み](https://docs.gpt4all.io/gpt4all_python_embedding.html#gpt4all.gpt4all.Embed4All)をLangChainで使用する方法を説明します。

## GPT4Allのpythonバインディングをインストールする

```python
%pip install --upgrade --quiet  gpt4all > /dev/null
```

注意: 更新されたパッケージを使用するには、カーネルを再起動する必要がある場合があります。

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

## テキストデータを埋め込む

```python
query_result = gpt4all_embd.embed_query(text)
```

embed_documentsを使用すると、複数のテキストを埋め込むことができます。また、これらの埋め込みを[Nomic's Atlas](https://docs.nomic.ai/index.html)にマッピングすることで、データの視覚的な表現を見ることができます。

```python
doc_result = gpt4all_embd.embed_documents([text])
```
