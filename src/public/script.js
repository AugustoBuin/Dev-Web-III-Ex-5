const API = "/discos";
const $ = (id) => document.getElementById(id);
const tbody = document.querySelector("tbody");
const form = $("form");
const cancelBtn = $("cancelar");

let editingId = null;

async function load() {
    const res = await fetch(API);
    const data = await res.json();
    tbody.innerHTML = data.map(d => `
    <tr>
      <td>${d.titulo}</td>
      <td>${d.artista}</td>
      <td>${d.ano}</td>
      <td>${d.genero}</td>
      <td>${d.formato}</td>
      <td>${Number(d.preco).toFixed(2)}</td>
      <td class="actions">
        <button onclick='edit(${JSON.stringify(d)})'>Editar</button>
        <button onclick='del("${d._id}")'>Excluir</button>
      </td>
    </tr>
  `).join("");
}

form.onsubmit = async (e) => {
    e.preventDefault();
    const body = {
        titulo: $("titulo").value.trim(),
        artista: $("artista").value.trim(),
        ano: Number($("ano").value),
        genero: $("genero").value.trim(),
        formato: $("formato").value,
        preco: Number($("preco").value)
    };
    if (editingId) {
        await fetch(`${API}/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
    } else {
        await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
    }
    resetForm();
    load();
};

function edit(d) {
    editingId = d._id;
    $("titulo").value = d.titulo;
    $("artista").value = d.artista;
    $("ano").value = d.ano;
    $("genero").value = d.genero;
    $("formato").value = d.formato;
    $("preco").value = d.preco;
    cancelBtn.style.display = "inline-block";
}

cancelBtn.onclick = resetForm;

async function del(id) {
    if (confirm("Tem certeza que deseja excluir?")) {
        await fetch(`${API}/${id}`, { method: "DELETE" });
        if (editingId === id) resetForm();
        load();
    }
}

function resetForm() {
    form.reset();
    editingId = null;
    cancelBtn.style.display = "none";
}

load();
