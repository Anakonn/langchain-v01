---
translated: true
---

# Gradio

Hay miles de aplicaciones `Gradio` en `Hugging Face Spaces`. Esta biblioteca las pone a la punta de los dedos de su LLM 🦾

Específicamente, `gradio-tools` es una biblioteca de Python para convertir aplicaciones `Gradio` en herramientas que pueden ser aprovechadas por un agente basado en un modelo de lenguaje grande (LLM) para completar su tarea. Por ejemplo, un LLM podría usar una herramienta `Gradio` para transcribir una grabación de voz que encuentre en línea y luego resumirla para usted. O podría usar una herramienta `Gradio` diferente para aplicar OCR a un documento en su Google Drive y luego responder preguntas sobre él.

Es muy fácil crear su propia herramienta si desea usar un espacio que no sea una de las herramientas preconfiguradas. Consulte esta sección de la documentación de gradio-tools para obtener información sobre cómo hacer eso. ¡Todas las contribuciones son bienvenidas!

```python
%pip install --upgrade --quiet  gradio_tools
```

## Usando una herramienta

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

## Usando dentro de un agente

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
