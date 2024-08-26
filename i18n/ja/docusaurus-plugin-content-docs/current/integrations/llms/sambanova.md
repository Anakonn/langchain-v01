---
translated: true
---

# SambaNova

**[SambaNova](https://sambanova.ai/)の** [Sambaverse](https://sambaverse.sambanova.ai/)と[Sambastudio](https://sambanova.ai/technology/full-stack-ai-platform)は、オープンソースモデルを実行するためのプラットフォームです。

この例では、LangChainを使ってSambaNova
モデルとやり取りする方法を説明します。

## Sambaverse

**Sambaverse**では、複数のオープンソースモデルとやり取りできます。利用可能なモデルの一覧を表示し、[playground](https://sambaverse.sambanova.ai/playground)でそれらとやり取りすることができます。
**Sambaverseの無料オファリングは性能が制限されていることにご注意ください。** 生産性能、スループット、TCOが10倍低いSambaNova
の評価をご検討の企業は、[お問い合わせ](https://sambaverse.sambanova.ai/contact-us)ください。

SambaverseモデルにアクセスするにはAPIキーが必要です。キーを取得するには、[sambaverse.sambanova.ai](https://sambaverse.sambanova.ai/)でアカウントを作成してください。

ストリーミング予測を実行するには、[sseclient-py](https://pypi.org/project/sseclient-py/)パッケージが必要です。

```python
%pip install --quiet sseclient-py==1.8.0
```

APIキーを環境変数に登録します:

```python
import os

sambaverse_api_key = "<Your sambaverse API key>"

# Set the environment variables
os.environ["SAMBAVERSE_API_KEY"] = sambaverse_api_key
```

LangChainからSambaverseモデルを直接呼び出します!

```python
from langchain_community.llms.sambanova import Sambaverse

llm = Sambaverse(
    sambaverse_model_name="Meta/llama-2-7b-chat-hf",
    streaming=False,
    model_kwargs={
        "do_sample": True,
        "max_tokens_to_generate": 1000,
        "temperature": 0.01,
        "process_prompt": True,
        "select_expert": "llama-2-7b-chat-hf",
        # "repetition_penalty": {"type": "float", "value": "1"},
        # "top_k": {"type": "int", "value": "50"},
        # "top_p": {"type": "float", "value": "1"}
    },
)

print(llm.invoke("Why should I use open source models?"))
```

## SambaStudio

**SambaStudio**では、自分でファインチューニングしたオープンソースモデルの学習、バッチ推論、オンライン推論エンドポイントの展開ができます。

SambaStudio環境が必要でモデルを展開するには、[sambanova.ai/products/enterprise-ai-platform-sambanova-suite](https://sambanova.ai/products/enterprise-ai-platform-sambanova-suite)で詳細情報を確認してください。

ストリーミング予測を実行するには、[sseclient-py](https://pypi.org/project/sseclient-py/)パッケージが必要です。

```python
%pip install --quiet sseclient-py==1.8.0
```

環境変数を登録します:

```python
import os

sambastudio_base_url = "<Your SambaStudio environment URL>"
sambastudio_project_id = "<Your SambaStudio project id>"
sambastudio_endpoint_id = "<Your SambaStudio endpoint id>"
sambastudio_api_key = "<Your SambaStudio endpoint API key>"

# Set the environment variables
os.environ["SAMBASTUDIO_BASE_URL"] = sambastudio_base_url
os.environ["SAMBASTUDIO_PROJECT_ID"] = sambastudio_project_id
os.environ["SAMBASTUDIO_ENDPOINT_ID"] = sambastudio_endpoint_id
os.environ["SAMBASTUDIO_API_KEY"] = sambastudio_api_key
```

LangChainからSambaStudioモデルを直接呼び出します!

```python
from langchain_community.llms.sambanova import SambaStudio

llm = SambaStudio(
    streaming=False,
    model_kwargs={
        "do_sample": True,
        "max_tokens_to_generate": 1000,
        "temperature": 0.01,
        # "repetition_penalty": {"type": "float", "value": "1"},
        # "top_k": {"type": "int", "value": "50"},
        # "top_logprobs": {"type": "int", "value": "0"},
        # "top_p": {"type": "float", "value": "1"}
    },
)

print(llm.invoke("Why should I use open source models?"))
```
