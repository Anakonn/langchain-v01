---
translated: true
---

# OpenLLM

[🦾 OpenLLM](https://github.com/bentoml/OpenLLM) は、本番環境で大規模言語モデル (LLM) を操作するためのオープンプラットフォームです。開発者は、任意のオープンソースの LLM でインファレンスを簡単に実行し、クラウドまたはオンプレミスにデプロイし、強力な AI アプリを構築できます。

## インストール

[PyPI](https://pypi.org/project/openllm/) から `openllm` をインストールします。

```python
%pip install --upgrade --quiet  openllm
```

## ローカルで OpenLLM サーバーを起動する

LLM サーバーを起動するには、`openllm start` コマンドを使用します。たとえば、dolly-v2 サーバーを起動するには、ターミナルから次のコマンドを実行します:

```bash
openllm start dolly-v2
```

## ラッパー

```python
from langchain_community.llms import OpenLLM

server_url = "http://localhost:3000"  # Replace with remote host if you are running on a remote server
llm = OpenLLM(server_url=server_url)
```

### オプション: ローカル LLM インファレンス

OpenLLM で管理される LLM をローカルのプロセスから初期化することもできます。これは開発目的に役立ち、開発者が異なるタイプの LLM を素早く試すことができます。

LLM アプリケーションを本番環境に移行する際は、OpenLLM サーバーを別途デプロイし、上記の `server_url` オプションを使ってアクセスすることをお勧めします。

LangChain ラッパーを使ってローカルで LLM を読み込むには:

```python
from langchain_community.llms import OpenLLM

llm = OpenLLM(
    model_name="dolly-v2",
    model_id="databricks/dolly-v2-3b",
    temperature=0.94,
    repetition_penalty=1.2,
)
```

### LLMChain と統合する

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

template = "What is a good name for a company that makes {product}?"

prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

generated = llm_chain.run(product="mechanical keyboard")
print(generated)
```

```output
iLkb
```
