---
translated: true
---

# OpenAPI

Nous pouvons construire des agents pour consommer des API arbitraires, ici des API conformes à la spécification `OpenAPI`/`Swagger`.

```python
# NOTE: In this example. We must set `allow_dangerous_request=True` to enable the OpenAPI Agent to automatically use the Request Tool.
# This can be dangerous for calling unwanted requests. Please make sure your custom OpenAPI spec (yaml) is safe.
ALLOW_DANGEROUS_REQUEST = True
```

## 1er exemple : agent de planification hiérarchique

Dans cet exemple, nous allons considérer une approche appelée planification hiérarchique, courante en robotique et apparaissant dans des travaux récents pour les LLM X robotique. Nous verrons que c'est une approche viable pour commencer à travailler avec une spécification d'API massive ET pour aider avec les requêtes des utilisateurs qui nécessitent plusieurs étapes contre l'API.

L'idée est simple : pour obtenir un comportement cohérent de l'agent sur de longues séquences de comportement et pour économiser les jetons, nous séparerons les préoccupations : un "planificateur" sera responsable des points de terminaison à appeler et un "contrôleur" sera responsable de la façon de les appeler.

Dans l'implémentation initiale, le planificateur est une chaîne de LLM qui a le nom et une brève description de chaque point de terminaison dans le contexte. Le contrôleur est un agent LLM qui est instancié avec la documentation uniquement pour les points de terminaison d'un plan particulier. Il reste beaucoup à faire pour que cela fonctionne de manière très robuste :)

---

### Pour commencer, collectons quelques spécifications OpenAPI.

```python
import os

import yaml
```

