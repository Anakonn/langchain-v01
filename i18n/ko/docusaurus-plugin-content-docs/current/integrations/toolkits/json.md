---
translated: true
---

# JSON

이 노트북은 대규모 `JSON/dict` 객체와 상호 작용하는 에이전트를 보여줍니다.
이는 LLM의 컨텍스트 창에 맞지 않는 JSON 블롭에 대한 질문에 답변하려는 경우에 유용합니다. 에이전트는 사용자의 질문에 답변하기 위해 필요한 것을 찾기 위해 블롭을 반복적으로 탐색할 수 있습니다.

아래 예에서는 OpenAI API의 OpenAPI 사양을 사용하고 있으며, 이는 [여기](https://github.com/openai/openai-openapi/blob/master/openapi.yaml)에서 찾을 수 있습니다.

JSON 에이전트를 사용하여 API 사양에 대한 몇 가지 질문에 답변하겠습니다.

## 초기화

```python
import yaml
from langchain.agents import create_json_agent
from langchain_community.agent_toolkits import JsonToolkit
from langchain_community.tools.json.tool import JsonSpec
from langchain_openai import OpenAI
```

```python
with open("openai_openapi.yml") as f:
    data = yaml.load(f, Loader=yaml.FullLoader)
json_spec = JsonSpec(dict_=data, max_value_length=4000)
json_toolkit = JsonToolkit(spec=json_spec)

json_agent_executor = create_json_agent(
    llm=OpenAI(temperature=0), toolkit=json_toolkit, verbose=True
)
```

## 예: 요청에 필요한 POST 매개변수 가져오기

```python
json_agent_executor.run(
    "What are the required parameters in the request body to the /completions endpoint?"
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mAction: json_spec_list_keys
Action Input: data[0m
Observation: [36;1m[1;3m['openapi', 'info', 'servers', 'tags', 'paths', 'components', 'x-oaiMeta'][0m
Thought:[32;1m[1;3m I should look at the paths key to see what endpoints exist
Action: json_spec_list_keys
Action Input: data["paths"][0m
Observation: [36;1m[1;3m['/engines', '/engines/{engine_id}', '/completions', '/edits', '/images/generations', '/images/edits', '/images/variations', '/embeddings', '/engines/{engine_id}/search', '/files', '/files/{file_id}', '/files/{file_id}/content', '/answers', '/classifications', '/fine-tunes', '/fine-tunes/{fine_tune_id}', '/fine-tunes/{fine_tune_id}/cancel', '/fine-tunes/{fine_tune_id}/events', '/models', '/models/{model}', '/moderations'][0m
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
Thought:[32;1m[1;3m I should look at the required key to see what parameters are required
Action: json_spec_get_value
Action Input: data["paths"]["/completions"]["post"]["requestBody"]["required"][0m
Observation: [33;1m[1;3mTrue[0m
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
Final Answer: The required parameters in the request body to the /completions endpoint are 'model'.[0m

[1m> Finished chain.[0m
```

```output
"The required parameters in the request body to the /completions endpoint are 'model'."
```
