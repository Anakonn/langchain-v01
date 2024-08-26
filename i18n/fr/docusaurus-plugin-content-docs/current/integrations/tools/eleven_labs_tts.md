---
translated: true
---

# Eleven Labs Text2Speech

Ce notebook montre comment interagir avec l'`API ElevenLabs` pour obtenir des capacités de texte-à-parole.

Tout d'abord, vous devez configurer un compte ElevenLabs. Vous pouvez suivre les instructions [ici](https://docs.elevenlabs.io/welcome/introduction).

```python
%pip install --upgrade --quiet  elevenlabs
```

```python
import os

os.environ["ELEVEN_API_KEY"] = ""
```

## Utilisation

```python
from langchain_community.tools import ElevenLabsText2SpeechTool

text_to_speak = "Hello world! I am the real slim shady"

tts = ElevenLabsText2SpeechTool()
tts.name
```

```output
'eleven_labs_text2speech'
```

Nous pouvons générer de l'audio, l'enregistrer dans un fichier temporaire et le lire.

```python
speech_file = tts.run(text_to_speak)
tts.play(speech_file)
```

Ou diffuser l'audio directement.

```python
tts.stream_speech(text_to_speak)
```

## Utiliser dans un Agent

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
