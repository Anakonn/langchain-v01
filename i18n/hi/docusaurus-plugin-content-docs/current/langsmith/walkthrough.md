---
translated: true
---

# LangSmith वॉकथ्रू

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/langsmith/walkthrough.ipynb)

LangChain एलएलएम एप्लिकेशन और एजेंट प्रोटोटाइप बनाना आसान बनाता है। हालांकि, उत्पादन में एलएलएम एप्लिकेशन वितरित करना गुमराह करने वाला हो सकता है। आपको अपने प्रोम्प्ट, श्रृंखलाओं और अन्य घटकों पर काम करना होगा ताकि एक उच्च गुणवत्ता वाला उत्पाद बना सकें।

LangSmith आपके एलएलएम एप्लिकेशन को डिबग, परीक्षण और लगातार बेहतर बनाने में आसान बनाता है।

यह कब उपयोगी हो सकता है? आप इसका उपयोग तब पाएंगे जब आप:

- नई श्रृंखला, एजेंट या उपकरणों का सेट त्वरित डिबग करना चाहते हैं
- फाइन-ट्यूनिंग, फ्यू-शॉट प्रोम्प्टिंग और मूल्यांकन के लिए डेटासेट बनाना और प्रबंधित करना चाहते हैं
- अपने एप्लिकेशन पर रीग्रेशन परीक्षण चलाकर विश्वास से विकास करना चाहते हैं
- उत्पाद अंतर्दृष्टि और लगातार सुधार के लिए उत्पादन विश्लेषिकी कैप्चर करना चाहते हैं

## पूर्वापेक्षाएं

