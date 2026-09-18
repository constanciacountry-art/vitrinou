```javascript
const KEY = "vitrinouData";

const SUPABASE_URL = "https://wdaccrdueqjphnwwnevn.supabase.co";
const SUPABASE_KEY = "sb_publishable_8f19WYiZMSHDpCm9TS_mQQ_UXHsZ-Y9";
const SUPABASE_BUCKET = "produtos";

let data = JSON.parse(localStorage.getItem(KEY)) || {
  settings: {
    name: "Vitrinou",
    title: "Confira nossos produtos",
    text: "Escolha seus produtos e fale conosco pelo WhatsApp.",
    whatsapp: "",
    password: "123456"
  },
  products: []
};

data.settings.password ??= "123456";

let editing = null;
let currentImageUrl = "";

const $ = id => document.getElementById(id);

function save() {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function renderList() {
  $("adminProducts").innerHTML =
    data.products.map(p => `
      <div class="admin-item">
        <img src="${p.image || "https://via.placeholder.com/100"}">
        <div class="grow">
          <b>${p.name}</b><br>
          ${Number(p.price).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
          })} · ${p.status}
        </div>
        <button onclick="edit('${p.id}')">Editar</button>
      </div>
    `).join("") || "<p>Nenhum produto cadastrado.</p>";
}

function open(p) {
  editing = p?.id || null;

  $("modalTitle").textContent =
    editing ? "Editar produto" : "Novo produto";

  $("pName").value = p?.name || "";
  $("pPrice").value = p?.price || "";
  $("pCategory").value = p?.category || "";
  $("pDescription").value = p?.description || "";
  $("pStatus").value = p?.status || "Disponível";

  currentImageUrl = p?.image || "";

  $("pImage").value = "";

  $("imagePreview").innerHTML = currentImageUrl
    ? `<img src="${currentImageUrl}" style="max-width:150px;max-height:150px;border-radius:8px;">`
    : "";

  $("uploadMsg").textContent = "";

  $("deleteProduct")
    .classList
    .toggle("hidden", !editing);

  $("modal").classList.remove("hidden");
}

window.edit = id => {
  open(data.products.find(p => p.id === id));
};

$("newBtn").onclick = () => open();

$("closeModal").onclick = () => {
  $("modal").classList.add("hidden");
};


/* =========================
   PREVISUALIZAÇÃO DA IMAGEM
========================= */

$("pImage").addEventListener("change", function () {

  const file = this.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Selecione uma imagem válida.");
    this.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("A imagem deve ter no máximo 5 MB.");
    this.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    $("imagePreview").innerHTML = `
      <img
        src="${e.target.result}"
        style="max-width:150px;max-height:150px;border-radius:8px;"
      >
    `;
  };

  reader.readAsDataURL(file);
});


/* =========================
   UPLOAD SUPABASE
========================= */

async function uploadImage(file) {

  if (!file) {
    return currentImageUrl;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("O arquivo selecionado não é uma imagem.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("A imagem deve ter no máximo 5 MB.");
  }

  const originalName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, "_");

  const fileName =
    Date.now() + "-" + originalName;

  const response = await fetch(
    SUPABASE_URL +
    "/storage/v1/object/" +
    SUPABASE_BUCKET +
    "/" +
    fileName,
    {
      method: "POST",

      headers: {
        "Authorization": "Bearer " + SUPABASE_KEY,
        "apikey": SUPABASE_KEY,
        "Content-Type": file.type
      },

      body: file
    }
  );

  if (!response.ok) {

    const errorText = await response.text();

    console.error("Supabase:", errorText);

    throw new Error(
      "Erro ao enviar a imagem para o Supabase."
    );
  }

  return (
    SUPABASE_URL +
    "/storage/v1/object/public/" +
    SUPABASE_BUCKET +
    "/" +
    fileName
  );
}


/* =========================
   SALVAR PRODUTO
========================= */

$("saveProduct").onclick = async function () {

  const button = $("saveProduct");

  try {

    const file = $("pImage").files[0];

    const name = $("pName").value.trim();

    if (!name) {
      alert("Informe o nome.");
      return;
    }

    button.disabled = true;
    button.textContent = "Salvando...";

    let imageUrl = currentImageUrl;

    if (file) {

      $("uploadMsg").textContent =
        "Enviando imagem...";

      imageUrl = await uploadImage(file);
    }

    const p = {
      id: editing || Date.now().toString(),

      name: name,

      price:
        Number($("pPrice").value) || 0,

      category:
        $("pCategory").value.trim(),

      image:
        imageUrl,

      description:
        $("pDescription").value.trim(),

      status:
        $("pStatus").value
    };

    if (editing) {

      data.products =
        data.products.map(x =>
          x.id === editing ? p : x
        );

    } else {

      data.products.push(p);
    }

    save();

    renderList();

    $("modal").classList.add("hidden");

  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "Ocorreu um erro ao salvar o produto."
    );

  } finally {

    button.disabled = false;
    button.textContent = "Salvar";

    $("uploadMsg").textContent = "";
  }
};


/* =========================
   EXCLUIR PRODUTO
========================= */

$("deleteProduct").onclick = function () {

  if (confirm("Excluir este produto?")) {

    data.products =
      data.products.filter(
        p => p.id !== editing
      );

    save();

    renderList();

    $("modal").classList.add("hidden");
  }
};


/* =========================
   LOGIN
========================= */

$("loginBtn").onclick = function () {

  if (
    $("password").value ===
    data.settings.password
  ) {

    $("login").classList.add("hidden");

    $("dashboard").classList.remove("hidden");

    loadSettings();

    renderList();

  } else {

    $("loginMsg").textContent =
      "Senha incorreta.";
  }
};


/* =========================
   CONFIGURAÇÕES
========================= */

function loadSettings() {

  $("sName").value =
    data.settings.name;

  $("sTitle").value =
    data.settings.title;

  $("sText").value =
    data.settings.text;

  $("sWhatsapp").value =
    data.settings.whatsapp;
}

$("saveSettings").onclick = function () {

  data.settings = {
    ...data.settings,

    name:
      $("sName").value,

    title:
      $("sTitle").value,

    text:
      $("sText").value,

    whatsapp:
      $("sWhatsapp").value,

    password:
      $("sPassword").value ||
      data.settings.password
  };

  save();

  $("saved").textContent =
    "Salvo com sucesso.";

  setTimeout(function () {
    $("saved").textContent = "";
  }, 2000);
};


/* =========================
   ABAS
========================= */

document
  .querySelectorAll("[data-tab]")
  .forEach(function (b) {

    b.onclick = function () {

      document
        .querySelectorAll(".tabs button")
        .forEach(function (x) {
          x.classList.remove("active");
        });

      b.classList.add("active");

      $("productsTab")
        .classList
        .toggle(
          "hidden",
          b.dataset.tab !== "products"
        );

      $("settingsTab")
        .classList
        .toggle(
          "hidden",
          b.dataset.tab !== "settings"
        );
    };
  });

document
  .querySelector('[data-tab="products"]')
  .classList
  .add("active");
```
