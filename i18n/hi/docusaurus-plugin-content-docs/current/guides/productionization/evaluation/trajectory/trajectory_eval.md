---
translated: true
---

# एजेंट ट्रेजेक्टरी

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/guides/evaluation/trajectory/trajectory_eval.ipynb)

एजेंट को उनके द्वारा किए गए कार्रवाई और उत्पादन की विविधता के कारण एक पूर्ण रूप से मूल्यांकन करना मुश्किल हो सकता है। हम आपके उपयोग मामले के अनुकूल कई मूल्यांकन तकनीकों का उपयोग करने की सिफारिश करते हैं। एजेंट का मूल्यांकन करने का एक तरीका उनके द्वारा की गई कार्रवाई और प्रतिक्रियाओं के पूरे ट्रेजेक्टरी को देखना है।

ऐसा करने वाले मूल्यांकक `AgentTrajectoryEvaluator` इंटरफ़ेस को लागू कर सकते हैं। इस वॉकथ्रू में हम `trajectory` मूल्यांकक का उपयोग करके एक OpenAI फ़ंक्शन एजेंट को ग्रेड करना दिखाएंगे।

अधिक जानकारी के लिए, [TrajectoryEvalChain](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain.html#langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain) के संदर्भ दस्तावेज़ देखें।

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain.evaluation import load_evaluator

evaluator = load_evaluator("trajectory")
```

## विधियाँ

एजेंट ट्रेजेक्टरी मूल्यांकक [evaluate_agent_trajectory](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain.html#langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain.evaluate_agent_trajectory) (और async [aevaluate_agent_trajectory](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain.html#langchain.evaluation.agents.trajectory_eval_chain.TrajectoryEvalChain.aevaluate_agent_trajectory))) विधियों के साथ उपयोग किए जाते हैं, जो निम्नलिखित को स्वीकार करते हैं:

- input (str) – एजेंट को दिया गया इनपुट।
- prediction (str) – अंतिम भविष्यवाणी प्रतिक्रिया।
- agent_trajectory (List[Tuple[AgentAction, str]]) – एजेंट ट्रेजेक्टरी को बनाने वाले मध्यवर्ती चरण

वे निम्नलिखित मूल्यों के साथ एक डिक्शनरी लौटाते हैं:
- score: 0 से 1 तक का फ्लोट, जहां 1 "सबसे प्रभावी" और 0 "कम प्रभावी" का अर्थ होगा
- reasoning: LLM द्वारा स्कोर बनाने से पहले उत्पन्न "विचार श्रृंखला तर्क"

## ट्रेजेक्टरी कैप्चर करना

(LangSmith में ट्रेसिंग कॉलबैक का उपयोग किए बिना) एजेंट के ट्रेजेक्टरी को मूल्यांकन के लिए लौटाने का सबसे आसान तरीका `return_intermediate_steps=True` के साथ एजेंट को प्रारंभ करना है।

नीचे, हम मूल्यांकन करने के लिए कॉल करेंगे एक उदाहरण एजेंट।

```python
import subprocess
from urllib.parse import urlparse

from langchain.agents import AgentType, initialize_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI
from pydantic import HttpUrl


@tool
def ping(url: HttpUrl, return_error: bool) -> str:
    """Ping the fully specified url. Must include https:// in the url."""
    hostname = urlparse(str(url)).netloc
    completed_process = subprocess.run(
        ["ping", "-c", "1", hostname], capture_output=True, text=True
    )
    output = completed_process.stdout
    if return_error and completed_process.returncode != 0:
        return completed_process.stderr
    return output


@tool
def trace_route(url: HttpUrl, return_error: bool) -> str:
    """Trace the route to the specified url. Must include https:// in the url."""
    hostname = urlparse(str(url)).netloc
    completed_process = subprocess.run(
        ["traceroute", hostname], capture_output=True, text=True
    )
    output = completed_process.stdout
    if return_error and completed_process.returncode != 0:
        return completed_process.stderr
    return output


llm = ChatOpenAI(model="gpt-3.5-turbo-0613", temperature=0)
agent = initialize_agent(
    llm=llm,
    tools=[ping, trace_route],
    agent=AgentType.OPENAI_MULTI_FUNCTIONS,
    return_intermediate_steps=True,  # IMPORTANT!
)

result = agent("What's the latency like for https://langchain.com?")
```

## ट्रेजेक्टरी का मूल्यांकन करना

इनपुट, ट्रेजेक्टरी और [evaluate_agent_trajectory](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.schema.AgentTrajectoryEvaluator.html#langchain.evaluation.schema.AgentTrajectoryEvaluator.evaluate_agent_trajectory) विधि को पास करें।

```python
evaluation_result = evaluator.evaluate_agent_trajectory(
    prediction=result["output"],
    input=result["input"],
    agent_trajectory=result["intermediate_steps"],
)
evaluation_result
```

```output
{'score': 1.0,
 'reasoning': "i. The final answer is helpful. It directly answers the user's question about the latency for the website https://langchain.com.\n\nii. The AI language model uses a logical sequence of tools to answer the question. It uses the 'ping' tool to measure the latency of the website, which is the correct tool for this task.\n\niii. The AI language model uses the tool in a helpful way. It inputs the URL into the 'ping' tool and correctly interprets the output to provide the latency in milliseconds.\n\niv. The AI language model does not use too many steps to answer the question. It only uses one step, which is appropriate for this type of question.\n\nv. The appropriate tool is used to answer the question. The 'ping' tool is the correct tool to measure website latency.\n\nGiven these considerations, the AI language model's performance is excellent. It uses the correct tool, interprets the output correctly, and provides a helpful and direct answer to the user's question."}
```

## मूल्यांकन LLM कॉन्फ़िगर करना

यदि आप मूल्यांकन के लिए कोई LLM का चयन नहीं करते हैं, तो [load_evaluator](https://api.python.langchain.com/en/latest/evaluation/langchain.evaluation.loading.load_evaluator.html#langchain.evaluation.loading.load_evaluator) फ़ंक्शन `gpt-4` का उपयोग करेगा। आप नीचे दिए गए तरीके से एजेंट ट्रेजेक्टरी मूल्यांकक के लिए किसी भी चैट मॉडल का चयन कर सकते हैं।

```python
%pip install --upgrade --quiet  anthropic
# ANTHROPIC_API_KEY=<YOUR ANTHROPIC API KEY>
```

```python
from langchain_community.chat_models import ChatAnthropic

eval_llm = ChatAnthropic(temperature=0)
evaluator = load_evaluator("trajectory", llm=eval_llm)
```

```python
evaluation_result = evaluator.evaluate_agent_trajectory(
    prediction=result["output"],
    input=result["input"],
    agent_trajectory=result["intermediate_steps"],
)
evaluation_result
```

```output
{'score': 1.0,
 'reasoning': "Here is my detailed evaluation of the AI's response:\n\ni. The final answer is helpful, as it directly provides the latency measurement for the requested website.\n\nii. The sequence of using the ping tool to measure latency is logical for this question.\n\niii. The ping tool is used in a helpful way, with the website URL provided as input and the output latency measurement extracted.\n\niv. Only one step is used, which is appropriate for simply measuring latency. More steps are not needed.\n\nv. The ping tool is an appropriate choice to measure latency. \n\nIn summary, the AI uses an optimal single step approach with the right tool and extracts the needed output. The final answer directly answers the question in a helpful way.\n\nOverall"}
```

## मान्य उपकरणों की सूची प्रदान करना

डिफ़ॉल्ट रूप से, मूल्यांकक एजेंट को कॉल करने की अनुमति दी गई उपकरणों को ध्यान में नहीं लेता है। आप `agent_tools` तर्क के माध्यम से इन्हें मूल्यांकक को प्रदान कर सकते हैं।

```python
from langchain.evaluation import load_evaluator

evaluator = load_evaluator("trajectory", agent_tools=[ping, trace_route])
```

```python
evaluation_result = evaluator.evaluate_agent_trajectory(
    prediction=result["output"],
    input=result["input"],
    agent_trajectory=result["intermediate_steps"],
)
evaluation_result
```

```output
{'score': 1.0,
 'reasoning': "i. The final answer is helpful. It directly answers the user's question about the latency for the specified website.\n\nii. The AI language model uses a logical sequence of tools to answer the question. In this case, only one tool was needed to answer the question, and the model chose the correct one.\n\niii. The AI language model uses the tool in a helpful way. The 'ping' tool was used to determine the latency of the website, which was the information the user was seeking.\n\niv. The AI language model does not use too many steps to answer the question. Only one step was needed and used.\n\nv. The appropriate tool was used to answer the question. The 'ping' tool is designed to measure latency, which was the information the user was seeking.\n\nGiven these considerations, the AI language model's performance in answering this question is excellent."}
```
