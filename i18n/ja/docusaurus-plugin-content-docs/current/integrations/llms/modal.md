---
translated: true
---

# モーダル

[モーダルクラウドプラットフォーム](https://modal.com/docs/guide)は、ローカルコンピューターのPythonスクリプトから、サーバーレスクラウドコンピューティングにすぐにアクセスできるようにします。
`modal`を使用して、LLMAPIに依存するのではなく、独自のカスタムLLMモデルを実行できます。

この例では、LangChainを使用して、`modal` HTTPSの[ウェブエンドポイント](https://modal.com/docs/guide/webhooks)と対話する方法について説明します。

[_LangChainによる質問応答_](https://modal.com/docs/guide/ex/potus_speech_qanda)は、LangChainと`Modal`を組み合わせて使用する別の例です。その例では、ModalがエンドツーエンドのLangChainアプリケーションを実行し、OpenAIをLLMAPIとして使用しています。

```python
%pip install --upgrade --quiet  modal
```

```python
# Register an account with Modal and get a new token.

!modal token new
```

```output
Launching login page in your browser window...
If this is not showing up, please copy this URL into your web browser manually:
https://modal.com/token-flow/tf-Dzm3Y01234mqmm1234Vcu3
```

[`langchain.llms.modal.Modal`](https://github.com/langchain-ai/langchain/blame/master/langchain/llms/modal.py)統合クラスには、次のJSONインターフェイスに準拠したモーダルアプリケーションをデプロイする必要があります:

1. LLMプロンプトは、キー `"prompt"` の下の `str` 値として受け入れられます
2. LLM応答は、キー `"prompt"` の下の `str` 値として返されます

**リクエストJSONの例:**

```json
{
    "prompt": "Identify yourself, bot!",
    "extra": "args are allowed",
}
```

**レスポンスJSONの例:**

```json
{
    "prompt": "This is the LLM speaking",
}
```

このインターフェイスを満たす'ダミー'モーダルウェブエンドポイント関数の例は以下のとおりです。

```python
...
...

class Request(BaseModel):
    prompt: str

@stub.function()
@modal.web_endpoint(method="POST")
def web(request: Request):
    _ = request  # ignore input
    return {"prompt": "hello world"}
```

* このインターフェイスを満たすエンドポイントの設定の基本については、Modalの[ウェブエンドポイント](https://modal.com/docs/guide/webhooks#passing-arguments-to-web-endpoints)ガイドを参照してください。
* カスタムLLMの出発点として、Modalの['Falcon-40BをAutoGPTQで実行する'](https://modal.com/docs/guide/ex/falcon_gptq)オープンソースのLLMの例を参照してください。

デプロイされたモーダルウェブエンドポイントのURLを `langchain.llms.modal.Modal` LLMクラスに渡すことができます。このクラスは、チェーンの構築ブロックとして機能できます。

```python
from langchain.chains import LLMChain
from langchain_community.llms import Modal
from langchain_core.prompts import PromptTemplate
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
endpoint_url = "https://ecorp--custom-llm-endpoint.modal.run"  # REPLACE ME with your deployed Modal web endpoint's URL
llm = Modal(endpoint_url=endpoint_url)
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
