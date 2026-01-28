(function() {
const BLOG_CONFIG = {
  title: "My 2025 Tech Journey",
  date_created: "2026-01-27",
  date_updated: null,
  read_time: "15 min",
  tags: ["personal", "story", "hardware", "linux"],
  preview_img: null,
  pinned: false,
  content: `2025 started great for developers; the rise of [AI agents]{rainbow} gave us free(?) workers to finally write that long-overdue \`README.md\`. As services, storage, and now AI move to the cloud, the incentive to own powerful machines diminishes. Knowing all this, **[why the hell did I buy a new Desktop PC!?]{color:red}**

#TOC

> **[Disclaimer]{color:blue}**: the events of this story happened in chronological order. For the best experience, read the chapters in order.

# Chapter 1: Preface

Computer science students fall into two major camps and one outcast band of bandits: Mac, Windows, and Desktop Linux users (every CS major uses Linux on servers one way or another). I had the pleasure of falling under the second category, rocking an **[Asus Zenbook 14]{color:red}** "gaming" laptop (intel 13900H, 16GB DDR5, and RTX 4060) I bought since freshman year for portable gaming. WSL enabled me to work locally on a Linux environment, most of my research happened on the lab's server, and the laptop was strong enough to run my *somewhat heavy* suite of games. The 4060 also provided me a local solution to my AI workloads.

As expected, my laptop started to show its signs of age 2-3 years into its service. Years of abuse (overnight gaming and AI training... **[simultaneously!]{color:blue}**) messed up the battery to about 70% of its capacity. The laptop barely lasts 3 hours on idle, and that's with fans producing propeller engines level of noise. This was around the time both my lab and work issued organizational laptops (which were *MacBooks*), which became my daily driver when I'm outside. As I saw myself using my personal laptop more exclusively at home, I realized my hardware preferences were gradually changing... Portability is no longer a concern, and I wanted a strong machine build AI models locally, one I control, not the cloud.

# Chapter 2: The Invitation

My good friend [Haruto](https://harutohiroki.com) randomly texted me in the summer to help him move **[a box]{color:blue}**. *What box?* **[A literal server!]{color:blue}** Yes, the very servers CS majors ran \`sudo apt install\`. Apparently, [in his word](https://harutohiroki.com/blog.html#post/2026-goals), he was on a crusade to *[gain digital independence]{rainbow}* and combat *[corporate enshittification]{rainbow}*, something I've yet to understand at the time. Being a techstatic nerd that he is, Haruto immediately asked me if I wanted to buy the server he's returning. Considering my apartment's power and space constraint, and my *clear lack of reason* to own a server (a GPU less server isn't ideal for AI and games, I thought), I declined. Still, wanting a less spacious solution for my needs, Haruto recommended me to build a desktop PC around a great **[NVIDIA Tesla V100]{color:blue}** deal on ebay. I've used this GPU on the cloud to power many of my AI services, and so I accepted the offer, thinking it would be cool to finally run these heavy neural networks locally.

# Chapter 3: The Build

Haruto and I used [PCPartPickers](https://pcpartpicker.com) to plan out the mid-range build with the following parts:

- **[CPU]{color:blue}**: the mostly overlooked Ryzen 7 7700x (8 threads, 16 core). Overshadowed by the 7800x3D in pure gaming, the 7700x is a good budget option for a mix of gaming and productivity.
- **[RAM]{color:blue}**: a G.SKILL 32GB (16x2) DDR5 kit at 6000 cl36.
- **[Motherboard]{color:blue}**: Gigabyte X870 EAGLE WIFI7. It came with 3 PCIe slots, so we thought we could fit the V100 alongside a discrete gaming GPU. Little did we know, only one slot has the full 16 lanes.
- **[Storage]{color:blue}**: two 1TB Micron/Crucial Technology P310 NVMe PCIe SSDs.

The cost of this build added up to about \$1800, \$800 of which was on the GPU. Next comes the operating system. I chose to dual boot Windows 11 alongside "*a beginner friendly Linux distro*" as "*I needed windows for gaming*" and "*Linux is hard for newbies*". After patiently waiting for the GPU for 2 more weeks, we assembled the build, installed NVIDIA drivers, and my new PC is finally ready for battle!

# Chapter 4: The Silicon Lottery

## Unfavored by the Gods of Fortune 1

Every heard of the "silicon lottery"? The inherent variability in hardware manufacturing is known to leave certain products more performant. To *win the silicon lottery* is to own such products with pure chance. Need I say more, I lost the silicon lottery twofold...

Back where we left off. I got to setting up remote desktop to access my PC via my lab's MacBook. While remotely accessing from home, I decided it was a good idea to install WSL (which requires a restart) on my Windows partition. The next boot greeted me with a not so pleasant message when I ran \`nvidia-smi\`

> “RuntimeError: Found no NVIDIA driver on your system

"Might be because WSL can't see the host's driver" I thought

> “RuntimeError: Found no NVIDIA driver on your system

Okay let me reboot to Linux Mint and test it there

> “RuntimeError: Found no NVIDIA driver on your system

What the hell?! Something is VERY wrong here. I tried all known "safe" methods under the sun. DDU, new driver versions, even reinstalling Windows doesn't help... I came to the unfortunate conclusion that something during the post-WSL reboot **[bricked the GPU's VBIOS]{color:blue}**, and it's no longer recognizable by any driver.

Now what, I thought as I looked for a new GPU option. While I was fortunate enough to get a full refund from ebay, I was afraid getting another Tesla V100 might end up similarly. Looking at similarly priced GPUs, the RTX 3090 struck the sweet spot: 24GB of VRAM is plenty for training AI and gaming simultaneously, the newer architecture helps with compatibility, and *very importantly*, it massively outclasses my laptop's 4060 in gaming. I managed to pick up a great \$750 deal on Facebook marketplace (which ended up having me go to a random hut in rural Wisconsin).

## Unfavored by the Gods of Fortune 2

Even with my crisis over, a part of me blamed WSL and by extension Windows for crashing my GPU, and thus I decided to give daily driving Linux a try. I went with Ubuntu 24.04 LTS, since Linux Mint didn't have support for my wifi drivers at the time. Perhaps solely from being a *new* experience, I really enjoyed the customization GNOME desktop offers and quickly turned my GNOME's look to a *Hatsune Miku* themed desktop, and later, a inferno-themed tiling setup.

Everything seemed great, but still remember when I said I lost **[two]{color:blue}** silicon lotteries? Well, while my machine now works excellently in games (seeing my Minecraft FPS hits 4 digits was surreal) and AI (getting over 150 tokens/s on the new GPT-OSS 20b model), weird errors happened here and there:

> Random \`NVKL\` errors spamming my \`journalctl\`, once filling my entire 1TB drive

> Random browser tab crashes and Discord kicking me out of calls 

> Random unexplainable game crashes (crash code varied per run)

Under the impression that NVIDIA GPUs don't play well with Linux, and the rampant \`NVKL\` errors, I immediately blamed my GPU's compatability. I once again tried all software option under the sun: trying newer linux kernels, reinstalling the NVIDIA drivers, and even hopping to "gaming-oriented" Linux distros like Pop!OS, none helped. The answer struck when I kept getting the same errors even after making the embarrassing error of reinstalling my HDMI cable to my integrated graphics. "If games still crash on integrated, what gives?" Well, I'd known sooner if I ran *memtest86*... turned out my memory modules are unstable on XMP/EXPO. Did I tell you this bug bounty hunting happened over **[A WHOLE MONTH!!!]{color:blue}**

# Chapter 5: The Distro Hopper/Ricer

The RAM bounty has left me stranded in Pop!OS 24.04 LTS, which I chose because it came pre-bundled with NVIDIA drivers. Still, I chose to stick with it and give the COSMIC desktop (beta) a try. Though not as customizable as GNOME, COSMIC supports *tiling* window management off-the-box. It took me no time to make it look identical to the GNOME desktop I left off.

I began scrolling Reddit's \`r/unixporn\` for inspiration. Among the many Linux distros, **[NixOS]{color:blue}** struck me the most profoundly for its declarative system configuration.

> "NixOS' reproducibility could easily let me transition my laptop to Linux as well, and maybe that could save its battery life" I thought

Wanting to try out NixOS myself, I installed NixOS to my SSD, only to be stuck with NVIDIA driver installation hurdles for hours. "Well let's boot back to Pop!OS and finish my work" **[WHICH POP!OS]{color:blue}** Turned out, I install NixOS based off the SSD's device name \`nvme0n1\`/\`nvme1n1\`, not knowing these are assigned on boot detection order, which is random. NixOS was installed on the SSD I had Pop!OS. As a day-old version of my data is backed up on my laptop, here are my options

1. Work on my laptop and re-configure my desktop once work is done
2. Install Pop!OS or Ubuntu again to get work done, then configure
3. **[Install ARCH LINUX because why not, let the suffering continue]{color:peach}**

That's right, as a mature and responsible adult, I chose **[option 3]{color:peach}** all because I wanted to try **[Hyprland]{color:green}** from the nice desktop pictures I saw on Reddit... I did install Arch via the \`archinstall\` script, but the outcome of being left with a blank terminal left me speechless. Base Hyprland isn't much better; nothing resembling a functioning desktop is installed. Well, I have to get this to work! I pulled up other people's desktop configurations (dotfiles) and drafted a barebones "rice" to get a working desktop with a bar, launcher, and a set of familiar shortcut. I wouldn't have known that after months of small refinements, this desktop became the base of my present day setup. The snappy workspace switcher (compared to MacOS) plus keybind-driven workflow greatly accelerated my desktop navigation and made my computer more pleasant to use.

Having wrote an installer for my Arch Linux setup, reproducing my system on my laptop was easily done within an hour.

# Chapter 6: The Self-Hoster

What was the reason I bought the desktop PC again? Oh right, to try running AI locally. Prior to owning this desktop, I've worked with Ollama and OpenWebUI before, so I naturally ran these services in a docker container. Powered by searxng, a locally hosted search engine, I got what's essentially a *ChatGPT clone* working on my desktop, an impressive first step nonetheless!

What if I want to access this service elsewhere? What if I want to host more similar services? What if I wanted to remotely monitor my services? Questions started to appear as I plan out my digital empire in my bedroom.

First of all, 32GB of memory isn't going to cut hosting everything AND gaming simultaneously. Seeing as my old RAM modules are unstable with XMP/EXPO, I bought a 64GB kit of the same specs of DDR5 for \$200, a decision that would repay me greatly as **[the same RAM modules now costs \$800]{color:blue}**.

As I'll discuss my server in more details in future blogs, I'll leave out finer details. I used *tailscale* to access my services remotely, expose my services securely via *cloudflared*, and got the following services hosted in *docker* containers:

- Media server
- LLM backend
- AI and Non-AI search engines
- Minecraft servers
- "Cloud" storage, enough to store the entirety of arXiv for about 20% of its total capacity.
- much more

To accommodate my growing ~~server~~ digital empire, I bought a 22TB spinning hard drive for \$250 and two 2TB Samsung SATA SSDs for \$80 each, totaling to about \$2200 on my machine.

# Chapter 7: The Endgame

Approaching the end of 2025, I saw the steady rise in computer component prices (most notably RAM and SSD) due to ~~AI-inflicted~~ shortages. My pure-luck PC ended up paying off; apart from rocking a 5-year-old GPU, my system is future proof if future upgrades were to come around.

More concerningly, the rise in hardware price could be a precognitive sign for fall of consumer hardware affordability. It's not wrong to question big corporation's incentive to do so. As we're now several weeks into 2026, the shortage have affected GPU and hard drives as well. The more revenue cloud-based services generated, it seems the less valuable consumer-grade hardware are to manufacturers. With corporations gouging out subscription fees off everything and forced telemetry running rampant, I'm glad I started my journey of digital independence.

My work to expand my digital empire is never done, and with the necessary horsepower in-hand, my journey will only become more interesting!

# Chapter 8: The Lessons

1. **[You will mess up.]{color:yellow}** It's part of the learning process.
2. *["In the midst of chaos, there is opportunity"]{color:green}* - Sun Tzu, the Art of War
3. **[If you wanted to start something, do it now before it's too late.]{color:mauve}** Don't build a PC now though, unless you have the funding.
4. **[Very important!!]{color:red}** [Stress test your new hardware, and don't wipe the wrong SSD]{rainbow}

That's it for my long ~~college application essay~~ story. Have fun computing!`
};
window.BLOG_CONFIG = BLOG_CONFIG;
})();
