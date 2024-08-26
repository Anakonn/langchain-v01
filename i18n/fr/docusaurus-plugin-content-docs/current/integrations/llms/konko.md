---
sidebar_label: Konko
translated: true
---

# Konko

>[Konko](https://www.konko.ai/) API est une API Web entièrement gérée conçue pour aider les développeurs d'applications :

1. **Sélectionner** les bons modèles de langage open source ou propriétaires pour leur application
2. **Construire** des applications plus rapidement avec des intégrations aux principaux frameworks d'application et des API entièrement gérées
3. **Affiner** les plus petits modèles de langage open source pour atteindre des performances de niveau industriel à une fraction du coût
4. **Déployer des API à l'échelle de la production** qui répondent aux exigences de sécurité, de confidentialité, de débit et de latence sans configuration ni administration d'infrastructure en utilisant l'infrastructure multi-cloud conforme SOC 2 de Konko AI

Cet exemple explique comment utiliser LangChain pour interagir avec les [modèles](https://docs.konko.ai/docs/list-of-models#konko-hosted-models-for-completion) de complétion `Konko`

Pour exécuter ce notebook, vous aurez besoin d'une clé d'API Konko. Connectez-vous à notre application web pour [créer une clé d'API](https://platform.konko.ai/settings/api-keys) afin d'accéder aux modèles

#### Définir les variables d'environnement

1. Vous pouvez définir les variables d'environnement pour
   1. KONKO_API_KEY (Obligatoire)
   2. OPENAI_API_KEY (Facultatif)
2. Dans votre session shell actuelle, utilisez la commande export :

```shell
export KONKO_API_KEY={your_KONKO_API_KEY_here}
export OPENAI_API_KEY={your_OPENAI_API_KEY_here} #Optional
```

## Appeler un modèle

Trouvez un modèle sur la [page d'aperçu de Konko](https://docs.konko.ai/docs/list-of-models)

Une autre façon de trouver la liste des modèles en cours d'exécution sur l'instance Konko est via ce [point de terminaison](https://docs.konko.ai/reference/get-models).

À partir de là, nous pouvons initialiser notre modèle :

```python
from langchain.llms import Konko

llm = Konko(model="mistralai/mistral-7b-v0.1", temperature=0.1, max_tokens=128)

input_ = """You are a helpful assistant. Explain Big Bang Theory briefly."""
print(llm.invoke(input_))
```

```output


Answer:
The Big Bang Theory is a theory that explains the origin of the universe. According to the theory, the universe began with a single point of infinite density and temperature. This point is called the singularity. The singularity exploded and expanded rapidly. The expansion of the universe is still continuing.
The Big Bang Theory is a theory that explains the origin of the universe. According to the theory, the universe began with a single point of infinite density and temperature. This point is called the singularity. The singularity exploded and expanded rapidly. The expansion of the universe is still continuing.

Question
```
