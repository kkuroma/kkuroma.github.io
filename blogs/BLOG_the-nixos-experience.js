(function() {
 const BLOG_CONFIG = {
   title: "The NixOS Experience",
   date_created: "2026-11-12",
   date_updated: null,
   tags: ["personal", "linux"],
   preview_img: null,
   pinned: false,
   content: `I know I have an important research work to write up, but what's stopping me from writing my obligatory review for my favorite Linux distro as of writing this. But wasn't I an Arch user before? I hope this blog clear things up! This is NOT a comprehensive list, I won't be going into details as to how I configured my NixOS install. The [associated repo](https://git.kuroma.dev/kkuroma/nixos-configs), however, has been open sourced since day one.

#TOC

# Short recap

I've talked in [this blog](https://kuroma.dev/#/blog/my-2025-tech-journey) earlier this year about how I built my first desktop PC and became an Arch user (btw). Looking back at what I wrote, this story has undergone massive changes, both hardware and software -wise. I'll leave the hardware update (ahem, **[ITX tax]{rainbow}**, ahem) to another story while I explain why I ended up subscribing to the greater evil of NixOS.

# NixOS in a nutshell

So yes, I've succumbed to the curse of being a NixOS evangelist. Here's how the whole mess went.

## The failed attempts

As I've clearly exposed myself in my previous blog, I've always been drawn towards NixOS's declarativeness and reproducibility since day one, and if not for early NVIDIA headaches, I'd have tried NixOS among my first distros.

So why didn't it work? What I didn't know at the time was the concept of **channels**. NixOS is technically a rolling release distro like Arch. Without pinning the upstream \`nixpkgs\` version, your OS defaults to whatever is the NEWEST in the upstream branch (the current **channel**), including changes to syntax and config options. I was following an outdated guide on NVIDIA drivers that conflicted with the upstream, as simple as that.

## The successful attempt

What I did not know at the time is the concept of **[flakes]{color:blue}**. Unlike channels, which aren't pinned by default and is usually system-wide, flakes lets you pin individual sources down to their hashes in a centralized \`flake.lock\` file, essentially making NixOS truly reproducible. Using flakes also let me store multiple host configs at once in the same repo, which is something I'll make extensive use of.

The trick to a successful NixOS installation is learning that that NixOS, unlike most distros, is front-loaded by default. Flakes assumes version control, meaning the intended installation is through cloning a **git repo** with a working configuration and running \`nixos-install\`, instead of bootstrapping on the fly like Arch or Gentoo.

Once said repo is created, installation is as trivial as \`git clone\` into a live ISO, \`nixos-install\`, and a simple reboot into a working system.

## NixOS's perks

After about half a year of NixOS use, the following are what I find uniquely strong with NixOS:

### Centralized and granular configuration

Unlike most distros, where configuration scatter between \`/etc\`, \`/var\`, and \`~/.config\`, NixOS allows all systems AND user configuration to be declared at a single location of your choosing. This includes actions that would otherwise be imperative with other distros, like creating new users/passwords, setting up firewalls, and enabling/disabling systemd services (more on this later). Combined with home manager (to be discussed), you're able to essentially declare everything, from your system services to your window manager gap width, in a single repo.

### Built-in rollback

NixOS allows you to roll back everything that is tracked by nix. It's able to do it via storing configuration sources and binaries in a centralized \`/nix/store\` directory, with incremental changes as derivations (\`.drv\`), and symlinking them into the location FHS expects. Switching to-from versions (generations) is as simple as changing this symlink to a different derivation, which can either be done through CLI or at the bootloader screen.

### Flakes

As previously mentioned, flakes lets you create a centralized lock file to pin all versions of packages down to its precise upstream commit hash. Flake also allows you to define several *entry points* to your configuration, ideally categorized by hostname, in a single repository. An example would be as follows: my central \`flake.nix\` allows monitor sizes to be passed as an argument. My WM (niri) config then expects this argument and sets my display resolution accordingly. This allows me to declare my monitor sizes separately on my desktop and laptop without worrying that changing one will affect any other config; something usually difficult with dotfiles syncing.

Flakes also allows any software to be packaged as a nix-compatible package without being officially in \`nixpkgs\`, akin to the AUR with Arch. [LLaMa-router](https://git.kuroma.dev/kkuroma/llama-router) and [GrapIV](https://git.kuroma.dev/kkuroma/GraphIV) are some of such software I deployed using flake modules.

### Disko

The first step of all OS installation is disk formatting, and being a former Arch user, running manual commands to create partitions and btrfs subvolumes can be quite repetitive after several installs. With NixOS, disko allows you to declare your disk layout for every single drives on your system. This usually gets run prior to installation.

### Sops

NixOS configs are usually stored as a git repository, which risks password leakage if stored as plain text. Sops allows you to store your password in an encrypted \`secrets.yaml\` file, which is decrypted at build time using either your device's hardware key (default) or a registered age key. My recommendation is to register and store an age key in a password manager and use that to onboard new devices.

### Home-manager

Home-manager is NixOS's solution to \`~/.config\` drift. It allows packages to be installed at a user-level instead of system wide, and is the preferred method to perform desktop customization (ricing) in NixOS. This is where I extensively configured my shell (\`.zshrc\`), desktop widgets (\`noctalia-shell\`), and window manager (\`niri\`) without ever manually touching \`~/.config\`.

### Systemd integration

\`nixpkgs\`, being the most expansive Linux package repository on earth, contains several package associated with homelabbing (i.e. Adguard, Navidrome, Jellyfin). These packages can be declared and deployed as user-isolated systemd services alongside desktop features. I've made extensive use of this on my NAS/server node.

## My setup

[My repo(https://git.kuroma.dev/kkuroma/nixos-configs) spans three machines:

- **Zaphkiel**: My gaming PC.
- **Raziel**: My framework 13.
- **Metatron**: My always-on NAS/server.

My usual workflow is as follows: I manually check for updates (\`nix flake update\`) biweekly, deploy them to my gaming PC first for stability, then update my NAS/server less frequently. Unlike Arch, which demands constant maintenance, NixOS allows updates to be done on demand without stability repercussions. The worst that could happen is a change in configuration language that prevents the current config from building, which is a syntax fix, not a risky downtime for always-on machines.

## NixOS's headaches

These are some features/limitations with NixOS I found rather annoying at times.

### Running random binaries

If you find yourself installing packages through \`curl | sh\` or running \`make\` scripts straight from repository, NixOS is not for you. As the core system is read-only, imperative installation does not work, period. Alternatives include flatpak, app images, and distrobox, though as a nix purist, I try to avoid them as much as I could.

### Compile fest

Packages that updates more frequently than upstream usually aren't cached in the upstream server will be compiled, usually stretching update times to over an hour (and turning NixOS into a makeshift Gentoo). Be mindful of your CPU strength pegging all its core compiling something that could've been installed through a binary at an older version.

### Configuration tax

Like any piece of software, the greatest tax is long-term maintenance, and NixOS configurations are no different. As system gets more complicated, your config will inevitably converge into code spaghetti

# Closing thoughts

NixOS is in fact my endgame, well, as long as \`nixpkgs\` as an upstream is around to serve the precompiled binaries. It's a great OS, perhaps the only one that can achieve this dual desktop-server use with such continuity.`
 };
 window.BLOG_CONFIG = BLOG_CONFIG;
 })();
 