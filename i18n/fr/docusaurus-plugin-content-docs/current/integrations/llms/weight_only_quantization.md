---
translated: true
---

# Quantification Poids-Uniquement d'Intel

## Quantification Poids-Uniquement pour les Modèles Hugging Face avec l'Extension Intel pour les Pipelines Transformers

Les modèles Hugging Face peuvent être exécutés localement avec la quantification Poids-Uniquement à travers la classe `WeightOnlyQuantPipeline`.

Le [Hugging Face Model Hub](https://huggingface.co/models) héberge plus de 120 000 modèles, 20 000 jeux de données et 50 000 applications de démonstration (Spaces), tous open source et publiquement disponibles, sur une plateforme en ligne où les gens peuvent facilement collaborer et construire du ML ensemble.

Ceux-ci peuvent être appelés à partir de LangChain à travers cette classe d'enveloppe de pipeline local.

Pour utiliser, vous devez avoir le package python `transformers` [installé](https://pypi.org/project/transformers/), ainsi que [pytorch](https://pytorch.org/get-started/locally/), [intel-extension-for-transformers](https://github.com/intel/intel-extension-for-transformers).

```python
%pip install transformers --quiet
%pip install intel-extension-for-transformers
```

### Chargement du Modèle

Les modèles peuvent être chargés en spécifiant les paramètres du modèle à l'aide de la méthode `from_model_id`. Les paramètres du modèle incluent la classe `WeightOnlyQuantConfig` dans intel_extension_for_transformers.

```python
from intel_extension_for_transformers.transformers import WeightOnlyQuantConfig
from langchain_community.llms.weight_only_quantization import WeightOnlyQuantPipeline

conf = WeightOnlyQuantConfig(weight_dtype="nf4")
hf = WeightOnlyQuantPipeline.from_model_id(
    model_id="google/flan-t5-large",
    task="text2text-generation",
    quantization_config=conf,
    pipeline_kwargs={"max_new_tokens": 10},
)
```

Ils peuvent également être chargés en passant directement un pipeline `transformers` existant.

```python
from intel_extension_for_transformers.transformers import AutoModelForSeq2SeqLM
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline
from transformers import AutoTokenizer, pipeline

model_id = "google/flan-t5-large"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForSeq2SeqLM.from_pretrained(model_id)
pipe = pipeline(
    "text2text-generation", model=model, tokenizer=tokenizer, max_new_tokens=10
)
hf = WeightOnlyQuantPipeline(pipeline=pipe)
```

### Créer une Chaîne

Avec le modèle chargé en mémoire, vous pouvez le composer avec une invite pour former une chaîne.

```python
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | hf

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

### Inférence CPU

Actuellement, intel-extension-for-transformers ne prend en charge que l'inférence sur le périphérique CPU. Prendra en charge bientôt le GPU intel. Lors de l'exécution sur une machine avec CPU, vous pouvez spécifier le paramètre `device="cpu"` ou `device=-1` pour placer le modèle sur le périphérique CPU.
Par défaut sur `-1` pour l'inférence CPU.

```python
conf = WeightOnlyQuantConfig(weight_dtype="nf4")
llm = WeightOnlyQuantPipeline.from_model_id(
    model_id="google/flan-t5-large",
    task="text2text-generation",
    quantization_config=conf,
    pipeline_kwargs={"max_new_tokens": 10},
)

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | llm

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

### Inférence par Lots sur CPU

Vous pouvez également exécuter l'inférence sur le CPU en mode par lots.

```python
conf = WeightOnlyQuantConfig(weight_dtype="nf4")
llm = WeightOnlyQuantPipeline.from_model_id(
    model_id="google/flan-t5-large",
    task="text2text-generation",
    quantization_config=conf,
    pipeline_kwargs={"max_new_tokens": 10},
)

chain = prompt | llm.bind(stop=["\n\n"])

questions = []
for i in range(4):
    questions.append({"question": f"What is the number {i} in french?"})

answers = chain.batch(questions)
for answer in answers:
    print(answer)
```

### Types de Données Pris en Charge par Intel-extension-for-transformers

Nous prenons en charge la quantification des poids dans les types de données suivants pour le stockage (weight_dtype dans WeightOnlyQuantConfig) :

* **int8** : Utilise le type de données 8 bits.
* **int4_fullrange** : Utilise la plage de valeurs [-8, 7] du type int4.
* **int4_clip** : Rogne et conserve les valeurs dans la plage int4, mettant les autres à zéro.
* **nf4** : Utilise le type de données float 4 bits normalisé.
* **fp4_e2m1** : Utilise le type de données float 4 bits régulier. "e2" signifie que 2 bits sont utilisés pour l'exposant, et "m1" signifie que 1 bit est utilisé pour la mantisse.

Bien que ces techniques stockent les poids en 4 ou 8 bits, le calcul se fait toujours en float32, bfloat16 ou int8 (compute_dtype dans WeightOnlyQuantConfig) :
* **fp32** : Utilise le type de données float32 pour le calcul.
* **bf16** : Utilise le type de données bfloat16 pour le calcul.
* **int8** : Utilise le type de données 8 bits pour le calcul.

### Matrice des Algorithmes Pris en Charge

Les algorithmes de quantification pris en charge dans intel-extension-for-transformers (algorithm dans WeightOnlyQuantConfig) :

| Algorithmes |   PyTorch  |    LLM Runtime    |
|:--------------:|:----------:|:----------:|
|       RTN      |  &#10004;  |  &#10004;  |
|       AWQ      |  &#10004;  | à venir |
|      TEQ      | &#10004; | à venir |
> **RTN :** Une méthode de quantification que l'on peut penser de manière très intuitive. Elle ne nécessite pas de jeux de données supplémentaires et est une méthode de quantification très rapide. En général, RTN convertira le poids en un type de données entier uniformément distribué, mais certains algorithmes, comme Qlora, proposent un type de données NF4 non uniforme et prouvent son optimalité théorique.

> **AWQ :** Il a été prouvé que la protection de seulement 1% des poids saillants peut grandement réduire l'erreur de quantification. Les canaux de poids saillants sont sélectionnés en observant la distribution de l'activation et du poids par canal. Les poids saillants sont également quantifiés après avoir multiplié un grand facteur d'échelle avant la quantification pour préserver.

> **TEQ :** Une transformation équivalente entraînable qui préserve la précision FP32 dans la quantification poids-uniquement. Il s'inspire d'AWQ tout en fournissant une nouvelle solution pour rechercher le facteur d'échelle optimal par canal entre les activations et les poids.
