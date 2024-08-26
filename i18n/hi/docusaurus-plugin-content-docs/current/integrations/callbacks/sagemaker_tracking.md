---
translated: true
---

# SageMaker ट्रैकिंग

>[Amazon SageMaker](https://aws.amazon.com/sagemaker/) एक पूरी तरह से प्रबंधित सेवा है जिसका उपयोग मशीन लर्निंग (ML) मॉडल को तेजी से और आसानी से बनाने, प्रशिक्षित करने और तैनात करने के लिए किया जाता है।

>[Amazon SageMaker Experiments](https://docs.aws.amazon.com/sagemaker/latest/dg/experiments.html) `Amazon SageMaker` की एक क्षमता है जो आपको ML प्रयोगों और मॉडल संस्करणों को संगठित, ट्रैक, तुलना और मूल्यांकन करने देती है।

यह नोटबुक दिखाता है कि LangChain कॉलबैक का उपयोग कैसे किया जा सकता है ताकि प्रॉम्प्ट और अन्य LLM हाइपरपैरामीटर को `SageMaker Experiments` में लॉग और ट्रैक किया जा सके। यहां, हम विभिन्न परिदृश्यों का उपयोग करके क्षमता को प्रदर्शित करते हैं:

* **परिदृश्य 1**: *एकल LLM* - एक मामला जहां एक ही LLM मॉडल का उपयोग किया जाता है ताकि दिए गए प्रॉम्प्ट के आधार पर आउटपुट उत्पन्न किया जा सके।
* **परिदृश्य 2**: *क्रमिक श्रृंखला* - एक मामला जहां दो LLM मॉडलों की एक क्रमिक श्रृंखला का उपयोग किया जाता है।
* **परिदृश्य 3**: *एजेंट के साथ उपकरण (विचार श्रृंखला)* - एक मामला जहां एक LLM के अलावा खोज और गणित जैसे कई उपकरणों का उपयोग किया जाता है।

इस नोटबुक में, हम प्रत्येक परिदृश्य से प्रॉम्प्ट को लॉग करने के लिए एक ही प्रयोग बनाएंगे।

## इंस्टॉलेशन और सेटअप

```python
%pip install --upgrade --quiet  sagemaker
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  google-search-results
```

पहले, आवश्यक API कुंजियों को सेट करें

* OpenAI: https://platform.openai.com/account/api-keys (OpenAI LLM मॉडल के लिए)
* Google SERP API: https://serpapi.com/manage-api-key (Google Search Tool के लिए)

```python
import os

## Add your API keys below
os.environ["OPENAI_API_KEY"] = "<ADD-KEY-HERE>"
os.environ["SERPAPI_API_KEY"] = "<ADD-KEY-HERE>"
```

```python
from langchain_community.callbacks.sagemaker_callback import SageMakerCallbackHandler
```

```python
from langchain.agents import initialize_agent, load_tools
from langchain.chains import LLMChain, SimpleSequentialChain
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
from sagemaker.analytics import ExperimentAnalytics
from sagemaker.experiments.run import Run
from sagemaker.session import Session
```

## LLM प्रॉम्प्ट ट्रैकिंग

```python
# LLM Hyperparameters
HPARAMS = {
    "temperature": 0.1,
    "model_name": "gpt-3.5-turbo-instruct",
}

# Bucket used to save prompt logs (Use `None` is used to save the default bucket or otherwise change it)
BUCKET_NAME = None

# Experiment name
EXPERIMENT_NAME = "langchain-sagemaker-tracker"

# Create SageMaker Session with the given bucket
session = Session(default_bucket=BUCKET_NAME)
```

### परिदृश्य 1 - LLM

```python
RUN_NAME = "run-scenario-1"
PROMPT_TEMPLATE = "tell me a joke about {topic}"
INPUT_VARIABLES = {"topic": "fish"}
```

```python
with Run(
    experiment_name=EXPERIMENT_NAME, run_name=RUN_NAME, sagemaker_session=session
) as run:
    # Create SageMaker Callback
    sagemaker_callback = SageMakerCallbackHandler(run)

    # Define LLM model with callback
    llm = OpenAI(callbacks=[sagemaker_callback], **HPARAMS)

    # Create prompt template
    prompt = PromptTemplate.from_template(template=PROMPT_TEMPLATE)

    # Create LLM Chain
    chain = LLMChain(llm=llm, prompt=prompt, callbacks=[sagemaker_callback])

    # Run chain
    chain.run(**INPUT_VARIABLES)

    # Reset the callback
    sagemaker_callback.flush_tracker()
```

### परिदृश्य 2 - क्रमिक श्रृंखला

```python
RUN_NAME = "run-scenario-2"

PROMPT_TEMPLATE_1 = """You are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: {title}
Playwright: This is a synopsis for the above play:"""
PROMPT_TEMPLATE_2 = """You are a play critic from the New York Times. Given the synopsis of play, it is your job to write a review for that play.
Play Synopsis: {synopsis}
Review from a New York Times play critic of the above play:"""

INPUT_VARIABLES = {
    "input": "documentary about good video games that push the boundary of game design"
}
```

```python
with Run(
    experiment_name=EXPERIMENT_NAME, run_name=RUN_NAME, sagemaker_session=session
) as run:
    # Create SageMaker Callback
    sagemaker_callback = SageMakerCallbackHandler(run)

    # Create prompt templates for the chain
    prompt_template1 = PromptTemplate.from_template(template=PROMPT_TEMPLATE_1)
    prompt_template2 = PromptTemplate.from_template(template=PROMPT_TEMPLATE_2)

    # Define LLM model with callback
    llm = OpenAI(callbacks=[sagemaker_callback], **HPARAMS)

    # Create chain1
    chain1 = LLMChain(llm=llm, prompt=prompt_template1, callbacks=[sagemaker_callback])

    # Create chain2
    chain2 = LLMChain(llm=llm, prompt=prompt_template2, callbacks=[sagemaker_callback])

    # Create Sequential chain
    overall_chain = SimpleSequentialChain(
        chains=[chain1, chain2], callbacks=[sagemaker_callback]
    )

    # Run overall sequential chain
    overall_chain.run(**INPUT_VARIABLES)

    # Reset the callback
    sagemaker_callback.flush_tracker()
```

### परिदृश्य 3 - एजेंट के साथ उपकरण

```python
RUN_NAME = "run-scenario-3"
PROMPT_TEMPLATE = "Who is the oldest person alive? And what is their current age raised to the power of 1.51?"
```

```python
with Run(
    experiment_name=EXPERIMENT_NAME, run_name=RUN_NAME, sagemaker_session=session
) as run:
    # Create SageMaker Callback
    sagemaker_callback = SageMakerCallbackHandler(run)

    # Define LLM model with callback
    llm = OpenAI(callbacks=[sagemaker_callback], **HPARAMS)

    # Define tools
    tools = load_tools(["serpapi", "llm-math"], llm=llm, callbacks=[sagemaker_callback])

    # Initialize agent with all the tools
    agent = initialize_agent(
        tools, llm, agent="zero-shot-react-description", callbacks=[sagemaker_callback]
    )

    # Run agent
    agent.run(input=PROMPT_TEMPLATE)

    # Reset the callback
    sagemaker_callback.flush_tracker()
```

## लॉग डेटा लोड करें

एक बार प्रॉम्प्ट लॉग हो जाने के बाद, हम उन्हें आसानी से लोड और Pandas DataFrame में रूपांतरित कर सकते हैं।

```python
# Load
logs = ExperimentAnalytics(experiment_name=EXPERIMENT_NAME)

# Convert as pandas dataframe
df = logs.dataframe(force_refresh=True)

print(df.shape)
df.head()
```

जैसा कि ऊपर देखा जा सकता है, प्रयोग में तीन रन (पंक्तियां) हैं जो प्रत्येक परिदृश्य से संबंधित हैं। प्रत्येक रन में प्रॉम्प्ट और संबंधित LLM सेटिंग्स/हाइपरपैरामीटर को json के रूप में लॉग किया जाता है और s3 बकेट में सहेजा जाता है। आप प्रत्येक json पथ से लॉग डेटा को लोड और अन्वेषण करने के लिए स्वतंत्र हैं।
