---
translated: true
---

# ह्यूगिंग फ़ेस लोकल पाइपलाइन्स

ह्यूगिंग फ़ेस मॉडल को `HuggingFacePipeline` क्लास के माध्यम से स्थानीय रूप से चलाया जा सकता है।

[ह्यूगिंग फ़ेस मॉडल हब](https://huggingface.co/models) में 120k से अधिक मॉडल, 20k डेटासेट और 50k डेमो ऐप्स (स्पेस) हैं, जो सभी ओपन सोर्स और सार्वजनिक रूप से उपलब्ध हैं, एक ऑनलाइन प्लेटफ़ॉर्म पर जहां लोग आसानी से एमएल एक साथ बना सकते हैं।

इन्हें LangChain से इस स्थानीय पाइपलाइन रैपर के माध्यम से या HuggingFaceHub क्लास के माध्यम से उनके होस्ट किए गए अनुमान अंतःक्रियाओं को कॉल करके बुलाया जा सकता है।

उपयोग करने के लिए, आपके पास `transformers` पायथन [पैकेज इंस्टॉल](https://pypi.org/project/transformers/) होना चाहिए, साथ ही [pytorch](https://pytorch.org/get-started/locally/) भी। आप `xformer` भी इंस्टॉल कर सकते हैं जो ध्यान की अधिक मेमोरी-कुशल कार्यान्वयन प्रदान करता है।

```python
%pip install --upgrade --quiet  transformers --quiet
```

### मॉडल लोडिंग

मॉडल को `from_model_id` विधि का उपयोग करके मॉडल पैरामीटर निर्दिष्ट करके लोड किया जा सकता है।

```python
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline

hf = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    pipeline_kwargs={"max_new_tokens": 10},
)
```

उन्हें सीधे एक मौजूदा `transformers` पाइपलाइन को पास करके भी लोड किया जा सकता है।

```python
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

model_id = "gpt2"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)
pipe = pipeline("text-generation", model=model, tokenizer=tokenizer, max_new_tokens=10)
hf = HuggingFacePipeline(pipeline=pipe)
```

### श्रृंखला बनाना

मॉडल को मेमोरी में लोड करने के बाद, आप इसे प्रोम्प्ट के साथ संयोजित कर सकते हैं।

```python
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | hf

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

### जीपीयू अनुमान

जब जीपीयू वाले मशीन पर चलाया जा रहा हो, तो आप `device=n` पैरामीटर निर्दिष्ट कर सकते हैं ताकि मॉडल को निर्दिष्ट डिवाइस पर रखा जा सके।
डिफ़ॉल्ट रूप से सीपीयू अनुमान के लिए `-1` होता है।

यदि आपके पास एक से अधिक जीपीयू हैं और/या मॉडल एक ही जीपीयू के लिए बहुत बड़ा है, तो आप `device_map="auto"` निर्दिष्ट कर सकते हैं, जिसके लिए [Accelerate](https://huggingface.co/docs/accelerate/index) लाइब्रेरी की आवश्यकता होती है और उपयोग होती है ताकि मॉडल वजन को कैसे लोड करना है, यह स्वचालित रूप से निर्धारित किया जा सके।

*नोट*: `device` और `device_map` दोनों को एक साथ निर्दिष्ट नहीं किया जाना चाहिए और अप्रत्याशित व्यवहार का कारण बन सकता है।

```python
gpu_llm = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    device=0,  # replace with device_map="auto" to use the accelerate library.
    pipeline_kwargs={"max_new_tokens": 10},
)

gpu_chain = prompt | gpu_llm

question = "What is electroencephalography?"

print(gpu_chain.invoke({"question": question}))
```

### बैच जीपीयू अनुमान

यदि जीपीयू वाले डिवाइस पर चलाया जा रहा है, तो आप बैच मोड में भी जीपीयू पर अनुमान कर सकते हैं।

```python
gpu_llm = HuggingFacePipeline.from_model_id(
    model_id="bigscience/bloom-1b7",
    task="text-generation",
    device=0,  # -1 for CPU
    batch_size=2,  # adjust as needed based on GPU map and model size.
    model_kwargs={"temperature": 0, "max_length": 64},
)

gpu_chain = prompt | gpu_llm.bind(stop=["\n\n"])

questions = []
for i in range(4):
    questions.append({"question": f"What is the number {i} in french?"})

answers = gpu_chain.batch(questions)
for answer in answers:
    print(answer)
```

### OpenVINO बैकएंड के साथ अनुमान

OpenVINO के साथ एक मॉडल को तैनात करने के लिए, आप `backend="openvino"` पैरामीटर निर्दिष्ट कर सकते हैं जो OpenVINO को बैकएंड अनुमान फ्रेमवर्क के रूप में ट्रिगर करता है।

यदि आपके पास इंटेल जीपीयू है, तो आप `model_kwargs={"device": "GPU"}` निर्दिष्ट कर सकते हैं ताकि इसे उस पर चलाया जा सके।

```python
%pip install --upgrade-strategy eager "optimum[openvino,nncf]" --quiet
```

```python
ov_config = {"PERFORMANCE_HINT": "LATENCY", "NUM_STREAMS": "1", "CACHE_DIR": ""}

ov_llm = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    backend="openvino",
    model_kwargs={"device": "CPU", "ov_config": ov_config},
    pipeline_kwargs={"max_new_tokens": 10},
)

ov_chain = prompt | ov_llm

question = "What is electroencephalography?"

print(ov_chain.invoke({"question": question}))
```

### स्थानीय OpenVINO मॉडल के साथ अनुमान

यह संभव है कि आप अपने मॉडल को [निर्यात करें](https://github.com/huggingface/optimum-intel?tab=readme-ov-file#export) OpenVINO IR प्रारूप में CLI के साथ, और स्थानीय फ़ोल्डर से मॉडल को लोड करें।

```python
!optimum-cli export openvino --model gpt2 ov_model_dir
```

वजन क्वांटीकरण का उपयोग करके अनुमान लेटेंसी और मॉडल फुटप्रिंट को कम करने की सिफारिश की जाती है `--weight-format` का उपयोग करके:

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

ov_chain = prompt | ov_llm

question = "What is electroencephalography?"

print(ov_chain.invoke({"question": question}))
```

आप गतिविधि और KV-कैश क्वांटीकरण के साथ डायनेमिक क्वांटीकरण के साथ अतिरिक्त अनुमान गति सुधार प्राप्त कर सकते हैं। इन विकल्पों को `ov_config` के साथ सक्षम किया जा सकता है:

```python
ov_config = {
    "KV_CACHE_PRECISION": "u8",
    "DYNAMIC_QUANTIZATION_GROUP_SIZE": "32",
    "PERFORMANCE_HINT": "LATENCY",
    "NUM_STREAMS": "1",
    "CACHE_DIR": "",
}
```

अधिक जानकारी के लिए [OpenVINO LLM गाइड](https://docs.openvino.ai/2024/learn-openvino/llm_inference_guide.html) और [OpenVINO Local Pipelines नोटबुक](/docs/integrations/llms/openvino/) देखें।
