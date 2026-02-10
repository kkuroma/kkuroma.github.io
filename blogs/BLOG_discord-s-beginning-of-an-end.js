(function() {
const BLOG_CONFIG = {
  title: "Discord's Beginning of an End",
  date_created: "2026-02-10",
  date_updated: null,
  read_time: "15 min",
  tags: ["opinion", "rant"],
  preview_img: null,
  pinned: false,
  content: `Soooooo, I have several work/project related blogs on queue, but here I am writing an opinion-based rant post. Just what exactly happened? Good'ol **[Discord]{color:blue}** now requires you hand them **[your government identification]{rainbow}** to use their services, and this isn't the worst part!

#TOC

# How It Started

## The UK Online Safety Act

- **[2019/04/08:]{color:red}** The UK parliament introduced the **[Online Harms White Paper](https://hansard.parliament.uk/commons/2019-04-08/debates/0B8572FF-E3B5-4585-9497-4AE6611D434D/OnlineHarmsWhitePaper)** as a result Mr. Jeremy Wright's debate in the parliament. As per the official statement, Wright cited the dominance (over 90%) of adults in the online world as a potential source of harm (more explicitly, cyber-bullying, grooming, and exploitation) for children. He stated that the government should take proactive actions in regulating online content via the introduction of a new *regulator* entity in the online world.
- **[2021/05/12:]{color:red}** The UK parliament passed a **[draft](https://hansard.parliament.uk/Commons/2021-05-12/debates/21051242000021/OnlineSafetyBillUpdate)** of the **[Online Safety Act]{color:blue}**. While the draft similarly cited protecting children as its primary goal, the responsibility of safeguarding the vulnerable was notably placed on companies, rather than a government-controlled regulator entity.
- **[2023/10/26:]{color:red}** The **[Finished Online Safety Act](https://www.gov.uk/government/collections/online-safety-act)** received Royal Assent. As stated in the 2021 draft, the act places all responsibilities of regulating online content to social media providers. The British office of communication (OfCom) was given the task of overseeing and monitoring these platforms.
- **[2025/03/17:]{color:red}** Phase 1 of the Online Safety Act took effect, requiring all online platforms to regulate potentially illegal contents.
- **[2025/07/25:]{color:red}** Phase 2 of the UK Online Safety Act took effect. The **[Protection of Children Codes of Practice](https://www.whitecase.com/insight-alert/uk-online-safety-act-protection-children-codes-come-force)** became enforceable, requiring platforms with child users to implement "highly effective age assurance" (HEAA) to prevent minors from accessing pornography and harmful content.

The method in which each online platform shall use to enforce their contents, prevent certain users (children) from accessing certain content, has been left vague all throughout the progression. Let's explore Discord's specific response to this.

## Discord's Development

Discord is one of the world's largest online platform. Boasting powerful servers to manage millions of users at once, Discord's appeal in its modernistic aesthetics allowed it to develop from a gamer-exclusive platform to housing several large communities. Here's how Discord acted in compliance with the online safety act:

- **[Pre-2023:]{color:red}** Discord's age verification was **self-reported only**, meaning the user reported their date of birth upon account creation. Age-restricted channels used this age to issue warning to potentially underage users.

- **[2025/12/09:]{color:red}** In accordance to the **[UK Online Safety Act](https://en.wikipedia.org/wiki/Online_Safety_Act_2023)** and similarly **[Australia's Social Media Minimum Age Act](https://www.esafety.gov.au/young-people/social-media-age-restrictions#quick-facts)**, Discord **[requires all users in the UK and Australia](https://support.discord.com/hc/en-us/articles/33362401287959-What-s-Changing-for-UK-and-Australian-Users)** to undergo **[Age Assurance](https://support.discord.com/hc/en-us/articles/30326565624343-How-to-Complete-Age-Assurance-on-Discord)**. The verification steps are as follows: the user sends Discord their selfie or government issued ID, Discord estimates their age group, then permissions are allowed based on the user's age range. Unverified users will be placed in a *vulnerable* age group by default, having all *potentially sensitive* contents blocked.
![Image](https://storage.kuroma.dev/blog-images/discord_uk_post){2025/12/09: Discord Mandates Age Verification (UK/AU), 500, 500}

# The News

**[2026/02/09:]{color:red}** Discord announced that the age verification mandate will be rolled out **[globally](https://discord.com/press-releases/discord-launches-teen-by-default-settings-globally)**, starting from March of 2026. Similar to the UK/AU mandate, Discord will now assumes all unverified users are under the age of consent, blocking them from features and contents.
![Image](https://storage.kuroma.dev/blog-images/discord_global_post){2026/02/09: Discord Mandates Age Verification (Global) With Questionable Verification Methods, 500, 500}
What's notably different is the introduction of Discord's *Age Verification Inference Model*, which tracks your messages and periodically re-verifies whether you belong in your age group based on your chat history.

# My Brutally Honest Opinions

From this point onward, all written content are derived from my opinions, uninfluenced by any persons, organizations, or entities I may have been affiliated with. Here's what I honestly see about online services mandating identification and censorship in the *holy name of the children*:

## Are We Really Protecting The Children?

For those in support of the child safety policy, companies don't care about your children AT ALL. For (millennial) parents hoping for the government to transform the internet into a sanctuary for their children, just don't. If you lack the capabilities to educate your children to be conscious with online contents, **[you have failed at being a parent]{color:red}**. Children's safety was, is, and should always be the sole responsibility of their parents or guardians.

For politicians backing up these acts, if children's safety really is your priority, consider investing in critical thinking as part of the core curriculum. Instead of hopelessly shielding children from reality, schools should be a place children are taught to understand, survive, and thrive in our society. **[Consider making the in-person world one worth forming real-life connections]{color:red}**, so children wouldn't resort to the internet as means of escape. 

For those thinking it's better than nothing, I'd argue that not only are online safety obsolete, but they also presents potential harms to the very children we seek to protect.

- **[You're handing out children's private information to third party vendors.]{color:green}** Trusted or not, you're giving out your children's identification, something you wouldn't even show your relatives, to complete strangers with known history of data breaches.
- **[The "safeguard" can easily be circumvented by both children AND predators.]{color:green}** Fake (AI-generated) IDs are the easiest workaround to bypass age verification. While it's concerning if the children abuse such mechanics, the threat escalates tenfold when child predators can use
- **[Curated content = Indoctrination.]{color:green}** We know for sure online contents will be censored. What we don't know is the criteria for censorship. Online content will be curated in one way or another, and this will gradually bend the landscape of online contents in the image of who wills it...

I grew up in the early days of the internet. When I was a child, my parents walked me through what they knew of the internet, taught me how adults like them navigated the internet, and even let me share what I learned from my daily browsing. Most importantly, my parents never restricted my internet access.

## Privacy and Security Concerns

Discord hasn't had the best track record when it comes to security and data breaches. Most relevant to the recent ID mandate, [a third party customer service attack](https://discord.com/press-releases/update-on-security-incident-involving-third-party-customer-service) has leaked the personal information tied to several discord accounts, including the government issued ID for those who underwent age verification prior to the incident. 

The article not only saw Discord's avoidance of blame on the subject matter, redirecting the responsibility to third-party verification vendors, but also lacks mentions of any concrete future-proof solutions. With Discord now constantly running your chat history through their recurring age verification algorithm, they expanded their attack surface and runs the risk of more severe breaches. **[For politicians pushing responsibilities to under-prepared companies, is this what you wanted?]{color:red}**

## The Quest for Control

Unless it's been made painfully clear (for those who enjoyed George Orwell's *1984*), surveillance is the first step towards totalitarianism. The abolishment of (online) anonymity only serves to benefit the authority in eliminating their opposition. You may think it doesn't affect ordinary, law-abiding citizens like us, but only time will tell if our democratic government stayed true to their words. There is no guarantee the government wouldn't randomly see your "harmless" opinion as a threat to their existence. As an American and global citizen, freedom of expression should be a basic rights... I can only hope the world sees it that way.

It's undeniable (and disheartening) that the internet has changed from what I grew up with. What was created for the people has become a platform of mass advertisement and control.

# What's Next

Discord's descent can only been seen as a prelude to a darker internet. The more we hand over control to authorities and corporate, the more we're losing the freedom to express ourselves. While we still have the chance, voice out your opinions and never think these issues won't affect you. Us people have the advantage in numbers. In a democratic world, the majority dominates over the few-but-powerful!

> Bring compute to the people, so one day we'll reclaim the internet!

As for Discord, we have about a month until Discord new's policy takes effect. While self-hosting alternatives like Matrix exists, the difficulty lies in getting existing users off Discord. Needless to say, my trust in privates services has been crushed through and through.

![Image](https://storage.kuroma.dev/blog-images/discord_skype_x.png){Discord's Enshittification, 500, 500}

# Sources

- **Discord.** (2025, December 9). *What's changing for UK and Australian users*. Discord Support. [https://support.discord.com/hc/en-us/articles/33362401287959-What-s-Changing-for-UK-and-Australian-Users](https://support.discord.com/hc/en-us/articles/33362401287959-What-s-Changing-for-UK-and-Australian-Users)
- **Discord.** (2025, December 9). *How to complete age assurance on Discord*. Discord Support. [https://support.discord.com/hc/en-us/articles/30326565624343-How-to-Complete-Age-Assurance-on-Discord](https://support.discord.com/hc/en-us/articles/30326565624343-How-to-Complete-Age-Assurance-on-Discord)
- **Discord.** (2026, February 9). *Discord launches teen-by-default settings globally* [Press release]. [https://discord.com/press-releases/discord-launches-teen-by-default-settings-globally](https://discord.com/press-releases/discord-launches-teen-by-default-settings-globally)
- **eSafety Commissioner.** (n.d.). *Social media age restrictions*. Australian Government. Retrieved February 10, 2026, from [https://www.esafety.gov.au/young-people/social-media-age-restrictions#quick-facts](https://www.esafety.gov.au/young-people/social-media-age-restrictions#quick-facts)
- *Online Safety Act 2023*, c. 50 (UK). [https://en.wikipedia.org/wiki/Online_Safety_Act_2023](https://en.wikipedia.org/wiki/Online_Safety_Act_2023)
- **UK Government.** (2023). *Online Safety Act*. GOV.UK. [https://www.gov.uk/government/collections/online-safety-act](https://www.gov.uk/government/collections/online-safety-act)
- **White & Case LLP.** (2025, July 25). *UK Online Safety Act: Protection of children codes come into force*. [https://www.whitecase.com/insight-alert/uk-online-safety-act-protection-children-codes-come-force](https://www.whitecase.com/insight-alert/uk-online-safety-act-protection-children-codes-come-force)
- **Wright, J.** (2019, April 8). *Online harms white paper* [Parliamentary debate]. UK Parliament. [https://hansard.parliament.uk/commons/2019-04-08/debates/0B8572FF-E3B5-4585-9497-4AE6611D434D/OnlineHarmsWhitePaper](https://hansard.parliament.uk/commons/2019-04-08/debates/0B8572FF-E3B5-4585-9497-4AE6611D434D/OnlineHarmsWhitePaper)
- **Wright, J.** (2021, May 12). *Online Safety Bill update* [Parliamentary debate]. UK Parliament. [https://hansard.parliament.uk/Commons/2021-05-12/debates/21051242000021/OnlineSafetyBillUpdate](https://hansard.parliament.uk/Commons/2021-05-12/debates/21051242000021/OnlineSafetyBillUpdate)`
};
window.BLOG_CONFIG = BLOG_CONFIG;
})();
