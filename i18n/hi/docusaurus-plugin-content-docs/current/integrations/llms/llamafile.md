---
translated: true
---

# लामाफ़ाइल

[लामाफ़ाइल](https://github.com/Mozilla-Ocho/llamafile) आपको एक ही फ़ाइल के साथ एलएलएम्स को वितरित और चलाने देता है।

लामाफ़ाइल ऐसा करता है क्योंकि यह [llama.cpp](https://github.com/ggerganov/llama.cpp) को [Cosmopolitan Libc](https://github.com/jart/cosmopolitan) के साथ मिलाकर एक ऐसे ढांचे में बदल देता है जो एलएलएम्स की सारी जटिलता को एक ही फ़ाइल के कार्यान्वयन (जिसे "लामाफ़ाइल" कहा जाता है) में समेट देता है, जो अधिकांश कंप्यूटरों पर स्थानीय रूप से चलता है, बिना किसी इंस्टॉलेशन के।

## सेटअप

1. अपने उपयोग के लिए मॉडल के लिए एक लामाफ़ाइल डाउनलोड करें। आप [HuggingFace](https://huggingface.co/models?other=llamafile) पर कई मॉडल लामाफ़ाइल प्रारूप में पा सकते हैं। इस गाइड में, हम एक छोटा सा मॉडल डाउनलोड करेंगे, `TinyLlama-1.1B-Chat-v1.0.Q5_K_M`। नोट: यदि आपके पास `wget` नहीं है, तो आप इस [लिंक](https://huggingface.co/jartine/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile?download=true) के माध्यम से मॉडल डाउनलोड कर सकते हैं।

```bash
wget https://huggingface.co/jartine/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile
```

2. लामाफ़ाइल को कार्यान्वयन योग्य बनाएं। पहले, यदि आपने ऐसा नहीं किया है, तो एक टर्मिनल खोलें। **यदि आप MacOS, Linux या BSD का उपयोग कर रहे हैं,** तो आपको अपने कंप्यूटर को इस नई फ़ाइल को निष्पादित करने की अनुमति देने के लिए `chmod` का उपयोग करना होगा (नीचे देखें)। **यदि आप Windows पर हैं,** तो फ़ाइल का नाम ".exe" जोड़कर बदल दें (मॉडल फ़ाइल का नाम `TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile.exe` होना चाहिए)।

```bash
chmod +x TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile  # run if you're on MacOS, Linux, or BSD
```

3. लामाफ़ाइल को "सर्वर मोड" में चलाएं:

```bash
./TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile --server --nobrowser
```

अब आप लामाफ़ाइल के REST API को कॉल कर सकते हैं। डिफ़ॉल्ट रूप से, लामाफ़ाइल सर्वर http://localhost:8080 पर सुनता है। आप [यहां](https://github.com/Mozilla-Ocho/llamafile/blob/main/llama.cpp/server/README.md#api-endpoints) पूर्ण सर्वर दस्तावेज़ीकरण पा सकते हैं। आप REST API के माध्यम से लामाफ़ाइल के साथ सीधे बातचीत कर सकते हैं, लेकिन यहां हम LangChain का उपयोग करके इससे बातचीत करने का तरीका दिखाएंगे।

## उपयोग

```python
from langchain_community.llms.llamafile import Llamafile

llm = Llamafile()

llm.invoke("Tell me a joke")
```

```output
'? \nI\'ve got a thing for pink, but you know that.\n"Can we not talk about work anymore?" - What did she say?\nI don\'t want to be a burden on you.\nIt\'s hard to keep a good thing going.\nYou can\'t tell me what I want, I have a life too!'
```

टोकन को स्ट्रीम करने के लिए, `.stream(...)` विधि का उपयोग करें:

```python
query = "Tell me a joke"

for chunks in llm.stream(query):
    print(chunks, end="")

print()
```

```output
.
- She said, "I’m tired of my life. What should I do?"
- The man replied, "I hear you. But don’t worry. Life is just like a joke. It has its funny parts too."
- The woman looked at him, amazed and happy to hear his wise words. - "Thank you for your wisdom," she said, smiling. - He replied, "Any time. But it doesn't come easy. You have to laugh and keep moving forward in life."
- She nodded, thanking him again. - The man smiled wryly. "Life can be tough. Sometimes it seems like you’re never going to get out of your situation."
- He said, "I know that. But the key is not giving up. Life has many ups and downs, but in the end, it will turn out okay."
- The woman's eyes softened. "Thank you for your advice. It's so important to keep moving forward in life," she said. - He nodded once again. "You’re welcome. I hope your journey is filled with laughter and joy."
- They both smiled and left the bar, ready to embark on their respective adventures.
```

LangChain Expressive Language के बारे में और अधिक जानने और एक एलएलएम पर उपलब्ध विधियों के बारे में जानने के लिए, [LCEL इंटरफ़ेस](/docs/expression_language/interface) देखें।
