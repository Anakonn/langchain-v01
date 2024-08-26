---
translated: true
---

# ईलेवन लैब्स टेक्स्ट2स्पीच

यह नोटबुक दिखाता है कि `ElevenLabs API` के साथ कैसे इंटरैक्ट करें और टेक्स्ट-टू-स्पीच क्षमताएं प्राप्त करें।

सबसे पहले, आपको एक ElevenLabs खाता सेट अप करने की आवश्यकता है। आप [यहाँ](https://docs.elevenlabs.io/welcome/introduction) दिए गए निर्देशों का पालन कर सकते हैं।

```python
%pip install --upgrade --quiet  elevenlabs
```

```python
import os

os.environ["ELEVEN_API_KEY"] = ""
```

## उपयोग

```python
from langchain_community.tools import ElevenLabsText2SpeechTool

text_to_speak = "Hello world! I am the real slim shady"

tts = ElevenLabsText2SpeechTool()
tts.name
```

```output
'eleven_labs_text2speech'
```

हम ऑडियो जनरेट कर सकते हैं, इसे अस्थायी फ़ाइल में सहेज सकते हैं और फिर इसे चला सकते हैं।

```python
speech_file = tts.run(text_to_speak)
tts.play(speech_file)
```

या सीधे ऑडियो स्ट्रीम कर सकते हैं।

```python
tts.stream_speech(text_to_speak)
```

## एजेंट के भीतर उपयोग

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
