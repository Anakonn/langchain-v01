---
translated: true
---

# Décollage de Titan

`TitanML` aide les entreprises à construire et déployer de meilleurs modèles NLP, plus petits, moins chers et plus rapides grâce à notre plateforme d'entraînement, de compression et d'optimisation de l'inférence.

Notre serveur d'inférence, [Titan Takeoff](https://docs.titanml.co/docs/intro) permet le déploiement de LLM localement sur votre matériel en une seule commande. La plupart des modèles d'intégration sont pris en charge par défaut, si vous rencontrez des problèmes avec un modèle spécifique, n'hésitez pas à nous en faire part à hello@titanml.co.

## Exemple d'utilisation

Voici quelques exemples utiles pour commencer à utiliser le serveur Titan Takeoff. Vous devez vous assurer que le serveur Takeoff a été démarré en arrière-plan avant d'exécuter ces commandes. Pour plus d'informations, consultez la [page de documentation pour le lancement de Takeoff](https://docs.titanml.co/docs/Docs/launching/).

```python
import time

from langchain_community.embeddings import TitanTakeoffEmbed
```

### Exemple 1

Utilisation de base en supposant que Takeoff s'exécute sur votre machine en utilisant ses ports par défaut (c'est-à-dire localhost:3000).

```python
embed = TitanTakeoffEmbed()
output = embed.embed_query(
    "What is the weather in London in August?", consumer_group="embed"
)
print(output)
```

### Exemple 2

Démarrage des lecteurs à l'aide de l'enveloppe Python TitanTakeoffEmbed. Si vous n'avez pas créé de lecteurs en lançant d'abord Takeoff, ou si vous voulez en ajouter un autre, vous pouvez le faire lors de l'initialisation de l'objet TitanTakeoffEmbed. Il vous suffit de passer une liste des modèles que vous voulez démarrer en tant que paramètre `models`.

Vous pouvez utiliser `embed.query_documents` pour intégrer plusieurs documents à la fois. L'entrée attendue est une liste de chaînes de caractères, plutôt qu'une seule chaîne attendue pour la méthode `embed_query`.

```python
# Model config for the embedding model, where you can specify the following parameters:
#   model_name (str): The name of the model to use
#   device: (str): The device to use for inference, cuda or cpu
#   consumer_group (str): The consumer group to place the reader into
embedding_model = {
    "model_name": "BAAI/bge-large-en-v1.5",
    "device": "cpu",
    "consumer_group": "embed",
}
embed = TitanTakeoffEmbed(models=[embedding_model])

# The model needs time to spin up, length of time need will depend on the size of model and your network connection speed
time.sleep(60)

prompt = "What is the capital of France?"
# We specified "embed" consumer group so need to send request to the same consumer group so it hits our embedding model and not others
output = embed.embed_query(prompt, consumer_group="embed")
print(output)
```
