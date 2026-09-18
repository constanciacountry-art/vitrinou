const KEY = "vitrinouData";

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

function $(id) {
  return document.getElementById(id);
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function renderList() {
  const list = $("adminProducts");

  list.innerHTML = data.products.map(function(p) {
    return `
      <div class="admin-item">
        <img src="${p.image || "https://via.placeholder.com/100"}">
        <div class="grow">
          <b>${p.name}</b><br>
          ${Number(p.price).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
          })} · ${p.status}
        </div>
        <button onclick="editProduct('${p.id}')">Editar</button>
      </div>
    `;
  }).join("") || "<p>Nenhum produto cadastrado.</p>";
}

function openProduct(p) {
  $("modalTitle").textContent = p ? "Editar produto" : "Novo produto";

  $("pName").value = p ? p.name : "";
  $("pPrice").value = p ? p.price : "";
  $("pCategory").value = p ? p.category : "";
  $("pDescription").value = p ? p.description : "";
  $("pStatus").value = p ? p.status : "Disponível";

  $("deleteProduct").classList.toggle("hidden", !p);

  $("modal").classList.remove("hidden");
}

window.editProduct = function(id) {
  const product = data.products.find(function(p) {
    return p.id === id;
  });

  openProduct(product);
};

$("loginBtn").onclick = function() {

  const password = $("password").value;

  if (password === data.settings.password) {

    $("login").classList.add("hidden");
    $("dashboard").classList.remove("hidden");

    $("sName").value = data.settings.name;
    $("sTitle").value = data.settings.title;
    $("sText").value = data.settings.text;
    $("sWhatsapp").value = data.settings.whatsapp;

    renderList();

  } else {

    $("loginMsg").textContent = "Senha incorreta.";

  }

};

$("newBtn").onclick = function() {
  openProduct(null);
};

$("closeModal").onclick = function() {
  $("modal").classList.add("hidden");
};

$("saveProduct").onclick = function() {

  const product = {
    id: Date.now().toString(),
    name: $("pName").value.trim(),
    price: Number($("pPrice").value) || 0,
    category: $("pCategory").value.trim(),
    image: "",
    description: $("pDescription").value.trim(),
    status: $("pStatus").value
  };

  if (!product.name) {
    alert("Informe o nome.");
    return;
  }

  data.products.push(product);

  save();
  renderList();

  $("modal").classList.add("hidden");
};

$("deleteProduct").onclick = function() {

  alert("Função de exclusão será configurada depois.");

};

$("saveSettings").onclick = function() {

  data.settings.name = $("sName").value;
  data.settings.title = $("sTitle").value;
  data.settings.text = $("sText").value;
  data.settings.whatsapp = $("sWhatsapp").value;

  if ($("sPassword").value) {
    data.settings.password = $("sPassword").value;
  }

  save();

  $("saved").textContent = "Salvo com sucesso.";

  setTimeout(function() {
    $("saved").textContent = "";
  }, 2000);

};

document.querySelectorAll("[data-tab]").forEach(function(button) {

  button.onclick = function() {

    document.querySelectorAll(".tabs button").forEach(function(x) {
      x.classList.remove("active");
    });

    button.classList.add("active");

    $("productsTab").classList.toggle(
      "hidden",
      button.dataset.tab !== "products"
    );

    $("settingsTab").classList.toggle(
      "hidden",
      button.dataset.tab !== "settings"
    );

  };

});

document.querySelector('[data-tab="products"]').classList.add("active");
