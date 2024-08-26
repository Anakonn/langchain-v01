---
translated: true
---

# LLM을 로컬에서 실행하기

## 사용 사례

[PrivateGPT](https://github.com/imartinez/privateGPT), [llama.cpp](https://github.com/ggerganov/llama.cpp), [Ollama](https://github.com/ollama/ollama), [GPT4All](https://github.com/nomic-ai/gpt4all), [llamafile](https://github.com/Mozilla-Ocho/llamafile) 등의 프로젝트의 인기는 LLM을 로컬(자신의 장치)에서 실행하려는 수요를 강조합니다.

이는 적어도 두 가지 중요한 이점을 제공합니다:

1. `프라이버시`: 데이터가 타사에 전송되지 않으며 상업 서비스의 이용 약관에 구속되지 않습니다.
2. `비용`: 추론 수수료가 없으며, 이는 토큰 집약적인 애플리케이션(예: [장기간 시뮬레이션](https://twitter.com/RLanceMartin/status/1691097659262820352?s=20), 요약)에 중요합니다.

## 개요

LLM을 로컬에서 실행하려면 몇 가지가 필요합니다:

1. `오픈 소스 LLM`: 자유롭게 수정 및 공유할 수 있는 오픈 소스 LLM
2. `추론`: 해당 LLM을 장치에서 허용 가능한 지연 시간으로 실행할 수 있는 능력

### 오픈 소스 LLM

사용자는 이제 [오픈 소스 LLM](https://cameronrwolfe.substack.com/p/the-history-of-open-source-llms-better)의 빠르게 증가하는 세트를 이용할 수 있습니다.

이들 LLM은 최소 두 가지 차원에서 평가할 수 있습니다(그림 참조):

1. `기본 모델`: 기본 모델은 무엇이며 어떻게 훈련되었는가?
2. `미세 조정 접근법`: 기본 모델이 미세 조정되었는가? 그렇다면 어떤 [명령 세트](https://cameronrwolfe.substack.com/p/beyond-llama-the-power-of-open-llms#%C2%A7alpaca-an-instruction-following-llama-model)가 사용되었는가?

![이미지 설명](../../../../../../static/img/OSS_LLM_overview.png)

이 모델들의 상대적 성능은 여러 리더보드를 통해 평가할 수 있습니다:

1. [LmSys](https://chat.lmsys.org/?arena)
2. [GPT4All](https://gpt4all.io/index.html)
3. [HuggingFace](https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard)

### 추론

이와 관련하여 다양한 장치에서 오픈 소스 LLM의 추론을 지원하는 몇 가지 프레임워크가 등장했습니다:

1. [`llama.cpp`](https://github.com/ggerganov/llama.cpp): [가중치 최적화/양자화](https://finbarr.ca/how-is-llama-cpp-possible/)를 포함한 Llama 추론 코드의 C++ 구현
2. [`gpt4all`](https://docs.gpt4all.io/index.html): 최적화된 C 백엔드 추론
3. [`Ollama`](https://ollama.ai/): 모델 가중치와 환경을 앱에 번들로 묶어 장치에서 실행하고 LLM을 제공
4. [`llamafile`](https://github.com/Mozilla-Ocho/llamafile): 모델 가중치와 필요한 모든 것을 단일 파일에 번들로 묶어 추가 설치 단계 없이 해당 파일에서 LLM을 로컬로 실행할 수 있게 함

일반적으로, 이러한 프레임워크는 다음과 같은 작업을 수행합니다:

1. `양자화`: 원시 모델 가중치의 메모리 사용량 감소
2. `효율적인 추론 구현`: 소비자 하드웨어(예: CPU 또는 노트북 GPU)에서 추론 지원

특히, 양자화의 중요성에 대한 [이 훌륭한 게시물](https://finbarr.ca/how-is-llama-cpp-possible/)을 참조하십시오.

![이미지 설명](../../../../../../static/img/llama-memory-weights.png)

정밀도가 낮아지면 메모리에 LLM을 저장하는 데 필요한 메모리가 급격히 줄어듭니다.

또한, [GPU 메모리 대역폭 시트](https://docs.google.com/spreadsheets/d/1OehfHHNSn66BP2h3Bxp2NJTVX97icU0GmCXF6pK23H8/edit#gid=0)의 중요성을 확인할 수 있습니다!

Mac M2 Max는 더 큰 GPU 메모리 대역폭으로 인해 M1보다 추론 속도가 5-6배 빠릅니다.

![이미지 설명](../../../../../../static/img/llama_t_put.png)

## 빠른 시작

[`Ollama`](https://ollama.ai/)는 macOS에서 쉽게 추론을 실행하는 한 방법입니다.

여기 [지침](https://github.com/jmorganca/ollama?tab=readme-ov-file#ollama)에서 자세한 내용을 제공하며, 요약하면:

- 앱을 [다운로드하고 실행](https://ollama.ai/download)합니다.
- 명령줄에서 이 [옵션 목록](https://github.com/jmorganca/ollama)에서 모델을 가져옵니다: 예를 들어, `ollama pull llama2`
- 앱이 실행 중일 때, 모든 모델은 자동으로 `localhost:11434`에서 제공됩니다.

```python
from langchain_community.llms import Ollama

llm = Ollama(model="llama2")
llm.invoke("The first man on the moon was ...")
```

```output
' The first man on the moon was Neil Armstrong, who landed on the moon on July 20, 1969 as part of the Apollo 11 mission. obviously.'
```

토큰이 생성되는 대로 스트림합니다.

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

## 환경

모델을 로컬에서 실행할 때 추론 속도는 도전 과제입니다(위 참조).

지연 시간을 최소화하려면 많은 소비자 노트북에 포함된 GPU에서 모델을 로컬로 실행하는 것이 바람직합니다 [예: Apple 장치](https://www.apple.com/newsroom/2022/06/apple-unveils-m2-with-breakthrough-performance-and-capabilities/).

그리고 GPU가 있어도, 사용 가능한 GPU 메모리 대역폭(위에서 언급한 것처럼)이 중요합니다.

### Apple 실리콘 GPU 실행

`Ollama`와 [`llamafile`](https://github.com/Mozilla-Ocho/llamafile?tab=readme-ov-file#gpu-support)은 Apple 장치에서 GPU를 자동으로 활용합니다.

다른 프레임워크는 사용자가 Apple GPU를 활용하도록 환경을 설정해야 합니다.

예를 들어, `llama.cpp` 파이썬 바인딩은 [Metal](https://developer.apple.com/metal/)을 통해 GPU를 사용할 수 있도록 설정할 수 있습니다.

Metal은 Apple이 만든 그래픽 및 컴퓨팅 API로, GPU에 대한 거의 직접적인 접근을 제공합니다.

이 [설정](https://github.com/abetlen/llama-cpp-python/blob/main/docs/install/macos.md)을 통해 `llama.cpp` 설정을 확인하십시오.

특히, conda가 생성한 올바른 가상 환경(`miniforge3`)을 사용하고 있는지 확인하십시오.

예: 저의 경우:

```
conda activate /Users/rlm/miniforge3/envs/llama
```

위 확인 후:

```
CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install -U llama-cpp-python --no-cache-dir
```

## LLM들

양자화된 모델 가중치에 접근하는 다양한 방법이 있습니다.

1. [`HuggingFace`](https://huggingface.co/TheBloke) - 여러 양자화된 모델을 다운로드할 수 있으며 [`llama.cpp`](https://github.com/ggerganov/llama.cpp)와 같은 프레임워크로 실행할 수 있습니다. 또한 HuggingFace에서 [`llamafile` 형식](https://huggingface.co/models?other=llamafile)으로 모델을 다운로드할 수도 있습니다.
2. [`gpt4all`](https://gpt4all.io/index.html) - 모델 탐색기는 메트릭스와 관련된 양자화된 모델의 다운로드를 제공하는 리더보드를 제공합니다.
3. [`Ollama`](https://github.com/jmorganca/ollama) - `pull` 명령어를 통해 여러 모델에 직접 접근할 수 있습니다.

### Ollama

[Ollama](https://github.com/jmorganca/ollama)를 사용하여 `ollama pull <model family>:<tag>` 명령어로 모델을 가져올 수 있습니다:

- 예를 들어, Llama-7b의 경우: `ollama pull llama2`는 가장 기본적인 버전의 모델(예: 가장 작은 파라미터 수와 4비트 양자화)을 다운로드합니다.
- [모델 목록](https://github.com/jmorganca/ollama?tab=readme-ov-file#model-library)에서 특정 버전을 지정할 수도 있습니다. 예: `ollama pull llama2:13b`
- 전체 파라미터는 [API 참조 페이지](https://api.python.langchain.com/en/latest/llms/langchain_community.llms.ollama.Ollama.html)에서 확인할 수 있습니다.

```python
from langchain_community.llms import Ollama

llm = Ollama(model="llama2:13b")
llm.invoke("The first man on the moon was ... think step by step")
```

```output
' Sure! Here\'s the answer, broken down step by step:\n\nThe first man on the moon was... Neil Armstrong.\n\nHere\'s how I arrived at that answer:\n\n1. The first manned mission to land on the moon was Apollo 11.\n2. The mission included three astronauts: Neil Armstrong, Edwin "Buzz" Aldrin, and Michael Collins.\n3. Neil Armstrong was the mission commander and the first person to set foot on the moon.\n4. On July 20, 1969, Armstrong stepped out of the lunar module Eagle and onto the moon\'s surface, famously declaring "That\'s one small step for man, one giant leap for mankind."\n\nSo, the first man on the moon was Neil Armstrong!'
```

### Llama.cpp

Llama.cpp는 [폭넓은 모델 세트](https://github.com/ggerganov/llama.cpp)와 호환됩니다.

예를 들어, 아래에서는 [HuggingFace](https://huggingface.co/TheBloke/Llama-2-13B-GGML/tree/main)에서 다운로드한 4비트 양자화된 `llama2-13b`에서 추론을 실행합니다.

위에서 언급한 것처럼 전체 파라미터 세트는 [API 참조](https://api.python.langchain.com/en/latest/llms/langchain.llms.llamacpp.LlamaCpp.html?highlight=llamacpp#langchain.llms.llamacpp.LlamaCpp)에서 확인할 수 있습니다.

[llama.cpp API 참조 문서](https://api.python.langchain.com/en/latest/llms/langchain_community.llms.llamacpp.LlamaCpp.htm)에서 몇 가지 주목할 만한 사항은 다음과 같습니다:

`n_gpu_layers`: GPU 메모리에 로드할 레이어 수

- 값: 1
- 의미: 모델의 한 레이어만 GPU 메모리에 로드됩니다(1이면 충분한 경우가 많음).

`n_batch`: 모델이 병렬로 처리해야 하는 토큰 수

- 값: n_batch
- 의미: 1에서 n_ctx(이 경우 2048으로 설정됨) 사이의 값을 선택하는 것이 좋습니다.

`n_ctx`: 토큰 컨텍스트 윈도우

- 값: 2048
- 의미: 모델은 한 번에 2048개의 토큰을 고려합니다.

`f16_kv`: 키/값 캐시를 반정밀도로 사용할지 여부

- 값: True
- 의미: 모델은 반정밀도를 사용하여 메모리를 더 효율적으로 사용할 수 있습니다. Metal은 True만 지원합니다.

```python
%env CMAKE_ARGS="-DLLAMA_METAL=on"
%env FORCE_CMAKE=1
%pip install --upgrade --quiet llama-cpp-python --no-cache-dirclear
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

콘솔 로그는 Metal이 올바르게 활성화되었음을 나타내는 아래 내용을 표시합니다:

```
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

[GPT4All](/docs/integrations/llms/gpt4all) 모델 탐색기에서 다운로드한 모델 가중치를 사용할 수 있습니다.

위에서 보여준 것과 유사하게, 추론을 실행하고 [API 참조](https://api.python.langchain.com/en/latest/llms/langchain_community.llms.gpt4all.GPT4All.html)를 사용하여 관심 있는 파라미터를 설정할 수 있습니다.

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

로컬에서 LLM을 실행하는 가장 간단한 방법 중 하나는 [llamafile](https://github.com/Mozilla-Ocho/llamafile)을 사용하는 것입니다. 다음과 같이 하면 됩니다:

1. [HuggingFace](https://huggingface.co/models?other=llamafile)에서 llamafile을 다운로드합니다.
2. 파일을 실행 가능하게 만듭니다.
3. 파일을 실행합니다.

llamafile은 모델 가중치와 [특별히 컴파일된](https://github.com/Mozilla-Ocho/llamafile?tab=readme-ov-file#technical-details) [`llama.cpp`](https://github.com/ggerganov/llama.cpp)를 단일 파일로 번들링하여 추가 종속성 없이 대부분의 컴퓨터에서 실행할 수 있습니다. 또한, 모델과 상호작용할 수 있는 [API](https://github.com/Mozilla-Ocho/llamafile/blob/main/llama.cpp/server/README.md#api-endpoints)를 제공하는 내장 추론 서버도 포함되어 있습니다.

다음은 모든 설정 단계를 보여주는 간단한 bash 스크립트입니다:

```bash
# HuggingFace에서 llamafile 다운로드

wget https://huggingface.co/jartine/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile

# 파일을 실행 가능하게 만듭니다. Windows에서는 파일 이름을 ".exe"로 끝나게 변경합니다.

chmod +x TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile

# 모델 서버를 시작합니다. 기본적으로 http://localhost:8080에서 수신합니다.

./TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile --server --nobrowser
```

위 설정 단계를 실행한 후, LangChain을 사용하여 모델과 상호작용할 수 있습니다:

```python
from langchain_community.llms.llamafile import Llamafile

llm = Llamafile()

llm.invoke("The first man on the moon was ... Let's think step by step.")
```

```output
"\nFirstly, let's imagine the scene where Neil Armstrong stepped onto the moon. This happened in 1969. The first man on the moon was Neil Armstrong. We already know that.\n2nd, let's take a step back. Neil Armstrong didn't have any special powers. He had to land his spacecraft safely on the moon without injuring anyone or causing any damage. If he failed to do this, he would have been killed along with all those people who were on board the spacecraft.\n3rd, let's imagine that Neil Armstrong successfully landed his spacecraft on the moon and made it back to Earth safely. The next step was for him to be hailed as a hero by his people back home. It took years before Neil Armstrong became an American hero.\n4th, let's take another step back. Let's imagine that Neil Armstrong wasn't hailed as a hero, and instead, he was just forgotten. This happened in the 1970s. Neil Armstrong wasn't recognized for his remarkable achievement on the moon until after he died.\n5th, let's take another step back. Let's imagine that Neil Armstrong didn't die in the 1970s and instead, lived to be a hundred years old. This happened in 2036. In the year 2036, Neil Armstrong would have been a centenarian.\nNow, let's think about the present. Neil Armstrong is still alive. He turned 95 years old on July 20th, 2018. If he were to die now, his achievement of becoming the first human being to set foot on the moon would remain an unforgettable moment in history.\nI hope this helps you understand the significance and importance of Neil Armstrong's achievement on the moon!"
```

## 프롬프트

일부 LLM은 특정 프롬프트로 더 나은 성능을 발휘할 수 있습니다.

예를 들어, LLaMA는 [특수 토큰](https://twitter.com/RLanceMartin/status/1681879318493003776?s=20)을 사용할 것입니다.

`ConditionalPromptSelector`를 사용하여 모델 유형에 따라 프롬프트를 설정할 수 있습니다.

```python
# LLM 설정

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

모델 버전에 따라 관련된 프롬프트를 설정합니다.

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
# 체인 생성

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

LangChain Prompt Hub을 사용하여 모델 특정 프롬프트를 가져오거나 저장할 수도 있습니다.

이 작업은 [LangSmith API 키](https://docs.smith.langchain.com/)와 함께 작동합니다.

예를 들어, [여기](https://smith.langchain.com/hub/rlm/rag-prompt-llama)는 LLaMA 전용 토큰을 사용한 RAG 프롬프트입니다.

## 사용 사례

위에서 생성된 `llm`을 사용하여 [다양한 사용 사례](/docs/use_cases/)에 사용할 수 있습니다.

예를 들어, 로컬 LLM을 사용한 [RAG](https://docs.use_cases/question_answering/local_retrieval_qa)에 대한 가이드가 있습니다.

일반적으로 로컬 LLM의 사용 사례는 최소 두 가지 요인에 의해 결정될 수 있습니다:

- `프라이버시`: 사용자가 공유하기를 원하지 않는 개인 데이터(예: 저널 등)
- `비용`: 텍스트 전처리(추출/태깅), 요약 및 에이전트 시뮬레이션은 토큰 사용이 많은 작업입니다.

또한, [여기](https://blog.langchain.dev/using-langsmith-to-support-fine-tuning-of-open-source-llms/)는 오픈 소스 LLM을 활용한 미세 조정에 대한 개요입니다.