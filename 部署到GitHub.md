# 部署到 GitHub Pages（10 分钟）

> 目标：把这个站点放到公网，得到一个像 `https://你的用户名.github.io/bone-health/` 的链接。
> 全程只需要浏览器，不用装任何软件。

## 你需要做的 5 步

### 1. 注册 / 登录 GitHub
打开 <https://github.com>。没有账号就注册（邮箱验证即可，免费）。

### 2. 新建仓库
右上角 `+` → **New repository**

| 填写项 | 值 |
|---|---|
| Repository name | `bone-health`（可自定义，只能用英文/数字/-） |
| Description | 从骨量流失到不再骨折 · 骨质疏松全链条科普 |
| Public / Private | **必须选 Public**（Private 用不了免费 Pages） |
| 勾选 Add a README file | 勾上 |

点 **Create repository**。

### 3. 上传站点文件
在仓库页点 **Add file → Upload files**，把本目录下的**所有内容**拖进去：

```
index.html
ch1.html  ch2.html  ch3.html  ch4.html  ch5.html
assets/（整个文件夹，含 css、js、视频、图片）
```

> ⚠️ 关键是 **index.html 必须在仓库根目录**，不要多套一层文件夹。

拖完点 **Commit changes**。

### 4. 开启 Pages
仓库页 → **Settings**（顶部）→ 左侧 **Pages**

- Source：**Deploy from a branch**
- Branch：**main** ＋ 目录选 **/ (root)**
- 点 **Save**

### 5. 拿到链接
等 1–2 分钟，刷新这个页面，顶部会出现：

```
Your site is live at https://<用户名>.github.io/bone-health/
```

打开它验证：首页视频能播、五个章节能点、自测能勾选。

---

## 做完之后

把这个链接发我，我把它写进：

1. 报名表「作品简介」末尾（作品链接）
2. 生成一个二维码 PNG（可以贴 PPT / 海报）
3. 顺便检查线上是否有 404 或图片路径问题

---

## 常见问题

| 现象 | 原因 / 处理 |
|---|---|
| 打开是 404 | `index.html` 不在根目录；或 Pages 还没构建完（等 2 分钟再刷） |
| 页面在、图片和视频不显示 | 上传时 `assets` 文件夹没拖进去；或文件名大小写不一致（GitHub 区分大小写） |
| 视频不能播 | 浏览器禁止自动播放：点一下播放按钮即可；`.mp4` 需为 H.264 编码（本项目的已是） |
| 国内访问慢 / 偶尔打不开 | GitHub Pages 走国际线路。可再用 Vercel（同样免费）部署一份做备用：<https://vercel.com> → Import Git Repository → 自动识别静态站点 |
| 想换域名 | Settings → Pages → Custom domain（用平台二级域名不需要备案） |

## 隐私提醒

仓库是 **Public**，任何拿到链接的人都能看到。本项目里没有患者姓名、身份证、原始影像，只有脱敏影像与示意图——上传前确认这一点即可。
