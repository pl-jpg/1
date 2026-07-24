(function () {
  const STORAGE_KEY = "lost_found_web_state";
  const SEARCH_KEY = "lost_found_search_history";
  const DEFAULT_AVATAR = "";

  const mockState = {
    userInfo: null,
    lostItems: [
      {
        id: 1,
        type: "lost",
        title: "笔记本电脑丢失",
        description: "在图书馆三楼丢失一台笔记本",
        location: "图书馆三楼",
        time: "2025-05-10 14:30",
        contact: "13800000",
        images: ["4218bb9b73dbce89280e2f1a9ddd1337.jpg"],
        user: {
          avatarUrl: "4218bb9b73dbce89280e2f1a9ddd1337.jpg",
          nickName: "小明"
        },
        comments: []
      },
     
    ],
    foundItems: [
      {
        id: 101,
        type: "found",
        title: "捡到一个钱包",
        description: "在教学楼捡到钱包",
        location: "教学楼A栋大厅",
        time: "2025-05-11 09:15",
        contact: "13800000",
        images: ["images/8998.jpg_wh860.jpg"],
        user: {
          avatarUrl: "images/8998.jpg_wh860.jpg",
          nickName: "钱包"
        },
        comments: []
      },
      {
        id: 102,
        type: "found",
        title: "捡到1块钱",
        description: "在地上捡到1块钱",
        location: "在地上捡到1块钱",
        time: "2025-05-10 17:20",
        contact: "13800000",
        images: ["images/R-C.jpeg"],
        user: {
          avatarUrl: "images/8wbiVsH2Qi.jpg",
          nickName: "一块玩"
        },
        comments: []
      },
       {
        id: 103,
        type: "found",
        title: "手机",
        description: "在食堂二楼捡到一部手机",
        location: "食堂二楼",
        time: "2025-05-09 18:45",
        contact: "13800000",
        images: ["images/fdd2-irtymmw6896357.png"],
        user: {
          avatarUrl: "images/fdd2-irtymmw6896357.png",
          nickName: "手机"
        },
        comments: []
      }
    ],
    messages: [
      {
        id: 1,
        type: "comment",
        content: "有人评论了你的失物信息",
        time: "2025-05-11 10:00",
        itemId: 1,
        read: false
      },
      {
        id: 2,
        type: "reply",
        content: "有人回复了你的评论",
        time: "2025-05-10 18:30",
        itemId: 101,
        read: false
      }
      
    ]
  };

  let state = loadState();
  let route = { page: "home", params: { tab: 0 } };
  const stack = [];
  const view = document.getElementById("view");
  const tabBar = document.getElementById("tabBar");
  const pageTitle = document.getElementById("pageTitle");
  const backBtn = document.getElementById("backBtn");
  const toast = document.getElementById("toast");

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return structuredClone(mockState);
      const parsed = JSON.parse(saved);
      return {
        ...structuredClone(mockState),
        ...parsed,
        lostItems: (parsed.lostItems || []).map(normalizeItem),
        foundItems: (parsed.foundItems || []).map(normalizeItem),
        messages: parsed.messages || []
      };
    } catch (error) {
      return structuredClone(mockState);
    }
  }

  function normalizeItem(item) {
    return {
      comments: [],
      contact: "未填写",
      images: [],
      user: { avatarUrl: DEFAULT_AVATAR, nickName: "匿名用户" },
      ...item
    };
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function tag(item) {
    const type = item.type === "lost" ? "lost" : "found";
    const text = item.type === "lost" ? "失物" : "招领";
    return `<span class="tag ${type}">${text}</span>`;
  }

  function avatar(src) {
    if (src) return escapeHtml(src);
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' rx='60' fill='%23e6f4ff'/%3E%3Ctext x='60' y='70' text-anchor='middle' font-size='44' fill='%231677ff'%3E%E4%BA%BA%3C/text%3E%3C/svg%3E";
  }

  function allItems() {
    return [...state.lostItems, ...state.foundItems].sort((a, b) => new Date(b.time) - new Date(a.time));
  }

  function findItem(id) {
    const itemId = Number(id);
    return allItems().find((item) => item.id === itemId);
  }

  function formatNow() {
    const now = new Date();
    const pad = (num) => String(num).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      toast.hidden = true;
    }, 1600);
  }

  function navigate(page, params = {}, push = true) {
    if (push) stack.push(route);
    route = { page, params };
    render();
  }

  function goBack() {
    if (stack.length) {
      route = stack.pop();
      render();
    } else {
      navigate("home", { tab: 0 }, false);
    }
  }

  function setChrome(title, showTab) {
    pageTitle.textContent = title;
    tabBar.classList.toggle("is-hidden", !showTab);
    view.classList.toggle("no-tab", !showTab);
    backBtn.classList.toggle("is-hidden", showTab && route.page === "home");
    [...tabBar.querySelectorAll(".tab-item")].forEach((button) => {
      button.classList.toggle("active", button.dataset.page === route.page);
    });
  }

  function renderItemCard(item) {
    const image = item.images && item.images[0]
      ? `<img class="item-image" src="${escapeHtml(item.images[0])}" alt="${escapeHtml(item.title)}">`
      : "";
    return `
      <article class="card item-card" data-action="detail" data-id="${item.id}">
        <div class="item-head">
          <img class="avatar" src="${avatar(item.user && item.user.avatarUrl)}" alt="">
          <div class="grow">
            <span class="nickname">${escapeHtml(item.user && item.user.nickName)}</span>
            <span class="time">${escapeHtml(item.time)}</span>
          </div>
          ${tag(item)}
        </div>
        <div class="item-body">
          <strong class="item-title">${escapeHtml(item.title)}</strong>
          <p class="desc clamp">${escapeHtml(item.description)}</p>
          <div class="meta-line">📍 ${escapeHtml(item.location)}</div>
          ${image}
        </div>
        <div class="item-foot">💬 ${(item.comments || []).length}</div>
      </article>
    `;
  }

  function renderHome() {
    setChrome("失物招领", true);
    const tab = Number(route.params.tab || 0);
    const tabs = ["全部", "失物", "招领"];
    const items = tab === 0 ? allItems() : tab === 1 ? [...state.lostItems] : [...state.foundItems];
    items.sort((a, b) => new Date(b.time) - new Date(a.time));
    view.innerHTML = `
      <section class="search-card" data-action="search">⌕ <span>搜索失物/招领信息</span></section>
      <section class="home-tabs">
        ${tabs.map((item, index) => `<button class="${tab === index ? "active" : ""}" data-action="home-tab" data-tab="${index}">${item}</button>`).join("")}
      </section>
      <section>${items.map(renderItemCard).join("") || `<div class="empty">暂无信息</div>`}</section>
      <button class="float-btn" data-action="publish" aria-label="发布">+</button>
    `;
  }

  function renderDetail() {
    const item = findItem(route.params.id);
    setChrome("详情", false);
    if (!item) {
      view.innerHTML = `<div class="empty">信息不存在</div>`;
      return;
    }
    const images = (item.images || []).map((src) => `<img class="detail-image" src="${escapeHtml(src)}" alt="${escapeHtml(item.title)}">`).join("");
    const comments = (item.comments || []).map((comment) => `
      <div class="comment-item">
        <img class="avatar" src="${avatar(comment.user && comment.user.avatarUrl)}" alt="">
        <div class="grow">
          <div class="result-head">
            <span class="nickname">${escapeHtml(comment.user && comment.user.nickName)}</span>
            <span class="time">${escapeHtml(comment.time)}</span>
          </div>
          <p class="desc">${escapeHtml(comment.content)}</p>
        </div>
      </div>
    `).join("");
    view.innerHTML = `
      <section class="card">
        <div class="item-head">
          <img class="avatar" src="${avatar(item.user && item.user.avatarUrl)}" alt="">
          <div class="grow">
            <span class="nickname">${escapeHtml(item.user && item.user.nickName)}</span>
            <span class="time">${escapeHtml(item.time)}</span>
          </div>
          ${tag(item)}
        </div>
      </section>
      <section class="detail-content">
        <h2 class="detail-title">${escapeHtml(item.title)}</h2>
        ${images}
        <p class="desc">${escapeHtml(item.description)}</p>
        <div class="meta-line">📍 ${escapeHtml(item.location)}</div>
        <div class="meta-line" style="margin-top:10px">☎ ${escapeHtml(item.contact || "未填写")}</div>
      </section>
      <section class="comments">
        <h3 class="section-title">评论 (${(item.comments || []).length})</h3>
        ${comments || `<div class="empty">暂无评论，快来发表你的看法吧</div>`}
      </section>
      <form class="comment-bottom" data-action="comment-form">
        <input name="comment" placeholder="发表评论" autocomplete="off">
        <button type="submit">发布</button>
        <button type="button" data-action="share">分享</button>
      </form>
    `;
  }

  function renderSearch() {
    setChrome("搜索", true);
    const keyword = route.params.keyword || "";
    const showResult = Boolean(route.params.showResult);
    const history = JSON.parse(localStorage.getItem(SEARCH_KEY) || "[]");
    const result = showResult
      ? allItems().filter((item) => {
          const text = `${item.title} ${item.description} ${item.location}`;
          return text.includes(keyword);
        })
      : [];

    view.innerHTML = `
      <form class="search-row" data-action="search-form">
        <label class="search-card">
          ⌕
          <input class="search-input" name="keyword" value="${escapeHtml(keyword)}" placeholder="搜索失物/招领信息">
        </label>
        <button class="link-btn" type="button" data-action="home">取消</button>
      </form>
      <button class="primary-btn" data-action="do-search">搜索</button>
      ${showResult ? `
        <section class="panel" style="margin-top:16px">
          <h3 class="section-title">搜索结果 (${result.length})</h3>
          ${result.map(renderResult).join("") || `<div class="empty">没有找到相关结果</div>`}
        </section>
      ` : `
        <section class="panel" style="margin-top:16px">
          <div class="result-head">
            <strong>搜索历史</strong>
            <button class="link-btn" data-action="clear-history">清空</button>
          </div>
          <div class="history-keywords">
            ${history.map((word) => `<button class="chip" data-action="history-search" data-keyword="${escapeHtml(word)}">${escapeHtml(word)}</button>`).join("") || `<span class="time">暂无搜索历史</span>`}
          </div>
        </section>
      `}
    `;
  }

  function renderResult(item) {
    return `
      <article class="result-item" data-action="detail" data-id="${item.id}">
        <div class="result-head">
          <strong>${escapeHtml(item.title)}</strong>
          ${tag(item)}
        </div>
        <p class="desc clamp">${escapeHtml(item.description)}</p>
        <div class="meta-line">📍 ${escapeHtml(item.location)}</div>
      </article>
    `;
  }

  function renderPublish() {
    const type = route.params.type || "lost";
    setChrome("发布", false);
    view.innerHTML = `
      <h2 class="form-title">发布${type === "lost" ? "失物" : "招领"}信息</h2>
      <form class="form" data-action="publish-form">
        <div class="field">
          <span class="label">类型</span>
          <div class="radio-row">
            <label><input type="radio" name="type" value="lost" ${type === "lost" ? "checked" : ""}> 失物</label>
            <label><input type="radio" name="type" value="found" ${type === "found" ? "checked" : ""}> 招领</label>
          </div>
        </div>
        <div class="field">
          <label for="title">标题</label>
          <input id="title" name="title" placeholder="请输入标题" required>
        </div>
        <div class="field">
          <label for="description">描述</label>
          <textarea id="description" name="description" placeholder="请描述物品信息" required></textarea>
        </div>
        <div class="field">
          <label for="location">地点</label>
          <input id="location" name="location" placeholder="请输入地点" required>
          <div class="location-options" style="margin-top:10px">
            ${["图书馆", "食堂", "教学楼", "宿舍", "体育馆", "操场", "大门"].map((item) => `<button type="button" class="chip" data-action="select-location" data-location="${item}">${item}</button>`).join("")}
          </div>
        </div>
        <div class="field">
          <label for="contact">联系电话</label>
          <input id="contact" name="contact" placeholder="请输入手机号码或其他联系方式" required>
        </div>
        <div class="field">
          <span class="label">上传图片</span>
          <div class="image-list" id="imageList">
            <label class="upload-box">
              <input type="file" id="imageInput" accept="image/*" multiple hidden>
              <span>＋<br>上传图片</span>
            </label>
          </div>
          <span class="time">最多上传3张图片，网页版本会临时保存到浏览器本地</span>
        </div>
        <button class="primary-btn" type="submit">发布</button>
      </form>
    `;
    wireImageUpload();
  }

  function renderMessage() {
    setChrome("消息", true);
    const messages = [...state.messages].sort((a, b) => new Date(b.time) - new Date(a.time));
    view.innerHTML = `
      <section>
        ${messages.map((message, index) => `
          <article class="message-item ${message.read ? "" : "unread"}" data-action="message" data-id="${message.id}">
            <div class="message-icon">${message.type === "comment" ? "💬" : "↩"}</div>
            <div class="grow">
              <span class="nickname">${escapeHtml(message.content)}</span>
              <span class="time">${escapeHtml(message.time)}</span>
            </div>
            ${message.read ? "" : `<span class="unread-dot"></span>`}
          </article>
        `).join("") || `<div class="empty">暂无消息</div>`}
      </section>
      ${messages.length ? `<button class="secondary-btn" data-action="read-all">清除全部已读消息</button>` : ""}
    `;
  }

  function renderUser() {
    setChrome("我的", true);
    const user = state.userInfo || { avatarUrl: DEFAULT_AVATAR, nickName: "匿名用户" };
    const isLogin = user.nickName && user.nickName !== "匿名用户";
    const myLost = isLogin ? state.lostItems.filter((item) => item.user && item.user.nickName === user.nickName) : [];
    const myFound = isLogin ? state.foundItems.filter((item) => item.user && item.user.nickName === user.nickName) : [];
    view.innerHTML = `
      <section class="profile" data-action="${isLogin ? "" : "login"}">
        <img class="avatar" src="${avatar(user.avatarUrl)}" alt="">
        <div class="grow">
          <span class="nickname">${escapeHtml(isLogin ? user.nickName : "点击登录")}</span>
          <span class="time">发布失物招领信息，查看互动消息</span>
        </div>
      </section>
      <section class="function-grid">
        <button data-action="publish-lost"><strong>失</strong><span>发布失物</span></button>
        <button data-action="publish-found"><strong>招</strong><span>发布招领</span></button>
        <button data-action="${isLogin ? "logout" : "login"}"><strong>${isLogin ? "退" : "登"}</strong><span>${isLogin ? "退出登录" : "登录"}</span></button>
      </section>
      <section class="panel">
        <h3 class="section-title">我的发布</h3>
        ${renderMyPosts("失物", myLost)}
        ${renderMyPosts("招领", myFound)}
      </section>
    `;
  }

  function renderMyPosts(label, items) {
    return `
      <div class="type-head">
        <strong>${label} (${items.length})</strong>
        <span class="time">查看全部</span>
      </div>
      <div>
        ${items.slice(0, 2).map((item) => `
          <article class="post-item" data-action="detail" data-id="${item.id}">
            <strong>${escapeHtml(item.title)}</strong>
            <span class="time">${escapeHtml(item.time)}</span>
          </article>
        `).join("") || `<div class="empty" style="min-height:72px">暂无${label}信息</div>`}
      </div>
    `;
  }

  function render() {
    if (route.page === "home") renderHome();
    if (route.page === "detail") renderDetail();
    if (route.page === "search") renderSearch();
    if (route.page === "publish") renderPublish();
    if (route.page === "message") renderMessage();
    if (route.page === "user") renderUser();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function getSearchKeyword() {
    const input = view.querySelector('input[name="keyword"]');
    return input ? input.value.trim() : "";
  }

  function doSearch(keyword) {
    const word = (keyword || getSearchKeyword()).trim();
    if (!word) {
      showToast("请输入搜索关键词");
      return;
    }
    const history = JSON.parse(localStorage.getItem(SEARCH_KEY) || "[]").filter((item) => item !== word);
    history.unshift(word);
    localStorage.setItem(SEARCH_KEY, JSON.stringify(history.slice(0, 10)));
    navigate("search", { keyword: word, showResult: true }, false);
  }

  function handlePublish(form) {
    const data = new FormData(form);
    const type = data.get("type");
    const title = String(data.get("title") || "").trim();
    const description = String(data.get("description") || "").trim();
    const location = String(data.get("location") || "").trim();
    const contact = String(data.get("contact") || "").trim();
    const images = [...form.querySelectorAll(".image-preview img")].map((img) => img.src);

    if (!title) return showToast("请输入标题");
    if (!description) return showToast("请输入描述");
    if (!location) return showToast("请输入地点");
    if (!contact) return showToast("请输入联系方式");

    const newItem = {
      id: Date.now(),
      type,
      title,
      description,
      location,
      contact,
      time: formatNow(),
      images,
      user: state.userInfo || { avatarUrl: DEFAULT_AVATAR, nickName: "匿名用户" },
      comments: []
    };
    if (type === "lost") {
      state.lostItems.unshift(newItem);
    } else {
      state.foundItems.unshift(newItem);
    }
    state.messages.unshift({
      id: Date.now() + 1,
      type: "comment",
      content: `你的${type === "lost" ? "失物" : "招领"}信息已发布`,
      time: formatNow(),
      itemId: newItem.id,
      read: false
    });
    saveState();
    showToast("发布成功");
    navigate("home", { tab: 0 }, false);
  }

  function postComment(form) {
    const input = form.querySelector('input[name="comment"]');
    const content = input.value.trim();
    const item = findItem(route.params.id);
    if (!content) return showToast("请输入评论内容");
    if (!item) return showToast("信息不存在");

    const newComment = {
      user: state.userInfo || { avatarUrl: DEFAULT_AVATAR, nickName: "匿名用户" },
      content,
      time: formatNow()
    };
    item.comments = [newComment, ...(item.comments || [])];
    state.messages.unshift({
      id: Date.now(),
      type: "comment",
      content: "有人评论了你的信息",
      time: formatNow(),
      itemId: item.id,
      read: false
    });
    saveState();
    showToast("评论成功");
    renderDetail();
  }

  function login() {
    const nickName = prompt("请输入昵称", "网页用户");
    if (!nickName) return;
    state.userInfo = {
      nickName: nickName.trim(),
      avatarUrl: DEFAULT_AVATAR
    };
    saveState();
    showToast("登录成功");
    renderUser();
  }

  function logout() {
    if (!confirm("确定要退出登录吗？")) return;
    state.userInfo = null;
    saveState();
    showToast("已退出登录");
    renderUser();
  }

  function wireImageUpload() {
    const input = document.getElementById("imageInput");
    const list = document.getElementById("imageList");
    if (!input || !list) return;

    input.addEventListener("change", () => {
      const files = [...input.files].slice(0, 3 - list.querySelectorAll(".image-preview").length);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const previewCount = list.querySelectorAll(".image-preview").length;
          if (previewCount >= 3) return;
          const node = document.createElement("div");
          node.className = "image-preview";
          node.innerHTML = `<img src="${reader.result}" alt="上传图片"><button type="button" data-action="delete-image">×</button>`;
          list.insertBefore(node, list.querySelector(".upload-box"));
          if (list.querySelectorAll(".image-preview").length >= 3) {
            list.querySelector(".upload-box").style.display = "none";
          }
        };
        reader.readAsDataURL(file);
      });
      input.value = "";
    });
  }

  view.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;

    if (action === "detail") navigate("detail", { id: target.dataset.id });
    if (action === "search") navigate("search");
    if (action === "home") navigate("home", { tab: 0 });
    if (action === "home-tab") navigate("home", { tab: target.dataset.tab }, false);
    if (action === "publish") navigate("publish");
    if (action === "publish-lost") navigate("publish", { type: "lost" });
    if (action === "publish-found") navigate("publish", { type: "found" });
    if (action === "do-search") doSearch();
    if (action === "history-search") doSearch(target.dataset.keyword);
    if (action === "clear-history") {
      localStorage.removeItem(SEARCH_KEY);
      renderSearch();
    }
    if (action === "select-location") {
      const input = document.getElementById("location");
      input.value = target.dataset.location;
      [...view.querySelectorAll(".chip")].forEach((button) => button.classList.remove("active"));
      target.classList.add("active");
    }
    if (action === "delete-image") {
      const preview = target.closest(".image-preview");
      preview.remove();
      const upload = document.querySelector(".upload-box");
      if (upload) upload.style.display = "grid";
    }
    if (action === "share") {
      const item = findItem(route.params.id);
      if (navigator.share && item) {
        navigator.share({ title: item.title, text: item.description, url: location.href }).catch(() => {});
      } else {
        showToast("当前浏览器不支持系统分享");
      }
    }
    if (action === "message") {
      const message = state.messages.find((item) => item.id === Number(target.dataset.id));
      if (!message) return;
      message.read = true;
      saveState();
      if (message.itemId && findItem(message.itemId)) {
        navigate("detail", { id: message.itemId });
      } else {
        renderMessage();
      }
    }
    if (action === "read-all") {
      if (!confirm("确定要清除所有消息吗？")) return;
      state.messages.forEach((message) => {
        message.read = true;
      });
      saveState();
      showToast("已清除所有消息");
      renderMessage();
    }
    if (action === "login") login();
    if (action === "logout") logout();
  });

  view.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.target;
    const action = form.dataset.action;
    if (action === "search-form") doSearch();
    if (action === "publish-form") handlePublish(form);
    if (action === "comment-form") postComment(form);
  });

  view.addEventListener("change", (event) => {
    if (event.target.name === "type" && route.page === "publish") {
      route.params.type = event.target.value;
      const title = view.querySelector(".form-title");
      if (title) title.textContent = `发布${event.target.value === "lost" ? "失物" : "招领"}信息`;
    }
  });

  tabBar.addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (!button) return;
    const page = button.dataset.page;
    navigate(page, page === "home" ? { tab: 0 } : {}, false);
  });

  backBtn.addEventListener("click", goBack);

  render();
})();
