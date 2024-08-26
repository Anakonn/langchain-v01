---
translated: true
---

# Eleven Labs Text2Speech

이 노트북은 `ElevenLabs API`를 사용하여 텍스트를 음성으로 변환하는 방법을 보여줍니다.

먼저 ElevenLabs 계정을 설정해야 합니다. [여기](https://docs.elevenlabs.io/welcome/introduction)의 지침을 따르세요.

```python
%pip install --upgrade --quiet  elevenlabs
```

```python
import os

os.environ["ELEVEN_API_KEY"] = ""
```

## 사용법

```python
from langchain_community.tools import ElevenLabsText2SpeechTool

text_to_speak = "Hello world! I am the real slim shady"

tts = ElevenLabsText2SpeechTool()
tts.name
```

```output
'eleven_labs_text2speech'
```

오디오를 생성하고 임시 파일에 저장한 다음 재생할 수 있습니다.

```python
speech_file = tts.run(text_to_speak)
tts.play(speech_file)
```

또는 오디오를 직접 스트리밍할 수 있습니다.

```python
tts.stream_speech(text_to_speak)
```

## Agent 내에서 사용하기

```python
from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_openai import OpenAI
```

```python
llm = OpenAI(temperature=0)
tools = load_tools(["eleven_labs_text2speech"])
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
)
```

```python
audio_file = agent.run("Tell me a joke and read it out for me.")
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mAction:

{
  "action": "eleven_labs_text2speech",
  "action_input": {
    "query": "Why did the chicken cross the playground? To get to the other slide!"
  }
}


[0m
Observation: [36;1m[1;3m/tmp/tmpsfg783f1.wav[0m
Thought:[32;1m[1;3m I have the audio file ready to be sent to the human
Action:

{
  "action": "Final Answer",
  "action_input": "/tmp/tmpsfg783f1.wav"
}


[0m

[1m> Finished chain.[0m
```

```python
tts.play(audio_file)
```
