---
translated: true
---

# プロンプトサイズの管理

エージェントは動的にツールを呼び出します。それらのツールの呼び出し結果がプロンプトに追加されるので、エージェントは次のアクションを計画できます。使用されるツールや呼び出し方によっては、エージェントのプロンプトがモデルのコンテキストウィンドウを簡単に超えてしまうことがあります。

LCELを使えば、チェーンやエージェントのプロンプトサイズを管理するためのカスタム機能を簡単に追加できます。Wikipediaで情報を検索できるシンプルなエージェントの例を見てみましょう。

```python
%pip install --upgrade --quiet  langchain langchain-openai wikipedia
```

```python
from operator import itemgetter

from langchain.agents import AgentExecutor, load_tools
from langchain.agents.format_scratchpad import format_to_openai_function_messages
from langchain.agents.output_parsers import OpenAIFunctionsAgentOutputParser
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
from langchain_core.prompt_values import ChatPromptValue
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
```

```python
wiki = WikipediaQueryRun(
    api_wrapper=WikipediaAPIWrapper(top_k_results=5, doc_content_chars_max=10_000)
)
tools = [wiki]
```

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant"),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo")
```

プロンプトサイズ処理なしで、多段階の質問を試してみましょう:

```python
agent = (
    {
        "input": itemgetter("input"),
        "agent_scratchpad": lambda x: format_to_openai_function_messages(
            x["intermediate_steps"]
        ),
    }
    | prompt
    | llm.bind_functions(tools)
    | OpenAIFunctionsAgentOutputParser()
)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
agent_executor.invoke(
    {
        "input": "Who is the current US president? What's their home state? What's their home state's bird? What's that bird's scientific name?"
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `Wikipedia` with `List of presidents of the United States`


[0m[36;1m[1;3mPage: List of presidents of the United States
Summary: The president of the United States is the head of state and head of government of the United States, indirectly elected to a four-year term via the Electoral College. The officeholder leads the executive branch of the federal government and is the commander-in-chief of the United States Armed Forces. Since the office was established in 1789, 45 men have served in 46 presidencies. The first president, George Washington, won a unanimous vote of the Electoral College. Grover Cleveland served two non-consecutive terms and is therefore counted as the 22nd and 24th president of the United States, giving rise to the discrepancy between the number of presidencies and the number of individuals who have served as president. The incumbent president is Joe Biden.The presidency of William Henry Harrison, who died 31 days after taking office in 1841, was the shortest in American history. Franklin D. Roosevelt served the longest, over twelve years, before dying early in his fourth term in 1945. He is the only U.S. president to have served more than two terms. Since the ratification of the Twenty-second Amendment to the United States Constitution in 1951, no person may be elected president more than twice, and no one who has served more than two years of a term to which someone else was elected may be elected more than once.Four presidents died in office of natural causes (William Henry Harrison, Zachary Taylor, Warren G. Harding, and Franklin D. Roosevelt), four were assassinated (Abraham Lincoln, James A. Garfield, William McKinley, and John F. Kennedy), and one resigned (Richard Nixon, facing impeachment and removal from office). John Tyler was the first vice president to assume the presidency during a presidential term, and set the precedent that a vice president who does so becomes the fully functioning president with his presidency.Throughout most of its history, American politics has been dominated by political parties. The Constitution is silent on the issue of political parties, and at the time it came into force in 1789, no organized parties existed. Soon after the 1st Congress convened, political factions began rallying around dominant Washington administration officials, such as Alexander Hamilton and Thomas Jefferson. Concerned about the capacity of political parties to destroy the fragile unity holding the nation together, Washington remained unaffiliated with any political faction or party throughout his eight-year presidency. He was, and remains, the only U.S. president never affiliated with a political party.

Page: List of presidents of the United States by age
Summary: In this list of presidents of the United States by age, the first table charts the age of each president of the United States at the time of presidential inauguration (first inauguration if elected to multiple and consecutive terms), upon leaving office, and at the time of death. Where the president is still living, their lifespan and post-presidency timespan are calculated up to January 25, 2024.

Page: List of vice presidents of the United States
Summary: There have been 49 vice presidents of the United States since the office was created in 1789. Originally, the vice president was the person who received the second-most votes for president in the Electoral College. But after the election of 1800 produced a tie between Thomas Jefferson and Aaron Burr, requiring the House of Representatives to choose between them, lawmakers acted to prevent such a situation from recurring. The Twelfth Amendment was added to the Constitution in 1804, creating the current system where electors cast a separate ballot for the vice presidency.The vice president is the first person in the presidential line of succession—that is, they assume the presidency if the president dies, resigns, or is impeached and removed from office. Nine vice presidents have ascended to the presidency in this way: eight (John Tyler, Millard Fillmore, Andrew Johnson, Chester A. Arthur, Theodore Roosevelt, Calvin Coolidge, Harry S. Truman, and Lyndon B. Johnson) through the president's death and one (Gerald Ford) through the president's resignation. The vice president also serves as the president of the Senate and may choose to cast a tie-breaking vote on decisions made by the Senate. Vice presidents have exercised this latter power to varying extents over the years.Before adoption of the Twenty-fifth Amendment in 1967, an intra-term vacancy in the office of the vice president could not be filled until the next post-election inauguration. Several such vacancies occurred: seven vice presidents died, one resigned and eight succeeded to the presidency. This amendment allowed for a vacancy to be filled through appointment by the president and confirmation by both chambers of the Congress. Since its ratification, the vice presidency has been vacant twice (both in the context of scandals surrounding the Nixon administration) and was filled both times through this process, namely in 1973 following Spiro Agnew's resignation, and again in 1974 after Gerald Ford succeeded to the presidency. The amendment also established a procedure whereby a vice president may, if the president is unable to discharge the powers and duties of the office, temporarily assume the powers and duties of the office as acting president. Three vice presidents have briefly acted as president under the 25th Amendment: George H. W. Bush on July 13, 1985; Dick Cheney on June 29, 2002, and on July 21, 2007; and Kamala Harris on November 19, 2021.
The persons who have served as vice president were born in or primarily affiliated with 27 states plus the District of Columbia. New York has produced the most of any state as eight have been born there and three others considered it their home state. Most vice presidents have been in their 50s or 60s and had political experience before assuming the office. Two vice presidents—George Clinton and John C. Calhoun—served under more than one president. Ill with tuberculosis and recovering in Cuba on Inauguration Day in 1853, William R. King, by an Act of Congress, was allowed to take the oath outside the United States. He is the only vice president to take his oath of office in a foreign country.

Page: List of presidents of the United States by net worth
Summary: The list of presidents of the United States by net worth at peak varies greatly. Debt and depreciation often means that presidents' net worth is less than $0 at the time of death. Most presidents before 1845 were extremely wealthy, especially Andrew Jackson and George Washington.
Presidents since 1929, when Herbert Hoover took office, have generally been wealthier than presidents of the late nineteenth and early twentieth centuries; with the exception of Harry S. Truman, all presidents since this time have been millionaires. These presidents have often received income from autobiographies and other writing. Except for Franklin D. Roosevelt and John F. Kennedy (both of whom died while in office), all presidents beginning with Calvin Coolidge have written autobiographies. In addition, many presidents—including Bill Clinton—have earned considerable income from public speaking after leaving office.The richest president in history may be Donald Trump. However, his net worth is not precisely known because the Trump Organization is privately held.Truman was among the poorest U.S. presidents, with a net worth considerably less than $1 million. His financial situation contributed to the doubling of the presidential salary to $100,000 in 1949. In addition, the presidential pension was created in 1958 when Truman was again experiencing financial difficulties. Harry and Bess Truman received the first Medicare cards in 1966 via the Social Security Act of 1965.

Page: List of presidents of the United States by home state
Summary: These lists give the states of primary affiliation and of birth for each president of the United States.[0m[32;1m[1;3m
Invoking: `Wikipedia` with `Joe Biden`


[0m[36;1m[1;3mPage: Joe Biden
Summary: Joseph Robinette Biden Jr. (  BY-dən; born November 20, 1942) is an American politician who is the 46th and current president of the United States. A member of the Democratic Party, he previously served as the 47th vice president from 2009 to 2017 under President Barack Obama and represented Delaware in the United States Senate from 1973 to 2009.
Born in Scranton, Pennsylvania, Biden moved with his family to Delaware in 1953. He graduated from the University of Delaware before earning his law degree from Syracuse University. He was elected to the New Castle County Council in 1970 and to the U.S. Senate in 1972. As a senator, Biden drafted and led the effort to pass the Violent Crime Control and Law Enforcement Act and the Violence Against Women Act. He also oversaw six U.S. Supreme Court confirmation hearings, including the contentious hearings for Robert Bork and Clarence Thomas. Biden ran unsuccessfully for the Democratic presidential nomination in 1988 and 2008. In 2008, Obama chose Biden as his running mate, and he was a close counselor to Obama during his two terms as vice president. In the 2020 presidential election, Biden and his running mate, Kamala Harris, defeated incumbents Donald Trump and Mike Pence. He became the oldest president in U.S. history, and the first to have a female vice president.
As president, Biden signed the American Rescue Plan Act in response to the COVID-19 pandemic and subsequent recession. He signed bipartisan bills on infrastructure and manufacturing. He proposed the Build Back Better Act, which failed in Congress, but aspects of which were incorporated into the Inflation Reduction Act that he signed into law in 2022. Biden appointed Ketanji Brown Jackson to the Supreme Court. He worked with congressional Republicans to resolve the 2023 United States debt-ceiling crisis by negotiating a deal to raise the debt ceiling. In foreign policy, Biden restored America's membership in the Paris Agreement. He oversaw the complete withdrawal of U.S. troops from Afghanistan that ended the war in Afghanistan, during which the Afghan government collapsed and the Taliban seized control. He responded to the Russian invasion of Ukraine by imposing sanctions on Russia and authorizing civilian and military aid to Ukraine. During the Israel–Hamas war, Biden announced military support for Israel, and condemned the actions of Hamas and other Palestinian militants as terrorism. In April 2023, Biden announced his candidacy for the Democratic nomination in the 2024 presidential election.

Page: Presidency of Joe Biden
Summary: Joe Biden's tenure as the 46th president of the United States began with his inauguration on January 20, 2021. Biden, a Democrat from Delaware who previously served as vice president for two terms under president Barack Obama, took office following his victory in the 2020 presidential election over Republican incumbent president Donald Trump. Biden won the presidency with a popular vote of over 81 million, the highest number of votes cast for a single United States presidential candidate. Upon his inauguration, he became the oldest president in American history, breaking the record set by his predecessor Trump. Biden entered office amid the COVID-19 pandemic, an economic crisis, and increased political polarization.On the first day of his presidency, Biden made an effort to revert President Trump's energy policy by restoring U.S. participation in the Paris Agreement and revoking the permit for the Keystone XL pipeline. He also halted funding for Trump's border wall, an expansion of the Mexican border wall. On his second day, he issued a series of executive orders to reduce the impact of COVID-19, including invoking the Defense Production Act of 1950, and set an early goal of achieving one hundred million COVID-19 vaccinations in the United States in his first 100 days.Biden signed into law the American Rescue Plan Act of 2021; a $1.9 trillion stimulus bill that temporarily established expanded unemployment insurance and sent $1,400 stimulus checks to most Americans in response to continued economic pressure from COVID-19. He signed the bipartisan Infrastructure Investment and Jobs Act; a ten-year plan brokered by Biden alongside Democrats and Republicans in Congress, to invest in American roads, bridges, public transit, ports and broadband access. Biden signed the Juneteenth National Independence Day Act, making Juneteenth a federal holiday in the United States. He appointed Ketanji Brown Jackson to the U.S. Supreme Court—the first Black woman to serve on the court. After The Supreme Court overturned Roe v. Wade, Biden took executive actions, such as the signing of Executive Order 14076, to preserve and protect women's health rights nationwide, against abortion bans in Republican led states. Biden proposed a significant expansion of the U.S. social safety net through the Build Back Better Act, but those efforts, along with voting rights legislation, failed in Congress. However, in August 2022, Biden signed the Inflation Reduction Act of 2022, a domestic appropriations bill that included some of the provisions of the Build Back Better Act after the entire bill failed to pass. It included significant federal investment in climate and domestic clean energy production, tax credits for solar panels, electric cars and other home energy programs as well as a three-year extension of Affordable Care Act subsidies. The administration's economic policies, known as "Bidenomics", were inspired and designed by Trickle-up economics. Described as growing the economy from the middle out and bottom up and growing the middle class. Biden signed the CHIPS and Science Act, bolstering the semiconductor and manufacturing industry, the Honoring our PACT Act, expanding health care for US veterans, the Bipartisan Safer Communities Act and the Electoral Count Reform and Presidential Transition Improvement Act. In late 2022, Biden signed the Respect for Marriage Act, which repealed the Defense of Marriage Act and codified same-sex and interracial marriage in the United States. In response to the debt-ceiling crisis of 2023, Biden negotiated and signed the Fiscal Responsibility Act of 2023, which restrains federal spending for fiscal years 2024 and 2025, implements minor changes to SNAP and TANF, includes energy permitting reform, claws back some IRS funding and unspent money for COVID-19, and suspends the debt ceiling to January 1, 2025. Biden established the American Climate Corps and created the first ever White House Office of Gun Violence Prevention. On September 26, 2023, Joe Biden visited a United Auto Workers picket line during the 2023 United Auto Workers strike, making him the first US president to visit one.
The foreign policy goal of the Biden administration is to restore the US to a "position of trusted leadership" among global democracies in order to address the challenges posed by Russia and China. In foreign policy, Biden completed the withdrawal of U.S. military forces from Afghanistan, declaring an end to nation-building efforts and shifting U.S. foreign policy toward strategic competition with China and, to a lesser extent, Russia. However, during the withdrawal, the Afghan government collapsed and the Taliban seized control, leading to Biden receiving bipartisan criticism. He responded to the Russian invasion of Ukraine by imposing sanctions on Russia as well as providing Ukraine with over $100 billion in combined military, economic, and humanitarian aid. Biden also approved a raid which led to the death of Abu Ibrahim al-Hashimi al-Qurashi, the leader of the Islamic State, and approved a drone strike which killed Ayman Al Zawahiri, leader of Al-Qaeda. Biden signed and created AUKUS, an international security alliance, together with Australia and the United Kingdom. Biden called for the expansion of NATO with the addition of Finland and Sweden, and rallied NATO allies in support of Ukraine. During the 2023 Israel–Hamas war, Biden condemned Hamas and other Palestinian militants as terrorism and announced American military support for Israel; Biden also showed his support and sympathy towards Palestinians affected by the war, sent humanitarian aid, and brokered a four-day temporary pause and hostage exchange.

Page: Family of Joe Biden
Summary: Joe Biden, the 46th and current president of the United States, has family members who are prominent in law, education, activism and politics. Biden's immediate family became the first family of the United States on his inauguration on January 20, 2021. His immediate family circle was also the second family of the United States from 2009 to 2017, when Biden was vice president. Biden's family is mostly descended from the British Isles, with most of their ancestors coming from Ireland and England, and a smaller number descending from the French.Of Joe Biden's sixteen great-great-grandparents, ten were born in Ireland. He is descended from the Blewitts of County Mayo and the Finnegans of County Louth. One of Biden's great-great-great-grandfathers was born in Sussex, England, and emigrated to Maryland in the United States by 1820.

Page: Inauguration of Joe Biden
Summary: The inauguration of Joe Biden as the 46th president of the United States took place on Wednesday, January 20, 2021, marking the start of the four-year term of Joe Biden as president and Kamala Harris as vice president. The 59th presidential inauguration took place on the West Front of the United States Capitol in Washington, D.C. Biden took the presidential oath of office, before which Harris took the vice presidential oath of office.
The inauguration took place amidst extraordinary political, public health, economic, and national security crises, including the ongoing COVID-19 pandemic; outgoing President Donald Trump's attempts to overturn the 2020 United States presidential election, which provoked an attack on the United States Capitol on January 6; Trump'[0m[32;1m[1;3m
Invoking: `Wikipedia` with `Delaware`


[0m[36;1m[1;3mPage: Delaware
Summary: Delaware (  DEL-ə-wair) is a state in the northeast and Mid-Atlantic regions of the United States. It borders Maryland to its south and west, Pennsylvania to its north, New Jersey to its northeast, and the Atlantic Ocean to its east. The state's name derives from the adjacent Delaware Bay, which in turn was named after Thomas West, 3rd Baron De La Warr, an English nobleman and the Colony of Virginia's first colonial-era governor.Delaware occupies the northeastern portion of the Delmarva Peninsula, and some islands and territory within the Delaware River. It is the 2nd smallest and 6th least populous state, but also the 6th most densely populated. Delaware's most populous city is Wilmington, and the state's capital is Dover, the 2nd most populous city in Delaware. The state is divided into three counties, the fewest number of counties of any of the 50 U.S. states; from north to south, the three counties are: New Castle County, Kent County, and Sussex County.
The southern two counties, Kent and Sussex counties, historically have been predominantly agrarian economies. New Castle is more urbanized and is considered part of the Delaware Valley metropolitan statistical area that surrounds and includes Philadelphia, the nation's 6th most populous city. Delaware is considered part of the Southern United States by the U.S. Census Bureau, but the state's geography, culture, and history are a hybrid of the Mid-Atlantic and Northeastern regions of the country.Before Delaware coastline was explored and developed by Europeans in the 16th century, the state was inhabited by several Native Americans tribes, including the Lenape in the north and Nanticoke in the south. The state was first colonized by Dutch traders at Zwaanendael, near present-day Lewes, Delaware, in 1631.
Delaware was one of the Thirteen Colonies that participated in the American Revolution and American Revolutionary War, in which the American Continental Army, led by George Washington, defeated the British, ended British colonization and establishing the United States as a sovereign and independent nation.
On December 7, 1787, Delaware was the first state to ratify the Constitution of the United States, earning it the nickname "The First State".Since the turn of the 20th century, Delaware has become an onshore corporate haven whose corporate laws are deemed appealing to corporations; over half of all New York Stock Exchange-listed corporations and over three-fifths of the Fortune 500 is legally incorporated in the state.

Page: Delaware City, Delaware
Summary: Delaware City is a city in New Castle County, Delaware, United States. The population was 1,885 as of 2020. It is a small port town on the eastern terminus of the Chesapeake and Delaware Canal and is the location of the Forts Ferry Crossing to Fort Delaware on Pea Patch Island.

Page: Delaware River
Summary: The Delaware River is a major river in the Mid-Atlantic region of the United States and is the longest free-flowing (undammed) river in the Eastern United States. From the meeting of its branches in Hancock, New York, the river flows for 282 miles (454 km) along the borders of New York, Pennsylvania, New Jersey, and Delaware, before emptying into Delaware Bay.
The river has been recognized by the National Wildlife Federation as one of the country's Great Waters and has been called the "Lifeblood of the Northeast" by American Rivers. Its watershed drains an area of 13,539 square miles (35,070 km2) and provides drinking water for 17 million people, including half of New York City via the Delaware Aqueduct.
The Delaware River has two branches that rise in the Catskill Mountains of New York: the West Branch at Mount Jefferson in Jefferson, Schoharie County, and the East Branch at Grand Gorge, Delaware County. The branches merge to form the main Delaware River at Hancock, New York. Flowing south, the river remains relatively undeveloped, with 152 miles (245 km) protected as the Upper, Middle, and Lower Delaware National Scenic Rivers. At Trenton, New Jersey, the Delaware becomes tidal, navigable, and significantly more industrial. This section forms the backbone of the Delaware Valley metropolitan area, serving the port cities of Philadelphia, Camden, New Jersey, and Wilmington, Delaware. The river flows into Delaware Bay at Liston Point, 48 miles (77 km) upstream of the bay's outlet to the Atlantic Ocean between Cape May and Cape Henlopen.
Before the arrival of European settlers, the river was the homeland of the Lenape native people. They called the river Lenapewihittuk, or Lenape River, and Kithanne, meaning the largest river in this part of the country.In 1609, the river was visited by a Dutch East India Company expedition led by Henry Hudson. Hudson, an English navigator, was hired to find a western route to Cathay (China), but his encounters set the stage for Dutch colonization of North America in the 17th century. Early Dutch and Swedish settlements were established along the lower section of the river and Delaware Bay. Both colonial powers called the river the South River (Zuidrivier), compared to the Hudson River, which was known as the North River. After the English expelled the Dutch and took control of the New Netherland colony in 1664, the river was renamed Delaware after Sir Thomas West, 3rd Baron De La Warr, an English nobleman and the Virginia colony's first royal governor, who defended the colony during the First Anglo-Powhatan War.

Page: University of Delaware
Summary: The University of Delaware (colloquially known as UD or Delaware) is a privately governed, state-assisted land-grant research university located in Newark, Delaware. UD is the largest university in Delaware. It offers three associate's programs, 148 bachelor's programs, 121 master's programs (with 13 joint degrees), and 55 doctoral programs across its eight colleges. The main campus is in Newark, with satellite campuses in Dover, Wilmington, Lewes, and Georgetown. It is considered a large institution with approximately 18,200 undergraduate and 4,200 graduate students. It is a privately governed university which receives public funding for being a land-grant, sea-grant, and space-grant state-supported research institution.UD is classified among "R1: Doctoral Universities – Very high research activity". According to the National Science Foundation, UD spent $186 million on research and development in 2018, ranking it 119th in the nation.  It is recognized with the Community Engagement Classification by the Carnegie Foundation for the Advancement of Teaching.UD students, alumni, and sports teams are known as the "Fightin' Blue Hens", more commonly shortened to "Blue Hens", and the school colors are Delaware blue and gold. UD sponsors 21 men's and women's NCAA Division-I sports teams and have competed in the Colonial Athletic Association (CAA) since 2001.



Page: Lenape
Summary: The Lenape (English: , , ; Lenape languages: [lənaːpe]), also called the Lenni Lenape and Delaware people, are an Indigenous people of the Northeastern Woodlands, who live in the United States and Canada.The Lenape's historical territory includes present-day northeastern Delaware, all of New Jersey, the eastern Pennsylvania regions of the Lehigh Valley and Northeastern Pennsylvania, and New York Bay, western Long Island, and the lower Hudson Valley in New York state. Today they are based in Oklahoma, Wisconsin, and Ontario.
During the last decades of the 18th century, European settlers and the effects of the American Revolutionary War displaced most Lenape from their homelands and pushed them north and west. In the 1860s, under the Indian removal policy, the U.S. federal government relocated most Lenape remaining in the Eastern United States to the Indian Territory and surrounding regions. Lenape people currently belong to the Delaware Nation and Delaware Tribe of Indians in Oklahoma, the Stockbridge–Munsee Community in Wisconsin, and the Munsee-Delaware Nation, Moravian of the Thames First Nation, and Delaware of Six Nations in Ontario.

[0m
```

```output
---------------------------------------------------------------------------

BadRequestError                           Traceback (most recent call last)

Cell In[11], line 14
      1 agent = (
      2     {
      3         "input": itemgetter("input"),
   (...)
     10     | OpenAIFunctionsAgentOutputParser()
     11 )
     13 agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
---> 14 agent_executor.invoke(
     15     {
     16         "input": "Who is the current US president? What's their home state? What's their home state's bird? What's that bird's scientific name?"
     17     }
     18 )

File ~/langchain/libs/langchain/langchain/chains/base.py:162, in Chain.invoke(self, input, config, **kwargs)
    160 except BaseException as e:
    161     run_manager.on_chain_error(e)
--> 162     raise e
    163 run_manager.on_chain_end(outputs)
    164 final_outputs: Dict[str, Any] = self.prep_outputs(
    165     inputs, outputs, return_only_outputs
    166 )

File ~/langchain/libs/langchain/langchain/chains/base.py:156, in Chain.invoke(self, input, config, **kwargs)
    149 run_manager = callback_manager.on_chain_start(
    150     dumpd(self),
    151     inputs,
    152     name=run_name,
    153 )
    154 try:
    155     outputs = (
--> 156         self._call(inputs, run_manager=run_manager)
    157         if new_arg_supported
    158         else self._call(inputs)
    159     )
    160 except BaseException as e:
    161     run_manager.on_chain_error(e)

File ~/langchain/libs/langchain/langchain/agents/agent.py:1391, in AgentExecutor._call(self, inputs, run_manager)
   1389 # We now enter the agent loop (until it returns something).
   1390 while self._should_continue(iterations, time_elapsed):
-> 1391     next_step_output = self._take_next_step(
   1392         name_to_tool_map,
   1393         color_mapping,
   1394         inputs,
   1395         intermediate_steps,
   1396         run_manager=run_manager,
   1397     )
   1398     if isinstance(next_step_output, AgentFinish):
   1399         return self._return(
   1400             next_step_output, intermediate_steps, run_manager=run_manager
   1401         )

File ~/langchain/libs/langchain/langchain/agents/agent.py:1097, in AgentExecutor._take_next_step(self, name_to_tool_map, color_mapping, inputs, intermediate_steps, run_manager)
   1088 def _take_next_step(
   1089     self,
   1090     name_to_tool_map: Dict[str, BaseTool],
   (...)
   1094     run_manager: Optional[CallbackManagerForChainRun] = None,
   1095 ) -> Union[AgentFinish, List[Tuple[AgentAction, str]]]:
   1096     return self._consume_next_step(
-> 1097         [
   1098             a
   1099             for a in self._iter_next_step(
   1100                 name_to_tool_map,
   1101                 color_mapping,
   1102                 inputs,
   1103                 intermediate_steps,
   1104                 run_manager,
   1105             )
   1106         ]
   1107     )

File ~/langchain/libs/langchain/langchain/agents/agent.py:1097, in <listcomp>(.0)
   1088 def _take_next_step(
   1089     self,
   1090     name_to_tool_map: Dict[str, BaseTool],
   (...)
   1094     run_manager: Optional[CallbackManagerForChainRun] = None,
   1095 ) -> Union[AgentFinish, List[Tuple[AgentAction, str]]]:
   1096     return self._consume_next_step(
-> 1097         [
   1098             a
   1099             for a in self._iter_next_step(
   1100                 name_to_tool_map,
   1101                 color_mapping,
   1102                 inputs,
   1103                 intermediate_steps,
   1104                 run_manager,
   1105             )
   1106         ]
   1107     )

File ~/langchain/libs/langchain/langchain/agents/agent.py:1125, in AgentExecutor._iter_next_step(self, name_to_tool_map, color_mapping, inputs, intermediate_steps, run_manager)
   1122     intermediate_steps = self._prepare_intermediate_steps(intermediate_steps)
   1124     # Call the LLM to see what to do.
-> 1125     output = self.agent.plan(
   1126         intermediate_steps,
   1127         callbacks=run_manager.get_child() if run_manager else None,
   1128         **inputs,
   1129     )
   1130 except OutputParserException as e:
   1131     if isinstance(self.handle_parsing_errors, bool):

File ~/langchain/libs/langchain/langchain/agents/agent.py:387, in RunnableAgent.plan(self, intermediate_steps, callbacks, **kwargs)
    381 # Use streaming to make sure that the underlying LLM is invoked in a streaming
    382 # fashion to make it possible to get access to the individual LLM tokens
    383 # when using stream_log with the Agent Executor.
    384 # Because the response from the plan is not a generator, we need to
    385 # accumulate the output into final output and return that.
    386 final_output: Any = None
--> 387 for chunk in self.runnable.stream(inputs, config={"callbacks": callbacks}):
    388     if final_output is None:
    389         final_output = chunk

File ~/langchain/libs/core/langchain_core/runnables/base.py:2424, in RunnableSequence.stream(self, input, config, **kwargs)
   2418 def stream(
   2419     self,
   2420     input: Input,
   2421     config: Optional[RunnableConfig] = None,
   2422     **kwargs: Optional[Any],
   2423 ) -> Iterator[Output]:
-> 2424     yield from self.transform(iter([input]), config, **kwargs)

File ~/langchain/libs/core/langchain_core/runnables/base.py:2411, in RunnableSequence.transform(self, input, config, **kwargs)
   2405 def transform(
   2406     self,
   2407     input: Iterator[Input],
   2408     config: Optional[RunnableConfig] = None,
   2409     **kwargs: Optional[Any],
   2410 ) -> Iterator[Output]:
-> 2411     yield from self._transform_stream_with_config(
   2412         input,
   2413         self._transform,
   2414         patch_config(config, run_name=(config or {}).get("run_name") or self.name),
   2415         **kwargs,
   2416     )

File ~/langchain/libs/core/langchain_core/runnables/base.py:1497, in Runnable._transform_stream_with_config(self, input, transformer, config, run_type, **kwargs)
   1495 try:
   1496     while True:
-> 1497         chunk: Output = context.run(next, iterator)  # type: ignore
   1498         yield chunk
   1499         if final_output_supported:

File ~/langchain/libs/core/langchain_core/runnables/base.py:2375, in RunnableSequence._transform(self, input, run_manager, config)
   2366 for step in steps:
   2367     final_pipeline = step.transform(
   2368         final_pipeline,
   2369         patch_config(
   (...)
   2372         ),
   2373     )
-> 2375 for output in final_pipeline:
   2376     yield output

File ~/langchain/libs/core/langchain_core/runnables/base.py:1035, in Runnable.transform(self, input, config, **kwargs)
   1032 final: Input
   1033 got_first_val = False
-> 1035 for chunk in input:
   1036     if not got_first_val:
   1037         final = chunk

File ~/langchain/libs/core/langchain_core/runnables/base.py:3991, in RunnableBindingBase.transform(self, input, config, **kwargs)
   3985 def transform(
   3986     self,
   3987     input: Iterator[Input],
   3988     config: Optional[RunnableConfig] = None,
   3989     **kwargs: Any,
   3990 ) -> Iterator[Output]:
-> 3991     yield from self.bound.transform(
   3992         input,
   3993         self._merge_configs(config),
   3994         **{**self.kwargs, **kwargs},
   3995     )

File ~/langchain/libs/core/langchain_core/runnables/base.py:1045, in Runnable.transform(self, input, config, **kwargs)
   1042         final = final + chunk  # type: ignore[operator]
   1044 if got_first_val:
-> 1045     yield from self.stream(final, config, **kwargs)

File ~/langchain/libs/core/langchain_core/language_models/chat_models.py:249, in BaseChatModel.stream(self, input, config, stop, **kwargs)
    242 except BaseException as e:
    243     run_manager.on_llm_error(
    244         e,
    245         response=LLMResult(
    246             generations=[[generation]] if generation else []
    247         ),
    248     )
--> 249     raise e
    250 else:
    251     run_manager.on_llm_end(LLMResult(generations=[[generation]]))

File ~/langchain/libs/core/langchain_core/language_models/chat_models.py:233, in BaseChatModel.stream(self, input, config, stop, **kwargs)
    231 generation: Optional[ChatGenerationChunk] = None
    232 try:
--> 233     for chunk in self._stream(
    234         messages, stop=stop, run_manager=run_manager, **kwargs
    235     ):
    236         yield chunk.message
    237         if generation is None:

File ~/langchain/libs/partners/openai/langchain_openai/chat_models/base.py:403, in ChatOpenAI._stream(self, messages, stop, run_manager, **kwargs)
    400 params = {**params, **kwargs, "stream": True}
    402 default_chunk_class = AIMessageChunk
--> 403 for chunk in self.client.create(messages=message_dicts, **params):
    404     if not isinstance(chunk, dict):
    405         chunk = chunk.dict()

File ~/langchain/.venv/lib/python3.9/site-packages/openai/_utils/_utils.py:271, in required_args.<locals>.inner.<locals>.wrapper(*args, **kwargs)
    269             msg = f"Missing required argument: {quote(missing[0])}"
    270     raise TypeError(msg)
--> 271 return func(*args, **kwargs)

File ~/langchain/.venv/lib/python3.9/site-packages/openai/resources/chat/completions.py:648, in Completions.create(self, messages, model, frequency_penalty, function_call, functions, logit_bias, logprobs, max_tokens, n, presence_penalty, response_format, seed, stop, stream, temperature, tool_choice, tools, top_logprobs, top_p, user, extra_headers, extra_query, extra_body, timeout)
    599 @required_args(["messages", "model"], ["messages", "model", "stream"])
    600 def create(
    601     self,
   (...)
    646     timeout: float | httpx.Timeout | None | NotGiven = NOT_GIVEN,
    647 ) -> ChatCompletion | Stream[ChatCompletionChunk]:
--> 648     return self._post(
    649         "/chat/completions",
    650         body=maybe_transform(
    651             {
    652                 "messages": messages,
    653                 "model": model,
    654                 "frequency_penalty": frequency_penalty,
    655                 "function_call": function_call,
    656                 "functions": functions,
    657                 "logit_bias": logit_bias,
    658                 "logprobs": logprobs,
    659                 "max_tokens": max_tokens,
    660                 "n": n,
    661                 "presence_penalty": presence_penalty,
    662                 "response_format": response_format,
    663                 "seed": seed,
    664                 "stop": stop,
    665                 "stream": stream,
    666                 "temperature": temperature,
    667                 "tool_choice": tool_choice,
    668                 "tools": tools,
    669                 "top_logprobs": top_logprobs,
    670                 "top_p": top_p,
    671                 "user": user,
    672             },
    673             completion_create_params.CompletionCreateParams,
    674         ),
    675         options=make_request_options(
    676             extra_headers=extra_headers, extra_query=extra_query, extra_body=extra_body, timeout=timeout
    677         ),
    678         cast_to=ChatCompletion,
    679         stream=stream or False,
    680         stream_cls=Stream[ChatCompletionChunk],
    681     )

File ~/langchain/.venv/lib/python3.9/site-packages/openai/_base_client.py:1179, in SyncAPIClient.post(self, path, cast_to, body, options, files, stream, stream_cls)
   1165 def post(
   1166     self,
   1167     path: str,
   (...)
   1174     stream_cls: type[_StreamT] | None = None,
   1175 ) -> ResponseT | _StreamT:
   1176     opts = FinalRequestOptions.construct(
   1177         method="post", url=path, json_data=body, files=to_httpx_files(files), **options
   1178     )
-> 1179     return cast(ResponseT, self.request(cast_to, opts, stream=stream, stream_cls=stream_cls))

File ~/langchain/.venv/lib/python3.9/site-packages/openai/_base_client.py:868, in SyncAPIClient.request(self, cast_to, options, remaining_retries, stream, stream_cls)
    859 def request(
    860     self,
    861     cast_to: Type[ResponseT],
   (...)
    866     stream_cls: type[_StreamT] | None = None,
    867 ) -> ResponseT | _StreamT:
--> 868     return self._request(
    869         cast_to=cast_to,
    870         options=options,
    871         stream=stream,
    872         stream_cls=stream_cls,
    873         remaining_retries=remaining_retries,
    874     )

File ~/langchain/.venv/lib/python3.9/site-packages/openai/_base_client.py:959, in SyncAPIClient._request(self, cast_to, options, remaining_retries, stream, stream_cls)
    956         err.response.read()
    958     log.debug("Re-raising status error")
--> 959     raise self._make_status_error_from_response(err.response) from None
    961 return self._process_response(
    962     cast_to=cast_to,
    963     options=options,
   (...)
    966     stream_cls=stream_cls,
    967 )

BadRequestError: Error code: 400 - {'error': {'message': "This model's maximum context length is 4097 tokens. However, your messages resulted in 5487 tokens (5419 in the messages, 68 in the functions). Please reduce the length of the messages or functions.", 'type': 'invalid_request_error', 'param': 'messages', 'code': 'context_length_exceeded'}}
```

:::tip

[LangSmith trace](https://smith.langchain.com/public/60909eae-f4f1-43eb-9f96-354f5176f66f/r)

:::

残念ながら、最終的な答えを得る前にモデルのコンテキストウィンドウの容量が尽きてしまいます。では、プロンプト処理ロジックを追加してみましょう。シンプルに保つため、メッセージのトークン数が多すぎる場合は、チャット履歴の中で最も古いAI、Functionメッセージペア(モデルツール呼び出しメッセージとその後のツール出力メッセージ)から削除していきます。

```python
def condense_prompt(prompt: ChatPromptValue) -> ChatPromptValue:
    messages = prompt.to_messages()
    num_tokens = llm.get_num_tokens_from_messages(messages)
    ai_function_messages = messages[2:]
    while num_tokens > 4_000:
        ai_function_messages = ai_function_messages[2:]
        num_tokens = llm.get_num_tokens_from_messages(
            messages[:2] + ai_function_messages
        )
    messages = messages[:2] + ai_function_messages
    return ChatPromptValue(messages=messages)


agent = (
    {
        "input": itemgetter("input"),
        "agent_scratchpad": lambda x: format_to_openai_function_messages(
            x["intermediate_steps"]
        ),
    }
    | prompt
    | condense_prompt
    | llm.bind_functions(tools)
    | OpenAIFunctionsAgentOutputParser()
)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
agent_executor.invoke(
    {
        "input": "Who is the current US president? What's their home state? What's their home state's bird? What's that bird's scientific name?"
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `Wikipedia` with `List of presidents of the United States`


[0m[36;1m[1;3mPage: List of presidents of the United States
Summary: The president of the United States is the head of state and head of government of the United States, indirectly elected to a four-year term via the Electoral College. The officeholder leads the executive branch of the federal government and is the commander-in-chief of the United States Armed Forces. Since the office was established in 1789, 45 men have served in 46 presidencies. The first president, George Washington, won a unanimous vote of the Electoral College. Grover Cleveland served two non-consecutive terms and is therefore counted as the 22nd and 24th president of the United States, giving rise to the discrepancy between the number of presidencies and the number of individuals who have served as president. The incumbent president is Joe Biden.The presidency of William Henry Harrison, who died 31 days after taking office in 1841, was the shortest in American history. Franklin D. Roosevelt served the longest, over twelve years, before dying early in his fourth term in 1945. He is the only U.S. president to have served more than two terms. Since the ratification of the Twenty-second Amendment to the United States Constitution in 1951, no person may be elected president more than twice, and no one who has served more than two years of a term to which someone else was elected may be elected more than once.Four presidents died in office of natural causes (William Henry Harrison, Zachary Taylor, Warren G. Harding, and Franklin D. Roosevelt), four were assassinated (Abraham Lincoln, James A. Garfield, William McKinley, and John F. Kennedy), and one resigned (Richard Nixon, facing impeachment and removal from office). John Tyler was the first vice president to assume the presidency during a presidential term, and set the precedent that a vice president who does so becomes the fully functioning president with his presidency.Throughout most of its history, American politics has been dominated by political parties. The Constitution is silent on the issue of political parties, and at the time it came into force in 1789, no organized parties existed. Soon after the 1st Congress convened, political factions began rallying around dominant Washington administration officials, such as Alexander Hamilton and Thomas Jefferson. Concerned about the capacity of political parties to destroy the fragile unity holding the nation together, Washington remained unaffiliated with any political faction or party throughout his eight-year presidency. He was, and remains, the only U.S. president never affiliated with a political party.

Page: List of presidents of the United States by age
Summary: In this list of presidents of the United States by age, the first table charts the age of each president of the United States at the time of presidential inauguration (first inauguration if elected to multiple and consecutive terms), upon leaving office, and at the time of death. Where the president is still living, their lifespan and post-presidency timespan are calculated up to January 25, 2024.

Page: List of vice presidents of the United States
Summary: There have been 49 vice presidents of the United States since the office was created in 1789. Originally, the vice president was the person who received the second-most votes for president in the Electoral College. But after the election of 1800 produced a tie between Thomas Jefferson and Aaron Burr, requiring the House of Representatives to choose between them, lawmakers acted to prevent such a situation from recurring. The Twelfth Amendment was added to the Constitution in 1804, creating the current system where electors cast a separate ballot for the vice presidency.The vice president is the first person in the presidential line of succession—that is, they assume the presidency if the president dies, resigns, or is impeached and removed from office. Nine vice presidents have ascended to the presidency in this way: eight (John Tyler, Millard Fillmore, Andrew Johnson, Chester A. Arthur, Theodore Roosevelt, Calvin Coolidge, Harry S. Truman, and Lyndon B. Johnson) through the president's death and one (Gerald Ford) through the president's resignation. The vice president also serves as the president of the Senate and may choose to cast a tie-breaking vote on decisions made by the Senate. Vice presidents have exercised this latter power to varying extents over the years.Before adoption of the Twenty-fifth Amendment in 1967, an intra-term vacancy in the office of the vice president could not be filled until the next post-election inauguration. Several such vacancies occurred: seven vice presidents died, one resigned and eight succeeded to the presidency. This amendment allowed for a vacancy to be filled through appointment by the president and confirmation by both chambers of the Congress. Since its ratification, the vice presidency has been vacant twice (both in the context of scandals surrounding the Nixon administration) and was filled both times through this process, namely in 1973 following Spiro Agnew's resignation, and again in 1974 after Gerald Ford succeeded to the presidency. The amendment also established a procedure whereby a vice president may, if the president is unable to discharge the powers and duties of the office, temporarily assume the powers and duties of the office as acting president. Three vice presidents have briefly acted as president under the 25th Amendment: George H. W. Bush on July 13, 1985; Dick Cheney on June 29, 2002, and on July 21, 2007; and Kamala Harris on November 19, 2021.
The persons who have served as vice president were born in or primarily affiliated with 27 states plus the District of Columbia. New York has produced the most of any state as eight have been born there and three others considered it their home state. Most vice presidents have been in their 50s or 60s and had political experience before assuming the office. Two vice presidents—George Clinton and John C. Calhoun—served under more than one president. Ill with tuberculosis and recovering in Cuba on Inauguration Day in 1853, William R. King, by an Act of Congress, was allowed to take the oath outside the United States. He is the only vice president to take his oath of office in a foreign country.

Page: List of presidents of the United States by net worth
Summary: The list of presidents of the United States by net worth at peak varies greatly. Debt and depreciation often means that presidents' net worth is less than $0 at the time of death. Most presidents before 1845 were extremely wealthy, especially Andrew Jackson and George Washington.
Presidents since 1929, when Herbert Hoover took office, have generally been wealthier than presidents of the late nineteenth and early twentieth centuries; with the exception of Harry S. Truman, all presidents since this time have been millionaires. These presidents have often received income from autobiographies and other writing. Except for Franklin D. Roosevelt and John F. Kennedy (both of whom died while in office), all presidents beginning with Calvin Coolidge have written autobiographies. In addition, many presidents—including Bill Clinton—have earned considerable income from public speaking after leaving office.The richest president in history may be Donald Trump. However, his net worth is not precisely known because the Trump Organization is privately held.Truman was among the poorest U.S. presidents, with a net worth considerably less than $1 million. His financial situation contributed to the doubling of the presidential salary to $100,000 in 1949. In addition, the presidential pension was created in 1958 when Truman was again experiencing financial difficulties. Harry and Bess Truman received the first Medicare cards in 1966 via the Social Security Act of 1965.

Page: List of presidents of the United States by home state
Summary: These lists give the states of primary affiliation and of birth for each president of the United States.[0m[32;1m[1;3m
Invoking: `Wikipedia` with `Joe Biden`


[0m[36;1m[1;3mPage: Joe Biden
Summary: Joseph Robinette Biden Jr. (  BY-dən; born November 20, 1942) is an American politician who is the 46th and current president of the United States. A member of the Democratic Party, he previously served as the 47th vice president from 2009 to 2017 under President Barack Obama and represented Delaware in the United States Senate from 1973 to 2009.
Born in Scranton, Pennsylvania, Biden moved with his family to Delaware in 1953. He graduated from the University of Delaware before earning his law degree from Syracuse University. He was elected to the New Castle County Council in 1970 and to the U.S. Senate in 1972. As a senator, Biden drafted and led the effort to pass the Violent Crime Control and Law Enforcement Act and the Violence Against Women Act. He also oversaw six U.S. Supreme Court confirmation hearings, including the contentious hearings for Robert Bork and Clarence Thomas. Biden ran unsuccessfully for the Democratic presidential nomination in 1988 and 2008. In 2008, Obama chose Biden as his running mate, and he was a close counselor to Obama during his two terms as vice president. In the 2020 presidential election, Biden and his running mate, Kamala Harris, defeated incumbents Donald Trump and Mike Pence. He became the oldest president in U.S. history, and the first to have a female vice president.
As president, Biden signed the American Rescue Plan Act in response to the COVID-19 pandemic and subsequent recession. He signed bipartisan bills on infrastructure and manufacturing. He proposed the Build Back Better Act, which failed in Congress, but aspects of which were incorporated into the Inflation Reduction Act that he signed into law in 2022. Biden appointed Ketanji Brown Jackson to the Supreme Court. He worked with congressional Republicans to resolve the 2023 United States debt-ceiling crisis by negotiating a deal to raise the debt ceiling. In foreign policy, Biden restored America's membership in the Paris Agreement. He oversaw the complete withdrawal of U.S. troops from Afghanistan that ended the war in Afghanistan, during which the Afghan government collapsed and the Taliban seized control. He responded to the Russian invasion of Ukraine by imposing sanctions on Russia and authorizing civilian and military aid to Ukraine. During the Israel–Hamas war, Biden announced military support for Israel, and condemned the actions of Hamas and other Palestinian militants as terrorism. In April 2023, Biden announced his candidacy for the Democratic nomination in the 2024 presidential election.

Page: Presidency of Joe Biden
Summary: Joe Biden's tenure as the 46th president of the United States began with his inauguration on January 20, 2021. Biden, a Democrat from Delaware who previously served as vice president for two terms under president Barack Obama, took office following his victory in the 2020 presidential election over Republican incumbent president Donald Trump. Biden won the presidency with a popular vote of over 81 million, the highest number of votes cast for a single United States presidential candidate. Upon his inauguration, he became the oldest president in American history, breaking the record set by his predecessor Trump. Biden entered office amid the COVID-19 pandemic, an economic crisis, and increased political polarization.On the first day of his presidency, Biden made an effort to revert President Trump's energy policy by restoring U.S. participation in the Paris Agreement and revoking the permit for the Keystone XL pipeline. He also halted funding for Trump's border wall, an expansion of the Mexican border wall. On his second day, he issued a series of executive orders to reduce the impact of COVID-19, including invoking the Defense Production Act of 1950, and set an early goal of achieving one hundred million COVID-19 vaccinations in the United States in his first 100 days.Biden signed into law the American Rescue Plan Act of 2021; a $1.9 trillion stimulus bill that temporarily established expanded unemployment insurance and sent $1,400 stimulus checks to most Americans in response to continued economic pressure from COVID-19. He signed the bipartisan Infrastructure Investment and Jobs Act; a ten-year plan brokered by Biden alongside Democrats and Republicans in Congress, to invest in American roads, bridges, public transit, ports and broadband access. Biden signed the Juneteenth National Independence Day Act, making Juneteenth a federal holiday in the United States. He appointed Ketanji Brown Jackson to the U.S. Supreme Court—the first Black woman to serve on the court. After The Supreme Court overturned Roe v. Wade, Biden took executive actions, such as the signing of Executive Order 14076, to preserve and protect women's health rights nationwide, against abortion bans in Republican led states. Biden proposed a significant expansion of the U.S. social safety net through the Build Back Better Act, but those efforts, along with voting rights legislation, failed in Congress. However, in August 2022, Biden signed the Inflation Reduction Act of 2022, a domestic appropriations bill that included some of the provisions of the Build Back Better Act after the entire bill failed to pass. It included significant federal investment in climate and domestic clean energy production, tax credits for solar panels, electric cars and other home energy programs as well as a three-year extension of Affordable Care Act subsidies. The administration's economic policies, known as "Bidenomics", were inspired and designed by Trickle-up economics. Described as growing the economy from the middle out and bottom up and growing the middle class. Biden signed the CHIPS and Science Act, bolstering the semiconductor and manufacturing industry, the Honoring our PACT Act, expanding health care for US veterans, the Bipartisan Safer Communities Act and the Electoral Count Reform and Presidential Transition Improvement Act. In late 2022, Biden signed the Respect for Marriage Act, which repealed the Defense of Marriage Act and codified same-sex and interracial marriage in the United States. In response to the debt-ceiling crisis of 2023, Biden negotiated and signed the Fiscal Responsibility Act of 2023, which restrains federal spending for fiscal years 2024 and 2025, implements minor changes to SNAP and TANF, includes energy permitting reform, claws back some IRS funding and unspent money for COVID-19, and suspends the debt ceiling to January 1, 2025. Biden established the American Climate Corps and created the first ever White House Office of Gun Violence Prevention. On September 26, 2023, Joe Biden visited a United Auto Workers picket line during the 2023 United Auto Workers strike, making him the first US president to visit one.
The foreign policy goal of the Biden administration is to restore the US to a "position of trusted leadership" among global democracies in order to address the challenges posed by Russia and China. In foreign policy, Biden completed the withdrawal of U.S. military forces from Afghanistan, declaring an end to nation-building efforts and shifting U.S. foreign policy toward strategic competition with China and, to a lesser extent, Russia. However, during the withdrawal, the Afghan government collapsed and the Taliban seized control, leading to Biden receiving bipartisan criticism. He responded to the Russian invasion of Ukraine by imposing sanctions on Russia as well as providing Ukraine with over $100 billion in combined military, economic, and humanitarian aid. Biden also approved a raid which led to the death of Abu Ibrahim al-Hashimi al-Qurashi, the leader of the Islamic State, and approved a drone strike which killed Ayman Al Zawahiri, leader of Al-Qaeda. Biden signed and created AUKUS, an international security alliance, together with Australia and the United Kingdom. Biden called for the expansion of NATO with the addition of Finland and Sweden, and rallied NATO allies in support of Ukraine. During the 2023 Israel–Hamas war, Biden condemned Hamas and other Palestinian militants as terrorism and announced American military support for Israel; Biden also showed his support and sympathy towards Palestinians affected by the war, sent humanitarian aid, and brokered a four-day temporary pause and hostage exchange.

Page: Family of Joe Biden
Summary: Joe Biden, the 46th and current president of the United States, has family members who are prominent in law, education, activism and politics. Biden's immediate family became the first family of the United States on his inauguration on January 20, 2021. His immediate family circle was also the second family of the United States from 2009 to 2017, when Biden was vice president. Biden's family is mostly descended from the British Isles, with most of their ancestors coming from Ireland and England, and a smaller number descending from the French.Of Joe Biden's sixteen great-great-grandparents, ten were born in Ireland. He is descended from the Blewitts of County Mayo and the Finnegans of County Louth. One of Biden's great-great-great-grandfathers was born in Sussex, England, and emigrated to Maryland in the United States by 1820.

Page: Inauguration of Joe Biden
Summary: The inauguration of Joe Biden as the 46th president of the United States took place on Wednesday, January 20, 2021, marking the start of the four-year term of Joe Biden as president and Kamala Harris as vice president. The 59th presidential inauguration took place on the West Front of the United States Capitol in Washington, D.C. Biden took the presidential oath of office, before which Harris took the vice presidential oath of office.
The inauguration took place amidst extraordinary political, public health, economic, and national security crises, including the ongoing COVID-19 pandemic; outgoing President Donald Trump's attempts to overturn the 2020 United States presidential election, which provoked an attack on the United States Capitol on January 6; Trump'[0m[32;1m[1;3m
Invoking: `Wikipedia` with `Delaware`


[0m[36;1m[1;3mPage: Delaware
Summary: Delaware (  DEL-ə-wair) is a state in the northeast and Mid-Atlantic regions of the United States. It borders Maryland to its south and west, Pennsylvania to its north, New Jersey to its northeast, and the Atlantic Ocean to its east. The state's name derives from the adjacent Delaware Bay, which in turn was named after Thomas West, 3rd Baron De La Warr, an English nobleman and the Colony of Virginia's first colonial-era governor.Delaware occupies the northeastern portion of the Delmarva Peninsula, and some islands and territory within the Delaware River. It is the 2nd smallest and 6th least populous state, but also the 6th most densely populated. Delaware's most populous city is Wilmington, and the state's capital is Dover, the 2nd most populous city in Delaware. The state is divided into three counties, the fewest number of counties of any of the 50 U.S. states; from north to south, the three counties are: New Castle County, Kent County, and Sussex County.
The southern two counties, Kent and Sussex counties, historically have been predominantly agrarian economies. New Castle is more urbanized and is considered part of the Delaware Valley metropolitan statistical area that surrounds and includes Philadelphia, the nation's 6th most populous city. Delaware is considered part of the Southern United States by the U.S. Census Bureau, but the state's geography, culture, and history are a hybrid of the Mid-Atlantic and Northeastern regions of the country.Before Delaware coastline was explored and developed by Europeans in the 16th century, the state was inhabited by several Native Americans tribes, including the Lenape in the north and Nanticoke in the south. The state was first colonized by Dutch traders at Zwaanendael, near present-day Lewes, Delaware, in 1631.
Delaware was one of the Thirteen Colonies that participated in the American Revolution and American Revolutionary War, in which the American Continental Army, led by George Washington, defeated the British, ended British colonization and establishing the United States as a sovereign and independent nation.
On December 7, 1787, Delaware was the first state to ratify the Constitution of the United States, earning it the nickname "The First State".Since the turn of the 20th century, Delaware has become an onshore corporate haven whose corporate laws are deemed appealing to corporations; over half of all New York Stock Exchange-listed corporations and over three-fifths of the Fortune 500 is legally incorporated in the state.

Page: Delaware City, Delaware
Summary: Delaware City is a city in New Castle County, Delaware, United States. The population was 1,885 as of 2020. It is a small port town on the eastern terminus of the Chesapeake and Delaware Canal and is the location of the Forts Ferry Crossing to Fort Delaware on Pea Patch Island.

Page: Delaware River
Summary: The Delaware River is a major river in the Mid-Atlantic region of the United States and is the longest free-flowing (undammed) river in the Eastern United States. From the meeting of its branches in Hancock, New York, the river flows for 282 miles (454 km) along the borders of New York, Pennsylvania, New Jersey, and Delaware, before emptying into Delaware Bay.
The river has been recognized by the National Wildlife Federation as one of the country's Great Waters and has been called the "Lifeblood of the Northeast" by American Rivers. Its watershed drains an area of 13,539 square miles (35,070 km2) and provides drinking water for 17 million people, including half of New York City via the Delaware Aqueduct.
The Delaware River has two branches that rise in the Catskill Mountains of New York: the West Branch at Mount Jefferson in Jefferson, Schoharie County, and the East Branch at Grand Gorge, Delaware County. The branches merge to form the main Delaware River at Hancock, New York. Flowing south, the river remains relatively undeveloped, with 152 miles (245 km) protected as the Upper, Middle, and Lower Delaware National Scenic Rivers. At Trenton, New Jersey, the Delaware becomes tidal, navigable, and significantly more industrial. This section forms the backbone of the Delaware Valley metropolitan area, serving the port cities of Philadelphia, Camden, New Jersey, and Wilmington, Delaware. The river flows into Delaware Bay at Liston Point, 48 miles (77 km) upstream of the bay's outlet to the Atlantic Ocean between Cape May and Cape Henlopen.
Before the arrival of European settlers, the river was the homeland of the Lenape native people. They called the river Lenapewihittuk, or Lenape River, and Kithanne, meaning the largest river in this part of the country.In 1609, the river was visited by a Dutch East India Company expedition led by Henry Hudson. Hudson, an English navigator, was hired to find a western route to Cathay (China), but his encounters set the stage for Dutch colonization of North America in the 17th century. Early Dutch and Swedish settlements were established along the lower section of the river and Delaware Bay. Both colonial powers called the river the South River (Zuidrivier), compared to the Hudson River, which was known as the North River. After the English expelled the Dutch and took control of the New Netherland colony in 1664, the river was renamed Delaware after Sir Thomas West, 3rd Baron De La Warr, an English nobleman and the Virginia colony's first royal governor, who defended the colony during the First Anglo-Powhatan War.

Page: University of Delaware
Summary: The University of Delaware (colloquially known as UD or Delaware) is a privately governed, state-assisted land-grant research university located in Newark, Delaware. UD is the largest university in Delaware. It offers three associate's programs, 148 bachelor's programs, 121 master's programs (with 13 joint degrees), and 55 doctoral programs across its eight colleges. The main campus is in Newark, with satellite campuses in Dover, Wilmington, Lewes, and Georgetown. It is considered a large institution with approximately 18,200 undergraduate and 4,200 graduate students. It is a privately governed university which receives public funding for being a land-grant, sea-grant, and space-grant state-supported research institution.UD is classified among "R1: Doctoral Universities – Very high research activity". According to the National Science Foundation, UD spent $186 million on research and development in 2018, ranking it 119th in the nation.  It is recognized with the Community Engagement Classification by the Carnegie Foundation for the Advancement of Teaching.UD students, alumni, and sports teams are known as the "Fightin' Blue Hens", more commonly shortened to "Blue Hens", and the school colors are Delaware blue and gold. UD sponsors 21 men's and women's NCAA Division-I sports teams and have competed in the Colonial Athletic Association (CAA) since 2001.



Page: Lenape
Summary: The Lenape (English: , , ; Lenape languages: [lənaːpe]), also called the Lenni Lenape and Delaware people, are an Indigenous people of the Northeastern Woodlands, who live in the United States and Canada.The Lenape's historical territory includes present-day northeastern Delaware, all of New Jersey, the eastern Pennsylvania regions of the Lehigh Valley and Northeastern Pennsylvania, and New York Bay, western Long Island, and the lower Hudson Valley in New York state. Today they are based in Oklahoma, Wisconsin, and Ontario.
During the last decades of the 18th century, European settlers and the effects of the American Revolutionary War displaced most Lenape from their homelands and pushed them north and west. In the 1860s, under the Indian removal policy, the U.S. federal government relocated most Lenape remaining in the Eastern United States to the Indian Territory and surrounding regions. Lenape people currently belong to the Delaware Nation and Delaware Tribe of Indians in Oklahoma, the Stockbridge–Munsee Community in Wisconsin, and the Munsee-Delaware Nation, Moravian of the Thames First Nation, and Delaware of Six Nations in Ontario.

[0m[32;1m[1;3m
Invoking: `Wikipedia` with `Blue hen chicken`


[0m[36;1m[1;3mPage: Delaware Blue Hen
Summary: The Delaware Blue Hen or Blue Hen of Delaware is a blue strain of American gamecock. Under the name Blue Hen Chicken it is the official bird of the State of Delaware. It is the emblem or mascot of several institutions in the state, among them the sports teams of the University of Delaware.

Page: Delaware Fightin' Blue Hens
Summary: The Delaware Fightin' Blue Hens are the athletic teams of the University of Delaware (UD) of Newark, Delaware, in the United States. The Blue Hens compete in the Football Championship Subdivision (FCS) of Division I of the National Collegiate Athletic Association (NCAA) as members of the Coastal Athletic Association and its technically separate football league, CAA Football.
On November 28, 2023, UD and Conference USA (CUSA) jointly announced that UD would start a transition to the Division I Football Bowl Subdivision (FBS) in 2024 and join CUSA in 2025. UD will continue to compete in both sides of the CAA in 2024–25; it will be ineligible for the FCS playoffs due to NCAA rules for transitioning programs, but will be eligible for all non-football CAA championships. Upon joining CUSA, UD will be eligible for all conference championship events except the football championship game; it will become eligible for that event upon completing the FBS transition in 2026. At the same time, UD also announced it would add one women's sport due to Title IX considerations, and would also be seeking conference homes for the seven sports that UD sponsors but CUSA does not. The new women's sport would later be announced as ice hockey; UD will join College Hockey America for its first season of varsity play in 2025–26.

Page: Brahma chicken
Summary: The Brahma is an American breed of chicken. It was bred in the United States from birds imported from the Chinese port of Shanghai,: 78  and was the principal American meat breed from the 1850s until about 1930.

Page: Silkie
Summary: The Silkie (also known as the Silky or Chinese silk chicken) is a breed of chicken named for its atypically fluffy plumage, which is said to feel like silk and satin. The breed has several other unusual qualities, such as black skin and bones, blue earlobes, and five toes on each foot, whereas most chickens have only four. They are often exhibited in poultry shows, and also appear in various colors. In addition to their distinctive physical characteristics, Silkies are well known for their calm and friendly temperament. It is among the most docile of poultry. Hens are also exceptionally broody, and care for young well. Although they are fair layers themselves, laying only about three eggs a week, they are commonly used to hatch eggs from other breeds and bird species due to their broody nature. Silkie chickens have been bred to have a wide variety of colors which include but are not limited to: Black, Blue, Buff, Partridge, Splash, White, Lavender, Paint and Porcelain.

Page: Silverudd Blue
Summary: The Silverudd Blue, Swedish: Silverudds Blå, is a Swedish breed of chicken. It was developed by Martin Silverudd in Småland, in southern Sweden. Hens lay blue/green eggs, weighing 50–65 grams. The flock-book for the breed is kept by the Svenska Kulturhönsföreningen – the Swedish Cultural Hen Association. It was initially known by various names including Isbar, Blue Isbar and Svensk Grönvärpare, or "Swedish green egg layer"; in 2016 it was renamed to 'Silverudd Blue' after its creator.[0m[32;1m[1;3mThe current US president is Joe Biden. His home state is Delaware. The home state bird of Delaware is the Delaware Blue Hen. The scientific name of the Delaware Blue Hen is Gallus gallus domesticus.[0m

[1m> Finished chain.[0m
```

```output
{'input': "Who is the current US president? What's their home state? What's their home state's bird? What's that bird's scientific name?",
 'output': 'The current US president is Joe Biden. His home state is Delaware. The home state bird of Delaware is the Delaware Blue Hen. The scientific name of the Delaware Blue Hen is Gallus gallus domesticus.'}
```

:::tip

[LangSmith trace](https://smith.langchain.com/public/3b27d47f-e4df-4afb-81b1-0f88b80ca97e/r)

:::
