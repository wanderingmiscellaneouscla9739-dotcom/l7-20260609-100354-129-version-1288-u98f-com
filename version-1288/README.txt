国产影视大全静态站点

生成结果：
- 实际解析影片数量：2000
- 详情页目录：detail/0001.html 到 detail/2000.html
- 首页：index.html
- 分类页：categories.html 与 category-*.html
- 排行榜：ranking.html
- 全部影片：archive.html
- 搜索页：search.html

图片说明：
请将 1.jpg 到 150.jpg 放在网站顶级目录，与 index.html 同级。页面中的 Hero、卡片封面和详情页海报均按影片序号循环引用这些顶级 JPG 图片。

播放源说明：
详情页播放器默认绑定一个可播放的 HLS 测试源。正式上线时可在 assets/js/main.js 中修改 DEFAULT_PLAY_URL，或逐页替换 player-shell 的 data-src。
