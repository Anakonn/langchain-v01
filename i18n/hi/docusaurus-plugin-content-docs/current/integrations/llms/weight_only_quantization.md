---
translated: true
---

# इंटेल वेट-केवल क्वांटीकरण

## हगिंगफेस मॉडल्स के लिए वेट-केवल क्वांटीकरण इंटेल एक्सटेंशन के साथ ट्रांसफॉर्मर पाइपलाइन

हगिंगफेस मॉडल्स को `WeightOnlyQuantPipeline` क्लास के माध्यम से स्थानीय रूप से वेट-केवल क्वांटीकरण के साथ चलाया जा सकता है।

[हगिंगफेस मॉडल हब](https://huggingface.co/models) में 120k से अधिक मॉडल, 20k डेटासेट और 50k डेमो ऐप (स्पेस) होस्ट किए गए हैं, जो सभी ओपन सोर्स और सार्वजनिक रूप से उपलब्ध हैं, एक ऑनलाइन प्लेटफॉर्म पर जहां लोग आसानी से एमएल एक साथ बना सकते हैं।

इन्हें LangChain के माध्यम से इस स्थानीय पाइपलाइन रैपर क्लास से कॉल किया जा सकता है।

उपयोग करने के लिए, आपके पास `transformers` पायथन [पैकेज इंस्टॉल](https://pypi.org/project/transformers/) होना चाहिए, साथ ही [pytorch](https://pytorch.org/get-started/locally/), [intel-extension-for-transformers](https://github.com/intel/intel-extension-for-transformers) भी।

```python
%pip install transformers --quiet
%pip install intel-extension-for-transformers
```

### मॉडल लोडिंग

मॉडल को `from_model_id` विधि का उपयोग करके मॉडल पैरामीटर निर्दिष्ट करके लोड किया जा सकता है। मॉडल पैरामीटर में `WeightOnlyQuantConfig` क्लास शामिल है intel_extension_for_transformers में।

```python
from intel_extension_for_transformers.transformers import WeightOnlyQuantConfig
from langchain_community.llms.weight_only_quantization import WeightOnlyQuantPipeline

conf = WeightOnlyQuantConfig(weight_dtype="nf4")
hf = WeightOnlyQuantPipeline.from_model_id(
    model_id="google/flan-t5-large",
    task="text2text-generation",
    quantization_config=conf,
    pipeline_kwargs={"max_new_tokens": 10},
)
```

उन्हें एक मौजूदा `transformers` पाइपलाइन को सीधे पास करके भी लोड किया जा सकता है।

```python
from intel_extension_for_transformers.transformers import AutoModelForSeq2SeqLM
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline
from transformers import AutoTokenizer, pipeline

model_id = "google/flan-t5-large"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForSeq2SeqLM.from_pretrained(model_id)
pipe = pipeline(
    "text2text-generation", model=model, tokenizer=tokenizer, max_new_tokens=10
)
hf = WeightOnlyQuantPipeline(pipeline=pipe)
```

### श्रृंखला बनाना

मॉडल को मेमोरी में लोड करने के बाद, आप इसे प्रॉम्प्ट के साथ संयोजित कर सकते हैं ताकि एक श्रृंखला बन सके।

```python
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | hf

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

### सीपीयू इनफरेंस

अब intel-extension-for-transformers केवल सीपीयू डिवाइस इनफरेंस का समर्थन करता है। जल्द ही intel GPU का समर्थन करेगा।जब सीपीयू वाले मशीन पर चलाया जा रहा हो, तो आप `device="cpu"` या `device=-1` पैरामीटर निर्दिष्ट कर सकते हैं ताकि मॉडल को सीपीयू डिवाइस पर रखा जा सके।
डिफ़ॉल्ट रूप से सीपीयू इनफरेंस के लिए `-1` होता है।

```python
conf = WeightOnlyQuantConfig(weight_dtype="nf4")
llm = WeightOnlyQuantPipeline.from_model_id(
    model_id="google/flan-t5-large",
    task="text2text-generation",
    quantization_config=conf,
    pipeline_kwargs={"max_new_tokens": 10},
)

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | llm

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

### बैच सीपीयू इनफरेंस

आप सीपीयू पर बैच मोड में भी इनफरेंस चला सकते हैं।

```python
conf = WeightOnlyQuantConfig(weight_dtype="nf4")
llm = WeightOnlyQuantPipeline.from_model_id(
    model_id="google/flan-t5-large",
    task="text2text-generation",
    quantization_config=conf,
    pipeline_kwargs={"max_new_tokens": 10},
)

chain = prompt | llm.bind(stop=["\n\n"])

questions = []
for i in range(4):
    questions.append({"question": f"What is the number {i} in french?"})

answers = chain.batch(questions)
for answer in answers:
    print(answer)
```

### intel-extension-for-transformers द्वारा समर्थित डेटा प्रकार

हम निम्नलिखित डेटा प्रकारों में वजन को क्वांटाइज़ करने का समर्थन करते हैं (weight_dtype in WeightOnlyQuantConfig):

* **int8**: 8-बिट डेटा प्रकार का उपयोग करता है।
* **int4_fullrange**: -8 मान का उपयोग करता है int4 रेंज की तुलना में।
* **int4_clip**: int4 रेंज के भीतर मान को क्लिप करता है और शेष को शून्य पर सेट करता है।
* **nf4**: सामान्यीकृत फ़्लोट 4-बिट डेटा प्रकार का उपयोग करता है।
* **fp4_e2m1**: नियमित फ़्लोट 4-बिट डेटा प्रकार का उपयोग करता है। "e2" का अर्थ है कि 2 बिट एक्सपोनेंट के लिए उपयोग किए जाते हैं, और "m1" का अर्थ है कि 1 बिट मैंटिसा के लिए उपयोग किए जाते हैं।

इन तकनीकों के माध्यम से वजन 4 या 8 बिट में संग्रहित होते हैं, लेकिन गणना अभी भी float32, bfloat16 या int8(compute_dtype in WeightOnlyQuantConfig) में होती है:
* **fp32**: गणना के लिए float32 डेटा प्रकार का उपयोग करता है।
* **bf16**: गणना के लिए bfloat16 डेटा प्रकार का उपयोग करता है।
* **int8**: गणना के लिए 8-बिट डेटा प्रकार का उपयोग करता है।

### समर्थित एल्गोरिदम मैट्रिक्स

intel-extension-for-transformers में समर्थित क्वांटीकरण एल्गोरिदम(algorithm in WeightOnlyQuantConfig):

| एल्गोरिदम |   PyTorch  |    LLM Runtime    |
|:--------------:|:----------:|:----------:|
|       RTN      |  &#10004;  |  &#10004;  |
|       AWQ      |  &#10004;  | stay tuned |
|      TEQ      | &#10004; | stay tuned |
> **RTN:** एक क्वांटीकरण विधि जिसे हम बहुत सरल रूप से समझ सकते हैं। इसके लिए अतिरिक्त डेटासेट की आवश्यकता नहीं है और यह एक बहुत तेज़ क्वांटीकरण विधि है। सामान्य तौर पर, RTN वजन को एक समान रूप से वितरित इंटीजर डेटा प्रकार में परिवर्तित करेगा, लेकिन कुछ एल्गोरिदम, जैसे Qlora, एक असमान NF4 डेटा प्रकार का प्रस्ताव करते हैं और इसकी सैद्धांतिक श्रेष्ठता को सिद्ध करते हैं।

> **AWQ:** यह सिद्ध किया गया है कि केवल 1% प्रमुख वजन को सुरक्षित करके क्वांटीकरण त्रुटि को काफी कम किया जा सकता है। प्रमुख वजन चैनल को सक्रियण और वजन प्रति चैनल के वितरण को देखकर चयनित किया जाता है। प्रमुख वजन को भी एक बड़े स्केल गुणक से गुणा करके क्वांटीकृत किया जाता है ताकि सटीकता बनी रहे।

> **TEQ:** वेट-केवल क्वांटीकरण में FP32 सटीकता को बरकरार रखने के लिए एक प्रशिक्षित समकक्ष रूपांतरण। यह AWQ से प्रेरित है, जबकि सक्रियण और वजन के बीच अनुकूलतम प्रति-चैनल स्केलिंग कारक खोजने के लिए एक नया समाधान प्रदान करता है।
