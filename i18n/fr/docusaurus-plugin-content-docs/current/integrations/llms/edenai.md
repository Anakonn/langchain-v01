---
translated: true
---

# Eden AI

Eden AI révolutionne le paysage de l'IA en réunissant les meilleurs fournisseurs d'IA, permettant aux utilisateurs de débloquer des possibilités illimitées et d'exploiter tout le potentiel de l'intelligence artificielle. Avec une plateforme tout-en-un complète et sans tracas, elle permet aux utilisateurs de déployer des fonctionnalités d'IA en production à la vitesse de l'éclair, offrant un accès sans effort à toute la gamme des capacités de l'IA via une seule API. (site web : https://edenai.co/)

Cet exemple explique comment utiliser LangChain pour interagir avec les modèles Eden AI

-----------------------------------------------------------------------------------

L'accès à l'API EDENAI nécessite une clé API,

que vous pouvez obtenir en créant un compte https://app.edenai.run/user/register et en vous rendant ici https://app.edenai.run/admin/account/settings

Une fois que nous avons une clé, nous voudrons la définir en tant que variable d'environnement en exécutant :

```bash
export EDENAI_API_KEY="..."
```

Si vous préférez ne pas définir de variable d'environnement, vous pouvez transmettre la clé directement via le paramètre nommé edenai_api_key

 lors de l'initialisation de la classe EdenAI LLM :

```python
from langchain_community.llms import EdenAI
```

```python
llm = EdenAI(edenai_api_key="...", provider="openai", temperature=0.2, max_tokens=250)
```

## Appel d'un modèle

L'API EdenAI rassemble divers fournisseurs, chacun offrant plusieurs modèles.

Pour accéder à un modèle spécifique, vous pouvez simplement ajouter 'model' lors de l'instanciation.

Par exemple, explorons les modèles fournis par OpenAI, comme GPT3.5

### génération de texte

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

### génération d'images

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

### génération de texte avec rappel

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

## Enchaînement d'appels

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
