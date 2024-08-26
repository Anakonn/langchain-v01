---
translated: true
---

# Ejecutar LLMs localmente

## Caso de uso

La popularidad de proyectos como [PrivateGPT](https://github.com/imartinez/privateGPT), [llama.cpp](https://github.com/ggerganov/llama.cpp), [Ollama](https://github.com/ollama/ollama), [GPT4All](https://github.com/nomic-ai/gpt4all), [llamafile](https://github.com/Mozilla-Ocho/llamafile) y otros subraya la demanda de ejecutar LLMs localmente (en tu propio dispositivo).

Esto tiene al menos dos beneficios importantes:

1. `Privacidad`: Tus datos no se envían a un tercero y no están sujetos a los términos de servicio de un servicio comercial.
2. `Costo`: No hay tarifa de inferencia, lo cual es importante para aplicaciones intensivas en tokens (p. ej., [simulaciones de larga duración](https://twitter.com/RLanceMartin/status/1691097659262820352?s=20), resumen).

## Resumen

Ejecutar un LLM localmente requiere algunas cosas:

1. `LLM de código abierto`: Un LLM de código abierto que se pueda modificar y compartir libremente.
2. `Inferencia`: Capacidad de ejecutar este LLM en tu dispositivo con una latencia aceptable.

### LLMs de código abierto

Los usuarios ahora pueden acceder a un conjunto de [LLMs de código abierto](https://cameronrwolfe.substack.com/p/the-history-of-open-source-llms-better) que crece rápidamente.

Estos LLMs se pueden evaluar en al menos dos dimensiones (ver figura):

1. `Modelo base`: ¿Cuál es el modelo base y cómo se entrenó?
2. `Enfoque de ajuste fino`: ¿Se ajustó el modelo base y, de ser así, qué [conjunto de instrucciones](https://cameronrwolfe.substack.com/p/beyond-llama-the-power-of-open-llms#%C2%A7alpaca-an-instruction-following-llama-model) se utilizó?

![Descripción de la imagen](../../../../../../static/img/OSS_LLM_overview.png)

El rendimiento relativo de estos modelos se puede evaluar utilizando varios tableros de clasificación, incluyendo:

1. [LmSys](https://chat.lmsys.org/?arena)
2. [GPT4All](https://gpt4all.io/index.html)
3. [HuggingFace](https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard)

### Inferencia

Han surgido algunos marcos de trabajo para admitir la inferencia de LLMs de código abierto en varios dispositivos:

1. [`llama.cpp`](https://github.com/ggerganov/llama.cpp): Implementación en C++ del código de inferencia de llama con [optimización/cuantización de pesos](https://finbarr.ca/how-is-llama-cpp-possible/)
2. [`gpt4all`](https://docs.gpt4all.io/index.html): Backend optimizado en C para inferencia
3. [`Ollama`](https://ollama.ai/): Agrupa los pesos del modelo y el entorno en una aplicación que se ejecuta en el dispositivo y sirve el LLM
4. [`llamafile`](https://github.com/Mozilla-Ocho/llamafile): Agrupa los pesos del modelo y todo lo necesario para ejecutar el modelo en un solo archivo, lo que te permite ejecutar el LLM localmente desde este archivo sin pasos de instalación adicionales

En general, estos marcos de trabajo harán algunas cosas:

1. `Cuantización`: Reducir el tamaño en memoria de los pesos del modelo sin procesar
2. `Implementación eficiente para inferencia`: Admitir inferencia en hardware de consumo (p. ej., CPU o GPU de portátil)

En particular, consulta [esta excelente publicación](https://finbarr.ca/how-is-llama-cpp-possible/) sobre la importancia de la cuantización.

![Descripción de la imagen](../../../../../../static/img/llama-memory-weights.png)

Con menos precisión, reducimos radicalmente la memoria necesaria para almacenar el LLM en memoria.

Además, podemos ver la importancia del ancho de banda de memoria GPU [hoja](https://docs.google.com/spreadsheets/d/1OehfHHNSn66BP2h3Bxp2NJTVX97icU0GmCXF6pK23H8/edit#gid=0).

Un Mac M2 Max es 5-6 veces más rápido que un M1 para inferencia debido al mayor ancho de banda de memoria GPU.

![Descripción de la imagen](../../../../../../static/img/llama_t_put.png)

## Inicio rápido

[`Ollama`](https://ollama.ai/) es una forma de ejecutar fácilmente la inferencia en macOS.

Las instrucciones [aquí](https://github.com/jmorganca/ollama?tab=readme-ov-file#ollama) proporcionan detalles, que resumimos:

* [Descarga y ejecuta](https://ollama.ai/download) la aplicación
* Desde la línea de comandos, obtén un modelo de esta [lista de opciones](https://github.com/jmorganca/ollama): p. ej., `ollama pull llama2`
* Cuando se esté ejecutando la aplicación, todos los modelos se servirán automáticamente en `localhost:11434`

```python
from langchain_community.llms import Ollama

llm = Ollama(model="llama2")
llm.invoke("The first man on the moon was ...")
```

```output
' The first man on the moon was Neil Armstrong, who landed on the moon on July 20, 1969 as part of the Apollo 11 mission. obviously.'
```

Transmite tokens a medida que se generan.

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

## Entorno

La velocidad de inferencia es un desafío al ejecutar modelos localmente (ver arriba).

Para minimizar la latencia, es deseable ejecutar modelos localmente en GPU, que viene con muchos portátiles de consumo [p. ej., dispositivos Apple](https://www.apple.com/newsroom/2022/06/apple-unveils-m2-with-breakthrough-performance-and-capabilities/).

E incluso con GPU, el ancho de banda de memoria GPU disponible (como se señaló anteriormente) es importante.

### Ejecutar GPU de Apple silicon

`Ollama` y [`llamafile`](https://github.com/Mozilla-Ocho/llamafile?tab=readme-ov-file#gpu-support) utilizarán automáticamente la GPU en dispositivos Apple.

Otros marcos de trabajo requieren que el usuario configure el entorno para utilizar la GPU de Apple.

Por ejemplo, los enlaces de Python de `llama.cpp` se pueden configurar para usar la GPU a través de [Metal](https://developer.apple.com/metal/).

Metal es una API de gráficos y cómputo creada por Apple que proporciona acceso casi directo a la GPU.

Consulta la configuración de [`llama.cpp`](docs/integrations/llms/llamacpp) [aquí](https://github.com/abetlen/llama-cpp-python/blob/main/docs/install/macos.md) para habilitar esto.

En particular, asegúrate de que conda esté usando el entorno virtual correcto que creaste (`miniforge3`).

P. ej., para mí:

```bash
conda activate /Users/rlm/miniforge3/envs/llama
```

Con lo anterior confirmado, entonces:

```bash
CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install -U llama-cpp-python --no-cache-dir
```

## LLM

Hay varias formas de acceder a los pesos del modelo cuantificados.

1. [`HuggingFace`](https://huggingface.co/TheBloke) - Muchos modelos cuantificados están disponibles para descargar y se pueden ejecutar con marcos como [`llama.cpp`](https://github.com/ggerganov/llama.cpp). También puedes descargar modelos en el formato [`llamafile`](https://huggingface.co/models?other=llamafile) desde HuggingFace.
2. [`gpt4all`](https://gpt4all.io/index.html) - El explorador de modelos ofrece un tablero de clasificación de métricas y modelos cuantificados asociados disponibles para descargar.
3. [`Ollama`](https://github.com/jmorganca/ollama) - Se pueden acceder a varios modelos directamente a través de `pull`.

### Ollama

Con [Ollama](https://github.com/jmorganca/ollama), obtén un modelo a través de `ollama pull <model family>:<tag>`:

* Por ejemplo, para Llama-7b: `ollama pull llama2` descargará la versión más básica del modelo (p. ej., el número de parámetros más pequeño y la cuantificación de 4 bits).
* También podemos especificar una versión particular de la [lista de modelos](https://github.com/jmorganca/ollama?tab=readme-ov-file#model-library), por ejemplo, `ollama pull llama2:13b`.
* Consulta el conjunto completo de parámetros en la [página de referencia de la API](https://api.python.langchain.com/en/latest/llms/langchain_community.llms.ollama.Ollama.html).

```python
from langchain_community.llms import Ollama

llm = Ollama(model="llama2:13b")
llm.invoke("The first man on the moon was ... think step by step")
```

```output
' Sure! Here\'s the answer, broken down step by step:\n\nThe first man on the moon was... Neil Armstrong.\n\nHere\'s how I arrived at that answer:\n\n1. The first manned mission to land on the moon was Apollo 11.\n2. The mission included three astronauts: Neil Armstrong, Edwin "Buzz" Aldrin, and Michael Collins.\n3. Neil Armstrong was the mission commander and the first person to set foot on the moon.\n4. On July 20, 1969, Armstrong stepped out of the lunar module Eagle and onto the moon\'s surface, famously declaring "That\'s one small step for man, one giant leap for mankind."\n\nSo, the first man on the moon was Neil Armstrong!'
```

### Llama.cpp

Llama.cpp es compatible con un [amplio conjunto de modelos](https://github.com/ggerganov/llama.cpp).

Por ejemplo, a continuación ejecutamos inferencia en `llama2-13b` con cuantificación de 4 bits descargada de [HuggingFace](https://huggingface.co/TheBloke/Llama-2-13B-GGML/tree/main).

Como se mencionó anteriormente, consulta la [referencia de la API](https://api.python.langchain.com/en/latest/llms/langchain.llms.llamacpp.LlamaCpp.html?highlight=llamacpp#langchain.llms.llamacpp.LlamaCpp) para conocer el conjunto completo de parámetros.

Desde la [documentación de la API de llama.cpp](https://api.python.langchain.com/en/latest/llms/langchain_community.llms.llamacpp.LlamaCpp.htm), vale la pena comentar algunos:

`n_gpu_layers`: número de capas que se cargarán en la memoria GPU

* Valor: 1
* Significado: Solo se cargará una capa del modelo en la memoria GPU (1 a menudo es suficiente).

`n_batch`: número de tokens que el modelo debe procesar en paralelo

* Valor: n_batch
* Significado: Se recomienda elegir un valor entre 1 y n_ctx (que en este caso se establece en 2048).

`n_ctx`: ventana de contexto de tokens

* Valor: 2048
* Significado: El modelo considerará una ventana de 2048 tokens a la vez.

`f16_kv`: si el modelo debe usar media precisión para la caché de clave/valor

* Valor: True
* Significado: El modelo usará media precisión, lo que puede ser más eficiente en términos de memoria; Metal solo admite True.

```python
%env CMAKE_ARGS="-DLLAMA_METAL=on"
%env FORCE_CMAKE=1
%pip install --upgrade --quiet  llama-cpp-python --no-cache-dirclear
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

El registro de la consola mostrará lo siguiente para indicar que Metal se habilitó correctamente a partir de los pasos anteriores:

```output
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

Podemos usar los pesos del modelo descargados del [explorador de modelos de GPT4All](/docs/integrations/llms/gpt4all).

Similar a lo que se muestra arriba, podemos ejecutar la inferencia y usar [la referencia de la API](https://api.python.langchain.com/en/latest/llms/langchain_community.llms.gpt4all.GPT4All.html) para establecer los parámetros de interés.

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

Una de las formas más sencillas de ejecutar un LLM localmente es usando un [llamafile](https://github.com/Mozilla-Ocho/llamafile). Todo lo que tienes que hacer es:

1) Descargar un llamafile de [HuggingFace](https://huggingface.co/models?other=llamafile)
2) Hacer que el archivo sea ejecutable
3) Ejecutar el archivo

Los llamafiles agrupan los pesos del modelo y una [versión especialmente compilada](https://github.com/Mozilla-Ocho/llamafile?tab=readme-ov-file#technical-details) de [`llama.cpp`](https://github.com/ggerganov/llama.cpp) en un solo archivo que se puede ejecutar en la mayoría de las computadoras sin dependencias adicionales. También vienen con un servidor de inferencia integrado que proporciona una [API](https://github.com/Mozilla-Ocho/llamafile/blob/main/llama.cpp/server/README.md#api-endpoints) para interactuar con tu modelo.

Aquí hay un script bash simple que muestra los 3 pasos de configuración:

```bash
# Download a llamafile from HuggingFace
wget https://huggingface.co/jartine/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile

# Make the file executable. On Windows, instead just rename the file to end in ".exe".
chmod +x TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile

# Start the model server. Listens at http://localhost:8080 by default.
./TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile --server --nobrowser
```

Después de ejecutar los pasos de configuración anteriores, puedes usar LangChain para interactuar con tu modelo:

```python
from langchain_community.llms.llamafile import Llamafile

llm = Llamafile()

llm.invoke("The first man on the moon was ... Let's think step by step.")
```

```output
"\nFirstly, let's imagine the scene where Neil Armstrong stepped onto the moon. This happened in 1969. The first man on the moon was Neil Armstrong. We already know that.\n2nd, let's take a step back. Neil Armstrong didn't have any special powers. He had to land his spacecraft safely on the moon without injuring anyone or causing any damage. If he failed to do this, he would have been killed along with all those people who were on board the spacecraft.\n3rd, let's imagine that Neil Armstrong successfully landed his spacecraft on the moon and made it back to Earth safely. The next step was for him to be hailed as a hero by his people back home. It took years before Neil Armstrong became an American hero.\n4th, let's take another step back. Let's imagine that Neil Armstrong wasn't hailed as a hero, and instead, he was just forgotten. This happened in the 1970s. Neil Armstrong wasn't recognized for his remarkable achievement on the moon until after he died.\n5th, let's take another step back. Let's imagine that Neil Armstrong didn't die in the 1970s and instead, lived to be a hundred years old. This happened in 2036. In the year 2036, Neil Armstrong would have been a centenarian.\nNow, let's think about the present. Neil Armstrong is still alive. He turned 95 years old on July 20th, 2018. If he were to die now, his achievement of becoming the first human being to set foot on the moon would remain an unforgettable moment in history.\nI hope this helps you understand the significance and importance of Neil Armstrong's achievement on the moon!"
```

## Prompts

Algunos LLM se beneficiarán de prompts específicos.

Por ejemplo, LLaMA utilizará [tokens especiales](https://twitter.com/RLanceMartin/status/1681879318493003776?s=20).

Podemos usar `ConditionalPromptSelector` para establecer el prompt en función del tipo de modelo.

```python
# Set our LLM
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

Establece el prompt asociado en función de la versión del modelo.

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
# Chain
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

También podemos usar el Prompt Hub de LangChain para buscar y/o almacenar prompts que son específicos del modelo.

Esto funcionará con tu [clave de API de LangSmith](https://docs.smith.langchain.com/).

Por ejemplo, [aquí](https://smith.langchain.com/hub/rlm/rag-prompt-llama) hay un prompt para RAG con tokens específicos de LLaMA.

## Casos de uso

Dado un `llm` creado a partir de uno de los modelos anteriores, puedes usarlo para [muchos casos de uso](/docs/use_cases/).

Por ejemplo, aquí hay una guía sobre [RAG](/docs/use_cases/question_answering/local_retrieval_qa) con LLM locales.

En general, los casos de uso de los LLM locales pueden estar impulsados por al menos dos factores:

* `Privacidad`: datos privados (p. ej., diarios, etc.) que un usuario no quiere compartir.
* `Costo`: el preprocesamiento de texto (extracción/etiquetado), el resumen y las simulaciones de agentes son tareas intensivas en el uso de tokens.

Además, [aquí]<link tag 48] hay una descripción general sobre el ajuste fino, que puede utilizar LLM de código abierto.
