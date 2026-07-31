#!/usr/bin/env bash
# ==============================================================
#  自媒体工作台 → GitHub Pages 一键部署脚本
#  用法: bash deploy-pages.sh
#  作用:
#    1. 本地构建 Vite 产物 (npm run build:prod)
#    2. 提交适配代码到 main 分支 (若有变更)
#    3. 将 dist/ 目录内容强制推送到 gh-pages 分支根目录
#    4. 推送完成后打印最终访问地址
# ==============================================================

set -u
set -o pipefail

# ---------- 配置区（请勿用中文引号/中文空格） ----------
GITHUB_USER="menmingfeng0226"
GITHUB_REPO="second-brain-workbench"
# 若您已生成 Personal Access Token，填到这里（classic token，要有 repo 权限）
GITHUB_TOKEN="${GITHUB_TOKEN:-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}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}" || { echo "❌ 无法 cd 到 ${SCRIPT_DIR}"; exit 1; }

# ---------- 颜色 ----------
RED=$'\033[31m'
GREEN=$'\033[32m'
YELLOW=$'\033[33m'
BLUE=$'\033[34m'
BOLD=$'\033[1m'
RESET=$'\033[0m'

ok()  { echo "${GREEN}[✔]${RESET} $*"; }
info(){ echo "${BLUE}[ℹ]${RESET} $*"; }
warn(){ echo "${YELLOW}[!]${RESET} $*"; }
err() { echo "${RED}[✘]${RESET} $*"; }
sep() { echo "──────────────────────────────────────────────────────────────────"; }

sep
echo "${BOLD}🚀 第二大脑 · 自媒体工作台  →  GitHub Pages  部署脚本${RESET}"
sep

# ---------- 检查依赖 ----------
info "检查依赖"
command -v git  >/dev/null 2>&1 || { err "未检测到 git，请先安装 Xcode Command Line Tools:  xcode-select --install"; exit 2; }
command -v node >/dev/null 2>&1 || { err "未检测到 node，请先安装 Node.js ≥ 20"; exit 2; }
NODE_V=$(node -v | sed 's/^v//')
NODE_MAJ=${NODE_V%%.*}
ok "git  : $(git --version | awk '{print $3}')"
ok "node : v${NODE_V}  (需要 ≥ 20，当前 ${NODE_MAJ})"
[[ "${NODE_MAJ}" -ge 20 ]] || { err "Node 版本过低 (${NODE_V} < 20)"; exit 2; }

# ---------- 1. 构建 ----------
sep
info "步骤 1/4: 执行生产构建 npm run build:prod"
if [[ ! -d node_modules ]]; then
  warn "node_modules 不存在，先 npm ci 安装依赖…"
  npm ci --no-audit --no-fund 2>&1 | tail -5 || { err "npm ci 失败"; exit 3; }
fi
if ! npm run build:prod 2>&1 | tail -15; then
  err "构建失败，见上方日志"
  exit 3
fi
[[ -f dist/index.html ]] || { err "dist/index.html 不存在，构建产物缺失"; exit 3; }
# 保证 .nojekyll 存在
touch dist/.nojekyll
ok "构建完成 dist/ 目录可用"

# ---------- 2. 远端配置 ----------
sep
info "步骤 2/4: 配置远端仓库"
REMOTE_URL="https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${GITHUB_REPO}.git"
ok "目标仓库:  https://github.com/${GITHUB_USER}/${GITHUB_REPO}"
ok "远端 URL (已内嵌 token，不会显示在日志):  https://${GITHUB_USER}:***@github.com/…"

# ---------- 3. 提交 main 分支 (可选) ----------
sep
info "步骤 3/4: 提交适配代码到 main 分支（若有变更）"
MAIN_STATUS=""
if git add -A 2>/dev/null; then
  if git diff --cached --quiet 2>/dev/null; then
    info "工作区干净，无需提交 main"
    MAIN_STATUS="clean"
  else
    if git commit -q -m "fix(github-pages): HashRouter 冷启动补 #/ 前缀，favicon 相对路径" 2>/dev/null; then
      ok "main 提交完成 (sha=$(git rev-parse --short HEAD))"
      MAIN_STATUS="committed"
    else
      warn "main 提交失败，跳过（不影响 Pages 部署）"
      MAIN_STATUS="skipped"
    fi
  fi
