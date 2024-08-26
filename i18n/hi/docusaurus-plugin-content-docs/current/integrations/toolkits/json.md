---
translated: true
---

# JSON

यह नोटबुक एक एजेंट को बड़े `JSON/dict` ऑब्जेक्ट्स के साथ इंटरैक्ट करते हुए दिखाता है।
यह तब उपयोगी है जब आप किसी JSON ब्लॉब के बारे में प्रश्न का उत्तर देना चाहते हैं जो कि किसी एलएलएम के संदर्भ विंडो में फिट नहीं होता है। एजेंट को ब्लॉब को क्रमिक रूप से एक्सप्लोर करने की क्षमता है ताकि वह उपयोगकर्ता के प्रश्न का उत्तर देने के लिए जो कुछ भी चाहिए वह प्राप्त कर सके।

नीचे दिए गए उदाहरण में, हम OpenAI API के लिए OpenAPI spec का उपयोग कर रहे हैं, जिसे आप यहाँ पा सकते हैं [यहाँ](https://github.com/openai/openai-openapi/blob/master/openapi.yaml)।

हम API spec के बारे में कुछ प्रश्नों का उत्तर देने के लिए JSON एजेंट का उपयोग करेंगे।

## प्रारंभीकरण

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

## उदाहरण: किसी अनुरोध के लिए आवश्यक POST पैरामीटर प्राप्त करना

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
