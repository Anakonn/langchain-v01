---
translated: true
---

# MLflow

>[MLflow](https://www.mlflow.org/docs/latest/what-is-mlflow) एक बहुमुखी, विस्तारयोग्य, ओपन-सोर्स प्लेटफॉर्म है जो मशीन लर्निंग लाइफसाइकिल में कार्यप्रवाह और कृतियों का प्रबंधन करता है। इसमें कई लोकप्रिय एमएल लाइब्रेरियों के साथ बिल्ट-इन एकीकरण हैं, लेकिन किसी भी लाइब्रेरी, एल्गोरिदम या तैनाती उपकरण के साथ उपयोग किया जा सकता है। इसे विस्तारयोग्य बनाया गया है, ताकि आप नए कार्यप्रवाह, लाइब्रेरी और उपकरणों का समर्थन करने के लिए प्लगइन लिख सकें।

यह नोटबुक आपके `MLflow Server` में अपने LangChain प्रयोगों को ट्रैक करने के बारे में बताता है।

## बाहरी उदाहरण

`MLflow` `LangChain` एकीकरण के लिए [कई उदाहरण](https://github.com/mlflow/mlflow/tree/master/examples/langchain) प्रदान करता है:
- [simple_chain](https://github.com/mlflow/mlflow/blob/master/examples/langchain/simple_chain.py)
- [simple_agent](https://github.com/mlflow/mlflow/blob/master/examples/langchain/simple_agent.py)
- [retriever_chain](https://github.com/mlflow/mlflow/blob/master/examples/langchain/retriever_chain.py)
- [retrieval_qa_chain](https://github.com/mlflow/mlflow/blob/master/examples/langchain/retrieval_qa_chain.py)

## उदाहरण

```python
%pip install --upgrade --quiet  azureml-mlflow
%pip install --upgrade --quiet  pandas
%pip install --upgrade --quiet  textstat
%pip install --upgrade --quiet  spacy
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  google-search-results
!python -m spacy download en_core_web_sm
```

```python
import os

os.environ["MLFLOW_TRACKING_URI"] = ""
os.environ["OPENAI_API_KEY"] = ""
os.environ["SERPAPI_API_KEY"] = ""
```

```python
from langchain.callbacks import MlflowCallbackHandler
from langchain_openai import OpenAI
```

```python
"""Main function.

This function is used to try the callback handler.
Scenarios:
1. OpenAI LLM
2. Chain with multiple SubChains on multiple generations
3. Agent with Tools
"""
mlflow_callback = MlflowCallbackHandler()
llm = OpenAI(
    model_name="gpt-3.5-turbo", temperature=0, callbacks=[mlflow_callback], verbose=True
)
```

```python
# SCENARIO 1 - LLM
llm_result = llm.generate(["Tell me a joke"])

mlflow_callback.flush_tracker(llm)
```

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
```

```python
# SCENARIO 2 - Chain
template = """You are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: {title}
Playwright: This is a synopsis for the above play:"""
prompt_template = PromptTemplate(input_variables=["title"], template=template)
synopsis_chain = LLMChain(llm=llm, prompt=prompt_template, callbacks=[mlflow_callback])

test_prompts = [
    {
        "title": "documentary about good video games that push the boundary of game design"
    },
]
synopsis_chain.apply(test_prompts)
mlflow_callback.flush_tracker(synopsis_chain)
```

```python
from langchain.agents import AgentType, initialize_agent, load_tools
```

```python
# SCENARIO 3 - Agent with Tools
tools = load_tools(["serpapi", "llm-math"], llm=llm, callbacks=[mlflow_callback])
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    callbacks=[mlflow_callback],
    verbose=True,
)
agent.run(
    "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?"
)
mlflow_callback.flush_tracker(agent, finish=True)
```
