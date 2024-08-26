---
translated: true
---

# vLLM

[vLLM](https://vllm.readthedocs.io/en/latest/index.html) एक त्वरित और आसान-उपयोग वाली लाइब्रेरी है जो LLM अनुमान और सर्विंग प्रदान करती है, जिसमें निम्नलिखित शामिल हैं:

* राज्य-ऑफ-द-आर्ट सर्विंग थ्रूपुट
* PagedAttention के साथ ध्यान कुंजी और मूल्य मेमोरी का कुशल प्रबंधन
* आने वाले अनुरोधों का लगातार बैचिंग
* अनुकूलित CUDA कर्नल

यह नोटबुक बताता है कि langchain और vLLM के साथ LLM का उपयोग कैसे किया जाए।

उपयोग करने के लिए, आपके पास `vllm` पायथन पैकेज स्थापित होना चाहिए।

```python
%pip install --upgrade --quiet  vllm -q
```

```python
from langchain_community.llms import VLLM

llm = VLLM(
    model="mosaicml/mpt-7b",
    trust_remote_code=True,  # mandatory for hf models
    max_new_tokens=128,
    top_k=10,
    top_p=0.95,
    temperature=0.8,
)

print(llm.invoke("What is the capital of France ?"))
```

```output
INFO 08-06 11:37:33 llm_engine.py:70] Initializing an LLM engine with config: model='mosaicml/mpt-7b', tokenizer='mosaicml/mpt-7b', tokenizer_mode=auto, trust_remote_code=True, dtype=torch.bfloat16, use_dummy_weights=False, download_dir=None, use_np_weights=False, tensor_parallel_size=1, seed=0)
INFO 08-06 11:37:41 llm_engine.py:196] # GPU blocks: 861, # CPU blocks: 512

Processed prompts: 100%|██████████| 1/1 [00:00<00:00,  2.00it/s]


What is the capital of France ? The capital of France is Paris.


```

## एक LLMChain में मॉडल एकीकृत करें

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

question = "Who was the US president in the year the first Pokemon game was released?"

print(llm_chain.invoke(question))
```

```output
Processed prompts: 100%|██████████| 1/1 [00:01<00:00,  1.34s/it]



1. The first Pokemon game was released in 1996.
2. The president was Bill Clinton.
3. Clinton was president from 1993 to 2001.
4. The answer is Clinton.


```

## वितरित अनुमान

vLLM वितरित टेंसर-समानांतर अनुमान और सर्विंग का समर्थन करता है।

LLM वर्ग के साथ बहु-GPU अनुमान चलाने के लिए, `tensor_parallel_size` तर्क को उपयोग करने वाले GPU की संख्या पर सेट करें। उदाहरण के लिए, 4 GPU पर अनुमान चलाने के लिए

```python
from langchain_community.llms import VLLM

llm = VLLM(
    model="mosaicml/mpt-30b",
    tensor_parallel_size=4,
    trust_remote_code=True,  # mandatory for hf models
)

llm.invoke("What is the future of AI?")
```

## क्वांटीकरण

vLLM `awq` क्वांटीकरण का समर्थन करता है। इसे सक्षम करने के लिए, `vllm_kwargs` में `quantization` पास करें।

```python
llm_q = VLLM(
    model="TheBloke/Llama-2-7b-Chat-AWQ",
    trust_remote_code=True,
    max_new_tokens=512,
    vllm_kwargs={"quantization": "awq"},
)
```

## OpenAI-संगत सर्वर

vLLM को OpenAI API प्रोटोकॉल का अनुकरण करने वाले एक सर्वर के रूप में तैनात किया जा सकता है। यह OpenAI API का उपयोग करने वाले अनुप्रयोगों के लिए vLLM को एक ड्रॉप-इन प्रतिस्थापन के रूप में उपयोग करने की अनुमति देता है।

इस सर्वर को OpenAI API के समान प्रारूप में क्वेरी किया जा सकता है।

### OpenAI-संगत पूर्णता

```python
from langchain_community.llms import VLLMOpenAI

llm = VLLMOpenAI(
    openai_api_key="EMPTY",
    openai_api_base="http://localhost:8000/v1",
    model_name="tiiuae/falcon-7b",
    model_kwargs={"stop": ["."]},
)
print(llm.invoke("Rome is"))
```

```output
 a city that is filled with history, ancient buildings, and art around every corner
```
