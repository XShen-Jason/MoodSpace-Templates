# 🎁 MoodSpace 模板开发规范 (Developer Guide)

本仓库是模板创作者的"货架"。每个 `src/` 下的子文件夹，都是一套完整的可定制 HTML 网页模板。通过 GitHub Actions 推送后，平台将自动将其存储至对象存储 (R2) 并上架到模板大厅。

> **核心承诺**：创作者在本地浏览器能正常运行的模板，上传后在平台的「大厅预览」和「Builder 实时预览」中，应当表现完全一致。

---

## 🏗️ 一、文件结构

```
src/
└── your_template_name/
    ├── index.html      ← 必须。模板主体，含 {{ 变量 }} 占位符
    ├── config.json     ← 必须。配置文件，定义字段与元数据
    └── preview.jpg     ← 极力推荐。建议 1280x720 (16:9)，用于生成高保真分享海报
```

### 文件夹命名铁律

| ✅ 合法 | ❌ 非法 |
| :--- | :--- |
| `starry_confession` | `StarryConfession` (大写) |
| `film_memory_wall` | `film memory wall` (空格) |
| `love_letter_v2` | `爱情信件` (中文) |

**只允许：小写英文字母、数字、下划线。** 违反命名规则会导致 R2 路径断裂和用户访问 404。

---

## 📄 二、`config.json` 字段说明

### 2.1 根字段（元数据）

| 字段 | 必填 | 默认值 | 说明 |
| :--- | :---: | :--- | :--- |
| `name` | ✅ | — | 技术标识名，**必须与文件夹名完全一致** |
| `title` | ✅ | — | 界面展示名称，支持中文，显示于模板大厅 |
| `tier` | ❌ | `"free"` | 权限分级：`"free"` 体验 / `"pro"` 高级 / `"pro+"` 旗舰 / `"partner"` 合伙人 |
| `scene` | ✅ | — | 场景 ID，必须是预设的 8 种之一 (见 2.2) |
| `categories` | ✅ | — | 情绪分类数组，包含 1 个或多个情绪 ID (见 2.3) |
| `price` | ❌ | `0` | 单独买断价格（单位：元），保留字段 |
| `status` | ❌ | `"active"` | `"active"` 正常展示 / `"offline"` 下架隐藏 |
| `static` | ❌ | `false` | `true` 表示固定模板，无用户可编辑字段 |
| `version` | ❌ | — | 语义化版本号（如 `1.2.0`），用于缓存刷新 |

### 2.2 `fields` 数组（用户输入项）

每个 field 对象定义 Builder 左侧一个输入框：

| 字段 | 必填 | 默认值 | 说明 |
| :--- | :---: | :--- | :--- |
| `id` | ✅ | — | 字段键名，对应 `index.html` 里的 `{{ id }}` |
| `label` | ❌ | 同 id | 输入框标题（显示给用户的中文名） |
| `type` | ❌ | `"text"` | `"text"` 单行 / `"textarea"` 多行 |
| `default` | ❌ | `""` | 字段默认值，用于 Builder 的实时预览初始化 |
| `placeholder` | ❌ | — | 输入框占位提示文字 |

### 2.2 `scene` 场景枚举值
必须从以下 8 个 ID 中选择其一：
- `send_to_them`: 发送给TA
- `self_record`: 记录自我
- `celebrate`: 庆祝 / 纪念
- `repair`: 沟通 / 修复
- `share`: 分享 / 展示
- `self_heal`: 自我疗愈
- `duo_space`: 双人空间
- `explore`: 探索模式

### 2.3 `categories` 情绪分类枚举值
必须包含以下 1 个或多个 ID：
- `love`: 爱 / 想念
- `joy`: 开心 / 喜悦
- `guilt`: 愧疚 / 道歉
- `sadness`: 伤感 / 回忆
- `stress`: 压力 / 焦虑
- `calm`: 平静 / 感谢
- `neutral`: 探索 / 空白

**完整示例：**

```json
{
  "name": "starry_confession",
  "title": "星空告白",
  "version": "1.0.0",
  "status": "active",
  "tier": "free",
  "scene": "send_to_them",
  "categories": ["love"],
  "static": false,
  "fields": [
    { "id": "headline", "label": "主标题", "default": "星空告白", "type": "text" },
    { "id": "confession_body", "label": "告白正文", "default": "我喜欢你。", "type": "textarea" },
    { "id": "main_color", "label": "主色 (HEX)", "default": "#a78bfa", "type": "text" }
  ]
}
```

---

## ✍️ 三、`index.html` 编写规范

### 3.1 变量占位符

使用 `{{ 变量名 }}` 语法（双花括号，变量名用小写 + 下划线），平台在渲染时会将其替换为用户填写的内容：

```html
<title>{{ page_title }}</title>

<style>
  :root {
    --primary: {{ main_color }};   /* ✅ CSS 中可以直接用 */
  }
</style>

<h1>{{ headline }}</h1>
<p>{{ confession_body }}</p>
```

### 3.2 本地预览默认值（强烈推荐）

为了让创作者在本地直接打开 `index.html` 时也有完整的默认展示效果，请在 `<script>` 中加入 `isUninjected()` 检测 + 默认值兜底逻辑：

