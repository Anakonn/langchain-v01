---
translated: true
---

# लेखक

[लेखक](https://writer.com/) एक मंच है जहां विभिन्न भाषाओं में सामग्री उत्पन्न की जाती है।

यह उदाहरण बताता है कि `Writer` [मॉडल](https://dev.writer.com/docs/models) के साथ LangChain का उपयोग कैसे किया जाता है।

आपको WRITER_API_KEY [यहाँ](https://dev.writer.com/docs) प्राप्त करना होगा।

```python
from getpass import getpass

WRITER_API_KEY = getpass()
```

```output
 ········
```

```python
import os

os.environ["WRITER_API_KEY"] = WRITER_API_KEY
```

```python
from langchain.chains import LLMChain
from langchain_community.llms import Writer
from langchain_core.prompts import PromptTemplate
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
# If you get an error, probably, you need to set up the "base_url" parameter that can be taken from the error log.

llm = Writer()
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```
