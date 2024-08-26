---
sidebar_label: Llama 2 Chat
translated: true
---

# Llama2Chat

이 노트북은 [Llama-2 chat 프롬프트 형식](https://huggingface.co/blog/llama2#how-to-prompt-llama-2)을 지원하기 위해 Llama-2 `LLM`을 `Llama2Chat` 래퍼로 보강하는 방법을 보여줍니다. LangChain에서 여러 `LLM` 구현을 사용하여 Llama-2 채팅 모델과 인터페이스할 수 있습니다. 예를 들어, [ChatHuggingFace](/docs/integrations/chat/huggingface), [LlamaCpp](/docs/use_cases/question_answering/local_retrieval_qa), [GPT4All](/docs/integrations/llms/gpt4all) 등이 있습니다.

`Llama2Chat`은 `BaseChatModel`을 구현하는 일반적인 래퍼로, [채팅 모델](/docs/modules/model_io/chat/)로 애플리케이션에서 사용할 수 있습니다. `Llama2Chat`은 메시지 목록을 [필요한 채팅 프롬프트 형식](https://huggingface.co/blog/llama2#how-to-prompt-llama-2)으로 변환하고, 포맷된 프롬프트를 `LLM`에 `str`로 전달합니다.

```python
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from langchain_experimental.chat_models import Llama2Chat
```

아래의 채팅 애플리케이션 예제에서는 다음과 같은 채팅 `prompt_template`을 사용할 것입니다:

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

## `HuggingFaceTextGenInference` LLM을 통한 Llama-2와의 채팅

HuggingFaceTextGenInference LLM은 [text-generation-inference](https://github.com/huggingface/text-generation-inference) 서버에 대한 접근을 캡슐화합니다. 다음 예제에서는 추론 서버가 [meta-llama/Llama-2-13b-chat-hf](https://huggingface.co/meta-llama/Llama-2-13b-chat-hf) 모델을 제공하는 경우를 보여줍니다. 로컬에서 시작하려면 다음 명령을 사용합니다:

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

이 명령은 예를 들어 4 x RTX 3080ti 카드가 있는 머신에서 작동합니다. `--num_shard` 값을 사용 가능한 GPU 수에 맞게 조정하세요. `HF_API_TOKEN` 환경 변수는 Hugging Face API 토큰을 포함합니다.

```python
# !pip3 install text-generation

```

로컬 추론 서버에 연결하는 `HuggingFaceTextGenInference` 인스턴스를 생성하고 이를 `Llama2Chat`에 래핑합니다.

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

그런 다음 `prompt_template`과 대화 `memory`를 함께 사용하여 `LLMChain`에서 채팅 `model`을 사용할 준비가 됩니다.

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

## `LlamaCPP` LLM을 통한 Llama-2와의 채팅

[LlamaCPP](/docs/integrations/llms/llamacpp) `LMM`을 사용하여 Llama-2 채팅 모델을 사용하려면 [이 설치 지침](/docs/integrations/llms/llamacpp#installation)을 사용하여 `llama-cpp-python` 라이브러리를 설치하세요. 다음 예제에서는 `~/Models/llama-2-7b-chat.Q4_0.gguf`에 로컬로 저장된 양자화된 [llama-2-7b-chat.Q4_0.gguf](https://huggingface.co/TheBloke/Llama-2-7b-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_0.gguf) 모델을 사용합니다.

`LlamaCpp` 인스턴스를 생성한 후, `llm`을 다시 `Llama2Chat`에 래핑합니다.

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

그리고 이전 예제와 동일한 방식으로 사용합니다.

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