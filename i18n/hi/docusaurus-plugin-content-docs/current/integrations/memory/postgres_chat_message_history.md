---
translated: true
---

# पोस्टग्रेस

>[PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL) जिसे `Postgres` के रूप में भी जाना जाता है, एक मुफ्त और ओपन-सोर्स रिलेशनल डेटाबेस मैनेजमेंट सिस्टम (RDBMS) है जो विस्तारणीयता और SQL अनुपालन पर जोर देता है।

यह नोटबुक पोस्टग्रेस का उपयोग करके चैट संदेश इतिहास को कैसे संग्रहीत करें, इस बारे में चर्चा करता है।

```python
from langchain_community.chat_message_histories import (
    PostgresChatMessageHistory,
)

history = PostgresChatMessageHistory(
    connection_string="postgresql://postgres:mypassword@localhost/chat_history",
    session_id="foo",
)

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

```python
history.messages
```
