---
translated: true
---

# OpenVINO

[OpenVINO™](https://github.com/openvinotoolkit/openvino) एक ओपन-सोर्स टूलकिट है जो AI inference को अनुकूलित और तैनात करने के लिए है। OpenVINO™ Runtime विभिन्न [उपकरणों](https://github.com/openvinotoolkit/openvino?tab=readme-ov-file#supported-hardware-matrix) पर अनुकूलित किए गए एक ही मॉडल को चलाने में सक्षम हो सकता है। भाषा + LLMs, कंप्यूटर विजन, ऑटोमैटिक स्पीच पहचान और अधिक जैसे उपयोग मामलों में अपने गहन सीखने के प्रदर्शन को त्वरित करें।

OpenVINO मॉडल को `HuggingFacePipeline` [क्लास](https://python.langchain.com/docs/integrations/llms/huggingface_pipeline) के माध्यम से स्थानीय रूप से चलाया जा सकता है। OpenVINO को बैकएंड अनुमान फ्रेमवर्क के रूप में उपयोग करने के लिए, आप `backend="openvino"` पैरामीटर निर्दिष्ट कर सकते हैं।

उपयोग करने के लिए, आपके पास `optimum-intel` के साथ OpenVINO Accelerator पायथन [पैकेज इंस्टॉल](https://github.com/huggingface/optimum-intel?tab=readme-ov-file#installation) होना चाहिए।

```python
%pip install --upgrade-strategy eager "optimum[openvino,nncf]" --quiet
```

### मॉडल लोडिंग

मॉडल को `from_model_id` विधि का उपयोग करके मॉडल पैरामीटर निर्दिष्ट करके लोड किया जा सकता है।

यदि आपके पास Intel GPU है, तो आप `model_kwargs={"device": "GPU"}` निर्दिष्ट कर सकते हैं ताकि इसे GPU पर चलाया जा सके।

```python
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline

ov_config = {"PERFORMANCE_HINT": "LATENCY", "NUM_STREAMS": "1", "CACHE_DIR": ""}

ov_llm = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    backend="openvino",
    model_kwargs={"device": "CPU", "ov_config": ov_config},
    pipeline_kwargs={"max_new_tokens": 10},
)
```

वे एक मौजूदा [`optimum-intel`](https://huggingface.co/docs/optimum/main/en/intel/inference) पाइपलाइन को सीधे पास करके भी लोड किए जा सकते हैं।

```python
from optimum.intel.openvino import OVModelForCausalLM
from transformers import AutoTokenizer, pipeline

model_id = "gpt2"
device = "CPU"
tokenizer = AutoTokenizer.from_pretrained(model_id)
ov_model = OVModelForCausalLM.from_pretrained(
    model_id, export=True, device=device, ov_config=ov_config
)
ov_pipe = pipeline(
    "text-generation", model=ov_model, tokenizer=tokenizer, max_new_tokens=10
)
ov_llm = HuggingFacePipeline(pipeline=ov_pipe)
```

### श्रृंखला बनाएं

मॉडल को मेमोरी में लोड करने के बाद, आप इसे प्रॉम्प्ट के साथ संयोजित कर सकते हैं।

```python
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | ov_llm

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

### स्थानीय OpenVINO मॉडल के साथ अनुमान

CLI के साथ अपने मॉडल को OpenVINO IR प्रारूप में [निर्यात करना](https://github.com/huggingface/optimum-intel?tab=readme-ov-file#export) संभव है, और स्थानीय फोल्डर से मॉडल को लोड किया जा सकता है।

```python
!optimum-cli export openvino --model gpt2 ov_model_dir
```

अनुमान लेटेंसी और मॉडल फुटप्रिंट को कम करने के लिए `--weight-format` का उपयोग करके 8 या 4-बिट वजन क्वांटीकरण लागू करना अनुशंसित है:

```python
!optimum-cli export openvino --model gpt2  --weight-format int8 ov_model_dir # for 8-bit quantization

!optimum-cli export openvino --model gpt2  --weight-format int4 ov_model_dir # for 4-bit quantization
```

```python
ov_llm = HuggingFacePipeline.from_model_id(
    model_id="ov_model_dir",
    task="text-generation",
    backend="openvino",
    model_kwargs={"device": "CPU", "ov_config": ov_config},
    pipeline_kwargs={"max_new_tokens": 10},
)

chain = prompt | ov_llm

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

आप `ov_config` के साथ गतिशील क्वांटीकरण और KV-कैश क्वांटीकरण को सक्षम करके अतिरिक्त अनुमान गति सुधार प्राप्त कर सकते हैं।

```python
ov_config = {
    "KV_CACHE_PRECISION": "u8",
    "DYNAMIC_QUANTIZATION_GROUP_SIZE": "32",
    "PERFORMANCE_HINT": "LATENCY",
    "NUM_STREAMS": "1",
    "CACHE_DIR": "",
}
```

अधिक जानकारी के लिए देखें:

* [OpenVINO LLM गाइड](https://docs.openvino.ai/2024/learn-openvino/llm_inference_guide.html)।

* [OpenVINO प्रलेखन](https://docs.openvino.ai/2024/home.html)।

* [OpenVINO शुरू करने का गाइड](https://www.intel.com/content/www/us/en/content-details/819067/openvino-get-started-guide.html)।

* [LangChain के साथ RAG नोटबुक](https://github.com/openvinotoolkit/openvino_notebooks/tree/latest/notebooks/llm-rag-langchain)।