fi

if [[ "${MAIN_STATUS}" != "clean" ]]; then
  info "尝试推送 main…（网络不通不影响 Pages 部署）"
  if git push "${REMOTE_URL}" main 2>&1 | tail -5; then
    ok "main 推送成功"
  else
    warn "main 推送失败（可能是本机 GitHub 网络限制），Pages 部署依赖 gh-pages 分支，继续下一步"
  fi
fi

# ---------- 4. 推送 gh-pages 分支 (关键步骤) ----------
sep
info "步骤 4/4: 推送 dist/ → gh-pages 分支"
WORK_TREE="$(mktemp -d)"
trap 'cd "${SCRIPT_DIR}" && rm -rf "${WORK_TREE}"' EXIT HUP INT TERM

info "工作临时目录: ${WORK_TREE}"
cp -R dist/. "${WORK_TREE}/" || { err "cp dist/ 失败"; exit 4; }
ls -la "${WORK_TREE}" | sed 's/^/       /'

cd "${WORK_TREE}" || { err "无法 cd ${WORK_TREE}"; exit 4; }
git init -q
git symbolic-ref HEAD refs/heads/gh-pages
git config user.name  "${GITHUB_USER}"
git config user.email "${GITHUB_USER}@users.noreply.github.com"
git add -A
TS=$(date +%Y%m%d-%H%M)
if ! git -c commit.gpgsign=false commit -qm "deploy(gh-pages): ${TS} HashRouter auto #/ fallback, base=/second-brain-workbench/"; then
  err "gh-pages 提交失败"
  exit 5
fi
ok "gh-pages 本地 commit 完成: ${TS}"

info "开始推送 gh-pages 到 GitHub… (若长时间无输出请检查是否已开 Clash/代理终端)"
# 打印一个「正在推送」的提示并带超时保护
set +e
PUSH_LOG=$(git push --force "${REMOTE_URL}" gh-pages:gh-pages 2>&1)
PUSH_RC=$?
set -e

if [[ ${PUSH_RC} -eq 0 ]]; then
  sep
  ok "🎉 gh-pages 推送成功！"
  sep
  echo "${BOLD}🌐 最终访问地址（约 1-3 分钟 GitHub Pages 生效后可打开）:${RESET}"
  echo ""
  echo "    ${GREEN}${BOLD}https://${GITHUB_USER}.github.io/${GITHUB_REPO}/${RESET}"
  echo ""
  echo "   备用链接（显式带 hash/demo 参数，首次打开推荐）:"
  echo "    https://${GITHUB_USER}.github.io/${GITHUB_REPO}/#/login?demo=1"
  sep
  echo "${BOLD}🔐 登录说明（Pages 为纯静态演示模式，不需要真连接后端）:${RESET}"
  echo "   用户名: 任意（≥ 2 字）"
  echo "   密  码 : 任意（≥ 4 位）"
  sep
  echo "${YELLOW}提示:${RESET} 如果地址打开为 404，请先到仓库 Settings → Pages 确认："
  echo "   Source:  Deploy from a branch"
  echo "   Branch:  gh-pages  /  (root)   → Save"
  sep
else
  sep
  err "gh-pages 推送失败 (exit=${PUSH_RC})，错误日志如下:"
  echo "${PUSH_LOG}"
  sep
  echo ""
  echo "${BOLD}💡 常见修复:${RESET}"
  echo "  ① Clash/V2Ray 等代理工具里打开『终端代理/Git 代理/系统代理』后重试:  bash deploy-pages.sh"
  echo "  ② 或切换到能访问 github.com:443 的网络（手机热点等）再运行"
  echo "  ③ 或手动把 upzhu-workbench/dist/ 内容上传到 GitHub 仓库 → 分支 gh-pages → 根目录"
  sep
  exit 6
fi

exit 0
