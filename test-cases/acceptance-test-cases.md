# 图书馆噪声巡检系统 - 验收测试用例

## 测试用例编号: TC-LIB-NOISE-001

### 测试场景: 录入高分贝数据并验证区域状态变为告警

**版本**: 2.0 (自动化验收版)
**创建日期**: 2026-06-08
**测试类型**: 自动化验收测试
**前置条件**:
- 项目文件完整 (index.html, css/style.css, js/mock-data.js, js/app.js)
- Python 3 可用
- MCP 集成浏览器可用
- 端口可用 (默认 8000 或通过 PORT 参数指定)

---

## 第一部分: 静态代码检查 (自动化)

| 步骤 | 检查内容 | 预期结果 | 断言方法 |
|------|----------|----------|----------|
| S1 | 项目文件存在性检查 | index.html, css/style.css, js/mock-data.js, js/app.js 均存在 | 检查文件是否存在 |
| S2 | 分贝-状态映射逻辑 | 40dB→normal, 50dB→normal, 51dB→warning, 65dB→warning, 66dB→alarm, 72dB→alarm | Bash 函数验证 |
| S3 | 样例数据 - 告警区域数量 | areas 数组中 status='alarm' 的数量为 2 | `awk` 精确解析 areas 数组 |
| S4 | 样例数据 - 预警区域数量 | areas 数组中 status='warning' 的数量为 3 | `awk` 精确解析 areas 数组 |
| S5 | 样例数据 - 正常区域数量 | areas 数组中 status='normal' 的数量为 9 | `awk` 精确解析 areas 数组 |
| S6 | 馆员权限配置 | librarian.permissions = ['view', 'edit', 'create_area', 'export', 'manage_reminders'] | `awk` 精确匹配权限数组 |
| S7 | 读者权限配置 | reader.permissions = ['view'] | `awk` 精确匹配权限数组 |
| S8 | 闪烁动画定义 | CSS 中存在 @keyframes flash | 精确 grep |
| S9 | 闪烁样式类 | CSS 中存在 .flashing 类 | 精确 grep |
| S10 | 提醒处理成功逻辑 | 存在 handleReminder 函数处理 success 分支 | 精确 grep |
| S11 | 提醒处理失败逻辑 | 存在 handleReminder 函数处理 fail 分支 | 精确 grep |
| S12 | localStorage 写入 | 存在 localStorage.setItem 调用 | 精确 grep |
| S13 | localStorage 读取 | 存在 localStorage.getItem 调用 | 精确 grep |
| S14 | 数据导出函数 | 存在 exportInspectionData 函数定义 | 精确 grep |
| S15 | JSON 导出逻辑 | exportInspectionData 函数内存在 JSON.stringify 和 .download | 范围 grep |
| S16 | CSV 导出逻辑 | exportInspectionData 函数内存在 csv 变量和 .download | 范围 grep |

---

## 第二部分: 动态浏览器测试 (自动化)

### 测试前置准备
- 启动 HTTP 服务器 (端口自动检测或通过 PORT 参数)
- 清空浏览器 localStorage 以保证测试数据纯净
- 导航到 http://localhost:${PORT}

| 步骤 | 操作 | 预期结果 | 断言方法 |
|------|------|----------|----------|
| D1 | 页面加载验证 | 页面标题为「图书馆噪声巡检地图」，HTTP 状态 200 | `browser_navigate` + 检查 title |
| D2 | 初始角色验证 | 默认角色为「读者」，无「噪声录入」和「馆员操作」面板 | 检查 roleSelect 值 + 元素可见性 |
| D3 | 切换到馆员角色 | 选择「馆员」，显示「噪声录入」和「馆员操作」面板 | `browser_select_option` + 检查元素显示 |
| D4 | 记录初始状态 | 记录告警区域计数、提醒列表数量、目标区域状态 | DOM 元素内容提取 |
| D5 | 选择正常区域 | 在噪声录入面板选择「自习区1」(A103，初始状态 normal，约 38dB) | `browser_select_option` |
| D6 | 录入高分贝数据 | 分贝值输入 75，备注输入「自动测试-高分贝」，点击提交 | `browser_type` + `browser_click` |
| D7 | 断言: 成功响应消息 | 显示 Toast 消息包含「录入成功」和「告警」 | 检查 Toast 元素文本 |
| D8 | 断言: 区域状态变更 | 区域下拉框中「自习区1」显示为 75dB | 检查 select option 文本 |
| D9 | 断言: 告警闪烁类 | 地图上对应区域元素包含 `flashing` CSS 类 | `browser_get_attribute` 检查 class |
| D10 | 断言: 提醒列表新增 | 提醒列表数量比初始值 +1 | DOM 元素计数 |
| D11 | 断言: 告警计数增加 | 告警区域计数比初始值 +1 | 检查趋势卡片数字 |
| D12 | 测试: 提醒处理成功 | 点击新提醒的「✓ 已处理」按钮 | `browser_click` |
| D13 | 断言: 处理成功响应 | 显示成功消息，区域恢复正常，提醒从列表消失 | Toast 文本 + DOM 检查 |
| D14 | 重新录入高分贝 | 再次给「自习区1」录入 70dB | 重复步骤 D5-D6 |
| D15 | 测试: 提醒处理失败 | 点击新提醒的「✗ 处理失败」按钮 | `browser_click` |
| D16 | 断言: 处理失败响应 | 显示失败消息，列表新增「重新安排巡检」提醒，原提醒半透明 | Toast 文本 + DOM 检查 |
| D17 | 测试: 切换到读者角色 | 选择「读者」角色 | `browser_select_option` |
| D18 | 断言: 读者权限限制 | 「噪声录入」和「馆员操作」面板隐藏，提醒无处理按钮 | 元素可见性检查 |
| D19 | 清理: 清空本地数据 | 切换回馆员，点击「清空本地数据」按钮 | 恢复初始状态 |

---

## 第三部分: 端口检测逻辑

| 场景 | 处理逻辑 |
|------|----------|
| 传入 PORT 参数 | 使用指定端口，如不可用则报错退出 |
| 未传入 PORT 参数 | 从 8000 开始递增检测可用端口，找到第一个可用端口 |
| 端口检测方法 | 使用 `lsof -i :${PORT}` 或 `nc -z localhost ${PORT}` |

---

## 测试通过标准

✅ **所有静态代码检查 (S1-S16) 全部通过**
✅ **所有动态浏览器测试 (D1-D19) 全部通过**
✅ **服务器正常启动和停止**
✅ **无 JavaScript 控制台错误**
✅ **退出码为 0**

---

## 失败处理

- 任何步骤失败立即终止测试
- 输出详细错误信息和失败步骤
- 生成失败截图 (如浏览器测试失败)
- 服务器自动清理退出
- 退出码为非 0

---

## 变更记录

| 版本 | 日期 | 变更内容 | 变更人 |
|------|------|----------|--------|
| 1.0 | 2026-06-05 | 初始版本，手动测试步骤 | - |
| 2.0 | 2026-06-08 | 改为全自动化验收测试，修复 grep 误判，增加端口检测，新增测试用例文档 | - |
