---
translated: true
---

# Llama.cpp

[llama-cpp-python](https://github.com/abetlen/llama-cpp-python) es un enlace de Python para [llama.cpp](https://github.com/ggerganov/llama.cpp).

Admite inferencia para [many LLMs](https://github.com/ggerganov/llama.cpp#description) modelos, a los que se puede acceder en [Hugging Face](https://huggingface.co/TheBloke).

Este cuaderno analiza cómo ejecutar `llama-cpp-python` dentro de LangChain.

**Nota: las nuevas versiones de `llama-cpp-python` utilizan archivos de modelo GGUF (ver [aquí](https://github.com/abetlen/llama-cpp-python/pull/633)).**

Este es un cambio importante.

Para convertir los modelos GGML existentes a GGUF, puede ejecutar lo siguiente en [llama.cpp](https://github.com/ggerganov/llama.cpp):

```bash
python ./convert-llama-ggmlv3-to-gguf.py --eps 1e-5 --input models/openorca-platypus2-13b.ggmlv3.q4_0.bin --output models/openorca-platypus2-13b.gguf.q4_0.bin
```

## Instalación

Hay diferentes opciones para instalar el paquete llama-cpp:
- Uso de CPU
- CPU + GPU (usando uno de los muchos backends BLAS)
- GPU Metal (MacOS con chip Apple Silicon)

### Instalación solo con CPU

```python
%pip install --upgrade --quiet  llama-cpp-python
```

### Instalación con OpenBLAS / cuBLAS / CLBlast

`llama.cpp` admite múltiples backends BLAS para un procesamiento más rápido. Use la variable de entorno `FORCE_CMAKE=1` para forzar el uso de cmake e instale el paquete pip para el backend BLAS deseado ([source](https://github.com/abetlen/llama-cpp-python#installation-with-openblas--cublas--clblast)).

Ejemplo de instalación con backend cuBLAS:

```python
!CMAKE_ARGS="-DLLAMA_CUBLAS=on" FORCE_CMAKE=1 pip install llama-cpp-python
```

**IMPORTANTE**: Si ya ha instalado la versión solo con CPU del paquete, debe reinstalarlo desde cero. Considere el siguiente comando:

```python
!CMAKE_ARGS="-DLLAMA_CUBLAS=on" FORCE_CMAKE=1 pip install --upgrade --force-reinstall llama-cpp-python --no-cache-dir
```

### Instalación con Metal

`llama.cpp` admite ciudadano de primera clase de Apple silicon, optimizado a través de los marcos ARM NEON, Accelerate y Metal. Use la variable de entorno `FORCE_CMAKE=1` para forzar el uso de cmake e instale el paquete pip para el soporte de Metal ([source](https://github.com/abetlen/llama-cpp-python/blob/main/docs/install/macos.md)).

Ejemplo de instalación con soporte de Metal:

```python
!CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install llama-cpp-python
```

**IMPORTANTE**: Si ya ha instalado una versión solo con CPU del paquete, debe reinstalarlo desde cero: considere el siguiente comando:

```python
!CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install --upgrade --force-reinstall llama-cpp-python --no-cache-dir
```

### Instalación en Windows

Es estable instalar la biblioteca `llama-cpp-python` compilando desde la fuente. Puede seguir la mayoría de las instrucciones en el propio repositorio, pero hay algunas instrucciones específicas de Windows que pueden ser útiles.

Requisitos para instalar `llama-cpp-python`,

- git
- python
- cmake
- Visual Studio Community (asegúrese de instalarlo con la siguiente configuración)
    - Desarrollo de escritorio con C++
    - Desarrollo de Python
    - Desarrollo de incrustados de Linux con C++

1. Clonar el repositorio git de forma recursiva para obtener el submódulo `llama.cpp` también

```bash
git clone --recursive -j8 https://github.com/abetlen/llama-cpp-python.git
```

2. Abra un símbolo del sistema y establezca las siguientes variables de entorno.

```bash
set FORCE_CMAKE=1
set CMAKE_ARGS=-DLLAMA_CUBLAS=OFF
```

Si tiene una GPU NVIDIA, asegúrese de que `DLLAMA_CUBLAS` esté establecido en `ON`

#### Compilación e instalación

Ahora puede `cd` en el directorio `llama-cpp-python` e instalar el paquete

```bash
python -m pip install -e .
```

**IMPORTANTE**: Si ya ha instalado una versión solo con CPU del paquete, debe reinstalarlo desde cero: considere el siguiente comando:

```python
!python -m pip install -e . --force-reinstall --no-cache-dir
```

## Uso

Asegúrese de seguir todas las instrucciones para [instalar todos los archivos de modelo necesarios](https://github.com/ggerganov/llama.cpp).

No necesita un `API_TOKEN` ya que ejecutará el LLM de forma local.

Vale la pena entender qué modelos son adecuados para usarse en la máquina deseada.

Los modelos de Hugging Face de [TheBloke's](https://huggingface.co/TheBloke) tienen una sección `Provided files` que expone la RAM necesaria para ejecutar modelos de diferentes tamaños y métodos de cuantificación (por ejemplo: [Llama2-7B-Chat-GGUF](https://huggingface.co/TheBloke/Llama-2-7b-Chat-GGUF#provided-files)).

Este [github issue](https://github.com/facebookresearch/llama/issues/425) también es relevante para encontrar el modelo adecuado para su máquina.

```python
from langchain_community.llms import LlamaCpp
from langchain_core.callbacks import CallbackManager, StreamingStdOutCallbackHandler
from langchain_core.prompts import PromptTemplate
```

**¡Considere usar una plantilla que se ajuste a su modelo! Consulte la página de modelos en Hugging Face, etc. para obtener una plantilla de solicitud correcta.**

```python
template = """Question: {question}

Answer: Let's work this out in a step by step way to be sure we have the right answer."""

prompt = PromptTemplate.from_template(template)
```

```python
# Callbacks support token-wise streaming
callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])
```

### CPU

Ejemplo usando un modelo LLaMA 2 7B

```python
# Make sure the model path is correct for your system!
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    temperature=0.75,
    max_tokens=2000,
    top_p=1,
    callback_manager=callback_manager,
    verbose=True,  # Verbose is required to pass to the callback manager
)
```

```python
question = """
Question: A rap battle between Stephen Colbert and John Oliver
"""
llm.invoke(question)
```

```output

Stephen Colbert:
Yo, John, I heard you've been talkin' smack about me on your show.
Let me tell you somethin', pal, I'm the king of late-night TV
My satire is sharp as a razor, it cuts deeper than a knife
While you're just a british bloke tryin' to be funny with your accent and your wit.
John Oliver:
Oh Stephen, don't be ridiculous, you may have the ratings but I got the real talk.
My show is the one that people actually watch and listen to, not just for the laughs but for the facts.
While you're busy talkin' trash, I'm out here bringing the truth to light.
Stephen Colbert:
Truth? Ha! You think your show is about truth? Please, it's all just a joke to you.
You're just a fancy-pants british guy tryin' to be funny with your news and your jokes.
While I'm the one who's really makin' a difference, with my sat


llama_print_timings:        load time =   358.60 ms
llama_print_timings:      sample time =   172.55 ms /   256 runs   (    0.67 ms per token,  1483.59 tokens per second)
llama_print_timings: prompt eval time =   613.36 ms /    16 tokens (   38.33 ms per token,    26.09 tokens per second)
llama_print_timings:        eval time = 10151.17 ms /   255 runs   (   39.81 ms per token,    25.12 tokens per second)
llama_print_timings:       total time = 11332.41 ms
```

```output
"\nStephen Colbert:\nYo, John, I heard you've been talkin' smack about me on your show.\nLet me tell you somethin', pal, I'm the king of late-night TV\nMy satire is sharp as a razor, it cuts deeper than a knife\nWhile you're just a british bloke tryin' to be funny with your accent and your wit.\nJohn Oliver:\nOh Stephen, don't be ridiculous, you may have the ratings but I got the real talk.\nMy show is the one that people actually watch and listen to, not just for the laughs but for the facts.\nWhile you're busy talkin' trash, I'm out here bringing the truth to light.\nStephen Colbert:\nTruth? Ha! You think your show is about truth? Please, it's all just a joke to you.\nYou're just a fancy-pants british guy tryin' to be funny with your news and your jokes.\nWhile I'm the one who's really makin' a difference, with my sat"
```

Ejemplo usando un modelo LLaMA v1

```python
# Make sure the model path is correct for your system!
llm = LlamaCpp(
    model_path="./ggml-model-q4_0.bin", callback_manager=callback_manager, verbose=True
)
```

```python
llm_chain = prompt | llm
```

```python
question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"
llm_chain.invoke({"question": question})
```

```output


1. First, find out when Justin Bieber was born.
2. We know that Justin Bieber was born on March 1, 1994.
3. Next, we need to look up when the Super Bowl was played in that year.
4. The Super Bowl was played on January 28, 1995.
5. Finally, we can use this information to answer the question. The NFL team that won the Super Bowl in the year Justin Bieber was born is the San Francisco 49ers.


llama_print_timings:        load time =   434.15 ms
llama_print_timings:      sample time =    41.81 ms /   121 runs   (    0.35 ms per token)
llama_print_timings: prompt eval time =  2523.78 ms /    48 tokens (   52.58 ms per token)
llama_print_timings:        eval time = 23971.57 ms /   121 runs   (  198.11 ms per token)
llama_print_timings:       total time = 28945.95 ms
```

```output
'\n\n1. First, find out when Justin Bieber was born.\n2. We know that Justin Bieber was born on March 1, 1994.\n3. Next, we need to look up when the Super Bowl was played in that year.\n4. The Super Bowl was played on January 28, 1995.\n5. Finally, we can use this information to answer the question. The NFL team that won the Super Bowl in the year Justin Bieber was born is the San Francisco 49ers.'
```

### GPU

Si la instalación con el backend BLAS fue correcta, verá un indicador `BLAS = 1` en las propiedades del modelo.

Dos de los parámetros más importantes para usar con GPU son:

- `n_gpu_layers` - determina cuántas capas del modelo se descargan en su GPU.
- `n_batch` - cuántos tokens se procesan en paralelo.

Establecer estos parámetros correctamente mejorará drásticamente la velocidad de evaluación (ver [wrapper code](https://github.com/langchain-ai/langchain/blob/master/libs/community/langchain_community/llms/llamacpp.py) para más detalles).

```python
n_gpu_layers = -1  # The number of layers to put on the GPU. The rest will be on the CPU. If you don't know how many layers there are, you can use -1 to move all to GPU.
n_batch = 512  # Should be between 1 and n_ctx, consider the amount of VRAM in your GPU.

# Make sure the model path is correct for your system!
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    n_gpu_layers=n_gpu_layers,
    n_batch=n_batch,
    callback_manager=callback_manager,
    verbose=True,  # Verbose is required to pass to the callback manager
)
```

```python
llm_chain = prompt | llm
question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"
llm_chain.invoke({"question": question})
```

```output


1. Identify Justin Bieber's birth date: Justin Bieber was born on March 1, 1994.

2. Find the Super Bowl winner of that year: The NFL season of 1993 with the Super Bowl being played in January or of 1994.

3. Determine which team won the game: The Dallas Cowboys faced the Buffalo Bills in Super Bowl XXVII on January 31, 1993 (as the year is mis-labelled due to a error). The Dallas Cowboys won this matchup.

So, Justin Bieber was born when the Dallas Cowboys were the reigning NFL Super Bowl.


llama_print_timings:        load time =   427.63 ms
llama_print_timings:      sample time =   115.85 ms /   164 runs   (    0.71 ms per token,  1415.67 tokens per second)
llama_print_timings: prompt eval time =   427.53 ms /    45 tokens (    9.50 ms per token,   105.26 tokens per second)
llama_print_timings:        eval time =  4526.53 ms /   163 runs   (   27.77 ms per token,    36.01 tokens per second)
llama_print_timings:       total time =  5293.77 ms
```

```output
"\n\n1. Identify Justin Bieber's birth date: Justin Bieber was born on March 1, 1994.\n\n2. Find the Super Bowl winner of that year: The NFL season of 1993 with the Super Bowl being played in January or of 1994.\n\n3. Determine which team won the game: The Dallas Cowboys faced the Buffalo Bills in Super Bowl XXVII on January 31, 1993 (as the year is mis-labelled due to a error). The Dallas Cowboys won this matchup.\n\nSo, Justin Bieber was born when the Dallas Cowboys were the reigning NFL Super Bowl."
```

### Metal

Si la instalación con Metal fue correcta, verá un indicador `NEON = 1` en las propiedades del modelo.

Dos de los parámetros de GPU más importantes son:

- `n_gpu_layers` - determina cuántas capas del modelo se descargan en su GPU Metal.
- `n_batch` - cuántos tokens se procesan en paralelo, el valor predeterminado es 8, establézcalo en un número mayor.
- `f16_kv` - por alguna razón, Metal solo admite `True`, de lo contrario obtendrá un error como `Asserting on type 0 GGML_ASSERT: .../ggml-metal.m:706: false && "not implemented"`

Configurar correctamente estos parámetros mejorará drásticamente la velocidad de evaluación (consulte el [código del wrapper](https://github.com/langchain-ai/langchain/blob/master/libs/community/langchain_community/llms/llamacpp.py) para obtener más detalles).

```python
n_gpu_layers = 1  # The number of layers to put on the GPU. The rest will be on the CPU. If you don't know how many layers there are, you can use -1 to move all to GPU.
n_batch = 512  # Should be between 1 and n_ctx, consider the amount of RAM of your Apple Silicon Chip.
# Make sure the model path is correct for your system!
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    n_gpu_layers=n_gpu_layers,
    n_batch=n_batch,
    f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
    callback_manager=callback_manager,
    verbose=True,  # Verbose is required to pass to the callback manager
)
```

El registro de la consola mostrará el siguiente registro para indicar que Metal se habilitó correctamente.

```output
ggml_metal_init: allocating
ggml_metal_init: using MPS
...
```

También puede verificar `Activity Monitor` observando el uso de la GPU del proceso, el uso de la CPU disminuirá drásticamente después de activar `n_gpu_layers=1`.

Para la primera llamada al LLM, el rendimiento puede ser lento debido a la compilación del modelo en la GPU Metal.

### Gramáticas

Podemos usar [gramáticas](https://github.com/ggerganov/llama.cpp/blob/master/grammars/README.md) para restringir las salidas del modelo y muestrear tokens en función de las reglas definidas en ellas.

Para demostrar este concepto, hemos incluido [archivos de gramática de muestra](https://github.com/langchain-ai/langchain/tree/master/libs/langchain/langchain/llms/grammars), que se utilizarán en los ejemplos a continuación.

Crear archivos de gramática gbnf puede llevar mucho tiempo, pero si tiene un caso de uso donde los esquemas de salida son importantes, hay dos herramientas que pueden ayudar:
- [Aplicación generadora de gramática en línea](https://grammar.intrinsiclabs.ai/) que convierte las definiciones de interfaz de TypeScript en un archivo gbnf.
- [Script de Python](https://github.com/ggerganov/llama.cpp/blob/master/examples/json-schema-to-grammar.py) para convertir el esquema JSON en un archivo gbnf. Por ejemplo, puede crear un objeto `pydantic`, generar su esquema JSON usando el método `.schema_json()` y luego usar este script para convertirlo a un archivo gbnf.

En el primer ejemplo, proporcione la ruta al archivo `json.gbnf` especificado para producir JSON:

```python
n_gpu_layers = 1  # The number of layers to put on the GPU. The rest will be on the CPU. If you don't know how many layers there are, you can use -1 to move all to GPU.
n_batch = 512  # Should be between 1 and n_ctx, consider the amount of RAM of your Apple Silicon Chip.
# Make sure the model path is correct for your system!
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    n_gpu_layers=n_gpu_layers,
    n_batch=n_batch,
    f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
    callback_manager=callback_manager,
    verbose=True,  # Verbose is required to pass to the callback manager
    grammar_path="/Users/rlm/Desktop/Code/langchain-main/langchain/libs/langchain/langchain/llms/grammars/json.gbnf",
)
```

```python
%%capture captured --no-stdout
result = llm.invoke("Describe a person in JSON format:")
```

```output
{
  "name": "John Doe",
  "age": 34,
  "": {
    "title": "Software Developer",
    "company": "Google"
  },
  "interests": [
    "Sports",
    "Music",
    "Cooking"
  ],
  "address": {
    "street_number": 123,
    "street_name": "Oak Street",
    "city": "Mountain View",
    "state": "California",
    "postal_code": 94040
  }}


llama_print_timings:        load time =   357.51 ms
llama_print_timings:      sample time =  1213.30 ms /   144 runs   (    8.43 ms per token,   118.68 tokens per second)
llama_print_timings: prompt eval time =   356.78 ms /     9 tokens (   39.64 ms per token,    25.23 tokens per second)
llama_print_timings:        eval time =  3947.16 ms /   143 runs   (   27.60 ms per token,    36.23 tokens per second)
llama_print_timings:       total time =  5846.21 ms
```

También podemos suministrar `list.gbnf` para devolver una lista:

```python
n_gpu_layers = 1
n_batch = 512
llm = LlamaCpp(
    model_path="/Users/rlm/Desktop/Code/llama.cpp/models/openorca-platypus2-13b.gguf.q4_0.bin",
    n_gpu_layers=n_gpu_layers,
    n_batch=n_batch,
    f16_kv=True,  # MUST set to True, otherwise you will run into problem after a couple of calls
    callback_manager=callback_manager,
    verbose=True,
    grammar_path="/Users/rlm/Desktop/Code/langchain-main/langchain/libs/langchain/langchain/llms/grammars/list.gbnf",
)
```

```python
%%capture captured --no-stdout
result = llm.invoke("List of top-3 my favourite books:")
```

```output
["The Catcher in the Rye", "Wuthering Heights", "Anna Karenina"]


llama_print_timings:        load time =   322.34 ms
llama_print_timings:      sample time =   232.60 ms /    26 runs   (    8.95 ms per token,   111.78 tokens per second)
llama_print_timings: prompt eval time =   321.90 ms /    11 tokens (   29.26 ms per token,    34.17 tokens per second)
llama_print_timings:        eval time =   680.82 ms /    25 runs   (   27.23 ms per token,    36.72 tokens per second)
llama_print_timings:       total time =  1295.27 ms
```
