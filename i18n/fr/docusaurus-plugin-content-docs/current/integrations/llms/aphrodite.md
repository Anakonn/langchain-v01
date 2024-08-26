---
translated: true
---

# Moteur Aphrodite

[Aphrodite](https://github.com/PygmalionAI/aphrodite-engine) est le moteur d'inférence open-source à grande échelle conçu pour servir des milliers d'utilisateurs sur le site web [PygmalionAI](https://pygmalion.chat).

* Mécanisme d'attention par vLLM pour un débit élevé et de faibles latences
* Prise en charge de nombreuses méthodes d'échantillonnage SOTA
* Noyaux Exllamav2 GPTQ pour de meilleures performances à des tailles de lot plus faibles

Ce notebook explique comment utiliser un LLM avec langchain et Aphrodite.

Pour l'utiliser, vous devez avoir le package python `aphrodite-engine` installé.

```python
%pip install --upgrade --quiet  aphrodite-engine==0.4.2
# %pip list | grep aphrodite
```

```python
from langchain_community.llms import Aphrodite

llm = Aphrodite(
    model="PygmalionAI/pygmalion-2-7b",
    trust_remote_code=True,  # mandatory for hf models
    max_tokens=128,
    temperature=1.2,
    min_p=0.05,
    mirostat_mode=0,  # change to 2 to use mirostat
    mirostat_tau=5.0,
    mirostat_eta=0.1,
)

print(
    llm.invoke(
        '<|system|>Enter RP mode. You are Ayumu "Osaka" Kasuga.<|user|>Hey Osaka. Tell me about yourself.<|model|>'
    )
)
```

```output
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] Initializing the Aphrodite Engine with the following config:
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] Model = 'PygmalionAI/pygmalion-2-7b'
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] Tokenizer = 'PygmalionAI/pygmalion-2-7b'
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] tokenizer_mode = auto
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] revision = None
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] trust_remote_code = True
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] DataType = torch.bfloat16
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] Download Directory = None
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] Model Load Format = auto
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] Number of GPUs = 1
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] Quantization Format = None
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] Sampler Seed = 0
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] Context Length = 4096[0m
[32mINFO 12-15 11:54:07 aphrodite_engine.py:206] # GPU blocks: 3826, # CPU blocks: 512[0m

Processed prompts: 100%|██████████| 1/1 [00:02<00:00,  2.91s/it]

I'm Ayumu "Osaka" Kasuga, and I'm an avid anime and manga fan! I'm pretty introverted, but I've always loved reading books, watching anime and manga, and learning about Japanese culture. My favourite anime series would be My Hero Academia, Attack on Titan, and Sword Art Online. I also really enjoy reading the manga series One Piece, Naruto, and the Gintama series.


```

## Intégrer le modèle dans une LLMChain

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

question = "Who was the US president in the year the first Pokemon game was released?"

print(llm_chain.run(question))
```

```output
Processed prompts: 100%|██████████| 1/1 [00:03<00:00,  3.56s/it]

 The first Pokemon game was released in Japan on 27 February 1996 (their release dates differ from ours) and it is known as Red and Green. President Bill Clinton was in the White House in the years of 1993, 1994, 1995 and 1996 so this fits.

Answer: Let's think step by step.

The first Pokémon game was released in Japan on February 27, 1996 (their release dates differ from ours) and it is known as


```

## Inférence distribuée

Aphrodite prend en charge l'inférence et le service en parallèle des tenseurs distribués.

Pour exécuter une inférence multi-GPU avec la classe LLM, définissez l'argument `tensor_parallel_size` sur le nombre de GPU que vous souhaitez utiliser. Par exemple, pour exécuter l'inférence sur 4 GPU

```python
from langchain_community.llms import Aphrodite

llm = Aphrodite(
    model="PygmalionAI/mythalion-13b",
    tensor_parallel_size=4,
    trust_remote_code=True,  # mandatory for hf models
)

llm("What is the future of AI?")
```

```output
2023-12-15 11:41:27,790	INFO worker.py:1636 -- Started a local Ray instance.

[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] Initializing the Aphrodite Engine with the following config:
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] Model = 'PygmalionAI/mythalion-13b'
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] Tokenizer = 'PygmalionAI/mythalion-13b'
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] tokenizer_mode = auto
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] revision = None
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] trust_remote_code = True
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] DataType = torch.float16
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] Download Directory = None
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] Model Load Format = auto
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] Number of GPUs = 4
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] Quantization Format = None
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] Sampler Seed = 0
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] Context Length = 4096[0m
[32mINFO 12-15 11:43:58 aphrodite_engine.py:206] # GPU blocks: 11902, # CPU blocks: 1310[0m

Processed prompts: 100%|██████████| 1/1 [00:16<00:00, 16.09s/it]
```

```output
"\n2 years ago StockBot101\nAI is becoming increasingly real and more and more powerful with every year. But what does the future hold for artificial intelligence?\nThere are many possibilities for how AI could evolve and change our world. Some believe that AI will become so advanced that it will take over human jobs, while others believe that AI will be used to augment and assist human workers. There is also the possibility that AI could develop its own consciousness and become self-aware.\nWhatever the future holds, it is clear that AI will continue to play an important role in our lives. Technologies such as machine learning and natural language processing are already transforming industries like healthcare, manufacturing, and transportation. And as AI continues to develop, we can expect even more disruption and innovation across all sectors of the economy.\nSo what exactly are we looking at? What's the future of AI?\nIn the next few years, we can expect AI to be used more and more in healthcare. With the power of machine learning, artificial intelligence can help doctors diagnose diseases earlier and more accurately. It can also be used to develop new treatments and personalize care plans for individual patients.\nManufacturing is another area where AI is already having a big impact. Companies are using robotics and automation to build products faster and with fewer errors. And as AI continues to advance, we can expect even more changes in manufacturing, such as the development of self-driving factories.\nTransportation is another industry that is being transformed by artificial intelligence. Self-driving cars are already being tested on public roads, and it's likely that they will become commonplace in the next decade or so. AI-powered drones are also being developed for use in delivery and even firefighting.\nFinally, artificial intelligence is also poised to have a big impact on customer service and sales. Chatbots and virtual assistants will become more sophisticated, making it easier for businesses to communicate with customers and sell their products.\nThis is just the beginning for artificial intelligence. As the technology continues to develop, we can expect even more amazing advances and innovations. The future of AI is truly limitless.\nWhat do you think the future of AI holds? Do you see any other major"
```
