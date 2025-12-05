import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type {PrismTheme} from 'prism-react-renderer';

// Solarized Light Prism Theme (uses base2 highlight background)
const solarizedLight: PrismTheme = {
  plain: {
    color: '#657b83',
    backgroundColor: '#eee8d5',
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: {color: '#93a1a1', fontStyle: 'italic'},
    },
    {
      types: ['punctuation'],
      style: {color: '#586e75'},
    },
    {
      types: ['namespace'],
      style: {opacity: 0.7},
    },
    {
      types: ['property', 'tag', 'boolean', 'number', 'constant', 'symbol'],
      style: {color: '#268bd2'},
    },
    {
      types: ['attr-name', 'string', 'char', 'builtin', 'url'],
      style: {color: '#2aa198'},
    },
    {
      types: ['entity'],
      style: {color: '#2aa198', cursor: 'help'},
    },
    {
      types: ['selector', 'inserted'],
      style: {color: '#859900'},
    },
    {
      types: ['atrule', 'attr-value', 'keyword'],
      style: {color: '#859900'},
    },
    {
      types: ['function', 'class-name'],
      style: {color: '#b58900'},
    },
    {
      types: ['regex', 'important', 'variable'],
      style: {color: '#cb4b16'},
    },
    {
      types: ['deleted'],
      style: {color: '#dc322f'},
    },
    {
      types: ['important', 'bold'],
      style: {fontWeight: 'bold'},
    },
    {
      types: ['italic'],
      style: {fontStyle: 'italic'},
    },
  ],
};

// Solarized Dark Prism Theme (uses base02 highlight background)
const solarizedDark: PrismTheme = {
  plain: {
    color: '#839496',
    backgroundColor: '#073642',
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: {color: '#586e75', fontStyle: 'italic'},
    },
    {
      types: ['punctuation'],
      style: {color: '#93a1a1'},
    },
    {
      types: ['namespace'],
      style: {opacity: 0.7},
    },
    {
      types: ['property', 'tag', 'boolean', 'number', 'constant', 'symbol'],
      style: {color: '#268bd2'},
    },
    {
      types: ['attr-name', 'string', 'char', 'builtin', 'url'],
      style: {color: '#2aa198'},
    },
    {
      types: ['entity'],
      style: {color: '#2aa198', cursor: 'help'},
    },
    {
      types: ['selector', 'inserted'],
      style: {color: '#859900'},
    },
    {
      types: ['atrule', 'attr-value', 'keyword'],
      style: {color: '#859900'},
    },
    {
      types: ['function', 'class-name'],
      style: {color: '#b58900'},
    },
    {
      types: ['regex', 'important', 'variable'],
      style: {color: '#cb4b16'},
    },
    {
      types: ['deleted'],
      style: {color: '#dc322f'},
    },
    {
      types: ['important', 'bold'],
      style: {fontWeight: 'bold'},
    },
    {
      types: ['italic'],
      style: {fontStyle: 'italic'},
    },
  ],
};

const config: Config = {
  title: 'Alex Hart',
  tagline: 'Android Developer',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://your-docusaurus-site.example.com',
  baseUrl: '/',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: false,
        blog: {
          routeBasePath: '/',
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          blogSidebarTitle: 'Recent Posts',
          blogSidebarCount: 10,
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Alex Hart',
      items: [
        {to: '/', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/exallium',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://androiddev.social/@exallium',
          label: 'Mastodon',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Connect',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/exallium',
            },
            {
              label: 'Mastodon',
              href: 'https://androiddev.social/@exallium',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Alex Hart. Built with Docusaurus.`,
    },
    prism: {
      theme: solarizedLight,
      darkTheme: solarizedDark,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
