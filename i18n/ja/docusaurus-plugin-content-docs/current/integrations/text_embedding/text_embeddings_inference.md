---
translated: true
---

# テキストエンベディング推論

>[Hugging Face Text Embeddings Inference (TEI)](https://huggingface.co/docs/text-embeddings-inference/index)は、オープンソースのテキストエンベディングとシーケンス分類モデルをデプロイおよびサービングするためのツールキットです。`TEI`は、`FlagEmbedding`、`Ember`、`GTE`、`E5`などの最も人気のあるモデルに対して高性能な抽出を可能にします。

langchainで使用するには、まず`huggingface-hub`をインストールする必要があります。

```python
%pip install --upgrade huggingface-hub
```

次に、TEIを使ってエンベディングモデルを公開します。例えば、Dockerを使って`BAAI/bge-large-en-v1.5`を次のように提供できます:

```bash
model=BAAI/bge-large-en-v1.5
revision=refs/pr/5
volume=$PWD/data # share a volume with the Docker container to avoid downloading weights every run

docker run --gpus all -p 8080:80 -v $volume:/data --pull always ghcr.io/huggingface/text-embeddings-inference:0.6 --model-id $model --revision $revision
```

最後に、クライアントをインスタンス化し、テキストをエンベディングします。

```python
from langchain_community.embeddings import HuggingFaceHubEmbeddings
```

```python
embeddings = HuggingFaceHubEmbeddings(model="http://localhost:8080")
```

```python
text = "What is deep learning?"
```

```python
query_result = embeddings.embed_query(text)
query_result[:3]
```

```output
[0.018113142, 0.00302585, -0.049911194]
```

```python
doc_result = embeddings.embed_documents([text])
```

```python
doc_result[0][:3]
```

```output
[0.018113142, 0.00302585, -0.049911194]
```
