---
sidebar_class_name: hidden
title: Generación de datos sintéticos
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/data_generation.ipynb)

## Caso de uso

Los datos sintéticos son datos generados artificialmente, en lugar de datos recopilados de eventos del mundo real. Se utilizan para simular datos reales sin comprometer la privacidad o encontrar limitaciones del mundo real.

Beneficios de los datos sintéticos:

1. **Privacidad y seguridad**: No hay datos personales reales en riesgo de filtraciones.
2. **Aumento de datos**: Expande los conjuntos de datos para el aprendizaje automático.
3. **Flexibilidad**: Crear escenarios específicos o poco comunes.
4. **Rentable**: A menudo más barato que la recopilación de datos del mundo real.
5. **Cumplimiento normativo**: Ayuda a navegar por leyes estrictas de protección de datos.
6. **Robustez del modelo**: Puede conducir a modelos de IA que generalizan mejor.
7. **Prototipado rápido**: Permite pruebas rápidas sin datos reales.
8. **Experimentación controlada**: Simular condiciones específicas.
9. **Acceso a datos**: Alternativa cuando no se dispone de datos reales.

Nota: A pesar de los beneficios, los datos sintéticos deben utilizarse con cuidado, ya que es posible que no siempre capturen las complejidades del mundo real.

## Inicio rápido

En este cuaderno, profundizaremos en la generación de registros sintéticos de facturación médica utilizando la biblioteca langchain. Esta herramienta es particularmente útil cuando desea desarrollar o probar algoritmos, pero no quiere utilizar datos de pacientes reales debido a problemas de privacidad o disponibilidad de datos.

### Configuración

Primero, deberá tener instalada la biblioteca langchain, junto con sus dependencias. Como estamos utilizando la cadena de generadores de OpenAI, también la instalaremos. Dado que se trata de una biblioteca experimental, deberemos incluir `langchain_experimental` en nuestras instalaciones. Luego importaremos los módulos necesarios.

```python
%pip install --upgrade --quiet  langchain langchain_experimental langchain-openai
# Set env var OPENAI_API_KEY or load from a .env file:
# import dotenv
# dotenv.load_dotenv()

from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate
from langchain_core.pydantic_v1 import BaseModel
from langchain_experimental.tabular_synthetic_data.openai import (
    OPENAI_TEMPLATE,
    create_openai_data_generator,
)
from langchain_experimental.tabular_synthetic_data.prompts import (
    SYNTHETIC_FEW_SHOT_PREFIX,
    SYNTHETIC_FEW_SHOT_SUFFIX,
)
from langchain_openai import ChatOpenAI
```

## 1. Define tu modelo de datos

Cada conjunto de datos tiene una estructura o un "esquema". La clase MedicalBilling a continuación sirve como nuestro esquema para los datos sintéticos. Al definir esto, estamos informando a nuestro generador de datos sintéticos sobre la forma y la naturaleza de los datos que esperamos.

```python
class MedicalBilling(BaseModel):
    patient_id: int
    patient_name: str
    diagnosis_code: str
    procedure_code: str
    total_charge: float
    insurance_claim_amount: float
```

Por ejemplo, cada registro tendrá un `patient_id` que es un entero, un `patient_name` que es una cadena, y así sucesivamente.

## 2. Muestrear datos

Para guiar al generador de datos sintéticos, es útil proporcionarle algunos ejemplos similares a los del mundo real. Estos ejemplos sirven como "semilla": son representativos del tipo de datos que desea, y el generador los utilizará para crear más datos que se parezcan a ellos.

Aquí hay algunos registros ficticios de facturación médica:

```python
examples = [
    {
        "example": """Patient ID: 123456, Patient Name: John Doe, Diagnosis Code:
        J20.9, Procedure Code: 99203, Total Charge: $500, Insurance Claim Amount: $350"""
    },
    {
        "example": """Patient ID: 789012, Patient Name: Johnson Smith, Diagnosis
        Code: M54.5, Procedure Code: 99213, Total Charge: $150, Insurance Claim Amount: $120"""
    },
    {
        "example": """Patient ID: 345678, Patient Name: Emily Stone, Diagnosis Code:
        E11.9, Procedure Code: 99214, Total Charge: $300, Insurance Claim Amount: $250"""
    },
]
```

## 3. Crear una plantilla de solicitud

El generador no sabe mágicamente cómo crear nuestros datos; necesitamos guiarlo. Lo hacemos creando una plantilla de solicitud. Esta plantilla ayuda a instruir al modelo de lenguaje subyacente sobre cómo producir datos sintéticos en el formato deseado.

