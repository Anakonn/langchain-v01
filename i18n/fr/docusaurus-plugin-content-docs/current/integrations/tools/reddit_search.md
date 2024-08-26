---
translated: true
---

# Recherche Reddit

Dans ce cahier, nous apprenons comment fonctionne l'outil de recherche Reddit.
Tout d'abord, assurez-vous d'avoir installé praw avec la commande ci-dessous :

```python
%pip install --upgrade --quiet  praw
```

Ensuite, vous devez configurer les clés API et les variables d'environnement appropriées. Vous auriez besoin de créer un compte utilisateur Reddit et d'obtenir des identifiants. Donc, créez un compte utilisateur Reddit en allant sur https://www.reddit.com et en vous inscrivant.
Ensuite, obtenez vos identifiants en allant sur https://www.reddit.com/prefs/apps et en créant une application.
Vous devriez avoir votre client_id et votre secret à partir de la création de l'application. Maintenant, vous pouvez coller ces chaînes dans les variables client_id et client_secret.
Remarque : Vous pouvez mettre n'importe quelle chaîne pour user_agent

```python
client_id = ""
client_secret = ""
user_agent = ""
```

```python
from langchain_community.tools.reddit_search.tool import RedditSearchRun
from langchain_community.utilities.reddit_search import RedditSearchAPIWrapper

search = RedditSearchRun(
    api_wrapper=RedditSearchAPIWrapper(
        reddit_client_id=client_id,
        reddit_client_secret=client_secret,
        reddit_user_agent=user_agent,
    )
)
```

Vous pouvez ensuite définir vos requêtes, par exemple, le sous-forum que vous voulez interroger, le nombre de publications que vous voulez obtenir, la manière dont vous voulez trier les résultats, etc.

```python
from langchain_community.tools.reddit_search.tool import RedditSearchSchema

search_params = RedditSearchSchema(
    query="beginner", sort="new", time_filter="week", subreddit="python", limit="2"
)
```

Enfin, exécutez la recherche et obtenez vos résultats

```python
result = search.run(tool_input=search_params.dict())
```

```python
print(result)
```

Voici un exemple d'affichage du résultat.
Remarque : Vous pouvez obtenir une sortie différente selon la publication la plus récente dans le sous-forum, mais le formatage devrait être similaire.

> Recherche r/python a trouvé 2 publications :
> Titre de la publication : 'Setup Github Copilot in Visual Studio Code'
> Utilisateur : Feisty-Recording-715
> Sous-forum : r/Python :
>                     Texte du corps : 🛠️ Ce tutoriel est parfait pour les débutants qui cherchent à renforcer leur compréhension du contrôle de version ou pour les développeurs expérimentés qui cherchent une référence rapide pour la configuration de GitHub dans Visual Studio Code.
>
>🎓 À la fin de cette vidéo, vous serez équipé des compétences pour gérer votre base de code en toute confiance, collaborer avec les autres et contribuer à des projets open source sur GitHub.
>
>
>Lien de la vidéo : https://youtu.be/IdT1BhrSfdo?si=mV7xVpiyuhlD8Zrw
>
>Vos commentaires sont les bienvenus
>                     URL de la publication : https://www.reddit.com/r/Python/comments/1823wr7/setup_github_copilot_in_visual_studio_code/
>                     Catégorie de la publication : N/A.
>                     Score : 0
>
>Titre de la publication : 'A Chinese Checkers game made with pygame and PySide6, with custom bots support'
>Utilisateur : HenryChess
>Sous-forum : r/Python :
>                     Texte du corps : Lien GitHub : https://github.com/henrychess/pygame-chinese-checkers
>
>Je ne suis pas sûr que cela compte comme débutant ou intermédiaire. Je pense que je suis encore dans la zone des débutants, donc je le marque comme débutant.
>
>Il s'agit d'un jeu de Dames Chinoises (aka Sternhalma) pour 2 à 3 joueurs. Les bots que j'ai écrits sont faciles à battre, car ils sont principalement destinés au débogage de la partie logique du jeu. Cependant, vous pouvez écrire vos propres bots personnalisés. Il y a un guide sur la page GitHub.
>                     URL de la publication : https://www.reddit.com/r/Python/comments/181xq0u/a_chinese_checkers_game_made_with_pygame_and/
>                     Catégorie de la publication : N/A.
>                     Score : 1

## Utilisation de l'outil avec une chaîne d'agents

La fonctionnalité de recherche Reddit est également fournie sous forme d'outil multi-entrées. Dans cet exemple, nous adaptons [un code existant de la documentation](/docs/modules/memory/agent_with_memory), et utilisons ChatOpenAI pour créer une chaîne d'agents avec mémoire. Cette chaîne d'agents est capable d'extraire des informations de Reddit et d'utiliser ces publications pour répondre aux entrées suivantes.

Pour exécuter l'exemple, ajoutez vos informations d'accès à l'API Reddit et obtenez également une clé OpenAI à partir de [l'API OpenAI](https://help.openai.com/en/articles/4936850-where-do-i-find-my-api-key).

```python
# Adapted code from /docs/modules/agents/how_to/sharedmemory_for_tools

from langchain.agents import AgentExecutor, StructuredChatAgent, Tool
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory, ReadOnlySharedMemory
from langchain_community.tools.reddit_search.tool import RedditSearchRun
from langchain_community.utilities.reddit_search import RedditSearchAPIWrapper
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

# Provide keys for Reddit
client_id = ""
client_secret = ""
user_agent = ""
# Provide key for OpenAI
openai_api_key = ""

template = """This is a conversation between a human and a bot:

{chat_history}

Write a summary of the conversation for {input}:
"""

prompt = PromptTemplate(input_variables=["input", "chat_history"], template=template)
memory = ConversationBufferMemory(memory_key="chat_history")

prefix = """Have a conversation with a human, answering the following questions as best you can. You have access to the following tools:"""
suffix = """Begin!"

{chat_history}
Question: {input}
{agent_scratchpad}"""

tools = [
    RedditSearchRun(
        api_wrapper=RedditSearchAPIWrapper(
            reddit_client_id=client_id,
            reddit_client_secret=client_secret,
            reddit_user_agent=user_agent,
        )
    )
]

prompt = StructuredChatAgent.create_prompt(
    prefix=prefix,
    tools=tools,
    suffix=suffix,
    input_variables=["input", "chat_history", "agent_scratchpad"],
)

llm = ChatOpenAI(temperature=0, openai_api_key=openai_api_key)

llm_chain = LLMChain(llm=llm, prompt=prompt)
agent = StructuredChatAgent(llm_chain=llm_chain, verbose=True, tools=tools)
agent_chain = AgentExecutor.from_agent_and_tools(
    agent=agent, verbose=True, memory=memory, tools=tools
)

# Answering the first prompt requires usage of the Reddit search tool.
agent_chain.run(input="What is the newest post on r/langchain for the week?")
# Answering the subsequent prompt uses memory.
agent_chain.run(input="Who is the author of the post?")
```
