---
translated: true
---

# स्थानीय रूप से एलएलएम चलाएं

## उपयोग मामला

[PrivateGPT](https://github.com/imartinez/privateGPT), [llama.cpp](https://github.com/ggerganov/llama.cpp), [Ollama](https://github.com/ollama/ollama), [GPT4All](https://github.com/nomic-ai/gpt4all), [llamafile](https://github.com/Mozilla-Ocho/llamafile) जैसी परियोजनाओं की लोकप्रियता स्थानीय रूप से एलएलएम चलाने (अपने स्वयं के डिवाइस पर) की मांग को दर्शाती है।

इसके कम से कम दो महत्वपूर्ण लाभ हैं:

1. `गोपनीयता`: आपका डेटा किसी तृतीय पक्ष को नहीं भेजा जाता है, और यह किसी वाणिज्यिक सेवा की सेवा की शर्तों के अधीन नहीं है
2. `लागत`: कोई अनुमान शुल्क नहीं है, जो टोकन-गहन अनुप्रयोगों (उदा., [लंबे समय तक चलने वाले शिमुलेशन](https://twitter.com/RLanceMartin/status/1691097659262820352?s=20), सारांश) के लिए महत्वपूर्ण है

## अवलोकन

स्थानीय रूप से एलएलएम चलाने के लिए कुछ चीजों की आवश्यकता होती है:

1. `ओपन-सोर्स एलएलएम`: एक ओपन-सोर्स एलएलएम जिसे स्वतंत्र रूप से संशोधित और साझा किया जा सकता है
2. `अनुमान`: अपने डिवाइस पर इस एलएलएम को स्वीकार्य लेटेंसी के साथ चलाने की क्षमता

### ओपन-सोर्स एलएलएम

उपयोगकर्ता अब [ओपन-सोर्स एलएलएम](https://cameronrwolfe.substack.com/p/the-history-of-open-source-llms-better) के एक तेजी से बढ़ते सेट तक पहुंच सकते हैं।

इन एलएलएम का मूल्यांकन कम से कम दो आयामों पर किया जा सकता है (चित्र देखें):

1. `आधार मॉडल`: आधार मॉडल क्या है और इसे कैसे प्रशिक्षित किया गया था?
2. `फाइन-ट्यूनिंग दृष्टिकोण`: क्या आधार मॉडल को फाइन-ट्यून किया गया था और, यदि हां, तो किस [निर्देश सेट](https://cameronrwolfe.substack.com/p/beyond-llama-the-power-of-open-llms#%C2%A7alpaca-an-instruction-following-llama-model) का उपयोग किया गया था?

![Image description](../../../../../../static/img/OSS_LLM_overview.png)

इन मॉडलों के सापेक्ष प्रदर्शन का मूल्यांकन कई लीडरबोर्ड का उपयोग करके किया जा सकता है, जिनमें शामिल हैं:

1. [LmSys](https://chat.lmsys.org/?arena)
2. [GPT4All](https://gpt4all.io/index.html)
3. [HuggingFace](https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard)

### अनुमान

इस समर्थन के लिए कुछ फ्रेमवर्क उभरे हैं:

1. [`llama.cpp`](https://github.com/ggerganov/llama.cpp): एलएलएम अनुमान कोड का सी++ कार्यान्वयन [वजन अनुकूलन / क्वांटीकरण](https://finbarr.ca/how-is-llama-cpp-possible/) के साथ
2. [`gpt4all`](https://docs.gpt4all.io/index.html): अनुमान के लिए अनुकूलित सी बैकएंड
3. [`Ollama`](https://ollama.ai/): मॉडल वजन और वातावरण को एक ऐप में बंडल करता है जो डिवाइस पर चलता है और एलएलएम को सर्व करता है
4. [`llamafile`](https://github.com/Mozilla-Ocho/llamafile): मॉडल वजन और चलाने के लिए आवश्यक सभी कुछ को एक ही फ़ाइल में बंडल करता है, जिससे आप किसी भी अतिरिक्त स्थापना चरण के बिना इस फ़ाइल से स्थानीय रूप से एलएलएम चला सकते हैं

सामान्य रूप से, ये फ्रेमवर्क कुछ काम करेंगे:

1. `क्वांटीकरण`: कच्चे मॉडल वजन के मेमोरी पदचिह्न को कम करना
2. `अनुमान के लिए कुशल कार्यान्वयन`: उपभोक्ता हार्डवेयर (जैसे, सीपीयू या लैपटॉप जीपीयू) पर अनुमान का समर्थन करना

विशेष रूप से, [इस उत्कृष्ट पोस्ट](https://finbarr.ca/how-is-llama-cpp-possible/) पर क्वांटीकरण के महत्व देखें।

![Image description](../../../../../../static/img/llama-memory-weights.png)

कम सटीकता के साथ, हम एलएलएम को मेमोरी में संग्रहित करने के लिए आवश्यक मेमोरी को कई गुना कम कर देते हैं।

इसके अलावा, [शीट](https://docs.google.com/spreadsheets/d/1OehfHHNSn66BP2h3Bxp2NJTVX97icU0GmCXF6pK23H8/edit#gid=0) पर जीपीयू मेमोरी बैंडविड्थ के महत्व को देख सकते हैं!

एक मैक एम 2 मैक्स जीपीयू मेमोरी बैंडविड्थ के कारण अनुमान के लिए एम 1 से 5-6 गुना तेज है।

![Image description](../../../../../../static/img/llama_t_put.png)

## त्वरित शुरुआत

[`Ollama`](https://ollama.ai/) मैकओएस पर अनुमान चलाने का एक तरीका है।

[यहां](https://github.com/jmorganca/ollama?tab=readme-ov-file#ollama) दिए गए निर्देश विवरण प्रदान करते हैं, जिन्हें हम सारांशित करते हैं:

* [डाउनलोड और चलाएं](https://ollama.ai/download) ऐप
* कमांड लाइन से, इस [विकल्पों की सूची](https://github.com/jmorganca/ollama) से एक मॉडल प्राप्त करें: उदा., `ollama pull llama2`
* जब ऐप चल रहा हो, तो सभी मॉडल `localhost:11434` पर स्वचालित रूप से सर्व किए जाते हैं

```python
from langchain_community.llms import Ollama

llm = Ollama(model="llama2")
llm.invoke("The first man on the moon was ...")
```

```output
' The first man on the moon was Neil Armstrong, who landed on the moon on July 20, 1969 as part of the Apollo 11 mission. obviously.'
```

टोकन को उत्पन्न होते समय स्ट्रीम करें।

```python
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

llm = Ollama(
    model="llama2", callback_manager=CallbackManager([StreamingStdOutCallbackHandler()])
)
llm.invoke("The first man on the moon was ...")
```

```output
 The first man to walk on the moon was Neil Armstrong, an American astronaut who was part of the Apollo 11 mission in 1969. февруари 20, 1969, Armstrong stepped out of the lunar module Eagle and onto the moon's surface, famously declaring "That's one small step for man, one giant leap for mankind" as he took his first steps. He was followed by fellow astronaut Edwin "Buzz" Aldrin, who also walked on the moon during the mission.
```

```output
' The first man to walk on the moon was Neil Armstrong, an American astronaut who was part of the Apollo 11 mission in 1969. февруари 20, 1969, Armstrong stepped out of the lunar module Eagle and onto the moon\'s surface, famously declaring "That\'s one small step for man, one giant leap for mankind" as he took his first steps. He was followed by fellow astronaut Edwin "Buzz" Aldrin, who also walked on the moon during the mission.'
```

## वातावरण

स्थानीय रूप से मॉडल चलाते समय अनुमान गति एक चुनौती है (ऊपर देखें)।

लेटेंसी को कम करने के लिए, यह वांछनीय है कि मॉडल स्थानीय रूप से जीपीयू पर चलाए जाएं, जो कई उपभोक्ता लैपटॉप [जैसे, Apple डिवाइस](https://www.apple.com/newsroom/2022/06/apple-unveils-m2-with-breakthrough-performance-and-capabilities/) के साथ आते हैं।

और यहां तक कि जीपीयू के साथ भी, उपलब्ध जीपीयू मेमोरी बैंडविड्थ (जैसा कि ऊपर नोट किया गया है) महत्वपूर्ण है।

### Apple सिलिकॉन जीपीयू चलाना

`Ollama` और [`llamafile`](https://github.com/Mozilla-Ocho/llamafile?tab=readme-ov-file#gpu-support) Apple डिवाइस पर जीपीयू का स्वचालित रूप से उपयोग करेंगे।

अन्य फ्रेमवर्क के लिए, उपयोगकर्ता को Apple जीपीयू का उपयोग करने के लिए वातावरण सेट करने की आवश्यकता होती है।

उदाहरण के लिए, `llama.cpp` पायथन बाइंडिंग को [Metal](https://developer.apple.com/metal/) के माध्यम से जीपीयू का उपयोग करने के लिए कॉन्फ़िगर किया जा सकता है।

Metal एक ग्राफिक्स और कंप्यूट एपीआई है जिसे Apple ने बनाया है और यह जीपीयू तक लगभग सीधी पहुंच प्रदान करता है।

`llama.cpp` सेटअप [यहां](https://github.com/abetlen/llama-cpp-python/blob/main/docs/install/macos.md) देखें ताकि इसे सक्षम किया जा सके।

विशेष रूप से, यह सुनिश्चित करें कि conda सही वर्चुअल पर्यावरण (`miniforge3`) का उपयोग कर रहा है।

उदाहरण के लिए, मेरे लिए:

```bash
conda activate /Users/rlm/miniforge3/envs/llama
```

उपरोक्त की पुष्टि के साथ, तो:

```bash
CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install -U llama-cpp-python --no-cache-dir
```

## LLMs

विभिन्न तरीकों से क्वांटाइज्ड मॉडल वेटों तक पहुंच प्राप्त की जा सकती है।

1. [`HuggingFace`](https://huggingface.co/TheBloke) - कई क्वांटाइज्ड मॉडल डाउनलोड के लिए उपलब्ध हैं और [`llama.cpp`](https://github.com/ggerganov/llama.cpp) जैसे फ्रेमवर्क के साथ चलाए जा सकते हैं। आप HuggingFace से [`llamafile` प्रारूप](https://huggingface.co/models?other=llamafile) में भी मॉडल डाउनलोड कर सकते हैं।
2. [`gpt4all`](https://gpt4all.io/index.html) - मॉडल एक्सप्लोरर में मेट्रिक्स का लीडरबोर्ड और संबंधित क्वांटाइज्ड मॉडल उपलब्ध हैं जिन्हें डाउनलोड किया जा सकता है।
3. [`Ollama`](https://github.com/jmorganca/ollama) - कई मॉडल `pull` के माध्यम से सीधे एक्सेस किए जा सकते हैं।

### Ollama

[Ollama](https://github.com/jmorganca/ollama) के साथ, `ollama pull <model family>:<tag>` के माध्यम से एक मॉडल प्राप्त करें:

* उदाहरण के लिए, Llama-7b के लिए: `ollama pull llama2` सबसे मूलभूत संस्करण (जैसे, न्यूनतम पैरामीटर और 4 बिट क्वांटाइजेशन) डाउनलोड करेगा।
* हम [मॉडल सूची](https://github.com/jmorganca/ollama?tab=readme-ov-file#model-library) से किसी विशिष्ट संस्करण को भी निर्दिष्ट कर सकते हैं, उदाहरण के लिए, `ollama pull llama2:13b`
* [API संदर्भ पृष्ठ](https://api.python.langchain.com/en/latest/llms/langchain_community.llms.ollama.Ollama.html) पर पूरे पैरामीटर सेट देखें।

```python
from langchain_community.llms import Ollama

llm = Ollama(model="llama2:13b")
llm.invoke("The first man on the moon was ... think step by step")
```

```output
' Sure! Here\'s the answer, broken down step by step:\n\nThe first man on the moon was... Neil Armstrong.\n\nHere\'s how I arrived at that answer:\n\n1. The first manned mission to land on the moon was Apollo 11.\n2. The mission included three astronauts: Neil Armstrong, Edwin "Buzz" Aldrin, and Michael Collins.\n3. Neil Armstrong was the mission commander and the first person to set foot on the moon.\n4. On July 20, 1969, Armstrong stepped out of the lunar module Eagle and onto the moon\'s surface, famously declaring "That\'s one small step for man, one giant leap for mankind."\n\nSo, the first man on the moon was Neil Armstrong!'
```

### Llama.cpp

Llama.cpp [कई मॉडलों](https://github.com/ggerganov/llama.cpp) के साथ संगत है।

उदाहरण के लिए, नीचे हम [HuggingFace](https://huggingface.co/TheBloke/Llama-2-13B-GGML/tree/main) से डाउनलोड किए गए `llama2-13b` मॉडल पर 4 बिट क्वांटाइजेशन के साथ अनुमान लगाते हैं।

ऊपर के अनुसार, पूरे पैरामीटर सेट के लिए [API संदर्भ](https://api.python.langchain.com/en/latest/llms/langchain.llms.llamacpp.LlamaCpp.html?highlight=llamacpp#langchain.llms.llamacpp.LlamaCpp) देखें।

[llama.cpp API संदर्भ दस्तावेज़](https://api.python.langchain.com/en/latest/llms/langchain_community.llms.llamacpp.LlamaCpp.htm) से, कुछ पर टिप्पणी करना महत्वपूर्ण है:

`n_gpu_layers`: GPU मेमोरी में लोड किए जाने वाले लेयरों की संख्या

* मान: 1
* अर्थ: मॉडल का केवल एक लेयर ही GPU मेमोरी में लोड किया जाएगा (1 अक्सर पर्याप्त होता है)।

`n_batch`: मॉडल को एक साथ प्रोसेस करने के लिए टोकन की संख्या

* मान: n_batch
* अर्थ: 1 और n_ctx (जो इस मामले में 2048 है) के बीच एक मान चुनना अनुशंसित है।

`n_ctx`: टोकन संदर्भ विंडो

* मान: 2048
* अर्थ: मॉडल एक साथ 2048 टोकन का विंडो पर विचार करेगा।

`f16_kv`: क्या मॉडल को कुंजी/मूल्य कैश के लिए अर्ध-प्रेसिजन का उपयोग करना चाहिए

* मान: True
* अर्थ: मॉडल अर्ध-प्रेसिजन का उपयोग करेगा, जो अधिक मेमोरी कुशल हो सकता है; Metal केवल True का समर्थन करता है।

```python
%env CMAKE_ARGS="-DLLAMA_METAL=on"
%env FORCE_CMAKE=1
%pip install --upgrade --quiet  llama-cpp-python --no-cache-dirclear
```

```python
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_community.llms import LlamaCpp

llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    n_gpu_layers=1,
    n_batch=512,
    n_ctx=2048,
    f16_kv=True,
    callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
    verbose=True,
)
```

कंसोल लॉग उपरोक्त चरणों से Metal को सही ढंग से सक्षम होने का संकेत देगा:

```output
ggml_metal_init: allocating
ggml_metal_init: using MPS
```

```python
llm.invoke("The first man on the moon was ... Let's think step by step")
```

```output
Llama.generate: prefix-match hit

 and use logical reasoning to figure out who the first man on the moon was.

Here are some clues:

1. The first man on the moon was an American.
2. He was part of the Apollo 11 mission.
3. He stepped out of the lunar module and became the first person to set foot on the moon's surface.
4. His last name is Armstrong.

Now, let's use our reasoning skills to figure out who the first man on the moon was. Based on clue #1, we know that the first man on the moon was an American. Clue #2 tells us that he was part of the Apollo 11 mission. Clue #3 reveals that he was the first person to set foot on the moon's surface. And finally, clue #4 gives us his last name: Armstrong.
Therefore, the first man on the moon was Neil Armstrong!


llama_print_timings:        load time =  9623.21 ms
llama_print_timings:      sample time =   143.77 ms /   203 runs   (    0.71 ms per token,  1412.01 tokens per second)
llama_print_timings: prompt eval time =   485.94 ms /     7 tokens (   69.42 ms per token,    14.40 tokens per second)
llama_print_timings:        eval time =  6385.16 ms /   202 runs   (   31.61 ms per token,    31.64 tokens per second)
llama_print_timings:       total time =  7279.28 ms
```

```output
" and use logical reasoning to figure out who the first man on the moon was.\n\nHere are some clues:\n\n1. The first man on the moon was an American.\n2. He was part of the Apollo 11 mission.\n3. He stepped out of the lunar module and became the first person to set foot on the moon's surface.\n4. His last name is Armstrong.\n\nNow, let's use our reasoning skills to figure out who the first man on the moon was. Based on clue #1, we know that the first man on the moon was an American. Clue #2 tells us that he was part of the Apollo 11 mission. Clue #3 reveals that he was the first person to set foot on the moon's surface. And finally, clue #4 gives us his last name: Armstrong.\nTherefore, the first man on the moon was Neil Armstrong!"
```

### GPT4All

हम [GPT4All](/docs/integrations/llms/gpt4all) मॉडल एक्सप्लोरर से डाउनलोड किए गए मॉडल वेटों का उपयोग कर सकते हैं।

ऊपर दिखाए गए जैसे, हम अनुमान लगा सकते हैं और [API संदर्भ](https://api.python.langchain.com/en/latest/llms/langchain_community.llms.gpt4all.GPT4All.html) का उपयोग करके रुचि के पैरामीटर सेट कर सकते हैं।

```python
%pip install gpt4all
```

```python
from langchain_community.llms import GPT4All

llm = GPT4All(
    model="/Users/rlm/Desktop/Code/gpt4all/models/nous-hermes-13b.ggmlv3.q4_0.bin"
)
```

```python
llm.invoke("The first man on the moon was ... Let's think step by step")
```

```output
".\n1) The United States decides to send a manned mission to the moon.2) They choose their best astronauts and train them for this specific mission.3) They build a spacecraft that can take humans to the moon, called the Lunar Module (LM).4) They also create a larger spacecraft, called the Saturn V rocket, which will launch both the LM and the Command Service Module (CSM), which will carry the astronauts into orbit.5) The mission is planned down to the smallest detail: from the trajectory of the rockets to the exact movements of the astronauts during their moon landing.6) On July 16, 1969, the Saturn V rocket launches from Kennedy Space Center in Florida, carrying the Apollo 11 mission crew into space.7) After one and a half orbits around the Earth, the LM separates from the CSM and begins its descent to the moon's surface.8) On July 20, 1969, at 2:56 pm EDT (GMT-4), Neil Armstrong becomes the first man on the moon. He speaks these"
```

### llamafile

स्थानीय रूप से एक LLM चलाने का सबसे सरल तरीकों में से एक [llamafile](https://github.com/Mozilla-Ocho/llamafile) का उपयोग करना है। आपको केवल निम्नलिखित करने की आवश्यकता है:

1) [HuggingFace](https://huggingface.co/models?other=llamafile) से एक llamafile डाउनलोड करें
2) फ़ाइल को कार्यान्वित करें
3) फ़ाइल चलाएं

llamafiles मॉडल वेटों और [`llama.cpp`](https://github.com/ggerganov/llama.cpp) का [विशेष रूप से कंपाइल किया गया](https://github.com/Mozilla-Ocho/llamafile?tab=readme-ov-file#technical-details) संस्करण को एक एकल फ़ाइल में बंडल करते हैं जो अधिकांश कंप्यूटरों पर चल सकता है। वे एक एम्बेडेड अनुमान सर्वर के साथ भी आते हैं जो आपके मॉडल के साथ बातचीत करने के लिए एक [API](https://github.com/Mozilla-Ocho/llamafile/blob/main/llama.cpp/server/README.md#api-endpoints) प्रदान करता है।

यहां एक सरल बैश स्क्रिप्ट है जो सभी 3 सेटअप चरणों को दिखाती है:

```bash
# Download a llamafile from HuggingFace
wget https://huggingface.co/jartine/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile

# Make the file executable. On Windows, instead just rename the file to end in ".exe".
chmod +x TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile

# Start the model server. Listens at http://localhost:8080 by default.
./TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile --server --nobrowser
```

उपरोक्त सेटअप चरण चलाने के बाद, आप LangChain का उपयोग करके अपने मॉडल के साथ बातचीत कर सकते हैं:

```python
from langchain_community.llms.llamafile import Llamafile

llm = Llamafile()

llm.invoke("The first man on the moon was ... Let's think step by step.")
```

```output
"\nFirstly, let's imagine the scene where Neil Armstrong stepped onto the moon. This happened in 1969. The first man on the moon was Neil Armstrong. We already know that.\n2nd, let's take a step back. Neil Armstrong didn't have any special powers. He had to land his spacecraft safely on the moon without injuring anyone or causing any damage. If he failed to do this, he would have been killed along with all those people who were on board the spacecraft.\n3rd, let's imagine that Neil Armstrong successfully landed his spacecraft on the moon and made it back to Earth safely. The next step was for him to be hailed as a hero by his people back home. It took years before Neil Armstrong became an American hero.\n4th, let's take another step back. Let's imagine that Neil Armstrong wasn't hailed as a hero, and instead, he was just forgotten. This happened in the 1970s. Neil Armstrong wasn't recognized for his remarkable achievement on the moon until after he died.\n5th, let's take another step back. Let's imagine that Neil Armstrong didn't die in the 1970s and instead, lived to be a hundred years old. This happened in 2036. In the year 2036, Neil Armstrong would have been a centenarian.\nNow, let's think about the present. Neil Armstrong is still alive. He turned 95 years old on July 20th, 2018. If he were to die now, his achievement of becoming the first human being to set foot on the moon would remain an unforgettable moment in history.\nI hope this helps you understand the significance and importance of Neil Armstrong's achievement on the moon!"
```

## प्रोम्प्ट्स

कुछ LLM विशिष्ट प्रोम्प्ट्स से लाभान्वित होंगे।

उदाहरण के लिए, LLaMA [विशेष टोकन](https://twitter.com/RLanceMartin/status/1681879318493003776?s=20) का उपयोग करेगा।

हम `ConditionalPromptSelector` का उपयोग कर सकते हैं ताकि मॉडल प्रकार के आधार पर प्रोम्प्ट सेट किया जा सके।

```python
# Set our LLM
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    n_gpu_layers=1,
    n_batch=512,
    n_ctx=2048,
    f16_kv=True,
    callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
    verbose=True,
)
```

मॉडल संस्करण के आधार पर संबंधित प्रोम्प्ट सेट करें।

```python
from langchain.chains import LLMChain
from langchain.chains.prompt_selector import ConditionalPromptSelector
from langchain_core.prompts import PromptTemplate

DEFAULT_LLAMA_SEARCH_PROMPT = PromptTemplate(
    input_variables=["question"],
    template="""<<SYS>> \n You are an assistant tasked with improving Google search \
results. \n <</SYS>> \n\n [INST] Generate THREE Google search queries that \
are similar to this question. The output should be a numbered list of questions \
and each should have a question mark at the end: \n\n {question} [/INST]""",
)

DEFAULT_SEARCH_PROMPT = PromptTemplate(
    input_variables=["question"],
    template="""You are an assistant tasked with improving Google search \
results. Generate THREE Google search queries that are similar to \
this question. The output should be a numbered list of questions and each \
should have a question mark at the end: {question}""",
)

QUESTION_PROMPT_SELECTOR = ConditionalPromptSelector(
    default_prompt=DEFAULT_SEARCH_PROMPT,
    conditionals=[(lambda llm: isinstance(llm, LlamaCpp), DEFAULT_LLAMA_SEARCH_PROMPT)],
)

prompt = QUESTION_PROMPT_SELECTOR.get_prompt(llm)
prompt
```

```output
PromptTemplate(input_variables=['question'], output_parser=None, partial_variables={}, template='<<SYS>> \n You are an assistant tasked with improving Google search results. \n <</SYS>> \n\n [INST] Generate THREE Google search queries that are similar to this question. The output should be a numbered list of questions and each should have a question mark at the end: \n\n {question} [/INST]', template_format='f-string', validate_template=True)
```

```python
# Chain
llm_chain = LLMChain(prompt=prompt, llm=llm)
question = "What NFL team won the Super Bowl in the year that Justin Bieber was born?"
llm_chain.run({"question": question})
```

```output
  Sure! Here are three similar search queries with a question mark at the end:

1. Which NBA team did LeBron James lead to a championship in the year he was drafted?
2. Who won the Grammy Awards for Best New Artist and Best Female Pop Vocal Performance in the same year that Lady Gaga was born?
3. What MLB team did Babe Ruth play for when he hit 60 home runs in a single season?


llama_print_timings:        load time = 14943.19 ms
llama_print_timings:      sample time =    72.93 ms /   101 runs   (    0.72 ms per token,  1384.87 tokens per second)
llama_print_timings: prompt eval time = 14942.95 ms /    93 tokens (  160.68 ms per token,     6.22 tokens per second)
llama_print_timings:        eval time =  3430.85 ms /   100 runs   (   34.31 ms per token,    29.15 tokens per second)
llama_print_timings:       total time = 18578.26 ms
```

```output
'  Sure! Here are three similar search queries with a question mark at the end:\n\n1. Which NBA team did LeBron James lead to a championship in the year he was drafted?\n2. Who won the Grammy Awards for Best New Artist and Best Female Pop Vocal Performance in the same year that Lady Gaga was born?\n3. What MLB team did Babe Ruth play for when he hit 60 home runs in a single season?'
```

हम LangChain प्रोम्प्ट हब का भी उपयोग कर सकते हैं ताकि मॉडल विशिष्ट प्रोम्प्ट प्राप्त और/या संग्रहीत किए जा सकें।

यह आपके [LangSmith API कुंजी](https://docs.smith.langchain.com/) के साथ काम करेगा।

उदाहरण के लिए, [यहां](https://smith.langchain.com/hub/rlm/rag-prompt-llama) LLaMA-विशिष्ट टोकन के साथ RAG के लिए एक प्रोम्प्ट है।

## उपयोग मामले

एक ऊपर दिए गए मॉडलों में से एक से बनाया गया `llm` का उपयोग आप [कई उपयोग मामलों](/docs/use_cases/) के लिए कर सकते हैं।

उदाहरण के लिए, यहां [RAG](/docs/use_cases/question_answering/local_retrieval_qa) के साथ स्थानीय LLM का एक मार्गदर्शिका है।

सामान्य रूप से, स्थानीय LLM के उपयोग मामले कम से कम दो कारकों द्वारा प्रेरित हो सकते हैं:

* `गोपनीयता`: निजी डेटा (जैसे डायरी आदि) जिसे उपयोगकर्ता साझा नहीं करना चाहता है
* `लागत`: पाठ पूर्व-प्रसंस्करण (निकालना/टैगिंग), सारांश और एजेंट शमुलेशन टोकन-उपयोग-गहन कार्य हैं

इसके अलावा, [यहां](https://blog.langchain.dev/using-langsmith-to-support-fine-tuning-of-open-source-llms/) फाइन-ट्यूनिंग पर एक अवलोकन है, जो ओपन-सोर्स LLM का उपयोग कर सकता है।
