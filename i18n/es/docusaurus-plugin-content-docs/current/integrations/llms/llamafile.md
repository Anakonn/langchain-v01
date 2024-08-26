---
translated: true
---

# Llamafile

[Llamafile](https://github.com/Mozilla-Ocho/llamafile) le permite distribuir y ejecutar LLM con un solo archivo.

Llamafile hace esto combinando [llama.cpp](https://github.com/ggerganov/llama.cpp) con [Cosmopolitan Libc](https://github.com/jart/cosmopolitan) en un solo marco que colapsa toda la complejidad de los LLM en un ejecutable de un solo archivo (llamado "llamafile") que se ejecuta localmente en la mayoría de las computadoras, sin instalación.

## Configuración

1. Descargue un llamafile para el modelo que desee usar. Puede encontrar muchos modelos en formato llamafile en [HuggingFace](https://huggingface.co/models?other=llamafile). En esta guía, descargaremos uno pequeño, `TinyLlama-1.1B-Chat-v1.0.Q5_K_M`. Nota: si no tiene `wget`, puede descargar el modelo a través de este [enlace](https://huggingface.co/jartine/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile?download=true).

```bash
wget https://huggingface.co/jartine/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile
```

2. Haga que el llamafile sea ejecutable. Primero, si aún no lo ha hecho, abra una terminal. **Si está usando MacOS, Linux o BSD,** deberá otorgar permiso a su computadora para ejecutar este nuevo archivo usando `chmod` (ver a continuación). **Si está en Windows,** cambie el nombre del archivo agregando ".exe" al final (el archivo del modelo debe llamarse `TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile.exe`).

```bash
chmod +x TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile  # run if you're on MacOS, Linux, or BSD
```

3. Ejecute el llamafile en "modo servidor":

```bash
./TinyLlama-1.1B-Chat-v1.0.Q5_K_M.llamafile --server --nobrowser
```

Ahora puede hacer llamadas a la API REST del llamafile. De forma predeterminada, el servidor llamafile escucha en http://localhost:8080. Puede encontrar la documentación completa del servidor [aquí](https://github.com/Mozilla-Ocho/llamafile/blob/main/llama.cpp/server/README.md#api-endpoints). Puede interactuar con el llamafile directamente a través de la API REST, pero aquí mostraremos cómo interactuar con él usando LangChain.

## Uso

```python
from langchain_community.llms.llamafile import Llamafile

llm = Llamafile()

llm.invoke("Tell me a joke")
```

```output
'? \nI\'ve got a thing for pink, but you know that.\n"Can we not talk about work anymore?" - What did she say?\nI don\'t want to be a burden on you.\nIt\'s hard to keep a good thing going.\nYou can\'t tell me what I want, I have a life too!'
```

Para transmitir tokens, use el método `.stream(...)`:

```python
query = "Tell me a joke"

for chunks in llm.stream(query):
    print(chunks, end="")

print()
```

```output
.
- She said, "I’m tired of my life. What should I do?"
- The man replied, "I hear you. But don’t worry. Life is just like a joke. It has its funny parts too."
- The woman looked at him, amazed and happy to hear his wise words. - "Thank you for your wisdom," she said, smiling. - He replied, "Any time. But it doesn't come easy. You have to laugh and keep moving forward in life."
- She nodded, thanking him again. - The man smiled wryly. "Life can be tough. Sometimes it seems like you’re never going to get out of your situation."
- He said, "I know that. But the key is not giving up. Life has many ups and downs, but in the end, it will turn out okay."
- The woman's eyes softened. "Thank you for your advice. It's so important to keep moving forward in life," she said. - He nodded once again. "You’re welcome. I hope your journey is filled with laughter and joy."
- They both smiled and left the bar, ready to embark on their respective adventures.
```

Para obtener más información sobre el Lenguaje Expresivo de LangChain y los métodos disponibles en un LLM, consulte la [Interfaz LCEL](/docs/expression_language/interface)
