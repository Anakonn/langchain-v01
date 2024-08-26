---
translated: true
---

# ग्रेडियो

`हग्गिंग फ़ेस स्पेसेस` पर `ग्रेडियो` के कई 1000 एप्लिकेशन हैं। यह लाइब्रेरी उन्हें आपके एलएलएम के उंगलियों के नुकीले किनारों पर रखती है 🦾

विशेष रूप से, `gradio-tools` एक पायथन लाइब्रेरी है जो `ग्रेडियो` एप्लिकेशन को ऐसे उपकरणों में बदलती है जिनका उपयोग एक बड़े भाषा मॉडल (एलएलएम) आधारित एजेंट अपने कार्य को पूरा करने के लिए कर सकता है। उदाहरण के लिए, एक एलएलएम ऑनलाइन मिली किसी आवाज़ रिकॉर्डिंग को ट्रांसक्राइब करने और फिर उसका सारांश देने के लिए एक `ग्रेडियो` उपकरण का उपयोग कर सकता है। या वह आपके Google Drive पर मौजूद किसी दस्तावेज़ पर OCR लागू करने और फिर उसके बारे में प्रश्न पूछने के लिए एक अलग `ग्रेडियो` उपकरण का उपयोग कर सकता है।

यदि आप किसी ऐसे स्पेस का उपयोग करना चाहते हैं जो पूर्व-निर्मित उपकरणों में से एक नहीं है, तो अपना स्वयं का उपकरण बनाना बहुत आसान है। कृपया gradio-tools दस्तावेज़ीकरण के इस भाग को देखें कि ऐसा कैसे करें। सभी योगदान स्वागत योग्य हैं!

```python
%pip install --upgrade --quiet  gradio_tools
```

## एक उपकरण का उपयोग करना

```python
from gradio_tools.tools import StableDiffusionTool
```

```python
local_file_path = StableDiffusionTool().langchain.run(
    "Please create a photo of a dog riding a skateboard"
)
local_file_path
```

```output
Loaded as API: https://gradio-client-demos-stable-diffusion.hf.space ✔

Job Status: Status.STARTING eta: None
```

```output
'/Users/harrisonchase/workplace/langchain/docs/modules/agents/tools/integrations/b61c1dd9-47e2-46f1-a47c-20d27640993d/tmp4ap48vnm.jpg'
```

```python
from PIL import Image
```

```python
im = Image.open(local_file_path)
```

```python
from IPython.display import display

display(im)
```

## एक एजेंट के भीतर उपयोग करना

```python
from gradio_tools.tools import (
    ImageCaptioningTool,
    StableDiffusionPromptGeneratorTool,
    StableDiffusionTool,
    TextToVideoTool,
)
from langchain.agents import initialize_agent
from langchain.memory import ConversationBufferMemory
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)
memory = ConversationBufferMemory(memory_key="chat_history")
tools = [
    StableDiffusionTool().langchain,
    ImageCaptioningTool().langchain,
    StableDiffusionPromptGeneratorTool().langchain,
    TextToVideoTool().langchain,
]


agent = initialize_agent(
    tools, llm, memory=memory, agent="conversational-react-description", verbose=True
)
output = agent.run(
    input=(
        "Please create a photo of a dog riding a skateboard "
        "but improve my prompt prior to using an image generator."
        "Please caption the generated image and create a video for it using the improved prompt."
    )
)
```

```output
Loaded as API: https://gradio-client-demos-stable-diffusion.hf.space ✔
Loaded as API: https://taesiri-blip-2.hf.space ✔
Loaded as API: https://microsoft-promptist.hf.space ✔
Loaded as API: https://damo-vilab-modelscope-text-to-video-synthesis.hf.space ✔


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Thought: Do I need to use a tool? Yes
Action: StableDiffusionPromptGenerator
Action Input: A dog riding a skateboard[0m
Job Status: Status.STARTING eta: None

Observation: [38;5;200m[1;3mA dog riding a skateboard, digital painting, artstation, concept art, smooth, sharp focus, illustration, art by artgerm and greg rutkowski and alphonse mucha[0m
Thought:[32;1m[1;3m Do I need to use a tool? Yes
Action: StableDiffusion
Action Input: A dog riding a skateboard, digital painting, artstation, concept art, smooth, sharp focus, illustration, art by artgerm and greg rutkowski and alphonse mucha[0m
Job Status: Status.STARTING eta: None

Job Status: Status.PROCESSING eta: None

Observation: [36;1m[1;3m/Users/harrisonchase/workplace/langchain/docs/modules/agents/tools/integrations/2e280ce4-4974-4420-8680-450825c31601/tmpfmiz2g1c.jpg[0m
Thought:[32;1m[1;3m Do I need to use a tool? Yes
Action: ImageCaptioner
Action Input: /Users/harrisonchase/workplace/langchain/docs/modules/agents/tools/integrations/2e280ce4-4974-4420-8680-450825c31601/tmpfmiz2g1c.jpg[0m
Job Status: Status.STARTING eta: None

Observation: [33;1m[1;3ma painting of a dog sitting on a skateboard[0m
Thought:[32;1m[1;3m Do I need to use a tool? Yes
Action: TextToVideo
Action Input: a painting of a dog sitting on a skateboard[0m
Job Status: Status.STARTING eta: None
Due to heavy traffic on this app, the prediction will take approximately 73 seconds.For faster predictions without waiting in queue, you may duplicate the space using: Client.duplicate(damo-vilab/modelscope-text-to-video-synthesis)

Job Status: Status.IN_QUEUE eta: 73.89824726581574
Due to heavy traffic on this app, the prediction will take approximately 42 seconds.For faster predictions without waiting in queue, you may duplicate the space using: Client.duplicate(damo-vilab/modelscope-text-to-video-synthesis)

Job Status: Status.IN_QUEUE eta: 42.49370198879602

Job Status: Status.IN_QUEUE eta: 21.314297944849187

Observation: [31;1m[1;3m/var/folders/bm/ylzhm36n075cslb9fvvbgq640000gn/T/tmp5snj_nmzf20_cb3m.mp4[0m
Thought:[32;1m[1;3m Do I need to use a tool? No
AI: Here is a video of a painting of a dog sitting on a skateboard.[0m

[1m> Finished chain.[0m
```
