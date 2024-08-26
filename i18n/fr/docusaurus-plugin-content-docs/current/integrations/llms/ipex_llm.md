---
translated: true
---

# IPEX-LLM

> [IPEX-LLM](https://github.com/intel-analytics/ipex-llm/) est une bibliothèque PyTorch permettant d'exécuter des LLM sur les processeurs et cartes graphiques Intel (par exemple, un PC local avec un iGPU, une carte graphique discrète comme Arc, Flex et Max) avec une très faible latence.

Cet exemple explique comment utiliser LangChain pour interagir avec `ipex-llm` pour la génération de texte.

## Configuration

```python
# Update Langchain

%pip install -qU langchain langchain-community
```

Installez IEPX-LLM pour exécuter des LLM localement sur le processeur Intel.

```python
%pip install --pre --upgrade ipex-llm[all]
```

## Utilisation de base

```python
import warnings

from langchain.chains import LLMChain
from langchain_community.llms import IpexLLM
from langchain_core.prompts import PromptTemplate

warnings.filterwarnings("ignore", category=UserWarning, message=".*padding_mask.*")
```

Spécifiez le modèle de prompt pour votre modèle. Dans cet exemple, nous utilisons le modèle [vicuna-1.5](https://huggingface.co/lmsys/vicuna-7b-v1.5). Si vous travaillez avec un modèle différent, choisissez un modèle de prompt approprié.

```python
template = "USER: {question}\nASSISTANT:"
prompt = PromptTemplate(template=template, input_variables=["question"])
```

Chargez le modèle localement à l'aide d'IpexLLM en utilisant `IpexLLM.from_model_id`. Il chargera le modèle directement dans son format Hugging Face et le convertira automatiquement en format à faible nombre de bits pour l'inférence.

```python
llm = IpexLLM.from_model_id(
    model_id="lmsys/vicuna-7b-v1.5",
    model_kwargs={"temperature": 0, "max_length": 64, "trust_remote_code": True},
)
```

Utilisez-le dans les chaînes :

```python
llm_chain = prompt | llm

question = "What is AI?"
output = llm_chain.invoke(question)
```

## Enregistrer/Charger le modèle à faible nombre de bits

Alternativement, vous pouvez enregistrer le modèle à faible nombre de bits sur le disque et utiliser `from_model_id_low_bit` au lieu de `from_model_id` pour le recharger pour une utilisation ultérieure, même sur différentes machines. C'est un moyen économe en espace, car le modèle à faible nombre de bits nécessite beaucoup moins d'espace disque que le modèle d'origine. Et `from_model_id_low_bit` est également plus efficace que `from_model_id` en termes de vitesse et d'utilisation de la mémoire, car il saute l'étape de conversion du modèle.

Pour enregistrer le modèle à faible nombre de bits, utilisez `save_low_bit` comme suit.

```python
saved_lowbit_model_path = "./vicuna-7b-1.5-low-bit"  # path to save low-bit model
llm.model.save_low_bit(saved_lowbit_model_path)
del llm
```

Chargez le modèle à partir du chemin du modèle à faible nombre de bits enregistré comme suit.
> Notez que le chemin enregistré pour le modèle à faible nombre de bits ne comprend que le modèle lui-même et pas les jetons. Si vous souhaitez tout avoir à un seul endroit, vous devrez télécharger ou copier manuellement les fichiers de jetons du répertoire du modèle d'origine vers l'emplacement où le modèle à faible nombre de bits est enregistré.

```python
llm_lowbit = IpexLLM.from_model_id_low_bit(
    model_id=saved_lowbit_model_path,
    tokenizer_id="lmsys/vicuna-7b-v1.5",
    # tokenizer_name=saved_lowbit_model_path,  # copy the tokenizers to saved path if you want to use it this way
    model_kwargs={"temperature": 0, "max_length": 64, "trust_remote_code": True},
)
```

Utilisez le modèle chargé dans les chaînes :

```python
llm_chain = prompt | llm_lowbit


question = "What is AI?"
output = llm_chain.invoke(question)
```
