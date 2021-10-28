const base = process.env.BUILD_ENV ? process.env.BUILD_ENV : '/'

module.exports = {
  base,
  dest: './dist',
  title: 'Sea-DH1 Notes',
  description: 'Sea前端笔记，常用库笔记、以及其他技术分享。',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  port: 3001,
  markdown: {
    lineNumbers: false,
  },
  locales: {
    // 键名是该语言所属的子路径
    // 作为特例，默认语言可以使用 '/' 作为其路径。
    '/': {
      lang: 'zh-CN',
      title: 'Sea-DH1 前端笔记',
      description: 'Sea-DH1 前端笔记，常用库笔记、以及其他技术分享。',
    },
  },
  themeConfig: {
    repo: 'https://github.com/Sea-DH1/sea-notes',
    repoLabel: 'Github',
    lastUpdated: '最后更新时间',
    nav: [
      { text: 'Javascript基础', link: '/view/' },
      { text: 'Three.js', link: '/Three.js/' },
      { text: '数据结构与算法', link: '/algorithm/' },
      {
        text: '音乐播放器',
        link: 'https://music.nsearh.com',
      },
      { text: 'Examples', link: 'https://examples.nsearh.com/demo' },
    ],
    sidebar: [
      {
        title: 'Javascript基础',
        collapsable: true, // 可选的, 默认值是 true,
        children: ['view/', 'view/home'],
      },
      {
        title: 'Three.js',
        // collapsable: false, // 可选的, 默认值是 true,
        children: ['Three.js/'],
      },
      {
        title: '数据结构与算法',
        // collapsable: false, // 可选的, 默认值是 true,
        children: ['algorithm/'],
      },
    ],
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@images': '../images',
        '@vuepress': '../images/vuepress',
        '@components': '../.vuepress/components',
      },
    },
  },
}