```html
<script>
  (function () {
      // ✅ 必须用 \{ \} 转义花括号！否则在 Preview 环境正则解析会报 SyntaxError
      return typeof s === "string" && /\{\{\s*[a-z0-9_]+\s*\}\}/.test(s);
    }

    // 检查页面是否已被平台注入数据
    const needsDefaults = isUninjected(document.title) || isUninjected(document.body.textContent);
    if (!needsDefaults) return; // 平台已注入，直接退出

    // 以下默认值仅在「本地预览」或「Gallery 预览」时生效
    const defaults = {
      page_title: "星空告白 · 示例",
      headline: "星空告白",
      main_color: "#a78bfa",
      // ... 其他字段
    };

    document.title = defaults.page_title;
    // 根据情况设置 CSS 变量、文本内容等
  })();
</script>
```

### 3.3 JS 中使用变量的安全规范

这是最容易踩坑的地方，请务必遵守。

#### ❌ 禁止：变量放入单/双引号字符串

```javascript
// 当用户输入包含换行的内容（textarea 类型），注入后变成非法 JS
var images = "{{ modal_gallery_images }}";   // ← SyntaxError！
var density = '{{ bg_star_density }}';        // ← 同理，危险
```

#### ✅ 正确：使用 ES6 反引号（Backtick）包裹变量

反引号原生支持多行字符串，注入任何内容都不会导致语法错误：

```javascript
var images = `{{ modal_gallery_images }}`;   // ✅ 多行安全
var density = `{{ bg_star_density }}`;        // ✅ 安全

// 配合 isUninjected 做兜底：
if (!images || isUninjected(images)) {
  images = "https://default-image.jpg";
}
```

#### ❌ 禁止：正则表达式中花括号不转义

在 `<script>` 中编写匹配 `{{ }}` 的正则时，**必须对 `{` 和 `}` 进行转义**。未转义的 `{{` 在 Preview（无变量替换）环境下，浏览器会把它解析为量词语法并抛出 SyntaxError：

```javascript
// ❌ 错误：未转义，在 Preview 中直接崩溃
/{{\\s*[a-z_]+\\s*}}/.test(s)

// ✅ 正确：转义花括号，所有环境下均安全
/\{\{\s*[a-z0-9_]+\s*\}\}/.test(s)
```

### 3.4 资源路径规范

HTML 中引用的所有外部资源（CSS、JS 文件、图片等）**必须使用相对路径**，禁止以 `/` 开头或写死域名：

```html
<!-- ❌ 错误：会在子域名环境下路径断裂 -->
<link rel="stylesheet" href="/assets/style.css">
<script src="https://example.com/script.js"></script>

<!-- ✅ 正确：相对路径，任何子域名下均可正常加载 -->
<link rel="stylesheet" href="./style.css">
<script src="assets/script.js"></script>
```

### 3.5 移动端响应式

所有模板必须在手机屏幕（375px 宽度基准）上正常显示：

```html
<!-- 必须包含这行 viewport 设置 -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
```

- 禁止使用固定像素宽度（`width: 1200px`）导致横向滚动条
- 使用 `min-width: 0` 配合 flex/grid 防止内容溢出

---

## 🧪 四、发布前自检清单

在推送到 GitHub 之前，请逐项确认：

```
□ 本地在浏览器直接打开 index.html，页面显示正常、按钮可点击
□ config.json 的 name 字段与文件夹名称完全一致
□ JS 中的变量注入全部使用反引号 ` ` `，而非单/双引号
□ isUninjected 正则中的花括号已转义：\{ 和 \}
□ 所有资源路径使用相对路径（无 / 开头，无写死域名）
□ 页面在 375px 宽度下无横向溢出
□ 无遗留调试代码（console.log、alert、测试用硬编码值）
□ config.json 已更新版本号（若修改了已上线模板）
```

---

## 🚀 五、发布流程

### 方式一：GitHub Actions 自动部署（推荐）

向 `main` 分支推送任何 `src/` 内的代码变更，CI 流水线将自动检测改动的模板并上传至 R2：

```bash
git add src/your_template/
git commit -m "feat(template): add starry_confession v1.0.0"
git push origin main
```

**前置配置**（仅需一次）：

在 GitHub 仓库 → `Settings` → `Secrets and variables` → `Actions` 中添加：
- `RS_ADMIN_KEY`：后端管理员密钥
- `RS_WORKER_URL`：API 网关地址（如 `https://api.moodspace.xyz`）

### 方式二：本地手动上传

```bash
# 1. 安装依赖
npm install

# 2. 配置密钥（根目录创建 .env 文件）
echo "RS_ADMIN_KEY=你的密钥" > .env

# 3. 执行上传脚本
node scripts/upload-template.js starry_confession ./src/starry_confession
```

---

## ❓ 六、常见问题排查

| 症状 | 根因 | 解决方法 |
| :--- | :--- | :--- |
| Preview 页面报 `SyntaxError: Unexpected token '}'` | `isUninjected` 正则中花括号未转义 | 改为 `/\{\{...\}\}/` |
| Builder 及 Preview 按钮点不了 | `{{ 变量 }}` 直接放在 JS 双引号字符串中，用户输入包含换行导致语法错误 | 改用反引号包裹 |
| 发布后 CSS/图片资源 404 | 资源路径以 `/` 开头 | 改为相对路径 `./` |
| 本地正常，Gallery 预览全是空白 | 模板没有本地默认值兜底逻辑 | 添加 `isUninjected()` + defaults 检测 |
| 上传后模板大厅不显示新模板 | `config.json` 的 `name` 与文件夹名不一致，或 `status` 为 `"offline"` | 检查 `name` 字段，确保 `status: "active"` |
| 用户端看到 `{{ headline }}` 原始占位符 | 模板字段 id 与 HTML 中的 `{{ }}` 变量名拼写不一致 | 检查 `config.json` 中的 `id` 和 HTML 中的 `{{ id }}` 是否对应 |
