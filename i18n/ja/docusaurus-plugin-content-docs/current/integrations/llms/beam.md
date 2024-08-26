---
translated: true
---

# ビーム

GPT2 LLMのクラウドデプロイメントのインスタンスを展開し、後続の呼び出しを行うためのBeamAPIラッパーを呼び出します。BeamライブラリのインストールとBeamクライアントIDおよびクライアントシークレットの登録が必要です。ラッパーを呼び出すことで、モデルのインスタンスが作成され実行され、プロンプトに関連するテキストが返されます。その後、直接BeamAPIを呼び出すことで、追加の呼び出しを行うことができます。

[アカウントを作成する](https://www.beam.cloud/)、まだ持っていない場合。[ダッシュボード](https://www.beam.cloud/dashboard/settings/api-keys)からAPIキーを取得してください。

Beam CLIをインストールします

```python
!curl https://raw.githubusercontent.com/slai-labs/get-beam/main/get-beam.sh -sSfL | sh
```

APIキーを登録し、beam クライアントIDとシークレットの環境変数を設定します:

```python
import os

beam_client_id = "<Your beam client id>"
beam_client_secret = "<Your beam client secret>"

# Set the environment variables
os.environ["BEAM_CLIENT_ID"] = beam_client_id
os.environ["BEAM_CLIENT_SECRET"] = beam_client_secret

# Run the beam configure command
!beam configure --clientId={beam_client_id} --clientSecret={beam_client_secret}
```

Beam SDKをインストールします:

```python
%pip install --upgrade --quiet  beam-sdk
```

**langchainから直接ビームを展開し、呼び出します!**

レスポンスを返すまでに数分かかる可能性がありますが、その後の呼び出しは高速になります!

```python
from langchain_community.llms.beam import Beam

llm = Beam(
    model_name="gpt2",
    name="langchain-gpt2-test",
    cpu=8,
    memory="32Gi",
    gpu="A10G",
    python_version="python3.8",
    python_packages=[
        "diffusers[torch]>=0.10",
        "transformers",
        "torch",
        "pillow",
        "accelerate",
        "safetensors",
        "xformers",
    ],
    max_length="50",
    verbose=False,
)

llm._deploy()

response = llm._call("Running machine learning on a remote GPU")

print(response)
```
