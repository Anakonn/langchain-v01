---
translated: true
---

यह दस्तावेज़ अनुवादित नहीं है।

# टाइटन टेकऑफ

`TitanML` हमारे प्रशिक्षण, संपीड़न और अनुमान अनुकूलन प्लेटफ़ॉर्म के माध्यम से व्यवसायों को बेहतर, छोटे, सस्ते और तेज़ एनएलपी मॉडल बनाने और तैनात करने में मदद करता है।

हमारा अनुमान सर्वर, [टाइटन टेकऑफ](https://docs.titanml.co/docs/intro) एकल कमांड में आपके हार्डवेयर पर स्थानीय रूप से एलएलएम तैनात करने में सक्षम बनाता है। फ़ाल्कन, Llama 2, GPT2, T5 और कई अन्य जैसी अधिकांश जनरेटिव मॉडल वास्तुकलाएं समर्थित हैं। यदि आप किसी विशिष्ट मॉडल के साथ समस्या का अनुभव करते हैं, तो कृपया हमें hello@titanml.co पर बताएं।

## उदाहरण उपयोग

यहां टाइटन टेकऑफ़ सर्वर का उपयोग शुरू करने में मदद करने के लिए कुछ उपयोगी उदाहरण हैं। आपको यह सुनिश्चित करना होगा कि टेकऑफ़ सर्वर पृष्ठभूमि में चालू है इन कमांडों को चलाने से पहले। अधिक जानकारी के लिए [टेकऑफ़ लॉन्च करने के लिए दस्तावेज़ पृष्ठ](https://docs.titanml.co/docs/Docs/launching/) देखें।

```python
import time

from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

# Note importing TitanTakeoffPro instead of TitanTakeoff will work as well both use same object under the hood
from langchain_community.llms import TitanTakeoff
from langchain_core.prompts import PromptTemplate
```

### उदाहरण 1

मानते हुए कि टेकऑफ़ आपके मशीन पर डिफ़ॉल्ट पोर्ट्स (यानी localhost:3000) का उपयोग कर रहा है।

```python
llm = TitanTakeoff()
output = llm.invoke("What is the weather in London in August?")
print(output)
```

### उदाहरण 2

पोर्ट और अन्य जनरेशन पैरामीटर निर्दिष्ट करना

```python
llm = TitanTakeoff(port=3000)
# A comprehensive list of parameters can be found at https://docs.titanml.co/docs/next/apis/Takeoff%20inference_REST_API/generate#request
output = llm.invoke(
    "What is the largest rainforest in the world?",
    consumer_group="primary",
    min_new_tokens=128,
    max_new_tokens=512,
    no_repeat_ngram_size=2,
    sampling_topk=1,
    sampling_topp=1.0,
    sampling_temperature=1.0,
    repetition_penalty=1.0,
    regex_string="",
    json_schema=None,
)
print(output)
```

### उदाहरण 3

कई इनपुट का उपयोग करके generate का उपयोग करना

```python
llm = TitanTakeoff()
rich_output = llm.generate(["What is Deep Learning?", "What is Machine Learning?"])
print(rich_output.generations)
```

### उदाहरण 4

स्ट्रीमिंग आउटपुट

```python
llm = TitanTakeoff(
    streaming=True, callback_manager=CallbackManager([StreamingStdOutCallbackHandler()])
)
prompt = "What is the capital of France?"
output = llm.invoke(prompt)
print(output)
```

### उदाहरण 5

LCEL का उपयोग करना

```python
llm = TitanTakeoff()
prompt = PromptTemplate.from_template("Tell me about {topic}")
chain = prompt | llm
output = chain.invoke({"topic": "the universe"})
print(output)
```

### उदाहरण 6

TitanTakeoff Python Wrapper का उपयोग करके रीडर शुरू करना। यदि आपने पहली बार टेकऑफ़ लॉन्च करते समय कोई रीडर नहीं बनाए हैं, या आप एक और जोड़ना चाहते हैं, तो आप TitanTakeoff ऑब्जेक्ट को इनिशियलाइज़ करते समय ऐसा कर सकते हैं। बस `models` पैरामीटर के रूप में आप शुरू करना चाहते मॉडल कॉन्फ़िगरेशन की सूची पास करें।

```python
# Model config for the llama model, where you can specify the following parameters:
#   model_name (str): The name of the model to use
#   device: (str): The device to use for inference, cuda or cpu
#   consumer_group (str): The consumer group to place the reader into
#   tensor_parallel (Optional[int]): The number of gpus you would like your model to be split across
#   max_seq_length (int): The maximum sequence length to use for inference, defaults to 512
#   max_batch_size (int_: The max batch size for continuous batching of requests
llama_model = {
    "model_name": "TheBloke/Llama-2-7b-Chat-AWQ",
    "device": "cuda",
    "consumer_group": "llama",
}
llm = TitanTakeoff(models=[llama_model])

# The model needs time to spin up, length of time need will depend on the size of model and your network connection speed
time.sleep(60)

prompt = "What is the capital of France?"
output = llm.invoke(prompt, consumer_group="llama")
print(output)
```
