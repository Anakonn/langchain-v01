---
translated: true
---

# Chaîne de modération Amazon Comprehend

>[Amazon Comprehend](https://aws.amazon.com/comprehend/) est un service de traitement du langage naturel (NLP) qui utilise l'apprentissage automatique pour découvrir des informations et des connexions précieuses dans le texte.

Ce notebook montre comment utiliser `Amazon Comprehend` pour détecter et gérer les `Informations d'identification personnelle` (`PII`) et la toxicité.

## Configuration

```python
%pip install --upgrade --quiet  boto3 nltk
```

```python
%pip install --upgrade --quiet  langchain_experimental
```

```python
%pip install --upgrade --quiet  langchain pydantic
```

```python
import os

import boto3

comprehend_client = boto3.client("comprehend", region_name="us-east-1")
```

```python
from langchain_experimental.comprehend_moderation import AmazonComprehendModerationChain

comprehend_moderation = AmazonComprehendModerationChain(
    client=comprehend_client,
    verbose=True,  # optional
)
```

## Utilisation d'AmazonComprehendModerationChain avec la chaîne LLM

**Remarque** : L'exemple ci-dessous utilise le _Fake LLM_ de LangChain, mais le même concept pourrait s'appliquer à d'autres LLM.

```python
from langchain_community.llms.fake import FakeListLLM
from langchain_core.prompts import PromptTemplate
from langchain_experimental.comprehend_moderation.base_moderation_exceptions import (
    ModerationPiiError,
)

template = """Question: {question}

Answer:"""

prompt = PromptTemplate.from_template(template)

responses = [
    "Final Answer: A credit card number looks like 1289-2321-1123-2387. A fake SSN number looks like 323-22-9980. John Doe's phone number is (999)253-9876.",
    # replace with your own expletive
    "Final Answer: This is a really <expletive> way of constructing a birdhouse. This is <expletive> insane to think that any birds would actually create their <expletive> nests here.",
]
llm = FakeListLLM(responses=responses)

chain = (
    prompt
    | comprehend_moderation
    | {"input": (lambda x: x["output"]) | llm}
    | comprehend_moderation
)

try:
    response = chain.invoke(
        {
            "question": "A sample SSN number looks like this 123-22-3345. Can you give me some more samples?"
        }
    )
except ModerationPiiError as e:
    print(str(e))
else:
    print(response["output"])
```

## Utilisation de `moderation_config` pour personnaliser votre modération

Utilisez Amazon Comprehend Moderation avec une configuration pour contrôler les modérations que vous souhaitez effectuer et les actions à entreprendre pour chacune d'entre elles. Il y a trois modérations différentes qui se produisent lorsqu'aucune configuration n'est transmise, comme démontré ci-dessus. Ces modérations sont :

- Vérifications des PII (Informations d'identification personnelle)
- Détection du contenu toxique
- Détection de la sécurité des invites

Voici un exemple de configuration de modération.

```python
from langchain_experimental.comprehend_moderation import (
    BaseModerationConfig,
    ModerationPiiConfig,
    ModerationPromptSafetyConfig,
    ModerationToxicityConfig,
)

pii_config = ModerationPiiConfig(labels=["SSN"], redact=True, mask_character="X")

toxicity_config = ModerationToxicityConfig(threshold=0.5)

prompt_safety_config = ModerationPromptSafetyConfig(threshold=0.5)

moderation_config = BaseModerationConfig(
    filters=[pii_config, toxicity_config, prompt_safety_config]
)
```

Au cœur de la configuration, il y a trois modèles de configuration à utiliser :

- `ModerationPiiConfig` utilisé pour configurer le comportement des validations PII. Voici les paramètres avec lesquels il peut être initialisé :
  - `labels` les étiquettes d'entités PII. Par défaut, il s'agit d'une liste vide, ce qui signifie que la validation PII prendra en compte toutes les entités PII.
  - `threshold` le seuil de confiance pour les entités détectées, par défaut à 0,5 ou 50 %
  - `redact` un indicateur booléen pour forcer le redactage ou non du texte, par défaut à `False`. Lorsqu'il est `False`, la validation PII générera une erreur lorsqu'elle détectera une entité PII, lorsqu'il est défini sur `True`, elle se contentera de redacter les valeurs PII dans le texte.
  - `mask_character` le caractère utilisé pour le masquage, par défaut à l'astérisque (*)
- `ModerationToxicityConfig` utilisé pour configurer le comportement des validations de toxicité. Voici les paramètres avec lesquels il peut être initialisé :
  - `labels` les étiquettes d'entités toxiques. Par défaut, il s'agit d'une liste vide, ce qui signifie que la validation de toxicité prendra en compte toutes les entités toxiques.
  - `threshold` le seuil de confiance pour les entités détectées, par défaut à 0,5 ou 50 %
- `ModerationPromptSafetyConfig` utilisé pour configurer le comportement de la validation de sécurité des invites
  - `threshold` le seuil de confiance pour la classification de sécurité des invites, par défaut à 0,5 ou 50 %

Enfin, vous utilisez le `BaseModerationConfig` pour définir l'ordre dans lequel chacun de ces contrôles doit être effectué. Le `BaseModerationConfig` prend un paramètre `filters` facultatif qui peut être une liste d'un ou de plusieurs des contrôles de validation ci-dessus, comme vu dans le bloc de code précédent. Le `BaseModerationConfig` peut également être initialisé avec n'importe quels `filters`, auquel cas il utilisera tous les contrôles avec la configuration par défaut (plus d'explications à ce sujet plus tard).

L'utilisation de la configuration dans la cellule précédente effectuera des vérifications PII et permettra à l'invite de passer, mais elle masquera tous les numéros de sécurité sociale présents dans l'invite ou la sortie du LLM.

```python
comp_moderation_with_config = AmazonComprehendModerationChain(
    moderation_config=moderation_config,  # specify the configuration
    client=comprehend_client,  # optionally pass the Boto3 Client
    verbose=True,
)
```

```python
from langchain_community.llms.fake import FakeListLLM
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer:"""

prompt = PromptTemplate.from_template(template)

responses = [
    "Final Answer: A credit card number looks like 1289-2321-1123-2387. A fake SSN number looks like 323-22-9980. John Doe's phone number is (999)253-9876.",
    # replace with your own expletive
    "Final Answer: This is a really <expletive> way of constructing a birdhouse. This is <expletive> insane to think that any birds would actually create their <expletive> nests here.",
]
llm = FakeListLLM(responses=responses)

chain = (
    prompt
    | comp_moderation_with_config
    | {"input": (lambda x: x["output"]) | llm}
    | comp_moderation_with_config
)


try:
    response = chain.invoke(
        {
            "question": "A sample SSN number looks like this 123-45-7890. Can you give me some more samples?"
        }
    )
except Exception as e:
    print(str(e))
else:
    print(response["output"])
```

## Identifiant unique et rappels de modération

Lorsque l'action de modération Amazon Comprehend identifie l'une des entités configurées, la chaîne lèvera l'une des exceptions suivantes :
    - `ModerationPiiError`, pour les vérifications PII
    - `ModerationToxicityError`, pour les vérifications de toxicité
    - `ModerationPromptSafetyError` pour les vérifications de sécurité des invites

En plus de la configuration de modération, le `AmazonComprehendModerationChain` peut également être initialisé avec les paramètres suivants :

- `unique_id` [Facultatif] un paramètre de chaîne. Ce paramètre peut être utilisé pour passer n'importe quelle valeur de chaîne ou d'identifiant. Par exemple, dans une application de chat, vous voudrez peut-être suivre les utilisateurs abusifs, dans ce cas, vous pouvez passer le nom d'utilisateur/l'adresse e-mail de l'utilisateur, etc. La valeur par défaut est `None`.

- `moderation_callback` [Facultatif] le `BaseModerationCallbackHandler` qui sera appelé de manière asynchrone (non bloquante pour la chaîne). Les fonctions de rappel sont utiles lorsque vous voulez effectuer des actions supplémentaires lorsque les fonctions de modération sont exécutées, par exemple la journalisation dans une base de données ou l'écriture d'un fichier journal. Vous pouvez remplacer trois fonctions en sous-classant `BaseModerationCallbackHandler` - `on_after_pii()`, `on_after_toxicity()` et `on_after_prompt_safety()`. Notez que les trois fonctions doivent être des fonctions `async`. Ces fonctions de rappel reçoivent deux arguments :
    - `moderation_beacon` un dictionnaire qui contiendra des informations sur la fonction de modération, la réponse complète du modèle Amazon Comprehend, un identifiant de chaîne unique, l'état de modération et la chaîne d'entrée qui a été validée. Le dictionnaire a le schéma suivant :

    ```
    {
        'moderation_chain_id': 'xxx-xxx-xxx', # Identifiant de chaîne unique
        'moderation_type': 'Toxicity' | 'PII' | 'PromptSafety',
        'moderation_status': 'LABELS_FOUND' | 'LABELS_NOT_FOUND',
        'moderation_input': 'Un numéro de sécurité sociale d'exemple ressemble à ceci 123-456-7890. Pouvez-vous me donner d'autres exemples ?',
        'moderation_output': {...} #Sortie complète du modèle de modération PII, de toxicité ou de sécurité des invites d'Amazon Comprehend
    }
    ```

    - `unique_id` s'il est passé à `AmazonComprehendModerationChain`

<div class="alert alert-block alert-info"> <b>REMARQUE :</b> <code>moderation_callback</code> est différent des rappels de chaîne LangChain. Vous pouvez toujours utiliser les rappels de chaîne LangChain avec <code>AmazonComprehendModerationChain</code> via le paramètre callbacks. Exemple : <br/>
<pre>
from langchain.callbacks.stdout import StdOutCallbackHandler
comp_moderation_with_config = AmazonComprehendModerationChain(verbose=True, callbacks=[StdOutCallbackHandler()])
</pre>
</div>

```python
from langchain_experimental.comprehend_moderation import BaseModerationCallbackHandler
```

```python
# Define callback handlers by subclassing BaseModerationCallbackHandler


class MyModCallback(BaseModerationCallbackHandler):
    async def on_after_pii(self, output_beacon, unique_id):
        import json

        moderation_type = output_beacon["moderation_type"]
        chain_id = output_beacon["moderation_chain_id"]
        with open(f"output-{moderation_type}-{chain_id}.json", "w") as file:
            data = {"beacon_data": output_beacon, "unique_id": unique_id}
            json.dump(data, file)

    """
    async def on_after_toxicity(self, output_beacon, unique_id):
        pass

    async def on_after_prompt_safety(self, output_beacon, unique_id):
        pass
    """


my_callback = MyModCallback()
```

```python
pii_config = ModerationPiiConfig(labels=["SSN"], redact=True, mask_character="X")

toxicity_config = ModerationToxicityConfig(threshold=0.5)

moderation_config = BaseModerationConfig(filters=[pii_config, toxicity_config])

comp_moderation_with_config = AmazonComprehendModerationChain(
    moderation_config=moderation_config,  # specify the configuration
    client=comprehend_client,  # optionally pass the Boto3 Client
    unique_id="john.doe@email.com",  # A unique ID
    moderation_callback=my_callback,  # BaseModerationCallbackHandler
    verbose=True,
)
```

```python
from langchain_community.llms.fake import FakeListLLM
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer:"""

prompt = PromptTemplate.from_template(template)

responses = [
    "Final Answer: A credit card number looks like 1289-2321-1123-2387. A fake SSN number looks like 323-22-9980. John Doe's phone number is (999)253-9876.",
    # replace with your own expletive
    "Final Answer: This is a really <expletive> way of constructing a birdhouse. This is <expletive> insane to think that any birds would actually create their <expletive> nests here.",
]

llm = FakeListLLM(responses=responses)

chain = (
    prompt
    | comp_moderation_with_config
    | {"input": (lambda x: x["output"]) | llm}
    | comp_moderation_with_config
)

try:
    response = chain.invoke(
        {
            "question": "A sample SSN number looks like this 123-456-7890. Can you give me some more samples?"
        }
    )
except Exception as e:
    print(str(e))
else:
    print(response["output"])
```

## `moderation_config` et ordre d'exécution de la modération

Si `AmazonComprehendModerationChain` n'est pas initialisé avec un `moderation_config`, il est initialisé avec les valeurs par défaut de `BaseModerationConfig`. Si aucun `filtre` n'est utilisé, la séquence de vérification de modération est la suivante.

```text
AmazonComprehendModerationChain
│
└──Check PII with Stop Action
    ├── Callback (if available)
    ├── Label Found ⟶ [Error Stop]
    └── No Label Found
        └──Check Toxicity with Stop Action
            ├── Callback (if available)
            ├── Label Found ⟶ [Error Stop]
            └── No Label Found
                └──Check Prompt Safety with Stop Action
                    ├── Callback (if available)
                    ├── Label Found ⟶ [Error Stop]
                    └── No Label Found
                        └── Return Prompt
```

Si l'un des contrôles soulève une exception de validation, les contrôles suivants ne seront pas effectués. Si un `callback` est fourni dans ce cas, il sera appelé pour chacun des contrôles qui ont été effectués. Par exemple, dans le cas ci-dessus, si la chaîne échoue en raison de la présence de PII, les contrôles de toxicité et de sécurité des invites ne seront pas effectués.

Vous pouvez remplacer l'ordre d'exécution en passant `moderation_config` et en spécifiant simplement l'ordre souhaité dans le paramètre `filters` de `BaseModerationConfig`. Dans le cas où vous spécifiez les filtres, l'ordre des contrôles tel que spécifié dans le paramètre `filters` sera maintenu. Par exemple, dans la configuration ci-dessous, le contrôle de toxicité sera effectué en premier, puis le PII, et enfin la validation de la sécurité des invites. Dans ce cas, `AmazonComprehendModerationChain` effectuera les contrôles souhaités dans l'ordre spécifié avec les valeurs par défaut de chaque `kwargs` du modèle.

```python
pii_check = ModerationPiiConfig()
toxicity_check = ModerationToxicityConfig()
prompt_safety_check = ModerationPromptSafetyConfig()

moderation_config = BaseModerationConfig(filters=[toxicity_check, pii_check, prompt_safety_check])
```

Vous pouvez également utiliser plus d'une configuration pour un contrôle de modération spécifique, par exemple dans l'exemple ci-dessous, deux contrôles PII consécutifs sont effectués. La première configuration vérifie la présence de tout numéro de sécurité sociale, et si elle en trouve, elle lèvera une erreur. Si aucun numéro de sécurité sociale n'est trouvé, elle vérifiera ensuite la présence de NOM et de NUMÉRO DE CARTE DE CRÉDIT/DÉBIT dans l'invite et les masquera.

```python
pii_check_1 = ModerationPiiConfig(labels=["SSN"])
pii_check_2 = ModerationPiiConfig(labels=["NAME", "CREDIT_DEBIT_NUMBER"], redact=True)

moderation_config = BaseModerationConfig(filters=[pii_check_1, pii_check_2])
```

1. Pour une liste des étiquettes PII, voir les types d'entités PII universelles d'Amazon Comprehend - https://docs.aws.amazon.com/comprehend/latest/dg/how-pii.html#how-pii-types
2. Voici la liste des étiquettes de toxicité disponibles :
    - `HATE_SPEECH` : Discours qui critique, insulte, dénonce ou déshumanise une personne ou un groupe sur la base d'une identité, qu'il s'agisse de la race, de l'origine ethnique, de l'identité de genre, de la religion, de l'orientation sexuelle, des capacités, de l'origine nationale ou d'une autre identité de groupe.
    - `GRAPHIC` : Un discours qui utilise une imagerie visuelle descriptive, détaillée et désagréablement vive est considéré comme graphique. Ce type de langage est souvent rendu verbeux afin d'amplifier une insulte, un inconfort ou un préjudice envers le destinataire.
    - `HARASSMENT_OR_ABUSE` : Un discours qui impose une dynamique de pouvoir perturbatrice entre le locuteur et l'auditeur, indépendamment de l'intention, cherche à affecter le bien-être psychologique du destinataire ou objectifie une personne doit être classé comme harcèlement.
    - `SEXUAL` : Un discours qui indique un intérêt, une activité ou une excitation sexuelle en utilisant des références directes ou indirectes aux parties du corps ou aux traits physiques ou au sexe est considéré comme toxique avec le type de toxicité "sexuel".
    - `VIOLENCE_OR_THREAT` : Un discours qui inclut des menaces visant à infliger de la douleur, des blessures ou de l'hostilité envers une personne ou un groupe.
    - `INSULT` : Un discours qui inclut un langage méprisant, humiliant, moqueur, insultant ou dénigrant.
    - `PROFANITY` : Un discours qui contient des mots, des expressions ou des acronymes impolis, vulgaires ou offensants est considéré comme profane.
3. Pour une liste des étiquettes de sécurité des invites, reportez-vous à la documentation [lien ici]

## Exemples

### Avec les modèles Hugging Face Hub

Obtenez votre [clé API du Hugging Face hub](https://huggingface.co/docs/api-inference/quicktour#get-your-api-token)

```python
%pip install --upgrade --quiet  huggingface_hub
```

```python
import os

os.environ["HUGGINGFACEHUB_API_TOKEN"] = "<YOUR HF TOKEN HERE>"
```

```python
# See https://huggingface.co/models?pipeline_tag=text-generation&sort=downloads for some other options
repo_id = "google/flan-t5-xxl"
```

```python
from langchain_community.llms import HuggingFaceHub
from langchain_core.prompts import PromptTemplate

template = """{question}"""

prompt = PromptTemplate.from_template(template)
llm = HuggingFaceHub(
    repo_id=repo_id, model_kwargs={"temperature": 0.5, "max_length": 256}
)
```

Créez une configuration et initialisez une chaîne de modération Amazon Comprehend

```python
# define filter configs
pii_config = ModerationPiiConfig(
    labels=["SSN", "CREDIT_DEBIT_NUMBER"], redact=True, mask_character="X"
)

toxicity_config = ModerationToxicityConfig(threshold=0.5)

prompt_safety_config = ModerationPromptSafetyConfig(threshold=0.8)

# define different moderation configs using the filter configs above
moderation_config_1 = BaseModerationConfig(
    filters=[pii_config, toxicity_config, prompt_safety_config]
)

moderation_config_2 = BaseModerationConfig(filters=[pii_config])


# input prompt moderation chain with callback
amazon_comp_moderation = AmazonComprehendModerationChain(
    moderation_config=moderation_config_1,
    client=comprehend_client,
    moderation_callback=my_callback,
    verbose=True,
)

# Output from LLM moderation chain without callback
amazon_comp_moderation_out = AmazonComprehendModerationChain(
    moderation_config=moderation_config_2, client=comprehend_client, verbose=True
)
```

Le `moderation_config` empêchera désormais toute entrée contenant des mots ou des phrases obscènes, de mauvaises intentions ou des PII avec des entités autres que le numéro de sécurité sociale avec un score supérieur au seuil de 0,5 ou 50 %. S'il trouve des entités Pii - numéro de sécurité sociale - il les redactera avant de permettre à l'appel de se poursuivre. Il masquera également tout numéro de sécurité sociale ou de carte de crédit dans la réponse du modèle.

```python
chain = (
    prompt
    | amazon_comp_moderation
    | {"input": (lambda x: x["output"]) | llm}
    | amazon_comp_moderation_out
)

try:
    response = chain.invoke(
        {
            "question": """What is John Doe's address, phone number and SSN from the following text?

John Doe, a resident of 1234 Elm Street in Springfield, recently celebrated his birthday on January 1st. Turning 43 this year, John reflected on the years gone by. He often shares memories of his younger days with his close friends through calls on his phone, (555) 123-4567. Meanwhile, during a casual evening, he received an email at johndoe@example.com reminding him of an old acquaintance's reunion. As he navigated through some old documents, he stumbled upon a paper that listed his SSN as 123-45-6789, reminding him to store it in a safer place.
"""
        }
    )
except Exception as e:
    print(str(e))
else:
    print(response["output"])
```

### Avec Amazon SageMaker Jumpstart

L'exemple ci-dessous montre comment utiliser la chaîne de modération Amazon Comprehend avec un point de terminaison LLM hébergé par Amazon SageMaker Jumpstart. Vous devriez avoir un point de terminaison LLM hébergé par Amazon SageMaker Jumpstart dans votre compte AWS. Reportez-vous à [ce notebook](https://github.com/aws/amazon-sagemaker-examples/blob/main/introduction_to_amazon_algorithms/jumpstart-foundation-models/text-generation-falcon.md) pour en savoir plus sur le déploiement d'un LLM avec les points de terminaison hébergés par Amazon SageMaker Jumpstart.

```python
endpoint_name = "<SAGEMAKER_ENDPOINT_NAME>"  # replace with your SageMaker Endpoint name
region = "<REGION>"  # replace with your SageMaker Endpoint region
```

```python
import json

from langchain_community.llms import SagemakerEndpoint
from langchain_community.llms.sagemaker_endpoint import LLMContentHandler
from langchain_core.prompts import PromptTemplate


class ContentHandler(LLMContentHandler):
    content_type = "application/json"
    accepts = "application/json"

    def transform_input(self, prompt: str, model_kwargs: dict) -> bytes:
        input_str = json.dumps({"text_inputs": prompt, **model_kwargs})
        return input_str.encode("utf-8")

    def transform_output(self, output: bytes) -> str:
        response_json = json.loads(output.read().decode("utf-8"))
        return response_json["generated_texts"][0]


content_handler = ContentHandler()

template = """From the following 'Document', precisely answer the 'Question'. Do not add any spurious information in your answer.

Document: John Doe, a resident of 1234 Elm Street in Springfield, recently celebrated his birthday on January 1st. Turning 43 this year, John reflected on the years gone by. He often shares memories of his younger days with his close friends through calls on his phone, (555) 123-4567. Meanwhile, during a casual evening, he received an email at johndoe@example.com reminding him of an old acquaintance's reunion. As he navigated through some old documents, he stumbled upon a paper that listed his SSN as 123-45-6789, reminding him to store it in a safer place.
Question: {question}
Answer:
"""

# prompt template for input text
llm_prompt = PromptTemplate.from_template(template)

llm = SagemakerEndpoint(
    endpoint_name=endpoint_name,
    region_name=region,
    model_kwargs={
        "temperature": 0.95,
        "max_length": 200,
        "num_return_sequences": 3,
        "top_k": 50,
        "top_p": 0.95,
        "do_sample": True,
    },
    content_handler=content_handler,
)
```

Créez une configuration et initialisez une chaîne de modération Amazon Comprehend

```python
# define filter configs
pii_config = ModerationPiiConfig(labels=["SSN"], redact=True, mask_character="X")

toxicity_config = ModerationToxicityConfig(threshold=0.5)


# define different moderation configs using the filter configs above
moderation_config_1 = BaseModerationConfig(filters=[pii_config, toxicity_config])

moderation_config_2 = BaseModerationConfig(filters=[pii_config])


# input prompt moderation chain with callback
amazon_comp_moderation = AmazonComprehendModerationChain(
    moderation_config=moderation_config_1,
    client=comprehend_client,
    moderation_callback=my_callback,
    verbose=True,
)

# Output from LLM moderation chain without callback
amazon_comp_moderation_out = AmazonComprehendModerationChain(
    moderation_config=moderation_config_2, client=comprehend_client, verbose=True
)
```

Le `moderation_config` empêchera désormais toute entrée et sortie de modèle contenant des mots ou des phrases obscènes, de mauvaises intentions ou des Pii avec des entités autres que le numéro de sécurité sociale avec un score supérieur au seuil de 0,5 ou 50 %. S'il trouve des entités Pii - numéro de sécurité sociale - il les redactera avant de permettre à l'appel de se poursuivre.

```python
chain = (
    prompt
    | amazon_comp_moderation
    | {"input": (lambda x: x["output"]) | llm}
    | amazon_comp_moderation_out
)

try:
    response = chain.invoke(
        {"question": "What is John Doe's address, phone number and SSN?"}
    )
except Exception as e:
    print(str(e))
else:
    print(response["output"])
```
