---
sidebar_label: Llama 2 Chat
translated: true
---

# Llama2Chat

यह नोटबुक दिखाता है कि कैसे `Llama2Chat` रैपर का उपयोग करके `Llama-2 LLM` को [Llama-2 चैट प्रॉम्प्ट प्रारूप](https://huggingface.co/blog/llama2#how-to-prompt-llama-2) का समर्थन करने के लिए बढ़ाया जा सकता है। LangChain में कई `LLM` कार्यान्वयन Llama-2 चैट मॉडल के लिए इंटरफ़ेस के रूप में उपयोग किए जा सकते हैं। इनमें [ChatHuggingFace](/docs/integrations/chat/huggingface), [LlamaCpp](/docs/use_cases/question_answering/local_retrieval_qa), [GPT4All](/docs/integrations/llms/gpt4all) शामिल हैं, जिनका उल्लेख कुछ उदाहरण के रूप में किया गया है।

`Llama2Chat` एक सामान्य रैपर है जो `BaseChatModel` को लागू करता है और इसलिए [चैट मॉडल](/docs/modules/model_io/chat/) के रूप में अनुप्रयोगों में उपयोग किया जा सकता है। `Llama2Chat` संदेशों की एक सूची को [आवश्यक चैट प्रॉम्प्ट प्रारूप](https://huggingface.co/blog/llama2#how-to-prompt-llama-2) में रूपांतरित करता है और प्रारूपित प्रॉम्प्ट को `str` के रूप में राप्त `LLM` को अग्रेषित करता है।

```python
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from langchain_experimental.chat_models import Llama2Chat
```

नीचे दिए गए चैट अनुप्रयोग उदाहरणों के लिए, हम निम्नलिखित चैट `prompt_template` का उपयोग करेंगे:

```python
from langchain_core.messages import SystemMessage
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)

template_messages = [
    SystemMessage(content="You are a helpful assistant."),
    MessagesPlaceholder(variable_name="chat_history"),
    HumanMessagePromptTemplate.from_template("{text}"),
]
prompt_template = ChatPromptTemplate.from_messages(template_messages)
```

## `HuggingFaceTextGenInference` LLM के माध्यम से Llama-2 के साथ चैट करें

एक HuggingFaceTextGenInference LLM [text-generation-inference](https://github.com/huggingface/text-generation-inference) सर्वर तक पहुंच को कैप्सूलबद्ध करता है। निम्नलिखित उदाहरण में, अनुमान सर्वर एक [meta-llama/Llama-2-13b-chat-hf](https://huggingface.co/meta-llama/Llama-2-13b-chat-hf) मॉडल की सेवा देता है। इसे स्थानीय रूप से निम्नानुसार शुरू किया जा सकता है:

```bash
docker run \
  --rm \
  --gpus all \
  --ipc=host \
  -p 8080:80 \
  -v ~/.cache/huggingface/hub:/data \
  -e HF_API_TOKEN=${HF_API_TOKEN} \
  ghcr.io/huggingface/text-generation-inference:0.9 \
  --hostname 0.0.0.0 \
  --model-id meta-llama/Llama-2-13b-chat-hf \
  --quantize bitsandbytes \
  --num-shard 4
```

यह उदाहरण 4 x RTX 3080ti कार्ड वाले मशीन पर काम करता है। `--num_shard` मान को उपलब्ध GPU की संख्या के अनुसार समायोजित करें। `HF_API_TOKEN` पर्यावरण चर में Hugging Face API टोकन होता है।

```python
# !pip3 install text-generation
```

स्थानीय अनुमान सर्वर से कनेक्ट करने वाले `HuggingFaceTextGenInference` इंस्टेंस बनाएं और इसे `Llama2Chat` में लपेटें।

```python
from langchain_community.llms import HuggingFaceTextGenInference

llm = HuggingFaceTextGenInference(
    inference_server_url="http://127.0.0.1:8080/",
    max_new_tokens=512,
    top_k=50,
    temperature=0.1,
    repetition_penalty=1.03,
)

model = Llama2Chat(llm=llm)
```

फिर आप `prompt_template` और वार्तालाप `memory` के साथ `model` का उपयोग करके `LLMChain` में तैयार हैं।

```python
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
chain = LLMChain(llm=model, prompt=prompt_template, memory=memory)
```

```python
print(
    chain.run(
        text="What can I see in Vienna? Propose a few locations. Names only, no details."
    )
)
```

```output
 Sure, I'd be happy to help! Here are a few popular locations to consider visiting in Vienna:

1. Schönbrunn Palace
2. St. Stephen's Cathedral
3. Hofburg Palace
4. Belvedere Palace
5. Prater Park
6. Vienna State Opera
7. Albertina Museum
8. Museum of Natural History
9. Kunsthistorisches Museum
10. Ringstrasse
```

```python
print(chain.run(text="Tell me more about #2."))
```

```output
 Certainly! St. Stephen's Cathedral (Stephansdom) is one of the most recognizable landmarks in Vienna and a must-see attraction for visitors. This stunning Gothic cathedral is located in the heart of the city and is known for its intricate stone carvings, colorful stained glass windows, and impressive dome.

The cathedral was built in the 12th century and has been the site of many important events throughout history, including the coronation of Holy Roman emperors and the funeral of Mozart. Today, it is still an active place of worship and offers guided tours, concerts, and special events. Visitors can climb up the south tower for panoramic views of the city or attend a service to experience the beautiful music and chanting.
```

## `LlamaCPP` LLM के माध्यम से Llama-2 के साथ चैट करें

Llama-2 चैट मॉडल का उपयोग करने के लिए [LlamaCPP](/docs/integrations/llms/llamacpp) `LMM` का उपयोग करने के लिए, [इन स्थापना निर्देशों](/docs/integrations/llms/llamacpp#installation) का उपयोग करके `llama-cpp-python` लाइब्रेरी स्थापित करें। निम्नलिखित उदाहरण `~/Models/llama-2-7b-chat.Q4_0.gguf` में स्थानीय रूप से संग्रहीत [llama-2-7b-chat.Q4_0.gguf](https://huggingface.co/TheBloke/Llama-2-7b-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_0.gguf) मॉडल का उपयोग करता है।

`LlamaCpp` इंस्टेंस बनाने के बाद, `llm` को फिर से `Llama2Chat` में लपेटा जाता है।

```python
from os.path import expanduser

from langchain_community.llms import LlamaCpp

model_path = expanduser("~/Models/llama-2-7b-chat.Q4_0.gguf")

llm = LlamaCpp(
    model_path=model_path,
    streaming=False,
)
model = Llama2Chat(llm=llm)
```

और पिछले उदाहरण में की तरह ही उपयोग किया जाता है।

```python
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
chain = LLMChain(llm=model, prompt=prompt_template, memory=memory)
```

```python
print(
    chain.run(
        text="What can I see in Vienna? Propose a few locations. Names only, no details."
    )
)
```

```output
  Of course! Vienna is a beautiful city with a rich history and culture. Here are some of the top tourist attractions you might want to consider visiting:
1. Schönbrunn Palace
2. St. Stephen's Cathedral
3. Hofburg Palace
4. Belvedere Palace
5. Prater Park
6. MuseumsQuartier
7. Ringstrasse
8. Vienna State Opera
9. Kunsthistorisches Museum
10. Imperial Palace

These are just a few of the many amazing places to see in Vienna. Each one has its own unique history and charm, so I hope you enjoy exploring this beautiful city!


llama_print_timings:        load time =     250.46 ms
llama_print_timings:      sample time =      56.40 ms /   144 runs   (    0.39 ms per token,  2553.37 tokens per second)
llama_print_timings: prompt eval time =    1444.25 ms /    47 tokens (   30.73 ms per token,    32.54 tokens per second)
llama_print_timings:        eval time =    8832.02 ms /   143 runs   (   61.76 ms per token,    16.19 tokens per second)
llama_print_timings:       total time =   10645.94 ms
```

```python
print(chain.run(text="Tell me more about #2."))
```

```output
Llama.generate: prefix-match hit

  Of course! St. Stephen's Cathedral (also known as Stephansdom) is a stunning Gothic-style cathedral located in the heart of Vienna, Austria. It is one of the most recognizable landmarks in the city and is considered a symbol of Vienna.
Here are some interesting facts about St. Stephen's Cathedral:
1. History: The construction of St. Stephen's Cathedral began in the 12th century on the site of a former Romanesque church, and it took over 600 years to complete. The cathedral has been renovated and expanded several times throughout its history, with the most significant renovation taking place in the 19th century.
2. Architecture: St. Stephen's Cathedral is built in the Gothic style, characterized by its tall spires, pointed arches, and intricate stone carvings. The cathedral features a mix of Romanesque, Gothic, and Baroque elements, making it a unique blend of styles.
3. Design: The cathedral's design is based on the plan of a cross with a long nave and two shorter arms extending from it. The main altar is


llama_print_timings:        load time =     250.46 ms
llama_print_timings:      sample time =     100.60 ms /   256 runs   (    0.39 ms per token,  2544.73 tokens per second)
llama_print_timings: prompt eval time =    5128.71 ms /   160 tokens (   32.05 ms per token,    31.20 tokens per second)
llama_print_timings:        eval time =   16193.02 ms /   255 runs   (   63.50 ms per token,    15.75 tokens per second)
llama_print_timings:       total time =   21988.57 ms
```
