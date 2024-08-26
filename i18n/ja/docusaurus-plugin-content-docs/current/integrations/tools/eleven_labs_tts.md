---
translated: true
---

# Eleven Labs Text2Speech

このノートブックでは、`ElevenLabs API`を使用してテキストから音声を生成する方法を示します。

まず、ElevenLabsのアカウントを設定する必要があります。[ここ](https://docs.elevenlabs.io/welcome/introduction)の手順に従ってください。

```python
%pip install --upgrade --quiet  elevenlabs
```

```python
import os

os.environ["ELEVEN_API_KEY"] = ""
```

## 使用方法

```python
from langchain_community.tools import ElevenLabsText2SpeechTool

text_to_speak = "Hello world! I am the real slim shady"

tts = ElevenLabsText2SpeechTool()
tts.name
```

```output
'eleven_labs_text2speech'
```

一時ファイルに保存してから再生することができます。

```python
speech_file = tts.run(text_to_speak)
tts.play(speech_file)
```

または、直接ストリーミングすることもできます。

```python
tts.stream_speech(text_to_speak)
```

## Agentでの使用

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
