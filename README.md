# 从骨量流失到不再骨折（网页版）

静态多页站点，**无依赖、无后端**。本地双击 `index.html` 即可浏览；上线步骤见 `部署到GitHub.md`。

## 页面

| 文件 | 内容 |
|---|---|
| `index.html` | 首页：标题、数据、章节地图（5 章入口） |
| `ch1.html` | 01 病：它为什么是慢病（三特征 / 骨头怎么变空 / 代价） |
| `ch2.html` | 02 防：还没骨折能做什么（三件事 / 骨折部位 / 1 分钟自测） |
| `ch3.html` | 03 事件：病例四个月 / 愈合与不愈合分叉 |
| `ch4.html` | 04 结局：机制 / 读片（三联 MRI）/ 治疗分层（含 PKP 视频） |
| `ch5.html` | 05 长期：四个误区 / 用药与 FLS / 怎么动 / 筛查闭环 |

共享资源：`assets/css/site.css`（全部样式）、`assets/js/site.js`（进度条、目录高亮、自测计分）。

## 改内容

每个页面都是普通 HTML，直接改文字即可。常用位置：

- 章节标题/导语：`<div class="pagehead">` 里的 `h1` 与 `p.lead`
- 小节标题：`<section class="sec">` 里的 `h2`
- 卡片：`<div class="card">`（`idx` 是小标，`h3` 是标题，`p` 是正文）
- 重点提示：`<div class="callout">`
- 图文：`<figure class="fig">`

改配色只动 `assets/css/site.css` 的 `:root`：

```css
--bg:#05070A; --accent:#00E5C0; --text:#E9EFF4; --mute:#8A99A8;
```

## 加一页新章节（如果需要）

1. 复制 `ch5.html` → 改名（如 `ch6.html`）
2. 改标题、小节内容
3. 在每个页面的 `<nav>` 里加一条 `<li><a href="ch6.html">第 06 章</a></li>`
4. 首页 `chapters` 里加一张卡片

## 断点

- ≥1080px：左目录 + 右正文（双栏）
- 720–1080px：单栏，隐藏目录
- ≤720px：手机单栏

## 素材说明

- `hero.mp4`：Blender 生成的正常腰椎转台（640×960，静音循环）
- `pvp.mp4`：PKP 手术示意动画（30 秒）
- `film_mri3.png`：三联矢状位 MRI（已脱敏）

以上素材均为示意/脱敏内容，不含真实患者身份信息。