Vous pourrez obtenir des spécifications OpenAPI ici : [APIs-guru/openapi-directory](https://github.com/APIs-guru/openapi-directory)

```python
!wget https://raw.githubusercontent.com/openai/openai-openapi/master/openapi.yaml -O openai_openapi.yaml
!wget https://www.klarna.com/us/shopping/public/openai/v0/api-docs -O klarna_openapi.yaml
!wget https://raw.githubusercontent.com/APIs-guru/openapi-directory/main/APIs/spotify.com/1.0.0/openapi.yaml -O spotify_openapi.yaml
```

```output
--2023-03-31 15:45:56--  https://raw.githubusercontent.com/openai/openai-openapi/master/openapi.yaml
Resolving raw.githubusercontent.com (raw.githubusercontent.com)... 185.199.110.133, 185.199.109.133, 185.199.111.133, ...
Connecting to raw.githubusercontent.com (raw.githubusercontent.com)|185.199.110.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 122995 (120K) [text/plain]
Saving to: ‘openapi.yaml’

openapi.yaml        100%[===================>] 120.11K  --.-KB/s    in 0.01s

2023-03-31 15:45:56 (10.4 MB/s) - ‘openapi.yaml’ saved [122995/122995]

--2023-03-31 15:45:57--  https://www.klarna.com/us/shopping/public/openai/v0/api-docs
Resolving www.klarna.com (www.klarna.com)... 52.84.150.34, 52.84.150.46, 52.84.150.61, ...
Connecting to www.klarna.com (www.klarna.com)|52.84.150.34|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: unspecified [application/json]
Saving to: ‘api-docs’

api-docs                [ <=>                ]   1.87K  --.-KB/s    in 0s

2023-03-31 15:45:57 (261 MB/s) - ‘api-docs’ saved [1916]

--2023-03-31 15:45:57--  https://raw.githubusercontent.com/APIs-guru/openapi-directory/main/APIs/spotify.com/1.0.0/openapi.yaml
Resolving raw.githubusercontent.com (raw.githubusercontent.com)... 185.199.110.133, 185.199.109.133, 185.199.111.133, ...
Connecting to raw.githubusercontent.com (raw.githubusercontent.com)|185.199.110.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 286747 (280K) [text/plain]
Saving to: ‘openapi.yaml’

openapi.yaml        100%[===================>] 280.03K  --.-KB/s    in 0.02s

2023-03-31 15:45:58 (13.3 MB/s) - ‘openapi.yaml’ saved [286747/286747]
```

```python
from langchain_community.agent_toolkits.openapi.spec import reduce_openapi_spec
```

```python
with open("openai_openapi.yaml") as f:
    raw_openai_api_spec = yaml.load(f, Loader=yaml.Loader)
openai_api_spec = reduce_openapi_spec(raw_openai_api_spec)

with open("klarna_openapi.yaml") as f:
    raw_klarna_api_spec = yaml.load(f, Loader=yaml.Loader)
klarna_api_spec = reduce_openapi_spec(raw_klarna_api_spec)

with open("spotify_openapi.yaml") as f:
    raw_spotify_api_spec = yaml.load(f, Loader=yaml.Loader)
spotify_api_spec = reduce_openapi_spec(raw_spotify_api_spec)
```

---

Nous allons travailler avec l'API Spotify comme l'un des exemples d'API assez complexe. Il y a un peu de configuration liée à l'authentification à faire si vous voulez répliquer cela.

- Vous devrez configurer une application dans la console de développeur Spotify, documentée [ici](https://developer.spotify.com/documentation/general/guides/authorization/), pour obtenir les identifiants : `CLIENT_ID`, `CLIENT_SECRET` et `REDIRECT_URI`.
- Pour obtenir des jetons d'accès (et les garder frais), vous pouvez mettre en œuvre les flux oauth, ou vous pouvez utiliser `spotipy`. Si vous avez défini vos identifiants Spotify en tant que variables d'environnement `SPOTIPY_CLIENT_ID`, `SPOTIPY_CLIENT_SECRET` et `SPOTIPY_REDIRECT_URI`, vous pouvez utiliser les fonctions d'assistance ci-dessous :

```python
import spotipy.util as util
from langchain.requests import RequestsWrapper


def construct_spotify_auth_headers(raw_spec: dict):
    scopes = list(
        raw_spec["components"]["securitySchemes"]["oauth_2_0"]["flows"][
            "authorizationCode"
        ]["scopes"].keys()
    )
    access_token = util.prompt_for_user_token(scope=",".join(scopes))
    return {"Authorization": f"Bearer {access_token}"}


# Get API credentials.
headers = construct_spotify_auth_headers(raw_spotify_api_spec)
requests_wrapper = RequestsWrapper(headers=headers)
```

### Quelle est la taille de cette spécification ?

```python
endpoints = [
    (route, operation)
    for route, operations in raw_spotify_api_spec["paths"].items()
    for operation in operations
    if operation in ["get", "post"]
]
len(endpoints)
```

```output
63
```

```python
import tiktoken

enc = tiktoken.encoding_for_model("gpt-4")


def count_tokens(s):
    return len(enc.encode(s))


count_tokens(yaml.dump(raw_spotify_api_spec))
```

```output
80326
```

### Voyons quelques exemples !

En commençant par GPT-4. (Quelques itérations de robustesse en cours pour la famille GPT-3.)

```python
from langchain_community.agent_toolkits.openapi import planner
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model_name="gpt-4", temperature=0.0)
```

```output
/Users/jeremywelborn/src/langchain/langchain/llms/openai.py:169: UserWarning: You are trying to use a chat model. This way of initializing it is no longer supported. Instead, please use: `from langchain_openai import ChatOpenAI`
  warnings.warn(
/Users/jeremywelborn/src/langchain/langchain/llms/openai.py:608: UserWarning: You are trying to use a chat model. This way of initializing it is no longer supported. Instead, please use: `from langchain_openai import ChatOpenAI`
  warnings.warn(
```

```python
# NOTE: set allow_dangerous_requests manually for security concern https://python.langchain.com/docs/security
spotify_agent = planner.create_openapi_agent(
    spotify_api_spec,
    requests_wrapper,
    llm,
    allow_dangerous_requests=ALLOW_DANGEROUS_REQUEST,
)
user_query = (
    "make me a playlist with the first song from kind of blue. call it machine blues."
)
spotify_agent.invoke(user_query)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mAction: api_planner
Action Input: I need to find the right API calls to create a playlist with the first song from Kind of Blue and name it Machine Blues[0m
Observation: [36;1m[1;3m1. GET /search to search for the album "Kind of Blue"
2. GET /albums/{id}/tracks to get the tracks from the "Kind of Blue" album
3. GET /me to get the current user's information
4. POST /users/{user_id}/playlists to create a new playlist named "Machine Blues" for the current user
5. POST /playlists/{playlist_id}/tracks to add the first song from "Kind of Blue" to the "Machine Blues" playlist[0m
Thought:[32;1m[1;3mI have the plan, now I need to execute the API calls.
Action: api_controller
Action Input: 1. GET /search to search for the album "Kind of Blue"
2. GET /albums/{id}/tracks to get the tracks from the "Kind of Blue" album
3. GET /me to get the current user's information
4. POST /users/{user_id}/playlists to create a new playlist named "Machine Blues" for the current user
5. POST /playlists/{playlist_id}/tracks to add the first song from "Kind of Blue" to the "Machine Blues" playlist[0m

[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mAction: requests_get
Action Input: {"url": "https://api.spotify.com/v1/search?q=Kind%20of%20Blue&type=album", "output_instructions": "Extract the id of the first album in the search results"}[0m
Observation: [36;1m[1;3m1weenld61qoidwYuZ1GESA[0m
Thought:[32;1m[1;3mAction: requests_get
Action Input: {"url": "https://api.spotify.com/v1/albums/1weenld61qoidwYuZ1GESA/tracks", "output_instructions": "Extract the id of the first track in the album"}[0m
Observation: [36;1m[1;3m7q3kkfAVpmcZ8g6JUThi3o[0m
Thought:[32;1m[1;3mAction: requests_get
Action Input: {"url": "https://api.spotify.com/v1/me", "output_instructions": "Extract the id of the current user"}[0m
Observation: [36;1m[1;3m22rhrz4m4kvpxlsb5hezokzwi[0m
Thought:[32;1m[1;3mAction: requests_post
Action Input: {"url": "https://api.spotify.com/v1/users/22rhrz4m4kvpxlsb5hezokzwi/playlists", "data": {"name": "Machine Blues"}, "output_instructions": "Extract the id of the created playlist"}[0m
Observation: [33;1m[1;3m7lzoEi44WOISnFYlrAIqyX[0m
Thought:[32;1m[1;3mAction: requests_post
Action Input: {"url": "https://api.spotify.com/v1/playlists/7lzoEi44WOISnFYlrAIqyX/tracks", "data": {"uris": ["spotify:track:7q3kkfAVpmcZ8g6JUThi3o"]}, "output_instructions": "Confirm that the track was added to the playlist"}
[0m
Observation: [33;1m[1;3mThe track was added to the playlist, confirmed by the snapshot_id: MiwxODMxNTMxZTFlNzg3ZWFlZmMxYTlmYWQyMDFiYzUwNDEwMTAwZmE1.[0m
Thought:[32;1m[1;3mI am finished executing the plan.
Final Answer: The first song from the "Kind of Blue" album has been added to the "Machine Blues" playlist.[0m

[1m> Finished chain.[0m

Observation: [33;1m[1;3mThe first song from the "Kind of Blue" album has been added to the "Machine Blues" playlist.[0m
Thought:[32;1m[1;3mI am finished executing the plan and have created the playlist with the first song from Kind of Blue.
Final Answer: I have created a playlist called "Machine Blues" with the first song from the "Kind of Blue" album.[0m

[1m> Finished chain.[0m
```

```output
'I have created a playlist called "Machine Blues" with the first song from the "Kind of Blue" album.'
```

```python
user_query = "give me a song I'd like, make it blues-ey"
spotify_agent.invoke(user_query)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mAction: api_planner
Action Input: I need to find the right API calls to get a blues song recommendation for the user[0m
Observation: [36;1m[1;3m1. GET /me to get the current user's information
2. GET /recommendations/available-genre-seeds to retrieve a list of available genres
3. GET /recommendations with the seed_genre parameter set to "blues" to get a blues song recommendation for the user[0m
Thought:[32;1m[1;3mI have the plan, now I need to execute the API calls.
Action: api_controller
Action Input: 1. GET /me to get the current user's information
2. GET /recommendations/available-genre-seeds to retrieve a list of available genres
3. GET /recommendations with the seed_genre parameter set to "blues" to get a blues song recommendation for the user[0m

[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mAction: requests_get
Action Input: {"url": "https://api.spotify.com/v1/me", "output_instructions": "Extract the user's id and username"}[0m
Observation: [36;1m[1;3mID: 22rhrz4m4kvpxlsb5hezokzwi, Username: Jeremy Welborn[0m
Thought:[32;1m[1;3mAction: requests_get
Action Input: {"url": "https://api.spotify.com/v1/recommendations/available-genre-seeds", "output_instructions": "Extract the list of available genres"}[0m
Observation: [36;1m[1;3macoustic, afrobeat, alt-rock, alternative, ambient, anime, black-metal, bluegrass, blues, bossanova, brazil, breakbeat, british, cantopop, chicago-house, children, chill, classical, club, comedy, country, dance, dancehall, death-metal, deep-house, detroit-techno, disco, disney, drum-and-bass, dub, dubstep, edm, electro, electronic, emo, folk, forro, french, funk, garage, german, gospel, goth, grindcore, groove, grunge, guitar, happy, hard-rock, hardcore, hardstyle, heavy-metal, hip-hop, holidays, honky-tonk, house, idm, indian, indie, indie-pop, industrial, iranian, j-dance, j-idol, j-pop, j-rock, jazz, k-pop, kids, latin, latino, malay, mandopop, metal, metal-misc, metalcore, minimal-techno, movies, mpb, new-age, new-release, opera, pagode, party, philippines-[0m
Thought:

Retrying langchain.llms.openai.completion_with_retry.<locals>._completion_with_retry in 4.0 seconds as it raised RateLimitError: That model is currently overloaded with other requests. You can retry your request, or contact us through our help center at help.openai.com if the error persists. (Please include the request ID 2167437a0072228238f3c0c5b3882764 in your message.).

[32;1m[1;3mAction: requests_get
Action Input: {"url": "https://api.spotify.com/v1/recommendations?seed_genres=blues", "output_instructions": "Extract the list of recommended tracks with their ids and names"}[0m
Observation: [36;1m[1;3m[
  {
    id: '03lXHmokj9qsXspNsPoirR',
    name: 'Get Away Jordan'
  }
][0m
Thought:[32;1m[1;3mI am finished executing the plan.
Final Answer: The recommended blues song for user Jeremy Welborn (ID: 22rhrz4m4kvpxlsb5hezokzwi) is "Get Away Jordan" with the track ID: 03lXHmokj9qsXspNsPoirR.[0m

[1m> Finished chain.[0m

Observation: [33;1m[1;3mThe recommended blues song for user Jeremy Welborn (ID: 22rhrz4m4kvpxlsb5hezokzwi) is "Get Away Jordan" with the track ID: 03lXHmokj9qsXspNsPoirR.[0m
Thought:[32;1m[1;3mI am finished executing the plan and have the information the user asked for.
Final Answer: The recommended blues song for you is "Get Away Jordan" with the track ID: 03lXHmokj9qsXspNsPoirR.[0m

[1m> Finished chain.[0m
```

```output
'The recommended blues song for you is "Get Away Jordan" with the track ID: 03lXHmokj9qsXspNsPoirR.'
```

#### Essayez une autre API.

```python
headers = {"Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"}
openai_requests_wrapper = RequestsWrapper(headers=headers)
```

```python
# Meta!
llm = ChatOpenAI(model_name="gpt-4", temperature=0.25)
openai_agent = planner.create_openapi_agent(
    openai_api_spec, openai_requests_wrapper, llm
)
user_query = "generate a short piece of advice"
openai_agent.invoke(user_query)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mAction: api_planner
Action Input: I need to find the right API calls to generate a short piece of advice[0m
Observation: [36;1m[1;3m1. GET /engines to retrieve the list of available engines
2. POST /completions with the selected engine and a prompt for generating a short piece of advice[0m
Thought:[32;1m[1;3mI have the plan, now I need to execute the API calls.
Action: api_controller
Action Input: 1. GET /engines to retrieve the list of available engines
2. POST /completions with the selected engine and a prompt for generating a short piece of advice[0m

[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mAction: requests_get
Action Input: {"url": "https://api.openai.com/v1/engines", "output_instructions": "Extract the ids of the engines"}[0m
Observation: [36;1m[1;3mbabbage, davinci, text-davinci-edit-001, babbage-code-search-code, text-similarity-babbage-001, code-davinci-edit-001, text-davinci-001, ada, babbage-code-search-text, babbage-similarity, whisper-1, code-search-babbage-text-001, text-curie-001, code-search-babbage-code-001, text-ada-001, text-embedding-ada-002, text-similarity-ada-001, curie-instruct-beta, ada-code-search-code, ada-similarity, text-davinci-003, code-search-ada-text-001, text-search-ada-query-001, davinci-search-document, ada-code-search-text, text-search-ada-doc-001, davinci-instruct-beta, text-similarity-curie-001, code-search-ada-code-001[0m
Thought:[32;1m[1;3mI will use the "davinci" engine to generate a short piece of advice.
Action: requests_post
Action Input: {"url": "https://api.openai.com/v1/completions", "data": {"engine": "davinci", "prompt": "Give me a short piece of advice on how to be more productive."}, "output_instructions": "Extract the text from the first choice"}[0m
Observation: [33;1m[1;3m"you must provide a model parameter"[0m
Thought:!! Could not _extract_tool_and_input from "I cannot finish executing the plan without knowing how to provide the model parameter correctly." in _get_next_action
[32;1m[1;3mI cannot finish executing the plan without knowing how to provide the model parameter correctly.[0m

[1m> Finished chain.[0m

Observation: [33;1m[1;3mI need more information on how to provide the model parameter correctly in the POST request to generate a short piece of advice.[0m
Thought:[32;1m[1;3mI need to adjust my plan to include the model parameter in the POST request.
Action: api_planner
Action Input: I need to find the right API calls to generate a short piece of advice, including the model parameter in the POST request[0m
Observation: [36;1m[1;3m1. GET /models to retrieve the list of available models
2. Choose a suitable model from the list
3. POST /completions with the chosen model as a parameter to generate a short piece of advice[0m
Thought:[32;1m[1;3mI have an updated plan, now I need to execute the API calls.
Action: api_controller
Action Input: 1. GET /models to retrieve the list of available models
2. Choose a suitable model from the list
3. POST /completions with the chosen model as a parameter to generate a short piece of advice[0m

[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mAction: requests_get
Action Input: {"url": "https://api.openai.com/v1/models", "output_instructions": "Extract the ids of the available models"}[0m
Observation: [36;1m[1;3mbabbage, davinci, text-davinci-edit-001, babbage-code-search-code, text-similarity-babbage-001, code-davinci-edit-001, text-davinci-edit-001, ada[0m
Thought:[32;1m[1;3mAction: requests_post
Action Input: {"url": "https://api.openai.com/v1/completions", "data": {"model": "davinci", "prompt": "Give me a short piece of advice on how to improve communication skills."}, "output_instructions": "Extract the text from the first choice"}[0m
Observation: [33;1m[1;3m"I'd like to broaden my horizon.\n\nI was trying to"[0m
Thought:[32;1m[1;3mI cannot finish executing the plan without knowing some other information.

Final Answer: The generated text is not a piece of advice on improving communication skills. I would need to retry the API call with a different prompt or model to get a more relevant response.[0m

[1m> Finished chain.[0m

Observation: [33;1m[1;3mThe generated text is not a piece of advice on improving communication skills. I would need to retry the API call with a different prompt or model to get a more relevant response.[0m
Thought:[32;1m[1;3mI need to adjust my plan to include a more specific prompt for generating a short piece of advice on improving communication skills.
Action: api_planner
Action Input: I need to find the right API calls to generate a short piece of advice on improving communication skills, including the model parameter in the POST request[0m
Observation: [36;1m[1;3m1. GET /models to retrieve the list of available models
2. Choose a suitable model for generating text (e.g., text-davinci-002)
3. POST /completions with the chosen model and a prompt related to improving communication skills to generate a short piece of advice[0m
Thought:[32;1m[1;3mI have an updated plan, now I need to execute the API calls.
Action: api_controller
Action Input: 1. GET /models to retrieve the list of available models
2. Choose a suitable model for generating text (e.g., text-davinci-002)
3. POST /completions with the chosen model and a prompt related to improving communication skills to generate a short piece of advice[0m

[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mAction: requests_get
Action Input: {"url": "https://api.openai.com/v1/models", "output_instructions": "Extract the names of the models"}[0m
Observation: [36;1m[1;3mbabbage, davinci, text-davinci-edit-001, babbage-code-search-code, text-similarity-babbage-001, code-davinci-edit-001, text-davinci-edit-001, ada[0m
Thought:[32;1m[1;3mAction: requests_post
Action Input: {"url": "https://api.openai.com/v1/completions", "data": {"model": "text-davinci-002", "prompt": "Give a short piece of advice on how to improve communication skills"}, "output_instructions": "Extract the text from the first choice"}[0m
Observation: [33;1m[1;3m"Some basic advice for improving communication skills would be to make sure to listen"[0m
Thought:[32;1m[1;3mI am finished executing the plan.

Final Answer: Some basic advice for improving communication skills would be to make sure to listen.[0m

[1m> Finished chain.[0m

Observation: [33;1m[1;3mSome basic advice for improving communication skills would be to make sure to listen.[0m
Thought:[32;1m[1;3mI am finished executing the plan and have the information the user asked for.
Final Answer: A short piece of advice for improving communication skills is to make sure to listen.[0m

[1m> Finished chain.[0m
```

```output
'A short piece of advice for improving communication skills is to make sure to listen.'
```

Cela prend un certain temps pour y arriver !

## 2e exemple : agent "explorateur json"

Voici un agent qui n'est pas particulièrement pratique, mais intéressant ! L'agent a accès à 2 boîtes à outils. L'une comprend des outils pour interagir avec le json : un outil pour lister les clés d'un objet json et un autre outil pour obtenir la valeur d'une clé donnée. L'autre boîte à outils comprend des wrappers `requests` pour envoyer des requêtes GET et POST. Cet agent consomme beaucoup d'appels au modèle de langage, mais s'en sort étonnamment bien.

```python
from langchain.agents import create_openapi_agent
from langchain_community.agent_toolkits import OpenAPIToolkit
from langchain_community.tools.json.tool import JsonSpec
from langchain_openai import OpenAI
```

```python
with open("openai_openapi.yaml") as f:
    data = yaml.load(f, Loader=yaml.FullLoader)
json_spec = JsonSpec(dict_=data, max_value_length=4000)


openapi_toolkit = OpenAPIToolkit.from_llm(
    OpenAI(temperature=0), json_spec, openai_requests_wrapper, verbose=True
)
openapi_agent_executor = create_openapi_agent(
    llm=OpenAI(temperature=0),
    toolkit=openapi_toolkit,
    allow_dangerous_requests=ALLOW_DANGEROUS_REQUEST,
    verbose=True,
)
```

```python
openapi_agent_executor.run(
    "Make a post request to openai /completions. The prompt should be 'tell me a joke.'"
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mAction: json_explorer
Action Input: What is the base url for the API?[0m

[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mAction: json_spec_list_keys
Action Input: data[0m
Observation: [36;1m[1;3m['openapi', 'info', 'servers', 'tags', 'paths', 'components', 'x-oaiMeta'][0m
Thought:[32;1m[1;3m I should look at the servers key to see what the base url is
Action: json_spec_list_keys
Action Input: data["servers"][0][0m
Observation: [36;1m[1;3mValueError('Value at path `data["servers"][0]` is not a dict, get the value directly.')[0m
Thought:[32;1m[1;3m I should get the value of the servers key
Action: json_spec_get_value
Action Input: data["servers"][0][0m
Observation: [33;1m[1;3m{'url': 'https://api.openai.com/v1'}[0m
Thought:[32;1m[1;3m I now know the base url for the API
Final Answer: The base url for the API is https://api.openai.com/v1[0m

[1m> Finished chain.[0m

Observation: [33;1m[1;3mThe base url for the API is https://api.openai.com/v1[0m
Thought:[32;1m[1;3m I should find the path for the /completions endpoint.
Action: json_explorer
Action Input: What is the path for the /completions endpoint?[0m

[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mAction: json_spec_list_keys
Action Input: data[0m
Observation: [36;1m[1;3m['openapi', 'info', 'servers', 'tags', 'paths', 'components', 'x-oaiMeta'][0m
Thought:[32;1m[1;3m I should look at the paths key to see what endpoints exist
Action: json_spec_list_keys
Action Input: data["paths"][0m
Observation: [36;1m[1;3m['/engines', '/engines/{engine_id}', '/completions', '/chat/completions', '/edits', '/images/generations', '/images/edits', '/images/variations', '/embeddings', '/audio/transcriptions', '/audio/translations', '/engines/{engine_id}/search', '/files', '/files/{file_id}', '/files/{file_id}/content', '/answers', '/classifications', '/fine-tunes', '/fine-tunes/{fine_tune_id}', '/fine-tunes/{fine_tune_id}/cancel', '/fine-tunes/{fine_tune_id}/events', '/models', '/models/{model}', '/moderations'][0m
Thought:[32;1m[1;3m I now know the path for the /completions endpoint
Final Answer: The path for the /completions endpoint is data["paths"][2][0m

[1m> Finished chain.[0m

Observation: [33;1m[1;3mThe path for the /completions endpoint is data["paths"][2][0m
Thought:[32;1m[1;3m I should find the required parameters for the POST request.
Action: json_explorer
Action Input: What are the required parameters for a POST request to the /completions endpoint?[0m

[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mAction: json_spec_list_keys
Action Input: data[0m
Observation: [36;1m[1;3m['openapi', 'info', 'servers', 'tags', 'paths', 'components', 'x-oaiMeta'][0m
Thought:[32;1m[1;3m I should look at the paths key to see what endpoints exist
Action: json_spec_list_keys
Action Input: data["paths"][0m
Observation: [36;1m[1;3m['/engines', '/engines/{engine_id}', '/completions', '/chat/completions', '/edits', '/images/generations', '/images/edits', '/images/variations', '/embeddings', '/audio/transcriptions', '/audio/translations', '/engines/{engine_id}/search', '/files', '/files/{file_id}', '/files/{file_id}/content', '/answers', '/classifications', '/fine-tunes', '/fine-tunes/{fine_tune_id}', '/fine-tunes/{fine_tune_id}/cancel', '/fine-tunes/{fine_tune_id}/events', '/models', '/models/{model}', '/moderations'][0m
Thought:[32;1m[1;3m I should look at the /completions endpoint to see what parameters are required
Action: json_spec_list_keys
Action Input: data["paths"]["/completions"][0m
Observation: [36;1m[1;3m['post'][0m
Thought:[32;1m[1;3m I should look at the post key to see what parameters are required
Action: json_spec_list_keys
Action Input: data["paths"]["/completions"]["post"][0m
Observation: [36;1m[1;3m['operationId', 'tags', 'summary', 'requestBody', 'responses', 'x-oaiMeta'][0m
Thought:[32;1m[1;3m I should look at the requestBody key to see what parameters are required
Action: json_spec_list_keys
Action Input: data["paths"]["/completions"]["post"]["requestBody"][0m
Observation: [36;1m[1;3m['required', 'content'][0m
Thought:[32;1m[1;3m I should look at the content key to see what parameters are required
Action: json_spec_list_keys
Action Input: data["paths"]["/completions"]["post"]["requestBody"]["content"][0m
Observation: [36;1m[1;3m['application/json'][0m
Thought:[32;1m[1;3m I should look at the application/json key to see what parameters are required
Action: json_spec_list_keys
Action Input: data["paths"]["/completions"]["post"]["requestBody"]["content"]["application/json"][0m
Observation: [36;1m[1;3m['schema'][0m
Thought:[32;1m[1;3m I should look at the schema key to see what parameters are required
Action: json_spec_list_keys
Action Input: data["paths"]["/completions"]["post"]["requestBody"]["content"]["application/json"]["schema"][0m
Observation: [36;1m[1;3m['$ref'][0m
Thought:[32;1m[1;3m I should look at the $ref key to see what parameters are required
Action: json_spec_list_keys
Action Input: data["paths"]["/completions"]["post"]["requestBody"]["content"]["application/json"]["schema"]["$ref"][0m
Observation: [36;1m[1;3mValueError('Value at path `data["paths"]["/completions"]["post"]["requestBody"]["content"]["application/json"]["schema"]["$ref"]` is not a dict, get the value directly.')[0m
Thought:[32;1m[1;3m I should look at the $ref key to get the value directly
Action: json_spec_get_value
Action Input: data["paths"]["/completions"]["post"]["requestBody"]["content"]["application/json"]["schema"]["$ref"][0m
Observation: [33;1m[1;3m#/components/schemas/CreateCompletionRequest[0m
Thought:[32;1m[1;3m I should look at the CreateCompletionRequest schema to see what parameters are required
Action: json_spec_list_keys
Action Input: data["components"]["schemas"]["CreateCompletionRequest"][0m
Observation: [36;1m[1;3m['type', 'properties', 'required'][0m
Thought:[32;1m[1;3m I should look at the required key to see what parameters are required
Action: json_spec_get_value
Action Input: data["components"]["schemas"]["CreateCompletionRequest"]["required"][0m
Observation: [33;1m[1;3m['model'][0m
Thought:[32;1m[1;3m I now know the final answer
Final Answer: The required parameters for a POST request to the /completions endpoint are 'model'.[0m

[1m> Finished chain.[0m

Observation: [33;1m[1;3mThe required parameters for a POST request to the /completions endpoint are 'model'.[0m
Thought:[32;1m[1;3m I now know the parameters needed to make the request.
Action: requests_post
Action Input: { "url": "https://api.openai.com/v1/completions", "data": { "model": "davinci", "prompt": "tell me a joke" } }[0m
Observation: [33;1m[1;3m{"id":"cmpl-70Ivzip3dazrIXU8DSVJGzFJj2rdv","object":"text_completion","created":1680307139,"model":"davinci","choices":[{"text":" with mummy not there”\n\nYou dig deep and come up with,","index":0,"logprobs":null,"finish_reason":"length"}],"usage":{"prompt_tokens":4,"completion_tokens":16,"total_tokens":20}}
[0m
Thought:[32;1m[1;3m I now know the final answer.
Final Answer: The response of the POST request is {"id":"cmpl-70Ivzip3dazrIXU8DSVJGzFJj2rdv","object":"text_completion","created":1680307139,"model":"davinci","choices":[{"text":" with mummy not there”\n\nYou dig deep and come up with,","index":0,"logprobs":null,"finish_reason":"length"}],"usage":{"prompt_tokens":4,"completion_tokens":16,"total_tokens":20}}[0m

[1m> Finished chain.[0m
```

```output
'The response of the POST request is {"id":"cmpl-70Ivzip3dazrIXU8DSVJGzFJj2rdv","object":"text_completion","created":1680307139,"model":"davinci","choices":[{"text":" with mummy not there”\\n\\nYou dig deep and come up with,","index":0,"logprobs":null,"finish_reason":"length"}],"usage":{"prompt_tokens":4,"completion_tokens":16,"total_tokens":20}}'
```
