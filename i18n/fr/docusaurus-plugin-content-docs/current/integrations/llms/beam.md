---
translated: true
---

# Faisceau

Appelle l'enveloppe de l'API Beam pour déployer et effectuer des appels ultérieurs à une instance du LLM gpt2 dans un déploiement cloud. Nécessite l'installation de la bibliothèque Beam et l'enregistrement de l'ID client Beam et du secret client. En appelant l'enveloppe, une instance du modèle est créée et exécutée, avec le texte renvoyé se rapportant à l'invite. Des appels supplémentaires peuvent ensuite être effectués en appelant directement l'API Beam.

[Créez un compte](https://www.beam.cloud/), si vous n'en avez pas déjà un. Récupérez vos clés API depuis le [tableau de bord](https://www.beam.cloud/dashboard/settings/api-keys).

Installez l'interface en ligne de commande Beam

```python
!curl https://raw.githubusercontent.com/slai-labs/get-beam/main/get-beam.sh -sSfL | sh
```

Enregistrez les clés API et définissez les variables d'environnement de votre ID client Beam et de votre secret :

```python
import os

beam_client_id = "<Your beam client id>"
beam_client_secret = "<Your beam client secret>"

# Set the environment variables
os.environ["BEAM_CLIENT_ID"] = beam_client_id
os.environ["BEAM_CLIENT_SECRET"] = beam_client_secret

# Run the beam configure command
!beam configure --clientId={beam_client_id} --clientSecret={beam_client_secret}
```

Installez le SDK Beam :

```python
%pip install --upgrade --quiet  beam-sdk
```

**Déployez et appelez Beam directement depuis langchain !**

Notez qu'un démarrage à froid peut prendre quelques minutes pour renvoyer la réponse, mais les appels suivants seront plus rapides !

```python
from langchain_community.llms.beam import Beam

llm = Beam(
    model_name="gpt2",
    name="langchain-gpt2-test",
    cpu=8,
    memory="32Gi",
    gpu="A10G",
    python_version="python3.8",
    python_packages=[
        "diffusers[torch]>=0.10",
        "transformers",
        "torch",
        "pillow",
        "accelerate",
        "safetensors",
        "xformers",
    ],
    max_length="50",
    verbose=False,
)

llm._deploy()

response = llm._call("Running machine learning on a remote GPU")

print(response)
```
