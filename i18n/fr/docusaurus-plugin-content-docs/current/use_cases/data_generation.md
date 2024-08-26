---
sidebar_class_name: hidden
title: Génération de données synthétiques
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/data_generation.ipynb)

## Cas d'utilisation

Les données synthétiques sont des données générées artificiellement, plutôt que des données collectées à partir d'événements du monde réel. Elles sont utilisées pour simuler des données réelles sans compromettre la confidentialité ou rencontrer des limites du monde réel.

Avantages des données synthétiques :

1. **Confidentialité et sécurité** : Aucune donnée personnelle réelle à risque de fuites.
2. **Augmentation des données** : Élargit les jeux de données pour l'apprentissage automatique.
3. **Flexibilité** : Créer des scénarios spécifiques ou rares.
4. **Rentable** : Souvent moins cher que la collecte de données du monde réel.
5. **Conformité réglementaire** : Aide à naviguer dans les lois strictes sur la protection des données.
6. **Robustesse des modèles** : Peut conduire à de meilleurs modèles d'IA généralisants.
7. **Prototypage rapide** : Permet des tests rapides sans données réelles.
8. **Expérimentation contrôlée** : Simuler des conditions spécifiques.
9. **Accès aux données** : Alternative lorsque les données réelles ne sont pas disponibles.

Remarque : Malgré les avantages, les données synthétiques doivent être utilisées avec précaution, car elles ne captent pas toujours les complexités du monde réel.

## Démarrage rapide

Dans ce notebook, nous plongerons dans la génération de relevés de facturation médicale synthétiques à l'aide de la bibliothèque langchain. Cet outil est particulièrement utile lorsque vous voulez développer ou tester des algorithmes sans utiliser de véritables données de patients en raison de problèmes de confidentialité ou de disponibilité des données.

### Configuration

Tout d'abord, vous devrez avoir la bibliothèque langchain installée, ainsi que ses dépendances. Comme nous utilisons la chaîne de générateur OpenAI, nous l'installerons également. Comme il s'agit d'une bibliothèque expérimentale, nous devrons inclure `langchain_experimental` dans nos installations. Nous importerons ensuite les modules nécessaires.

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

## 1. Définir votre modèle de données

Chaque ensemble de données a une structure ou un "schéma". La classe MedicalBilling ci-dessous sert de schéma pour les données synthétiques. En définissant cela, nous informons notre générateur de données synthétiques de la forme et de la nature des données que nous attendons.

```python
class MedicalBilling(BaseModel):
    patient_id: int
    patient_name: str
    diagnosis_code: str
    procedure_code: str
    total_charge: float
    insurance_claim_amount: float
```

Par exemple, chaque enregistrement aura un `patient_id` qui est un entier, un `patient_name` qui est une chaîne de caractères, et ainsi de suite.

## 2. Échantillonner les données

Pour guider le générateur de données synthétiques, il est utile de lui fournir quelques exemples ressemblant au monde réel. Ces exemples servent de "graine" - ils sont représentatifs du type de données que vous voulez, et le générateur les utilisera pour créer davantage de données qui leur ressemblent.

Voici quelques relevés de facturation médicale fictifs :

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

## 3. Concevoir un modèle d'invite

Le générateur ne sait pas magiquement comment créer nos données ; nous devons le guider. Nous le faisons en créant un modèle d'invite. Ce modèle aide à instruire le modèle de langage sous-jacent sur la façon de produire des données synthétiques dans le format souhaité.

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

Le `FewShotPromptTemplate` comprend :

- `prefix` et `suffix` : Ils contiennent probablement un contexte ou des instructions d'orientation.
- `examples` : Les exemples de données que nous avons définis plus tôt.
- `input_variables` : Ces variables ("subject", "extra") sont des espaces réservés que vous pouvez remplir de manière dynamique plus tard. Par exemple, "subject" pourrait être rempli avec "medical_billing" pour guider davantage le modèle.
- `example_prompt` : Ce modèle d'invite est le format que nous voulons que chaque ligne d'exemple prenne dans notre invite.

## 4. Créer le générateur de données

Avec le schéma et l'invite prêts, l'étape suivante consiste à créer le générateur de données. Cet objet sait comment communiquer avec le modèle de langage sous-jacent pour obtenir des données synthétiques.

```python
synthetic_data_generator = create_openai_data_generator(
    output_schema=MedicalBilling,
    llm=ChatOpenAI(
        temperature=1
    ),  # You'll need to replace with your actual Language Model instance
    prompt=prompt_template,
)
```

## 5. Générer des données synthétiques

Enfin, obtenons nos données synthétiques !

```python
synthetic_results = synthetic_data_generator.generate(
    subject="medical_billing",
    extra="the name must be chosen at random. Make it something you wouldn't normally choose.",
    runs=10,
)
```

Cette commande demande au générateur de produire 10 relevés de facturation médicale synthétiques. Les résultats sont stockés dans `synthetic_results`. La sortie sera une liste de modèles pydantiques MedicalBilling.

### Autres implémentations

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

Comme nous pouvons le voir, les exemples créés sont diversifiés et possèdent les informations que nous voulions qu'ils aient. De plus, leur style reflète assez bien les préférences données.

## Générer un ensemble de données exemplaires à des fins de référence d'extraction

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

## Extraction à partir d'exemples générés

D'accord, voyons si nous pouvons maintenant extraire la sortie de ces données générées et comment elle se compare à notre cas !

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

### Analyseurs

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

### Extracteurs

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
