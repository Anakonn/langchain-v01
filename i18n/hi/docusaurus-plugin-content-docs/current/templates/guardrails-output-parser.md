---
translated: true
---

# guardrails-output-parser

यह टेम्पलेट [guardrails-ai](https://github.com/guardrails-ai/guardrails) का उपयोग करता है LLM आउटपुट को मान्य करने के लिए।

`GuardrailsOutputParser` को `chain.py` में सेट किया गया है।

डिफ़ॉल्ट उदाहरण अश्लीलता से बचाव करता है।

## Environment Setup

OpenAI मॉडल्स तक पहुंच के लिए `OPENAI_API_KEY` पर्यावरण चर को सेट करें।

## Usage

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से ही LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package guardrails-output-parser
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add guardrails-output-parser
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from guardrails_output_parser.chain import chain as guardrails_output_parser_chain

add_routes(app, guardrails_output_parser_chain, path="/guardrails-output-parser")
```

(वैकल्पिक) अब LangSmith को कॉन्फ़िगर करते हैं।
LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहां](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं।
यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका के अंदर हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर स्थानीय रूप से [http://localhost:8000](http://localhost:8000) पर चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/guardrails-output-parser/playground](http://127.0.0.1:8000/guardrails-output-parser/playground) पर खेल सकते हैं।

हम कोड से टेम्पलेट का उपयोग कर सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/guardrails-output-parser")
```

यदि Guardrails को कोई अश्लीलता नहीं मिलती है, तो अनुवादित आउटपुट वैसा ही लौटा दिया जाता है। यदि Guardrails को अश्लीलता मिलती है, तो एक खाली स्ट्रिंग लौटाई जाती है।
