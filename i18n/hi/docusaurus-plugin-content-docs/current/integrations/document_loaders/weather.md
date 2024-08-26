---
translated: true
---

# मौसम

>[OpenWeatherMap](https://openweathermap.org/) एक ओपन-सोर्स मौसम सेवा प्रदाता है

यह लोडर OpenWeatherMap के OneCall API से मौसम डेटा प्राप्त करता है, जिसमें pyowm Python पैकेज का उपयोग किया जाता है। आपको लोडर को अपने OpenWeatherMap API टोकन और आप जिन शहरों के मौसम डेटा चाहते हैं, उनके नामों के साथ प्रारंभ करना होगा।

```python
from langchain_community.document_loaders import WeatherDataLoader
```

```python
%pip install --upgrade --quiet  pyowm
```

```python
# Set API key either by passing it in to constructor directly
# or by setting the environment variable "OPENWEATHERMAP_API_KEY".

from getpass import getpass

OPENWEATHERMAP_API_KEY = getpass()
```

```python
loader = WeatherDataLoader.from_params(
    ["chennai", "vellore"], openweathermap_api_key=OPENWEATHERMAP_API_KEY
)
```

```python
documents = loader.load()
documents
```
