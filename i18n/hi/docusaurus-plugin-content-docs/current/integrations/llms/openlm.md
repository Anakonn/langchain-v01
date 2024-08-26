---
translated: true
---

# OpenLM

[OpenLM](https://github.com/r2d4/openlm) एक शून्य-निर्भरता वाला OpenAI-संगत LLM प्रदाता है जो HTTP के माध्यम से सीधे विभिन्न अनुमान अंतःक्रिया बिंदुओं को कॉल कर सकता है।

यह OpenAI पूर्णता वर्ग को लागू करता है ताकि यह OpenAI API के लिए एक ड्रॉप-इन प्रतिस्थापन के रूप में उपयोग किया जा सके। यह बदलाव न्यूनतम जोड़े गए कोड के लिए BaseOpenAI का उपयोग करता है।

यह उदाहरण LangChain का उपयोग करके OpenAI और HuggingFace दोनों के साथ कैसे बातचीत करें, इस बारे में बताता है। आपको दोनों से API कुंजियां चाहिए होंगी।

### सेटअप

निर्भरताएं स्थापित करें और API कुंजियां सेट करें।

```python
# Uncomment to install openlm and openai if you haven't already

%pip install --upgrade --quiet  openlm
%pip install --upgrade --quiet  langchain-openai
```

```python
import os
from getpass import getpass

# Check if OPENAI_API_KEY environment variable is set
if "OPENAI_API_KEY" not in os.environ:
    print("Enter your OpenAI API key:")
    os.environ["OPENAI_API_KEY"] = getpass()

# Check if HF_API_TOKEN environment variable is set
if "HF_API_TOKEN" not in os.environ:
    print("Enter your HuggingFace Hub API key:")
    os.environ["HF_API_TOKEN"] = getpass()
```

### LangChain का उपयोग करके OpenLM का उपयोग करना

यहां हम दो मॉडल को एक LLMChain में कॉल करने जा रहे हैं, OpenAI से `text-davinci-003` और HuggingFace पर `gpt2`।

```python
from langchain.chains import LLMChain
from langchain_community.llms import OpenLM
from langchain_core.prompts import PromptTemplate
```

```python
question = "What is the capital of France?"
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)

for model in ["text-davinci-003", "huggingface.co/gpt2"]:
    llm = OpenLM(model=model)
    llm_chain = LLMChain(prompt=prompt, llm=llm)
    result = llm_chain.run(question)
    print(
        """Model: {}
Result: {}""".format(model, result)
    )
```

```output
Model: text-davinci-003
Result:  France is a country in Europe. The capital of France is Paris.
Model: huggingface.co/gpt2
Result: Question: What is the capital of France?

Answer: Let's think step by step. I am not going to lie, this is a complicated issue, and I don't see any solutions to all this, but it is still far more
```
