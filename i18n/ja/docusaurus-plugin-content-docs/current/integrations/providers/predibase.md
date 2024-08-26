---
translated: true
---

# Predibase

Predibaseの使用方法をLangChainでモデルを使って学びます。

## セットアップ

- [Predibase](https://predibase.com/)アカウントと[APIキー](https://docs.predibase.com/sdk-guide/intro)を作成します。
- `pip install predibase`でPredibaseのPythonクライアントをインストールします。
- APIキーを使って認証します。

### LLM

PredibaseはLangChainのLLMモジュールを実装しています。以下に短い例を示します。または、LLM > Integrations > Predibaseの下にあるフルノートブックを参照してください。

```python
<!--IMPORTS:[{"imported": "Predibase", "source": "langchain_community.llms", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_community.llms.predibase.Predibase.html", "title": "Predibase"}]-->
import os
os.environ["PREDIBASE_API_TOKEN"] = "{PREDIBASE_API_TOKEN}"

from langchain_community.llms import Predibase

model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
)

response = model.invoke("Can you recommend me a nice dry wine?")
print(response)
```

Predibaseは、`model`引数で指定されたベースモデルに微調整されたPredibase hostedおよびHuggingFace hostedアダプターもサポートしています:

```python
<!--IMPORTS:[{"imported": "Predibase", "source": "langchain_community.llms", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_community.llms.predibase.Predibase.html", "title": "Predibase"}]-->
import os
os.environ["PREDIBASE_API_TOKEN"] = "{PREDIBASE_API_TOKEN}"

from langchain_community.llms import Predibase

# The fine-tuned adapter is hosted at Predibase (adapter_version must be specified).
model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
    adapter_id="e2e_nlg",
    adapter_version=1,
)

response = model.invoke("Can you recommend me a nice dry wine?")
print(response)
```

Predibaseは、`model`引数で指定されたベースモデルに微調整されたアダプターもサポートしています:

```python
<!--IMPORTS:[{"imported": "Predibase", "source": "langchain_community.llms", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_community.llms.predibase.Predibase.html", "title": "Predibase"}]-->
import os
os.environ["PREDIBASE_API_TOKEN"] = "{PREDIBASE_API_TOKEN}"

from langchain_community.llms import Predibase

# The fine-tuned adapter is hosted at HuggingFace (adapter_version does not apply and will be ignored).
model = Predibase(
    model="mistral-7b",
    predibase_api_key=os.environ.get("PREDIBASE_API_TOKEN"),
    predibase_sdk_version=None,  # optional parameter (defaults to the latest Predibase SDK version if omitted)
    adapter_id="predibase/e2e_nlg",
)

response = model.invoke("Can you recommend me a nice dry wine?")
print(response)
```
