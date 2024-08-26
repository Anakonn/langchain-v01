---
translated: true
---

# Yuan2.0

[Yuan2.0](https://github.com/IEIT-Yuan/Yuan-2.0)は、IEITシステムが開発した新世代の基本的な大規模言語モデルです。私たちは、Yuan 2.0-102B、Yuan 2.0-51B、Yuan 2.0-2Bの3つのモデルを公開しています。また、他の開発者のためのプリトレーニング、ファインチューニング、推論サービスのための関連スクリプトも提供しています。Yuan2.0は、Yuan1.0をベースにしており、より広範囲の高品質なプリトレーニングデータと命令ファインチューニングデータセットを利用して、モデルの意味、数学、推論、コード、知識などの理解を強化しています。

この例では、LangChainを使って`Yuan2.0`(2B/51B/102B)の推論を使ってテキスト生成を行う方法を説明します。

Yuan2.0は推論サービスを設定しているので、ユーザーは推論APIをリクエストするだけで結果を得ることができます。これは[Yuan2.0 Inference-Server](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/docs/inference_server.md)で紹介されています。

```python
from langchain.chains import LLMChain
from langchain_community.llms.yuan2 import Yuan2
```

```python
# default infer_api for a local deployed Yuan2.0 inference server
infer_api = "http://127.0.0.1:8000/yuan"

# direct access endpoint in a proxied environment
# import os
# os.environ["no_proxy"]="localhost,127.0.0.1,::1"

yuan_llm = Yuan2(
    infer_api=infer_api,
    max_tokens=2048,
    temp=1.0,
    top_p=0.9,
    use_history=False,
)

# turn on use_history only when you want the Yuan2.0 to keep track of the conversation history
# and send the accumulated context to the backend model api, which make it stateful. By default it is stateless.
# llm.use_history = True
```

```python
question = "请介绍一下中国。"
```

```python
print(yuan_llm.invoke(question))
```
