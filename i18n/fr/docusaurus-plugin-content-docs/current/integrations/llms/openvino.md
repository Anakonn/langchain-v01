---
translated: true
---

# OpenVINO

[OpenVINO™](https://github.com/openvinotoolkit/openvino) est une boîte à outils open-source pour optimiser et déployer l'inférence IA. OpenVINO™ Runtime peut permettre d'exécuter le même modèle optimisé sur divers [appareils](https://github.com/openvinotoolkit/openvino?tab=readme-ov-file#supported-hardware-matrix) matériels. Accélérez les performances de votre apprentissage profond dans des cas d'utilisation comme : le langage + LLM, la vision par ordinateur, la reconnaissance vocale automatique et plus encore.

Les modèles OpenVINO peuvent être exécutés localement via la [classe](https://python.langchain.com/docs/integrations/llms/huggingface_pipeline) `HuggingFacePipeline`. Pour déployer un modèle avec OpenVINO, vous pouvez spécifier le paramètre `backend="openvino"` pour déclencher OpenVINO comme framework d'inférence backend.

Pour l'utiliser, vous devez avoir le package python `optimum-intel` avec l'accélérateur OpenVINO [installé](https://github.com/huggingface/optimum-intel?tab=readme-ov-file#installation).

```python
%pip install --upgrade-strategy eager "optimum[openvino,nncf]" --quiet
```

### Chargement du modèle

Les modèles peuvent être chargés en spécifiant les paramètres du modèle à l'aide de la méthode `from_model_id`.

Si vous avez un GPU Intel, vous pouvez spécifier `model_kwargs={"device": "GPU"}` pour exécuter l'inférence dessus.

```python
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline

ov_config = {"PERFORMANCE_HINT": "LATENCY", "NUM_STREAMS": "1", "CACHE_DIR": ""}

ov_llm = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    backend="openvino",
    model_kwargs={"device": "CPU", "ov_config": ov_config},
    pipeline_kwargs={"max_new_tokens": 10},
)
```

Ils peuvent également être chargés en passant directement un [pipeline `optimum-intel`](https://huggingface.co/docs/optimum/main/en/intel/inference) existant.

```python
from optimum.intel.openvino import OVModelForCausalLM
from transformers import AutoTokenizer, pipeline

model_id = "gpt2"
device = "CPU"
tokenizer = AutoTokenizer.from_pretrained(model_id)
ov_model = OVModelForCausalLM.from_pretrained(
    model_id, export=True, device=device, ov_config=ov_config
)
ov_pipe = pipeline(
    "text-generation", model=ov_model, tokenizer=tokenizer, max_new_tokens=10
)
ov_llm = HuggingFacePipeline(pipeline=ov_pipe)
```

### Créer une chaîne

Avec le modèle chargé en mémoire, vous pouvez le composer avec une invite pour former une chaîne.

```python
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | ov_llm

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

### Inférence avec un modèle OpenVINO local

Il est possible d'[exporter votre modèle](https://github.com/huggingface/optimum-intel?tab=readme-ov-file#export) au format IR OpenVINO avec l'interface en ligne de commande, et de charger le modèle à partir d'un dossier local.

```python
!optimum-cli export openvino --model gpt2 ov_model_dir
```

Il est recommandé d'appliquer une quantification pondérée à 8 ou 4 bits pour réduire la latence d'inférence et l'empreinte du modèle en utilisant `--weight-format` :

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

chain = prompt | ov_llm

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
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

Pour plus d'informations, consultez :

* [Guide OpenVINO LLM](https://docs.openvino.ai/2024/learn-openvino/llm_inference_guide.html).

* [Documentation OpenVINO](https://docs.openvino.ai/2024/home.html).

* [Guide de démarrage OpenVINO](https://www.intel.com/content/www/us/en/content-details/819067/openvino-get-started-guide.html).

* [Notebook RAG avec LangChain](https://github.com/openvinotoolkit/openvino_notebooks/tree/latest/notebooks/llm-rag-langchain).
