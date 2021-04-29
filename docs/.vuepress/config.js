const base = process.env.BUILD_ENV ? process.env.BUILD_ENV : '/sea-notes/'

module.exports = {
  base,
  dest: './dist',
  title: 'Sea-DH1 Notes',
  description: 'Sea前端笔记，常用库笔记、以及其他技术分享。',
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
    nav: [
      {
        text: '在线音乐播放器',
        items: [{ text: '移动端', link: 'https://music.nsearh.com' }],
      },
      { text: 'Blog', link: 'https://blog.nsearh.com' },
    ],
    sidebar: [
      {
        collapsable: false, // 可选的, 默认值是 true,
        children: ['view/', 'view/view'],
      },
    ],
    sidebar: 'auto',
  },
}
