---
canonical: https://python.langchain.com/v0.1/docs/integrations/chat/edenai
translated: false
---

# Eden AI

Eden AI is revolutionizing the AI landscape by uniting the best AI providers, empowering users to unlock limitless possibilities and tap into the true potential of artificial intelligence. With an all-in-one comprehensive and hassle-free platform, it allows users to deploy AI features to production lightning fast, enabling effortless access to the full breadth of AI capabilities via a single API. (website: https://edenai.co/)

This example goes over how to use LangChain to interact with Eden AI models

-----------------------------------------------------------------------------------

`EdenAI` goes beyond mere model invocation. It empowers you with advanced features, including:

- **Multiple Providers**: Gain access to a diverse range of language models offered by various providers, giving you the freedom to choose the best-suited model for your use case.

- **Fallback Mechanism**: Set a fallback mechanism to ensure seamless operations even if the primary provider is unavailable, you can easily switches to an alternative provider.

- **Usage Tracking**: Track usage statistics on a per-project and per-API key basis. This feature allows you to monitor and manage resource consumption effectively.

- **Monitoring and Observability**: `EdenAI` provides comprehensive monitoring and observability tools on the platform. Monitor the performance of your language models, analyze usage patterns, and gain valuable insights to optimize your applications.

Accessing the EDENAI's API requires an API key,

which you can get by creating an account https://app.edenai.run/user/register  and heading here https://app.edenai.run/admin/iam/api-keys

Once we have a key we'll want to set it as an environment variable by running:

```bash
export EDENAI_API_KEY="..."
```

You can find more details on the API reference : https://docs.edenai.co/reference

If you'd prefer not to set an environment variable you can pass the key in directly via the edenai_api_key named parameter

 when initiating the EdenAI Chat Model class.

```python
from langchain_community.chat_models.edenai import ChatEdenAI
from langchain_core.messages import HumanMessage
```

```python
chat = ChatEdenAI(
    edenai_api_key="...", provider="openai", temperature=0.2, max_tokens=250
)
```

```python
messages = [HumanMessage(content="Hello !")]
chat.invoke(messages)
```

```output
AIMessage(content='Hello! How can I assist you today?')
```

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content='Hello! How can I assist you today?')
```

## Streaming and Batching

`ChatEdenAI` supports streaming and batching. Below is an example.

```python
for chunk in chat.stream(messages):
    print(chunk.content, end="", flush=True)
```

```output
Hello! How can I assist you today?
```

```python
chat.batch([messages])
```

```output
[AIMessage(content='Hello! How can I assist you today?')]
```

## Fallback mecanism

With Eden AI you can set a fallback mechanism to ensure seamless operations even if the primary provider is unavailable, you can easily switches to an alternative provider.

```python
chat = ChatEdenAI(
    edenai_api_key="...",
    provider="openai",
    temperature=0.2,
    max_tokens=250,
    fallback_providers="google",
)
```

In this example, you can use Google as a backup provider if OpenAI encounters any issues.

For more information and details about Eden AI, check out this link: : https://docs.edenai.co/docs/additional-parameters

## Chaining Calls

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template(
    "What is a good name for a company that makes {product}?"
)
chain = prompt | chat
```

```python
chain.invoke({"product": "healthy snacks"})
```

```output
AIMessage(content='VitalBites')
```