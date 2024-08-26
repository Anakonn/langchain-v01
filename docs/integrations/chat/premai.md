---
canonical: https://python.langchain.com/v0.1/docs/integrations/chat/premai
sidebar_label: PremAI
translated: false
---

# ChatPremAI

>[PremAI](https://app.premai.io) is a unified platform that lets you build powerful production-ready GenAI-powered applications with the least effort so that you can focus more on user experience and overall growth.

This example goes over how to use LangChain to interact with `ChatPremAI`.

### Installation and setup

We start by installing langchain and premai-sdk. You can type the following command to install:

```bash
pip install premai langchain
```

Before proceeding further, please make sure that you have made an account on PremAI and already started a project. If not, then here's how you can start for free:

1. Sign in to [PremAI](https://app.premai.io/accounts/login/), if you are coming for the first time and create your API key [here](https://app.premai.io/api_keys/).

2. Go to [app.premai.io](https://app.premai.io) and this will take you to the project's dashboard.

3. Create a project and this will generate a project-id (written as ID). This ID will help you to interact with your deployed application.

4. Head over to LaunchPad (the one with 🚀 icon). And there deploy your model of choice. Your default model will be `gpt-4`. You can also set and fix different generation parameters (like max-tokens, temperature, etc) and also pre-set your system prompt.

Congratulations on creating your first deployed application on PremAI 🎉 Now we can use langchain to interact with our application.

```python
from langchain_community.chat_models import ChatPremAI
from langchain_core.messages import HumanMessage, SystemMessage
```

## Setup ChatPremAI instance in LangChain

Once we import our required modules, let's set up our client. For now, let's assume that our `project_id` is 8. But make sure you use your project-id, otherwise, it will throw an error.

To use langchain with prem, you do not need to pass any model name or set any parameters with our chat client. All of those will use the default model name and parameters of the LaunchPad model.

`NOTE:` If you change the `model_name` or any other parameter like `temperature` while setting the client, it will override existing default configurations.

```python
import getpass
import os

# First step is to set up the env variable.
# you can also pass the API key while instantiating the model but this
# comes under a best practices to set it as env variable.

if os.environ.get("PREMAI_API_KEY") is None:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")
```

```python
# By default it will use the model which was deployed through the platform
# in my case it will is "claude-3-haiku"

chat = ChatPremAI(project_id=8)
```

## Calling the Model

Now you are all set. We can now start by interacting with our application. `ChatPremAI` supports two methods `invoke` (which is the same as `generate`) and `stream`.

The first one will give us a static result. Whereas the second one will stream tokens one by one. Here's how you can generate chat-like completions.

### Generation

```python
human_message = HumanMessage(content="Who are you?")

response = chat.invoke([human_message])
print(response.content)
```

```output
I am an artificial intelligence created by Anthropic. I'm here to help with a wide variety of tasks, from research and analysis to creative projects and open-ended conversation. I have general knowledge and capabilities, but I'm not a real person - I'm an AI assistant. Please let me know if you have any other questions!
```

Above looks interesting right? I set my default lanchpad system-prompt as: `Always sound like a pirate` You can also, override the default system prompt if you need to. Here's how you can do it.

```python
system_message = SystemMessage(content="You are a friendly assistant.")
human_message = HumanMessage(content="Who are you?")

chat.invoke([system_message, human_message])
```

```output
AIMessage(content="I am an artificial intelligence created by Anthropic. My purpose is to assist and converse with humans in a friendly and helpful way. I have a broad knowledge base that I can use to provide information, answer questions, and engage in discussions on a wide range of topics. Please let me know if you have any other questions - I'm here to help!")
```

You can also change generation parameters while calling the model. Here's how you can do that

```python
chat.invoke([system_message, human_message], temperature=0.7, max_tokens=10, top_p=0.95)
```

```output
AIMessage(content='I am an artificial intelligence created by Anthropic')
```

### Important notes:

Before proceeding further, please note that the current version of ChatPrem does not support parameters: [n](https://platform.openai.com/docs/api-reference/chat/create#chat-create-n) and [stop](https://platform.openai.com/docs/api-reference/chat/create#chat-create-stop) are not supported.

We will provide support for those two above parameters in sooner versions.

### Streaming

And finally, here's how you do token streaming for dynamic chat like applications.

```python
import sys

for chunk in chat.stream("hello how are you"):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

```output
Hello! As an AI language model, I don't have feelings or a physical state, but I'm functioning properly and ready to assist you with any questions or tasks you might have. How can I help you today?
```

Similar to above, if you want to override the system-prompt and the generation parameters, here's how you can do it.

```python
import sys

# For some experimental reasons if you want to override the system prompt then you
# can pass that here too. However it is not recommended to override system prompt
# of an already deployed model.

for chunk in chat.stream(
    "hello how are you",
    system_prompt="act like a dog",
    temperature=0.7,
    max_tokens=200,
):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

```output
Hello! As an AI language model, I don't have feelings or a physical form, but I'm functioning properly and ready to assist you. How can I help you today?
```