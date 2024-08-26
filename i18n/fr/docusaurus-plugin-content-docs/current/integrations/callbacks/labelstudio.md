---
translated: true
---

# Label Studio

>[Label Studio](https://labelstud.io/guide/get_started) est une plateforme open-source d'étiquetage de données qui offre à LangChain une flexibilité lorsqu'il s'agit d'étiqueter des données pour l'affinage fin de modèles de langage à grande échelle (LLM). Elle permet également la préparation de données d'entraînement personnalisées et la collecte et l'évaluation des réponses grâce aux commentaires des utilisateurs.

Dans ce guide, vous apprendrez comment connecter un pipeline LangChain à `Label Studio` pour :

- Regrouper tous les invites d'entrée, les conversations et les réponses dans un seul projet `Label Studio`. Cela consolide toutes les données en un seul endroit pour faciliter l'étiquetage et l'analyse.
- Affiner les invites et les réponses pour créer un ensemble de données pour l'affinage supervisé (SFT) et l'apprentissage par renforcement avec les commentaires des utilisateurs (RLHF). Les données étiquetées peuvent être utilisées pour poursuivre l'entraînement du LLM afin d'améliorer ses performances.
- Évaluer les réponses du modèle grâce aux commentaires des utilisateurs. `Label Studio` fournit une interface permettant aux utilisateurs de passer en revue et de commenter les réponses du modèle, permettant ainsi l'évaluation et l'itération.

## Installation et configuration

Installez d'abord les dernières versions de Label Studio et du client API Label Studio :

```python
%pip install --upgrade --quiet langchain label-studio label-studio-sdk langchain-openai
```

Ensuite, exécutez `label-studio` en ligne de commande pour démarrer l'instance locale de LabelStudio sur `http://localhost:8080`. Consultez le [guide d'installation de Label Studio](https://labelstud.io/guide/install) pour plus d'options.

Vous aurez besoin d'un jeton pour effectuer des appels API.

Ouvrez votre instance LabelStudio dans votre navigateur, allez dans `Compte et paramètres > Jeton d'accès` et copiez la clé.

Définissez les variables d'environnement avec votre URL LabelStudio, votre clé API et votre clé API OpenAI :

```python
import os

os.environ["LABEL_STUDIO_URL"] = "<YOUR-LABEL-STUDIO-URL>"  # e.g. http://localhost:8080
os.environ["LABEL_STUDIO_API_KEY"] = "<YOUR-LABEL-STUDIO-API-KEY>"
os.environ["OPENAI_API_KEY"] = "<YOUR-OPENAI-API-KEY>"
```

## Collecte des invites et des réponses des LLM

Les données utilisées pour l'étiquetage sont stockées dans des projets au sein de Label Studio. Chaque projet est identifié par une configuration XML qui détaille les spécifications des données d'entrée et de sortie.

Créez un projet qui prend l'entrée humaine au format texte et produit une réponse LLM modifiable dans une zone de texte :

```xml
<View>
<Style>
    .prompt-box {
        background-color: white;
        border-radius: 10px;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        padding: 20px;
    }
</Style>
<View className="root">
    <View className="prompt-box">
        <Text name="prompt" value="$prompt"/>
    </View>
    <TextArea name="response" toName="prompt"
              maxSubmissions="1" editable="true"
              required="true"/>
</View>
<Header value="Rate the response:"/>
<Rating name="rating" toName="prompt"/>
</View>
```

1. Pour créer un projet dans Label Studio, cliquez sur le bouton "Créer".
2. Entrez un nom pour votre projet dans le champ "Nom du projet", par exemple `Mon projet`.
3. Naviguez jusqu'à `Configuration de l'étiquetage > Modèle personnalisé` et collez la configuration XML fournie ci-dessus.

Vous pouvez collecter les invites d'entrée LLM et les réponses de sortie dans un projet LabelStudio, en le connectant via `LabelStudioCallbackHandler` :

```python
from langchain_community.callbacks.labelstudio_callback import (
    LabelStudioCallbackHandler,
)
```

```python
from langchain_openai import OpenAI

llm = OpenAI(
    temperature=0, callbacks=[LabelStudioCallbackHandler(project_name="My Project")]
)
print(llm.invoke("Tell me a joke"))
```

Dans Label Studio, ouvrez `Mon projet`. Vous verrez les invites, les réponses et les métadonnées comme le nom du modèle.

## Collecte des dialogues des modèles de chat

Vous pouvez également suivre et afficher les dialogues de chat complets dans LabelStudio, avec la possibilité de noter et de modifier la dernière réponse :

1. Ouvrez Label Studio et cliquez sur le bouton "Créer".
2. Entrez un nom pour votre projet dans le champ "Nom du projet", par exemple `Nouveau projet avec chat`.
3. Naviguez jusqu'à Configuration de l'étiquetage > Modèle personnalisé et collez la configuration XML suivante :

```xml
<View>
<View className="root">
     <Paragraphs name="dialogue"
               value="$prompt"
               layout="dialogue"
               textKey="content"
               nameKey="role"
               granularity="sentence"/>
  <Header value="Final response:"/>
    <TextArea name="response" toName="dialogue"
              maxSubmissions="1" editable="true"
              required="true"/>
</View>
<Header value="Rate the response:"/>
<Rating name="rating" toName="dialogue"/>
</View>
```

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

chat_llm = ChatOpenAI(
    callbacks=[
        LabelStudioCallbackHandler(
            mode="chat",
            project_name="New Project with Chat",
        )
    ]
)
llm_results = chat_llm.invoke(
    [
        SystemMessage(content="Always use a lot of emojis"),
        HumanMessage(content="Tell me a joke"),
    ]
)
```

Dans Label Studio, ouvrez "Nouveau projet avec chat". Cliquez sur une tâche créée pour afficher l'historique du dialogue et modifier/annoter les réponses.

## Configuration d'étiquetage personnalisée

Vous pouvez modifier la configuration d'étiquetage par défaut dans LabelStudio pour ajouter d'autres étiquettes cibles comme le sentiment de la réponse, la pertinence et de nombreux [autres types de commentaires des annotateurs](https://labelstud.io/tags/).

Une nouvelle configuration d'étiquetage peut être ajoutée à partir de l'interface utilisateur : allez dans `Paramètres > Interface d'étiquetage` et configurez une configuration personnalisée avec des balises supplémentaires comme `Choices` pour le sentiment ou `Rating` pour la pertinence. Gardez à l'esprit que la balise [`TextArea`](https://labelstud.io/tags/textarea) doit être présente dans toute configuration pour afficher les réponses LLM.

Alternativement, vous pouvez spécifier la configuration d'étiquetage lors de l'appel initial avant la création du projet :

```python
ls = LabelStudioCallbackHandler(
    project_config="""
<View>
<Text name="prompt" value="$prompt"/>
<TextArea name="response" toName="prompt"/>
<TextArea name="user_feedback" toName="prompt"/>
<Rating name="rating" toName="prompt"/>
<Choices name="sentiment" toName="prompt">
    <Choice value="Positive"/>
    <Choice value="Negative"/>
</Choices>
</View>
"""
)
```

Notez que si le projet n'existe pas, il sera créé avec la configuration d'étiquetage spécifiée.

## Autres paramètres

Le `LabelStudioCallbackHandler` accepte plusieurs paramètres optionnels :

- **api_key** - Clé API Label Studio. Remplace la variable d'environnement `LABEL_STUDIO_API_KEY`.
- **url** - URL Label Studio. Remplace `LABEL_STUDIO_URL`, par défaut `http://localhost:8080`.
- **project_id** - ID de projet Label Studio existant. Remplace `LABEL_STUDIO_PROJECT_ID`. Stocke les données dans ce projet.
- **project_name** - Nom du projet si l'ID de projet n'est pas spécifié. Crée un nouveau projet. Par défaut, c'est `"LangChain-%Y-%m-%d"` formaté avec la date actuelle.
- **project_config** - [configuration d'étiquetage personnalisée](#configuration-d'étiquetage-personnalisée)
- **mode**: utilisez ce raccourci pour créer une configuration cible à partir de zéro :
   - `"prompt"` - Invite unique, réponse unique. Par défaut.
   - `"chat"` - Mode de conversation multi-tours.
