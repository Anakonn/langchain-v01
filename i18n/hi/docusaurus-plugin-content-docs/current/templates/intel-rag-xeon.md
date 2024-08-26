---
translated: true
---

# इंटेल ज़ीऑन पर आरएजी उदाहरण

यह टेम्पलेट इंटेल® ज़ीऑन® स्केलेबल प्रोसेसर पर क्रोमा और टेक्स्ट जनरेशन इन्फरेंस का उपयोग करके आरएजी करता है।
इंटेल® ज़ीऑन® स्केलेबल प्रोसेसर अधिक प्रदर्शन-प्रति-कोर और अतुलनीय एआई प्रदर्शन के लिए बिल्ट-इन एक्सेलेरेटर्स की विशेषता रखते हैं, सबसे अधिक मांग वाले वर्कलोड आवश्यकताओं के लिए उन्नत सुरक्षा तकनीकों के साथ- सभी जबकि सबसे बड़ा क्लाउड विकल्प और एप्लिकेशन पोर्टेबिलिटी प्रदान करते हैं, कृपया देखें [Intel® Xeon® Scalable Processors](https://www.intel.com/content/www/us/en/products/details/processors/xeon/scalable.html)।

## पर्यावरण सेटअप

इंटेल® ज़ीऑन® स्केलेबल प्रोसेसर पर [🤗 text-generation-inference](https://github.com/huggingface/text-generation-inference) का उपयोग करने के लिए, कृपया इन चरणों का पालन करें:

### इंटेल ज़ीऑन सर्वर पर एक स्थानीय सर्वर इंस्टेंस लॉन्च करें:

```bash
model=Intel/neural-chat-7b-v3-3
volume=$PWD/data # share a volume with the Docker container to avoid downloading weights every run

docker run --shm-size 1g -p 8080:80 -v $volume:/data ghcr.io/huggingface/text-generation-inference:1.4 --model-id $model
```

गेटेड मॉडल जैसे `LLAMA-2` के लिए, आपको एक वैध हगिंग फेस हब पढ़ने वाले टोकन के साथ उपरोक्त डॉकर रन कमांड को -e HUGGING_FACE_HUB_TOKEN=\<token\> पास करना होगा।

कृपया इस लिंक का पालन करें [huggingface token](https://huggingface.co/docs/hub/security-tokens) टोकन प्राप्त करने के लिए और टोकन के साथ `HUGGINGFACEHUB_API_TOKEN` पर्यावरण को निर्यात करें।

```bash
export HUGGINGFACEHUB_API_TOKEN=<token>
```

जांचने के लिए एक अनुरोध भेजें कि क्या एंडपॉइंट काम कर रहा है:

```bash
curl localhost:8080/generate -X POST -d '{"inputs":"Which NFL team won the Super Bowl in the 2010 season?","parameters":{"max_new_tokens":128, "do_sample": true}}'   -H 'Content-Type: application/json'
```

अधिक विवरण के लिए कृपया देखें [text-generation-inference](https://github.com/huggingface/text-generation-inference)।

## डेटा के साथ पॉपुलेट करना

यदि आप कुछ उदाहरण डेटा के साथ DB को पॉपुलेट करना चाहते हैं, तो आप नीचे दिए गए कमांड चला सकते हैं:

```shell
poetry install
poetry run python ingest.py
```

स्क्रिप्ट प्रोसेस और एडगर 10k फाइलिंग डेटा से नाइकी `nke-10k-2023.pdf` के सेक्शन को क्रोमा डेटाबेस में स्टोर करता है।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI इंस्टॉल होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे केवल पैकेज के रूप में इंस्टॉल करने के लिए, आप कर सकते हैं:

```shell
langchain app new my-app --package intel-rag-xeon
```

यदि आप इसे एक मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस चला सकते हैं:

```shell
langchain app add intel-rag-xeon
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from intel_rag_xeon import chain as xeon_rag_chain

add_routes(app, xeon_rag_chain, path="/intel-rag-xeon")
```

(वैकल्पिक) अब आइए LangSmith को कॉन्फ़िगर करें। LangSmith हमें LangChain एप्लिकेशन को ट्रेस, मॉनिटर और डिबग करने में मदद करेगा। आप LangSmith के लिए [यहां](https://smith.langchain.com/) साइन अप कर सकते हैं। यदि आपके पास पहुंच नहीं है, तो आप इस सेक्शन को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका के अंदर हैं, तो आप सीधे एक LangServe इंस्टेंस स्पिन कर सकते हैं:

```shell
langchain serve
```

यह एक स्थानीय रूप से चल रहे सर्वर के साथ FastAPI ऐप को शुरू करेगा
[http://localhost:8000](http://localhost:8000) पर

हम सभी टेम्पलेट्स [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर देख सकते हैं
हम प्लेग्राउंड को [http://127.0.0.1:8000/intel-rag-xeon/playground](http://127.0.0.1:8000/intel-rag-xeon/playground) पर एक्सेस कर सकते हैं

हम कोड से टेम्पलेट को एक्सेस कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/intel-rag-xeon")
```
