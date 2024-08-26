---
translated: true
---

यह टेम्पलेट RAG का उपयोग करता है और बाहरी API पर निर्भरता नहीं है।

यह Ollama LLM, GPT4All के लिए एम्बेडिंग्स और Chroma के लिए वेक्टर स्टोर का उपयोग करता है।

वेक्टर स्टोर `chain.py` में बनाया जाता है और डिफ़ॉल्ट रूप से प्रश्न-उत्तर के लिए [एजेंटों पर लोकप्रिय ब्लॉग पोस्ट](https://lilianweng.github.io/posts/2023-06-23-agent/) का सूचकांक बनाता है।

## वातावरण सेटअप

वातावरण सेटअप करने के लिए, आपको Ollama डाउनलोड करना होगा।

[यहां](https://python.langchain.com/docs/integrations/chat/ollama) दिए गए निर्देशों का पालन करें।

आप Ollama के साथ इच्छित LLM का चयन कर सकते हैं।

यह टेम्पलेट `llama2:7b-chat` का उपयोग करता है, जिसे `ollama pull llama2:7b-chat` का उपयोग करके एक्सेस किया जा सकता है।

[यहां](https://ollama.ai/library) कई अन्य विकल्प उपलब्ध हैं।

यह पैकेज [GPT4All](https://python.langchain.com/docs/integrations/text_embedding/gpt4all) एम्बेडिंग्स का भी उपयोग करता है।

## उपयोग

इस पैकेज का उपयोग करने के लिए, आपके पास पहले से LangChain CLI स्थापित होना चाहिए:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में स्थापित करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package rag-chroma-private
```

यदि आप इसे किसी मौजूदा प्रोजेक्ट में जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add rag-chroma-private
```

और निम्नलिखित कोड को अपने `server.py` फ़ाइल में जोड़ें:

```python
from rag_chroma_private import chain as rag_chroma_private_chain

add_routes(app, rag_chroma_private_chain, path="/rag-chroma-private")
```

(वैकल्पिक) अब आइए LangSmith कॉन्फ़िगर करें। LangSmith हमें LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा। आप [यहां](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं। यदि आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका के अंदर हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर [http://localhost:8000](http://localhost:8000) पर स्थानीय रूप से चल रहा है।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/rag-chroma-private/playground](http://127.0.0.1:8000/rag-chroma-private/playground) पर खेल सकते हैं।

हम कोड के साथ टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-chroma-private")
```

पैकेज `chain.py` में दस्तावेज़ों को वेक्टर डेटाबेस में जोड़ेगा। डिफ़ॉल्ट रूप से, यह एजेंटों पर एक लोकप्रिय ब्लॉग पोस्ट लोड करेगा। हालांकि, आप [यहां](https://python.langchain.com/docs/integrations/document_loaders) दस्तावेज़ लोडर के बहुत सारे विकल्पों में से चुन सकते हैं।