**[एक LangSmith खाता बनाएं](https://smith.langchain.com/) और एक API कुंजी बनाएं (नीचे बाएं कोने में देखें)। [दस्तावेज़](https://docs.smith.langchain.com/) देखकर प्लेटफ़ॉर्म से परिचित हों**

ध्यान दें कि LangSmith बंद बीटा में है; हम इसे और अधिक उपयोगकर्ताओं तक पहुंचाने की प्रक्रिया में हैं। हालांकि, आप वेबसाइट पर दिए गए फॉर्म को भरकर त्वरित पहुंच प्राप्त कर सकते हैं।

अब, शुरू करते हैं!

## LangSmith में रन लॉग करें

पहले, अपने वातावरण चर को कॉन्फ़िगर करें ताकि LangChain ट्रेस लॉग कर सके। यह `LANGCHAIN_TRACING_V2` वातावरण चर को सच करके किया जाता है।
आप LangChain को बताकर कि किस परियोजना में लॉग करना है, `LANGCHAIN_PROJECT` वातावरण चर सेट कर सकते हैं (यदि यह सेट नहीं है, तो रन `default` परियोजना में लॉग किए जाएंगे)। यह स्वचालित रूप से परियोजना बना देगा यदि यह मौजूद नहीं है। आपको `LANGCHAIN_ENDPOINT` और `LANGCHAIN_API_KEY` वातावरण चर भी सेट करने होंगे।

ट्रेसिंग सेट करने के अन्य तरीकों के बारे में अधिक जानकारी के लिए, कृपया [LangSmith दस्तावेज़ीकरण](https://docs.smith.langchain.com/docs/) देखें।

**नोट:** आप पायथन में एक संदर्भ प्रबंधक का उपयोग भी कर सकते हैं ताकि ट्रेस लॉग किए जा सकें।

```python
from langchain_core.tracers.context import tracing_v2_enabled

with tracing_v2_enabled(project_name="My Project"):
    agent.run("How many people live in canada as of 2023?")
```

हालांकि, इस उदाहरण में, हम वातावरण चर का उपयोग करेंगे।

```python
%pip install --upgrade --quiet  langchain langsmith langchainhub
%pip install --upgrade --quiet  langchain-openai tiktoken pandas duckduckgo-search
```

```python
import os
from uuid import uuid4

unique_id = uuid4().hex[0:8]
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = f"Tracing Walkthrough - {unique_id}"
os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
os.environ["LANGCHAIN_API_KEY"] = "<YOUR-API-KEY>"  # Update to your API key

# Used by the agent in this tutorial
os.environ["OPENAI_API_KEY"] = "<YOUR-OPENAI-API-KEY>"
```

एपीआई के साथ बातचीत करने के लिए LangSmith क्लाइंट बनाएं।

```python
from langsmith import Client

client = Client()
```

एक LangChain घटक बनाएं और इसे प्लेटफ़ॉर्म पर लॉग करें। इस उदाहरण में, हम एक सामान्य खोज उपकरण (DuckDuckGo) तक पहुंच के साथ एक ReAct-शैली एजेंट बनाएंगे। एजेंट का प्रोम्प्ट [हब में](https://smith.langchain.com/hub/wfh/langsmith-agent-prompt) देखा जा सकता है।

```python
from langchain import hub
from langchain.agents import AgentExecutor
from langchain.agents.format_scratchpad.openai_tools import (
    format_to_openai_tool_messages,
)
from langchain.agents.output_parsers.openai_tools import OpenAIToolsAgentOutputParser
from langchain_community.tools import DuckDuckGoSearchResults
from langchain_openai import ChatOpenAI

# Fetches the latest version of this prompt
prompt = hub.pull("wfh/langsmith-agent-prompt:5d466cbc")

llm = ChatOpenAI(
    model="gpt-3.5-turbo-16k",
    temperature=0,
)

tools = [
    DuckDuckGoSearchResults(
        name="duck_duck_go"
    ),  # General internet search using DuckDuckGo
]

llm_with_tools = llm.bind_tools(tools)

runnable_agent = (
    {
        "input": lambda x: x["input"],
        "agent_scratchpad": lambda x: format_to_openai_tool_messages(
            x["intermediate_steps"]
        ),
    }
    | prompt
    | llm_with_tools
    | OpenAIToolsAgentOutputParser()
)

agent_executor = AgentExecutor(
    agent=runnable_agent, tools=tools, handle_parsing_errors=True
)
```

हम लेटेंसी को कम करने के लिए कई इनपुट पर एजेंट को समानांतर रूप से चला रहे हैं। रन LangSmith में पृष्ठभूमि में लॉग किए जाते हैं, इसलिए कार्यान्वयन लेटेंसी प्रभावित नहीं होती है।

```python
inputs = [
    "What is LangChain?",
    "What's LangSmith?",
    "When was Llama-v2 released?",
    "What is the langsmith cookbook?",
    "When did langchain first announce the hub?",
]

results = agent_executor.batch([{"input": x} for x in inputs], return_exceptions=True)
```

```python
results[:2]
```

```output
[{'input': 'What is LangChain?',
  'output': 'I\'m sorry, but I couldn\'t find any information about "LangChain". Could you please provide more context or clarify your question?'},
 {'input': "What's LangSmith?",
  'output': 'I\'m sorry, but I couldn\'t find any information about "LangSmith". It could be a company, a product, or a person. Can you provide more context or details about what you are referring to?'}]
```

यह मानते हुए कि आपने अपना वातावरण सफलतापूर्वक सेट किया है, आपके एजेंट ट्रेस [ऐप](https://smith.langchain.com/) के `परियोजनाएं` अनुभाग में दिखाई देने चाहिए। बधाई!

![Initial Runs](./img/log_traces.png)

लगता है कि एजेंट उपकरणों का प्रभावी ढंग से उपयोग नहीं कर रहा है। चलो इसका मूल्यांकन करते हैं ताकि हमारे पास एक आधार रेखा हो।

## एजेंट का मूल्यांकन करें

लॉग रनों के अलावा, LangSmith आपके एलएलएम एप्लिकेशन को परीक्षण और मूल्यांकन करने की भी अनुमति देता है।

इस खंड में, आप LangSmith का उपयोग करके एक बेंचमार्क डेटासेट बनाएंगे और एक एजेंट पर एआई-सहायता प्राप्त मूल्यांकनकर्ताओं को चलाएंगे। आप ऐसा कुछ चरणों में करेंगे:

1. एक डेटासेट बनाएं
2. बेंचमार्क करने के लिए एक नया एजेंट प्रारंभ करें
3. एजेंट के आउटपुट को ग्रेड करने के लिए मूल्यांकनकर्ताओं को कॉन्फ़िगर करें
4. डेटासेट पर एजेंट को चलाएं और परिणामों का मूल्यांकन करें

### 1. एक LangSmith डेटासेट बनाएं

नीचे, हम LangSmith क्लाइंट का उपयोग करके ऊपर दिए गए इनपुट प्रश्नों और एक सूची लेबल से एक डेटासेट बनाते हैं। आप बाद में एक नए एजेंट के प्रदर्शन को मापने के लिए इनका उपयोग करेंगे। एक डेटासेट उदाहरणों का एक संग्रह है, जो कुछ नहीं हैं बस इनपुट-आउटपुट युग्म जिनका आप अपने एप्लिकेशन के परीक्षण मामलों के रूप में उपयोग कर सकते हैं।

डेटासेट के बारे में अधिक जानकारी के लिए, जिसमें CSV या अन्य फ़ाइलों से कैसे बनाया जाए या प्लेटफ़ॉर्म में कैसे बनाया जाए, कृपया [LangSmith दस्तावेज़ीकरण](https://docs.smith.langchain.com/) देखें।

```python
outputs = [
    "LangChain is an open-source framework for building applications using large language models. It is also the name of the company building LangSmith.",
    "LangSmith is a unified platform for debugging, testing, and monitoring language model applications and agents powered by LangChain",
    "July 18, 2023",
    "The langsmith cookbook is a github repository containing detailed examples of how to use LangSmith to debug, evaluate, and monitor large language model-powered applications.",
    "September 5, 2023",
]
```

```python
dataset_name = f"agent-qa-{unique_id}"

dataset = client.create_dataset(
    dataset_name,
    description="An example dataset of questions over the LangSmith documentation.",
)

client.create_examples(
    inputs=[{"input": query} for query in inputs],
    outputs=[{"output": answer} for answer in outputs],
    dataset_id=dataset.id,
)
```

### 2. एक नया एजेंट प्रारंभ करें जिसका बेंचमार्क किया जाए

LangSmith आपको किसी भी एलएलएम, श्रृंखला, एजेंट या यहां तक कि एक कस्टम फ़ंक्शन का मूल्यांकन करने देता है। वार्तालाप एजेंट स्थिरस्थापक (उनके पास मेमोरी होती है); यह सुनिश्चित करने के लिए कि यह स्थिति डेटासेट रन के बीच साझा नहीं की जाती है, हम एक `chain_factory` (या `constructor`) फ़ंक्शन पास करेंगे जो प्रत्येक कॉल के लिए प्रारंभ किया जाएगा।

इस मामले में, हम OpenAI के फ़ंक्शन कॉलिंग एंडपॉइंट का उपयोग करने वाले एक एजेंट का परीक्षण करेंगे।

```python
from langchain import hub
from langchain.agents import AgentExecutor, AgentType, initialize_agent, load_tools
from langchain_openai import ChatOpenAI


# Since chains can be stateful (e.g. they can have memory), we provide
# a way to initialize a new chain for each row in the dataset. This is done
# by passing in a factory function that returns a new chain for each row.
def create_agent(prompt, llm_with_tools):
    runnable_agent = (
        {
            "input": lambda x: x["input"],
            "agent_scratchpad": lambda x: format_to_openai_tool_messages(
                x["intermediate_steps"]
            ),
        }
        | prompt
        | llm_with_tools
        | OpenAIToolsAgentOutputParser()
    )
    return AgentExecutor(agent=runnable_agent, tools=tools, handle_parsing_errors=True)
```

### 3. मूल्यांकन कॉन्फ़िगर करें

यूआई में श्रृंखलाओं के परिणामों की तुलना करना प्रभावी है, लेकिन यह समय लेने वाला हो सकता है।
स्वचालित मीट्रिक्स और एआई-सहायता प्राप्त फ़ीडबैक का उपयोग करके आपके घटक के प्रदर्शन का मूल्यांकन करना मददगार हो सकता है।

नीचे, हम एक कस्टम रन मूल्यांकनकर्ता बनाएंगे जो एक अनुमानित मूल्यांकन लॉग करता है।

**अनुमानित मूल्यांकनकर्ता**

```python
from langsmith.evaluation import EvaluationResult
from langsmith.schemas import Example, Run


def check_not_idk(run: Run, example: Example):
    """Illustration of a custom evaluator."""
    agent_response = run.outputs["output"]
    if "don't know" in agent_response or "not sure" in agent_response:
        score = 0
    else:
        score = 1
    # You can access the dataset labels in example.outputs[key]
    # You can also access the model inputs in run.inputs[key]
    return EvaluationResult(
        key="not_uncertain",
        score=score,
    )
```

#### बैच मूल्यांकनकर्ता

कुछ मीट्रिक्स को पूरे "परीक्षण" पर एकत्रित किया जाता है, बिना किसी व्यक्तिगत रन/उदाहरणों को असाइन किए। ये सरल वर्गीकरण मीट्रिक्स जैसे सटीकता, पुनर्प्राप्ति या AUC हो सकते हैं, या यह कोई अन्य कस्टम एग्रीगेट मीट्रिक हो सकता है।

आप पूरे परीक्षण स्तर पर किसी भी बैच मीट्रिक को परिभाषित कर सकते हैं, एक फ़ंक्शन (या कोई भी कॉलेबल) को परिभाषित करके जो रन (सिस्टम ट्रेस) और उदाहरण (डेटासेट रिकॉर्ड) की सूची को स्वीकार करता है।

```python
from typing import List


def max_pred_length(runs: List[Run], examples: List[Example]):
    predictions = [len(run.outputs["output"]) for run in runs]
    return EvaluationResult(key="max_pred_length", score=max(predictions))
```

नीचे, हम उपरोक्त कस्टम मूल्यांकनकर्ता के साथ-साथ कुछ पूर्व-कार्यान्वित रन मूल्यांकनकर्ताओं को भी कॉन्फ़िगर करेंगे जो निम्नलिखित काम करते हैं:
- मूल सत्य लेबल के खिलाफ परिणामों की तुलना करें।
- एम्बेडिंग दूरी का उपयोग करके语义(असमानता) मापें
- कस्टम मानदंडों का उपयोग करके एजेंट के प्रतिक्रिया के 'पहलुओं' का संदर्भ-मुक्त रूप से मूल्यांकन करें

अपने उपयोग मामले के लिए उचित मूल्यांकनकर्ता का चयन करने और अपने कस्टम मूल्यांकनकर्ता कैसे बनाने के बारे में अधिक चर्चा के लिए, कृपया [LangSmith दस्तावेज](https://docs.smith.langchain.com/) देखें।

```python
from langchain.evaluation import EvaluatorType
from langchain.smith import RunEvalConfig

evaluation_config = RunEvalConfig(
    # Evaluators can either be an evaluator type (e.g., "qa", "criteria", "embedding_distance", etc.) or a configuration for that evaluator
    evaluators=[
        check_not_idk,
        # Measures whether a QA response is "Correct", based on a reference answer
        # You can also select via the raw string "qa"
        EvaluatorType.QA,
        # Measure the embedding distance between the output and the reference answer
        # Equivalent to: EvalConfig.EmbeddingDistance(embeddings=OpenAIEmbeddings())
        EvaluatorType.EMBEDDING_DISTANCE,
        # Grade whether the output satisfies the stated criteria.
        # You can select a default one such as "helpfulness" or provide your own.
        RunEvalConfig.LabeledCriteria("helpfulness"),
        # The LabeledScoreString evaluator outputs a score on a scale from 1-10.
        # You can use default criteria or write our own rubric
        RunEvalConfig.LabeledScoreString(
            {
                "accuracy": """
Score 1: The answer is completely unrelated to the reference.
Score 3: The answer has minor relevance but does not align with the reference.
Score 5: The answer has moderate relevance but contains inaccuracies.
Score 7: The answer aligns with the reference but has minor errors or omissions.
Score 10: The answer is completely accurate and aligns perfectly with the reference."""
            },
            normalize_by=10,
        ),
    ],
    batch_evaluators=[max_pred_length],
)
```

### 4. एजेंट और मूल्यांकनकर्ताओं को चलाएं

[run_on_dataset](https://api.python.langchain.com/en/latest/smith/langchain.smith.evaluation.runner_utils.run_on_dataset.html#langchain.smith.evaluation.runner_utils.run_on_dataset) (या असिंक्रोनस [arun_on_dataset](https://api.python.langchain.com/en/latest/smith/langchain.smith.evaluation.runner_utils.arun_on_dataset.html#langchain.smith.evaluation.runner_utils.arun_on_dataset)) फ़ंक्शन का उपयोग करके अपने मॉडल का मूल्यांकन करें। इससे निम्नलिखित होगा:
1. निर्दिष्ट डेटासेट से उदाहरण पंक्तियां प्राप्त करें।
2. प्रत्येक उदाहरण पर अपने एजेंट (या कोई भी कस्टम फ़ंक्शन) को चलाएं।
3. स्वचालित फ़ीडबैक उत्पन्न करने के लिए प्राप्त रन ट्रेस और संबंधित संदर्भ उदाहरणों पर मूल्यांकनकर्ताओं को लागू करें।

परिणाम LangSmith ऐप में दिखाई देंगे।

```python
from langchain import hub

# We will test this version of the prompt
prompt = hub.pull("wfh/langsmith-agent-prompt:798e7324")
```

```python
import functools

from langchain.smith import arun_on_dataset, run_on_dataset

chain_results = run_on_dataset(
    dataset_name=dataset_name,
    llm_or_chain_factory=functools.partial(
        create_agent, prompt=prompt, llm_with_tools=llm_with_tools
    ),
    evaluation=evaluation_config,
    verbose=True,
    client=client,
    project_name=f"tools-agent-test-5d466cbc-{unique_id}",
    # Project metadata communicates the experiment parameters,
    # Useful for reviewing the test results
    project_metadata={
        "env": "testing-notebook",
        "model": "gpt-3.5-turbo",
        "prompt": "5d466cbc",
    },
)

# Sometimes, the agent will error due to parsing issues, incompatible tool inputs, etc.
# These are logged as warnings here and captured as errors in the tracing UI.
```

### परीक्षण परिणामों की समीक्षा करें

आप ऊपर दिए गए आउटपुट में दिए गए URL पर क्लिक करके या LangSmith में "परीक्षण और डेटासेट" पृष्ठ पर नेविगेट करके नीचे दिए गए परीक्षण परिणाम ट्रेसिंग UI की समीक्षा कर सकते हैं **"agent-qa-{unique_id}"** डेटासेट।

![परीक्षण परिणाम](./img/test_results.png)

यह नए रन और चयनित मूल्यांकनकर्ताओं से लॉग किए गए फ़ीडबैक को दिखाएगा। आप नीचे तालिकात्मक प्रारूप में परिणामों का सारांश भी देख सकते हैं।

```python
chain_results.to_dataframe()
```

### (वैकल्पिक) किसी अन्य प्रॉम्प्ट से तुलना करें

अब जब हमारे परीक्षण रन परिणाम हैं, तो हम अपने एजेंट में परिवर्तन कर सकते हैं और उन्हें बेंचमार्क कर सकते हैं। चलो एक अलग प्रॉम्प्ट के साथ इसे फिर से देखते हैं और परिणाम देखते हैं।

```python
candidate_prompt = hub.pull("wfh/langsmith-agent-prompt:39f3bbd0")

chain_results = run_on_dataset(
    dataset_name=dataset_name,
    llm_or_chain_factory=functools.partial(
        create_agent, prompt=candidate_prompt, llm_with_tools=llm_with_tools
    ),
    evaluation=evaluation_config,
    verbose=True,
    client=client,
    project_name=f"tools-agent-test-39f3bbd0-{unique_id}",
    project_metadata={
        "env": "testing-notebook",
        "model": "gpt-3.5-turbo",
        "prompt": "39f3bbd0",
    },
)
```

## डेटासेट और रन निर्यात करना

LangSmith आपको वेब ऐप में सीधे CSV या JSONL जैसे सामान्य प्रारूपों में डेटा निर्यात करने देता है। आप क्लाइंट का उपयोग करके भी रन ट्रेस प्राप्त कर सकते हैं, अपने स्वयं के डेटाबेस में संग्रहीत करने के लिए, या दूसरों के साथ साझा करने के लिए। चलो मूल्यांकन रन से रन ट्रेस प्राप्त करते हैं।

**ध्यान दें: सभी रन तक पहुंचने में कुछ समय लग सकता है।**

```python
runs = client.list_runs(project_name=chain_results["project_name"], execution_order=1)
```

```python
# The resulting tests are stored in a project.  You can programmatically
# access important metadata from the test, such as the dataset version it was run on
# or your application's revision ID.
client.read_project(project_name=chain_results["project_name"]).metadata
```

```python
# After some time, the test metrics will be populated as well.
client.read_project(project_name=chain_results["project_name"]).feedback_stats
```

## निष्कर्ष

बधाई हो! आपने सफलतापूर्वक LangSmith का उपयोग करके एक एजेंट का ट्रेस और मूल्यांकन किया है!

यह शुरुआत करने के लिए एक त्वरित गाइड था, लेकिन आप LangSmith का उपयोग करके अपने डेवलपर प्रवाह को तेज करने और बेहतर परिणाम प्राप्त करने के लिए और भी कई तरीके हैं।

LangSmith से अधिकतम लाभ उठाने के बारे में अधिक जानकारी के लिए, [LangSmith दस्तावेज](https://docs.smith.langchain.com/) देखें, और कृपया [support@langchain.dev](mailto:support@langchain.dev) पर प्रश्न, सुविधा अनुरोध या प्रतिक्रिया के साथ संपर्क करें।
