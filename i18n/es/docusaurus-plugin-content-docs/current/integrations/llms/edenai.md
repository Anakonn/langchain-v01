---
translated: true
---

# Eden AI

Eden AI está revolucionando el panorama de la IA al unir a los mejores proveedores de IA, capacitando a los usuarios para desbloquear posibilidades ilimitadas y aprovechar el verdadero potencial de la inteligencia artificial. Con una plataforma integral y sin complicaciones, permite a los usuarios implementar funciones de IA en producción de manera rápida, lo que facilita el acceso sin esfuerzo a toda la gama de capacidades de IA a través de una sola API. (sitio web: https://edenai.co/)

Este ejemplo explica cómo usar LangChain para interactuar con los modelos de Eden AI

-----------------------------------------------------------------------------------

Acceder a la API de EDENAI requiere una clave API,

que puedes obtener creando una cuenta https://app.edenai.run/user/register y dirigiéndote aquí https://app.edenai.run/admin/account/settings

Una vez que tengamos una clave, la estableceremos como una variable de entorno ejecutando:

```bash
export EDENAI_API_KEY="..."
```

Si prefieres no establecer una variable de entorno, puedes pasar la clave directamente a través del parámetro nombrado edenai_api_key

cuando se inicia la clase EdenAI LLM:

```python
from langchain_community.llms import EdenAI
```

```python
llm = EdenAI(edenai_api_key="...", provider="openai", temperature=0.2, max_tokens=250)
```

## Llamar a un modelo

La API de EdenAI reúne a varios proveedores, cada uno con múltiples modelos.

Para acceder a un modelo específico, simplemente puedes agregar 'model' durante la instanciación.

Por ejemplo, exploremos los modelos proporcionados por OpenAI, como GPT3.5

### generación de texto

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

llm = EdenAI(
    feature="text",
    provider="openai",
    model="gpt-3.5-turbo-instruct",
    temperature=0.2,
    max_tokens=250,
)

prompt = """
User: Answer the following yes/no question by reasoning step by step. Can a dog drive a car?
Assistant:
"""

llm(prompt)
```

### generación de imágenes

```python
import base64
from io import BytesIO

from PIL import Image


def print_base64_image(base64_string):
    # Decode the base64 string into binary data
    decoded_data = base64.b64decode(base64_string)

    # Create an in-memory stream to read the binary data
    image_stream = BytesIO(decoded_data)

    # Open the image using PIL
    image = Image.open(image_stream)

    # Display the image
    image.show()
```

```python
text2image = EdenAI(feature="image", provider="openai", resolution="512x512")
```

```python
image_output = text2image("A cat riding a motorcycle by Picasso")
```

```python
print_base64_image(image_output)
```

### generación de texto con callback

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_community.llms import EdenAI

llm = EdenAI(
    callbacks=[StreamingStdOutCallbackHandler()],
    feature="text",
    provider="openai",
    temperature=0.2,
    max_tokens=250,
)
prompt = """
User: Answer the following yes/no question by reasoning step by step. Can a dog drive a car?
Assistant:
"""
print(llm.invoke(prompt))
```

## Encadenando llamadas

```python
from langchain.chains import LLMChain, SimpleSequentialChain
from langchain_core.prompts import PromptTemplate
```

```python
llm = EdenAI(feature="text", provider="openai", temperature=0.2, max_tokens=250)
text2image = EdenAI(feature="image", provider="openai", resolution="512x512")
```

```python
prompt = PromptTemplate(
    input_variables=["product"],
    template="What is a good name for a company that makes {product}?",
)

chain = LLMChain(llm=llm, prompt=prompt)
```

```python
second_prompt = PromptTemplate(
    input_variables=["company_name"],
    template="Write a description of a logo for this company: {company_name}, the logo should not contain text at all ",
)
chain_two = LLMChain(llm=llm, prompt=second_prompt)
```

```python
third_prompt = PromptTemplate(
    input_variables=["company_logo_description"],
    template="{company_logo_description}",
)
chain_three = LLMChain(llm=text2image, prompt=third_prompt)
```

```python
# Run the chain specifying only the input variable for the first chain.
overall_chain = SimpleSequentialChain(
    chains=[chain, chain_two, chain_three], verbose=True
)
output = overall_chain.run("hats")
```

```python
# print the image
print_base64_image(output)
```
