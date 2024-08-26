---
translated: true
---

# Amazon Comprehend Moderation Chain

>[Amazon Comprehend](https://aws.amazon.com/comprehend/)は、機械学習を使って文章から価値のある洞察と関係性を引き出す自然言語処理(NLP)サービスです。

このノートブックでは、`Amazon Comprehend`を使って`個人を特定できる情報`(`PII`)とトキシシティを検出し、処理する方法を示します。

## 設定

```python
%pip install --upgrade --quiet  boto3 nltk
```

```python
%pip install --upgrade --quiet  langchain_experimental
```

```python
%pip install --upgrade --quiet  langchain pydantic
```

```python
import os

import boto3

comprehend_client = boto3.client("comprehend", region_name="us-east-1")
```

```python
from langchain_experimental.comprehend_moderation import AmazonComprehendModerationChain

comprehend_moderation = AmazonComprehendModerationChain(
    client=comprehend_client,
    verbose=True,  # optional
)
```

## LLMチェーンでAmazonComprehendModerationChainを使う

**注意**: 以下の例では_Fake LLM_を使用していますが、同じ概念を他のLLMにも適用できます。

```python
from langchain_community.llms.fake import FakeListLLM
from langchain_core.prompts import PromptTemplate
from langchain_experimental.comprehend_moderation.base_moderation_exceptions import (
    ModerationPiiError,
)

template = """Question: {question}

Answer:"""

prompt = PromptTemplate.from_template(template)

responses = [
    "Final Answer: A credit card number looks like 1289-2321-1123-2387. A fake SSN number looks like 323-22-9980. John Doe's phone number is (999)253-9876.",
    # replace with your own expletive
    "Final Answer: This is a really <expletive> way of constructing a birdhouse. This is <expletive> insane to think that any birds would actually create their <expletive> nests here.",
]
llm = FakeListLLM(responses=responses)

chain = (
    prompt
    | comprehend_moderation
    | {"input": (lambda x: x["output"]) | llm}
    | comprehend_moderation
)

try:
    response = chain.invoke(
        {
            "question": "A sample SSN number looks like this 123-22-3345. Can you give me some more samples?"
        }
    )
except ModerationPiiError as e:
    print(str(e))
else:
    print(response["output"])
```

## `moderation_config`を使ってモデレーションをカスタマイズする

Amazon Comprehend Moderationを設定を使って使用することで、どのようなモデレーションを行うか、各モデレーションに対してどのような処理を行うかをコントロールできます。上記のデモンストレーションでは、設定を渡していないため、以下の3つのモデレーションが行われます:

- PII (個人を特定できる情報)のチェック
- トキシシティコンテンツの検出
- プロンプトセーフティの検出

以下は、モデレーション設定の例です。

```python
from langchain_experimental.comprehend_moderation import (
    BaseModerationConfig,
    ModerationPiiConfig,
    ModerationPromptSafetyConfig,
    ModerationToxicityConfig,
)

pii_config = ModerationPiiConfig(labels=["SSN"], redact=True, mask_character="X")

toxicity_config = ModerationToxicityConfig(threshold=0.5)

prompt_safety_config = ModerationPromptSafetyConfig(threshold=0.5)

moderation_config = BaseModerationConfig(
    filters=[pii_config, toxicity_config, prompt_safety_config]
)
```

設定の中核にあるのは、以下の3つの設定モデルです。

- `ModerationPiiConfig` - PIIバリデーションの動作を設定するために使用します。以下のパラメーターで初期化できます:
  - `labels` - PIIエンティティのラベル。デフォルトは空のリストで、すべてのPIIエンティティを考慮します。
  - `threshold` - 検出されたエンティティの信頼度しきい値。デフォルトは0.5(50%)です。
  - `redact` - テキストの上書きを行うかどうかのフラグ。デフォルトは`False`です。`False`の場合、PIIエンティティが検出されるとエラーが発生します。`True`の場合は、PII値をマスクします。
  - `mask_character` - マスキングに使用する文字。デフォルトはアスタリスク(*)です。
- `ModerationToxicityConfig` - トキシシティバリデーションの動作を設定するために使用します。以下のパラメーターで初期化できます:
  - `labels` - トキシックエンティティのラベル。デフォルトは空のリストで、すべてのトキシックエンティティを考慮します。
  - `threshold` - 検出されたエンティティの信頼度しきい値。デフォルトは0.5(50%)です。
- `ModerationPromptSafetyConfig` - プロンプトセーフティバリデーションの動作を設定するために使用します:
  - `threshold` - プロンプトセーフティ分類の信頼度しきい値。デフォルトは0.5(50%)です。

最後に、`BaseModerationConfig`を使って、これらのチェックを実行する順序を定義します。`BaseModerationConfig`には、オプションの`filters`パラメーターがあり、上記のバリデーションチェックのリストを指定できます。`BaseModerationConfig`は、`filters`なしで初期化することもでき、その場合はデフォルト設定のすべてのチェックが使用されます。

前のセルの設定を使用すると、PIIチェックが実行され、プロンプトは通過しますが、プロンプトやLLM出力に含まれるSSN番号がマスクされます。

```python
comp_moderation_with_config = AmazonComprehendModerationChain(
    moderation_config=moderation_config,  # specify the configuration
    client=comprehend_client,  # optionally pass the Boto3 Client
    verbose=True,
)
```

```python
from langchain_community.llms.fake import FakeListLLM
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer:"""

prompt = PromptTemplate.from_template(template)

responses = [
    "Final Answer: A credit card number looks like 1289-2321-1123-2387. A fake SSN number looks like 323-22-9980. John Doe's phone number is (999)253-9876.",
    # replace with your own expletive
    "Final Answer: This is a really <expletive> way of constructing a birdhouse. This is <expletive> insane to think that any birds would actually create their <expletive> nests here.",
]
llm = FakeListLLM(responses=responses)

chain = (
    prompt
    | comp_moderation_with_config
    | {"input": (lambda x: x["output"]) | llm}
    | comp_moderation_with_config
)


try:
    response = chain.invoke(
        {
            "question": "A sample SSN number looks like this 123-45-7890. Can you give me some more samples?"
        }
    )
except Exception as e:
    print(str(e))
else:
    print(response["output"])
```

## ユニークID、およびモデレーションコールバック

Amazon Comprehendのモデレーションアクションが設定されたエンティティのいずれかを識別すると、チェーンは次のいずれかの例外を発生させます。
    - `ModerationPiiError`、PIIチェックの場合
    - `ModerationToxicityError`、Toxicityチェックの場合
    - `ModerationPromptSafetyError`、Prompt Safetyチェックの場合

モデレーション設定に加えて、`AmazonComprehendModerationChain`は次のパラメーターでも初期化できます。

- `unique_id` [オプション] 文字列パラメーター。この引数には任意の文字列値やIDを渡すことができます。例えば、チャットアプリケーションで悪質なユーザーを追跡したい場合は、ユーザー名やメールアドレスなどを渡すことができます。デフォルトは `None` です。

- `moderation_callback` [オプション] 非同期的に呼び出される (チェーンにブロックされない) `BaseModerationCallbackHandler`。コールバック関数は、モデレーション機能が実行されたときに追加のアクションを実行したい場合に便利です。例えばデータベースへのログ記録やログファイルの書き込みなどです。`BaseModerationCallbackHandler`をサブクラス化することで、`on_after_pii()`、`on_after_toxicity()`、`on_after_prompt_safety()`の3つの関数をオーバーライドできます。これらの関数はすべて `async` 関数である必要があります。これらのコールバック関数には2つの引数が渡されます。
    - `moderation_beacon` モデレーション機能に関する情報、Amazon Comprehendモデルからの完全な応答、ユニークなチェーンID、モデレーションステータス、検証された入力文字列を含む辞書。辞書のスキーマは以下の通りです。

    ```
    {
        'moderation_chain_id': 'xxx-xxx-xxx', # ユニークなチェーンID
        'moderation_type': 'Toxicity' | 'PII' | 'PromptSafety',
        'moderation_status': 'LABELS_FOUND' | 'LABELS_NOT_FOUND',
        'moderation_input': '123-456-7890のようなサンプルのSSN番号です。もっと例を教えてください。',
        'moderation_output': {...} #完全なAmazon Comprehend PII、Toxicity、またはPrompt Safetyモデルの出力
    }
    ```

    - `unique_id` `AmazonComprehendModerationChain`に渡された場合

<div class="alert alert-block alert-info"> <b>注意:</b> <code>moderation_callback</code>はLangChainのチェーンコールバックとは異なります。 <code>AmazonComprehendModerationChain</code>でもLangChainのチェーンコールバックを使用できます。例:
<pre>
from langchain.callbacks.stdout import StdOutCallbackHandler
comp_moderation_with_config = AmazonComprehendModerationChain(verbose=True, callbacks=[StdOutCallbackHandler()])
</pre>
</div>

```python
from langchain_experimental.comprehend_moderation import BaseModerationCallbackHandler
```

```python
# Define callback handlers by subclassing BaseModerationCallbackHandler


class MyModCallback(BaseModerationCallbackHandler):
    async def on_after_pii(self, output_beacon, unique_id):
        import json

        moderation_type = output_beacon["moderation_type"]
        chain_id = output_beacon["moderation_chain_id"]
        with open(f"output-{moderation_type}-{chain_id}.json", "w") as file:
            data = {"beacon_data": output_beacon, "unique_id": unique_id}
            json.dump(data, file)

    """
    async def on_after_toxicity(self, output_beacon, unique_id):
        pass

    async def on_after_prompt_safety(self, output_beacon, unique_id):
        pass
    """


my_callback = MyModCallback()
```

```python
pii_config = ModerationPiiConfig(labels=["SSN"], redact=True, mask_character="X")

toxicity_config = ModerationToxicityConfig(threshold=0.5)

moderation_config = BaseModerationConfig(filters=[pii_config, toxicity_config])

comp_moderation_with_config = AmazonComprehendModerationChain(
    moderation_config=moderation_config,  # specify the configuration
    client=comprehend_client,  # optionally pass the Boto3 Client
    unique_id="john.doe@email.com",  # A unique ID
    moderation_callback=my_callback,  # BaseModerationCallbackHandler
    verbose=True,
)
```

```python
from langchain_community.llms.fake import FakeListLLM
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer:"""

prompt = PromptTemplate.from_template(template)

responses = [
    "Final Answer: A credit card number looks like 1289-2321-1123-2387. A fake SSN number looks like 323-22-9980. John Doe's phone number is (999)253-9876.",
    # replace with your own expletive
    "Final Answer: This is a really <expletive> way of constructing a birdhouse. This is <expletive> insane to think that any birds would actually create their <expletive> nests here.",
]

llm = FakeListLLM(responses=responses)

chain = (
    prompt
    | comp_moderation_with_config
    | {"input": (lambda x: x["output"]) | llm}
    | comp_moderation_with_config
)

try:
    response = chain.invoke(
        {
            "question": "A sample SSN number looks like this 123-456-7890. Can you give me some more samples?"
        }
    )
except Exception as e:
    print(str(e))
else:
    print(response["output"])
```

## `moderation_config` と moderation 実行順序

`AmazonComprehendModerationChain` が `moderation_config` で初期化されていない場合は、デフォルト値の `BaseModerationConfig` で初期化されます。`filters` を使用していない場合、moderation チェックの順序は次のようになります。

```text
AmazonComprehendModerationChain
│
└──Check PII with Stop Action
    ├── Callback (if available)
    ├── Label Found ⟶ [Error Stop]
    └── No Label Found
        └──Check Toxicity with Stop Action
            ├── Callback (if available)
            ├── Label Found ⟶ [Error Stop]
            └── No Label Found
                └──Check Prompt Safety with Stop Action
                    ├── Callback (if available)
                    ├── Label Found ⟶ [Error Stop]
                    └── No Label Found
                        └── Return Prompt
```

チェックのいずれかでバリデーション例外が発生した場合、その後のチェックは実行されません。この場合、`callback` が提供されていれば、実行されたチェックごとに呼び出されます。上記の例では、PII が検出された場合、Toxicity と Prompt Safety のチェックは実行されません。

`moderation_config` を渡すことで、`filters` パラメータの中で希望する順序を指定することで、実行順序をオーバーライドできます。フィルタを指定した場合、`filters` パラメータで指定された順序でチェックが実行されます。以下の設定例では、まずToxicityチェック、次にPII、最後にPrompt Safetyバリデーションが実行されます。この場合、`AmazonComprehendModerationChain` は指定された順序で、各モデルの `kwargs` のデフォルト値を使用して所望のチェックを実行します。

```python
pii_check = ModerationPiiConfig()
toxicity_check = ModerationToxicityConfig()
prompt_safety_check = ModerationPromptSafetyConfig()

moderation_config = BaseModerationConfig(filters=[toxicity_check, pii_check, prompt_safety_check])
```

特定の moderation チェックに複数の設定を使用することもできます。以下の例では、2つの連続したPIIチェックが実行されます。最初の設定では、SSNがないかチェックし、見つかった場合はエラーを返します。SSNが見つからない場合は、次にNAMEとCREDIT_DEBIT_NUMBERが存在するかチェックし、見つかった場合はマスキングします。

```python
pii_check_1 = ModerationPiiConfig(labels=["SSN"])
pii_check_2 = ModerationPiiConfig(labels=["NAME", "CREDIT_DEBIT_NUMBER"], redact=True)

moderation_config = BaseModerationConfig(filters=[pii_check_1, pii_check_2])
```

1. PIIラベルの一覧は、Amazon Comprehend Universal PIIエンティティタイプ - https://docs.aws.amazon.com/comprehend/latest/dg/how-pii.html#how-pii-types を参照してください。
2. 利用可能なToxicityラベルは以下の通りです:
    - `HATE_SPEECH`: 人種、民族、ジェンダーアイデンティティ、宗教、性的指向、能力、国籍などのアイデンティティに基づいて、人や集団を批判、侮辱、非難、または非人間化する発言。
    - `GRAPHIC`: 視覚的に詳細で不快な表現を使用する発言は、グラフィックと見なされます。このような言語は、しばしば侮辱、不快感、または被害者への危害を増幅するために冗長に作られています。
    - `HARASSMENT_OR_ABUSE`: 発話者と聞き手の間の破壊的な力動を課し、受信者の心理的well-beingに影響を与え、または人を客体化する発言は、ハラスメントと見なされます。
    - `SEXUAL`: 直接的または間接的に身体的特徴や性的な参照を使用して、性的な関心、活動、または興奮を示す発言は、"sexual"タイプの有害な発言と見なされます。
    - `VIOLENCE_OR_THREAT`: 人や集団に対する痛み、傷害、または敵意を加えようとする脅威を含む発言。
    - `INSULT`: 軽蔑的、屈辱的、嘲笑的、侮辱的、または卑下的な言語を含む発言。
    - `PROFANITY`: 失礼、卑猥、または攻撃的な単語、句、略語を含む発言は、不適切と見なされます。
3. Prompt Safetyラベルの一覧は、ドキュメントの[リンク]を参照してください。

## 例

### Hugging Face Hubモデルを使用する

Hugging Face Hubから[APIキーを取得](https://huggingface.co/docs/api-inference/quicktour#get-your-api-token)してください。

```python
%pip install --upgrade --quiet  huggingface_hub
```

```python
import os

os.environ["HUGGINGFACEHUB_API_TOKEN"] = "<YOUR HF TOKEN HERE>"
```

```python
# See https://huggingface.co/models?pipeline_tag=text-generation&sort=downloads for some other options
repo_id = "google/flan-t5-xxl"
```

```python
from langchain_community.llms import HuggingFaceHub
from langchain_core.prompts import PromptTemplate

template = """{question}"""

prompt = PromptTemplate.from_template(template)
llm = HuggingFaceHub(
    repo_id=repo_id, model_kwargs={"temperature": 0.5, "max_length": 256}
)
```

設定を作成し、Amazon Comprehend Moderation チェーンを初期化します。

```python
# define filter configs
pii_config = ModerationPiiConfig(
    labels=["SSN", "CREDIT_DEBIT_NUMBER"], redact=True, mask_character="X"
)

toxicity_config = ModerationToxicityConfig(threshold=0.5)

prompt_safety_config = ModerationPromptSafetyConfig(threshold=0.8)

# define different moderation configs using the filter configs above
moderation_config_1 = BaseModerationConfig(
    filters=[pii_config, toxicity_config, prompt_safety_config]
)

moderation_config_2 = BaseModerationConfig(filters=[pii_config])


# input prompt moderation chain with callback
amazon_comp_moderation = AmazonComprehendModerationChain(
    moderation_config=moderation_config_1,
    client=comprehend_client,
    moderation_callback=my_callback,
    verbose=True,
)

# Output from LLM moderation chain without callback
amazon_comp_moderation_out = AmazonComprehendModerationChain(
    moderation_config=moderation_config_2, client=comprehend_client, verbose=True
)
```

この `moderation_config` は、わいせつな単語や文章、悪意のある意図、または閾値以上(0.5または50%)のPIIエンティティ(SSN以外)を含む入力を防ぐようになります。PIIエンティティ(SSN)が見つかった場合は、呼び出しを続行する前にそれらをマスキングします。また、モデルの応答からSSNやクレジットカード番号もマスキングします。

```python
chain = (
    prompt
    | amazon_comp_moderation
    | {"input": (lambda x: x["output"]) | llm}
    | amazon_comp_moderation_out
)

try:
    response = chain.invoke(
        {
            "question": """What is John Doe's address, phone number and SSN from the following text?

John Doe, a resident of 1234 Elm Street in Springfield, recently celebrated his birthday on January 1st. Turning 43 this year, John reflected on the years gone by. He often shares memories of his younger days with his close friends through calls on his phone, (555) 123-4567. Meanwhile, during a casual evening, he received an email at johndoe@example.com reminding him of an old acquaintance's reunion. As he navigated through some old documents, he stumbled upon a paper that listed his SSN as 123-45-6789, reminding him to store it in a safer place.
"""
        }
    )
except Exception as e:
    print(str(e))
else:
    print(response["output"])
```

### Amazon SageMaker Jumpstartを使用する

以下の例は、Amazon SageMaker JumpstartホストのLLMと共にAmazon Comprehend Moderation チェーンを使用する方法を示しています。AWS アカウント内に Amazon SageMaker Jumpstart ホストのLLMエンドポイントが必要です。LLMをAmazon SageMaker Jumpstartホストのエンドポイントにデプロイする方法については、[このノートブック](https://github.com/aws/amazon-sagemaker-examples/blob/main/introduction_to_amazon_algorithms/jumpstart-foundation-models/text-generation-falcon.md)を参照してください。

```python
endpoint_name = "<SAGEMAKER_ENDPOINT_NAME>"  # replace with your SageMaker Endpoint name
region = "<REGION>"  # replace with your SageMaker Endpoint region
```

```python
import json

from langchain_community.llms import SagemakerEndpoint
from langchain_community.llms.sagemaker_endpoint import LLMContentHandler
from langchain_core.prompts import PromptTemplate


class ContentHandler(LLMContentHandler):
    content_type = "application/json"
    accepts = "application/json"

    def transform_input(self, prompt: str, model_kwargs: dict) -> bytes:
        input_str = json.dumps({"text_inputs": prompt, **model_kwargs})
        return input_str.encode("utf-8")

    def transform_output(self, output: bytes) -> str:
        response_json = json.loads(output.read().decode("utf-8"))
        return response_json["generated_texts"][0]


content_handler = ContentHandler()

template = """From the following 'Document', precisely answer the 'Question'. Do not add any spurious information in your answer.

Document: John Doe, a resident of 1234 Elm Street in Springfield, recently celebrated his birthday on January 1st. Turning 43 this year, John reflected on the years gone by. He often shares memories of his younger days with his close friends through calls on his phone, (555) 123-4567. Meanwhile, during a casual evening, he received an email at johndoe@example.com reminding him of an old acquaintance's reunion. As he navigated through some old documents, he stumbled upon a paper that listed his SSN as 123-45-6789, reminding him to store it in a safer place.
Question: {question}
Answer:
"""

# prompt template for input text
llm_prompt = PromptTemplate.from_template(template)

llm = SagemakerEndpoint(
    endpoint_name=endpoint_name,
    region_name=region,
    model_kwargs={
        "temperature": 0.95,
        "max_length": 200,
        "num_return_sequences": 3,
        "top_k": 50,
        "top_p": 0.95,
        "do_sample": True,
    },
    content_handler=content_handler,
)
```

設定を作成し、Amazon Comprehend Moderation チェーンを初期化します。

```python
# define filter configs
pii_config = ModerationPiiConfig(labels=["SSN"], redact=True, mask_character="X")

toxicity_config = ModerationToxicityConfig(threshold=0.5)


# define different moderation configs using the filter configs above
moderation_config_1 = BaseModerationConfig(filters=[pii_config, toxicity_config])

moderation_config_2 = BaseModerationConfig(filters=[pii_config])


# input prompt moderation chain with callback
amazon_comp_moderation = AmazonComprehendModerationChain(
    moderation_config=moderation_config_1,
    client=comprehend_client,
    moderation_callback=my_callback,
    verbose=True,
)

# Output from LLM moderation chain without callback
amazon_comp_moderation_out = AmazonComprehendModerationChain(
    moderation_config=moderation_config_2, client=comprehend_client, verbose=True
)
```

この `moderation_config` は、わいせつな単語や文章、悪意のある意図、または閾値以上(0.5または50%)のPIIエンティティ(SSN以外)を含む入力とモデルの出力を防ぐようになります。PIIエンティティ(SSN)が見つかった場合は、呼び出しを続行する前にそれらをマスキングします。

```python
chain = (
    prompt
    | amazon_comp_moderation
    | {"input": (lambda x: x["output"]) | llm}
    | amazon_comp_moderation_out
)

try:
    response = chain.invoke(
        {"question": "What is John Doe's address, phone number and SSN?"}
    )
except Exception as e:
    print(str(e))
else:
    print(response["output"])
```
