/**
 * Color palette for each theme
 * Structure: 
 *  { 
 *    themeName: { 
 *      variant: { 
 *        colorName: hexValue 
 *      } 
 *    } 
 *  }
 */

const THEMES = {
  catppuccin: {
    light: {
      // Catppuccin Latte
      base: '#eff1f5',
      mantle: '#e6e9ef',
      crust: '#dce0e8',

      text: '#4c4f69',
      subtext1: '#5c5f77',
      subtext0: '#6c6f85',

      surface2: '#acb0be',
      surface1: '#bcc0cc',
      surface0: '#ccd0da',

      overlay2: '#7c7f93',
      overlay1: '#8c8fa1',
      overlay0: '#9ca0b0',

      red: '#d20f39',
      maroon: '#e64553',
      peach: '#fe640b',
      yellow: '#df8e1d',
      green: '#40a02b',
      teal: '#179299',
      sky: '#04a5e5',
      sapphire: '#209fb5',
      blue: '#1e66f5',
      lavender: '#7287fd',
      mauve: '#8839ef',
      pink: '#ea76cb',

      flamingo: '#dd7878',
      rosewater: '#dc8a78'
    },
    dark: {
      // Catppuccin Mocha
      base: '#1e1e2e',
      mantle: '#181825',
      crust: '#11111b',

      text: '#cdd6f4',
      subtext1: '#bac2de',
      subtext0: '#a6adc8',

      surface2: '#585b70',
      surface1: '#45475a',
      surface0: '#313244',

      overlay2: '#9399b2',
      overlay1: '#7f849c',
      overlay0: '#6c7086',

      red: '#f38ba8',
      maroon: '#eba0ac',
      peach: '#fab387',
      yellow: '#f9e2af',
      green: '#a6e3a1',
      teal: '#94e2d5',
      sky: '#89dceb',
      sapphire: '#74c7ec',
      blue: '#89b4fa',
      lavender: '#b4befe',
      mauve: '#cba6f7',
      pink: '#f5c2e7',

      flamingo: '#f2cdcd',
      rosewater: '#f5e0dc'
    }
  },

  gruvbox: {
    light: {
      // Gruvbox Light (Hard contrast)
      base: '#f9f5d7',
      mantle: '#f2e5bc',
      crust: '#ebdbb2',

      text: '#3c3836',
      subtext1: '#504945',
      subtext0: '#665c54',

      surface2: '#bdae93',
      surface1: '#d5c4a1',
      surface0: '#ebdbb2',

      overlay2: '#7c6f64',
      overlay1: '#928374',
      overlay0: '#a89984',

      red: '#cc241d',
      maroon: '#9d0006',
      peach: '#d65d0e',
      yellow: '#d79921',
      green: '#98971a',
      teal: '#689d6a',
      sky: '#458588',
      sapphire: '#076678',
      blue: '#458588',
      lavender: '#8f3f71',
      mauve: '#b16286',
      pink: '#d3869b',

      flamingo: '#d3869b',
      rosewater: '#d3869b'
    },
    dark: {
      // Gruvbox Dark (Hard contrast)
      base: '#1d2021',
      mantle: '#282828',
      crust: '#32302f',

      text: '#ebdbb2',
      subtext1: '#d5c4a1',
      subtext0: '#bdae93',

      surface2: '#504945',
      surface1: '#3c3836',
      surface0: '#32302f',

      overlay2: '#a89984',
      overlay1: '#928374',
      overlay0: '#7c6f64',

      red: '#fb4934',
      maroon: '#cc241d',
      peach: '#fe8019',
      yellow: '#fabd2f',
      green: '#b8bb26',
      teal: '#8ec07c',
      sky: '#83a598',
      sapphire: '#458588',
      blue: '#83a598',
      lavender: '#d3869b',
      mauve: '#d3869b',
      pink: '#d3869b',

      flamingo: '#d3869b',
      rosewater: '#d3869b'
    }
  },

  tokyonight: {
    light: {
      // Tokyo Night Day
      base: '#d5d6db',
      mantle: '#e1e2e7',
      crust: '#e9e9ed',

      text: '#343b58',
      subtext1: '#4c505e',
      subtext0: '#565a6e',

      surface2: '#9699a3',
      surface1: '#b2b5bd',
      surface0: '#cbccd1',

      overlay2: '#787c99',
      overlay1: '#8990b3',
      overlay0: '#9aa5ce',

      red: '#8c4351',
      maroon: '#8c4351',
      peach: '#965027',
      yellow: '#8f5e15',
      green: '#485e30',
      teal: '#33635c',
      sky: '#166775',
      sapphire: '#0f4b6e',
      blue: '#34548a',
      lavender: '#5a4a78',
      mauve: '#5a4a78',
      pink: '#7847bd',

      flamingo: '#b15c00',
      rosewater: '#b15c00'
    },
    dark: {
      // Tokyo Night Storm
      base: '#24283b',
      mantle: '#1f2335',
      crust: '#1a1b26',

      text: '#c0caf5',
      subtext1: '#a9b1d6',
      subtext0: '#9aa5ce',

      surface2: '#565f89',
      surface1: '#414868',
      surface0: '#2f3549',

      overlay2: '#787c99',
      overlay1: '#828bb8',
      overlay0: '#a9b1d6',

      red: '#f7768e',
      maroon: '#db4b4b',
      peach: '#ff9e64',
      yellow: '#e0af68',
      green: '#9ece6a',
      teal: '#73daca',
      sky: '#7dcfff',
      sapphire: '#2ac3de',
      blue: '#7aa2f7',
      lavender: '#bb9af7',
      mauve: '#bb9af7',
      pink: '#c0a6f7',

      flamingo: '#ff9e64',
      rosewater: '#ff9e64'
    }
  },

  kanagawa: {
    light: {
      // Kanagawa Light
      base: '#f2ecbc',
      mantle: '#e7dba0',
      crust: '#dcd5ac',

      text: '#1f1f28',
      subtext1: '#2a2a37',
      subtext0: '#363646',

      surface2: '#b8b4d0',
      surface1: '#c9c5dc',
      surface0: '#dcd8e8',

      overlay2: '#8a8980',
      overlay1: '#9e9b93',
      overlay0: '#b2afa6',

      red: '#c84053',
      maroon: '#d7474b',
      peach: '#ffa066',
      yellow: '#c0a36e',
      green: '#76a56a',
      teal: '#6a9589',
      sky: '#7aa89f',
      sapphire: '#658594',
      blue: '#7e9cd8',
      lavender: '#938aa9',
      mauve: '#957fb8',
      pink: '#d27e99',

      flamingo: '#e98a00',
      rosewater: '#e46876'
    },
    dark: {
      // Kanagawa Wave (dark)
      base: '#1f1f28',
      mantle: '#16161d',
      crust: '#0d0c0e',

      text: '#dcd7ba',
      subtext1: '#c8c093',
      subtext0: '#a6a69c',

      surface2: '#363646',
      surface1: '#2a2a37',
      surface0: '#223249',

      overlay2: '#9cabca',
      overlay1: '#727169',
      overlay0: '#54546d',

      red: '#c34043',
      maroon: '#e82424',
      peach: '#ffa066',
      yellow: '#c0a36e',
      green: '#98bb6c',
      teal: '#7aa89f',
      sky: '#7fb4ca',
      sapphire: '#6a9589',
      blue: '#7e9cd8',
      lavender: '#938aa9',
      mauve: '#957fb8',
      pink: '#d27e99',

      flamingo: '#e98a00',
      rosewater: '#e46876'
    }
  },

  dracula: {
    light: {
      // Dracula Light (custom light variant)
      base: '#f8f8f2',
      mantle: '#e6e6e1',
      crust: '#d4d4cf',

      text: '#282a36',
      subtext1: '#44475a',
      subtext0: '#6272a4',

      surface2: '#bd93f9',
      surface1: '#d4bfff',
      surface0: '#e9ddff',

      overlay2: '#6272a4',
      overlay1: '#7888bd',
      overlay0: '#8e9ec6',

      red: '#b31d28',
      maroon: '#d32f2f',
      peach: '#fa8142',
      yellow: '#e5c07b',
      green: '#388e3c',
      teal: '#50e6c3',
      sky: '#8be9fd',
      sapphire: '#5dadf5',
      blue: '#5e81ac',
      lavender: '#bd93f9',
      mauve: '#9966cc',
      pink: '#ec407a',

      flamingo: '#ffb86c',
      rosewater: '#ff79c6'
    },
    dark: {
      // Dracula Dark
      base: '#282a36',
      mantle: '#21222c',
      crust: '#191a21',

      text: '#f8f8f2',
      subtext1: '#e9e9e4',
      subtext0: '#d4d4cf',

      surface2: '#44475a',
      surface1: '#3a3c4e',
      surface0: '#313241',

      overlay2: '#6272a4',
      overlay1: '#7888bd',
      overlay0: '#8e9ec6',

      red: '#ff5555',
      maroon: '#ff6e6e',
      peach: '#ffb86c',
      yellow: '#f1fa8c',
      green: '#50fa7b',
      teal: '#8be9fd',
      sky: '#8be9fd',
      sapphire: '#76daf5',
      blue: '#6272a4',
      lavender: '#bd93f9',
      mauve: '#bd93f9',
      pink: '#ff79c6',

      flamingo: '#ffb86c',
      rosewater: '#ff79c6'
    }
  }
};
