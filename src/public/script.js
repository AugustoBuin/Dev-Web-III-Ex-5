const API = "/discos";
const $ = (id) => document.getElementById(id);
const tbody = document.querySelector("tbody");
const form = $("form");
const cancelarBtn = $("cancelar");
const precoInput = $("preco");
const anoInput = $("ano");

let editingId = null;

// --- Helpers de moeda (pt-BR) ---
const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function formatBRL(n) {
    if (n == null || isNaN(n)) return "R$ 0,00";
    return BRL.format(Number(n));
}

/** Converte string "R$ 1.234,56" ou "1234,56" para Number 1234.56 */
function parseBRL(str) {
    if (!str) return NaN;
    // remove tudo exceto dígitos e , .
    const only = String(str).replace(/[^\d,.-]/g, "").replace(/\s+/g, "");
    // se tiver vírgula e ponto, assume vírgula como decimal; remove os pontos de milhar
    const normalized = only.replace(/\./g, "").replace(",", ".");
    const num = Number(normalized);
    return num;
}

// Máscara leve: formata ao sair do campo; remove formatação ao focar
precoInput.addEventListener("focus", () => {
    // ao focar, converte para número simples (com vírgula) para facilitar edição
    const val = parseBRL(precoInput.value);
    precoInput.value = isNaN(val) ? "" : String(val).replace(".", ",");
});

precoInput.addEventListener("blur", () => {
    const val = parseBRL(precoInput.value);
    if (!isNaN(val)) {
        precoInput.value = formatBRL(val);
    } else {
        precoInput.value = "";
    }
});

// evita caracteres claramente inválidos
precoInput.addEventListener("keypress", (e) => {
    const ch = e.key.toLowerCase();
    if (ch === "e" || ch === "-") e.preventDefault();
});

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
      <td>${formatBRL(d.preco)}</td>
      <td class="actions">
        <button class="btn" onclick='edit(${JSON.stringify(d)})'>Editar</button>
        <button class="btn btn-danger" onclick='del("${d._id}")'>Excluir</button>
      </td>
    </tr>
  `).join("");
}

form.onsubmit = async (e) => {
    e.preventDefault();

    // Coleta e validação
    const ano = Number(anoInput.value);
    if (isNaN(ano) || ano < 0) {
        alert("Ano inválido. Use um número não-negativo.");
        anoInput.focus();
        return;
    }

    const preco = parseBRL(precoInput.value);
    if (isNaN(preco)) {
        alert("Preço inválido. Ex.: 12,50");
        precoInput.focus();
        return;
    }
    if (preco < 0) {
        alert("Preço não pode ser negativo.");
        precoInput.focus();
        return;
    }

    const body = {
        titulo: $("titulo").value.trim(),
        artista: $("artista").value.trim(),
        ano,
        genero: $("genero").value.trim(),
        formato: $("formato").value,
        preco: Number(preco.toFixed(2)) // garante duas casas
    };

    // Envia
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
    precoInput.value = formatBRL(d.preco); // mostra formatado
    cancelarBtn.style.display = "inline-block";
}

cancelarBtn.onclick = resetForm;

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
    cancelarBtn.style.display = "none";
    // restaura preço vazio formatado
    precoInput.value = "";
    // ano volta a 2000
    anoInput.value = "2000";
}

load();
