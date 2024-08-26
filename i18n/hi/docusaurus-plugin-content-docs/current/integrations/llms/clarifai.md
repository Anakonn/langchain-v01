---
translated: true
---

# क्लेरिफाई

>[क्लेरिफाई](https://www.clarifai.com/) एक एआई प्लेटफॉर्म है जो डेटा एक्सप्लोरेशन, डेटा लेबलिंग, मॉडल ट्रेनिंग, मूल्यांकन और अनुमान के पूरे एआई लाइफसाइकिल को प्रदान करता है।

यह उदाहरण `क्लेरिफाई` [मॉडल](https://clarifai.com/explore/models) के साथ LangChain का उपयोग करने के बारे में बताता है।

क्लेरिफाई का उपयोग करने के लिए, आपके पास एक खाता और एक व्यक्तिगत एक्सेस टोकन (PAT) कुंजी होनी चाहिए।
[यहां](https://clarifai.com/settings/security) जाकर PAT प्राप्त या बनाएं।

# निर्भरताएं

```python
# Install required dependencies
%pip install --upgrade --quiet  clarifai
```

```python
# Declare clarifai pat token as environment variable or you can pass it as argument in clarifai class.
import os

os.environ["CLARIFAI_PAT"] = "CLARIFAI_PAT_TOKEN"
```

# आयात

यहां हम व्यक्तिगत एक्सेस टोकन सेट करेंगे। आप अपने क्लेरिफाई खाते में [सेटिंग्स/सुरक्षा](https://clarifai.com/settings/security) में अपना PAT पा सकते हैं।

```python
# Please login and get your API key from  https://clarifai.com/settings/security
from getpass import getpass

CLARIFAI_PAT = getpass()
```

```python
# Import the required modules
from langchain.chains import LLMChain
from langchain_community.llms import Clarifai
from langchain_core.prompts import PromptTemplate
```

# इनपुट

LLM श्रृंखला के साथ उपयोग करने के लिए एक प्रॉम्प्ट टेम्प्लेट बनाएं:

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

# सेटअप

उपयोगकर्ता आईडी और ऐप आईडी सेट करें जहां मॉडल मौजूद है। आप https://clarifai.com/explore/models पर सार्वजनिक मॉडलों की एक सूची पा सकते हैं।

आपको मॉडल आईडी और यदि आवश्यक हो तो मॉडल संस्करण आईडी भी प्रारंभ करना होगा। कुछ मॉडलों के कई संस्करण होते हैं, आप अपने कार्य के लिए उचित संस्करण का चयन कर सकते हैं।

वैकल्पिक रूप से, आप model_url (उदाहरण के लिए "https://clarifai.com/anthropic/completion/models/claude-v2") का उपयोग कर सकते हैं।

```python
USER_ID = "openai"
APP_ID = "chat-completion"
MODEL_ID = "GPT-3_5-turbo"

# You can provide a specific model version as the model_version_id arg.
# MODEL_VERSION_ID = "MODEL_VERSION_ID"
# or

MODEL_URL = "https://clarifai.com/openai/chat-completion/models/GPT-4"
```

```python
# Initialize a Clarifai LLM
clarifai_llm = Clarifai(user_id=USER_ID, app_id=APP_ID, model_id=MODEL_ID)
# or
# Initialize through Model URL
clarifai_llm = Clarifai(model_url=MODEL_URL)
```

```python
# Create LLM chain
llm_chain = LLMChain(prompt=prompt, llm=clarifai_llm)
```

# श्रृंखला चलाएं

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```

```output
' Okay, here are the steps to figure this out:\n\n1. Justin Bieber was born on March 1, 1994.\n\n2. The Super Bowl that took place in the year of his birth was Super Bowl XXVIII. \n\n3. Super Bowl XXVIII was played on January 30, 1994.\n\n4. The two teams that played in Super Bowl XXVIII were the Dallas Cowboys and the Buffalo Bills. \n\n5. The Dallas Cowboys defeated the Buffalo Bills 30-13 to win Super Bowl XXVIII.\n\nTherefore, the NFL team that won the Super Bowl in the year Justin Bieber was born was the Dallas Cowboys.'
```

## GPT के लिए अनुमान मापदंडों के साथ मॉडल पूर्वानुमान।

वैकल्पिक रूप से, आप तापमान, max_tokens आदि जैसे अनुमान मापदंडों के साथ GPT मॉडल का उपयोग कर सकते हैं।

```python
# Intialize the parameters as dict.
params = dict(temperature=str(0.3), max_tokens=100)
```

```python
clarifai_llm = Clarifai(user_id=USER_ID, app_id=APP_ID, model_id=MODEL_ID)
llm_chain = LLMChain(
    prompt=prompt, llm=clarifai_llm, llm_kwargs={"inference_params": params}
)
```

```python
question = "How many 3 digit even numbers you can form that if one of the digits is 5 then the following digit must be 7?"

llm_chain.run(question)
```

```output
'Step 1: The first digit can be any even number from 1 to 9, except for 5. So there are 4 choices for the first digit.\n\nStep 2: If the first digit is not 5, then the second digit must be 7. So there is only 1 choice for the second digit.\n\nStep 3: The third digit can be any even number from 0 to 9, except for 5 and 7. So there are '
```

प्रॉम्प्ट की सूची के लिए प्रतिक्रियाएं उत्पन्न करें।

```python
# We can use _generate to generate the response for list of prompts.
clarifai_llm._generate(
    [
        "Help me summarize the events of american revolution in 5 sentences",
        "Explain about rocket science in a funny way",
        "Create a script for welcome speech for the college sports day",
    ],
    inference_params=params,
)
```

```output
LLMResult(generations=[[Generation(text=' Here is a 5 sentence summary of the key events of the American Revolution:\n\nThe American Revolution began with growing tensions between American colonists and the British government over issues of taxation without representation. In 1775, fighting broke out between British troops and American militiamen in Lexington and Concord, starting the Revolutionary War. The Continental Congress appointed George Washington as commander of the Continental Army, which went on to win key victories over the British. In 1776, the Declaration of Independence was adopted, formally declaring the 13 American colonies free from British rule. After years of fighting, the Revolutionary War ended with the British defeat at Yorktown in 1781 and recognition of American independence.')], [Generation(text=" Here's a humorous take on explaining rocket science:\n\nRocket science is so easy, it's practically child's play! Just strap a big metal tube full of explosive liquid to your butt and light the fuse. What could go wrong? Blastoff!  Whoosh, you'll be zooming to the moon in no time. Just remember your helmet or your head might go pop like a zit when you leave the atmosphere. \n\nMaking rockets is a cinch too. Simply mix together some spicy spices, garlic powder, chili powder, a dash of gunpowder and voila - rocket fuel! Add a pinch of baking soda and vinegar if you want an extra kick. Shake well and pour into your DIY soda bottle rocket. Stand back and watch that baby soar!\n\nGuiding a rocket is fun for the whole family. Just strap in, push some random buttons and see where you end up. It's like the ultimate surprise vacation! You never know if you'll wind up on Venus, crash land on Mars, or take a quick dip through the rings of Saturn. \n\nAnd if anything goes wrong, don't sweat it. Rocket science is easy breezy. Just troubleshoot on the fly with some duct tape and crazy glue and you'll be back on course in a jiffy. Who needs mission control when you've got this!")], [Generation(text=" Here is a draft welcome speech for a college sports day:\n\nGood morning everyone and welcome to our college's annual sports day! It's wonderful to see so many students, faculty, staff, alumni, and guests gathered here today to celebrate sportsmanship and athletic achievement at our college. \n\nLet's begin by thanking all the organizers, volunteers, coaches, and staff members who worked tirelessly behind the scenes to make this event possible. Our sports day would not happen without your dedication and commitment. \n\nI also want to recognize all the student-athletes with us today. You inspire us with your talent, spirit, and determination. Sports have a unique power to unite and energize our community. Through both individual and team sports, you demonstrate focus, collaboration, perseverance and resilience – qualities that will serve you well both on and off the field.\n\nThe spirit of competition and fair play are core values of any sports event. I encourage all of you to compete enthusiastically today. Play to the best of your ability and have fun. Applaud the effort and sportsmanship of your fellow athletes, regardless of the outcome. \n\nWin or lose, this sports day is a day for us to build camaraderie and create lifelong memories. Let's make it a day of fitness and friendship for all. With that, let the games begin. Enjoy the day!")]], llm_output=None, run=None)
```