```python
OPENAI_TEMPLATE = PromptTemplate(input_variables=["example"], template="{example}")

prompt_template = FewShotPromptTemplate(
    prefix=SYNTHETIC_FEW_SHOT_PREFIX,
    examples=examples,
    suffix=SYNTHETIC_FEW_SHOT_SUFFIX,
    input_variables=["subject", "extra"],
    example_prompt=OPENAI_TEMPLATE,
)
```

El `FewShotPromptTemplate` incluye:

- `prefix` y `suffix`: Probablemente contengan un contexto o instrucciones de orientación.
- `examples`: Los datos de muestra que definimos anteriormente.
- `input_variables`: Estas variables ("subject", "extra") son marcadores de posición que puede rellenar dinámicamente más adelante. Por ejemplo, "subject" podría rellenarse con "medical_billing" para guiar aún más al modelo.
- `example_prompt`: Esta plantilla de solicitud es el formato que queremos que cada fila de ejemplo tome en nuestra solicitud.

## 4. Crear el generador de datos

Con el esquema y la solicitud listos, el siguiente paso es crear el generador de datos. Este objeto sabe cómo comunicarse con el modelo de lenguaje subyacente para obtener datos sintéticos.

```python
synthetic_data_generator = create_openai_data_generator(
    output_schema=MedicalBilling,
    llm=ChatOpenAI(
        temperature=1
    ),  # You'll need to replace with your actual Language Model instance
    prompt=prompt_template,
)
```

## 5. Generar datos sintéticos

¡Finalmente, obtengamos nuestros datos sintéticos!

```python
synthetic_results = synthetic_data_generator.generate(
    subject="medical_billing",
    extra="the name must be chosen at random. Make it something you wouldn't normally choose.",
    runs=10,
)
```

Este comando le pide al generador que produzca 10 registros sintéticos de facturación médica. Los resultados se almacenan en `synthetic_results`. La salida será una lista de los modelos pydantic MedicalBilling.

### Otras implementaciones

```python
from langchain_experimental.synthetic_data import (
    DatasetGenerator,
    create_data_generation_chain,
)
from langchain_openai import ChatOpenAI
```

```python
# LLM
model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7)
chain = create_data_generation_chain(model)
```

```python
chain({"fields": ["blue", "yellow"], "preferences": {}})
```

```output
{'fields': ['blue', 'yellow'],
 'preferences': {},
 'text': 'The vibrant blue sky contrasted beautifully with the bright yellow sun, creating a stunning display of colors that instantly lifted the spirits of all who gazed upon it.'}
```

```python
chain(
    {
        "fields": {"colors": ["blue", "yellow"]},
        "preferences": {"style": "Make it in a style of a weather forecast."},
    }
)
```

```output
{'fields': {'colors': ['blue', 'yellow']},
 'preferences': {'style': 'Make it in a style of a weather forecast.'},
 'text': "Good morning! Today's weather forecast brings a beautiful combination of colors to the sky, with hues of blue and yellow gently blending together like a mesmerizing painting."}
```

```python
chain(
    {
        "fields": {"actor": "Tom Hanks", "movies": ["Forrest Gump", "Green Mile"]},
        "preferences": None,
    }
)
```

```output
{'fields': {'actor': 'Tom Hanks', 'movies': ['Forrest Gump', 'Green Mile']},
 'preferences': None,
 'text': 'Tom Hanks, the renowned actor known for his incredible versatility and charm, has graced the silver screen in unforgettable movies such as "Forrest Gump" and "Green Mile".'}
```

```python
chain(
    {
        "fields": [
            {"actor": "Tom Hanks", "movies": ["Forrest Gump", "Green Mile"]},
            {"actor": "Mads Mikkelsen", "movies": ["Hannibal", "Another round"]},
        ],
        "preferences": {"minimum_length": 200, "style": "gossip"},
    }
)
```

```output
{'fields': [{'actor': 'Tom Hanks', 'movies': ['Forrest Gump', 'Green Mile']},
  {'actor': 'Mads Mikkelsen', 'movies': ['Hannibal', 'Another round']}],
 'preferences': {'minimum_length': 200, 'style': 'gossip'},
 'text': 'Did you know that Tom Hanks, the beloved Hollywood actor known for his roles in "Forrest Gump" and "Green Mile", has shared the screen with the talented Mads Mikkelsen, who gained international acclaim for his performances in "Hannibal" and "Another round"? These two incredible actors have brought their exceptional skills and captivating charisma to the big screen, delivering unforgettable performances that have enthralled audiences around the world. Whether it\'s Hanks\' endearing portrayal of Forrest Gump or Mikkelsen\'s chilling depiction of Hannibal Lecter, these movies have solidified their places in cinematic history, leaving a lasting impact on viewers and cementing their status as true icons of the silver screen.'}
```

Como podemos ver, los ejemplos creados están diversificados y poseen la información que queríamos que tuvieran. Además, su estilo refleja las preferencias dadas con bastante precisión.

