---
canonical: https://python.langchain.com/v0.1/docs/integrations/providers/shaleprotocol
translated: false
---

# Shale Protocol

[Shale Protocol](https://shaleprotocol.com) provides production-ready inference APIs for open LLMs. It's a Plug & Play API as it's hosted on a highly scalable GPU cloud infrastructure.

Our free tier supports up to 1K daily requests per key as we want to eliminate the barrier for anyone to start building genAI apps with LLMs.

With Shale Protocol, developers/researchers can create apps and explore the capabilities of open LLMs at no cost.

This page covers how Shale-Serve API can be incorporated with LangChain.

As of June 2023, the API supports Vicuna-13B by default. We are going to support more LLMs such as Falcon-40B in future releases.

## How to

### 1. Find the link to our Discord on https://shaleprotocol.com. Generate an API key through the "Shale Bot" on our Discord. No credit card is required and no free trials. It's a forever free tier with 1K limit per day per API key.

### 2. Use https://shale.live/v1 as OpenAI API drop-in replacement

For example

```python
<!--IMPORTS:[{"imported": "OpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_openai.llms.base.OpenAI.html", "title": "Shale Protocol"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Shale Protocol"}, {"imported": "LLMChain", "source": "langchain.chains", "docs": "https://api.python.langchain.com/en/latest/chains/langchain.chains.llm.LLMChain.html", "title": "Shale Protocol"}]-->
from langchain_openai import OpenAI
from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain

import os
os.environ['OPENAI_API_BASE'] = "https://shale.live/v1"
os.environ['OPENAI_API_KEY'] = "ENTER YOUR API KEY"

llm = OpenAI()

template = """Question: {question}

# Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)

```