---
canonical: https://python.langchain.com/v0.1/docs/guides/productionization/safety/moderation
translated: false
---

# Moderation chain

This notebook walks through examples of how to use a moderation chain, and several common ways for doing so.
Moderation chains are useful for detecting text that could be hateful, violent, etc. This can be useful to apply on both user input, but also on the output of a Language Model.
Some API providers specifically prohibit you, or your end users, from generating some
types of harmful content. To comply with this (and to just generally prevent your application from being harmful)
you may want to add a moderation chain to your sequences in order to make sure any output
the LLM generates is not harmful.

If the content passed into the moderation chain is harmful, there is not one best way to handle it.
It probably depends on your application. Sometimes you may want to throw an error
(and have your application handle that). Other times, you may want to return something to
the user explaining that the text was harmful.

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain.chains import OpenAIModerationChain
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import OpenAI
```

```python
moderate = OpenAIModerationChain()
```

```python
model = OpenAI()
prompt = ChatPromptTemplate.from_messages([("system", "repeat after me: {input}")])
```

```python
chain = prompt | model
```

```python
chain.invoke({"input": "you are stupid"})
```

```output
'\n\nYou are stupid.'
```

```python
moderated_chain = chain | moderate
```

```python
moderated_chain.invoke({"input": "you are stupid"})
```

```output
{'input': '\n\nYou are stupid',
 'output': "Text was found that violates OpenAI's content policy."}
```