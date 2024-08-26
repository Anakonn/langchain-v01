---
translated: true
---

# llamafile

[llamafile](https://github.com/Mozilla-Ocho/llamafile)エンベディングクラスをロードしましょう。

## セットアップ

最初に、3つのセットアップステップがあります:

1. llamafileをダウンロードします。このノートブックでは `TinyLlama-1.1B-Chat-v1.0.Q5_K_M` を使用しますが、[HuggingFace](https://huggingface.co/models?other=llamafile)で他にも多数利用可能です。
2. llamafileを実行可能にします。
3. llamafileをサーバーモードで起動します。

以下のbashスクリプトを実行してこれらすべてを行うことができます:

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

## LlamafileEmbeddingsを使用してテキストをエンベディングする

現在 http://localhost:8080 でサービスしている TinyLlama モデルと対話するために、`LlamafileEmbeddings` クラスを使用することができます。

```python
from langchain_community.embeddings import LlamafileEmbeddings
```

```python
embedder = LlamafileEmbeddings()
```

```python
text = "This is a test document."
```

エンベディングを生成するには、個別のテキストを照会するか、テキストのリストを照会することができます。

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
