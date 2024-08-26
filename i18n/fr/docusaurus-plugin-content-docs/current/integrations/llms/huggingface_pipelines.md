---
translated: true
---

# Pipelines locaux Hugging Face

Les modèles Hugging Face peuvent être exécutés localement via la classe `HuggingFacePipeline`.

Le [Hugging Face Model Hub](https://huggingface.co/models) héberge plus de 120 000 modèles, 20 000 jeux de données et 50 000 applications de démonstration (Spaces), tous open source et publiquement disponibles, sur une plateforme en ligne où les gens peuvent facilement collaborer et construire du ML ensemble.

Ceux-ci peuvent être appelés depuis LangChain soit via ce wrapper de pipeline local, soit en appelant leurs points de terminaison d'inférence hébergés via la classe HuggingFaceHub.

Pour utiliser, vous devez avoir le package python `transformers` [installé](https://pypi.org/project/transformers/), ainsi que [pytorch](https://pytorch.org/get-started/locally/). Vous pouvez également installer `xformer` pour une implémentation d'attention plus économe en mémoire.

```python
%pip install --upgrade --quiet  transformers --quiet
```

### Chargement du modèle

Les modèles peuvent être chargés en spécifiant les paramètres du modèle à l'aide de la méthode `from_model_id`.

```python
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline

hf = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    pipeline_kwargs={"max_new_tokens": 10},
)
```

Ils peuvent également être chargés en passant directement un pipeline `transformers` existant.

```python
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

model_id = "gpt2"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)
pipe = pipeline("text-generation", model=model, tokenizer=tokenizer, max_new_tokens=10)
hf = HuggingFacePipeline(pipeline=pipe)
```

### Créer une chaîne

Une fois le modèle chargé en mémoire, vous pouvez le composer avec une invite pour former une chaîne.

```python
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | hf

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

### Inférence GPU

Lors de l'exécution sur une machine avec GPU, vous pouvez spécifier le paramètre `device=n` pour placer le modèle sur le périphérique spécifié.
Par défaut sur `-1` pour l'inférence CPU.

Si vous avez plusieurs GPU et/ou si le modèle est trop volumineux pour un seul GPU, vous pouvez spécifier `device_map="auto"`, ce qui nécessite et utilise la bibliothèque [Accelerate](https://huggingface.co/docs/accelerate/index) pour déterminer automatiquement comment charger les poids du modèle.

*Remarque* : `device` et `device_map` ne doivent pas être spécifiés ensemble et peuvent entraîner un comportement inattendu.

```python
gpu_llm = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    device=0,  # replace with device_map="auto" to use the accelerate library.
    pipeline_kwargs={"max_new_tokens": 10},
)

gpu_chain = prompt | gpu_llm

question = "What is electroencephalography?"

print(gpu_chain.invoke({"question": question}))
```

### Inférence par lots sur GPU

Si vous exécutez sur un périphérique avec GPU, vous pouvez également effectuer l'inférence sur le GPU en mode par lots.

```python
gpu_llm = HuggingFacePipeline.from_model_id(
    model_id="bigscience/bloom-1b7",
    task="text-generation",
    device=0,  # -1 for CPU
    batch_size=2,  # adjust as needed based on GPU map and model size.
    model_kwargs={"temperature": 0, "max_length": 64},
)

gpu_chain = prompt | gpu_llm.bind(stop=["\n\n"])

questions = []
for i in range(4):
    questions.append({"question": f"What is the number {i} in french?"})

answers = gpu_chain.batch(questions)
for answer in answers:
    print(answer)
```

### Inférence avec le backend OpenVINO

Pour déployer un modèle avec OpenVINO, vous pouvez spécifier le paramètre `backend="openvino"` pour déclencher OpenVINO comme framework d'inférence backend.

Si vous avez un GPU Intel, vous pouvez spécifier `model_kwargs={"device": "GPU"}` pour exécuter l'inférence dessus.

```python
%pip install --upgrade-strategy eager "optimum[openvino,nncf]" --quiet
```

```python
ov_config = {"PERFORMANCE_HINT": "LATENCY", "NUM_STREAMS": "1", "CACHE_DIR": ""}

ov_llm = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    backend="openvino",
    model_kwargs={"device": "CPU", "ov_config": ov_config},
    pipeline_kwargs={"max_new_tokens": 10},
)

ov_chain = prompt | ov_llm

question = "What is electroencephalography?"

print(ov_chain.invoke({"question": question}))
```

### Inférence avec un modèle OpenVINO local

Il est possible d'[exporter votre modèle](https://github.com/huggingface/optimum-intel?tab=readme-ov-file#export) au format IR OpenVINO avec l'interface de ligne de commande, et de charger le modèle à partir d'un dossier local.

```python
!optimum-cli export openvino --model gpt2 ov_model_dir
```

Il est recommandé d'appliquer une quantification pondérée à 8 ou 4 bits pour réduire la latence d'inférence et l'empreinte du modèle à l'aide de `--weight-format` :

```python
!optimum-cli export openvino --model gpt2  --weight-format int8 ov_model_dir # for 8-bit quantization

!optimum-cli export openvino --model gpt2  --weight-format int4 ov_model_dir # for 4-bit quantization
```

```python
ov_llm = HuggingFacePipeline.from_model_id(
    model_id="ov_model_dir",
    task="text-generation",
    backend="openvino",
    model_kwargs={"device": "CPU", "ov_config": ov_config},
    pipeline_kwargs={"max_new_tokens": 10},
)

ov_chain = prompt | ov_llm

question = "What is electroencephalography?"

print(ov_chain.invoke({"question": question}))
```

Vous pouvez obtenir une amélioration supplémentaire de la vitesse d'inférence avec la quantification dynamique des activations et la quantification du cache KV. Ces options peuvent être activées avec `ov_config` comme suit :

```python
ov_config = {
    "KV_CACHE_PRECISION": "u8",
    "DYNAMIC_QUANTIZATION_GROUP_SIZE": "32",
    "PERFORMANCE_HINT": "LATENCY",
    "NUM_STREAMS": "1",
    "CACHE_DIR": "",
}
```

Pour plus d'informations, reportez-vous au [guide OpenVINO LLM](https://docs.openvino.ai/2024/learn-openvino/llm_inference_guide.html) et au [notebook des pipelines locaux OpenVINO](/docs/integrations/llms/openvino/).
