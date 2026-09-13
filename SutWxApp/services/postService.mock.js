/**
 * 文件名: postService.mock.js
 * 版本号: 3.0.12
 * 更新日期: 2026-09-13
 * 描述: 文章服务层的演示数据（'mock' 数据源），从 postService.js 抽离以保持单文件精简
 */

const mockPosts = [
  {
    id: 1,
    title: "绿萝怎么养才能叶片油亮？",
    excerpt: "绿萝是净化空气的最佳植物之一，掌握这几个要点叶片更亮泽。",
    content:
      '<h3>光照</h3><p>绿萝喜散射光，避免强光直射。室内明亮的窗边最合适。</p>' +
      '<img src="https://example.com/images/green.jpg" alt="绿萝养护"/>' +
      '<h3>浇水</h3><p>见干见湿，盆土表面发白再浇透。冬季减少频次。</p>' +
      '<ul><li>春夏季 3-4 天一次</li><li>秋冬季 7 天一次</li></ul>' +
      '<p>更多养护技巧见 <a href="https://example.com/care">养护专栏</a>。</p>',
    date: "2026-08-20",
    categories: [2],
    featured_image: "https://example.com/images/green.jpg",
  },
  {
    id: 2,
    title: "多肉植物度夏三大误区",
    excerpt: "夏季是多肉杀手，避开这些坑安全度夏。",
    content:
      '<h3>误区一：拼命浇水</h3><p>夏季多肉休眠，应控水，每月少量即可。</p>' +
      '<h3>误区二：放室外暴晒</h3><p>遮阴通风是关键，午间避免直射。</p>' +
      '<blockquote>宁干勿湿，是度夏第一原则。</blockquote>',
    date: "2026-08-25",
    categories: [3],
    featured_image: "",
  },
  {
    id: 3,
    title: "花盆怎么选？材质对比",
    excerpt: "陶盆、瓷盆、塑料盆各有优劣，按需选择。",
    content:
      '<h3>陶盆</h3><p>透气好，适合多肉与怕涝植物，但易干需勤浇。</p>' +
      '<h3>瓷盆</h3><p>美观保水，适合绿萝等喜湿植物。</p>' +
      '<table><tr><th>材质</th><th>透气</th><th>保水</th></tr>' +
      '<tr><td>陶盆</td><td>优</td><td>中</td></tr>' +
      '<tr><td>瓷盆</td><td>差</td><td>优</td></tr></table>',
    date: "2026-09-01",
    categories: [5],
    featured_image: "",
  },
];

module.exports = { mockPosts };
