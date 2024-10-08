---
canonical: https://python.langchain.com/v0.1/docs/integrations/llms/bedrock
translated: false
---

# Bedrock

>[Amazon Bedrock](https://aws.amazon.com/bedrock/) is a fully managed service that offers a choice of
> high-performing foundation models (FMs) from leading AI companies like `AI21 Labs`, `Anthropic`, `Cohere`,
> `Meta`, `Stability AI`, and `Amazon` via a single API, along with a broad set of capabilities you need to
> build generative AI applications with security, privacy, and responsible AI. Using `Amazon Bedrock`,
> you can easily experiment with and evaluate top FMs for your use case, privately customize them with
> your data using techniques such as fine-tuning and `Retrieval Augmented Generation` (`RAG`), and build
> agents that execute tasks using your enterprise systems and data sources. Since `Amazon Bedrock` is
> serverless, you don't have to manage any infrastructure, and you can securely integrate and deploy
> generative AI capabilities into your applications using the AWS services you are already familiar with.

```python
%pip install --upgrade --quiet  boto3
```

```python
from langchain_community.llms import Bedrock

llm = Bedrock(
    credentials_profile_name="bedrock-admin", model_id="amazon.titan-text-express-v1"
)
```

### Using in a conversation chain

```python
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory

conversation = ConversationChain(
    llm=llm, verbose=True, memory=ConversationBufferMemory()
)

conversation.predict(input="Hi there!")
```

### Conversation Chain With Streaming

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_community.llms import Bedrock

llm = Bedrock(
    credentials_profile_name="bedrock-admin",
    model_id="amazon.titan-text-express-v1",
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)
```

```python
conversation = ConversationChain(
    llm=llm, verbose=True, memory=ConversationBufferMemory()
)

conversation.predict(input="Hi there!")
```

### Custom models

```python
custom_llm = Bedrock(
    credentials_profile_name="bedrock-admin",
    provider="cohere",
    model_id="<Custom model ARN>",  # ARN like 'arn:aws:bedrock:...' obtained via provisioning the custom model
    model_kwargs={"temperature": 1},
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)

conversation = ConversationChain(
    llm=custom_llm, verbose=True, memory=ConversationBufferMemory()
)
conversation.predict(input="What is the recipe of mayonnaise?")
```

### Guardrails for Amazon Bedrock example

## Guardrails for Amazon Bedrock (Preview)

[Guardrails for Amazon Bedrock](https://aws.amazon.com/bedrock/guardrails/) evaluates user inputs and model responses based on use case specific policies, and provides an additional layer of safeguards regardless of the underlying model. Guardrails can be applied across models, including Anthropic Claude, Meta Llama 2, Cohere Command, AI21 Labs Jurassic, and Amazon Titan Text, as well as fine-tuned models.
**Note**: Guardrails for Amazon Bedrock is currently in preview and not generally available. Reach out through your usual AWS Support contacts if you’d like access to this feature.
In this section, we are going to set up a Bedrock language model with specific guardrails that include tracing capabilities.

```python
from typing import Any

from langchain_core.callbacks import AsyncCallbackHandler


class BedrockAsyncCallbackHandler(AsyncCallbackHandler):
    # Async callback handler that can be used to handle callbacks from langchain.

    async def on_llm_error(self, error: BaseException, **kwargs: Any) -> Any:
        reason = kwargs.get("reason")
        if reason == "GUARDRAIL_INTERVENED":
            print(f"Guardrails: {kwargs}")


# Guardrails for Amazon Bedrock with trace
llm = Bedrock(
    credentials_profile_name="bedrock-admin",
    model_id="<Model_ID>",
    model_kwargs={},
    guardrails={"id": "<Guardrail_ID>", "version": "<Version>", "trace": True},
    callbacks=[BedrockAsyncCallbackHandler()],
)
```