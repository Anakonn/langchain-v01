---
canonical: https://python.langchain.com/v0.1/docs/guides/productionization/safety/amazon_comprehend_chain
translated: false
---

# Amazon Comprehend Moderation Chain

>[Amazon Comprehend](https://aws.amazon.com/comprehend/) is a natural-language processing (NLP) service that uses machine learning to uncover valuable insights and connections in text.

This notebook shows how to use `Amazon Comprehend` to detect and handle `Personally Identifiable Information` (`PII`) and toxicity.

## Setting up

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

## Using AmazonComprehendModerationChain with LLM chain

**Note**: The example below uses the _Fake LLM_ from LangChain, but the same concept could be applied to other LLMs.

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

## Using `moderation_config` to customize your moderation

Use Amazon Comprehend Moderation with a configuration to control what moderations you wish to perform and what actions should be taken for each of them. There are three different moderations that happen when no configuration is passed as demonstrated above. These moderations are:

- PII (Personally Identifiable Information) checks
- Toxicity content detection
- Prompt Safety detection

Here is an example of a moderation config.

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

At the core of the the configuration there are three configuration models to be used

- `ModerationPiiConfig` used for configuring the behavior of the PII validations. Following are the parameters it can be initialized with
  - `labels` the PII entity labels. Defaults to an empty list which means that the PII validation will consider all PII entities.
  - `threshold` the confidence threshold for the detected entities, defaults to 0.5 or 50%
  - `redact` a boolean flag to enforce whether redaction should be performed on the text, defaults to `False`. When `False`, the PII validation will error out when it detects any PII entity, when set to `True` it simply redacts the PII values in the text.
  - `mask_character` the character used for masking, defaults to asterisk (*)
- `ModerationToxicityConfig` used for configuring the behavior of the toxicity validations. Following are the parameters it can be initialized with
  - `labels` the Toxic entity labels. Defaults to an empty list which means that the toxicity validation will consider all toxic entities. all
  - `threshold` the confidence threshold for the detected entities, defaults to 0.5 or 50%
- `ModerationPromptSafetyConfig` used for configuring the behavior of the prompt safety validation
  - `threshold` the confidence threshold for the the prompt safety classification, defaults to 0.5 or 50%

Finally, you use the `BaseModerationConfig` to define the order in which each of these checks are to be performed. The `BaseModerationConfig` takes an optional `filters` parameter which can be a list of one or more than one of the above validation checks, as seen in the previous code block. The  `BaseModerationConfig` can also be initialized with any `filters` in which case it will use all the checks with default configuration (more on this explained later).

Using the configuration in the previous cell will perform PII checks and will allow the prompt to pass through however it will mask any SSN numbers present in either the prompt or the LLM output.

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

## Unique ID, and Moderation Callbacks

When Amazon Comprehend moderation action identifies any of the configugred entity, the chain will raise one of the following exceptions-
    - `ModerationPiiError`, for PII checks
    - `ModerationToxicityError`, for Toxicity checks
    - `ModerationPromptSafetyError` for Prompt Safety checks

In addition to the moderation configuration, the `AmazonComprehendModerationChain` can also be initialized with the following parameters

- `unique_id` [Optional] a string parameter. This parameter can be used to pass any string value or ID. For example, in a chat application, you may want to keep track of abusive users, in this case, you can pass the user's username/email ID etc. This defaults to `None`.

- `moderation_callback` [Optional] the `BaseModerationCallbackHandler` that will be called asynchronously (non-blocking to the chain). Callback functions are useful when you want to perform additional actions when the moderation functions are executed, for example logging into a database, or writing a log file. You can override three functions by subclassing `BaseModerationCallbackHandler` - `on_after_pii()`, `on_after_toxicity()`, and `on_after_prompt_safety()`. Note that all three functions must be `async` functions. These callback functions receive two arguments:
    - `moderation_beacon` a dictionary that will contain information about the moderation function, the full response from Amazon Comprehend model, a unique chain id, the moderation status, and the input string which was validated. The dictionary is of the following schema-

    ```
    {
        'moderation_chain_id': 'xxx-xxx-xxx', # Unique chain ID
        'moderation_type': 'Toxicity' | 'PII' | 'PromptSafety',
        'moderation_status': 'LABELS_FOUND' | 'LABELS_NOT_FOUND',
        'moderation_input': 'A sample SSN number looks like this 123-456-7890. Can you give me some more samples?',
        'moderation_output': {...} #Full Amazon Comprehend PII, Toxicity, or Prompt Safety Model Output
    }
    ```

    - `unique_id` if passed to the `AmazonComprehendModerationChain`

<div class="alert alert-block alert-info"> <b>NOTE:</b> <code>moderation_callback</code> is different from LangChain Chain Callbacks. You can still use LangChain Chain callbacks with <code>AmazonComprehendModerationChain</code> via the callbacks parameter. Example: <br/>
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

## `moderation_config` and moderation execution order

If `AmazonComprehendModerationChain` is not initialized with any `moderation_config` then it is initialized with the default values of `BaseModerationConfig`. If no `filters` are used then the sequence of moderation check is as follows.

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

If any of the check raises a validation exception then the subsequent checks will not be performed. If a `callback` is provided in this case, then it will be called for each of the checks that have been performed. For example, in the case above, if the Chain fails due to presence of PII then the Toxicity and Prompt Safety checks will not be performed.

You can override the execution order by passing `moderation_config` and simply specifying the desired order in the `filters` parameter of the `BaseModerationConfig`. In case you specify the filters, then the order of the checks as specified in the `filters` parameter will be maintained. For example, in the configuration below, first Toxicity check will be performed, then PII, and finally Prompt Safety validation will be performed. In this case, `AmazonComprehendModerationChain` will perform the desired checks in the specified order with default values of each model `kwargs`.

```python
pii_check = ModerationPiiConfig()
toxicity_check = ModerationToxicityConfig()
prompt_safety_check = ModerationPromptSafetyConfig()

moderation_config = BaseModerationConfig(filters=[toxicity_check, pii_check, prompt_safety_check])
```

You can have also use more than one configuration for a specific moderation check, for example in the sample below, two consecutive PII checks are performed. First the configuration checks for any SSN, if found it would raise an error. If any SSN isn't found then it will next check if any NAME and CREDIT_DEBIT_NUMBER is present in the prompt and will mask it.

```python
pii_check_1 = ModerationPiiConfig(labels=["SSN"])
pii_check_2 = ModerationPiiConfig(labels=["NAME", "CREDIT_DEBIT_NUMBER"], redact=True)

moderation_config = BaseModerationConfig(filters=[pii_check_1, pii_check_2])
```

1. For a list of PII labels see Amazon Comprehend Universal PII entity types - https://docs.aws.amazon.com/comprehend/latest/dg/how-pii.html#how-pii-types
2. Following are the list of available Toxicity labels-
    - `HATE_SPEECH`: Speech that criticizes, insults, denounces or dehumanizes a person or a group on the basis of an identity, be it race, ethnicity, gender identity, religion, sexual orientation, ability, national origin, or another identity-group.
    - `GRAPHIC`: Speech that uses visually descriptive, detailed and unpleasantly vivid imagery is considered as graphic. Such language is often made verbose so as to amplify an insult, discomfort or harm to the recipient.
    - `HARASSMENT_OR_ABUSE`: Speech that imposes disruptive power dynamics between the speaker and hearer, regardless of intent, seeks to affect the psychological well-being of the recipient, or objectifies a person should be classified as Harassment.
    - `SEXUAL`: Speech that indicates sexual interest, activity or arousal by using direct or indirect references to body parts or physical traits or sex is considered as toxic with toxicityType "sexual".
    - `VIOLENCE_OR_THREAT`: Speech that includes threats which seek to inflict pain, injury or hostility towards a person or group.
    - `INSULT`: Speech that includes demeaning, humiliating, mocking, insulting, or belittling language.
    - `PROFANITY`: Speech that contains words, phrases or acronyms that are impolite, vulgar, or offensive is considered as profane.
3. For a list of Prompt Safety labels refer to documentation [link here]

## Examples

### With Hugging Face Hub Models

Get your [API Key from Hugging Face hub](https://huggingface.co/docs/api-inference/quicktour#get-your-api-token)

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

Create a configuration and initialize an Amazon Comprehend Moderation chain

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

The `moderation_config` will now prevent any inputs containing obscene words or sentences, bad intent, or PII with entities other than SSN with score above threshold or 0.5 or 50%. If it finds Pii entities - SSN - it will redact them before allowing the call to proceed. It will also mask any SSN or credit card numbers from the model's response.

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

### With Amazon SageMaker Jumpstart

The exmaple below shows how to use Amazon Comprehend Moderation chain with an Amazon SageMaker Jumpstart hosted LLM. You should have an Amazon SageMaker Jumpstart hosted LLM endpoint within your AWS Account. Refer to [this notebook](https://github.com/aws/amazon-sagemaker-examples/blob/main/introduction_to_amazon_algorithms/jumpstart-foundation-models/text-generation-falcon.md) for more on how to deploy an LLM with Amazon SageMaker Jumpstart hosted endpoints.

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

Create a configuration and initialize an Amazon Comprehend Moderation chain

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

The `moderation_config` will now prevent any inputs and model outputs containing obscene words or sentences, bad intent, or Pii with entities other than SSN with score above threshold or 0.5 or 50%. If it finds Pii entities - SSN - it will redact them before allowing the call to proceed.

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