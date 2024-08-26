---
translated: true
---

# टाइटन टेकऑफ

`TitanML` व्यवसायों को हमारे प्रशिक्षण, संकुचन और अनुमान अनुकूलन प्लेटफ़ॉर्म के माध्यम से बेहतर, छोटे, सस्ते और तेज़ एनएलपी मॉडल बनाने और तैनात करने में मदद करता है।

हमारा अनुमान सर्वर, [टाइटन टेकऑफ](https://docs.titanml.co/docs/intro) एकल कमांड में आपके हार्डवेयर पर स्थानीय रूप से एलएलएम तैनात करने में सक्षम बनाता है। अधिकांश एम्बेडिंग मॉडल बॉक्स से समर्थित हैं, यदि आप किसी विशिष्ट मॉडल के साथ समस्या का अनुभव करते हैं, तो कृपया हमें hello@titanml.co पर बताएं।

## उदाहरण उपयोग

टाइटन टेकऑफ सर्वर को चलाने से पहले इन कमांडों को चलाने के लिए कुछ उपयोगी उदाहरण यहां दिए गए हैं। आप सुनिश्चित करें कि टेकऑफ सर्वर पृष्ठभूमि में चालू है। अधिक जानकारी के लिए [टेकऑफ लॉन्च करने के लिए दस्तावेज़ पृष्ठ](https://docs.titanml.co/docs/Docs/launching/) देखें।

```python
import time

from langchain_community.embeddings import TitanTakeoffEmbed
```

### उदाहरण 1

मान लें कि टेकऑफ आपके मशीन पर डिफ़ॉल्ट पोर्ट (यानी localhost:3000) का उपयोग करके चल रहा है।

```python
embed = TitanTakeoffEmbed()
output = embed.embed_query(
    "What is the weather in London in August?", consumer_group="embed"
)
print(output)
```

### उदाहरण 2

TitanTakeoffEmbed Python Wrapper का उपयोग करके रीडर शुरू करना। यदि आपने पहली बार टेकऑफ लॉन्च करते समय कोई रीडर नहीं बनाए हैं, या आप एक और जोड़ना चाहते हैं, तो आप TitanTakeoffEmbed ऑब्जेक्ट को इनिशियलाइज़ करते समय ऐसा कर सकते हैं। बस `models` पैरामीटर के रूप में आप जो मॉडल शुरू करना चाहते हैं उनकी सूची पास करें।

आप `embed.query_documents` का उपयोग कर सकते हैं ताकि एक साथ कई दस्तावेज़ एम्बेड किए जा सकें। अपेक्षित इनपुट एक स्ट्रिंग की सूची है, न कि `embed_query` विधि के लिए अपेक्षित केवल एक स्ट्रिंग।

```python
# Model config for the embedding model, where you can specify the following parameters:
#   model_name (str): The name of the model to use
#   device: (str): The device to use for inference, cuda or cpu
#   consumer_group (str): The consumer group to place the reader into
embedding_model = {
    "model_name": "BAAI/bge-large-en-v1.5",
    "device": "cpu",
    "consumer_group": "embed",
}
embed = TitanTakeoffEmbed(models=[embedding_model])

# The model needs time to spin up, length of time need will depend on the size of model and your network connection speed
time.sleep(60)

prompt = "What is the capital of France?"
# We specified "embed" consumer group so need to send request to the same consumer group so it hits our embedding model and not others
output = embed.embed_query(prompt, consumer_group="embed")
print(output)
```