## Generar un conjunto de datos ejemplar para fines de referencia de extracción

```python
inp = [
    {
        "Actor": "Tom Hanks",
        "Film": [
            "Forrest Gump",
            "Saving Private Ryan",
            "The Green Mile",
            "Toy Story",
            "Catch Me If You Can",
        ],
    },
    {
        "Actor": "Tom Hardy",
        "Film": [
            "Inception",
            "The Dark Knight Rises",
            "Mad Max: Fury Road",
            "The Revenant",
            "Dunkirk",
        ],
    },
]

generator = DatasetGenerator(model, {"style": "informal", "minimal length": 500})
dataset = generator(inp)
```

```python
dataset
```

```output
[{'fields': {'Actor': 'Tom Hanks',
   'Film': ['Forrest Gump',
    'Saving Private Ryan',
    'The Green Mile',
    'Toy Story',
    'Catch Me If You Can']},
  'preferences': {'style': 'informal', 'minimal length': 500},
  'text': 'Tom Hanks, the versatile and charismatic actor, has graced the silver screen in numerous iconic films including the heartwarming and inspirational "Forrest Gump," the intense and gripping war drama "Saving Private Ryan," the emotionally charged and thought-provoking "The Green Mile," the beloved animated classic "Toy Story," and the thrilling and captivating true story adaptation "Catch Me If You Can." With his impressive range and genuine talent, Hanks continues to captivate audiences worldwide, leaving an indelible mark on the world of cinema.'},
 {'fields': {'Actor': 'Tom Hardy',
   'Film': ['Inception',
    'The Dark Knight Rises',
    'Mad Max: Fury Road',
    'The Revenant',
    'Dunkirk']},
  'preferences': {'style': 'informal', 'minimal length': 500},
  'text': 'Tom Hardy, the versatile actor known for his intense performances, has graced the silver screen in numerous iconic films, including "Inception," "The Dark Knight Rises," "Mad Max: Fury Road," "The Revenant," and "Dunkirk." Whether he\'s delving into the depths of the subconscious mind, donning the mask of the infamous Bane, or navigating the treacherous wasteland as the enigmatic Max Rockatansky, Hardy\'s commitment to his craft is always evident. From his breathtaking portrayal of the ruthless Eames in "Inception" to his captivating transformation into the ferocious Max in "Mad Max: Fury Road," Hardy\'s dynamic range and magnetic presence captivate audiences and leave an indelible mark on the world of cinema. In his most physically demanding role to date, he endured the harsh conditions of the freezing wilderness as he portrayed the rugged frontiersman John Fitzgerald in "The Revenant," earning him critical acclaim and an Academy Award nomination. In Christopher Nolan\'s war epic "Dunkirk," Hardy\'s stoic and heroic portrayal of Royal Air Force pilot Farrier showcases his ability to convey deep emotion through nuanced performances. With his chameleon-like ability to inhabit a wide range of characters and his unwavering commitment to his craft, Tom Hardy has undoubtedly solidified his place as one of the most talented and sought-after actors of his generation.'}]
```

## Extracción de los ejemplos generados

Muy bien, veamos si ahora podemos extraer la salida de estos datos generados y cómo se compara con nuestro caso.

```python
from typing import List

from langchain.chains import create_extraction_chain_pydantic
from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
from pydantic import BaseModel, Field
```

```python
class Actor(BaseModel):
    Actor: str = Field(description="name of an actor")
    Film: List[str] = Field(description="list of names of films they starred in")
```

### Analizadores

```python
llm = OpenAI()
parser = PydanticOutputParser(pydantic_object=Actor)

prompt = PromptTemplate(
    template="Extract fields from a given text.\n{format_instructions}\n{text}\n",
    input_variables=["text"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

_input = prompt.format_prompt(text=dataset[0]["text"])
output = llm.invoke(_input.to_string())

parsed = parser.parse(output)
parsed
```

```output
Actor(Actor='Tom Hanks', Film=['Forrest Gump', 'Saving Private Ryan', 'The Green Mile', 'Toy Story', 'Catch Me If You Can'])
```

```python
(parsed.Actor == inp[0]["Actor"]) & (parsed.Film == inp[0]["Film"])
```

```output
True
```

### Extractores

```python
extractor = create_extraction_chain_pydantic(pydantic_schema=Actor, llm=model)
extracted = extractor.run(dataset[1]["text"])
extracted
```

```output
[Actor(Actor='Tom Hardy', Film=['Inception', 'The Dark Knight Rises', 'Mad Max: Fury Road', 'The Revenant', 'Dunkirk'])]
```

```python
(extracted[0].Actor == inp[1]["Actor"]) & (extracted[0].Film == inp[1]["Film"])
```

```output
True
```
