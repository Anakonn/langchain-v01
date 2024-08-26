---
translated: true
---

# Eden AI

Eden AIは、最高のAIプロバイダーを統合することで、AIの可能性を無限大に広げ、人工知能の真の潜在力を引き出すことを可能にしています。包括的で面倒な手間のかからないワンストップのプラットフォームにより、ユーザーはAI機能をわずかな時間で本番環境に展開でき、単一のAPIを通じてAI機能の全範囲にアクセスできるようになります。(ウェブサイト: https://edenai.co/)

このサンプルでは、LangChainを使ってEden AIモデルとやり取りする方法を説明します。

-----------------------------------------------------------------------------------

Eden AIのAPIにアクセスするには、APIキーが必要です。

アカウントを作成 https://app.edenai.run/user/register してこちらに進むことで、APIキーを取得できます https://app.edenai.run/admin/account/settings

キーを取得したら、次のように環境変数に設定します:

```bash
export EDENAI_API_KEY="..."
```

環境変数を設定したくない場合は、EdenAI LLMクラスのインスタンス化時に、edenai_api_keyパラメーターでキーを直接渡すこともできます。

```python
from langchain_community.llms import EdenAI
```

```python
llm = EdenAI(edenai_api_key="...", provider="openai", temperature=0.2, max_tokens=250)
```

## モデルの呼び出し

Eden AIのAPIは、さまざまなプロバイダーを統合しており、それぞれが複数のモデルを提供しています。

特定のモデルにアクセスするには、インスタンス化時に'model'を追加するだけです。

たとえば、OpenAIのモデル、GPT3.5を探ってみましょう。

### テキスト生成

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

llm = EdenAI(
    feature="text",
    provider="openai",
    model="gpt-3.5-turbo-instruct",
    temperature=0.2,
    max_tokens=250,
)

prompt = """
User: Answer the following yes/no question by reasoning step by step. Can a dog drive a car?
Assistant:
"""

llm(prompt)
```

### 画像生成

```python
import base64
from io import BytesIO

from PIL import Image


def print_base64_image(base64_string):
    # Decode the base64 string into binary data
    decoded_data = base64.b64decode(base64_string)

    # Create an in-memory stream to read the binary data
    image_stream = BytesIO(decoded_data)

    # Open the image using PIL
    image = Image.open(image_stream)

    # Display the image
    image.show()
```

```python
text2image = EdenAI(feature="image", provider="openai", resolution="512x512")
```

```python
image_output = text2image("A cat riding a motorcycle by Picasso")
```

```python
print_base64_image(image_output)
```

### コールバック付きのテキスト生成

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_community.llms import EdenAI

llm = EdenAI(
    callbacks=[StreamingStdOutCallbackHandler()],
    feature="text",
    provider="openai",
    temperature=0.2,
    max_tokens=250,
)
prompt = """
User: Answer the following yes/no question by reasoning step by step. Can a dog drive a car?
Assistant:
"""
print(llm.invoke(prompt))
```

## 呼び出しのチェーン

```python
from langchain.chains import LLMChain, SimpleSequentialChain
from langchain_core.prompts import PromptTemplate
```

```python
llm = EdenAI(feature="text", provider="openai", temperature=0.2, max_tokens=250)
text2image = EdenAI(feature="image", provider="openai", resolution="512x512")
```

```python
prompt = PromptTemplate(
    input_variables=["product"],
    template="What is a good name for a company that makes {product}?",
)

chain = LLMChain(llm=llm, prompt=prompt)
```

```python
second_prompt = PromptTemplate(
    input_variables=["company_name"],
    template="Write a description of a logo for this company: {company_name}, the logo should not contain text at all ",
)
chain_two = LLMChain(llm=llm, prompt=second_prompt)
```

```python
third_prompt = PromptTemplate(
    input_variables=["company_logo_description"],
    template="{company_logo_description}",
)
chain_three = LLMChain(llm=text2image, prompt=third_prompt)
```

```python
# Run the chain specifying only the input variable for the first chain.
overall_chain = SimpleSequentialChain(
    chains=[chain, chain_two, chain_three], verbose=True
)
output = overall_chain.run("hats")
```

```python
# print the image
print_base64_image(output)
```
