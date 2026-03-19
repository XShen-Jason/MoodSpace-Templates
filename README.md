# RomanceSpace Templates

存放所有可上传到 RomanceSpace 的响应式 HTML 模板。

## 📦 已收录模板

| 模板名 | 中文名称 | 状态 |
|--------|----------|------|
| `anniversary` | 周年纪念 | ✅ |
| `daily_encouragement` | 日常鼓励充电站 | ✅ |
| `emotion_tree_hole` | 情绪树洞与自我对话 | ✅ |
| `endless_romance` | 无尽浪漫 | ✅ |
| `love_letter` | 浪漫情书 | ✅ |
| `relationship_booster` | 人际关系升温卡 | ✅ |
| `self_care_room` | 自我关怀疗愈室 | ✅ |
| `special_moments` | 特殊时刻纪念册 | ✅ |

---

## 🚀 自动上传流程

当你向 `main` 分支 push 代码或合入 PR 时，GitHub Actions 会自动检测 `src/` 下发生变更的模板并进行部署。

### ⚠️ 核心命名规则
- **目录名**：必须且只能包含 **小写字母、数字、下划线** (例如：`love_letter`)。
- **禁止**：使用大写字母、空格、中文字符或特殊符号。这是为了确保 URL 和文件路径的兼容性。
- **强制要求**：每个模板目录下必须包含 `index.html` 和 `config.json`。

---

## 📄 config.json 字段详解

`config.json` 定义了模板的基本信息以及在 **RomanceSpace Builder (制作页面)** 中显示的表单字段。

### 基础字段
- `"name"`: (String) 技术标识符，应与目录名保持一致。
- `"title"`: (String) **界面显示名称**（中文）。将显示在模板大厅和选择菜单中。
- `"tier"`: (String) **定价分级**。可选 `free` (免费) 或 `pro` (会员专享)。默认不填则视为 `free`。
- `"price"`: (Number) **单独定价**。若该模板支持单独购买（不需要 Pro 会员），请设置价格（如 9.9）。
- `"static"`: (Boolean) 是否为静态模板。若为 `true`，用户将无法修改内容。

### fields 数组 (动态配置)
定义用户在制作网页时可以填写的输入框：

| 字段 | 作用 | 对应 Builder 界面 |
| :--- | :--- | :--- |
| `id` | 数据键名 | 渲染时替换 HTML 中的 `{{id}}` |
| `label` | 中文标签 | 输入框上方的提示文字 |
| `type` | 输入类型 | `text` (单行) 或 `textarea` (多行) |
| `default` | 默认值 | 初始填充的内容 |
| `placeholder`| 占位符 | 输入框为空时的提示 |

**示例：**
```json
{
  "id": "message",
  "label": "浪漫留言",
  "type": "textarea",
  "default": "遇见你，是最美的意外。",
  "placeholder": "请输入你想对 TA 说的话..."
}
```

---

## 🎨 视觉与交互标准 (Definition of Done)

所有提交的模板必须符合以下标准，否则 PR 将不予通过：

### 1. 响应式布局 (Mobile First)
- **必须**：通过 CSS 媒体查询适配移动端和 PC 端。
- **禁止**：出现横向滚动条。
- **推荐**：使用 `viewport-fit=cover` 处理刘海屏适配。

### 2. 交互体验
- **资源路径**：必须使用**相对路径**引用 CSS、JS 和图片。
- **加载速度**：单张图片建议压缩到 500KB 以内，尽量使用 WebP 格式。
- **默认效果**：模板在无用户输入（使用默认值）时应具备完整的视觉展示力。

---

## 🛠️ 本地调试与手动上传

1. **安装环境**：`npm install`
2. **配置环境**：创建 `.env` 并填写 `RS_ADMIN_KEY`。可选配置 `RS_WORKER_URL=https://api.moodspace.xyz`。
3. **预览**：直接在浏览器打开 `src/模板名/index.html`（CSS/JS 需引用正确）
4. **手动部署**：
   ```bash
   npm run upload <template_name> ./src/<template_name>
   ```

---

## 🤝 贡献指南

1. **创建分支**：基于 `main` 分支创建功能分支。
2. **遵守命名**：确保文件夹名为全小写下划线格式。
3. **补充配置**：务必在 `config.json` 中配置清晰的 `title` 和 `label`。
4. **检查 Actions**：提交 PR 后，请在 **Actions** 标签页确认自动化部署任务是否成功通过校验。
